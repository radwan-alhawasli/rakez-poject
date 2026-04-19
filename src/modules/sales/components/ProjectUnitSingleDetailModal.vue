<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-main">
          <span class="type-tag">{{ unit.unit_type || unit.type }}</span>
          <h2 class="title">دردشة الوحدة: {{ unit.unit_number }}</h2>
        </div>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Hero Price & Status -->
        <div class="hero-section">
          <div class="hero-item">
            <span class="hero-label">السعر الإجمالي</span>
            <span class="hero-value">{{ formatCurrency(unit.total_price || unit.price) }}</span>
          </div>
          <div class="hero-item status-wrap">
            <span class="hero-label">حالة التوافر</span>
            <span class="status-pill" :class="'status-' + unit.status">
              {{ getStatusLabel(unit.status) }}
            </span>
          </div>
        </div>

        <div class="main-info-grid">
          <!-- Area Cluster -->
          <div class="info-card area-card">
            <div class="card-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                <polyline points="9 17 9 12 15 12 15 17"></polyline>
              </svg>
              <span>المساحات</span>
            </div>
            <div class="stats-row">
              <div class="mini-stat">
                <span class="l">الكلية</span>
                <span class="v">{{ unit.total_area_m2 || unit.total_area }}م²</span>
              </div>
              <div class="mini-stat">
                <span class="l">الداخلية</span>
                <span class="v">{{ unit.area_m2 || unit.area }}م²</span>
              </div>
              <div class="mini-stat">
                <span class="l">بلكونة</span>
                <span class="v">{{ unit.balcony_area || '0' }}م²</span>
              </div>
              <div class="mini-stat">
                <span class="l">خارجية</span>
                <span class="v">{{ unit.private_area_m2 || unit.private_area || '0' }}م²</span>
              </div>
            </div>
          </div>

          <!-- Rooms Cluster -->
          <div class="info-card">
            <div class="card-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>المكونات</span>
            </div>
            <div class="stats-row">
              <div class="mini-stat">
                <span class="l">الغرف</span>
                <span class="v">{{ unit.bedrooms || unit.rooms }}</span>
              </div>
              <div class="mini-stat">
                <span class="l">دورة مياه</span>
                <span class="v">{{ unit.bathrooms_count || unit.bathrooms }}</span>
              </div>
              <div class="mini-stat">
                <span class="l">الدور</span>
                <span class="v">{{ unit.floor }}</span>
              </div>
            </div>
          </div>

          <!-- Orientation Cluster -->
          <div class="info-card full-width">
            <div class="card-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v20M2 12h20"></path>
              </svg>
              <span>الموقع والاتجاه</span>
            </div>
            <div class="stats-row four-cols">
              <div class="mini-stat">
                <span class="l">الواجهة</span>
                <span class="v">{{ unit.facade || '—' }}</span>
              </div>
              <div class="mini-stat">
                <span class="l">الإطلالة</span>
                <span class="v">{{ unit.view || '—' }}</span>
              </div>
              <div class="mini-stat">
                <span class="l">الاتجاه</span>
                <span class="v">{{ unit.orientation || '—' }}</span>
              </div>
              <div class="mini-stat">
                <span class="l">عرض الشارع</span>
                <span class="v">{{ unit.street_width ? unit.street_width + 'م' : '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="description-box" v-if="unit.description_ar || unit.description">
          <span class="box-label">ملاحظات إضافية</span>
          <p class="box-content">{{ unit.description_ar || unit.description }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal" @click="$emit('close')">إغلاق التفاصيل</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps({
  open: Boolean,
  unit: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const { formatCurrencyAr: formatCurrency } = useFormatters();

const getStatusLabel = (status) => {
  const labels = {
    available: 'متاح',
    reserved: 'محجوز',
    sold: 'مباع',
    pending: 'قيد الانتظار'
  };
  return labels[status] || status;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 80px 20px;
  overflow-y: auto;
}

.modal-container {
  background: #ffffff;
  width: 100%;
  max-width: 580px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.4);
  margin-top: 20px;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  padding: 32px;
  background: #fff;
  color: #1e3a5f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.type-tag {
  font-size: 10px;
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  margin-bottom: 6px;
  display: inline-block;
  font-weight: 700;
}

.title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: #1e293b;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-close:hover { background: #e2e8f0; color: #1e293b; }


.modal-body {
  padding: 24px 32px;
  background: #f8fafc;
}

.hero-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.hero-item {
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.hero-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.hero-value {
  font-size: 22px;
  font-weight: 900;
  color: #1e3a5f;
}

.status-pill {
  font-size: 14px;
  font-weight: 800;
  padding: 6px 0;
  text-align: center;
  border-radius: 8px;
  margin-top: 4px;
}

.status-available { background: #dcfce7; color: #166534; }
.status-reserved { background: #fef9c3; color: #854d0e; }
.status-sold { background: #fee2e2; color: #991b1b; }
.status-pending { background: #f1f5f9; color: #475569; }

.main-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.full-width { grid-column: span 2; }

.card-header-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 12px;
  color: #b5a99a;
}

.card-header-icon svg { width: 16px; height: 16px; }

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.four-cols { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; }

.mini-stat { display: flex; flex-direction: column; }

.mini-stat .l { font-size: 10px; color: #94a3b8; margin-bottom: 2px; }
.mini-stat .v { font-size: 14px; font-weight: 700; color: #1e293b; }

.description-box {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 12px;
  border-right: 4px solid #b5a99a;
}

.box-label { font-size: 11px; font-weight: 700; color: #64748b; display: block; margin-bottom: 4px; }
.box-content { font-size: 13px; color: #1e293b; line-height: 1.6; margin: 0; }

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.btn-close-modal {
  width: 100%;
  padding: 12px;
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close-modal:hover { background: #0f172a; }

@media (max-width: 500px) {
  .main-info-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
  .four-cols { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .hero-section { grid-template-columns: 1fr; }
}
</style>

