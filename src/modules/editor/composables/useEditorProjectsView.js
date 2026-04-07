import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useEditorProjects } from '@/modules/editor/composables/useEditorProjects';
import editorService from '@/services/editorService';
import { toast } from '@/composables/useToast';
import { isMontageDecisionFinal } from '@/utils/montageApproval';

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
  /** بعد المونتاج: تصفية حسب قرار المدير */
  const afterStatusFilter = ref('all');
  const selectedProject = ref(null);
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

  const displayDetail = computed(() => {
    const d = detail.value || {};
    const m = montageData.value || {};
    const fromApi = contractDisplayFromApi(d);
    const fromMontageContract = contractDisplayFromApi(m.contract || m.contract_data || {});
    const fallbackUnits = d.contract_units ?? d.units ?? m.contract_units ?? m.units ?? [];
    const fallbackCount = Array.isArray(fallbackUnits) ? fallbackUnits.length : 0;
    const fallback = {
      advertiser_number:
        d.advertiser_number ??
        d.publisher_number ??
        d.advertiser_section_url ??
        m.advertiser_number,
      photography_link:
        d.photography_link ??
        d.photography_url ??
        d.image_url ??
        d.montage_department?.image_url ??
        m.image_url ??
        m.photography_link ??
        m.montage_department?.image_url,
      video_link:
        d.photography_department?.video_url ??
        d.montage_department?.video_url ??
        d.video_url ??
        m.video_url ??
        m.montage_department?.video_url,
      description:
        d.description ?? d.montage_department?.description ?? m.description ?? m.montage_department?.description,
      unitsCount: fallbackCount,
    };
    const api = fromApi || fromMontageContract;
    const advertiser_number = api?.advertiser_number ?? fallback.advertiser_number;
    const photography_link = api?.image_url ?? fallback.photography_link;
    const video_link = api?.video_url ?? fallback.video_link;
    const description = api?.description ?? fallback.description;
    const unitsCount = api?.unitsCount ?? fallback.unitsCount ?? 0;
    return {
      advertiser_number: advertiser_number ?? '—',
      photography_link: photography_link ?? '—',
      video_link: video_link ?? '—',
      description: description ?? '—',
      available_units: unitsCount,
      units: api?.contract_units ?? [],
    };
  });

  const seeMoreDisplay = computed(() => {
    const d = seeMoreDetail.value || seeMoreProject.value || {};
    const api = contractDisplayFromApi(d);
    if (api) {
      return {
        advertiser_number: api.advertiser_number ?? '—',
        photography_link: api.image_url ?? null,
        video_link: api.video_url ?? null,
        description: api.description ?? null,
        available_units: api.unitsCount,
      };
    }
    const units = d.contract_units ?? d.units ?? [];
    const unitsArray = Array.isArray(units) ? units : [];
    return {
      advertiser_number:
        d.advertiser_number ?? d.publisher_number ?? d.advertiser_section_url ?? '—',
      photography_link:
        d.photography_link ??
        d.photography_url ??
        d.image_url ??
        d.montage_department?.image_url ??
        null,
      video_link:
        d.photography_department?.video_url ??
        d.montage_department?.video_url ??
        d.video_url ??
        d.montage_video_url ??
        null,
      description: d.description ?? d.montage_department?.description ?? null,
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
    () => route.query.tab,
    tab => {
      if (tab === 'before' || tab === 'after') activeTab.value = tab;
    },
    { immediate: true }
  );

  watch(activeTab, t => {
    if (t === 'after' && isManager.value && afterMontage.value.length) {
      fetchMontageLinksForProjects(afterMontage.value.map(p => p.id));
    }
  });

  watch(
    afterMontage,
    list => {
      if (activeTab.value === 'after' && isManager.value && list.length) {
        fetchMontageLinksForProjects(list.map(p => p.id));
      }
    },
    { deep: true }
  );

  watch(
    selectedProject,
    async p => {
      if (!p) return;
      montageForm.value = { image_url: '', video_url: '', description: '' };
      await Promise.all([fetchDetail(p.id), fetchMontage(p.id)]);
    },
    { flush: 'post' }
  );

  function applyMontageFormFromDetail() {
    if (!selectedProject.value) return;
    const d = detail.value || {};
    const m = montageData.value || {};
    const api = contractDisplayFromApi(d);
    montageForm.value = {
      image_url: (m && m.image_url) ?? api?.image_url ?? d.image_url ?? '',
      video_url: (m && m.video_url) ?? api?.video_url ?? d.video_url ?? '',
      description: (m && m.description) ?? api?.description ?? d.description ?? '',
    };
  }

  watch(montageData, applyMontageFormFromDetail, { deep: true });

  watch(detail, () => {
    applyMontageFormFromDetail();
  }, { deep: true });

  watch(
    seeMoreProject,
    async p => {
      if (!p?.id) {
        seeMoreDetail.value = null;
        seeMoreMontage.value = null;
        return;
      }
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
    { flush: 'post' }
  );

  watch(activeTab, t => {
    if (t === 'before') afterStatusFilter.value = 'all';
  });

  onMounted(async () => {
    await fetchContracts();
    const tab = route.query.tab;
    if (tab === 'after' || tab === 'before') activeTab.value = tab;
    preloadDetails();
  });

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
    return new Intl.NumberFormat('ar-SA', { style: 'decimal' }).format(num);
  }

  function montageDecisionBucket(p) {
    const label = montageStatusLabel(p);
    if (label === 'معتمد') return 'approved';
    if (label === 'مرفوض') return 'rejected';
    return 'pending';
  }

  const filteredAfterMontage = computed(() => {
    const list = afterMontage.value;
    if (afterStatusFilter.value === 'all') return list;
    return list.filter(x => montageDecisionBucket(x) === afterStatusFilter.value);
  });

  const afterMontageCounts = computed(() => {
    const list = afterMontage.value;
    return {
      all: list.length,
      approved: list.filter(x => montageDecisionBucket(x) === 'approved').length,
      rejected: list.filter(x => montageDecisionBucket(x) === 'rejected').length,
      pending: list.filter(x => montageDecisionBucket(x) === 'pending').length,
    };
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
    displayDetail,
    seeMoreDisplay,
    seeMoreUnits,
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
    afterStatusFilter,
    filteredAfterMontage,
    afterMontageCounts,
  };
}
