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
        <dt>رابط التصوير</dt>
        <dd :class="{ 'value-null': isNull(photographyLink) }">
          <a v-if="photographyLink && !isNull(photographyLink)" :href="photographyLink" target="_blank" rel="noopener noreferrer" class="link-cell">{{ photographyLink }}</a>
          <span v-else>{{ displayValue(photographyLink) }}</span>
        </dd>
      </div>
      <div class="detail-row">
        <dt>رابط الفيديو</dt>
        <dd :class="{ 'value-null': isNull(videoLink) }">
          <a v-if="videoLink && !isNull(videoLink)" :href="videoLink" target="_blank" rel="noopener noreferrer" class="link-cell">{{ videoLink }}</a>
          <span v-else>{{ displayValue(videoLink) }}</span>
        </dd>
      </div>
      <div class="detail-row">
        <dt>الوصف</dt>
        <dd :class="{ 'value-null': isNull(description) }">{{ displayValue(description) }}</dd>
      </div>
      <div class="detail-row">
        <dt>الوحدات المتاحة</dt>
        <dd :class="{ 'value-null': isNull(availableUnits) }">{{ displayValue(availableUnits) }}</dd>
      </div>
    </dl>
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
      <!-- Manager: accept/reject only when project has links and decision not yet taken -->
      <template v-else>
        <template v-if="hasLinks && !montageFinal">
          <button type="button" class="btn-card btn-approve" @click="$emit('approve', project)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            قبول
          </button>
          <button type="button" class="btn-card btn-reject" @click="$emit('reject', project)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            رفض
          </button>
        </template>
        <span v-else-if="hasLinks && montageFinal" class="done-label">{{ finalDecisionLabel }}</span>
        <div v-else class="manager-pending-block">
          <span class="pending-label">قيد المراجعة</span>
          <button type="button" class="btn-card btn-add-links" @click="$emit('add-links', project)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            اضافه الروابط
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { isMontageDecisionFinal } from '@/utils/montageApproval';

const props = defineProps({
  project: { type: Object, required: true },
  statusLabel: { type: String, default: '' },
  statusClass: { type: String, default: 'status-active' },
  /** When true, show accept/reject buttons; when false, show single "اضافه الروابط" button */
  isManager: { type: Boolean, default: false },
  /** Optional: when true, manager sees accept/reject; when false, manager sees "قيد المراجعة". If not passed, derived from project montage fields. */
  hasLinks: { type: Boolean, default: null },
});

defineEmits(['add-links', 'see-more', 'approve', 'reject']);

const advertiserNumber = computed(() => {
  const p = props.project;
  const second = p?.second_party_data;
  return second?.advertiser_section_url ?? p?.advertiser_number ?? p?.publisher_number ?? p?.publisherNumber;
});
const photographyLink = computed(() => {
  const p = props.project;
  const photo = p?.photography_department;
  return photo?.image_url ?? p?.photography_link ?? p?.photography_url ?? p?.photographyLink ?? p?.image_url;
});
const videoLink = computed(() => {
  const p = props.project;
  const photo = p?.photography_department;
  const mont = p?.montage_department;
  return (
    photo?.video_url ??
    mont?.video_url ??
    p?.montage_video_url ??
    p?.video_url ??
    p?.montage_video_link ??
    ''
  );
});
const description = computed(() => {
  const p = props.project;
  const photo = p?.photography_department;
  return photo?.description ?? p?.description ?? p?.desc;
});
const availableUnits = computed(() => {
  const p = props.project;
  const units = p?.contract_units ?? p?.units;
  if (Array.isArray(units)) return units.length;
  return p?.available_units ?? p?.availableUnits ?? p?.units_count ?? p?.unitsCount;
});

/** True if project has montage links for manager to approve/reject; use prop if provided, else derive from project */
const hasLinks = computed(() => {
  if (props.hasLinks === true || props.hasLinks === false) return props.hasLinks;
  const p = props.project;
  const photo = p?.photography_department;
  const image = photo?.image_url ?? p?.montage_image_url ?? p?.image_url ?? p?.montage_image_link;
  const video = photo?.video_url ?? p?.montage_video_url ?? p?.video_url ?? p?.montage_video_link;
  const desc = photo?.description ?? p?.montage_description ?? p?.description;
  return !!(image && String(image).trim()) || !!(video && String(video).trim()) || !!(desc && String(desc).trim());
});

/** After manager accepts/rejects, hide accept/reject buttons */
const montageFinal = computed(() =>
  isMontageDecisionFinal(props.project, props.statusLabel || '')
);

/** نص أسفل البطاقة بعد القرار: قبول أو رفض */
const finalDecisionLabel = computed(() => {
  const p = props.project;
  const s = String(p.montage_status ?? p.approval_status ?? '').toLowerCase();
  if (s === 'rejected' || s === 'refused' || props.statusLabel === 'مرفوض') return 'تم الرفض';
  return 'تم القبول';
});

function isNull(v) {
  return v === null || v === undefined || v === '';
}

function displayValue(v) {
  if (v === null || v === undefined || v === '') return 'null';
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
</style>
