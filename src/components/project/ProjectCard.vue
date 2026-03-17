<template>
  <div
    class="project-card rakez-card"
    :class="{ 'card-no-image': !project.hasImage }"
  >
    <div class="card-image-wrapper">
      <!-- شريط علوي ثابت: موقع + قائمة — بدون تداخل مع الصورة -->
      <div class="card-image-top-bar">
        <span class="location-tag">{{ project.location }}</span>
        <div class="menu-container" @click.stop="$emit('toggle-menu', project.id)">
          <button class="menu-btn" type="button" aria-label="القائمة">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
      <!-- صف القائمة داخل البطاقة — يظهر عند فتح القائمة دون تداخل -->
      <div v-if="activeMenuId === project.id" class="card-dropdown-row">
        <div class="dropdown-menu dropdown-menu-inline" dir="rtl">
          <div class="menu-item" @click.stop="$emit('edit-project', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> تعديل المشروع</div>
          <div class="menu-item" @click.stop="$emit('assign-team', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> تعيين فريق</div>
          <div class="menu-item" @click.stop="$emit('view-teams', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> عرض الفرق المسؤوله</div>
          <div class="menu-item" @click.stop="$emit('remove-team', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="8"></line><line x1="20.5" y1="11" x2="20.5" y2="5"></line></svg> إزالة فريق</div>
          <div class="menu-item" @click.stop="$emit('archive-project', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> أرشفة المشروع</div>
          <div class="menu-item" @click.stop="$emit('mark-complete', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> تحديد كمكتمل</div>
          <div class="menu-item" @click.stop="$emit('download-contract', project)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> تحميل العقد</div>
        </div>
      </div>
      <div v-if="activeMenuId === project.id" class="menu-backdrop" @click.stop="$emit('close-menu')"></div>
      <!-- منطقة عرض الصورة من الرابط المدخل — بدون تداخل -->
      <div class="card-image" :class="{ 'card-image-placeholder': !project.hasImage }">
        <span v-if="project.hasImage && project.imagePending" class="card-image-pending-badge">قيد المراجعة</span>
        <template v-if="imageUrl">
          <img
            :src="imageUrl"
            :alt="project.name || 'مشروع'"
            width="320"
            height="200"
            loading="lazy"
            @error="onImageError"
          />
        </template>
        <template v-else>
          <div class="placeholder-block">
            <span class="placeholder-name">{{ project.name }}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="card-title-block">
      <h3 class="card-title-main">{{ project.name }}</h3>
      <p class="card-title-type">{{ project.propertyTypeLabel }}</p>
    </div>

    <div class="card-content">
      <div class="progress-row rakez-progress" title="متتبع الاتفاقية">
        <span class="progress-label">متتبع الاتفاقية</span>
        <span class="progress-value">{{ project.contractRemainingLabel ?? '—' }}</span>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :class="'contract-fill-' + (project.contractColor || 'gray')"
            :style="{ width: Math.min(100, project.contractDurationPercent ?? 0) + '%' }"
          ></div>
        </div>
      </div>
      <div class="progress-row rakez-progress" title="تقدم الإعداد">
        <span class="progress-label">تقدم الإعداد</span>
        <span class="progress-value">{{ project.setupProgress ?? 0 }}%</span>
        <div class="progress-bar">
          <div class="progress-fill progress-fill-green" :style="{ width: Math.min(100, project.setupProgress ?? 0) + '%' }"></div>
        </div>
      </div>
      <div class="price-row" title="السعر">
        <span class="price-value">{{ project.priceRangeText }}</span>
        <span class="price-label">ريال سعودي</span>
      </div>
      <div class="specs-row">
        <span class="spec-item" title="الغرف">
          <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {{ project.bedroomsRange }}
        </span>
        <span class="spec-item" title="المساحة (م²)">
          <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
          {{ project.areaRange }}
        </span>
      </div>
      <button class="btn-view-details rakez-btn" @click="$emit('view-tracker', project)">
        شاهد التفاصيل
        <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  project: { type: Object, required: true },
  activeMenuId: { type: [Number, String, null], default: null },
  isProjectManagerOnly: { type: Boolean, default: false },
});

// عرض صورة المشروع من الحقل project_image_url المرسل من الـ API
const imageUrl = computed(() => {
  const url =
    props.project?.project_image_url ??
    props.project?.image ??
    props.project?.image_url ??
    props.project?.main_image ??
    props.project?.cover_image ??
    props.project?.photo ??
    (typeof props.project?.project_image === 'string' ? props.project.project_image : '');
  return typeof url === 'string' && url.trim() ? url.trim() : '';
});
function onImageError(e) {
  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22240%22%20fill%3D%22%23e2e8f0%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394a3b8%22%20font-size%3D%2214%22%3E%D9%84%D8%A7%20%D8%AA%D9%88%D8%AC%D8%AF%20%D8%B5%D9%88%D8%B1%D8%A9%3C%2Ftext%3E%3C%2Fsvg%3E';
}

