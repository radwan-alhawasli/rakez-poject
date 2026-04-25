/**
 * Normalizes dashboard / analytics API payloads into widget-friendly shapes.
 * No fabricated numbers — callers decide empty/hidden UI.
 */

/** Hex colors for SVG charts (CSS variables are unreliable inside some canvas/SVG paths). */
export const defaultWidgetColors = ['#27374d', '#b5a99a', '#4a6fa5', '#c4a574', '#7c8aa6', '#1a2636'];

/**
 * Walk unknown API objects and try to build { x, y, label }[] with at least 2 points.
 * @param {any} raw
 * @returns {Array<{ x: number, y: number, label: string }>}
 */
export function extractTimeSeriesFromUnknown(raw) {
  if (raw == null) return [];
  if (typeof raw !== 'object') return [];

  const r = /** @type {any} */ (raw);
  const candidates = [
    r.monthly_series,
    r.monthlySeries,
    r.revenue_series,
    r.revenueSeries,
    r.revenue_by_month,
    r.series,
    r.trend,
    r.chart?.area,
    r.charts?.area,
    r.time_series,
    r.timeseries,
    r.data,
  ];

  for (const c of candidates) {
    const pts = coalesceToPoints(c);
    if (pts.length >= 2) return pts;
  }

  if (Array.isArray(r.labels) && Array.isArray(r.values) && r.labels.length === r.values.length) {
    /** @type {any[]} */
    const labels = r.labels;
    return labels.map((l, i) => ({
      x: i,
      y: Number(r.values[i]) || 0,
      label: String(l),
    }));
  }

  return [];
}

/**
 * @param {any} c
 */
function coalesceToPoints(c) {
  if (c == null) return [];
  if (typeof c === 'object' && !Array.isArray(c)) {
    const obj = /** @type {any} */ (c);
    const keys = Object.keys(obj).filter((k) => !/^_/.test(k));
    if (keys.length >= 2 && keys.every((k) => typeof obj[k] === 'number' || (typeof obj[k] === 'string' && !Number.isNaN(Number(obj[k]))))) {
      return keys.map((k, i) => ({
        x: i,
        y: Number(obj[k]) || 0,
        label: k,
      }));
    }
  }
  if (!Array.isArray(c)) return [];
  /** @type {any[]} */
  const arr = c;
  const points = arr
    .map((row, i) => {
      if (row == null) return null;
      if (typeof row === 'number') return { x: i, y: row, label: String(i + 1) };
      const r = /** @type {any} */ (row);
      const y = r.y ?? r.value ?? r.total ?? r.count ?? r.amount ?? r.revenue;
      if (y == null && y !== 0) return null;
      const label = r.label ?? r.month ?? r.name ?? r.date ?? r.period ?? String(i + 1);
      return {
        x: i,
        y: Number(y) || 0,
        label: String(label),
      };
    })
    .filter((p) => p !== null);
  return /** @type {Array<{ x: number, y: number, label: string }>} */ (points);
}

/**
 * أعداد الحجوزات من GET /credit/dashboard (الدونات والأعمدة)
 * @param {any} metrics - credit dashboardMetrics reactive object
 */
export function creditBookingSegments(metrics) {
  if (!metrics) return [];
  const m = /** @type {any} */ (metrics);
  return [
    { label: 'مؤكدة', value: Number(m.confirmedBookings) || 0 },
    { label: 'تفاوض', value: Number(m.pendingNegotiations) || 0 },
    { label: 'انتظار', value: Number(m.waitingBookings) || 0 },
    { label: 'تحتاج مراجعة', value: Number(m.requiresReview) || 0 },
    {
      label: 'مرفوضة + عربون',
      value: Number(m.rejectedWithDownPayment) || 0,
    },
  ];
}

/**
 * @param {any} d - normalized sales dashboard payload
 */
export function salesInventorySegments(d) {
  if (!d) return [];
  return [
    { label: 'محجوزة', value: Number(d.reserved_units ?? 0) || 0 },
    { label: 'متاحة', value: Number(d.available_units ?? 0) || 0 },
    { label: 'تسويق', value: Number(d.projects_under_marketing ?? 0) || 0 },
    { label: 'مؤكدة', value: Number(d.confirmed_count ?? d.confirmed_reservations ?? 0) || 0 },
    { label: 'تفاوض', value: Number(d.negotiation_count ?? d.negotiation_reservations ?? 0) || 0 },
  ];
}

/**
 * @param {any} m
 */
