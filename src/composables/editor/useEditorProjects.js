/**
 * Editor Projects: before montage (has_photography !== 1 or has_montage !== 1)
 * and after montage (both === 1). Uses GET /editor/contracts/index and show/:id.
 */

import { ref, computed, watch } from 'vue';
import editorService from '@/services/editorService';

export function useEditorProjects() {
  const contracts = ref([]);
  const isLoading = ref(true);
  const detail = ref(null);
  const detailLoading = ref(false);
  const montageData = ref(null);
  const montageLoading = ref(false);
  const teams = ref([]);
  const teamsLoading = ref(false);
  /** Map contractId -> true/false for manager: has montage links (from montage-department/show) */
  const montageHasLinksMap = ref({});

  // API: has_photography_data, has_montage_data (both === 1 → after montage). Support legacy has_photography/has_montage.
  const isAfterMontage = c =>
    (c.has_photography_data == 1 || c.has_photography == 1 || c.has_photography === true) &&
    (c.has_montage_data == 1 || c.has_montage == 1 || c.has_montage === true);

  const beforeMontage = computed(() =>
    contracts.value.filter(c => !isAfterMontage(c))
  );
  const afterMontage = computed(() =>
    contracts.value.filter(isAfterMontage)
  );

  async function fetchContracts() {
    isLoading.value = true;
    try {
      const list = await editorService.getContracts();
      contracts.value = Array.isArray(list) ? list : [];
    } catch (_) {
      contracts.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDetail(id) {
    if (!id) return;
    detailLoading.value = true;
    detail.value = null;
    try {
      const data = await editorService.getContractById(id);
      detail.value = data;
    } catch (_) {
      detail.value = {};
    } finally {
      detailLoading.value = false;
    }
  }

  async function fetchMontage(contractId) {
    if (!contractId) return;
    montageLoading.value = true;
    montageData.value = null;
    try {
      const data = await editorService.getMontage(contractId);
      montageData.value = data;
    } catch (_) {
      montageData.value = {};
    } finally {
      montageLoading.value = false;
    }
  }

  async function saveMontage(contractId, payload, isUpdate = false) {
    if (isUpdate) {
      await editorService.updateMontage(contractId, payload);
    } else {
      await editorService.createMontage(contractId, payload);
    }
    await fetchMontage(contractId);
    await fetchContracts();
    // If backend didn't set flags in list, optimistically mark so project appears in "after montage"
    const id = Number(contractId);
    const stillBefore = contracts.value.find(c => Number(c.id) === id && !isAfterMontage(c));
    if (stillBefore) {
      stillBefore.has_photography_data = 1;
      stillBefore.has_montage_data = 1;
    }
  }

  async function fetchTeams() {
    teamsLoading.value = true;
    try {
      const list = await editorService.getEditorTeams();
      teams.value = Array.isArray(list) ? list : [];
    } catch (_) {
      teams.value = [];
    } finally {
      teamsLoading.value = false;
    }
  }

  async function approveMontage(id, status, rejectionReason = '') {
    await editorService.approveMontage(id, {
      status: status === 'approved' ? 'approved' : 'rejected',
      rejection_reason: rejectionReason || undefined,
    });
    await fetchContracts();
    if (detail.value && Number(detail.value.id) === Number(id)) {
      await fetchDetail(id);
      await fetchMontage(id);
    }
    // Refresh has-links map for manager so buttons update
    const ids = contracts.value.filter(c => isAfterMontage(c)).map(c => c.id);
    if (ids.length) await fetchMontageLinksForProjects(ids);
  }

  /**
   * Fetch montage data for given contract ids and set montageHasLinksMap (for manager accept/reject).
   * Call when isManager and showing after-montage list.
   */
  async function fetchMontageLinksForProjects(contractIds) {
    const ids = Array.isArray(contractIds) ? contractIds : [];
    const map = { ...montageHasLinksMap.value };
    await Promise.all(
      ids.map(async id => {
        try {
          const data = await editorService.getMontage(id);
          const has =
            !!(data?.image_url && String(data.image_url).trim()) ||
            !!(data?.video_url && String(data.video_url).trim()) ||
            !!(data?.description && String(data.description).trim());
          map[id] = has;
        } catch (_) {
          map[id] = false;
        }
      })
    );
    montageHasLinksMap.value = map;
  }

  return {
    contracts,
    isLoading,
    beforeMontage,
    afterMontage,
    detail,
    detailLoading,
    montageData,
    montageLoading,
    teams,
    teamsLoading,
    fetchContracts,
    fetchDetail,
    fetchMontage,
    saveMontage,
    fetchTeams,
    approveMontage,
    montageHasLinksMap,
    fetchMontageLinksForProjects,
  };
}
