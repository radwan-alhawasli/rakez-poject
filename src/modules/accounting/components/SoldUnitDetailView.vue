<template>
  <div class="sold-unit-detail-view" dir="rtl">
    <div class="detail-header">
      <button class="back-btn" @click="$emit('back')">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        رجوع
      </button>
      <div class="header-content">
        <h1 class="page-title">الوحدات المباعة والمراجعة</h1>
        <p class="page-subtitle">مراجعة وتعديل تفاصيل عمولات الوحدات المباعة.</p>
      </div>
    </div>

    <div v-if="unit" class="detail-body">
      <!-- Unit info bar -->
      <div class="unit-info-bar">
        <div class="unit-info-item">
          <span class="unit-info-label">وحدة:</span>
          <span class="unit-info-value"
            >{{ unit.unit_number || unit.reservation_id || unit.id }} /
            {{ unit.project_name || 'غير محدد' }}</span
          >
        </div>
        <div class="unit-info-item">
          <span class="unit-info-label">العميل:</span>
          <span class="unit-info-value">{{
            unit.customer_name || unit.client_name || 'غير محدد'
          }}</span>
        </div>
      </div>

      <div class="unit-meta-row">
        <div class="price-badge">
          <span class="price-label">سعر البيع النهائي</span>
          <span class="price-value">{{ formatCurrency(finalPrice) }}</span>
          <span v-if="commissionStatus" class="status-badge approved">{{ commissionStatus }}</span>
        </div>
        <div class="editable-fields">
          <div class="field-group field-group-readonly">
            <label>نسبة السعي</label>
            <span class="form-input input-sm input-readonly" title="من بيانات العقد المرتبط بالوحدة">{{
              commissionPercentDisplay
            }}</span>
          </div>
          <div class="field-group">
            <label>السعي من</label>
            <select v-model="commissionForm.commission_source" class="form-input input-sm">
              <option value="owner">المالك</option>
              <option value="buyer">المشتري</option>
            </select>
          </div>
        </div>
      </div>

      <!-- No commission: show create form -->
      <div v-if="!hasCommission" class="create-commission-section">
        <h3 class="section-title">إنشاء عمولة يدوية</h3>
        <form @submit.prevent="handleCreateCommission" class="create-form">
          <div class="form-row">
            <div class="form-group">
              <label>سعر البيع النهائي (ر.س)</label>
              <input
                v-model.number="commissionForm.final_selling_price"
                type="number"
                class="form-input"
                min="0"
                required
              />
            </div>
            <div class="form-group">
              <label>نسبة السعي (%)</label>
              <input
                v-model.number="commissionForm.commission_percentage"
                type="number"
                class="form-input"
                min="0"
                max="100"
                step="0.1"
                readonly
                title="قيمة ثابتة من بيانات العقد"
              />
            </div>
            <div class="form-group">
              <label>الفريق المسؤول</label>
              <input
                v-model="commissionForm.team_responsible"
                type="text"
                class="form-input"
                placeholder="فريق المبيعات"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>مصاريف التسويق (ر.س)</label>
              <input
                v-model.number="commissionForm.marketing_expenses"
                type="number"
                class="form-input"
                min="0"
              />
            </div>
            <div class="form-group">
              <label>رسوم البنك (ر.س)</label>
              <input
                v-model.number="commissionForm.bank_fees"
                type="number"
                class="form-input"
                min="0"
              />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">إنشاء عمولة</button>
          </div>
        </form>
      </div>

      <!-- Has commission: show distribution sections -->
      <template v-else>
        <div class="distribution-grid">
          <!-- Marketing (right in RTL) -->
          <div class="distribution-panel marketing-panel">
            <h3 class="panel-title">توزيع عمولات المسوقين</h3>

            <div class="marketer-section">
              <h4 class="subsection-title">
                <span class="subsection-icon"
                  ><svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="18"
                    height="18"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
                ></span>
                مسوقو الجلب
              </h4>
              <div v-for="(row, idx) in leadGenRows" :key="'lg-' + idx" class="distribution-row">
                <span class="calc-amount"
                  >{{ formatCurrency(calcAmount(row.percentage)) }} ر.س =</span
                >
                <input
                  v-model.number="row.percentage"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                  placeholder="النسبة %"
                />
                <select v-model="row.user_id" class="form-input">
                  <option :value="null">المسوق</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <button
                  type="button"
                  class="btn-icon delete"
                  @click="leadGenRows.splice(idx, 1)"
                  title="حذف"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
              <button type="button" class="btn-add" @click="addLeadGenRow">
                <span class="plus">+</span> إضافة مسوق جلب
              </button>
            </div>

            <div class="marketer-section">
              <h4 class="subsection-title">
                <span class="subsection-icon"
                  ><svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="18"
                    height="18"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle></svg
                ></span>
                مسوق البيع (إقفال)
              </h4>
              <div v-for="(row, idx) in closingRows" :key="'c-' + idx" class="distribution-row">
                <select v-model="row.user_id" class="form-input">
                  <option :value="null">المسوق</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <input
                  v-model.number="row.percentage"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                  placeholder="النسبة %"
                />
                <span class="calc-amount">{{ formatCurrency(calcAmount(row.percentage)) }}</span>
                <button
                  type="button"
                  class="btn-icon delete"
                  @click="closingRows.splice(idx, 1)"
                  title="حذف"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
              <button type="button" class="btn-add" @click="addClosingRow">+ إضافة</button>
            </div>

            <div class="marketer-section">
              <h4 class="subsection-title">
                <span class="subsection-icon"
                  ><svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    width="18"
                    height="18"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle></svg
                ></span>
                مسوق الإقناع
              </h4>
              <div v-for="(row, idx) in persuasionRows" :key="'p-' + idx" class="distribution-row">
                <select v-model="row.user_id" class="form-input">
                  <option :value="null">المسوق</option>
                  <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                    {{ emp.name }}
                  </option>
                </select>
                <input
                  v-model.number="row.percentage"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                  placeholder="النسبة %"
                />
                <span class="calc-amount">{{ formatCurrency(calcAmount(row.percentage)) }}</span>
                <button
                  type="button"
                  class="btn-icon delete"
                  @click="persuasionRows.splice(idx, 1)"
                  title="حذف"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
              <button type="button" class="btn-add" @click="addPersuasionRow">+ إضافة</button>
            </div>
          </div>

          <!-- Management (left in RTL) -->
          <div class="distribution-panel management-panel">
            <h3 class="panel-title">توزيع عمولات الإدارة</h3>
            <div class="management-field">
              <label class="checkbox-label">
                <input v-model="hasExternalBroker" type="checkbox" />
                يوجد وسيط خارجي؟
              </label>
            </div>
            <div v-if="hasExternalBroker" class="external-fields">
              <div class="form-group">
                <label>اسم الوسيط</label>
                <input v-model="externalMarketer.external_name" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>رقم الحساب البنكي</label>
                <input v-model="externalMarketer.bank_account" type="text" class="form-input" />
              </div>
              <div class="form-group">
                <label>النسبة %</label>
                <input
                  v-model.number="externalMarketer.percentage"
                  type="number"
                  class="form-input input-sm"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div class="management-percentages">
              <div class="mgmt-row">
                <label>قائد الفريق</label>
                <input
                  v-model.number="managementPct.team_leader"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>مساعد مدير مشروع</label>
                <input
                  v-model.number="managementPct.assistant_pm"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>مدير مشروع</label>
                <input
                  v-model.number="managementPct.project_manager"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>المالك</label>
                <input
                  v-model.number="managementPct.owner"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>مدير المبيعات</label>
                <input
                  v-model.number="managementPct.sales_manager"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>قسم المشاريع</label>
                <input
                  v-model.number="managementPct.projects_department"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>الإدارة</label>
                <input
                  v-model.number="managementPct.management"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
              <div class="mgmt-row">
                <label>CEO</label>
                <input
                  v-model.number="managementPct.ceo"
                  type="number"
                  class="form-input input-pct"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <button
              type="button"
              class="btn-primary btn-save"
              @click="handleSaveDistributions"
              :disabled="isSaving"
            >
              حفظ التوزيعات
            </button>
          </div>
        </div>

        <!-- Commission summary cards -->
        <div v-if="commissionSummary" class="summary-cards">
          <div class="summary-card">
            <span class="card-label">إجمالي العمولة (قبل الضريبة)</span>
            <span class="card-value">{{ formatNumber(commissionSummary.gross_amount) }}</span>
          </div>
          <div class="summary-card vat">
            <span class="card-label">ضريبة القيمة المضافة (15%)</span>
            <span class="card-value">{{ formatNumber(commissionSummary.vat) }}</span>
          </div>
          <div class="summary-card">
            <span class="card-label">رسوم البنك / الكاش</span>
            <input
              v-model.number="commissionForm.bank_fees"
              type="number"
              class="summary-input"
              min="0"
            />
          </div>
          <div class="summary-card net">
            <span class="card-label">الصافي النهائي للتوزيع</span>
            <span class="card-value">{{ formatCurrency(commissionSummary.net_amount) }}</span>
          </div>
        </div>

        <!-- Distribution table -->
        <div class="distribution-table-section">
          <h3 class="section-title">توزيع العمولة الصافية</h3>
          <div class="table-responsive">
          <table class="distribution-table">
            <thead>
              <tr>
                <th>نوع العمولة</th>
                <th>اسم المستفيد</th>
                <th>النسبة %</th>
                <th>المبلغ (ر.س)</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dist, idx) in distributions" :key="dist.id || idx">
                <td>{{ getTypeLabel(dist.type || dist.commission_type) }}</td>
                <td>{{ getBeneficiaryName(dist) }}</td>
                <td>{{ dist.percentage != null ? (Number(dist.percentage) || 0).toFixed(2) + '%' : '—' }}</td>
                <td>{{ formatNumber(dist.amount) }}</td>
                <td>
                  <button
                    v-if="canConfirmDistribution(dist)"
                    class="btn-action confirm"
                    @click="handleConfirmPayment(dist)"
                    :disabled="isSaving"
                  >
                    تأكيد
                  </button>
                  <span v-else class="status-confirmed">تم التأكيد</span>
                </td>
              </tr>
              <tr v-if="distributions.length === 0">
                <td colspan="5" class="empty-row">لا توجد توزيعات</td>
              </tr>
              <tr v-if="distributions.length > 0 && totalDistPct < 100" class="total-row">
                <td>الشركة</td>
                <td>—</td>
                <td>{{ (100 - (Number(totalDistPct) || 0)).toFixed(2) }}%</td>
                <td>{{ formatNumber(companyAmount) }}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import accountingService from '@/services/accountingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { useFormatters } from '@/composables/useFormatters';

