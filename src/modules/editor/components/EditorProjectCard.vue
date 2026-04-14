<template>
  <div class="editor-project-card">
    <div class="card-header">
      <span v-if="statusLabel" class="status-badge" :class="statusClass">{{ statusLabel }}</span>
      <h3 class="card-title-main">{{ project.name || project.project_name || project.title || project.project_title || project.contract_number || project.contract_id || '—' }}</h3>
    </div>
    <dl class="card-details">
      <div class="detail-row">
        <dt>رقم المعلن</dt>
        <dd :class="{ 'value-null': isNull(advertiserNumber) }">{{ displayValue(advertiserNumber) }}</dd>
      </div>
      <div class="detail-row">
        <dt>{{ variant === 'before' ? 'رابط التصوير (الأصل)' : 'رابط الصور (بعد المونتاج)' }}</dt>
        <dd :class="{ 'value-null': isNull(photographyLink) }">
          <a v-if="photographyLink && !isNull(photographyLink)" :href="photographyLink" target="_blank" rel="noopener noreferrer" class="link-cell">{{ linkLabel(photographyLink) }}</a>
          <span v-else>{{ displayValue(photographyLink) }}</span>
        </dd>
      </div>
      <div class="detail-row">
        <dt>{{ variant === 'before' ? 'رابط الفيديو (الأصل)' : 'رابط الفيديو (بعد المونتاج)' }}</dt>
        <dd :class="{ 'value-null': isNull(videoLink) }">
          <a v-if="videoLink && !isNull(videoLink)" :href="videoLink" target="_blank" rel="noopener noreferrer" class="link-cell">{{ linkLabel(videoLink) }}</a>
          <span v-else>{{ displayValue(videoLink) }}</span>
        </dd>
      </div>
      <div class="detail-row">
        <dt>{{ variant === 'before' ? 'الوصف (الأصل)' : 'الوصف (بعد المونتاج)' }}</dt>
        <dd :class="{ 'value-null': isNull(description) }">{{ descriptionLabel }}</dd>
      </div>
      <div v-if="variant === 'before' && photographyStatus" class="detail-row">
        <dt>حالة التصوير</dt>
        <dd>
          <span
            class="status-badge"
            :class="photographyStatus.class"
          >{{ photographyStatus.label }}</span>
        </dd>
      </div>
      <div class="detail-row">
        <dt>الوحدات المتاحة</dt>
        <dd :class="{ 'value-null': isNull(availableUnits) }">{{ displayValue(availableUnits) }}</dd>
      </div>
    </dl>
    <div v-if="!isManager && montageRejectionComment" class="card-manager-note">
      <p class="manager-note-label">ملاحظة المدير (الرفض)</p>
      <p class="manager-note-text">{{ montageRejectionComment }}</p>
    </div>
    <div class="card-actions">
      <!-- Editor: See More + Add Links -->
      <template v-if="!isManager">
        <button type="button" class="btn-card btn-see-more" @click="$emit('see-more', project)">
          عرض المزيد
        </button>
        <button type="button" class="btn-card btn-add-links" @click="$emit('add-links', project)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          اضافه الروابط
        </button>
      </template>
      <!-- Manager: إضافة الروابط أولاً، ثم قبول/رفض تحتها عند توفر الروابط -->
      <template v-else>
        <div class="manager-actions-stack">
          <button type="button" class="btn-card btn-add-links" @click="$emit('add-links', project)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            اضافه الروابط
          </button>
          <template v-if="hasLinks === true && !montageFinal">
            <div class="manager-decision-row">
              <button type="button" class="btn-card btn-approve" @click="$emit('approve', project)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                قبول
              </button>
              <button type="button" class="btn-card btn-reject" @click="$emit('reject', project)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                رفض
              </button>
            </div>
          </template>
          <div v-else-if="hasLinks === true && montageFinal" class="done-block">
            <span class="done-label">{{ finalDecisionLabel }}</span>
            <button
              v-if="compactLinks"
              type="button"
              class="btn-card btn-see-more"
              @click="$emit('see-more', project)"
            >
              عرض المزيد
            </button>
          </div>
          <span v-else-if="hasLinks === false" class="pending-label">قيد المراجعة</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { isMontageDecisionFinal } from '@/utils/montageApproval';
import {
  getPhotographyTripletFromContract,
  getMontageOutputTripletFromContract,
  contractHasCompleteMontageTriplet,
  getPhotographyApprovalSummary,
  pickTrim,
} from '@/utils/editorMontageCard';

const props = defineProps({
  project: { type: Object, required: true },
  statusLabel: { type: String, default: '' },
  statusClass: { type: String, default: 'status-active' },
  /** When true, show accept/reject buttons; when false, show single "اضافه الروابط" button */
  isManager: { type: Boolean, default: false },
  /** Optional: when true, manager sees accept/reject; when false, manager sees "قيد المراجعة". If not passed, derived from project montage fields. */
  hasLinks: { type: Boolean, default: null },
  /** After-montage tab: shorten links on card; use "عرض المزيد" for full text + rejection in modal */
  compactLinks: { type: Boolean, default: false },
  /** before = بيانات التصوير الأصلية؛ after = مخرجات المونتاج */
  variant: {
    type: String,
    default: 'after',
    validator: v => v === 'before' || v === 'after',
  },
});

defineEmits(['add-links', 'see-more', 'approve', 'reject']);

const displayTriplet = computed(() =>
  props.variant === 'before'
    ? getPhotographyTripletFromContract(props.project)
    : getMontageOutputTripletFromContract(props.project)
);

const photographyStatus = computed(() => {
  if (props.variant !== 'before') return null;
  return getPhotographyApprovalSummary(props.project);
});

