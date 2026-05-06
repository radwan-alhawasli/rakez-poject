<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="head-left">
          <div class="title">تفاصيل تنبيه البحث</div>
          <div class="subtitle">
            <span v-if="idText" class="mono">#{{ idText }}</span>
          </div>
        </div>
        <div class="head-actions">
          <button class="btn-secondary" type="button" :disabled="loading" @click="$emit('edit')">تعديل</button>
          <button class="btn-danger" type="button" :disabled="loading" @click="$emit('cancel')">إلغاء</button>
          <button class="btn-close" type="button" @click="$emit('close')">&times;</button>
        </div>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading-wrap">
          <span class="spinner"></span>
          <span>جاري تحميل التفاصيل...</span>
        </div>

        <div v-else-if="error" class="state state-error">
          <div class="state-title">تعذر التحميل</div>
          <div class="state-text">{{ error }}</div>
        </div>

        <template v-else>
          <div v-if="!alert" class="state">
            <div class="state-title">غير موجود</div>
            <div class="state-text">التنبيه غير موجود أو تم حذفه.</div>
          </div>

          <template v-else>
            <div class="grid">
              <div class="card">
                <div class="card-title">بيانات العميل</div>
                <div class="kv">
                  <div class="k">الاسم</div>
                  <div class="v">{{ alert.client_name || '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">الجوال</div>
                  <div class="v mono">{{ alert.client_mobile || '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">البريد</div>
                  <div class="v mono">{{ alert.client_email || '—' }}</div>
                </div>
                <div class="kv">
                  <div class="k">SMS</div>
                  <div class="v">
                    <span :class="['pill', smsOptIn ? 'pill-on' : 'pill-off']">
                      {{ smsOptIn ? 'مفعل' : 'غير مفعل' }}
                    </span>
                    <span v-if="smsLocale" class="mono muted">• {{ smsLocale }}</span>
                    <div class="hint">
                      SMS اختياري ولا يتم إرسال رسالة عند إنشاء الطلب. النظام الداخلي هو مصدر الحقيقة.
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-title">الحالة</div>
                <div class="status-row">
                  <span :class="['status-badge', statusClass(alert.status)]">{{ statusAr(alert.status) }}</span>
                  <span class="mono muted">{{ alert.status || '' }}</span>
                </div>
                <div class="kv">
                  <div class="k">تاريخ الإنشاء</div>
                  <div class="v mono">{{ fmtDate(alert.created_at) }}</div>
                </div>
                <div class="kv">
                  <div class="k">ينتهي في</div>
                  <div class="v mono">{{ fmtDate(alert.expires_at) }}</div>
                </div>
                <div class="kv">
                  <div class="k">last_notification</div>
                  <div class="v">
                    <span class="mono">{{ alert.last_notification || '—' }}</span>
                    <div class="hint">معلومة تشغيلية فقط وليست نجاحًا/فشلًا للتنبيه.</div>
                  </div>
                </div>
              </div>

              <div class="card full">
                <div class="card-title">معايير البحث</div>
                <div class="chips">
                  <template v-if="criteriaChips(alert).length">
                    <span v-for="c in criteriaChips(alert)" :key="c" class="chip">{{ c }}</span>
                  </template>
                  <span v-else class="chip chip-muted">لا توجد معايير محددة</span>
                </div>
              </div>

              <div class="card full">
                <div class="card-title">آخر وحدة مطابقة</div>
                <div class="state-text">{{ matchedUnitText(alert) }}</div>
                <div v-if="String(alert.status || '').toLowerCase() === 'matched'" class="hint">
                  توفرت وحدة مطابقة لهذا الطلب.
                </div>
              </div>

              <div class="card full">
                <div class="card-title">سجل الإشعارات (داخلي / SMS)</div>
                <div v-if="deliveries.length === 0" class="state-text muted">لا يوجد</div>
                <div v-else class="deliveries">
                  <div v-for="(d, idx) in deliveries" :key="idx" class="delivery-row">
                    <div class="delivery-main">
                      <span class="pill pill-type">{{ deliveryTypeLabel(d.type ?? d.channel ?? d.delivery_type) }}</span>
                      <span class="pill" :class="deliveryStatusClass(d.status ?? d.state ?? d.delivery_status)">
                        {{ deliveryStatusLabel(d.status ?? d.state ?? d.delivery_status) }}
                      </span>
                      <span class="mono muted">{{ fmtDate(d.created_at ?? d.sent_at ?? d.updated_at) }}</span>
                    </div>
                    <div class="delivery-sub mono muted">
                      <span v-if="d.to">to: {{ d.to }}</span>
                      <span v-if="d.provider"> • provider: {{ d.provider }}</span>
                    </div>
                    <div v-if="skipReasonLabel(d.skip_reason ?? d.reason)" class="delivery-skip">
                      <span class="pill pill-skip">تم التخطي</span>
                      <span class="muted">{{ skipReasonLabel(d.skip_reason ?? d.reason) }}</span>
                    </div>
                    <div v-if="shouldShowFailedHint(d)" class="delivery-failed muted">
                      فشل إرسال الرسالة. (لا يتم عرض تفاصيل تقنية)
                    </div>
                  </div>
                  <div class="hint">
                    الإشعار الداخلي هو مصدر الحقيقة. SMS اختياري ومعلومة فرعية.
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  alert: { type: Object, default: null },
});

defineEmits(['close', 'edit', 'cancel']);

const idText = computed(() => {
  const a = props.alert;
  if (!a) return '';
  return String(a.id ?? a.alert_id ?? a.uuid ?? '');
});

const deliveries = computed(() => {
  const a = props.alert;
  const d = a?.deliveries;
  return Array.isArray(d) ? d : [];
});

const smsOptIn = computed(() => Boolean(props.alert?.client_sms_opt_in));
const smsLocale = computed(() => (props.alert?.client_sms_locale ? String(props.alert.client_sms_locale) : ''));

function deliveryTypeLabel(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'system_notification' || t === 'internal' || t === 'in_app') return 'إشعار داخلي';
  if (t === 'sms' || t.includes('twilio')) return 'رسالة SMS';
  return type ? String(type) : '—';
}

function deliveryStatusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'pending' || s === 'processing') return 'قيد المعالجة';
  if (s === 'sent' || s === 'delivered') return 'تم الإرسال';
  if (s === 'skipped') return 'تم التخطي';
  if (s === 'failed' || s === 'error') return 'فشل';
  return status ? String(status) : '—';
}

function deliveryStatusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'sent' || s === 'delivered') return 'pill-sent';
  if (s === 'pending' || s === 'processing') return 'pill-pending';
  if (s === 'skipped') return 'pill-skipped';
  if (s === 'failed' || s === 'error') return 'pill-failed';
  return '';
}

function skipReasonLabel(reason) {
  const r = String(reason || '').toLowerCase();
  if (!r) return '';
  const map = {
    sms_disabled: 'SMS غير مفعّل حالياً',
    twilio_not_configured: 'خدمة SMS غير متوفرة',
    sms_opt_in_missing: 'العميل لم يوافق على استقبال SMS',
    invalid_phone: 'رقم الهاتف غير صحيح',
    outside_sms_sending_window: 'خارج نافذة الإرسال المسموح بها',
    sms_throttled: 'تم إرسال SMS مؤخراً لهذا التنبيه',
    unit_not_available: 'الوحدة لم تعد متاحة عند محاولة الإرسال',
    alert_deleted: 'التنبيه تم حذفه',
    alert_cancelled: 'التنبيه ملغى',
    alert_expired: 'التنبيه منتهي الصلاحية',
  };
  return map[r] ?? String(reason);
}

function shouldShowFailedHint(d) {
  const s = String(d?.status ?? d?.state ?? d?.delivery_status ?? '').toLowerCase();
  return s === 'failed' || s === 'error';
}

function statusAr(status) {
  const map = {
    active: 'نشط',
    paused: 'موقوف مؤقتًا',
    matched: 'تمت المطابقة',
    cancelled: 'ملغى',
  };
  return map[String(status || '').toLowerCase()] ?? (status || '—');
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return 'is-active';
  if (s === 'paused') return 'is-paused';
  if (s === 'matched') return 'is-matched';
  if (s === 'cancelled') return 'is-cancelled';
  return 'is-unknown';
}

function fmtDate(v) {
  if (!v) return '—';
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(v);
  }
}

function criteriaChips(a) {
  const src = a?.criteria || a?.search_criteria || a?.filters || a?.data || a || {};
  const fields = [
    ['query_text', 'نص البحث'],
    ['city_id', 'المدينة'],
    ['district_id', 'الحي'],
    ['project_id', 'المشروع'],
    ['unit_type', 'نوع الوحدة'],
    ['floor', 'الطابق'],
    ['min_price', 'السعر من'],
    ['max_price', 'السعر إلى'],
    ['min_area', 'المساحة من'],
    ['max_area', 'المساحة إلى'],
    ['min_bedrooms', 'الغرف من'],
    ['max_bedrooms', 'الغرف إلى'],
  ];
  /** @type {string[]} */
  const out = [];
  for (const [key, label] of fields) {
    const val = src?.[key];
    if (val === undefined || val === null || String(val).trim() === '') continue;
    out.push(`${label}: ${String(val)}`);
  }
  return out;
}