/**
 * نسبة السعي من بيانات العقد (contract / contract_infos)، وليس من حقول طلب مشروع حصري فقط.
 */
function pickCommissionPercentFromContract(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const raw =
    c?.commission_percent ??
    c?.commission_percentage ??
    unit.contract_commission_percent ??
    unit.contract_commission_percentage ??
    null;
  if (raw === '' || raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function pickCommissionSourceFromContract(unit) {
  if (!unit || typeof unit !== 'object') return null;
  const nested =
    unit.contract ??
    unit.reservation?.contract ??
    unit.contract_unit?.contract ??
    unit.contract_info ??
    (Array.isArray(unit.contract_infos) ? unit.contract_infos[0] : unit.contract_infos);
  const c = nested && typeof nested === 'object' ? nested : null;
  const src = c?.commission_from ?? c?.commission_source ?? null;
  if (src === 'owner' || src === 'buyer') return src;
  return null;
}

const COMMISSION_TYPE_LABELS = {
  lead_generation: 'عمولة الجلب',
  persuasion: 'عمولة الإقناع',
  closing: 'عمولة الإقفال',
  team_leader: 'قائد الفريق',
  assistant_pm: 'مساعد مدير مشروع',
  project_manager: 'مدير مشروع',
  owner: 'المالك',
  sales_manager: 'مدير المبيعات',
  projects_department: 'قسم المشاريع',
  management: 'الإدارة',
  ceo: 'CEO',
  external_marketer: 'مسوق خارجي / المالك',
  other: 'أخرى',
};

export default {
  name: 'SoldUnitDetailView',
  props: {
    unit: { type: Object, default: null },
  },
  emits: ['back', 'create-commission'],
  setup(props, { emit }) {
    const { formatCurrency, formatNumber } = useFormatters();
    const employees = ref([]);
    const commissionSummary = ref(null);
    const distributions = ref([]);
    const isSaving = ref(false);

    const leadGenRows = reactive([{ user_id: null, percentage: 0 }]);
    const persuasionRows = reactive([{ user_id: null, percentage: 0 }]);
    const closingRows = reactive([{ user_id: null, percentage: 0 }]);
    const hasExternalBroker = ref(false);
    const externalMarketer = reactive({ external_name: '', bank_account: '', percentage: 0 });
    const managementPct = reactive({
      team_leader: 0,
      assistant_pm: 0,
      project_manager: 0,
      owner: 0,
      sales_manager: 0,
      projects_department: 0,
      management: 0,
      ceo: 0,
    });

    const commissionForm = reactive({
      contract_unit_id: null,
      final_selling_price: 0,
      commission_percentage: 0,
      commission_source: 'owner',
      team_responsible: '',
      marketing_expenses: 0,
      bank_fees: 0,
    });

    const contractCommissionPercent = computed(() => pickCommissionPercentFromContract(props.unit));
    const commissionPercentDisplay = computed(() => {
      const v = contractCommissionPercent.value;
      if (v == null) return '—';
      const n = Number(v);
      if (!Number.isFinite(n)) return '—';
      return `${n}%`;
    });

    const commissionId = computed(() => props.unit?.commission_id ?? props.unit?.commission?.id);
    const hasCommission = computed(() => !!commissionId.value);
    const finalPrice = computed(
      () =>
        props.unit?.final_sale_price ??
        props.unit?.total_value ??
        commissionForm.final_selling_price ??
        0
    );
    const commissionStatus = computed(
      () =>
        props.unit?.commission_status ||
        props.unit?.status ||
        (commissionSummary.value ? 'Approved' : null)
    );

    const totalDistPct = computed(() => {
      return distributions.value.reduce((sum, d) => sum + (parseFloat(d.percentage) || 0), 0);
    });

    const companyAmount = computed(() => {
      const net = commissionSummary.value?.net_amount || 0;
      const distTotal = distributions.value.reduce(
        (sum, d) => sum + (parseFloat(d.amount) || 0),
        0
      );
      return Math.max(0, net - distTotal);
    });

    const getTypeLabel = type => COMMISSION_TYPE_LABELS[type] || type || '—';

/** اسم المستفيد من التوزيعة: موظف أو مسوق خارجي */
const getBeneficiaryName = dist => {
      const name =
        dist.employee_name ?? dist.user_name ?? dist.external_name ?? '';
      return (name && String(name).trim()) ? String(name).trim() : '—';
    };

/** يظهر زر تأكيد إذا التوزيعة قابلة للتأكيد (لم تُؤكد بعد ولم تُدفع) */
const canConfirmDistribution = dist =>
      !dist.confirmed &&
      dist.status !== 'confirmed' &&
      dist.status !== 'paid' &&
      !!dist.id;

    const calcAmount = pct => {
      const net = commissionSummary.value?.net_amount || 0;
      return (net * (parseFloat(pct) || 0)) / 100;
    };

    const loadEmployees = async () => {
      try {
        const list = await accountingService.getMarketers();
        employees.value = (list || []).map(e => ({ id: e.id, name: e.name || e.email || '' }));
      } catch (e) {
        logger.error('Error loading marketers:', e);
      }
    };

    const hasPopulatedFromApi = ref(false);

    const loadCommissionSummary = async () => {
      if (!commissionId.value) return;
      try {
        commissionSummary.value = await accountingService.getCommissionSummary(commissionId.value);
        commissionForm.bank_fees = Number(commissionSummary.value?.bank_fees ?? 0);
        distributions.value = commissionSummary.value?.distributions || [];
        if (!hasPopulatedFromApi.value && distributions.value.length > 0) {
          leadGenRows.length = 0;
          persuasionRows.length = 0;
          closingRows.length = 0;
          distributions.value.forEach(d => {
            const type = d.type || d.commission_type;
            const row = { user_id: d.user_id, percentage: parseFloat(d.percentage) || 0 };
            if (type === 'lead_generation') leadGenRows.push(row);
            else if (type === 'persuasion') persuasionRows.push(row);
            else if (type === 'closing') closingRows.push(row);
            else if (type === 'team_leader')
              managementPct.team_leader = parseFloat(d.percentage) || 0;
            else if (type === 'assistant_pm')
              managementPct.assistant_pm = parseFloat(d.percentage) || 0;
            else if (type === 'project_manager')
              managementPct.project_manager = parseFloat(d.percentage) || 0;
            else if (type === 'sales_manager')
              managementPct.sales_manager = parseFloat(d.percentage) || 0;
            else if (type === 'owner') managementPct.owner = parseFloat(d.percentage) || 0;
            else if (type === 'projects_department')
              managementPct.projects_department = parseFloat(d.percentage) || 0;
            else if (type === 'management')
              managementPct.management = parseFloat(d.percentage) || 0;
            else if (type === 'ceo') managementPct.ceo = parseFloat(d.percentage) || 0;
            else if (type === 'other') managementPct.assistant_pm = parseFloat(d.percentage) || 0;
            else if (type === 'external_marketer') {
              hasExternalBroker.value = true;
              externalMarketer.external_name = d.external_name || '';
              externalMarketer.bank_account = d.bank_account || '';
              externalMarketer.percentage = parseFloat(d.percentage) || 0;
            }
          });
          if (leadGenRows.length === 0) leadGenRows.push({ user_id: null, percentage: 0 });
          if (persuasionRows.length === 0) persuasionRows.push({ user_id: null, percentage: 0 });
          if (closingRows.length === 0) closingRows.push({ user_id: null, percentage: 0 });
          hasPopulatedFromApi.value = true;
        }
      } catch (e) {
        logger.error('Error loading commission summary:', e);
        commissionSummary.value = null;
        distributions.value = [];
      }
    };

    const initFormFromUnit = () => {
      if (!props.unit) return;
      commissionForm.contract_unit_id =
        props.unit.contract_unit_id || props.unit.unit_id || props.unit.id;
      commissionForm.final_selling_price =
        props.unit.final_sale_price ?? props.unit.total_value ?? 0;
      const pct = pickCommissionPercentFromContract(props.unit);
      commissionForm.commission_percentage = pct != null ? pct : 0;
      const srcContract = pickCommissionSourceFromContract(props.unit);
      commissionForm.commission_source =
        srcContract || props.unit.commission_source || 'owner';
      commissionForm.team_responsible = props.unit.team_name || '';
    };

    const addLeadGenRow = () => leadGenRows.push({ user_id: null, percentage: 0 });
    const addPersuasionRow = () => persuasionRows.push({ user_id: null, percentage: 0 });
    const addClosingRow = () => closingRows.push({ user_id: null, percentage: 0 });

    const buildDistributionsPayload = () => {
      const dists = [];
      leadGenRows.forEach(r => {
        if (r.user_id && r.percentage > 0)
          dists.push({ type: 'lead_generation', user_id: r.user_id, percentage: r.percentage });
      });
      persuasionRows.forEach(r => {
        if (r.user_id && r.percentage > 0)
          dists.push({ type: 'persuasion', user_id: r.user_id, percentage: r.percentage });
      });
      closingRows.forEach(r => {
        if (r.user_id && r.percentage > 0)
          dists.push({ type: 'closing', user_id: r.user_id, percentage: r.percentage });
      });
      if (managementPct.team_leader > 0)
        dists.push({ type: 'team_leader', user_id: null, percentage: managementPct.team_leader });
      if (managementPct.assistant_pm > 0)
        dists.push({ type: 'assistant_pm', user_id: null, percentage: managementPct.assistant_pm });
      if (managementPct.project_manager > 0)
        dists.push({
          type: 'project_manager',
          user_id: null,
          percentage: managementPct.project_manager,
        });
      if (managementPct.owner > 0)
        dists.push({ type: 'owner', user_id: null, percentage: managementPct.owner });
      if (managementPct.sales_manager > 0)
        dists.push({
          type: 'sales_manager',
          user_id: null,
          percentage: managementPct.sales_manager,
        });
      if (managementPct.projects_department > 0)
        dists.push({
          type: 'projects_department',
          user_id: null,
          percentage: managementPct.projects_department,
        });
      if (managementPct.management > 0)
        dists.push({ type: 'management', user_id: null, percentage: managementPct.management });
      if (managementPct.ceo > 0)
        dists.push({ type: 'ceo', user_id: null, percentage: managementPct.ceo });
      if (hasExternalBroker.value && externalMarketer.percentage > 0) {
        dists.push({
          type: 'external_marketer',
          external_name: externalMarketer.external_name,
          bank_account: externalMarketer.bank_account,
          percentage: externalMarketer.percentage,
        });
      }
      return dists;
    };

    const handleSaveDistributions = async () => {
      const dists = buildDistributionsPayload();
      const total = dists.reduce((s, d) => s + (d.percentage || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        toast.warning('مجموع النسب يجب أن يساوي 100%');
        return;
      }
      if (!commissionId.value) return;
      isSaving.value = true;
      try {
        await accountingService.updateDistributions(commissionId.value, { distributions: dists });
        toast.success('تم تحديث التوزيعات بنجاح');
        loadCommissionSummary();
      } catch (e) {
        logger.error('Error saving distributions:', e);
        toast.error('حدث خطأ أثناء حفظ التوزيعات');
      } finally {
        isSaving.value = false;
      }
    };

    const handleConfirmPayment = async dist => {
      if (!commissionId.value || !dist.id) return;
      isSaving.value = true;
      try {
        await accountingService.confirmPayment(commissionId.value, dist.id, {});
        toast.success('تم تأكيد الدفع بنجاح');
        loadCommissionSummary();
      } catch (e) {
        logger.error('Error confirming payment:', e);
        toast.error('حدث خطأ أثناء تأكيد الدفع');
      } finally {
        isSaving.value = false;
      }
    };

    const handleCreateCommission = () => {
      const payload = {
        ...commissionForm,
        contract_unit_id: commissionForm.contract_unit_id || props.unit?.id || 1,
      };
      emit('create-commission', payload);
    };

    watch(
      () => props.unit,
      u => {
        hasPopulatedFromApi.value = false;
        initFormFromUnit();
        if (u?.commission_id || u?.commission?.id) loadCommissionSummary();
      },
      { immediate: true }
    );

    watch(commissionId, id => {
      if (id) loadCommissionSummary();
    });

    onMounted(() => {
      loadEmployees();
      initFormFromUnit();
    });

    return {
      employees,
      commissionSummary,
      distributions,
      commissionForm,
      commissionPercentDisplay,
      leadGenRows,
      persuasionRows,
      closingRows,
      hasExternalBroker,
      externalMarketer,
      managementPct,
      hasCommission,
      finalPrice,
      commissionStatus,
      totalDistPct,
      companyAmount,
      isSaving,
      formatCurrency,
      formatNumber,
      getTypeLabel,
      getBeneficiaryName,
      canConfirmDistribution,
      calcAmount,
      addLeadGenRow,
      addPersuasionRow,
      addClosingRow,
      handleSaveDistributions,
      handleConfirmPayment,
      handleCreateCommission,
    };
  },
};
</script>

<style scoped src="./styles/SoldUnitDetailView.scoped.s1.css"></style>
<style scoped src="./styles/SoldUnitDetailView.scoped.s2.css"></style>
