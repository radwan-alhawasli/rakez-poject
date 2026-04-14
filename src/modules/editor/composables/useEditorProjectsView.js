import { ref, computed, watch, onMounted } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useEditorProjects } from '@/modules/editor/composables/useEditorProjects';
import editorService from '@/services/editorService';
import { toast } from '@/composables/useToast';
import { isMontageDecisionFinal } from '@/utils/montageApproval';
import { localeOpts } from '@/utils/intlLatn';
import { getPhotographyApprovalSummary, pickTrim } from '@/utils/editorMontageCard';

export function useEditorProjectsView() {
  const route = useRoute();
  const router = useRouter();
  const user = authService.getCurrentUser();
  const isManager = computed(() => user?.is_manager === true || user?.is_manager === 1);

  const {
    isLoading,
    beforeMontage,
    afterMontage,
    detail,
    detailLoading,
    montageData,
    fetchContracts,
    fetchDetail,
    fetchMontage,
    saveMontage,
    approveMontage,
    montageHasLinksMap,
    fetchMontageLinksForProjects,
    mergeContractDetail,
    mergeMontageShowIntoContract,
    preloadDetails,
  } = useEditorProjects();

  const activeTab = ref('before');
  const selectedProject = ref(null);

  /** صف «قبول الوسائط»: مشاريع بعد المونتاج وبانتظار اعتماد المدير فقط */
  const isPendingQueueOnly = computed(() => route.query.filter === 'pending');
  const montageForm = ref({ image_url: '', video_url: '', description: '' });
  const montageSaving = ref(false);
  const rejectTargetId = ref(null);
  const rejectReason = ref('');

  const seeMoreProject = ref(null);
  const seeMoreDetail = ref(null);
  const seeMoreMontage = ref(null);
  const seeMoreLoading = ref(false);
  const seeMoreExpanded = ref({
    advertiser: false,
    photography: false,
    video: false,
    description: false,
    units: false,
  });

  function isMontageApiRejected(m) {
    if (!m || typeof m !== 'object') return false;
    if (m.approved === '0' || m.approved === 0 || m.approved === false) return true;
    const st = String(m.status ?? '').toLowerCase();
    if (st === 'rejected' || st.includes('مرفوض') || st.includes('رفض')) return true;
    if (st.includes('reject') || st.includes('refus')) return true;
    return false;
  }

  const montageRejectionNote = computed(() => {
    const m = montageData.value || {};
    if (!isMontageApiRejected(m)) return '';
    const t = m.rejection_reason ?? m.comment;
    return t && String(t).trim() ? String(t).trim() : '';
  });

  const seeMoreMontageRejection = computed(() => {
    const m = seeMoreMontage.value || {};
    if (!isMontageApiRejected(m)) return '';
    const t = m.rejection_reason ?? m.comment;
    return t && String(t).trim() ? String(t).trim() : '';
  });

  const seeMoreMontageStatusLine = computed(() => {
    const m = seeMoreMontage.value || {};
    if (m.approved === '1' || m.approved === 1) return 'معتمد';
    if (m.approved === '0' || m.approved === 0) return 'مرفوض';
    const st = m.status != null ? String(m.status) : '';
    if (st.includes('معتمد')) return 'معتمد';
    if (st.includes('مرفوض') || st.includes('رفض')) return 'مرفوض';
    return st || '';
  });

  function contractDisplayFromApi(contract) {
    if (!contract || typeof contract !== 'object') return null;
    const second = contract.second_party_data || {};
    const photo = contract.photography_department || {};
    const mont = contract.montage_department || {};
    const units = contract.contract_units ?? contract.units ?? [];
    const unitsArray = Array.isArray(units) ? units : [];
    return {
      advertiser_number:
        second.advertiser_number ??
        second.publisher_number ??
        second.advertiser_section_url ??
        contract.advertiser_number ??
        contract.publisher_number ??
        contract.advertiser_section_url,
      image_url: photo.image_url ?? mont.image_url ?? contract.image_url,
      video_url: photo.video_url ?? mont.video_url ?? contract.video_url,
      description: photo.description ?? mont.description ?? contract.description,
      unitsCount: unitsArray.length,
      contract_units: unitsArray,
    };
  }

  /** بيانات التصوير الأصلية فقط (للعرض في أعلى النافذة) */
  const photographySourceDetail = computed(() => {
    const d = detail.value || {};
    const m = montageData.value || {};
    const contract =
      d && typeof d === 'object' && (d.id != null || Object.keys(d).length > 0)
        ? d
        : m.contract_data || m.contract || {};
    if (!contract || typeof contract !== 'object') {
      return {
        advertiser_number: '—',
        photography_link: '—',
        video_link: '—',
        description: '—',
        available_units: 0,
        photography_status: getPhotographyApprovalSummary({}),
      };
    }
    const photo = contract.photography_department || {};
    const second = contract.second_party_data || {};
    const units = contract.contract_units ?? contract.units ?? [];
    const ulen = Array.isArray(units) ? units.length : 0;
    const adv =
      second.advertiser_number ??
      second.publisher_number ??
      contract.advertiser_number ??
      contract.publisher_number ??
      '—';
    const pl = pickTrim(photo.image_url ?? photo.image_link);
    const vl = pickTrim(photo.video_url);
    const desc = pickTrim(photo.description);
    return {
      advertiser_number: adv,
      photography_link: pl || '—',
      video_link: vl || '—',
      description: desc || '—',
      available_units: ulen,
      photography_status: getPhotographyApprovalSummary(contract),
    };
  });

  const seeMoreDisplay = computed(() => {
    const d = seeMoreDetail.value || seeMoreProject.value || {};
    const photo = d.photography_department || {};
    const api = contractDisplayFromApi(d);
    if (api) {
      const img = pickTrim(photo.image_url ?? photo.image_link) || api.image_url || null;
      const vid = pickTrim(photo.video_url) || api.video_url || null;
      const desc = pickTrim(photo.description) || api.description || null;
      return {
        advertiser_number: api.advertiser_number ?? '—',
        photography_link: img,
        video_link: vid,
        description: desc,
        available_units: api.unitsCount,
      };
    }
    const units = d.contract_units ?? d.units ?? [];
    const unitsArray = Array.isArray(units) ? units : [];
    return {
      advertiser_number:
        d.advertiser_number ?? d.publisher_number ?? d.advertiser_section_url ?? '—',
      photography_link:
        pickTrim(photo.image_url ?? photo.image_link) ||
        (d.photography_link ?? d.photography_url ?? null),
      video_link:
        pickTrim(photo.video_url) ||
        (d.photography_department?.video_url ?? d.video_url ?? null),
      description: pickTrim(photo.description) || d.description || null,
      available_units: unitsArray.length,
    };
  });

  const seeMoreUnits = computed(() => {
    const d = seeMoreDetail.value || seeMoreProject.value || {};
    const api = contractDisplayFromApi(d);
    if (api) return api.contract_units || [];
    const units = d.contract_units ?? d.units ?? [];
    return Array.isArray(units) ? units : [];
  });

  watch(
    () => route.query,
    q => {
      if (q.filter === 'pending') {
        activeTab.value = 'after';
        return;
      }
      const tab = q.tab;
      if (tab === 'before' || tab === 'after') activeTab.value = tab;
    },
    { immediate: true }
  );

  /** مفتاح ثابت لقائمة «بعد المونتاج» — بدون deep watch لتجنب حلقة: دمج المونتاج → تحديث العقود → إعادة جلب لكل المعرفات */
  const afterMontageIdsKey = computed(() =>
    afterMontage.value
      .map(p => p.id)
      .filter(id => id != null && String(id).trim() !== '')
      .sort((a, b) => Number(a) - Number(b))
      .join(',')
  );

  watch([activeTab, afterMontageIdsKey, isManager], ([tab, idsKey, mgr]) => {
    if (tab !== 'after' || !mgr || !idsKey) return;
    fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
  });

  watchDebounced(
    selectedProject,
    async p => {
      if (!p) return;
      montageForm.value = { image_url: '', video_url: '', description: '' };
      await Promise.all([fetchDetail(p.id), fetchMontage(p.id)]);
    },
    { debounce: 60, flush: 'post' }
  );

  function applyMontageFormFromDetail() {
    if (!selectedProject.value) return;
    const d = detail.value || {};
    const m = montageData.value || {};
    const md =
      d.montage_department && typeof d.montage_department === 'object' ? d.montage_department : {};
    const rootM = m && typeof m === 'object' ? m : {};
    const nestedMd =
      rootM.montage_department && typeof rootM.montage_department === 'object'
        ? rootM.montage_department
        : {};
    montageForm.value = {
      image_url:
        pickTrim(rootM.image_url ?? nestedMd.image_url ?? md.image_url ?? md.image_link) || '',
      video_url: pickTrim(rootM.video_url ?? nestedMd.video_url ?? md.video_url ?? md.video_link) || '',
      description: pickTrim(rootM.description ?? nestedMd.description ?? md.description) || '',
    };
  }

  watch(montageData, applyMontageFormFromDetail, { deep: true });

  watch(detail, () => {
    applyMontageFormFromDetail();
  }, { deep: true });

  watch(seeMoreProject, p => {
    if (!p?.id) {
      seeMoreDetail.value = null;
      seeMoreMontage.value = null;
      seeMoreLoading.value = false;
    }
  });

  watchDebounced(
    seeMoreProject,
    async p => {
      if (!p?.id) return;
      seeMoreLoading.value = true;
      seeMoreDetail.value = null;
      seeMoreMontage.value = null;
      seeMoreExpanded.value = {
        advertiser: false,
        photography: false,
        video: false,
        description: false,
        units: false,
      };
      try {
        const [showRes, montRes] = await Promise.allSettled([
          editorService.getContractById(p.id),
          editorService.getMontage(p.id),
        ]);
        const data = showRes.status === 'fulfilled' ? showRes.value : null;
        const mont = montRes.status === 'fulfilled' ? montRes.value : null;
        const hasData = data && typeof data === 'object' && (data.id != null || Object.keys(data).length);
        seeMoreDetail.value = hasData ? data : { ...p };
        mergeContractDetail(p.id, seeMoreDetail.value);
        seeMoreMontage.value = mont && typeof mont === 'object' && Object.keys(mont).length ? mont : null;
        if (seeMoreMontage.value) {
          mergeMontageShowIntoContract(p.id, seeMoreMontage.value);
        }
      } finally {
        seeMoreLoading.value = false;
      }
    },
    { debounce: 80, flush: 'post' }
  );

  onMounted(async () => {
    await fetchContracts();
    const q = route.query;
    if (q.filter === 'pending') activeTab.value = 'after';
    else if (q.tab === 'after' || q.tab === 'before') activeTab.value = q.tab;
    preloadDetails();
  });

  function goProjectsTab(tab) {
    activeTab.value = tab;
    router.replace({ query: { tab } });
  }

  function openDetail(p) {
    selectedProject.value = p;
  }

  function openSeeMore(p) {
    seeMoreProject.value = p;
  }

  function closeSeeMore() {
    seeMoreProject.value = null;
    seeMoreDetail.value = null;
    seeMoreMontage.value = null;
  }

  function closeDetail() {
    selectedProject.value = null;
  }

  function isLongContent(str, max = 60) {
    return typeof str === 'string' && str.length > max;
  }

  function truncateText(str, max = 80) {
    if (str == null || str === '') return null;
    const s = String(str);
    return s.length <= max ? s : s.slice(0, max) + '...';
  }

  function truncateUrl(url, max = 50) {
    if (!url) return '';
    const s = String(url);
    return s.length <= max ? s : s.slice(0, max) + '...';
  }

  function formatPrice(n) {
    if (n == null) return '—';
    const num = Number(n);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('ar-SA', localeOpts({ style: 'decimal' })).format(num);
  }

  function montageDecisionBucket(p) {
    const label = montageStatusLabel(p);
    if (label === 'معتمد') return 'approved';
    if (label === 'مرفوض') return 'rejected';
    return 'pending';
  }

  const afterMontageListForView = computed(() => {
    const list = afterMontage.value;
    if (!isPendingQueueOnly.value) return list;
    return list.filter(x => montageDecisionBucket(x) === 'pending');
  });

  function montageStatusLabel(p) {
    const md = p.montage_department;
    if (md?.approved === '1' || md?.approved === 1) return 'معتمد';
    if (md?.approved === '0' || md?.approved === 0) return 'مرفوض';
    const mst = md?.status != null ? String(md.status) : '';
    if (mst.includes('معتمد')) return 'معتمد';
    if (mst.includes('مرفوض') || mst.includes('رفض')) return 'مرفوض';
    const slo = mst.toLowerCase();
    if (slo.includes('approv') || slo.includes('accept')) return 'معتمد';
    if (slo.includes('reject') || slo.includes('refus')) return 'مرفوض';
    const status = p.montage_status ?? p.approval_status ?? p.status;
    if (status === 'approved') return 'معتمد';
    if (status === 'rejected') return 'مرفوض';
    return 'قيد المراجعة';
  }

  function montageStatusClass(p) {
    const md = p.montage_department;
    if (md?.approved === '1' || md?.approved === 1) return 'status-approved';
    if (md?.approved === '0' || md?.approved === 0) return 'status-rejected';
    const mst = md?.status != null ? String(md.status) : '';
    if (mst.includes('معتمد')) return 'status-approved';
    if (mst.includes('مرفوض') || mst.includes('رفض')) return 'status-rejected';
    const slo = mst.toLowerCase();
    if (slo.includes('approv') || slo.includes('accept')) return 'status-approved';
    if (slo.includes('reject') || slo.includes('refus')) return 'status-rejected';
    const status = p.montage_status ?? p.approval_status ?? p.status;
    if (status === 'approved') return 'status-approved';
    if (status === 'rejected') return 'status-rejected';
    return 'status-pending';
  }

  async function submitMontage() {
    if (!selectedProject.value) return;
    montageSaving.value = true;
    try {
      const payload = {
        image_url: montageForm.value.image_url || undefined,
        video_url: montageForm.value.video_url || undefined,
        description: montageForm.value.description || undefined,
      };
      await saveMontage(
        selectedProject.value.id,
        payload,
        montageData.value && Object.keys(montageData.value).length > 0
      );
      toast.success('تم الحفظ. تم نقل المشروع إلى "بعد المونتاج".');
      closeDetail();
      activeTab.value = 'after';
      router.replace({ query: { ...route.query, tab: 'after' } });
      if (afterMontage.value.length) {
        fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
      }
    } catch (e) {
      toast.error(e?.message || 'فشل الحفظ');
    } finally {
      montageSaving.value = false;
    }
  }

  async function doApprove(id) {
    try {
      await approveMontage(id, 'approved');
      toast.success('تم القبول');
      if (selectedProject.value && Number(selectedProject.value.id) === Number(id)) {
        selectedProject.value = {
          ...selectedProject.value,
          montage_status: 'approved',
          approval_status: 'approved',
        };
      }
      closeDetail();
    } catch (e) {
      toast.error(e?.message || 'فشل');
    }
  }

  function openRejectModal(id) {
    rejectTargetId.value = id;
    rejectReason.value = '';
  }

  async function doReject() {
    if (!rejectTargetId.value || !rejectReason.value.trim()) {
      toast.warning('يرجى كتابة سبب الرفض');
      return;
    }
    try {
      const rid = rejectTargetId.value;
      await approveMontage(rid, 'rejected', rejectReason.value.trim());
      toast.success('تم الرفض');
      rejectTargetId.value = null;
      rejectReason.value = '';
      if (selectedProject.value && Number(selectedProject.value.id) === Number(rid)) {
        selectedProject.value = {
          ...selectedProject.value,
          montage_status: 'rejected',
          approval_status: 'rejected',
        };
      }
      closeDetail();
      activeTab.value = 'before';
      router.replace({ query: { tab: 'before' } });
    } catch (e) {
      toast.error(e?.message || 'فشل');
    }
  }

  return {
    isLoading,
    beforeMontage,
    afterMontage,
    detail,
    detailLoading,
    montageData,
    isManager,
    activeTab,
    selectedProject,
    montageForm,
    montageSaving,
    rejectTargetId,
    rejectReason,
    seeMoreProject,
    seeMoreLoading,
    seeMoreExpanded,
    montageRejectionNote,
    seeMoreMontageRejection,
    seeMoreMontageStatusLine,
    photographySourceDetail,
    seeMoreDisplay,
    seeMoreUnits,
    goProjectsTab,
    openDetail,
    openSeeMore,
    closeSeeMore,
    closeDetail,
    isLongContent,
    truncateText,
    truncateUrl,
    formatPrice,
    montageStatusLabel,
    montageStatusClass,
    montageHasLinksMap,
    submitMontage,
    doApprove,
    openRejectModal,
    doReject,
    isMontageDecisionFinal,
    isPendingQueueOnly,
    afterMontageListForView,
  };
}
