<template>
  <AppModal
    :open="true"
    title="تعديل معلومات المشروع الحصري"
    subtitle="تعديل بيانات المشروع الحصري (نفس حقول طلب مشروع حصري)."
    size="wide"
    @update:open="(v) => { if (v === false) $emit('close') }"
  >
    <div v-if="loading" class="edit-exclusive-loading">
      <div class="loading-spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>
    <form id="edit-exclusive-form-id" v-else class="edit-exclusive-form" @submit.prevent="submit">
      <!-- معلومات أساسية -->
      <section class="form-section">
        <h4 class="section-label">معلومات المشروع والمطور</h4>
        <div class="form-grid">
          <div class="field-group">
            <label>اسم المشروع</label>
            <input v-model="form.project_name" type="text" class="form-input" placeholder="مثال: مشروع برج الراكز" />
          </div>
          <div class="field-group">
            <label>اسم المطور</label>
            <input v-model="form.developer_name" type="text" class="form-input" placeholder="اسم شركة المطور" />
          </div>
          <div class="field-group">
            <label>رقم المطور</label>
            <input v-model="form.developer_number" type="text" class="form-input" placeholder="مثال: DEV-2025-001" />
          </div>
          <div class="field-group">
            <label>المدينة</label>
            <input v-model="form.city" type="text" class="form-input" placeholder="مثال: الرياض" />
          </div>
          <div class="field-group">
            <label>الحي</label>
            <input v-model="form.district" type="text" class="form-input" placeholder="مثال: الحمراء" />
          </div>
          <div class="field-group full">
            <label>متطلبات المطور (اختياري)</label>
            <textarea
              v-model="form.developer_requiment"
              class="form-input"
              rows="2"
              placeholder="متطلبات المشروع الخاصة"
            />
          </div>
          <div class="field-group full">
            <label>رابط صورة المشروع (اختياري)</label>
            <input v-model="form.project_image_url" type="url" class="form-input" placeholder="https://example.com/image.jpg" />
          </div>
        </div>
      </section>

      <!-- الوحدات -->
      <section class="form-section">
        <div class="section-header-row">
          <h4 class="section-label">الوحدات</h4>
          <button type="button" class="btn-add-unit" @click="addUnit">إضافة وحدة</button>
        </div>
        <div class="units-table-wrap">
          <table class="units-table">
            <thead>
              <tr>
                <th>نوع الوحدة</th>
                <th>العدد</th>
                <th>السعر (ريال)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(unit, index) in form.units" :key="index">
                <td>
                  <input v-model="unit.type" type="text" class="form-input" placeholder="شقة / فيلا / محل تجاري" />
                </td>
                <td>
                  <input v-model.number="unit.count" type="number" min="0" class="form-input" placeholder="0" />
                </td>
                <td>
                  <input v-model.number="unit.price" type="number" min="0" class="form-input" placeholder="0" />
                </td>
                <td>
                  <button type="button" class="btn-remove-unit" :disabled="form.units.length <= 1" @click="removeUnit(index)">
                    حذف
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </form>
    <template #footer>
      <div class="modal-footer-actions">
        <button type="button" class="btn-close-large" @click="$emit('close')">إلغاء</button>
        <button type="submit" class="btn-save" :disabled="saving" form="edit-exclusive-form-id" @click.prevent="submit">
          {{ saving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import AppModal from '@/components/AppModal.vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { getApiErrorMessage } from '@/utils/errorHandler';

const props = defineProps({
  contractId: { type: [Number, String], required: true },
  /** بيانات أولية (إن وُجدت) لتعجيل التعبئة قبل جلب التفاصيل */
  initialData: { type: Object, default: null },
});

const emit = defineEmits(['close', 'saved']);

const loading = ref(true);
const saving = ref(false);

const form = reactive({
  project_name: '',
  developer_name: '',
  developer_number: '',
  city: '',
  district: '',
  developer_requiment: '',
  project_image_url: '',
  units: [{ type: 'شقة', count: 0, price: 0 }],
});

function mapApiToForm(data) {
  if (!data || typeof data !== 'object') return;
  form.project_name = data.project_name ?? data.name ?? '';
  form.developer_name = data.developer_name ?? data.second_party_name ?? '';
  form.developer_number = data.developer_number ?? data.second_party_cr_number ?? '';
  form.city = data.city ?? '';
  form.district = data.district ?? '';
  form.developer_requiment = data.developer_requiment ?? data.developer_requirement ?? '';
  form.project_image_url = data.project_image_url ?? data.image ?? '';
  if (data.units && Array.isArray(data.units) && data.units.length > 0) {
    form.units = data.units.map(u => ({
      type: u.type ?? 'شقة',
      count: parseInt(u.count) || 0,
      price: parseInt(u.price) || 0,
    }));
  } else {
    form.units = [{ type: 'شقة', count: 0, price: 0 }];
  }
}

async function fetchDetails() {
  loading.value = true;
  try {
    if (props.initialData) mapApiToForm(props.initialData);
    const data = await contractService.getContractById(props.contractId);
    mapApiToForm(data);
  } catch (err) {
    logger.error('EditExclusiveProjectModal: fetch contract', err);
    toast.error(getApiErrorMessage(err, 'فشل تحميل تفاصيل العقد'));
  } finally {
    loading.value = false;
  }
}

function addUnit() {
  form.units.push({ type: 'شقة', count: 0, price: 0 });
}

function removeUnit(index) {
  if (form.units.length <= 1) return;
  form.units.splice(index, 1);
}

async function submit() {
  saving.value = true;
  try {
    const payload = {
      project_name: form.project_name,
      developer_name: form.developer_name,
      developer_number: form.developer_number,
      city: form.city,
      district: form.district,
      developer_requiment: form.developer_requiment || undefined,
      project_image_url: form.project_image_url || undefined,
      units: form.units.map(u => ({
        type: u.type || 'شقة',
        count: Number(u.count) || 0,
        price: Number(u.price) || 0,
      })),
    };
    await contractService.updateContract(props.contractId, payload);
    toast.success('تم حفظ تعديلات المشروع الحصري بنجاح');
    emit('saved');
    emit('close');
  } catch (err) {
    logger.error('EditExclusiveProjectModal: update contract', err);
    toast.error(getApiErrorMessage(err, 'فشل حفظ التعديلات'));
  } finally {
    saving.value = false;
  }
}

onMounted(fetchDetails);
watch(() => props.contractId, fetchDetails);
</script>

<style scoped>
.edit-exclusive-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}
.edit-exclusive-loading .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-light-gray, #f1f5f9);
  border-top-color: var(--color-primary, #b1a28f);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.edit-exclusive-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-section {
  border: 1px solid var(--color-light-gray, #e2e8f0);
  border-radius: 10px;
  padding: 1.25rem;
  background: #fafafa;
}
.section-label {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-navy, #1e3a5f);
}
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-header-row .section-label { margin-bottom: 0; }
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-group.full { grid-column: 1 / -1; }
.field-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}
.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-primary, #b1a28f);
}

.btn-add-unit {
  padding: 0.5rem 1rem;
  background: var(--color-primary, #b1a28f);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
.btn-add-unit:hover { opacity: 0.9; }
.units-table-wrap { overflow-x: auto; }
.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.units-table th,
.units-table td { padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e2e8f0; }
.units-table th { font-weight: 600; color: #475569; background: #f8fafc; }
.units-table .form-input { min-width: 120px; }
.btn-remove-unit {
  padding: 0.35rem 0.75rem;
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.btn-remove-unit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-remove-unit:not(:disabled):hover { background: #fecaca; }

.modal-footer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btn-close-large {
  padding: 0.5rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
