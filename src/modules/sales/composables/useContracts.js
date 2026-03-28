import { ref, computed, onMounted } from 'vue';
import contractService from '@/services/contractService';
import authService from '@/services/authService';
import logger from '@/utils/logger';
import { mapContract } from '../utils/contractMapper';

export function useContracts() {
  const contracts = ref([]);
  const totalCount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);
  const activeFilter = ref('all');
  const searchQuery = ref('');
  const currentPage = ref(1);
  const perPage = ref(25);

  const user = ref(authService.getCurrentUser());
  const userRole = computed(() => {
    const type = user.value?.type;
    if (type === 1 || type === 'admin' || user.value?.role === 'admin') return 1;
    if (type == 2 || type === 'project_management') return 2;
    return type ?? 0;
  });

  const mapStatusForApi = (filter) => ({
    pending: 'pending',
    approved: 'approved',
    archive: 'rejected'
  }[filter]);

  const fetchContracts = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const status = mapStatusForApi(activeFilter.value);
      const params = { page: currentPage.value, per_page: perPage.value, ...(status && { status }) };
      
      let res;
      if (userRole.value == 1) res = await contractService.getAllContracts(params);
      else if (userRole.value == 4) {
        const data = await contractService.getEditorContracts();
        res = { items: data || [], total: (data || []).length };
      } else res = await contractService.getContracts(params);

      contracts.value = (res.items || res.data || res || []).map(mapContract);
      totalCount.value = res.total || contracts.value.length;
    } catch (err) {
      logger.error('Fetch failed', err);
      error.value = 'فشل تحميل العقود';
      contracts.value = [];
    } finally { isLoading.value = false; }
  };

  const filteredContracts = computed(() => {
    const query = searchQuery.value?.trim().toLowerCase();
    if (!query) return contracts.value;
    return contracts.value.filter(c => 
      (c.number && c.number.toString().includes(query)) ||
      (c.developer && c.developer.toLowerCase().includes(query))
    );
  });

  const counts = computed(() => {
    const items = contracts.value;
    return {
      pending: items.filter(c => c.status === 'Pending').length,
      approved: items.filter(c => c.status === 'Approved').length,
      archive: items.filter(c => c.status === 'Refused').length,
      total: totalCount.value
    };
  });

  onMounted(fetchContracts);

  return {
    contracts, filteredContracts, totalCount, isLoading, error,
    activeFilter, searchQuery, currentPage, perPage, counts,
    fetchContracts, userRole
  };
}
