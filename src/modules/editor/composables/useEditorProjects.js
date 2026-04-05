/**
 * Editor Projects: before montage (has_photography !== 1 or has_montage !== 1)
 * and after montage (both === 1). Uses GET /editor/contracts/index and show/:id.
 */

import { ref, computed } from 'vue';
import editorService from '@/services/editorService';
import { buildContractPatchFromMontageShow } from '@/utils/montageApproval';

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
  // When backend does not set flags, treat as after montage if contract has image_url and description from API,
  // or if montage_department alone has any link/text (links-only path).
  const isAfterMontage = c => {
    const hasFlags =
      (c.has_photography_data == 1 || c.has_photography == 1 || c.has_photography === true) &&
      (c.has_montage_data == 1 || c.has_montage == 1 || c.has_montage === true);
    if (hasFlags) return true;
    const mont = c.montage_department;
    if (mont && typeof mont === 'object') {
      const mi = mont.image_url && String(mont.image_url).trim();
      const mv = mont.video_url && String(mont.video_url).trim();
      const md = mont.description && String(mont.description).trim();
      if (mi || mv || md) return true;
    }
    const hasImage = !!(c.image_url && String(c.image_url).trim());
    const hasDesc = !!(c.description && String(c.description).trim());
    return hasImage && hasDesc;
  };

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

  /**
   * Merge contract detail (from editor/contracts/show/:id) into the list so the card displays the same data.
   */
  function mergeContractDetail(contractId, data) {
    if (!contractId || !data || typeof data !== 'object') return;
    const list = [...contracts.value];
    const idx = list.findIndex(c => Number(c.id) === Number(contractId));
    if (idx === -1) return;
    const prev = list[idx];
    const next = { ...prev, ...data };
    const hadMontage =
      prev.has_montage_data == 1 ||
      prev.has_montage == 1 ||
      prev.has_montage === true;
    const hadPhoto =
      prev.has_photography_data == 1 ||
      prev.has_photography == 1 ||
      prev.has_photography === true;
    if (hadMontage && !('has_montage_data' in data) && !('has_montage' in data)) {
      next.has_montage_data = prev.has_montage_data;
      next.has_montage = prev.has_montage;
    }
    if (hadPhoto && !('has_photography_data' in data) && !('has_photography' in data)) {
      next.has_photography_data = prev.has_photography_data;
      next.has_photography = prev.has_photography;
    }
    list[idx] = next;
    contracts.value = list;
  }

  /** Merge montage-department/show into list row so status / approved / comment match API. */
  function mergeMontageShowIntoContract(contractId, showData) {
    if (!contractId || !showData || typeof showData !== 'object') return;
    if (!Object.keys(showData).length) return;
    const patch = buildContractPatchFromMontageShow(showData);
    if (!patch.montage_department || typeof patch.montage_department !== 'object') return;
    const list = [...contracts.value];
    const idx = list.findIndex(c => Number(c.id) === Number(contractId));
    if (idx === -1) return;
    const prev = list[idx].montage_department;
    list[idx] = {
      ...list[idx],
      ...patch,
      montage_department: {
        ...(typeof prev === 'object' && prev ? prev : {}),
        ...patch.montage_department,
      },
    };
    contracts.value = list;
  }

  /**
   * Preload detail for all contracts so cards show data when the page opens (without clicking "See More").
   * Fetches in parallel and merges each result into the list as it arrives.
   */
  async function preloadDetails() {
    const list = contracts.value;
    if (!list.length) return;
    await Promise.all(
      list.map(async (c) => {
        try {
          const data = await editorService.getContractById(c.id);
          mergeContractDetail(c.id, data);
        } catch (_) {
          // Ignore preloading error for individual items
        }
      })
    );
  }

  async function fetchDetail(id) {
    if (!id) return;
    detailLoading.value = true;
    detail.value = null;
    try {
      const data = await editorService.getContractById(id);
      detail.value = data;
      mergeContractDetail(id, data);
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
      mergeMontageShowIntoContract(contractId, data);
    } catch (_) {
      montageData.value = {};
    } finally {
      montageLoading.value = false;
    }
  }

  async function saveMontage(contractId, payload, isUpdate = false) {
    const save = async (update) =>
      update
        ? editorService.updateMontage(contractId, payload)
        : editorService.createMontage(contractId, payload);
    try {
      await save(isUpdate);
    } catch (e) {
      const msg = String(e?.message || '');
      if (
        !isUpdate &&
        (msg.includes('معلومات') || msg.includes('العقد') || msg.includes('الطرف الثاني'))
      ) {
        await editorService.updateMontage(contractId, payload);
      } else {
        throw e;
      }
    }
    await fetchMontage(contractId);
    mergeMontageShowIntoContract(contractId, montageData.value || {});
    // If backend didn't set flags in list, optimistically mark so project appears in "after montage"
    const id = Number(contractId);
    const list = [...contracts.value];
    const idx = list.findIndex(c => Number(c.id) === id);
    if (idx !== -1 && !isAfterMontage(list[idx])) {
      list[idx] = {
        ...list[idx],
        has_photography_data: 1,
        has_montage_data: 1,
        has_photography: 1,
        has_montage: 1,
      };
      contracts.value = list;
    }
    try {
      const fresh = await editorService.getContractById(contractId);
      mergeContractDetail(contractId, fresh || {});
    } catch (_) {
      /* keep optimistic row */
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
    const approved = status === 'approved' ? '1' : '0';
    const body = { approved };
    if (approved === '0') {
      body.comment = String(rejectionReason || '').trim() || '';
    }
    await editorService.approveMontage(id, body);
    const st = status === 'approved' ? 'approved' : 'rejected';
    const list = [...contracts.value];
    const idx = list.findIndex(c => Number(c.id) === Number(id));
    if (idx !== -1) {
      const prevMd = list[idx].montage_department;
      list[idx] = {
        ...list[idx],
        montage_status: st,
        approval_status: st,
        montage_approval_status: st,
        montage_department: {
          ...(typeof prevMd === 'object' && prevMd ? prevMd : {}),
          approved,
          ...(approved === '1'
            ? { comment: null, rejection_reason: null }
            : { comment: body.comment, rejection_reason: body.comment }),
        },
      };
      contracts.value = list;
    }
    await fetchContracts();
    const idxAfter = contracts.value.findIndex(c => Number(c.id) === Number(id));
    if (idxAfter !== -1) {
      const row = contracts.value[idxAfter];
      const hasFinal =
        row.montage_status || row.approval_status || row.montage_department?.status;
      if (!hasFinal) {
        const list2 = [...contracts.value];
        list2[idxAfter] = { ...row, montage_status: st, approval_status: st, montage_approval_status: st };
        contracts.value = list2;
      }
    }
    if (detail.value && Number(detail.value.id) === Number(id)) {
      await fetchDetail(id);
      await fetchMontage(id);
    }
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
          mergeMontageShowIntoContract(id, data);
          const has =
            !!(data?.image_url && String(data.image_url).trim()) ||
            !!(data?.video_url && String(data.video_url).trim()) ||
            !!(data?.description && String(data.description).trim());
          map[id] = has;
        } catch (_) {
          map[id] = false; // Default to false if fetch fails
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
    mergeContractDetail,
    preloadDetails,
  };
}