const advertiserNumber = computed(() => {
  const p = props.project;
  const second =
    p?.second_party_data && typeof p.second_party_data === 'object' ? p.second_party_data : {};
  return pickTrim(
    second.advertiser_number ??
      second.publisher_number ??
      second.advertiser_section_url ??
      p?.advertiser_number ??
      p?.publisher_number ??
      p?.publisherNumber ??
      p?.advertiser_section_url
  );
});
const photographyLink = computed(() => displayTriplet.value.image);
const videoLink = computed(() => displayTriplet.value.video);
const description = computed(() => displayTriplet.value.description);
const availableUnits = computed(() => {
  const p = props.project;
  const units = p?.contract_units ?? p?.units;
  if (Array.isArray(units)) return units.length;
  return p?.available_units ?? p?.availableUnits ?? p?.units_count ?? p?.unitsCount;
});

/** من الأب إن وُجد؛ وإلا يُشتق من العقد (مكتمل الثلاثي) */
const hasLinks = computed(() => {
  if (props.hasLinks === true || props.hasLinks === false) return props.hasLinks;
  return contractHasCompleteMontageTriplet(props.project);
});

/** Rejection comment from manager — visible to all editors */
function isRejectedState(p) {
  if (!p) return false;
  const s = String(p.montage_status ?? p.approval_status ?? '').toLowerCase();
  const md = p.montage_department;
  const ap = md?.approved;
  const stRaw = md?.status != null ? String(md.status) : '';
  const slo = stRaw.toLowerCase();
  return (
    s === 'rejected' ||
    s === 'refused' ||
    ap === '0' ||
    ap === 0 ||
    ap === false ||
    stRaw.includes('مرفوض') ||
    stRaw.includes('رفض') ||
    slo.includes('reject') ||
    slo.includes('refus')
  );
}

const montageRejectionComment = computed(() => {
  if (props.isManager) return '';
  const p = props.project;
  if (!isRejectedState(p)) return '';
  const md = p.montage_department;
  const text = md?.comment ?? md?.rejection_reason ?? p.montage_rejection_reason;
  return text && String(text).trim() ? String(text).trim() : '';
});

/** After manager accepts/rejects, hide accept/reject buttons */
const montageFinal = computed(() =>
  isMontageDecisionFinal(props.project, props.statusLabel || '')
);

/** نص أسفل البطاقة بعد القرار: قبول أو رفض */
const finalDecisionLabel = computed(() => {
  const p = props.project;
  if (isRejectedState(p) || props.statusLabel === 'مرفوض') return 'تم الرفض';
  return 'تم القبول';
});

const LINK_COMPACT = 44;
function truncateUrlLocal(url, max = LINK_COMPACT) {
  if (url == null || url === '') return '';
  const s = String(url);
  return s.length <= max ? s : `${s.slice(0, max)}…`;
}

function linkLabel(url) {
  if (isNull(url)) return displayValue(url);
  return props.compactLinks ? truncateUrlLocal(url) : String(url);
}

const descriptionLabel = computed(() => {
  const v = description.value;
  if (isNull(v)) return displayValue(v);
  const s = String(v);
  if (!props.compactLinks || s.length <= 80) return s;
  return `${s.slice(0, 80)}…`;
});

function isNull(v) {
  if (v === null || v === undefined || v === '') return true;
  const s = String(v).trim();
  if (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return true;
  return false;
}

function displayValue(v) {
  if (isNull(v)) return '—';
  return String(v);
}
</script>

<style scoped>
.editor-project-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.editor-project-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.status-active,
.status-approved { background: #d1fae5; color: #065f46; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.card-title-main {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
}
.card-details {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}
.detail-row dt {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}
.detail-row dd {
  margin: 0;
  font-size: 0.9rem;
  color: #1e293b;
  text-align: left;
}
.detail-row dd.value-null {
  color: #dc2626;
  font-weight: 500;
}
.link-cell { color: #1e3a5f; word-break: break-all; text-decoration: none; }
.link-cell:hover { text-decoration: underline; }
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}
.done-label {
  font-size: 0.85rem;
  color: #64748b;
  padding: 0.5rem 0.75rem;
  text-align: center;
  width: 100%;
}
.done-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  align-items: stretch;
}
.done-block .btn-see-more {
  flex: none;
  width: 100%;
}
.manager-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  align-items: stretch;
}
.manager-actions-stack .btn-add-links {
  width: 100%;
  flex: none;
}
.manager-decision-row {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}
.manager-decision-row .btn-card {
  flex: 1;
}
.manager-pending-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  width: 100%;
}
.manager-pending-block .pending-label {
  text-align: center;
  width: 100%;
}
.manager-pending-block .btn-add-links {
  flex: none;
  width: 100%;
}
.btn-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #475569;
  cursor: pointer;
}
.btn-card:hover {
  background: #e2e8f0;
  color: #1e293b;
}
.btn-card svg { flex-shrink: 0; }
.btn-see-more { flex: 0 0 auto; }
.btn-add-links { flex: 1; min-width: 0; }
.btn-approve { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
.btn-approve:hover { background: #152d4a; border-color: #152d4a; color: #fff; }
.btn-reject { background: #fff; color: #1e3a5f; border-color: #1e3a5f; }
.btn-reject:hover { background: #f1f5f9; color: #152d4a; border-color: #152d4a; }
.pending-label {
  width: 100%;
  text-align: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.card-manager-note {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.manager-note-label {
  margin: 0 0 0.35rem 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #991b1b;
}
.manager-note-text {
  margin: 0;
  font-size: 0.88rem;
  color: #1e293b;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
