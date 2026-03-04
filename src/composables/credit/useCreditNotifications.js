import { ref } from 'vue';
import creditService from '@/services/creditService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';

export function useCreditNotifications() {
  const isLoading = ref(false);
  const creditNotifications = ref([]);
  const currentPage = ref(1);
  const perPage = ref(25);
  const totalItems = ref(0);

  const { formatDate: _fmtDate } = useFormatters();
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

  const markCreditNotificationRead = async notificationId => {
    try {
      await creditService.markNotificationRead(notificationId);
      const n = creditNotifications.value.find(x => x.id === notificationId);
      if (n) n.read = true;
    } catch (e) {
      logger.error('Error marking notification read:', e);
    }
  };

  const markAllCreditNotificationsRead = async () => {
    try {
      await creditService.markAllNotificationsRead();
      creditNotifications.value.forEach(n => { n.read = true; });
    } catch (e) {
      logger.error('Error marking all notifications read:', e);
    }
  };

  const handlePageChange = page => {
    currentPage.value = page;
    loadCreditNotifications();
  };

  const handlePerPageChange = val => {
    perPage.value = val;
    currentPage.value = 1;
    loadCreditNotifications();
  };

  return {
    isLoading,
    creditNotifications,
    currentPage,
    perPage,
    totalItems,
    formatDate,
    loadCreditNotifications,
    markCreditNotificationRead,
    markAllCreditNotificationsRead,
    handlePageChange,
    handlePerPageChange,
  };
}