function matchedUnitText(a) {
  const u = a?.last_matched_unit || a?.lastMatchedUnit || a?.matched_unit;
  if (!u) return 'لا يوجد';
  const unitNo = u?.unit_number ?? u?.number ?? u?.id;
  const project = u?.project?.name ?? u?.project_name;
  const city = u?.project?.city ?? u?.city;
  const price = u?.price != null ? `${Number(u.price).toLocaleString('en-US')}` : '';
  const parts = [
    unitNo ? `وحدة ${unitNo}` : 'وحدة',
    project ? `• ${project}` : '',
    city ? `• ${city}` : '',
    price ? `• ${price}` : '',
  ].filter(Boolean);
  return parts.join(' ');
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(8px);
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  direction: rtl;
}

.modal {
  width: 100%;
  max-width: 980px;
  max-height: 86vh;
  overflow: hidden;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(30, 58, 95, 0.06);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.title {
  font-weight: 1000;
  color: rgba(30, 58, 95, 0.98);
}

.subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(51, 65, 85, 0.85);
}

.head-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-secondary {
  background: #fff;
  color: rgba(30, 58, 95, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.55);
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #b91c1c;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 1000;
  cursor: pointer;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.55);
  background: #fff;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-body {
  padding: 14px;
  overflow: auto;
}

.loading-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
  color: rgba(30, 58, 95, 0.9);
  font-weight: 800;
  padding: 18px 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid rgba(148, 163, 184, 0.35);
  border-top-color: rgba(30, 58, 95, 0.9);
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
}

.card {
  grid-column: span 6;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  padding: 14px;
  background: #fff;
}

.card.full {
  grid-column: span 12;
}

.card-title {
  font-weight: 1000;
  color: rgba(30, 58, 95, 0.98);
  margin-bottom: 10px;
}

.kv {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(148, 163, 184, 0.35);
}

.kv:last-child {
  border-bottom: none;
}

.k {
  font-weight: 900;
  color: rgba(30, 58, 95, 0.95);
  font-size: 12px;
}

.v {
  font-weight: 750;
  color: rgba(51, 65, 85, 0.95);
  font-size: 12px;
}

.mono {
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.muted {
  opacity: 0.8;
}

.hint {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.75;
  line-height: 1.6;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.35);
  font-weight: 900;
  font-size: 11px;
}

.pill-on {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.25);
  color: #047857;
}

.pill-off {
  background: rgba(148, 163, 184, 0.18);
}

.pill-type {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.22);
  color: #1d4ed8;
}

.pill-pending {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.22);
  color: #92400e;
}

.pill-sent {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.22);
  color: #047857;
}

.pill-skipped,
.pill-skip {
  background: rgba(148, 163, 184, 0.16);
  border-color: rgba(148, 163, 184, 0.22);
  color: #334155;
}

.pill-failed {
  background: rgba(239, 68, 68, 0.14);
  border-color: rgba(239, 68, 68, 0.22);
  color: #b91c1c;
}

.delivery-skip,
.delivery-failed {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.status-badge {
  padding: 7px 10px;
  border-radius: 999px;
  font-weight: 1000;
  font-size: 12px;
  border: 1px solid transparent;
}

.status-badge.is-active {
  background: rgba(16, 185, 129, 0.14);
  color: #047857;
  border-color: rgba(16, 185, 129, 0.22);
}

.status-badge.is-paused {
  background: rgba(245, 158, 11, 0.16);
  color: #92400e;
  border-color: rgba(245, 158, 11, 0.22);
}

.status-badge.is-matched {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.22);
}

.status-badge.is-cancelled {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.2);
}

.status-badge.is-unknown {
  background: rgba(148, 163, 184, 0.18);
  color: rgba(30, 41, 59, 0.9);
  border-color: rgba(148, 163, 184, 0.3);
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(30, 58, 95, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.32);
  font-size: 12px;
  font-weight: 800;
  color: rgba(30, 58, 95, 0.95);
}

.chip-muted {
  opacity: 0.8;
}

.deliveries {
  display: grid;
  gap: 10px;
}

.delivery-row {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  padding: 10px;
  background: rgba(248, 250, 252, 0.65);
}

.delivery-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.delivery-sub {
  margin-top: 6px;
  font-size: 11px;
}

.state {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #fff;
  padding: 16px;
}

.state-error {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(254, 242, 242, 0.65);
}

.state-title {
  font-weight: 1000;
  color: rgba(30, 58, 95, 0.98);
  margin-bottom: 6px;
}

.state-text {
  color: rgba(51, 65, 85, 0.95);
  font-weight: 750;
  font-size: 13px;
}

@media (max-width: 860px) {
  .card {
    grid-column: span 12;
  }
  .head-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
