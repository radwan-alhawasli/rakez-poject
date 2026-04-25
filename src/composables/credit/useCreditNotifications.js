import { ref } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useCreditNotifications() {
  const isLoading = ref(false);
  /** @type {import('vue').Ref<any[]>} */
  const creditNotifications = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const showNotificationModal = ref(false);
  /** @type {import('vue').Ref<any>} */
  const selectedNotification = ref(null);
  const isSavingNotification = ref(false);

  const { formatDate: _fmtDate } = useFormatters();
  /** @param {any} dateStr */
  const formatDate = dateStr => (!dateStr ? 'غير محدد' : _fmtDate(dateStr));

  const loadCreditNotifications = async () => {
    isLoading.value = true;
    try {
      const data = await creditService.getNotifications({
        per_page: perPage.value,
        page: currentPage.value,
      });
      creditNotifications.value = data?.items ?? (Array.isArray(data) ? data : []);
      totalItems.value = data?.total ?? creditNotifications.value.length;
    } catch {
      creditNotifications.value = [];
      totalItems.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  /** @param {any} notificationId */
  const markCreditNotificationRead = async notificationId => {
    try {
      await creditService.markNotificationRead(notificationId);
      const n = creditNotifications.value.find((/** @type {any} */ x) => x.id === notificationId);
      if (n) n.read = true;
    } catch (e) {
      logger.error('Error marking notification read:', e);
    }
  };

  const markAllCreditNotificationsRead = async () => {
    try {
      await creditService.markAllNotificationsRead();
      creditNotifications.value.forEach((/** @type {any} */ n) => { n.read = true; });
    } catch (e) {
      logger.error('Error marking all notifications read:', e);
    }
  };

  /** @param {any} page */
  const handlePageChange = page => {
    currentPage.value = page;
    loadCreditNotifications();
  };

  /** @param {any} val */
  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadCreditNotifications();
  };

  /** @param {any} notification */
  const viewNotificationDetail = notification => {
    selectedNotification.value = notification;
    showNotificationModal.value = true;
  };

  const handleNotificationModalMarkRead = async () => {
    if (!selectedNotification.value?.id) return;
    isSavingNotification.value = true;
    try {
      await creditService.markNotificationRead(selectedNotification.value.id);
      selectedNotification.value = { ...selectedNotification.value, read: true };
      const n = creditNotifications.value.find((/** @type {any} */ x) => x.id === (/** @type {any} */ (selectedNotification.value)).id);
      if (n) n.read = true;
    } catch (e) {
      logger.error('Error marking notification read:', e);
    } finally {
      isSavingNotification.value = false;
    }
  };

  /** @param {any} type */
  const getNotificationTypeLabel = type =>
    (type && typeof type === 'string' ? type : 'عام');

  return {
    isLoading,
    creditNotifications,
    currentPage,
    perPage,
    totalItems,
    showNotificationModal,
    selectedNotification,
    isSavingNotification,
    formatDate,
    loadCreditNotifications,
    markCreditNotificationRead,
    markAllCreditNotificationsRead,
    handlePageChange,
    handlePerPageChange,
    viewNotificationDetail,
    handleNotificationModalMarkRead,
    getNotificationTypeLabel,
  };
}
