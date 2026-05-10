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
      <p class="card-title-developer">المطور: {{ project.developer_name || '—' }}</p>
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

<style scoped src="./styles/ProjectCard.scoped.s1.css"></style>
<style scoped src="./styles/ProjectCard.scoped.s2.css"></style>
