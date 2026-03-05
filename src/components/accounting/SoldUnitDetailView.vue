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
          <div class="field-group">
            <label>نسبة العقد %</label>
            <input
              v-model.number="commissionForm.commission_percentage"
              type="number"
              class="form-input input-sm"
              min="0"
              max="100"
              step="0.1"
            />
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
              <label>نسبة العمولة (%)</label>
              <input
                v-model.number="commissionForm.commission_percentage"
                type="number"
                class="form-input"
                min="0"
                max="100"
                required
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
            <span class="card-value">{{ formatNumber(commissionSummary.bank_fees) }}</span>
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
                <th>المستفيد</th>
                <th>النسبة %</th>
                <th>المبلغ (ر.س)</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dist, idx) in distributions" :key="dist.id || idx">
                <td>{{ getTypeLabel(dist.type || dist.commission_type) }}</td>
                <td>{{ dist.percentage ? dist.percentage.toFixed(2) + '%' : '—' }}</td>
                <td>{{ formatNumber(dist.amount) }}</td>
                <td>
                  <button
                    v-if="!dist.confirmed && dist.status !== 'confirmed'"
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
                <td colspan="4" class="empty-row">لا توجد توزيعات</td>
              </tr>
              <tr v-if="distributions.length > 0 && totalDistPct < 100" class="total-row">
                <td>الشركة</td>
                <td>{{ (100 - totalDistPct).toFixed(2) }}%</td>
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
      commissionForm.commission_percentage = props.unit.commission_percentage ?? 0;
      commissionForm.commission_source = props.unit.commission_source || 'owner';
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

<style scoped>
.sold-unit-detail-view {
  padding: 0 24px 40px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-medium-gray);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray);
  margin: 4px 0 0;
}

.unit-info-bar {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
}

.unit-info-item {
  display: flex;
  gap: 8px;
}

.unit-info-label {
  font-weight: 600;
  color: var(--color-dark-gray);
}

.unit-info-value {
  color: var(--color-charcoal);
  font-weight: 500;
}

.unit-meta-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.price-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-label {
  font-size: 14px;
  color: var(--color-dark-gray);
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-navy);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.approved {
  background: #dcfce7;
  color: #166534;
}

.editable-fields {
  display: flex;
  gap: 16px;
  align-items: center;
}

.field-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-group label {
  font-size: 14px;
  color: var(--color-dark-gray);
  font-weight: 600;
}

.input-sm {
  width: 100px;
}

.create-commission-section {
  background: var(--color-light-gray);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  margin-bottom: 16px;
}

.create-form .form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.create-form .form-group {
  flex: 1;
  min-width: 180px;
}

.create-form .form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-charcoal);
  margin-bottom: 6px;
}

.form-actions {
  margin-top: 20px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
}

@media (max-width: 900px) {
  .distribution-grid {
    grid-template-columns: 1fr;
  }
}

.distribution-panel {
  background: var(--color-light-gray);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--color-medium-gray);
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 16px;
}

.marketer-section {
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-dark-gray);
  margin: 0 0 10px;
}

.distribution-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.distribution-row .form-input {
  flex: 1;
  min-width: 0;
}

.distribution-row .input-pct {
  width: 80px;
}

.calc-amount {
  font-weight: 600;
  color: var(--color-navy);
  min-width: 100px;
  text-align: left;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-dark-gray);
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

.btn-icon.delete {
  color: var(--color-dark-gray);
}

.btn-icon.delete:hover {
  color: #dc2626;
}

.subsection-icon {
  margin-left: 6px;
  font-size: 1em;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 2px dashed var(--color-medium-gray);
  border-radius: 10px;
  background: white;
  color: var(--color-dark-gray);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

.management-field {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--color-charcoal);
  cursor: pointer;
}

.external-fields {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 10px;
}

.management-percentages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mgmt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mgmt-row label {
  font-size: 14px;
  color: var(--color-charcoal);
  font-weight: 500;
}

.mgmt-row .input-pct {
  width: 80px;
}

.btn-save {
  margin-top: 20px;
}

.form-input {
  padding: 10px 14px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 10px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-gold);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 900px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

.summary-card {
  background: var(--color-light-gray);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--color-medium-gray);
}

.summary-card.vat .card-value {
  color: #dc2626;
}

.summary-card.net {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  border-color: transparent;
}

.summary-card.net .card-label,
.summary-card.net .card-value {
  color: white;
}

.card-label {
  display: block;
  font-size: 13px;
  color: var(--color-dark-gray);
  margin-bottom: 6px;
}

.card-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
}

.distribution-table-section {
  margin-bottom: 24px;
}

.distribution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.distribution-table th,
.distribution-table td {
  padding: 12px 16px;
  border: 1px solid var(--color-medium-gray);
  text-align: right;
}

.distribution-table th {
  background: var(--color-light-gray);
  font-weight: 600;
  color: var(--color-navy);
}

.distribution-table .empty-row {
  text-align: center;
  color: var(--color-dark-gray);
  padding: 24px;
}

.distribution-table .total-row {
  background: #dcfce7;
  font-weight: 700;
}

.status-confirmed {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 600;
}

.btn-action.confirm {
  padding: 6px 14px;
  border-radius: 8px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(177, 162, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .sold-unit-detail-view {
    padding: 0 16px 30px;
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .unit-info-bar {
    flex-direction: column;
    gap: 12px;
  }
  .unit-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .editable-fields {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .create-form .form-row {
    flex-direction: column;
    gap: 12px;
  }
  .distribution-row {
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .sold-unit-detail-view {
    padding: 0 12px 24px;
  }
  .page-title {
    font-size: 20px;
  }
  .summary-cards {
    grid-template-columns: 1fr;
  }
  .distribution-table {
    font-size: 12px;
    display: block;
    overflow-x: auto;
  }
  .distribution-table th,
  .distribution-table td {
    padding: 10px 12px;
    white-space: nowrap;
  }
  .create-commission-section {
    padding: 16px;
  }
  .mgmt-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

@media (max-width: 320px) {
  .sold-unit-detail-view {
    padding: 0 8px 20px;
  }
  .page-title {
    font-size: 18px;
  }
  .price-value {
    font-size: 16px;
  }
  .summary-card {
    padding: 12px;
  }
  .card-value {
    font-size: 16px;
  }
  .back-btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
