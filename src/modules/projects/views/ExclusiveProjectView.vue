<template>
  <div class="exclusive-request">
    <!-- Header -->
    <div class="welcome-header exclusive-request-hero">
      <div class="header-content">
        <h1 class="welcome-title">Ø·Ù„Ø¨ Ø§Ø¹ØªÙ…Ø§Ø¯ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠ</h1>
        <p class="welcome-subtitle">
          Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø£ÙˆÙ„ÙŠØ© Ù„Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ø¹ØªÙ…Ø§Ø¯Ù‡ ÙƒÙØ±ØµØ© Ø­ØµØ±ÙŠØ© Ù„ÙØ±ÙŠÙ‚Ùƒ.
        </p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-head">
          <h3 class="section-label">Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø­ØµØ±ÙŠ</h3>
          <p class="form-head-lead">Ø§Ù…Ù„Ø£ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„ØªØ§Ù„ÙŠØ© Ø¨Ø¯Ù‚Ø©Ø› ØªÙØ±Ø§Ø¬Ø¹Ù Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©Ù Ø§Ù„Ø·Ù„Ø¨ÙŽ Ù‚Ø¨Ù„ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯.</p>
        </div>

        <!-- Section: Developer Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø·ÙˆØ±</h4>
            <div class="input-row">
              <div class="field-group full">
                <label>Ø§Ø®ØªØ± Ù…Ø·ÙˆØ±Ù‹Ø§ Ø£Ùˆ Ø£Ø¶Ù Ø¬Ø¯ÙŠØ¯Ù‹Ø§</label>
                <p class="field-hint">
                  ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Ù…Ø·ÙˆØ± Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø£Ùˆ Ø¥Ø¶Ø§ÙØ© Ù…Ø·ÙˆØ± Ø¬Ø¯ÙŠØ¯ ÙˆØ¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§ØªÙ‡ ÙŠØ¯ÙˆÙŠØ§Ù‹.
                </p>
                <div class="select-wrapper">
                  <select
                    v-model="form.developer_id"
                    class="form-input"
                    @change="onDeveloperSelect"
                  >
                    <option value="">Ø¥Ø¶Ø§ÙØ© Ù…Ø·ÙˆØ± Ø¬Ø¯ÙŠØ¯ (Ø¥Ø¯Ø®Ø§Ù„ ÙŠØ¯ÙˆÙŠ)</option>
                    <option v-for="dev in developers" :key="dev.id" :value="dev.id">
                      {{ dev.name }} {{ dev.commercialRecord ? `(${dev.commercialRecord})` : '' }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="input-row">
              <div class="field-group">
                <label>Ø§Ù„Ù…Ø·ÙˆØ± / Ø§Ù„ÙˆÙƒÙŠÙ„</label>
                <input
                  type="text"
                  v-model="form.developer_name"
                  class="form-input"
                  placeholder="Ø§Ø³Ù… Ø§Ù„Ù…Ø·ÙˆØ± Ø£Ùˆ Ø§Ù„ÙˆÙƒÙŠÙ„"
                />
              </div>
              <div class="field-group">
                <label>Ø±Ù‚Ù… Ø§Ù„Ù…Ø·ÙˆØ± (Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„ØªØ¬Ø§Ø±ÙŠ)</label>
                <input
                  type="text"
                  v-model="form.developer_cr_number"
                  class="form-input"
                  placeholder="Ø±Ù‚Ù… Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„ØªØ¬Ø§Ø±ÙŠ"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Project Info -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</h4>
            <div class="input-row">
              <div class="field-group">
                <label>Ø§Ø³Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</label>
                <input
                  type="text"
                  v-model="form.project_name"
                  class="form-input"
                  placeholder="Ø§Ø³Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹"
                />
              </div>
              <div class="field-group">
                <label>Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©</label>
                <select v-model="form.city_id" class="form-input" :disabled="citiesLoading">
                  <option value="">{{ citiesLoading ? 'Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„...' : 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©' }}</option>
                  <option v-for="c in cities" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>Ø§Ù„Ø­ÙŠ</label>
                <select v-model="form.district_id" class="form-input" :disabled="citiesLoading || !form.city_id">
                  <option value="">{{ !form.city_id ? 'Ø§Ø®ØªØ± Ø§Ù„Ù…Ø¯ÙŠÙ†Ø© Ø£ÙˆÙ„Ø§Ù‹' : 'Ø§Ø®ØªØ± Ø§Ù„Ø­ÙŠ' }}</option>
                  <option v-for="d in filteredDistricts" :key="d.id" :value="String(d.id)">{{ d.name }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>Ø§Ù„Ø§ØªØ¬Ø§Ù‡</label>
                <select v-model="form.side" class="form-input" required>
                  <option value="">Ø§Ø®ØªØ± Ø§Ù„Ø§ØªØ¬Ø§Ù‡</option>
                  <option v-for="opt in sideOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>Ù†ÙˆØ¹ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</label>
                <select v-model="form.project_type" class="form-input" required>
                  <option value="ready">Ø¬Ø§Ù‡Ø²</option>
                  <option value="off_plan">Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø§Ø±Ø·Ø©</option>
                </select>
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>Ø±Ø§Ø¨Ø· ØµÙˆØ±Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</label>
                <input
                  type="text"
                  v-model="form.project_location_url"
                  class="form-input"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø·ÙˆØ± / Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</label>
                <input
                  type="text"
                  v-model="form.developer_requiment"
                  class="form-input"
                  placeholder="Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø®Ø§ØµØ©"
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group full">
                <label>Ù…Ù„Ø§Ø­Ø¸Ø§Øª</label>
                <input
                  type="text"
                  v-model="form.note"
                  class="form-input"
                  placeholder="Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©"
                />
              </div>
            </div>
            <div class="input-row">
              <div class="field-group">
                <label>Ù†Ø³Ø¨Ø© Ø§Ù„Ø³Ø¹ÙŠ (%)</label>
                <input
                  type="number"
                  v-model="commissionPercentInput"
                  class="form-input"
                  min="0"
                  max="100"
                  step="any"
                  inputmode="decimal"
                  placeholder="Ù…Ø«Ø§Ù„: 2.5 Ø£Ùˆ 2.25"
                />
              </div>
              <div class="field-group">
                <label>Ù…ØµØ¯Ø± Ø§Ù„Ø³Ø¹ÙŠ</label>
                <select v-model="form.commission_from" class="form-input">
                  <option value="owner">Ù…Ù† Ø§Ù„Ù…Ø§Ù„Ùƒ</option>
                  <option value="buyer">Ù…Ù† Ø§Ù„Ù…Ø´ØªØ±ÙŠ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Unit Info (multiple types, each with count) -->
        <div class="form-section">
          <div class="form-group-info">
            <h4 class="group-title">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ÙˆØ­Ø¯Ø§Øª</h4>
            <div class="unit-rows-header input-row">
              <div class="field-group field-type"><label>Ù†ÙˆØ¹ Ø§Ù„ÙˆØ­Ø¯Ø§Øª</label></div>
              <div class="field-group field-count"><label>Ø¹Ø¯Ø¯ Ø§Ù„ÙˆØ­Ø¯Ø§Øª</label></div>
              <div class="field-group field-price"><label>Ù…ØªÙˆØ³Ø· Ø³Ø¹Ø± Ø§Ù„ÙˆØ­Ø¯Ø©</label></div>
              <div class="field-group field-subtotal"><label>Ù‚ÙŠÙ…Ø© Ø§Ù„Ù†ÙˆØ¹</label></div>
              <div class="field-group field-action"><label>&nbsp;</label></div>
            </div>
            <div
              v-for="(row, index) in form.unit_rows"
              :key="row.id"
              class="unit-item-row input-row"
            >
              <div class="field-group field-type">
                <div class="select-wrapper">
                  <select v-model="row.unit_type" class="form-input">
                    <option value="">... Ø§Ø®ØªØ± Ù†ÙˆØ¹Ø§</option>
                    <option v-for="opt in unitTypeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="field-group field-count">
                <input
                  type="number"
                  v-model.number="row.units_count"
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="field-group field-price">
                <input
                  type="number"
                  v-model.number="row.avg_unit_price"
                  class="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div class="field-group field-subtotal">
                <input type="text" :value="rowSubtotal(row)" class="form-input readonly" readonly />
              </div>
              <div class="field-group field-action">
                <button
                  type="button"
                  class="remove-unit-btn"
                  @click="removeUnitRow(index)"
                  :title="'Ø­Ø°Ù Ø§Ù„Ø³Ø·Ø±'"
                >
                  Ã—
                </button>
              </div>
            </div>
            <button type="button" class="add-unit-link" @click="addUnitRow">
              + Ø¥Ø¶Ø§ÙØ© Ù†ÙˆØ¹ ÙˆØ­Ø¯Ø©
            </button>
            <div class="input-row total-row">
              <div class="field-group full">
                <label>Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù‚ÙŠÙ…Ø© Ø§Ù„ÙˆØ­Ø¯Ø§Øª</label>
                <input
                  type="text"
                  :value="totalUnitsValueFormatted"
                  class="form-input readonly"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-small"></span>
            Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨
          </button>
        </div>
      </form>

      <!-- Ø±Ø³Ø§Ù„Ø© ØªØ£ÙƒÙŠØ¯ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ -->
      <div v-if="showSuccessConfirm" class="success-confirm-box">
        <div class="success-confirm-content">
          <span class="success-confirm-icon">âœ“</span>
          <h3 class="success-confirm-title">ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­</h3>
          <p class="success-confirm-text">ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø­ØµØ±ÙŠ ÙˆÙ‡Ùˆ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø¢Ù†.</p>
          <button type="button" class="success-confirm-btn" @click="showSuccessConfirm = false">Ø­Ø³Ù†Ø§Ù‹</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import contractService from '@/services/contractService';
import notificationService from '@/services/notificationService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { showApiError } from '@/utils/errorHandler';
import { normalizeDeveloper } from '@/utils/developerMapper';
import { UNIT_TYPES } from '@/constants/lookups';
import secureStorage from '@/utils/secureStorage';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useCitiesDistrictsLookups } from '@/composables/useCitiesDistrictsLookups';
import { buildExclusiveContractPayload } from '@/modules/projects/views/exclusiveProjectPayload.js';

const { hasPermission } = usePermissions();
const isLoading = ref(false);
const developers = ref([]);
const showSuccessConfirm = ref(false);

/** ÙŠÙØ±Ø³Ù„ Ù„Ù„Ù€ API ÙƒÙ€ side: n | e | s | w */
const sideOptions = [
  { value: 'n', label: 'Ø´Ù…Ø§Ù„' },
  { value: 'e', label: 'Ø´Ø±Ù‚' },
  { value: 's', label: 'Ø¬Ù†ÙˆØ¨' },
  { value: 'w', label: 'ØºØ±Ø¨' },
];

let nextUnitRowId = 1;
const form = reactive({
  developer_id: '',
  developer_name: '',
  developer_cr_number: '',
  project_name: '',
  project_type: 'ready',
  side: '',
  project_location_url: '',
  developer_requiment: '',
  note: '',
  city: '',
  city_id: '',
  neighborhood: '',
  district_id: '',
  commission_percentage: null,
  commission_from: 'owner',
  unit_rows: [{ id: nextUnitRowId++, unit_type: '', units_count: 0, avg_unit_price: 0 }],
});

const { cities, loading: citiesLoading, load: loadCitiesDistricts, districtsForCityId } =
  useCitiesDistrictsLookups();

const filteredDistricts = computed(() => districtsForCityId(form.city_id));

watch(
  () => form.city_id,
  (id, prev) => {
    const prevStr = prev != null && prev !== '' ? String(prev) : '';
    const idStr = id != null && id !== '' ? String(id) : '';
    if (prevStr !== '' && idStr !== prevStr) {
      form.district_id = '';
      form.neighborhood = '';
    }
    const c = cities.value.find(x => String(x.id) === String(id));
    if (c) form.city = c.name;
  }
);

watch(
  () => form.district_id,
  id => {
    const d = filteredDistricts.value.find(x => String(x.id) === String(id));
    if (d) form.neighborhood = d.name;
  }
);

const unitTypeOptions = UNIT_TYPES;

/** Ø±Ø¨Ø· Ø­Ø± Ù„Ù†Ø³Ø¨Ø© Ø§Ù„Ø³Ø¹ÙŠ (ÙƒØ³ÙˆØ± Ø¹Ø´Ø±ÙŠØ©) Ø¯ÙˆÙ† ØªÙ‚ÙŠÙŠØ¯ v-model.number */
const commissionPercentInput = ref('0');
watch(
  () => form.commission_percentage,
  v => {
    if (v === null || v === undefined || v === '') {
      if (commissionPercentInput.value === '') return;
      commissionPercentInput.value = '0';
      return;
    }
    const s = String(v).replace(',', '.');
    if (s !== commissionPercentInput.value) commissionPercentInput.value = s;
  },
  { immediate: true }
);
watch(commissionPercentInput, raw => {
  const t = String(raw ?? '').trim().replace(',', '.');
  if (t === '') {
    form.commission_percentage = null;
    return;
  }
  const n = parseFloat(t);
  form.commission_percentage = Number.isFinite(n) ? n : null;
});

const rowSubtotal = row => {
  const count = Number(row.units_count) || 0;
  const avg = Number(row.avg_unit_price) || 0;
  const val = count * avg;
  return val > 0 ? val.toLocaleString('en-US') : '0';
};

const totalUnitsValue = computed(() => {
  return form.unit_rows.reduce((sum, row) => {
    const count = Number(row.units_count) || 0;
    const avg = Number(row.avg_unit_price) || 0;
    return sum + count * avg;
  }, 0);
});

const totalUnitsValueFormatted = computed(() => totalUnitsValue.value.toLocaleString('en-US'));

const addUnitRow = () => {
  form.unit_rows.push({
    id: nextUnitRowId++,
    unit_type: '',
    units_count: 0,
    avg_unit_price: 0,
  });
};

const removeUnitRow = index => {
  if (form.unit_rows.length <= 1) return;
  form.unit_rows.splice(index, 1);
};

const loadDevelopers = async () => {
  try {
    let list = [];
    // Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ù…ÙˆØ«ÙˆÙ‚: GET /second-party-data/second-parties (Ù„Ø§ ÙŠØ¹ØªÙ…Ø¯ Ø¹Ù„Ù‰ Ø¹Ù„Ø§Ù‚Ø© units ÙÙŠ Ø§Ù„Ø¹Ù‚Ø¯)
    try {
      const secondParties = await contractService.getDevelopers();
      if (Array.isArray(secondParties) && secondParties.length > 0) {
        list = secondParties;
      }
    } catch (e) {
      logger.warn('getDevelopers (second-parties) failed', e);
    }
    // Ø§Ø­ØªÙŠØ§Ø·ÙŠ: GET /developers (Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø©) â€” Ù‚Ø¯ ÙŠÙØ´Ù„ Ø¥Ø°Ø§ ÙƒØ§Ù† Ø§Ù„Ø®Ø§Ø¯Ù… ÙŠØ­Ù…Ù‘Ù„ Ø¹Ù„Ø§Ù‚Ø© units Ù…Ø¹Ø·ÙˆØ¨Ø©
    if (list.length === 0) {
      try {
        const { data } = await contractService.getDevelopersList({ per_page: 100, page: 1 });
        list = Array.isArray(data) ? data : [];
      } catch (e) {
        logger.warn('getDevelopersList (/developers) failed', e);
      }
    }
    developers.value = list.map(d => normalizeDeveloper(d));
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403) {
      toast.info(
        'Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ø·ÙˆØ± Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© ØºÙŠØ± Ù…ØªØ§Ø­ Ù„ØµÙ„Ø§Ø­ÙŠØ§ØªÙƒ. ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ø¯Ø®Ø§Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·ÙˆØ± ÙŠØ¯ÙˆÙŠØ§Ù‹.'
      );
    } else {
      logger.error('Error loading developers:', error);
    }
    developers.value = [];
  }
};

const onDeveloperSelect = () => {
  if (form.developer_id) {
    const dev = developers.value.find(d => String(d.id) === String(form.developer_id));
    if (dev) {
      form.developer_name = dev.name;
      form.developer_cr_number = dev.commercialRecord || '';
    }
  } else {
    form.developer_name = '';
    form.developer_cr_number = '';
  }
};

onMounted(() => {
  loadCitiesDistricts().catch(err => {
    logger.error('Failed to load cities/districts', err);
    toast.error('ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø¯Ù† ÙˆØ§Ù„Ø£Ø­ÙŠØ§Ø¡');
  });
  if (hasPermission(PERMISSIONS.DEVELOPERS_LIST_VIEW)) {
    loadDevelopers();
  }
});

const resetForm = () => {
  form.developer_id = '';
  form.developer_name = '';
  form.developer_cr_number = '';
  form.project_name = '';
  form.project_type = 'ready';
  form.side = '';
  form.project_location_url = '';
  form.developer_requiment = '';
  form.note = '';
  form.city = '';
  form.city_id = '';
  form.neighborhood = '';
  form.district_id = '';
  form.commission_percentage = null;
  form.commission_from = 'owner';
  commissionPercentInput.value = '0';
  form.unit_rows = [{ id: nextUnitRowId++, unit_type: '', units_count: 0, avg_unit_price: 0 }];
};

const handleSubmit = async () => {
  if (!secureStorage.getToken()) {
    toast.error('ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹ Ù„Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠ.');
    return;
  }
  if (!form.project_name?.trim()) {
    toast.error('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ø³Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹');
    return;
  }
  if (!['ready', 'off_plan'].includes(String(form.project_type))) {
    toast.error('يرجى اختيار نوع المشروع');
    return;
  }
  if (!form.developer_id && !form.developer_name?.trim()) {
    toast.error('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…Ø·ÙˆØ± Ø£Ùˆ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ø³Ù… Ø§Ù„Ù…Ø·ÙˆØ±');
    return;
  }
  if (!form.city_id) {
    toast.error('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©');
    return;
  }
  if (!form.district_id) {
    toast.error('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­ÙŠ');
    return;
  }
  if (!form.side) {
    toast.error('ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹');
    return;
  }
  isLoading.value = true;
  try {
    const payload = buildExclusiveContractPayload({
      form,
      developers: developers.value,
      commissionPercentInput: commissionPercentInput.value,
      unitTypeOptions,
    });

    await contractService.createContract(payload);

    notificationService.addNotification(
      'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø­ØµØ±ÙŠ Ø¨Ù†Ø¬Ø§Ø­ ÙˆÙ‡Ùˆ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©.',
      'success'
    );
    toast.success('ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ø¨Ù†Ø¬Ø§Ø­! Ø§Ù„Ø·Ù„Ø¨ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©.');
    resetForm();
    // Ø¥Ø¸Ù‡Ø§Ø± Ø±Ø³Ø§Ù„Ø© ØªØ£ÙƒÙŠØ¯ ÙˆØ§Ø¶Ø­Ø© Ø¹Ù„Ù‰ Ø§Ù„ØµÙØ­Ø©
    showSuccessConfirm.value = true;
  } catch (error) {
    const status = error?.response?.status ?? error?.status;
    logger.error(`Exclusive project request failed [HTTP ${status}]`, error);
    const fallback =
      status === 403
        ? 'Ø§Ù„Ø®Ø§Ø¯Ù… Ø±ÙØ¶ Ø§Ù„Ø·Ù„Ø¨: Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ø¥Ù†Ø´Ø§Ø¡ Ø¹Ù‚Ø¯. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø­Ø³Ø§Ø¨Ùƒ ÙŠØ³Ù…Ø­ Ø¨Ø¥Ù†Ø´Ø§Ø¡ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠ (Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…).'
        : 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨';
    showApiError(error, fallback);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped src="./styles/ExclusiveProjectView.scoped.s1.css"></style>
<style scoped src="./styles/ExclusiveProjectView.scoped.s2.css"></style>

