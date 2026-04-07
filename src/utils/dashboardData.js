/**
 * Normalizes dashboard / analytics API payloads into widget-friendly shapes.
 * No fabricated numbers — callers decide empty/hidden UI.
 */

/** Hex colors for SVG charts (CSS variables are unreliable inside some canvas/SVG paths). */
export const defaultWidgetColors = ['#27374d', '#b5a99a', '#4a6fa5', '#c4a574', '#7c8aa6', '#1a2636'];

/**
 * Walk unknown API objects and try to build { x, y, label }[] with at least 2 points.
 * @param {unknown} raw
 * @returns {Array<{ x: number, y: number, label: string }>}
 */
export function extractTimeSeriesFromUnknown(raw) {
  if (raw == null) return [];
  if (typeof raw !== 'object') return [];

  const candidates = [
    raw.monthly_series,
    raw.monthlySeries,
    raw.revenue_series,
    raw.revenueSeries,
    raw.revenue_by_month,
    raw.series,
    raw.trend,
    raw.chart?.area,
    raw.charts?.area,
    raw.time_series,
    raw.timeseries,
    raw.data,
  ];

  for (const c of candidates) {
    const pts = coalesceToPoints(c);
    if (pts.length >= 2) return pts;
  }

  if (Array.isArray(raw.labels) && Array.isArray(raw.values) && raw.labels.length === raw.values.length) {
    return raw.labels.map((l, i) => ({
      x: i,
      y: Number(raw.values[i]) || 0,
      label: String(l),
    }));
  }

  return [];
}

function coalesceToPoints(c) {
  if (c == null) return [];
  if (typeof c === 'object' && !Array.isArray(c)) {
    const keys = Object.keys(c).filter((k) => !/^_/.test(k));
    if (keys.length >= 2 && keys.every((k) => typeof c[k] === 'number' || (typeof c[k] === 'string' && !Number.isNaN(Number(c[k]))))) {
      return keys.map((k, i) => ({
        x: i,
        y: Number(c[k]) || 0,
        label: k,
      }));
    }
  }
  if (!Array.isArray(c)) return [];
  return c
    .map((row, i) => {
      if (row == null) return null;
      if (typeof row === 'number') return { x: i, y: row, label: String(i + 1) };
      const y = row.y ?? row.value ?? row.total ?? row.count ?? row.amount ?? row.revenue;
      if (y == null && y !== 0) return null;
      const label = row.label ?? row.month ?? row.name ?? row.date ?? row.period ?? String(i + 1);
      return {
        x: i,
        y: Number(y) || 0,
        label: String(label),
      };
    })
    .filter(Boolean);
}

/**
 * @param {Record<string, unknown>} metrics - credit dashboardMetrics reactive object
 */
/** أعداد الحجوزات من GET /credit/dashboard (الدونات والأعمدة) */
export function creditBookingSegments(metrics) {
  if (!metrics) return [];
  return [
    { label: 'مؤكدة', value: Number(metrics.confirmedBookings) || 0 },
    { label: 'تفاوض', value: Number(metrics.pendingNegotiations) || 0 },
    { label: 'انتظار', value: Number(metrics.waitingBookings) || 0 },
    { label: 'تحتاج مراجعة', value: Number(metrics.requiresReview) || 0 },
    {
      label: 'مرفوضة + عربون',
      value: Number(metrics.rejectedWithDownPayment) || 0,
    },
  ];
}

/**
 * @param {object} d - normalized sales dashboard payload
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

export function accountingProgressRows(m) {
  if (!m) return [];
  return [
    { label: 'وحدات مباعة', value: Number(m.totalUnitsSold) || 0 },
    { label: 'عربون مستلم', value: Number(m.totalDeposits) || 0 },
    { label: 'عربون مسترد', value: Number(m.totalDepositsRefunded) || 0 },
    { label: 'قيمة مشاريع', value: Number(m.totalProjectsValue) || 0 },
    { label: 'قيمة مبيعات', value: Number(m.totalSalesValue) || 0 },
    { label: 'عمولات', value: Number(m.totalCommissions) || 0 },
  ];
}

export function hrProgressRows(m) {
  if (!m) return [];
  return [
    { label: 'موظفون', value: Number(m.totalEmployees) || 0 },
    { label: 'وحدات (إجمالي)', value: Number(m.totalUnits) || 0 },
    { label: 'موظفو مبيعات', value: Number(m.salesEmployeesCount) || 0 },
    { label: 'وحدات مباعة', value: Number(m.soldUnits) || 0 },
    { label: 'متوسط مبيع/موظف', value: Number(m.avgEmployeeSales) || 0 },
  ];
}

export function inventoryProjectSegments(available, totalProjects, ready, notReady) {
  return [
    { label: 'وحدات متاحة', value: Number(available) || 0 },
    { label: 'مشاريع', value: Number(totalProjects) || 0 },
    { label: 'جاهزة', value: Number(ready) || 0 },
    { label: 'غير جاهزة', value: Number(notReady) || 0 },
  ];
}

export function editorProjectSegments(ready, notReady) {
  return [
    { label: 'بعد المونتاج', value: Number(ready) || 0 },
    { label: 'قبل المونتاج', value: Number(notReady) || 0 },
  ];
}

export function marketingCountSegments(metrics) {
  if (!metrics) return [];
  return [
    { label: 'عملاء محتملون', value: Number(metrics.total_leads) || 0 },
    { label: 'حجوزات متوقعة', value: Number(metrics.total_expected_bookings) || 0 },
    { label: 'عربون يومي', value: Number(metrics.daily_deposits_count) || 0 },
  ];
}

/**
 * Map manager task rows for TaskListWidget
 * @param {Array<object>} items
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
 * @param {object} row
 * @param {number} index
 * @returns {{ id: string|number, title: string, subtitle?: string, amount?: number, date?: string }}
 */
export function mapDepositRecordToActivityItem(row, index = 0) {
  if (!row || typeof row !== 'object') {
    return { id: index, title: '—', subtitle: '' };
  }
  const id = row.id ?? row.deposit_id ?? row.reservation_id ?? `dep-${index}`;
  const amountRaw = row.amount ?? row.total_amount ?? row.deposit_amount ?? row.value;
  const amount = amountRaw != null && !Number.isNaN(Number(amountRaw)) ? Number(amountRaw) : undefined;
  const title =
    row.project_name ??
    row.contract_name ??
    row.client_name ??
    (row.reservation_id != null ? `حجز #${row.reservation_id}` : null) ??
    `عربون #${id}`;
  const parts = [row.status, row.bank_reference, row.reference].filter(Boolean);
  const subtitle = parts.length ? parts.join(' · ') : row.notes ?? row.note ?? '';
  const date = row.updated_at ?? row.created_at ?? row.confirmed_at ?? row.due_date;

  return {
    id,
    title: String(title),
    subtitle: subtitle ? String(subtitle) : undefined,
    amount,
    date: date || undefined,
  };
}

/**
 * @param {object} n - normalized notification from notificationService.fetchAll
 */
export function mapNotificationToActivityItem(n, index = 0) {
  if (!n) return { id: index, title: '—' };
  return {
    id: n.id ?? index,
    title: String(n.title || n.message || 'إشعار'),
    subtitle: n.type || n.eventType || undefined,
    date: n.time || n.created_at,
  };
}
