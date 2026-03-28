<template>
  <div class="projects-tab project-management-design">
    <div class="welcome-header">
      <div class="header-flex-container">
        <div class="header-content">
          <h1 class="welcome-title">المشاريع قيد التسويق</h1>
          <p class="welcome-subtitle">عرض المشاريع الجاهزة للتسويق.</p>
        </div>
        <div class="search-box-luxury">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="ابحث عن مشروع بالاسم أو الموقع..." />
        </div>
      </div>
    </div>

    <LoadingSpinner v-if="isLoadingProjects" text="جاري تحميل المشاريع..." />

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>لا توجد مشاريع مطابقة للعرض.</p>
    </div>

    <div v-else class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card rakez-card"
        :class="{ 'card-no-image': !project.hasImage }"
      >
        <div class="card-image" :class="{ 'card-image-placeholder': !project.hasImage }">
          <img v-if="project.hasImage" :src="project.image" :alt="project.name || 'مشروع'" width="320" height="200" loading="lazy" />
          <div v-else class="placeholder-block">
            <span class="placeholder-name">{{ project.name }}</span>
          </div>
          <div class="status-badge status-available">{{ project.rakezStatusLabel }}</div>
          <div class="location-tag">{{ project.location }}</div>
        </div>

        <div class="card-title-block">
          <h3 class="card-title-main">{{ project.name }}</h3>
          <p class="card-title-type">{{ project.propertyTypeLabel }}</p>
        </div>

        <div class="card-content">
          <div class="progress-row rakez-progress" title="وحدة مباعة">
            <span class="progress-label">وحدة مباعة</span>
            <span class="progress-value">{{ project.soldUnitsPercent ?? 0 }}%</span>
            <div class="progress-bar">
              <div class="progress-fill progress-fill-green" :style="{ width: Math.min(100, project.soldUnitsPercent ?? 0) + '%' }"></div>
            </div>
          </div>
          <div class="price-row" title="السعر">
            <span class="price-value">{{ project.priceRangeText }}</span>
            <span class="price-label">ريال سعودي</span>
          </div>
          <div class="specs-row">
            <span class="spec-item" title="الغرف (أقل - أكثر)">
              <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {{ project.bedroomsRange || '—' }}
            </span>
            <span class="spec-item" title="المساحة (أكبر - أصغر م²)">
              <svg class="spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              {{ project.areaRange || '—' }}
            </span>
          </div>
          <button class="btn-view-details rakez-btn" @click="viewProjectDetails(project.id)">
            شاهد التفاصيل
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesProjects } from '@/composables/sales/useSalesProjects';

const { filteredProjects, isLoadingProjects, searchQuery, loadProjects, viewProjectDetails } = useSalesProjects();

loadProjects();
</script>

<style scoped>
/* مشاريع قيد التسويق — تنسيقات مطابقة لقسم المبيعات + استجابة كاملة */
.projects-tab.project-management-design {
  width: 100%;
  direction: rtl;
  min-height: 0;
}

.header-flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  flex: 1;
  min-width: 200px;
}

.search-box-luxury {
  position: relative;
  width: 320px;
  max-width: 100%;
}

.search-box-luxury input {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-box-luxury input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-box-luxury input:focus {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-box-luxury .search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

/* شبكة البطاقات */
.project-management-design .projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-management-design .project-card {
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.project-management-design .project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.project-management-design .card-image {
  height: 220px;
  position: relative;
  background: #f1f5f9;
  border-radius: 16px 16px 0 0;
}

.project-management-design .card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}

.project-management-design .card-image-placeholder {
  height: 80px;
}

.project-management-design .card-image-placeholder .placeholder-block {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.project-management-design .placeholder-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
}

.project-management-design .status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(4px);
}

.project-management-design .status-badge.status-available {
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

.project-management-design .location-tag {
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

.project-management-design .card-title-block {
  background: #1e3a5f;
  color: #fff;
  padding: 14px 16px;
  margin: 0;
}

.project-management-design .card-title-main {
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

.project-management-design .card-title-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.project-management-design .card-content {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

/* شريط نسبة الوحدات المباعة */
.project-management-design .progress-row.rakez-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.project-management-design .progress-row .progress-label {
  font-size: 12px;
  color: #6b7280;
}

.project-management-design .progress-row .progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-right: auto;
}

.project-management-design .progress-row .progress-bar {
  flex: 1 1 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.project-management-design .progress-row .progress-fill-green {
  height: 100%;
  background: #22c55e;
  border-radius: 4px;
  transition: width 0.2s;
}

.project-management-design .price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.project-management-design .price-label {
  color: #6b7280;
  font-weight: 500;
}

.project-management-design .price-value {
  color: #111827;
  font-weight: 700;
}

/* مجال المساحة وعدد الغرف */
.project-management-design .specs-row {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #374151;
}

.project-management-design .spec-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.project-management-design .spec-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}

.project-management-design .btn-view-details.rakez-btn {
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

.project-management-design .btn-view-details.rakez-btn:hover {
  background: linear-gradient(135deg, var(--color-gold-dark) 0%, var(--color-gold) 100%);
  filter: brightness(1.05);
}

.project-management-design .empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 15px;
}

@media (max-width: 768px) {
  .header-flex-container {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box-luxury {
    width: 100%;
  }
  .project-management-design .projects-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .projects-tab.project-management-design {
    padding: 0 4px;
  }
  .project-management-design .specs-row {
    flex-wrap: wrap;
    gap: 10px;
  }
  .project-management-design .card-content {
    padding: 12px;
  }
  .project-management-design .price-value {
    font-size: 13px;
  }
}
</style>
