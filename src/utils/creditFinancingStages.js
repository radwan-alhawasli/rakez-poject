/** تسميات المراحل الست — متوافقة مع واجهة دور الائتمان */
export const CREDIT_FINANCING_STAGE_LABELS = [
  'تواصل مع العميل',
  'رفع الطلب إلى البنك',
  'صدور التقييم',
  'زيارة المقيم للمشروع',
  'الإجراءات البنكية والعقود',
  'تجهيز قبل الافراغ',
];

/** حجز كاش: مرحلتان فقط (بدون مسار بنكي) */
export const CREDIT_CASH_STAGE_LABELS = [
  'تواصل مع العميل',
  'فتره التجهيز قبل الافراغ',
];

const LIMIT_DAYS_FIRST_FIVE = [2, 3, 3, 2, 5];

/**
 * @param {string|undefined} purchaseMechanism - من العقد: supported_bank | unsupported_bank | cash | ...
 */
export function getPurchaseMechanismKey(booking) {
  const p = String(booking?.purchase_mechanism ?? '').toLowerCase();
  if (p === 'unsupported_bank') return 'unsupported_bank';
  return 'supported_bank';
}

/** آلية الشراء كاش (لا يُعرض مسار الائتمان البنكي الكامل) */
export function isCashReservation(booking) {
  const p = String(booking?.purchase_mechanism ?? '').toLowerCase();
  return p === 'cash' || p === 'كاش';
}

/** عدد مراحل التتبع في الواجهة: 2 لكاش، 6 لغيره */
export function getTrackerStageCount(booking) {
  return isCashReservation(booking) ? CREDIT_CASH_STAGE_LABELS.length : CREDIT_FINANCING_STAGE_LABELS.length;
}

export function getTrackerLabels(booking) {
  return isCashReservation(booking) ? CREDIT_CASH_STAGE_LABELS : CREDIT_FINANCING_STAGE_LABELS;
}

/**
 * عدد أيام المهلة لكل مرحلة (المرحلة الأخيرة في مسار البنك تعتمد على نوع البنك).
 * كاش: المرحلة 0 = يومان، المرحلة 1 = خمسة أيام.
 * @param {number} stageIndex فهرس ضمن المسار الحالي (0..1 لكاش، 0..5 للبنك)
 */
export function getStageDayLimit(stageIndex, booking) {
  if (isCashReservation(booking)) {
    if (stageIndex === 0) return 2;
    if (stageIndex === 1) return 5;
    return 5;
  }
  const mech = getPurchaseMechanismKey(booking);
  if (stageIndex < 5) return LIMIT_DAYS_FIRST_FIVE[stageIndex] ?? 2;
  return mech === 'unsupported_bank' ? 10 : 5;
}

function storageKey(bookingId) {
  return `creditFinStageStarts:${bookingId}`;
}

/**
 * أوقات بدء كل مرحلة (ISO) — [0] من تاريخ الحجز/التأكيد، ثم بعد كل advance.
 * @param {string|number} bookingId
 * @param {{ created_at?: string, confirmed_at?: string, booking_date?: string }} booking
 */
export function getStageStartTimes(bookingId, booking) {
  if (bookingId == null) return [];
  try {
    const raw = sessionStorage.getItem(storageKey(bookingId));
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch {
    /* ignore */
  }
  const base =
    booking?.confirmed_at ||
    booking?.created_at ||
    booking?.booking_date ||
    new Date().toISOString();
  return [typeof base === 'string' ? base : new Date(base).toISOString()];
}

/**
 * بعد نجاح advance: نسجّل وقت دخول المرحلة النشطة الحالية (index = عدد المكتمل).
 * @param {string|number} bookingId
 * @param {number} completedStagesAfter - عدد المراحل المكتملة بعد الاستجابة
 */
export function recordAfterAdvance(bookingId, completedStagesAfter, booking) {
  if (bookingId == null) return;
  const now = new Date().toISOString();
  const starts = [...getStageStartTimes(bookingId, booking)];
  const cap = getTrackerStageCount(booking);
  const activeIndex = Math.min(cap, Math.max(0, completedStagesAfter));
  while (starts.length <= activeIndex) {
    starts.push(now);
  }
  starts[activeIndex] = now;
  try {
    sessionStorage.setItem(storageKey(bookingId), JSON.stringify(starts));
  } catch {
    /* ignore */
  }
}

function addDays(isoStr, days) {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * نص السطر تحت كل مرحلة: موعد الاستحقاق، متبقي، أو متأخر.
 * @param {object} opts
 * @param {number} opts.stageIndex
 * @param {boolean} opts.done
 * @param {string|null} opts.apiDueDate - إن أعادها الـ API
 * @param {string|null} opts.apiCompletedAt
 */
export function formatStageDueLine(opts) {
  const { stageIndex, done, booking, bookingId, apiDueDate, apiCompletedAt } = opts;
  if (done) {
    if (apiCompletedAt) {
      try {
        const d = new Date(apiCompletedAt);
        if (!Number.isNaN(d.getTime())) {
          return `اكتمل في ${d.toLocaleDateString('ar-SA')}`;
        }
      } catch {
        /* fallthrough */
      }
    }
    return 'مكتمل';
  }
  let due = null;
  if (apiDueDate) {
    try {
      due = new Date(apiDueDate);
      if (Number.isNaN(due.getTime())) due = null;
    } catch {
      due = null;
    }
  }
  if (!due && bookingId != null) {
    const starts = getStageStartTimes(bookingId, booking);
    const startIso = starts[stageIndex];
    if (startIso) {
      const limit = getStageDayLimit(stageIndex, booking);
      due = addDays(startIso, limit);
    }
  }
  if (!due) return '—';
  const now = new Date();
  const ms = due.getTime() - now.getTime();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
  if (days === 0) return 'يستحق اليوم';
  return `متبقي ${days} يوم · الاستحقاق ${due.toLocaleDateString('ar-SA')}`;
}

/**
 * هل المرحلة متأخرة (للشارة الحمراء).
 */
export function isStageOverdue(opts) {
  const line = formatStageDueLine(opts);
  return typeof line === 'string' && line.startsWith('متأخر');
}
