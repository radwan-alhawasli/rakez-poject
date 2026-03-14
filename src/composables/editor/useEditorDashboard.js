/**
 * Editor dashboard: same layout as Project Management.
 * Data from GET /editor/contracts/index; filter by has_photography / has_montage.
 */

import { ref, computed } from 'vue';
import editorService from '@/services/editorService';

export function useEditorDashboard() {
  const searchQuery = ref('');
  const isLoading = ref(true);
  const allContracts = ref([]);

  // Backend may return 1, "1", or true; treat all as "complete"
  const isAfterMontage = c =>
    (c.has_photography == 1 || c.has_photography === true) &&
    (c.has_montage == 1 || c.has_montage === true);

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
    filteredProjects,
    fetchContracts,
  };
}