export function accountingProgressRows(m) {
  if (!m) return [];
  const metrics = /** @type {any} */ (m);
  return [
    { label: 'وحدات مباعة', value: Number(metrics.totalUnitsSold) || 0 },
    { label: 'عربون مستلم', value: Number(metrics.totalDeposits) || 0 },
    { label: 'عربون مسترد', value: Number(metrics.totalDepositsRefunded) || 0 },
    { label: 'قيمة مشاريع', value: Number(metrics.totalProjectsValue) || 0 },
    { label: 'قيمة مبيعات', value: Number(metrics.totalSalesValue) || 0 },
    { label: 'عمولات', value: Number(metrics.totalCommissions) || 0 },
  ];
}

/**
 * @param {any} m
 */
export function hrProgressRows(m) {
  if (!m) return [];
  const metrics = /** @type {any} */ (m);
  return [
    { label: 'متوسط بيع الفريق (شهري)', value: Number(metrics.avgTeamMonthlySales) || 0 },
    { label: 'وحدات (إجمالي)', value: Number(metrics.totalUnits) || 0 },
    { label: 'موظفو مبيعات', value: Number(metrics.salesEmployeesCount) || 0 },
    { label: 'الموظفون الحاليون', value: Number(metrics.currentEmployeesCount) || 0 },
    { label: 'متوسط تحقيق الأهداف', value: Number(metrics.avgEmployeeSales) || 0 },
  ];
}

/**
 * @param {any} available
 * @param {any} totalProjects
 * @param {any} ready
 * @param {any} notReady
 */
export function inventoryProjectSegments(available, totalProjects, ready, notReady) {
  return [
    { label: 'وحدات متاحة', value: Number(available) || 0 },
    { label: 'مشاريع', value: Number(totalProjects) || 0 },
    { label: 'جاهزة', value: Number(ready) || 0 },
    { label: 'غير جاهزة', value: Number(notReady) || 0 },
  ];
}

/**
 * @param {any} ready
 * @param {any} notReady
 */
export function editorProjectSegments(ready, notReady) {
  return [
    { label: 'بعد المونتاج', value: Number(ready) || 0 },
    { label: 'قبل المونتاج', value: Number(notReady) || 0 },
  ];
}

/**
 * @param {any} metrics
 */
export function marketingCountSegments(metrics) {
  if (!metrics) return [];
  const m = /** @type {any} */ (metrics);
  return [
    { label: 'عملاء محتملون', value: Number(m.total_leads) || 0 },
    { label: 'حجوزات متوقعة', value: Number(m.total_expected_bookings) || 0 },
    { label: 'عربون يومي', value: Number(m.daily_deposits_count) || 0 },
  ];
}

/**
 * Map manager task rows for TaskListWidget
 * @param {Array<any>} items
 */
export function mapManagerTasks(items) {
  if (!Array.isArray(items)) return [];
  return items.map((t) => ({
    id: t.id,
    title: t.title ?? t.name ?? t.subject,
    due_at: t.due_at ?? t.due,
    status: t.status ?? t.state,
  }));
}

/**
 * Maps a deposit row from GET /accounting/deposits/follow-up or /pending to ActivityListWidget item shape.
 * Field names vary by backend — only real fields are read.
 * @param {any} row
 * @param {number} index
 * @returns {{ id: string|number, title: string, subtitle?: string, amount?: number, date?: string }}
 */
export function mapDepositRecordToActivityItem(row, index = 0) {
  if (!row || typeof row !== 'object') {
    return { id: index, title: '—', subtitle: '' };
  }
  const r = /** @type {any} */ (row);
  const id = r.id ?? r.deposit_id ?? r.reservation_id ?? `dep-${index}`;
  const amountRaw = r.amount ?? r.total_amount ?? r.deposit_amount ?? r.value;
  const amount = amountRaw != null && !Number.isNaN(Number(amountRaw)) ? Number(amountRaw) : undefined;
  const title =
    r.project_name ??
    r.contract_name ??
    r.client_name ??
    (r.reservation_id != null ? `حجز #${r.reservation_id}` : null) ??
    `عربون #${id}`;
  const parts = [r.status, r.bank_reference, r.reference].filter(Boolean);
  const subtitle = parts.length ? parts.join(' · ') : r.notes ?? r.note ?? '';
  const date = r.updated_at ?? r.created_at ?? r.confirmed_at ?? r.due_date;

  return {
    id,
    title: String(title),
    subtitle: subtitle ? String(subtitle) : undefined,
    amount,
    date: date || undefined,
  };
}

/**
 * @param {any} n - normalized notification from notificationService.fetchAll
 */
export function mapNotificationToActivityItem(n, index = 0) {
  if (!n) return { id: index, title: '—' };
  const notification = /** @type {any} */ (n);
  return {
    id: notification.id ?? index,
    title: String(notification.title || notification.message || 'إشعار'),
    subtitle: notification.type || notification.eventType || undefined,
    date: notification.time || notification.created_at,
  };
}
