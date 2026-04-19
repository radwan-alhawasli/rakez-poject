<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-main">
          <h2 class="project-title">{{ project.project_name }}</h2>
          <span class="ad-code" v-if="project.ad_code">كود الإعلان: {{ project.ad_code }}</span>
        </div>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="details-grid">
          <!-- الأساسيات -->
          <div class="detail-section">
            <h3 class="section-title">المعلومات الأساسية</h3>
            <div class="info-group">
              <div class="info-row">
                <span class="label">اسم الفريق:</span>
                <span class="value">{{ project.team_name || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">الموقع:</span>
                <span class="value">{{ project.location || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">المدينة / الحي:</span>
                <span class="value">{{ project.city || 'N/A' }} - {{ project.district || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- حالة المبيعات والوحدات -->
          <div class="detail-section">
            <h3 class="section-title">إحصائيات الوحدات</h3>
            <div class="stats-overview">
              <div class="stat-box">
                <div class="stat-n">{{ project.total_units }}</div>
                <div class="stat-l">الإجمالي</div>
              </div>
              <div class="stat-box green">
                <div class="stat-n">{{ project.available_units }}</div>
                <div class="stat-l">متاح</div>
              </div>
              <div class="stat-box gold">
                <div class="stat-n">{{ project.reserved_units }}</div>
                <div class="stat-l">محجوز</div>
              </div>
              <div class="stat-box navy">
                <div class="stat-n">{{ project.sold_units }}</div>
                <div class="stat-l">مباع</div>
              </div>
            </div>
            <div class="info-group mt-3">
              <div class="info-row">
                <span class="label">حالة العقد:</span>
                <span class="value">{{ project.contract_status }}</span>
              </div>
              <div class="info-row">
                <span class="label">جاهزية المشروع:</span>
                <span class="value">{{ project.is_ready ? 'جاهز' : 'غير جاهز' }}</span>
              </div>
              <div class="info-row">
                <span class="label">حالة المبيعات:</span>
                <span class="value">{{ project.project_status_label_ar }}</span>
              </div>
            </div>
          </div>

          <!-- المواصفات والأسعار -->
          <div class="detail-section span-2">
            <h3 class="section-title">المواصفات والأسعار</h3>
            <div class="specs-grid">
              <div class="spec-card">
                <div class="spec-label">نطاق الأسعار</div>
                <div class="spec-value" v-if="project.price_min">
                  {{ formatCurrency(project.price_min) }} - {{ formatCurrency(project.price_max) }}
                </div>
                <div class="spec-value" v-else>غير محدد</div>
              </div>
              <div class="spec-card">
                <div class="spec-label">نطاق المساحات</div>
                <div class="spec-value" v-if="project.area_min_m2">
                  {{ project.area_min_m2 }}م² - {{ project.area_max_m2 }}م²
                </div>
                <div class="spec-value" v-else>غير محدد</div>
              </div>
              <div class="spec-card">
                <div class="spec-label">عدد الغرف</div>
                <div class="spec-value" v-if="project.bedrooms_min">
                  {{ project.bedrooms_min }} - {{ project.bedrooms_max }}
                </div>
                <div class="spec-value" v-else>غير محدد</div>
              </div>
              <div class="spec-card">
                <div class="spec-label">نوع الوحدات</div>
                <div class="spec-value">{{ project.unit_type_label_ar || 'N/A' }}</div>
              </div>
            </div>
          </div>

          <!-- معلومات إضافية -->
          <div class="detail-section span-2" v-if="project.project_description">
            <h3 class="section-title">وصف المشروع</h3>
            <p class="description-text">{{ project.project_description }}</p>
          </div>

          <!-- الجدول الزمني -->
          <div class="detail-section" v-if="project.remaining_days !== null">
            <h3 class="section-title">الجدول الزمني</h3>
            <div class="time-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>متبقي: <strong>{{ project.remaining_days }} يوم</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps({
  open: Boolean,
  project: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const { formatCurrencyAr: formatCurrency } = useFormatters();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px;
  overflow-y: auto;
}

.modal-container {
  background: #ffffff;
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  margin-top: 20px;
}


@keyframes modalEnter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
}

.ad-code {
  font-size: 13px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 6px;
  margin-top: 4px;
  display: inline-block;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #1e293b;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.span-2 {
  grid-column: span 2;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #b5a99a;
  display: inline-block;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.label {
  color: #64748b;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.stat-n {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.stat-l {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.green .stat-n { color: #16a34a; }
.gold .stat-n { color: #b5a99a; }
.navy .stat-n { color: #1e3a5f; }

.specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.spec-card {
  background: #f1f5f9;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.spec-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
}

.spec-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.description-text {
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
  margin: 0;
}

.time-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  color: #92400e;
}

.time-stat svg {
  width: 20px;
  height: 20px;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 24px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.mt-3 { margin-top: 1rem; }

@media (max-width: 640px) {
  .details-grid { grid-template-columns: 1fr; }
  .span-2 { grid-column: span 1; }
  .specs-grid { grid-template-columns: repeat(2, 1fr); }
  .modal-container { height: 100vh; max-height: none; border-radius: 0; }
}
</style>
