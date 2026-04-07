/**
 * Editor dashboard: KPIs قبل/بعد المونتاج.
 * نفس منطق useEditorProjects: أعلام الباكند أو ثلاثي صورة+فيديو+وصف (contractHasCompleteMontageTriplet).
 */

import { ref, computed } from 'vue';
import editorService from '@/services/editorService';
import { contractHasCompleteMontageTriplet } from '@/utils/editorMontageCard';

export function useEditorDashboard() {
  const searchQuery = ref('');
  const isLoading = ref(true);
  const allContracts = ref([]);

  const isAfterMontage = c => {
    const hasFlags =
      (c.has_photography_data == 1 || c.has_photography == 1 || c.has_photography === true) &&
      (c.has_montage_data == 1 || c.has_montage == 1 || c.has_montage === true);
    if (hasFlags) return true;
    return contractHasCompleteMontageTriplet(c);
  };

  const notReady = computed(() =>
    allContracts.value.filter(c => !isAfterMontage(c))
  );
  const ready = computed(() =>
    allContracts.value.filter(isAfterMontage)
  );
  const archive = computed(() => []); // API may add later

  const notReadyCount = computed(() => notReady.value.length);
  const readyCount = computed(() => ready.value.length);
  const archiveCount = computed(() => archive.value.length);
  const allProjectsCount = computed(() => allContracts.value.length);
  /** Sum of available units across contracts (from units_count or units.length) */
  const availableUnits = computed(() => {
    return allContracts.value.reduce((sum, c) => {
      const n = c.units_count ?? c.unitsCount ?? (Array.isArray(c.units) ? c.units.length : 0);
      return sum + (Number(n) || 0);
    }, 0);
  });

  const activeTab = ref('not_ready');

  const filteredProjects = computed(() => {
    let list;
    if (activeTab.value === 'not_ready') list = notReady.value;
    else if (activeTab.value === 'ready') list = ready.value;
    else if (activeTab.value === 'archive') list = archive.value;
    else list = allContracts.value;
    const q = (searchQuery.value || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.project_name || '').toLowerCase().includes(q) ||
        (c.contract_number || '').toLowerCase().includes(q)
    );
  });

  async function fetchContracts() {
    isLoading.value = true;
    try {
      const list = await editorService.getContracts();
      allContracts.value = Array.isArray(list) ? list : [];
    } catch (_) {
      allContracts.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    searchQuery,
    isLoading,
    activeTab,
    notReadyCount,
    readyCount,
    archiveCount,
    allProjectsCount,
    availableUnits,
    filteredProjects,
    fetchContracts,
  };
}