defineEmits([
  'toggle-menu',
  'close-menu',
  'edit-project',
  'assign-team',
  'view-teams',
  'remove-team',
  'archive-project',
  'mark-complete',
  'download-contract',
  'view-tracker',
]);
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* تصميم البطاقة مطابق لهوية الشركة ولوحة مشاريع المبيعات (Sales) */
.project-card.rakez-card {
  background: var(--color-white, #fff);
  border: 1px solid var(--color-medium-gray, #e5e7eb);
  border-radius: 16px;
  overflow: visible;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.project-card.rakez-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

/* غلاف الصورة: شريط علوي ثابت + منطقة صورة كبيرة بدون تداخل */
.card-image-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 16px 16px 0 0;
  overflow: visible;
  background: #f1f5f9;
}

/* شريط علوي: حالة | موقع | قائمة — صف واحد بدون تداخل */
.card-image-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(30, 58, 95, 0.92);
  flex-shrink: 0;
}
.card-image-top-bar .location-tag {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.card-image-top-bar .menu-container {
  position: relative;
  flex-shrink: 0;
  z-index: 100;
}
.card-image-top-bar {
  position: relative;
  z-index: 50;
}

/* منطقة عرض الصورة — ارتفاع ثابت لجميع البطاقات */
.card-image {
  height: 200px;
  min-height: 200px;
  flex: none;
  position: relative;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-image-placeholder {
  height: 200px;
  min-height: 200px;
}
.card-image-placeholder .placeholder-block {
  width: 100%;
  height: 200px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.card-image-pending-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(234, 179, 8, 0.95);
  color: #422006;
}
.menu-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.menu-btn:hover {
  background: #fff;
  color: #1e3a5f;
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  min-width: 220px;
  width: max-content;
  max-width: 320px;
  z-index: 1100;
  overflow: visible;
  animation: fadeIn 0.2s;
}

/* حاوية القائمة فقط — بدون مربع، تظهر القائمة فقط */
.card-dropdown-row {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px 0 0;
  background: transparent;
  z-index: 600;
}
.dropdown-menu-inline {
  position: relative;
  top: 0;
  right: 0;
  left: auto;
  min-width: 220px;
  max-width: 320px;
  max-height: 240px;
  overflow-y: auto;
  width: max-content;
}
.menu-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  min-height: 40px;
}
.menu-item svg {
  flex-shrink: 0;
}
.menu-item:hover {
  background: #f8fafc;
}
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 500;
  cursor: default;
}

/* عنوان البطاقة — شريط أزرق داكن (هوية الشركة) */
.card-title-block {
  background: #1e3a5f;
  color: #fff;
  padding: 14px 16px;
  margin: 0;
}
.card-title-main {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  line-height: 1.3;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.card-title-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.card-content {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.project-name,
.project-location,
.project-description-line {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}
.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

/* أشرطة التقدم — نفس المبيعات */
.progress-row.rakez-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.progress-label {
  font-size: 12px;
  color: #6b7280;
}
.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-right: auto;
}
.progress-bar {
  flex: 1 1 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.2s;
}
.contract-fill-gray {
  background: #9ca3af;
}
.contract-fill-green,
.progress-fill-green {
  background: #22c55e;
}
.contract-fill-yellow {
  background: #eab308;
}
.contract-fill-red {
  background: #ef4444;
}

/* السعر والمواصفات */
.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.price-label {
  color: #6b7280;
  font-weight: 500;
}
.price-value {
  color: #111827;
  font-weight: 700;
}
.specs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #374151;
}
.spec-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.spec-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}

.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #fef9c3;
  color: #854d0e;
}
.status-pill.expired {
  background: #fef3c7;
  color: #92400e;
}

/* زر شاهد التفاصيل — ذهبي (هوية الشركة) */
.btn-view-details.rakez-btn {
  margin-top: 8px;
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.2s;
}
.btn-view-details.rakez-btn:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}
.btn-arrow {
  width: 18px;
  height: 18px;
}

.placeholder-name {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}
.timeline-red {
  color: #dc2626;
}
.timeline-orange {
  color: #d97706;
}
.timeline-green {
  color: #16a34a;
}

/* Responsive */
@media (max-width: 768px) {
  .card-image,
  .card-image-placeholder {
    height: 200px;
    min-height: 200px;
  }
  .card-image-placeholder .placeholder-block {
    min-height: 200px;
  }
  .card-content {
    padding: 14px;
    gap: 8px;
  }
  .btn-view-details {
    min-height: 44px;
  }
  .menu-item {
    min-height: 44px;
    padding: 12px 16px;
  }
}

@media (max-width: 576px) {
  .card-image,
  .card-image-placeholder {
    height: 200px;
    min-height: 200px;
  }
  .card-image-placeholder .placeholder-block {
    min-height: 200px;
  }
  .card-content {
    padding: 12px;
  }
  .project-name {
    font-size: 15px;
  }
  .dropdown-menu {
    min-width: 180px;
  }
  .menu-item {
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .card-image,
  .card-image-placeholder {
    height: 200px;
    min-height: 200px;
  }
  .card-image-placeholder .placeholder-block {
    min-height: 200px;
  }
  .card-content {
    padding: 10px;
    gap: 6px;
  }
  .project-name {
    font-size: 14px;
  }
  .project-location {
    font-size: 12px;
  }
  .btn-view-details {
    padding: 10px;
    font-size: 13px;
  }
  .status-pill {
    font-size: 11px;
    padding: 3px 10px;
  }
}

@media (min-width: 1920px) {
  .card-image,
  .card-image-placeholder {
    height: 200px;
    min-height: 200px;
  }
  .card-content {
    padding: 24px;
    gap: 14px;
  }
  .project-name {
    font-size: 18px;
  }
  .btn-view-details {
    padding: 14px;
    font-size: 16px;
  }
}

@media (min-width: 2560px) {
  .card-content {
    padding: 28px;
  }
}
</style>
