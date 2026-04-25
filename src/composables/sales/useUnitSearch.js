import { ref, reactive, computed, watch } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import { debounce } from '@/lib/utils';
import logger from '@/utils/logger';

const API_MAX_PER_PAGE = 100;
const CLIENT_PAGE_SIZE = 50;

export function useUnitSearch() {
  const { formatCurrency } = useFormatters();

  const allUnits = ref([]);
  const isLoading = ref(false);
  const isLoadingFilters = ref(false);
  const filtersLoaded = ref(false);
  const loadingProgress = ref('');

  const clientPage = ref(1);

  const filters = reactive({
    city: '',
    district: '',
    min_area: '',
    max_area: '',
    min_bedrooms: '',
    max_bedrooms: '',
    status: '',
    min_price: '',
    max_price: '',
    unit_type: '',
    q: '',
    sort_by: 'created_at',
    sort_dir: 'desc',
  });

  const availableFilters = reactive({
    cities: [],
    districts: {},
    unit_types: [],
    bedrooms_range: { min: 0, max: 10 },
    area_range: { min: 0, max: 1000 },
    price_range: { min: 0, max: 10000000 },
    statuses: ['available', 'reserved', 'sold'],
  });

  const filteredDistricts = computed(() => {
    if (!filters.city) return [];
    return availableFilters.districts[filters.city] ?? [];
  });

  const hasActiveFilters = computed(() =>
    !!(filters.city || filters.district || filters.min_area || filters.max_area ||
       filters.min_bedrooms || filters.max_bedrooms || filters.status ||
       filters.min_price || filters.max_price || filters.unit_type || filters.q)
  );

  const totalUnits = computed(() => allUnits.value.length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalUnits.value / CLIENT_PAGE_SIZE)));

  const units = computed(() => {
    const start = (clientPage.value - 1) * CLIENT_PAGE_SIZE;
    return allUnits.value.slice(start, start + CLIENT_PAGE_SIZE);
  });

  const meta = computed(() => ({
    current_page: clientPage.value,
    last_page: totalPages.value,
    per_page: CLIENT_PAGE_SIZE,
    total: totalUnits.value,
  }));

  watch(() => filters.city, () => {
    filters.district = '';
  });

  const buildFilterParams = () => {
    const params = {};
    if (filters.city) params.city = filters.city;
    if (filters.district) params.district = filters.district;
    if (filters.min_area) params.min_area = Number(filters.min_area);
    if (filters.max_area) params.max_area = Number(filters.max_area);
    if (filters.min_bedrooms) params.min_bedrooms = Number(filters.min_bedrooms);
    if (filters.max_bedrooms) params.max_bedrooms = Number(filters.max_bedrooms);
    if (filters.status) params.status = filters.status;
    if (filters.min_price) params.min_price = Number(filters.min_price);
    if (filters.max_price) params.max_price = Number(filters.max_price);
    if (filters.unit_type) params.unit_type = filters.unit_type;
    if (filters.q) params.q = filters.q;
    params.sort_by = filters.sort_by;
    params.sort_dir = filters.sort_dir;
    return params;
  };

  const searchUnits = async () => {
    isLoading.value = true;
    loadingProgress.value = 'جاري تحميل الوحدات...';
    try {
      const baseParams = { ...buildFilterParams(), per_page: API_MAX_PER_PAGE, page: 1 };

      // Use cache for the first page to make repeated searches instant
      const firstResult = await salesService.searchUnits({ ...baseParams, useCache: true });
      let collected = [...firstResult.items];
      const lastPage = firstResult.meta?.last_page ?? 1;
      const serverTotal = firstResult.meta?.total ?? collected.length;

      if (lastPage > 1) {
        loadingProgress.value = `تم تحميل ${collected.length} من ${serverTotal} وحدة...`;

        const BATCH_SIZE = 5;
        for (let batchStart = 2; batchStart <= lastPage; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, lastPage);
          const promises = [];
          for (let p = batchStart; p <= batchEnd; p++) {
            promises.push(salesService.searchUnits({ ...baseParams, page: p }));
          }
          const results = await Promise.all(promises);
          for (const r of results) {
            collected = collected.concat(r.items);
          }
          loadingProgress.value = `تم تحميل ${collected.length} من ${serverTotal} وحدة...`;
        }
      }

      allUnits.value = collected;
      clientPage.value = 1;
    } catch (error) {
      logger.error('Error searching units:', error);
      allUnits.value = [];
    } finally {
      isLoading.value = false;
      loadingProgress.value = '';
    }
  };

  const loadFilters = async () => {
    if (filtersLoaded.value) return;
    isLoadingFilters.value = true;
    try {
      const data = await salesService.getUnitSearchFilters();
      if (data.cities) availableFilters.cities = data.cities;
      if (data.districts) availableFilters.districts = data.districts;
      if (data.unit_types) availableFilters.unit_types = data.unit_types;
      if (data.bedrooms_range) availableFilters.bedrooms_range = data.bedrooms_range;
      if (data.area_range) availableFilters.area_range = data.area_range;
      if (data.price_range) availableFilters.price_range = data.price_range;
      if (data.statuses) availableFilters.statuses = data.statuses;
      filtersLoaded.value = true;
    } catch (error) {
      logger.error('Error loading unit filters:', error);
    } finally {
      isLoadingFilters.value = false;
    }
  };

  const applyFilters = () => {
    clientPage.value = 1;
    searchUnits();
  };

  const debouncedSearch = debounce(() => {
    applyFilters();
  }, 400);

  // Watch for filter changes to trigger search automatically
  watch(
    () => [
      filters.q,
      filters.city,
      filters.district,
      filters.status,
      filters.unit_type,
      filters.min_area,
      filters.max_area,
      filters.min_price,
      filters.max_price,
    ],
    () => {
      debouncedSearch();
    }
  );

  const resetFilters = () => {
    filters.city = '';
    filters.district = '';
    filters.min_area = '';
    filters.max_area = '';
    filters.min_bedrooms = '';
    filters.max_bedrooms = '';
    filters.status = '';
    filters.min_price = '';
    filters.max_price = '';
    filters.unit_type = '';
    filters.q = '';
    filters.sort_by = 'created_at';
    filters.sort_dir = 'desc';
    clientPage.value = 1;
    searchUnits();
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    clientPage.value = page;
  };

  const init = async () => {
    await loadFilters();
    await searchUnits();
  };

  const statusLabel = (status) => {
    const map = { available: 'متاحة', reserved: 'محجوزة', sold: 'مباعة', pending: 'قيد الانتظار' };
    return map[status] ?? status ?? '—';
  };

  const statusClass = (status) => {
    const map = { available: 'unit-available', reserved: 'unit-reserved', sold: 'unit-sold', pending: 'unit-pending' };
    return map[status] ?? '';
  };

  return {
    units,
    allUnits,
    isLoading,
    isLoadingFilters,
    loadingProgress,
    filters,
    availableFilters,
    filteredDistricts,
    hasActiveFilters,
    meta,
    totalPages,
    totalUnits,
    searchUnits,
    loadFilters,
    applyFilters,
    resetFilters,
    goToPage,
    init,
    formatCurrency,
    statusLabel,
    statusClass,
  };
}
