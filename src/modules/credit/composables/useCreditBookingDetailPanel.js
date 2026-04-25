import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useFormatters } from '@/composables/useFormatters';
import {
  getTrackerLabels,
  getTrackerStageCount,
  formatStageDueLine,
  isStageOverdue,
} from '@/utils/creditFinancingStages';

/**
 * State for CreditBookingDetailPanel.vue (split to satisfy max-lines-per-file).
 * @param {{ booking: any, financingTracker: any }} props
 */
export function useCreditBookingDetailPanel(props) {
  const { formatCurrencyAr: formatCurrency, formatDate } = useFormatters();
  const tick = ref(0);
  /** @type {any} */
  let tickTimer;
  onMounted(() => {
    tickTimer = setInterval(() => {
      tick.value += 1;
    }, 60000);
  });
  onUnmounted(() => {
    if (tickTimer) clearInterval(tickTimer);
  });

  const summaryTitle = computed(() => {
    const b = props.booking;
    if (!b) return '—';
    const project = b.project_name || '—';
    const unit = b.unit_number ?? b.unit_id ?? b.unit_code ?? '—';
    return `وحدة: ${unit} / مشروع: ${project}`;
  });

  const isFinancingRejected = computed(() => {
    const b = props.booking;
    if (!b) return false;
    const labelAr = b.credit_status_label_ar && String(b.credit_status_label_ar).trim();
    if (labelAr && (labelAr.includes('مرفوض') || labelAr.includes('رفض'))) return true;
    const s = String(b.credit_status ?? b.status ?? '').toLowerCase();
    return (
      s.includes('reject') ||
      s.includes('financing_reject') ||
      s === 'rejected' ||
      b.financing_rejected === true
    );
  });

  const statusBadgeClass = computed(() =>
    isFinancingRejected.value ? 'rejected' : 'approved'
  );

  const statusLabel = computed(() => {
    const b = props.booking;
    if (isFinancingRejected.value) {
      if (b?.credit_status_label_ar && String(b.credit_status_label_ar).trim()) {
        return b.credit_status_label_ar;
      }
      return 'مرفوض التمويل';
    }
    if (b?.credit_status_label_ar && String(b.credit_status_label_ar).trim())
      return b.credit_status_label_ar;
    const status = b?.credit_status ?? b?.status ?? 'approved';
    /** @type {Record<string, string>} */
    const map = {
      approved: 'Approved',
      مؤكد: 'Approved',
      confirmed: 'Approved',
      sold: 'Sold',
      title_transfer: 'نقل الملكية',
      pending: 'قيد المراجعة',
      rejected: 'مرفوض',
    };
    return map[status] || status;
  });

  const paymentMethodLabel = computed(() => {
    const m = props.booking?.payment_method ?? props.booking?.payment_method_label;
    if (m === 'cash' || m === 'كاش') return 'كاش';
    if (m === 'transfer' || m === 'bank') return 'تحويل بنكي';
    if (m === 'electronic' || m === 'online' || m === 'دفع إلكتروني') return 'دفع إلكتروني';
    return m || '—';
  });

  const purchaseMechanismLabel = computed(() => {
    const labelAr = props.booking?.purchase_mechanism_label_ar;
    if (labelAr && String(labelAr).trim()) return labelAr;
    const p = props.booking?.purchase_mechanism ?? props.booking?.purchase_mechanism_label;
    if (p === 'cash' || p === 'كاش') return 'Cash';
    if (p === 'supported_bank') return 'Supported Bank';
    if (p === 'unsupported_bank') return 'Unsupported Bank';
    return p || '—';
  });

  const projectTeamLabel = computed(() => {
    const v = props.booking?.project_team ?? props.booking?.team_name ?? props.booking?.team;
    return v != null && String(v).trim() ? v : 'غير معين';
  });

  const sellerTeamLabel = computed(() => {
    const v = props.booking?.seller_team ?? props.booking?.team_name ?? props.booking?.team;
    return v != null && String(v).trim() ? v : 'غير معين';
  });

  const rawCompletedCount = computed(() => {
    tick.value;
    const b = props.booking;
    const ft = props.financingTracker;
    const cap = getTrackerStageCount(b || {});
    if (ft?.all_completed) return cap;
    if (typeof ft?.completed_stages === 'number') return Math.min(cap, ft.completed_stages);
    const steps = b?.credit_procedure_steps;
    if (Array.isArray(steps) && steps.length > 0) {
      return Math.min(
        cap,
        steps.filter(s => s.status === 'completed' || s.status === 'done' || s.completed).length
      );
    }
    const stages = ft?.stages ?? [];
    if (Array.isArray(stages) && stages.length > 0) {
      return Math.min(
        cap,
        stages.filter(s => s?.completed || s?.done || s?.status === 'completed').length
      );
    }
    return 0;
  });

  const delayDays = computed(() => {
    const steps = props.booking?.credit_procedure_steps;
    if (Array.isArray(steps)) {
      const current = steps.find(
        s => s.status !== 'completed' && s.status !== 'done' && !s.completed
      );
      return current?.delay_days ?? current?.delay ?? 0;
    }
    const t = props.financingTracker;
    return t?.delay_days ?? t?.current_stage_delay_days ?? t?.delay ?? 0;
  });

  const currentStepIndex = computed(() => {
    const n = rawCompletedCount.value;
    const b = props.booking;
    const cap = getTrackerStageCount(b || {});
    if (n >= cap) return -1;
    return n;
  });

  const currentStepLabel = computed(() => {
    const i = currentStepIndex.value;
    if (i < 0) return '';
    const b = props.booking;
    const labels = getTrackerLabels(b || {});
    const steps = props.booking?.credit_procedure_steps;
    if (Array.isArray(steps) && steps[i]) {
      return steps[i].label_ar || labels[i];
    }
    return labels[i] || '';
  });

  const trackerSteps = computed(() => {
    tick.value;
    const b = props.booking;
    const ft = props.financingTracker;
    const bookingId = b?.id ?? b?.reservation_id;
    const labels = getTrackerLabels(b || {});
    const n = rawCompletedCount.value;
    const apiSteps = b?.credit_procedure_steps;
    const stages = ft?.stages;

    return labels.map((label, i) => {
      let done = false;
      let apiDue = null;
      let apiCompletedAt = null;
      if (Array.isArray(apiSteps) && apiSteps[i]) {
        const s = apiSteps[i];
        done = s.status === 'completed' || s.status === 'done' || s.completed === true;
        apiDue = s.due_date ?? s.due_at;
        apiCompletedAt = s.completed_at ?? s.date;
      } else if (Array.isArray(stages) && stages[i]) {
        const s = stages[i];
        done = !!(s.completed || s.done || s.status === 'completed');
        apiDue = s.due_date;
        apiCompletedAt = s.completed_at;
      } else {
        done = i < n;
      }
      if (ft?.all_completed) done = true;

      const dueLine = formatStageDueLine({
        stageIndex: i,
        done,
        booking: b,
        bookingId,
        apiDueDate: apiDue,
        apiCompletedAt,
      });
      const overdue = !done &&
        isStageOverdue({
          stageIndex: i,
          done,
          booking: b,
          bookingId,
          apiDueDate: apiDue,
          apiCompletedAt,
        });
      const apiAr = Array.isArray(apiSteps) && apiSteps[i]?.label_ar;
      const isLast = i === labels.length - 1;
      // آخر مرحلة: نعرض التسمية المعتمدة محلياً (تجاهل «تنفيذ العقود» وغيرها من الـ API)
      const stepLabel = isLast ? label : apiAr || label;
      return {
        label: stepLabel,
        done,
        dueLine,
        isOverdue: overdue,
      };
    });
  });

  const allStepsDone = computed(() => {
    const cap = getTrackerStageCount(props.booking || {});
    return props.financingTracker?.all_completed === true || rawCompletedCount.value >= cap;
  });

  const canAdvanceStage = computed(
    () => !allStepsDone.value && !isFinancingRejected.value
  );

  const financingStarted = computed(
    () =>
      !!(
        props.financingTracker?.financing ||
        props.financingTracker?.current_stage != null ||
        (Array.isArray(props.financingTracker?.stages) &&
          props.financingTracker.stages.length > 0) ||
        rawCompletedCount.value > 0
      )
  );

  const showRejectFinancingBtn = computed(
    () => financingStarted.value && !isFinancingRejected.value
  );

  const hasTitleTransfer = computed(
    () => !!(props.booking?.title_transfer?.id || props.booking?.title_transfer_id)
  );

  const titleTransferScheduled = computed(() => {
    const tt = props.booking?.title_transfer;
    if (!tt) return false;
    return !!(tt.scheduled_date || tt.scheduled_at || String(tt.status || '').includes('schedule'));
  });

  const showEvacuationBtn = computed(() => {
    const s = props.booking?.credit_status ?? props.booking?.status;
    return s !== 'sold' && s !== 'مباع';
  });

  return {
    summaryTitle,
    statusLabel,
    statusBadgeClass,
    isFinancingRejected,
    paymentMethodLabel,
    purchaseMechanismLabel,
    projectTeamLabel,
    sellerTeamLabel,
    trackerSteps,
    allStepsDone,
    showEvacuationBtn,
    showRejectFinancingBtn,
    hasTitleTransfer,
    titleTransferScheduled,
    currentStepLabel,
    delayDays,
    canAdvanceStage,
    formatDate,
    formatCurrency,
  };
}
