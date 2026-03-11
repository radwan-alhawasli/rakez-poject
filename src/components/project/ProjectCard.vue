<template>
  <div
    class="project-card rakez-card"
    :class="{ 'card-no-image': !project.hasImage }"
  >
    <div class="card-image" :class="{ 'card-image-placeholder': !project.hasImage }">
      <template v-if="project.hasImage">
        <img
          :src="project.image"
          alt=""
          @error="$event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%2F%3E%3C%2Fsvg%3E'"
        />
      </template>
      <template v-else>
        <div class="placeholder-block">
          <span class="placeholder-name">{{ project.name }}</span>
        </div>
      </template>
      <div class="status-badge status-available">{{ project.rakezStatusLabel }}</div>
      <div class="location-tag">{{ project.location }}</div>
      <div class="menu-container" @click.stop="$emit('toggle-menu', project.id)">
        <button class="menu-btn" type="button" aria-label="القائمة">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        <div v-if="activeMenuId === project.id" class="dropdown-menu">
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
defineProps({
  project: { type: Object, required: true },
  activeMenuId: { type: [Number, String, null], default: null },
  isProjectManagerOnly: { type: Boolean, default: false },
});

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

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: visible; /* Changed to visible for dropdown */
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.card-image {
  height: 180px;
  position: relative;
  background: #f1f5f9;
  border-radius: 16px 16px 0 0;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(4px);
}
.status-badge.active {
  background: #a3c9a0;
  color: #166534;
}
.status-badge.pending {
  background: #fef9c3;
  color: #854d0e;
}

/* Menu */
.menu-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}
.menu-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
.dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-width: 220px;
  width: max-content;
  max-width: 320px;
  z-index: 100;
  overflow: visible;
  animation: fadeIn 0.2s;
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
  z-index: 5;
  cursor: default;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.project-location {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}
.project-description-line {
  font-size: 12px;
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

.progress-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.progress-label {
  font-size: 12px;
  color: #64748b;
}
.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin-right: auto;
}
.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  flex: 1 1 100%;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #b1a28f;
  border-radius: 3px;
}
.contract-fill-gray {
  background: #94a3b8;
}
.contract-fill-green {
  background: #22c55e;
}
.contract-fill-yellow {
  background: #eab308;
}
.contract-fill-red {
  background: #ef4444;
  transition: width 0.2s;
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

.btn-view-details {
  margin-top: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}
.btn-view-details:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}

/* تصميم البطاقات مطابق لقسم المبيعات (Sales) */
.sales-style-cards.projects-grid .rakez-card .card-image {
  height: 220px;
  position: relative;
}
.sales-style-cards .rakez-card .status-badge.status-available {
  position: absolute;
  top: 12px;
  left: 12px;
  right: auto;
  background: #6b7c3c;
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}
.sales-style-cards .rakez-card .location-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  left: auto;
  background: rgba(55, 65, 81, 0.9);
  color: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sales-style-cards .rakez-card .card-title-block {
  background: #1e3a5f;
  color: #fff;
  padding: 14px 16px;
  margin: 0;
}
.sales-style-cards .rakez-card .card-title-main {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  line-height: 1.3;
}
.sales-style-cards .rakez-card .card-title-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}
.sales-style-cards .rakez-card .card-content {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sales-style-cards .rakez-card .rakez-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.sales-style-cards .rakez-card .rakez-progress .progress-bar {
  flex: 1 1 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
}
.sales-style-cards .rakez-card .progress-fill-green {
  background: #22c55e;
  border-radius: 4px;
  height: 100%;
  transition: width 0.2s;
}
.sales-style-cards .rakez-card .price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}
.sales-style-cards .rakez-card .price-label {
  color: #6b7280;
  font-weight: 500;
}
.sales-style-cards .rakez-card .price-value {
  color: #111827;
  font-weight: 700;
}
.sales-style-cards .rakez-card .specs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #374151;
}
.sales-style-cards .rakez-card .spec-icon {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-left: 4px;
}
.sales-style-cards .rakez-card .btn-view-details.rakez-btn {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #fff;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 15px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
}
.sales-style-cards .rakez-card .btn-view-details.rakez-btn:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}
.sales-style-cards .rakez-card .btn-arrow {
  width: 18px;
  height: 18px;
}
.sales-style-cards .rakez-card .card-image .menu-container {
  left: auto;
  right: 12px;
}

.card-image-placeholder {
  height: 80px;
}
.card-image-placeholder .placeholder-block {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
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
  .card-image {
    height: 150px;
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
  .card-image {
    height: 140px;
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
  .card-image {
    height: 120px;
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
  .card-image {
    height: 220px;
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
