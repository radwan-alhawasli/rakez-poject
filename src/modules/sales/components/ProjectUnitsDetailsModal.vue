<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container" :class="{ 'detail-mode': viewMode === 'detail' }">
      <!-- Header: Dynamic based on viewMode -->
      <div class="modal-header">
        <div class="header-content">
          <template v-if="viewMode === 'list'">
            <h2 class="title">وحدات المشروع: {{ project.project_name }}</h2>
            <div class="filters">
              <div class="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input v-model="searchQuery" placeholder="بحث برقم الوحدة..." />
              </div>
              <select v-model="statusFilter" class="status-select">
                <option value="">كل الحالات</option>
                <option value="available">متاح</option>
                <option value="reserved">محجوز</option>
                <option value="sold">مباع</option>
                <option value="pending">قيد الانتظار</option>
              </select>
            </div>
          </template>
          <template v-else>
            <div class="back-nav" @click="viewMode = 'list'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
              <span>العودة للقائمة</span>
            </div>
            <div class="detail-title-wrap">
              <span class="unit-type-tag">{{ selectedUnit.unit_type || selectedUnit.type }}</span>
              <h2 class="title">تفاصيل الوحدة: {{ selectedUnit.unit_number }}</h2>
            </div>
          </template>
        </div>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <!-- Body: Dynamic -->
      <div class="modal-body" :class="viewMode">
        <template v-if="viewMode === 'list'">
          <div v-if="isLoading" class="loading-wrap">
            <div class="spinner"></div>
            <p>جاري تحميل الوحدات...</p>
          </div>

          <div v-else-if="error" class="error-wrap">
            <p>{{ error }}</p>
            <button @click="fetchUnits" class="btn-retry">إعادة المحاولة</button>
          </div>

          <div v-else-if="filteredUnits.length === 0" class="empty-wrap">
            <p>لا توجد وحدات تطابق البحث.</p>
          </div>

          <div v-else class="units-grid">
            <div v-for="unit in filteredUnits" :key="unit.id" class="unit-card clickable" @click="openUnitDetail(unit)">
              <div class="unit-status-ribbon" :class="'status-' + unit.status">
                {{ getStatusLabel(unit.status) }}
              </div>
              <div class="unit-card-header">
                <span class="unit-type">{{ unit.unit_type || unit.type }}</span>
                <h4 class="unit-number">{{ unit.unit_number }}</h4>
              </div>
              <div class="unit-card-body">
                <div class="spec-row">
                  <span class="spec-label">المساحة:</span>
                  <span class="spec-value">{{ unit.area_m2 || unit.area }} م²</span>
                </div>
                <div class="spec-row">
                  <span class="spec-label">الغرف:</span>
                  <span class="spec-value">{{ unit.bedrooms || unit.rooms }} غرف</span>
                </div>
              </div>
              <div class="unit-card-footer">
                <span class="price-value">{{ formatCurrency(unit.total_price || unit.price) }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Detailed View Section -->
        <template v-else>
          <div class="unit-detail-container fadeIn">
            <div class="detail-hero">
              <div class="price-box">
                <span class="l">السعر الكامل</span>
                <span class="v">{{ formatCurrency(selectedUnit.total_price || selectedUnit.price) }}</span>
              </div>
              <div class="status-box" :class="'status-' + selectedUnit.status">
                <span class="l">حالة الوحدة</span>
                <span class="v">{{ getStatusLabel(selectedUnit.status) }}</span>
              </div>
            </div>

            <div class="detail-grids">
              <!-- Grid 1: Main Stats -->
              <div class="d-card">
                <h4 class="d-card-t">نظرة عامة</h4>
                <div class="d-grid-3">
                  <div class="g-item">
                    <span class="g-l">المساحة الإجمالية</span>
                    <span class="g-v">{{ selectedUnit.total_area_m2 || selectedUnit.total_area }} م²</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">المساحة الداخلية</span>
                    <span class="g-v">{{ selectedUnit.area_m2 || selectedUnit.area }} م²</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">البلكونة / الخارجية</span>
                    <span class="g-v">{{ selectedUnit.balcony_area || selectedUnit.private_area_m2 || selectedUnit.private_area || '0' }} م²</span>
                  </div>
                </div>
              </div>

              <!-- Grid 2: Components -->
              <div class="d-card">
                <h4 class="d-card-t">المكونات</h4>
                <div class="d-grid-3">
                  <div class="g-item">
                    <span class="g-l">عدد الغرف</span>
                    <span class="g-v">{{ selectedUnit.bedrooms || selectedUnit.rooms }} غرف</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">دورات المياه</span>
                    <span class="g-v">{{ selectedUnit.bathrooms_count || selectedUnit.bathrooms }}</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">الدور</span>
                    <span class="g-v">{{ selectedUnit.floor }}</span>
                  </div>
                </div>
              </div>

              <!-- Grid 3: Location -->
              <div class="d-card full-w">
                <h4 class="d-card-t">الموقع والاتجاه</h4>
                <div class="d-grid-4">
                  <div class="g-item">
                    <span class="g-l">الواجهة</span>
                    <span class="g-v">{{ selectedUnit.facade || '—' }}</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">الإطلالة</span>
                    <span class="v">{{ selectedUnit.view || '—' }}</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">الاتجاه</span>
                    <span class="v">{{ selectedUnit.orientation || '—' }}</span>
                  </div>
                  <div class="g-item">
                    <span class="g-l">عرض الشارع</span>
                    <span class="v">{{ selectedUnit.street_width ? selectedUnit.street_width + 'م' : '—' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="description-section" v-if="selectedUnit.description_ar || selectedUnit.description">
              <h4 class="d-card-t">ملاحظات إضافية</h4>
              <p class="desc-p">{{ selectedUnit.description_ar || selectedUnit.description }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer: Dynamic -->
      <div class="modal-footer">
        <template v-if="viewMode === 'list'">
          <div class="summary">
            إجمالي النتائج: <strong>{{ filteredUnits.length }}</strong> وحدة
          </div>
          <button class="btn-cancel" @click="$emit('close')">إغلاق النافذة</button>
        </template>
        <template v-else>
          <button class="btn-action-primary" @click="viewMode = 'list'">العودة لقائمة الوحدات</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import salesService from '@/services/salesService';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

const props = defineProps({
  open: Boolean,
  project: {
    type: Object,
    required: true
  }
});

defineEmits(['close']);

const { formatCurrencyAr: formatCurrency } = useFormatters();

const units = ref([]);
const isLoading = ref(true);
const error = ref('');
const searchQuery = ref('');
const statusFilter = ref('');

const viewMode = ref('list'); // 'list' | 'detail'
const selectedUnit = ref(null);

const fetchUnits = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await salesService.getProjectUnits(props.project.contract_id);
    const data = Array.isArray(response) ? response : (response?.data || response?.items || []);
    units.value = data;
  } catch (err) {
    logger.error('[UnitsModal] Error fetching units:', err);
    error.value = 'فشل تحميل بيانات الوحدات. يرجى المحاولة لاحقاً.';
  } finally {
    isLoading.value = false;
  }
};

const openUnitDetail = (unit) => {
  selectedUnit.value = unit;
  viewMode.value = 'detail';
};

const filteredUnits = computed(() => {
  return units.value.filter(u => {
    const matchesSearch = u.unit_number?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = !statusFilter.value || u.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

const getStatusLabel = (status) => {
  const labels = {
    available: 'متاح',
    reserved: 'محجوز',
    sold: 'مباع',
    pending: 'قيد الانتظار'
  };
  return labels[status] || status;
};

onMounted(() => {
  fetchUnits();
});
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
  max-width: 1000px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  margin-top: 20px;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-container.detail-mode {
  max-width: 700px;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.back-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #b5a99a;
  font-weight: 700;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.back-nav:hover { color: #1e3a5f; }
.back-nav svg { width: 16px; height: 16px; transform: scaleX(-1); }

.detail-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-type-tag {
  font-size: 10px;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  color: #64748b;
  text-transform: uppercase;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0;
}

.filters {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  right: 12px;
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-box input {
  padding: 10px 40px 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 240px;
  outline: none;
}

.status-select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 32px;
  min-height: 400px;
  background: #f8fafc;
}

.modal-body.detail { padding-top: 20px; }

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.unit-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}

.unit-card.clickable { cursor: pointer; }
.unit-card.clickable:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

.unit-status-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 700;
  border-bottom-right-radius: 8px;
  color: #fff;
}

.status-available { background: #22c55e; }
.status-reserved { background: #b5a99a; }
.status-sold { background: #1e3a5f; }
.status-pending { background: #eab308; }

.unit-card-header { margin-top: 12px; margin-bottom: 16px; }
.unit-type { font-size: 12px; color: #64748b; }
.unit-number { font-size: 20px; font-weight: 800; color: #1e293b; margin: 4px 0 0 0; }
.unit-card-body { border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 12px; }
.spec-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
.spec-label { color: #94a3b8; }
.spec-value { font-weight: 600; color: #475569; }
.price-value { font-size: 16px; font-weight: 800; color: #1e3a5f; }

/* Detail View Styles */
.detail-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.price-box, .status-box { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
.price-box .l, .status-box .l { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.price-box .v { font-size: 24px; font-weight: 900; color: #1e3a5f; }
.status-box .v { font-size: 20px; font-weight: 800; }
.status-box.status-available { border-color: #22c55e33; color: #166534; }
.status-box.status-sold { border-color: #ef444433; color: #991b1b; }

.detail-grids { display: flex; flex-direction: column; gap: 16px; }
.d-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
.d-card-t { font-size: 14px; font-weight: 800; color: #1e3a5f; margin: 0 0 16px 0; border-right: 3px solid #b5a99a; padding-right: 10px; }
.d-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.d-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.g-item { display: flex; flex-direction: column; background: #f8fafc; padding: 12px; border-radius: 8px; }
.g-l { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
.g-v { font-size: 15px; font-weight: 700; color: #1e293b; }

.description-section { margin-top: 16px; }
.desc-p { font-size: 14px; color: #475569; line-height: 1.6; background: #fff; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }

.modal-footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.btn-action-primary { width: 100%; padding: 14px; background: #1e293b; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-cancel { padding: 10px 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

.fadeIn { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 600px) {
  .d-grid-3, .d-grid-4 { grid-template-columns: 1fr 1fr; }
  .detail-hero { grid-template-columns: 1fr; }
}

.loading-wrap, .error-wrap, .empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #b5a99a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.btn-retry {
  margin-top: 16px;
  padding: 8px 20px;
  background: #1e3a5f;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.modal-footer {
  padding: 16px 32px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary {
  font-size: 14px;
  color: #64748b;
}

.btn-cancel {
  padding: 10px 24px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
