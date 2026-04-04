import { ref, reactive, computed, watch, onMounted } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

/**
 * نسبة السعي من بيانات العقد (contract / contract_infos)، وليس من حقول طلب مشروع حصري فقط.
 */
export function pickCommissionPercentFromContract(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const raw =
    c?.commission_percent ??
    c?.commission_percentage ??
    unit.contract_commission_percent ??
    unit.contract_commission_percentage ??
    null;
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function pickCommissionSourceFromContract(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const src = c?.commission_from ?? c?.commission_source ?? null;
  if (src === 'owner' || src === 'buyer') return src;
  return null;
}

const COMMISSION_TYPE_LABELS = {
  lead_generation: 'عمولة الجلب',
  persuasion: 'عمولة الإقناع',
  closing: 'عمولة الإقفال',
  team_leader: 'قائد الفريق',
  assistant_pm: 'مساعد مدير مشروع',
  project_manager: 'مدير مشروع',
  owner: 'المالك',
  sales_manager: 'مدير المبيعات',
  projects_department: 'قسم المشاريع',
  management: 'الإدارة',
  ceo: 'CEO',
  external_marketer: 'مسوق خارجي / المالك',
  other: 'أخرى',
};

export function useSoldUnitDetailView(props, { emit }) {
  const { formatCurrency, formatNumber } = useFormatters();
  const employees = ref([]);
  const commissionSummary = ref(null);
  const distributions = ref([]);
  const isSaving = ref(false);

  const leadGenRows = reactive([{ user_id: null, percentage: 0 }]);
  const persuasionRows = reactive([{ user_id: null, percentage: 0 }]);
  const closingRows = reactive([{ user_id: null, percentage: 0 }]);
  const hasExternalBroker = ref(false);
  const externalMarketer = reactive({ external_name: '', bank_account: '', percentage: 0 });
  const managementPct = reactive({
    team_leader: 0,
    assistant_pm: 0,
    project_manager: 0,
    owner: 0,
    sales_manager: 0,
    projects_department: 0,
    management: 0,
    ceo: 0,
  });

  const commissionForm = reactive({
    contract_unit_id: null,
    final_selling_price: 0,
    commission_percentage: 0,
    commission_source: 'owner',
    team_responsible: '',
    marketing_expenses: 0,
    bank_fees: 0,
  });

  const contractCommissionPercent = computed(() => pickCommissionPercentFromContract(props.unit));
  const commissionPercentDisplay = computed(() => {
    const v = contractCommissionPercent.value;
    if (v == null) return '—';
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return `${n}%`;
  });

  const commissionId = computed(() => props.unit?.commission_id ?? props.unit?.commission?.id);
  const hasCommission = computed(() => !!commissionId.value);
  const finalPrice = computed(
    () =>
      props.unit?.final_sale_price ??
      props.unit?.total_value ??
      commissionForm.final_selling_price ??
      0
  );
  const COMMISSION_STATUS_LABELS = {
    pending: 'معلق',
    approved: 'معتمد',
    paid: 'مدفوع',
    rejected: 'مرفوض',
  };

  const normalizeCommissionStatus = s => {
    if (s === null || s === undefined || s === '') return null;
    return String(s).toLowerCase().trim();
  };

  const commissionStatusRaw = computed(
    () =>
      props.unit?.commission_status ??
      props.unit?.status ??
      commissionSummary.value?.commission_status ??
      null
  );

  const commissionStatusLabel = computed(() => {
    const raw = commissionStatusRaw.value;
    if (raw === null || raw === undefined || raw === '') return null;
    const key = normalizeCommissionStatus(raw);
    if (key && COMMISSION_STATUS_LABELS[key]) return COMMISSION_STATUS_LABELS[key];
    return String(raw);
  });

  const commissionStatusBadgeClass = computed(() => {
    const key = normalizeCommissionStatus(commissionStatusRaw.value);
    if (key === 'approved') return 'status-badge--approved';
    if (key === 'pending') return 'status-badge--pending';
    if (key === 'paid') return 'status-badge--paid';
    if (key === 'rejected') return 'status-badge--rejected';
    return 'status-badge--neutral';
  });

  const totalDistPct = computed(() => {
    return distributions.value.reduce((sum, d) => sum + (parseFloat(d.percentage) || 0), 0);
  });

  const companyAmount = computed(() => {
    const net = commissionSummary.value?.net_amount || 0;
    const distTotal = distributions.value.reduce(
      (sum, d) => sum + (parseFloat(d.amount) || 0),
      0
    );
    return Math.max(0, net - distTotal);
  });

  const getTypeLabel = type => COMMISSION_TYPE_LABELS[type] || type || '—';

  const getBeneficiaryName = dist => {
    const name =
      dist.employee_name ?? dist.user_name ?? dist.external_name ?? '';
    return name && String(name).trim() ? String(name).trim() : '—';
  };

  const canConfirmDistribution = dist =>
    !dist.confirmed &&
    dist.status !== 'confirmed' &&
    dist.status !== 'paid' &&
    !!dist.id;

  const calcAmount = pct => {
    const net = commissionSummary.value?.net_amount || 0;
    return (net * (parseFloat(pct) || 0)) / 100;
  };

  const loadEmployees = async () => {
    try {
      const list = await accountingService.getMarketers();
      employees.value = (list || []).map(e => ({ id: e.id, name: e.name || e.email || '' }));
    } catch (e) {
      logger.error('Error loading marketers:', e);
    }
  };

  const hasPopulatedFromApi = ref(false);

  const loadCommissionSummary = async () => {
    if (!commissionId.value) return;
    try {
      commissionSummary.value = await accountingService.getCommissionSummary(commissionId.value);
      commissionForm.bank_fees = Number(commissionSummary.value?.bank_fees ?? 0);
      distributions.value = commissionSummary.value?.distributions || [];
      if (!hasPopulatedFromApi.value && distributions.value.length > 0) {
        leadGenRows.length = 0;
        persuasionRows.length = 0;
        closingRows.length = 0;
        distributions.value.forEach(d => {
          const type = d.type || d.commission_type;
          const row = { user_id: d.user_id, percentage: parseFloat(d.percentage) || 0 };
          if (type === 'lead_generation') leadGenRows.push(row);
          else if (type === 'persuasion') persuasionRows.push(row);
          else if (type === 'closing') closingRows.push(row);
          else if (type === 'team_leader')
            managementPct.team_leader = parseFloat(d.percentage) || 0;
          else if (type === 'assistant_pm')
            managementPct.assistant_pm = parseFloat(d.percentage) || 0;
          else if (type === 'project_manager')
            managementPct.project_manager = parseFloat(d.percentage) || 0;
          else if (type === 'sales_manager')
            managementPct.sales_manager = parseFloat(d.percentage) || 0;
          else if (type === 'owner') managementPct.owner = parseFloat(d.percentage) || 0;
          else if (type === 'projects_department')
            managementPct.projects_department = parseFloat(d.percentage) || 0;
          else if (type === 'management')
            managementPct.management = parseFloat(d.percentage) || 0;
          else if (type === 'ceo') managementPct.ceo = parseFloat(d.percentage) || 0;
          else if (type === 'other') managementPct.assistant_pm = parseFloat(d.percentage) || 0;
          else if (type === 'external_marketer') {
            hasExternalBroker.value = true;
            externalMarketer.external_name = d.external_name || '';
            externalMarketer.bank_account = d.bank_account || '';
            externalMarketer.percentage = parseFloat(d.percentage) || 0;
          }
        });
        if (leadGenRows.length === 0) leadGenRows.push({ user_id: null, percentage: 0 });
        if (persuasionRows.length === 0) persuasionRows.push({ user_id: null, percentage: 0 });
        if (closingRows.length === 0) closingRows.push({ user_id: null, percentage: 0 });
        hasPopulatedFromApi.value = true;
      }
    } catch (e) {
      logger.error('Error loading commission summary:', e);
      commissionSummary.value = null;
      distributions.value = [];
    }
  };

  const initFormFromUnit = () => {
    if (!props.unit) return;
    commissionForm.contract_unit_id =
      props.unit.contract_unit_id || props.unit.unit_id || props.unit.id;
    commissionForm.final_selling_price =
      props.unit.final_sale_price ?? props.unit.total_value ?? 0;
    const pct = pickCommissionPercentFromContract(props.unit);
    commissionForm.commission_percentage = pct != null ? pct : 0;
    const srcContract = pickCommissionSourceFromContract(props.unit);
    commissionForm.commission_source =
      srcContract || props.unit.commission_source || 'owner';
    commissionForm.team_responsible = props.unit.team_name || '';
  };

  const addLeadGenRow = () => leadGenRows.push({ user_id: null, percentage: 0 });
  const addPersuasionRow = () => persuasionRows.push({ user_id: null, percentage: 0 });
  const addClosingRow = () => closingRows.push({ user_id: null, percentage: 0 });

  const buildDistributionsPayload = () => {
    const dists = [];
    leadGenRows.forEach(r => {
      if (r.user_id && r.percentage > 0)
        dists.push({ type: 'lead_generation', user_id: r.user_id, percentage: r.percentage });
    });
    persuasionRows.forEach(r => {
      if (r.user_id && r.percentage > 0)
        dists.push({ type: 'persuasion', user_id: r.user_id, percentage: r.percentage });
    });
    closingRows.forEach(r => {
      if (r.user_id && r.percentage > 0)
        dists.push({ type: 'closing', user_id: r.user_id, percentage: r.percentage });
    });
    if (managementPct.team_leader > 0)
      dists.push({ type: 'team_leader', user_id: null, percentage: managementPct.team_leader });
    if (managementPct.assistant_pm > 0)
      dists.push({ type: 'assistant_pm', user_id: null, percentage: managementPct.assistant_pm });
    if (managementPct.project_manager > 0)
      dists.push({
        type: 'project_manager',
        user_id: null,
        percentage: managementPct.project_manager,
      });
    if (managementPct.owner > 0)
      dists.push({ type: 'owner', user_id: null, percentage: managementPct.owner });
    if (managementPct.sales_manager > 0)
      dists.push({
        type: 'sales_manager',
        user_id: null,
        percentage: managementPct.sales_manager,
      });
    if (managementPct.projects_department > 0)
      dists.push({
        type: 'projects_department',
        user_id: null,
        percentage: managementPct.projects_department,
      });
    if (managementPct.management > 0)
      dists.push({ type: 'management', user_id: null, percentage: managementPct.management });
    if (managementPct.ceo > 0)
      dists.push({ type: 'ceo', user_id: null, percentage: managementPct.ceo });
    if (hasExternalBroker.value && externalMarketer.percentage > 0) {
      dists.push({
        type: 'external_marketer',
        external_name: externalMarketer.external_name,
        bank_account: externalMarketer.bank_account,
        percentage: externalMarketer.percentage,
      });
    }
    return dists;
  };

  const handleSaveDistributions = async () => {
    const dists = buildDistributionsPayload();
    const total = dists.reduce((s, d) => s + (d.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      toast.warning('مجموع النسب يجب أن يساوي 100%');
      return;
    }
    if (!commissionId.value) return;
    isSaving.value = true;
    try {
      await accountingService.updateDistributions(commissionId.value, {
        distributions: dists,
        bank_fees: Number(commissionForm.bank_fees) || 0,
        commission_source: commissionForm.commission_source || 'owner',
      });
      toast.success('تم تحديث التوزيعات بنجاح');
      loadCommissionSummary();
    } catch (e) {
      logger.error('Error saving distributions:', e);
      toast.error('حدث خطأ أثناء حفظ التوزيعات');
    } finally {
      isSaving.value = false;
    }
  };

  const handleConfirmPayment = async dist => {
    if (!commissionId.value || !dist.id) return;
    isSaving.value = true;
    try {
      await accountingService.confirmPayment(commissionId.value, dist.id, {});
      toast.success('تم تأكيد الدفع بنجاح');
      loadCommissionSummary();
    } catch (e) {
      logger.error('Error confirming payment:', e);
      toast.error('حدث خطأ أثناء تأكيد الدفع');
    } finally {
      isSaving.value = false;
    }
  };

  const handleCreateCommission = () => {
    const payload = {
      ...commissionForm,
      contract_unit_id: commissionForm.contract_unit_id || props.unit?.id || 1,
    };
    emit('create-commission', payload);
  };

  watch(
    () => props.unit,
    u => {
      hasPopulatedFromApi.value = false;
      initFormFromUnit();
      if (u?.commission_id || u?.commission?.id) loadCommissionSummary();
    },
    { immediate: true }
  );

  watch(commissionId, id => {
    if (id) loadCommissionSummary();
  });

  onMounted(() => {
    loadEmployees();
    initFormFromUnit();
  });

  return {
    employees,
    commissionSummary,
    distributions,
    commissionForm,
    commissionPercentDisplay,
    leadGenRows,
    persuasionRows,
    closingRows,
    hasExternalBroker,
    externalMarketer,
    managementPct,
    hasCommission,
    finalPrice,
    commissionStatusLabel,
    commissionStatusBadgeClass,
    totalDistPct,
    companyAmount,
    isSaving,
    formatCurrency,
    formatNumber,
    getTypeLabel,
    getBeneficiaryName,
    canConfirmDistribution,
    calcAmount,
    addLeadGenRow,
    addClosingRow,
    addPersuasionRow,
    handleSaveDistributions,
    handleConfirmPayment,
    handleCreateCommission,
  };
}
