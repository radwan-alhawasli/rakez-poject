import { ref, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import salesService from '@/services/salesService';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ROLE_ADMIN, ROLE_SALES, ROLE_SALES_LEADER } from '@/constants/roles';
import { extractPaginatedData } from '@/utils/paginationUtils';
import { getApiErrorMessage } from '@/utils/errorHandler';
import { useToast } from '@/composables/useToast';
import { hasRole, isAdmin } from '@/utils/rbac';

/**
 * Sales: Unit search alerts (طلب وحدات)
 * - List (GET), detail (GET), create (POST), patch (PATCH), cancel (DELETE)
 * - Pagination: page + per_page only
 * - Status filter: active|paused|matched|cancelled
 */
export function useSalesSearchAlerts() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { user, hasPermission } = usePermissions();

  const hasAllowedRole = computed(() => {
    const u = user.value;
    if (!u) return false;
    if (isAdmin(u)) return true;
    return hasRole(u, [ROLE_ADMIN, ROLE_SALES, ROLE_SALES_LEADER]);
  });

  const canView = computed(
    () => hasAllowedRole.value && hasPermission(PERMISSIONS.SALES_SEARCH_ALERTS_VIEW)
  );

  const list = ref([]);
  const total = ref(0);
  const meta = reactive({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const filters = reactive({
    status: '',
    page: 1,
    per_page: 20,
  });

  const loadingList = ref(false);
  const listError = ref('');

  const selectedId = computed(() => {
    const id = route.params?.alertId;
    return id != null && String(id).trim() !== '' ? String(id) : '';
  });

  const loadingDetail = ref(false);
  const detailError = ref('');
  const detail = ref(null);

  function normalizeMeta(body) {
    const data = body?.data ?? body;
    const m = data?.meta ?? data?.pagination ?? data?.data?.meta ?? data?.data?.pagination ?? {};
    const current_page = Number(m.current_page ?? m.page ?? filters.page ?? 1) || 1;
    const per_page = Number(m.per_page ?? filters.per_page ?? 20) || 20;
    const totalCount = Number(m.total ?? m.total_count ?? total.value ?? 0) || 0;
    const last_page = Number(m.last_page ?? (per_page ? Math.ceil(totalCount / per_page) : 1)) || 1;
    meta.current_page = current_page;
    meta.per_page = per_page;
    meta.total = totalCount;
    meta.last_page = last_page;
  }

  async function fetchList() {
    if (!canView.value) return;
    loadingList.value = true;
    listError.value = '';
    try {
      const body = await salesService.listUnitSearchAlerts({
        page: filters.page,
        per_page: filters.per_page,
        status: filters.status || undefined,
      });

      const { items, total: t } = extractPaginatedData(body, []);
      list.value = Array.isArray(items) ? items : [];
      total.value = t || 0;
      normalizeMeta(body);
    } catch (e) {
      list.value = [];
      total.value = 0;
      listError.value = getApiErrorMessage(e, 'تعذر تحميل قائمة التنبيهات');
    } finally {
      loadingList.value = false;
    }
  }

  async function fetchDetail(id) {
    if (!canView.value) return;
    if (!id) return;
    loadingDetail.value = true;
    detailError.value = '';
    try {
      const data = await salesService.getUnitSearchAlert(id);
      detail.value = data || null;
    } catch (e) {
      detail.value = null;
      detailError.value = getApiErrorMessage(e, 'تعذر تحميل تفاصيل التنبيه');
    } finally {
      loadingDetail.value = false;
    }
  }

  function goToList() {
    router.push({ name: 'SalesUnitRequests' });
  }

  function goToDetail(id) {
    router.push({ name: 'SalesUnitRequestDetail', params: { alertId: String(id) } });
  }

  async function createAlert(payload) {
    const created = await salesService.createUnitSearchAlert(payload);
    toast.success('تم إنشاء طلب الوحدة');
    await fetchList();
    const newId = created?.id ?? created?.alert_id ?? created?.data?.id;
    if (newId != null) {
      goToDetail(newId);
    }
    return created;
  }

  async function patchAlert(alertId, patch) {
    const updated = await salesService.updateUnitSearchAlert(alertId, patch);
    toast.success('تم تحديث التنبيه');
    await fetchList();
    await fetchDetail(String(alertId));
    return updated;
  }

  async function cancelAlert(alertId) {
    try {
      await salesService.deleteUnitSearchAlert(alertId);
      toast.success('تم إلغاء تنبيه البحث');
      goToList();
      await fetchList();
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'تعذر إلغاء تنبيه البحث'));
      throw e;
    }
  }

  watch(
    () => [filters.status, filters.page, filters.per_page, canView.value],
    () => {
      fetchList();
    },
    { immediate: true }
  );

  watch(
    () => selectedId.value,
    id => {
      if (!id) {
        detail.value = null;
        detailError.value = '';
        return;
      }
      fetchDetail(id);
    },
    { immediate: true }
  );

  return {
    canView,

    filters,
    list,
    total,
    meta,
    loadingList,
    listError,

    selectedId,
    detail,
    loadingDetail,
    detailError,

    fetchList,
    fetchDetail,
    createAlert,
    patchAlert,
    cancelAlert,

    goToList,
    goToDetail,
  };
}
