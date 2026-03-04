import { ref } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

export function useAccountingNotifications() {
  const isLoading = ref(false);
  const notifications = ref([]);
  const notificationTypeFilter = ref('');
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showNotificationModal = ref(false);
  const selectedNotification = ref(null);
  const isSavingNotification = ref(false);

  const loadNotifications = async () => {
    isLoading.value = true;
    try {
      const params = { page: currentPage.value, per_page: perPage.value };
      if (notificationTypeFilter.value) params.type = notificationTypeFilter.value;
      const data = await accountingService.getNotifications(params);
      notifications.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? notifications.value.length;
    } catch (error) {
      logger.error('Error loading notifications:', error);
      notifications.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (id) => {
    try {
      await accountingService.markNotificationAsRead(id);
      loadNotifications();
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الإشعار');
    }
  };

  const markAllAsRead = async () => {
    try {
      await accountingService.markAllNotificationsAsRead();
      loadNotifications();
      toast.success('تم تعيين جميع الإشعارات كمقروءة');
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  const viewNotificationDetail = (notification) => {
    selectedNotification.value = notification;
    showNotificationModal.value = true;
  };

  const handleNotificationModalMarkRead = async () => {
    if (!selectedNotification.value?.id) return;
    isSavingNotification.value = true;
    try {
      await accountingService.markNotificationAsRead(selectedNotification.value.id);
      selectedNotification.value = { ...selectedNotification.value, read: true };
      loadNotifications();
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الإشعار');
    } finally {
      isSavingNotification.value = false;
    }
  };

  const handlePageChange = (page) => {
    currentPage.value = page;
    loadNotifications();
  };

  const handlePerPageChange = (val) => {
    perPage.value = val;
    currentPage.value = 1;
    loadNotifications();
  };

  const NOTIFICATION_TYPE_LABELS = {
    unit_reserved: 'تم حجز وحدة',
    deposit_received: 'تم استلام عربون',
    unit_vacated: 'تم إفراغ الوحدة',
    reservation_cancelled: 'تم إلغاء الحجز',
    commission_confirmed: 'تم تأكيد عمولة',
    commission_received: 'تم استلام عمولة من المالك',
  };
  const getNotificationTypeLabel = (type) => (!type ? 'عام' : NOTIFICATION_TYPE_LABELS[type] || type);

  const { formatDate: _fmtDate } = useFormatters();
  const formatDate = (dateStr) => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));

  return {
    isLoading,
    notifications,
    notificationTypeFilter,
    currentPage,
    perPage,
    totalItems,
    showNotificationModal,
    selectedNotification,
    isSavingNotification,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    viewNotificationDetail,
    handleNotificationModalMarkRead,
    handlePageChange,
    handlePerPageChange,
    getNotificationTypeLabel,
    formatDate,
  };
}
