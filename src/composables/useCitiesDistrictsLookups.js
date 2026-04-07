import { ref } from 'vue';
import locationService from '@/services/locationService';

/**
 * تحميل مدن وأحياء من الـ API لاستخدامها في نماذج العقود.
 */
export function useCitiesDistrictsLookups() {
  const cities = ref([]);
  const districts = ref([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      const [c, d] = await Promise.all([locationService.getCities(), locationService.getDistricts()]);
      cities.value = Array.isArray(c) ? c : [];
      districts.value = Array.isArray(d) ? d : [];
    } finally {
      loading.value = false;
    }
  }

  /** أحياء المدينة المختارة فقط */
  function districtsForCityId(cityId) {
    if (cityId == null || cityId === '') return [];
    return districts.value.filter(d => String(d.city_id) === String(cityId));
  }

  return {
    cities,
    districts,
    loading,
    load,
    districtsForCityId,
  };
}
