/**
 * Editor Projects: before montage (has_photography !== 1 or has_montage !== 1)
 * and after montage (both === 1). Uses GET /editor/contracts/index and show/:id.
 */

import { ref, computed } from 'vue';
import editorService from '@/services/editorService';
import { buildContractPatchFromMontageShow } from '@/utils/montageApproval';
import {
  contractHasCompleteMontageTriplet,
  isAfterMontageListProject,
  isMontageManagerRejected,
  pickTrim,
} from '@/utils/editorMontageCard';

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
  /** يمنع تداخل طلبات متوازية لنفس الدفعة (يحدّث عند كل استدعاء جديد) */
  let montageLinksFetchGeneration = 0;

  /**
   * بعد نجاح حفظ/تحديث روابط المونتاج: يُعرض المشروع في «بعد المونتاج» فوراً حتى لو
   * لم يتطابق شكل الاستجابة مع contractHasCompleteMontageTriplet (تعقيم روابط، إلخ).
   */
  const optimisticAfterMontageIds = ref(/** @type {Set<number>} */ (new Set()));

  function addOptimisticAfterMontage(contractId) {
    const n = Number(contractId);
    if (Number.isNaN(n)) return;
    const s = new Set(optimisticAfterMontageIds.value);
    s.add(n);
    optimisticAfterMontageIds.value = s;
  }

  function removeOptimisticAfterMontage(contractId) {
    const n = Number(contractId);
    const s = new Set(optimisticAfterMontageIds.value);
    s.delete(n);
    optimisticAfterMontageIds.value = s;
  }

  function pruneOptimisticAfterMontageIds() {
    const s = new Set(optimisticAfterMontageIds.value);
    for (const id of s) {
      const row = contracts.value.find(c => Number(c.id) === id);
      if (row && isAfterMontageListProject(row)) s.delete(id);
    }
    optimisticAfterMontageIds.value = s;
  }

  /** بعد المونتاج: ثلاثي مكتمل أو حفظ ناجح حديثاً، وليس مرفوضاً من المدير. */
  function isAfterMontageRow(p) {
    if (!p || typeof p !== 'object') return false;
    if (isMontageManagerRejected(p)) return false;
    if (optimisticAfterMontageIds.value.has(Number(p.id))) return true;
    return isAfterMontageListProject(p);
  }

  const isAfterMontage = isAfterMontageRow;

  const beforeMontage = computed(() =>
    contracts.value.filter(c => !isAfterMontage(c))
  );
  const afterMontage = computed(() =>
    contracts.value.filter(isAfterMontage)
  );

  /**
   * @param {{ silent?: boolean }} [options] — silent: لا تعطل الواجهة بشاشة التحميل (بعد إجراءات المستخدم)
   */
  async function fetchContracts(options = {}) {
    const silent = options.silent === true;
    if (!silent) isLoading.value = true;
    try {
      const list = await editorService.getContracts();
      contracts.value = Array.isArray(list) ? list : [];
      pruneOptimisticAfterMontageIds();
    } catch (_) {
      contracts.value = [];
    } finally {
      if (!silent) isLoading.value = false;
    }
  }

  /** دمج تفاصيل العقد + المونتاج لصف واحد (بعد أن يستبدل الفهرس الصفوف دون حقول متداخلة) */
  async function refreshContractRow(contractId) {
    if (!contractId) return;
    try {
      const [showRes, montRes] = await Promise.allSettled([
        editorService.getContractById(contractId),
        editorService.getMontage(contractId),
      ]);
      if (showRes.status === 'fulfilled' && showRes.value && typeof showRes.value === 'object') {
        mergeContractDetail(contractId, showRes.value);
        if (detail.value && Number(detail.value.id) === Number(contractId)) {
          detail.value = showRes.value;
        }
      }
      if (
        montRes.status === 'fulfilled' &&
        montRes.value &&
        typeof montRes.value === 'object' &&
        Object.keys(montRes.value).length
      ) {
        mergeMontageShowIntoContract(contractId, montRes.value);
        if (detail.value && Number(detail.value.id) === Number(contractId)) {
          montageData.value = montRes.value;
        }
      }
    } catch (_) {
      /* skip */
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
    const prevMd = prev.montage_department;
    const dataMd = data.montage_department;
    if (
      (prevMd && typeof prevMd === 'object') ||
      (dataMd !== null && dataMd !== undefined && typeof dataMd === 'object')
    ) {
      next.montage_department = {
        ...(typeof prevMd === 'object' && prevMd ? prevMd : {}),
        ...(dataMd !== null && dataMd !== undefined && typeof dataMd === 'object' ? dataMd : {}),
      };
    }
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

  /** يوحّد أشكال استجابة الباكند (data، montage بدل montage_department، إلخ). */
  function normalizeMontageShowResponse(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    const out = { ...raw };
    const d = raw.data;
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      Object.assign(out, d);
    }
    const montAlt = raw.montage ?? (d && typeof d === 'object' ? d.montage : undefined);
    if (montAlt && typeof montAlt === 'object') {
      const prev = out.montage_department;
      out.montage_department = {
        ...(typeof prev === 'object' && prev ? prev : {}),
        ...montAlt,
      };
    }
    if (d && typeof d === 'object' && d.montage_department && typeof d.montage_department === 'object') {
      out.montage_department = {
        ...(typeof out.montage_department === 'object' ? out.montage_department : {}),
        ...d.montage_department,
      };
    }
    return out;
  }

  /** Merge montage-department/show into list row so status / approved / comment match API. */
  function mergeMontageShowIntoContract(contractId, showData) {
    if (!contractId || !showData || typeof showData !== 'object') return;
    const normalized = normalizeMontageShowResponse(showData);
    if (!Object.keys(normalized).length) return;
    const patch = buildContractPatchFromMontageShow(normalized);
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
   * يضمن ظهور المشروع في «بعد المونتاج» حتى لو كان GET show يعيد {} أو شكلاً لا يُدمج.
   */
  function mergeMontagePayloadIntoContract(contractId, payload) {
    if (!contractId || !payload || typeof payload !== 'object') return;
    const image_url = pickTrim(payload.image_url);
    const video_url = pickTrim(payload.video_url);
    const description = pickTrim(payload.description);
    if (!image_url || !video_url || !description) return;
    const list = [...contracts.value];
    const idx = list.findIndex(c => Number(c.id) === Number(contractId));
    if (idx === -1) return;
    const prev = list[idx].montage_department;
    list[idx] = {
      ...list[idx],
      has_montage_data: 1,
      has_montage: 1,
      montage_status: 'pending',
      approval_status: 'pending',
      montage_approval_status: 'pending',
      montage_department: {
        ...(typeof prev === 'object' && prev ? prev : {}),
        image_url,
        video_url,
        description,
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
    const concurrency = Math.min(6, list.length);
    let cursor = 0;
    async function worker() {
      while (true) {
        const i = cursor++;
        if (i >= list.length) break;
        const c = list[i];
        try {
          const [showRes, montRes] = await Promise.allSettled([
            editorService.getContractById(c.id),
            editorService.getMontage(c.id),
          ]);
          if (showRes.status === 'fulfilled' && showRes.value && typeof showRes.value === 'object') {
            mergeContractDetail(c.id, showRes.value);
          }
          if (
            montRes.status === 'fulfilled' &&
            montRes.value &&
            typeof montRes.value === 'object' &&
            Object.keys(montRes.value).length
          ) {
            mergeMontageShowIntoContract(c.id, montRes.value);
          }
        } catch (_) {
          /* skip */
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
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
    mergeMontagePayloadIntoContract(contractId, payload);
    try {
      const fresh = await editorService.getContractById(contractId);
      mergeContractDetail(contractId, fresh || {});
      if (detail.value && Number(detail.value.id) === Number(contractId)) {
        detail.value = fresh || detail.value;
      }
    } catch (_) {
      /* keep optimistic row */
    }
    mergeMontagePayloadIntoContract(contractId, payload);
    mergeMontageShowIntoContract(contractId, montageData.value || {});
    const pu = pickTrim(payload.image_url);
    const pv = pickTrim(payload.video_url);
    const pd = pickTrim(payload.description);
    if (pu && pv && pd) {
      addOptimisticAfterMontage(contractId);
      pruneOptimisticAfterMontageIds();
    }
    await fetchContracts({ silent: true });
    await refreshContractRow(contractId);
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
    if (status === 'rejected') removeOptimisticAfterMontage(id);
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
    await fetchContracts({ silent: true });
    await preloadDetails();
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
      await refreshContractRow(id);
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
    if (!ids.length) return;
    const generation = ++montageLinksFetchGeneration;
    const map = { ...montageHasLinksMap.value };
    await Promise.all(
      ids.map(async id => {
        if (generation !== montageLinksFetchGeneration) return;
        try {
          const data = await editorService.getMontage(id);
          if (generation !== montageLinksFetchGeneration) return;
          mergeMontageShowIntoContract(id, data);
          const row = contracts.value.find(c => Number(c.id) === Number(id));
          map[id] = row ? contractHasCompleteMontageTriplet(row) : false;
        } catch (_) {
          map[id] = false;
        }
      })
    );
    if (generation !== montageLinksFetchGeneration) return;
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
    mergeMontageShowIntoContract,
    preloadDetails,
    refreshContractRow,
  };
}
