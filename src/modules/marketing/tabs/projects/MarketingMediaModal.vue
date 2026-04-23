<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content luxury-modal animate-scale-in media-modal">
      <div class="modal-header">
        <h3 class="modal-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22" style="margin-left: 8px; vertical-align: middle; color: #059669">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          صور وفيديوهات المشروع:
          {{ project?.project_name || project?.name || '' }}
        </h3>
        <button type="button" class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body media-modal-body">
        <!-- حالة فارغة -->
        <div v-if="!mediaItems.length" class="media-empty-state">
          <div class="media-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p class="media-empty-title">لا توجد صور أو فيديوهات مرفقة</p>
          <p class="media-empty-hint">سيظهر هنا محتوى التصوير والمونتاج عند إضافته من قِبل الفريق المختص.</p>
        </div>

        <template v-else>
          <!-- تبويبات الأقسام -->
          <div class="media-dept-tabs" role="tablist">
            <button
              v-for="dept in departments"
              :key="dept.key"
              :class="['media-dept-tab', { active: activeDept === dept.key }]"
              role="tab"
              :aria-selected="activeDept === dept.key"
              @click="activeDept = dept.key"
            >
              <span class="media-dept-count">{{ dept.count }}</span>
              {{ dept.label }}
            </button>
          </div>

          <!-- شبكة الروابط -->
          <div class="media-links-grid" role="tabpanel">
            <a
              v-for="item in filteredItems"
              :key="item.id"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="media-link-card"
              :class="item.type === 'video' ? 'media-link-card--video' : 'media-link-card--image'"
            >
              <!-- أيقونة النوع -->
              <span class="media-link-icon" :class="item.type === 'video' ? 'media-link-icon--blue' : 'media-link-icon--green'" aria-hidden="true">
                <svg v-if="item.type === 'video'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </span>

              <!-- معلومات -->
              <span class="media-link-info">
                <span class="media-link-label">
                  {{ item.type === 'video' ? 'فيديو' : 'صورة' }}
                  <span class="media-dept-badge" :class="`dept-${item.department}`">
                    {{ deptLabel(item.department) }}
                  </span>
                </span>
                <span class="media-link-url">{{ shortenUrl(item.url) }}</span>
                <span class="media-link-date">{{ formatMediaDate(item.created_at) }}</span>
              </span>
              <span class="media-link-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <span v-if="mediaItems.length" class="media-total-count">
          الإجمالي: {{ mediaItems.length }} عنصر
        </span>
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  project: { type: Object, default: null },
});

defineEmits(['close']);

/** قراءة project_media مباشرةً من استجابة الـ API */
const mediaItems = computed(() => {
  const media = props.project?.project_media;
  if (!Array.isArray(media) || !media.length) return [];
  return media.filter(m => m?.url);
});

const activeDept = ref('all');

const deptLabel = dept => {
  const map = {
    photography: 'تصوير',
    montage:     'مونتاج',
    editing:     'تحرير',
    design:      'تصميم',
    all:         'الكل',
  };
  return map[String(dept || '').toLowerCase()] || dept || '—';
};

const departments = computed(() => {
  const deptCounts = {};
  mediaItems.value.forEach(m => {
    const d = String(m.department || 'other').toLowerCase();
    deptCounts[d] = (deptCounts[d] || 0) + 1;
  });

  const tabs = [
    { key: 'all', label: 'الكل', count: mediaItems.value.length },
  ];

  Object.entries(deptCounts).forEach(([d, count]) => {
    tabs.push({ key: d, label: deptLabel(d), count });
  });

  return tabs;
});

const filteredItems = computed(() => {
  if (activeDept.value === 'all') return mediaItems.value;
  return mediaItems.value.filter(m => String(m.department || '').toLowerCase() === activeDept.value);
});

const shortenUrl = url => {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 28 ? '...' + u.pathname.slice(-22) : u.pathname;
    return u.hostname + path;
  } catch {
    return url.length > 48 ? url.slice(0, 45) + '...' : url;
  }
};

const formatMediaDate = dateStr => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};
</script>

<style scoped>
.media-modal {
  max-width: min(700px, calc(100vw - 32px));
  direction: rtl;
}

.media-modal-body {
  min-height: 180px;
  max-height: min(65vh, 560px);
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.media-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  flex: 1;
}

.media-empty-icon { color: #cbd5e0; margin-bottom: 16px; }

.media-empty-title {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
}

.media-empty-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #94a3b8;
  max-width: 320px;
  line-height: 1.55;
}

/* تبويبات */
.media-dept-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 20px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: #f8fafc;
}

.media-dept-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px 10px 0 0;
  border-bottom: none;
  background: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  bottom: -1px;
}

.media-dept-tab:hover { background: #f1f5f9; color: #1e3a5f; }

.media-dept-tab.active {
  color: #1e3a5f;
  font-weight: 700;
  border-color: rgba(226, 232, 240, 0.9);
  border-bottom-color: #fff;
  box-shadow: 0 -3px 0 #2563eb inset;
}

.media-dept-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 700;
}

.media-dept-tab.active .media-dept-count {
  background: #2563eb;
  color: #fff;
}

/* شبكة الروابط */
.media-links-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px 20px;
  flex: 1;
}

.media-link-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  background: linear-gradient(145deg, #fff 0%, rgba(248, 250, 252, 0.8) 100%);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.media-link-card:hover {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(239, 246, 255, 0.7);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.1);
}

.media-link-card--video:hover {
  border-color: rgba(79, 70, 229, 0.3);
  background: rgba(238, 242, 255, 0.7);
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.1);
}

.media-link-icon {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.media-link-icon--green { background: rgba(5, 150, 105, 0.1); color: #059669; }
.media-link-icon--blue  { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }

.media-link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}

.media-link-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  flex-wrap: wrap;
}

.media-dept-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
  white-space: nowrap;
}

.dept-photography { background: rgba(5, 150, 105, 0.1);  color: #065f46; border: 1px solid rgba(5, 150, 105, 0.2); }
.dept-montage     { background: rgba(79, 70, 229, 0.1);  color: #3730a3; border: 1px solid rgba(79, 70, 229, 0.2); }
.dept-editing     { background: rgba(234, 88, 12, 0.1);  color: #9a3412; border: 1px solid rgba(234, 88, 12, 0.2); }
.dept-design      { background: rgba(217, 70, 239, 0.1); color: #86198f; border: 1px solid rgba(217, 70, 239, 0.2); }

.media-link-url {
  font-size: 0.78rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ltr;
  text-align: left;
}

.media-link-date {
  font-size: 0.73rem;
  color: #94a3b8;
}

.media-link-arrow {
  font-size: 1.1rem;
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 0.2s;
}

.media-link-card:hover .media-link-arrow { color: #2563eb; }
.media-link-card--video:hover .media-link-arrow { color: #4f46e5; }

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.media-total-count {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}
</style>
