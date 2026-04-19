<template>
  <div class="project-board-card">
    <!-- صورة المشروع مع شارة الحالة -->
    <div class="card-image-section">
      <img v-if="project.project_image_url" :src="project.project_image_url" :alt="project.project_name" class="project-image" />
      <div v-else class="project-image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      
      <!-- طبقة تدرج فوق الصورة -->
      <div class="image-overlay"></div>
      
      <div class="status-badge" :class="statusClass">
        <span class="pulse-dot"></span>
        {{ project.project_status_label_ar || project.status_badge_ar }}
      </div>
    </div>

    <!-- محتوى البطاقة -->
    <div class="card-body">
      <div class="card-header">
        <h3 class="project-name">{{ project.project_name }}</h3>
        <div class="subtitle-row">
          <p class="team-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            {{ project.team_name || 'بانتظار فريق' }}
          </p>
          <div class="location-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {{ project.city || 'الرياض' }}
          </div>
        </div>
      </div>

      <!-- قسم الوحدات - تصميم زجاجي -->
      <div class="units-overview">
        <div class="units-header">
          <span class="label">توزيع الوحدات</span>
          <button class="view-all-btn" @click="$emit('view-units', project)">عرض الكل</button>
        </div>
        
        <div class="units-grid" @click="$emit('view-units', project)">
          <div class="unit-box total">
            <span class="val">{{ project.total_units }}</span>
            <span class="lbl">الإجمالي</span>
          </div>
          <div class="unit-box available">
            <span class="val">{{ project.available_units }}</span>
            <span class="lbl">متاح</span>
          </div>
          <div class="unit-box reserved">
            <span class="val">{{ project.reserved_units }}</span>
            <span class="lbl">محجوز</span>
          </div>
          <div class="unit-box sold">
            <span class="val">{{ project.sold_units }}</span>
            <span class="lbl">مباع</span>
          </div>
        </div>
      </div>

      <!-- مؤشر نسبة المبيعات -->
      <div class="sales-progress">
        <div class="progress-info">
          <span class="pct-val">{{ project.sold_units_percent }}%</span>
          <span class="pct-lbl">نسبة المبيعات المنفذة</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: project.sold_units_percent + '%' }">
            <div class="shine-effect"></div>
          </div>
        </div>
      </div>

      <!-- أزرار الإجراءات -->
      <div class="card-actions">
        <button class="btn-assign" @click="$emit('assign-target', project)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          تعيين أهداف
        </button>
        <button class="btn-more" @click="$emit('view-details', project)">
          التفاصيل
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

defineEmits(['view-details', 'view-units', 'assign-target']);

const statusClass = computed(() => {
  const status = props.project.sales_status;
  if (status === 'available') return 'status-ready';
  if (status === 'pending') return 'status-pending';
  return 'status-sold';
});
</script>

<style scoped>
.project-board-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(181, 169, 154, 0.15);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  direction: rtl;
}

.project-board-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px -12px rgba(30, 58, 95, 0.15),
    0 12px 18px -8px rgba(0, 0, 0, 0.1);
  border-color: rgba(181, 169, 154, 0.4);
}

/* صورة المشروع */
.card-image-section {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.project-board-card:hover .project-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%);
}

.status-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(255, 255, 255, 0.4);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}

.status-ready { background: rgba(34, 197, 94, 0.85); }
.status-pending { background: rgba(234, 179, 8, 0.85); }
.status-sold { background: rgba(30, 58, 95, 0.85); }

/* محتوى البطاقة */
.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.project-name {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  letter-spacing: -0.01em;
}

.subtitle-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.team-label, .location-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.team-label svg, .location-label svg {
  width: 15px;
  height: 15px;
  color: #b5a99a;
}

/* قسم الوحدات */
.units-overview {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.units-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.units-header .label {
  font-size: 0.8rem;
  font-weight: 800;
  color: #1e3a5f;
  text-transform: uppercase;
}

.view-all-btn {
  background: transparent;
  border: none;
  color: #b5a99a;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  cursor: pointer;
}

.unit-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 4px;
  border-radius: 10px;
  background: #fff;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.units-grid:hover .unit-box {
  border-color: #e2e8f0;
}

.unit-box:hover {
  transform: translateY(-3px);
  background: #fff;
  box-shadow: 0 6px 15px rgba(0,0,0,0.05);
  border-color: #b5a99a !important;
}

.unit-box .val {
  font-size: 1.15rem;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 2px;
}

.unit-box .lbl {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
}

.unit-box.available .val { color: #16a34a; }
.unit-box.reserved .val { color: #f59e0b; }
.unit-box.sold .val { color: #3b82f6; }

/* المبيعات والتقدم */
.sales-progress {
  margin-bottom: 28px;
}

.progress-info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pct-val {
  font-size: 1.2rem;
  font-weight: 900;
  color: #1e3a5f;
}

.pct-lbl {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.progress-bar-container {
  height: 10px;
  background: #f1f5f9;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #b5a99a 0%, #1e3a5f 100%);
  border-radius: 20px;
  position: relative;
  transition: width 1.2s cubic-bezier(0.19, 1, 0.22, 1);
}

.shine-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shine 2s infinite linear;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* الأزرار */
.card-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.btn-assign {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #1e3a5f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 4px 15px rgba(30, 58, 95, 0.2);
}

.btn-assign:hover {
  background: #27374d;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(30, 58, 95, 0.3);
}

.btn-assign svg {
  width: 18px;
  height: 18px;
}

.btn-more {
  flex: 2;
  padding: 14px;
  background: #fff;
  color: #1e3a5f;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-more:hover {
  background: #f8fafc;
  border-color: #b5a99a;
  color: #b5a99a;
}
</style>
