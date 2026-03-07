<template>
  <div>
    <div class="welcome-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px">
      <div class="header-content">
        <h1 class="welcome-title">المشاريع التسويقية</h1>
        <p class="welcome-subtitle">إدارة ومتابعة جميع المشاريع التسويقية</p>
      </div>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
          <input
            v-model="projectSearchQuery"
            type="text"
            placeholder="ابحث عن مشروع..."
            class="form-input"
            style="max-width: 260px"
          />
          <button v-if="hasPermission('marketing.budget.calculate')" class="btn-primary" @click="openCalculateBudgetModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="8" y1="10" x2="8" y2="10"></line><line x1="12" y1="10" x2="12" y2="10"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="12" y1="14" x2="12" y2="14"></line><line x1="8" y1="18" x2="8" y2="18"></line><line x1="12" y1="18" x2="12" y2="18"></line></svg>
            حساب الميزانية
          </button>
        </div>
    </div>

    <div v-if="isLoadingProjects" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
      <p>لا توجد مشاريع تسويقية حالياً</p>
    </div>

    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3 class="project-name">{{ project.project_name || project.name || 'Project #' + project.id }}</h3>
          <span class="project-status" :class="getStatusClass(project.status)">{{ getStatusText(project.status) }}</span>
        </div>
        <div class="project-details">
          <div class="detail-row">
            <span class="detail-label">المطور</span>
            <span class="detail-value">{{ project.developer_name || '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">الوحدات المتاحة</span>
            <span class="detail-value number">{{ project.available_units_count ?? 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">متوسط السعر</span>
            <span class="detail-value number">{{ formatCurrency(project.average_unit_price ?? 0) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">العمولة</span>
            <span class="detail-value number">{{ Number(project.commission_percentage ?? 0) }}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">مدة العقد</span>
            <span class="detail-value">
              <span class="project-status" :class="durationStatusClass(contractTimelineDaysLeft(project))">{{ contractTimelineLabel(project) }}</span>
            </span>
          </div>
        </div>
        <div class="project-actions">
          <button class="btn-view" @click="viewProjectDetails(project)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            التفاصيل
          </button>
          <button class="btn-plan" @click="viewProjectPlan(project)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            الخطة
          </button>
        </div>
      </div>
    </div>

    <!-- Calculate Budget Modal -->
    <div
      v-if="showCalculateBudgetModal"
      class="modal-overlay"
      @click.self="showCalculateBudgetModal = false"
    >
      <div class="modal-content luxury-modal animate-scale-in">
        <div class="modal-header">
          <h3 class="modal-title">حساب الميزانية التسويقية</h3>
          <button class="modal-close" @click="showCalculateBudgetModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>المشروع <span class="required">*</span></label>
            <select
              v-model="budgetForm.project_id"
              class="form-input"
              @change="onBudgetProjectChange"
              required
            >
              <option value="">-- اختر مشروعاً --</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">
                {{ p.project_name || p.name || 'Project #' + p.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>رقم العقد <span class="required">*</span></label>
            <input
              type="number"
              v-model="budgetForm.contract_id"
              class="form-input"
              placeholder="يتم جلبه تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>سعر الوحدة المتوقع <span class="required">*</span></label>
            <input
              type="number"
              v-model="budgetForm.unit_price"
              class="form-input"
              placeholder="يتم جلبه تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>نسبة العمولة % (من العقد)</label>
            <input
              type="number"
              v-model="budgetForm.commission_percent"
              class="form-input"
              placeholder="يتم جلبها تلقائياً"
              disabled
            />
          </div>
          <div class="form-group">
            <label>نسبة التسويق المستقطعة % <span class="required">*</span></label>
            <input
              type="number"
              step="0.01"
              v-model="budgetForm.marketing_percent"
              class="form-input"
              placeholder="أدخل نسبة التسويق من العمولة"
            />
          </div>
          <div class="form-group">
            <label>مدة العقد (بالأيام)</label>
            <input type="number" v-model="budgetForm.contract_duration_days" class="form-input" />
          </div>
          <div class="form-group">
            <label>مدة العقد (بالأشهر)</label>
            <input type="number" v-model="budgetForm.contract_duration_months" class="form-input" />
          </div>
          <div v-if="budgetResult" class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Commission Value</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.commission_value || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Marketing Value</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.marketing_value || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Daily Budget</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.daily_budget || 0)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Monthly Budget</span
              ><span class="detail-value number">{{
                formatCurrency(budgetResult.monthly_budget || 0)
              }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCalculateBudgetModal = false">إلغاء</button>
          <button class="btn-primary" @click="calculateBudget">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; margin-left: 8px"><polyline points="20 6 9 17 4 12"></polyline></svg>
            حساب
          </button>
        </div>
      </div>
    </div>

    <!-- Project Details Modal -->
    <div
      v-if="showProjectDetailsModal"
      class="modal-overlay"
      @click.self="showProjectDetailsModal = false"
    >
      <div class="modal-content luxury-modal animate-scale-in" style="max-width: 980px">
        <div class="modal-header">
          <h3 class="modal-title">
            تفاصيل المشروع:
            {{
              selectedProjectDetails?.project_name ||
              selectedProjectDetails?.name ||
              'Project #' + (selectedProjectDetails?.id ?? '')
            }}
          </h3>
          <button class="modal-close" @click="showProjectDetailsModal = false">×</button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingProjectDetails" class="loading-state" style="padding: 20px">
            <div class="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>

          <div v-else-if="!selectedProjectDetails" class="empty-state" style="padding: 20px">
            <p>لا توجد بيانات لهذا المشروع</p>
          </div>

          <div v-else>
            <div v-if="!showUnitsTable">
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">المطور</span>
                  <span class="detail-value">{{ selectedProjectDetails.developer_name || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الموقع</span>
                  <span class="detail-value">{{ selectedProjectDetails.location || selectedProjectDetails.city || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">المدينة / الحي</span>
                  <span class="detail-value">{{ [selectedProjectDetails.city, selectedProjectDetails.district].filter(Boolean).join(' / ') || '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الحالة</span>
                  <span class="detail-value">
                    <span class="project-status" :class="getStatusClass(selectedProjectDetails.status)">{{ getStatusText(selectedProjectDetails.status) }}</span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">رقم العقد</span>
                  <span class="detail-value number">{{ selectedProjectDetails.contract_number ?? selectedProjectDetails.marketing_project?.contract_id ?? '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">الوحدات (متاح/معلق)</span>
                  <span class="detail-value number">{{ (selectedProjectDetails.available_units_count ?? 0) + ' / ' + (selectedProjectDetails.pending_units_count ?? 0) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">متوسط سعر الوحدة</span>
                  <span class="detail-value number">{{ formatCurrency(selectedProjectDetails.average_unit_price ?? 0) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">نسبة العمولة</span>
                  <span class="detail-value number">{{ Number(selectedProjectDetails.commission_percentage ?? 0) + '%' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">قيمة الوحدات المتاحة</span>
                  <span class="detail-value number">{{ formatCurrency(selectedProjectDetails.available_units_value ?? 0) }}</span>
                </div>
                <div class="detail-item" v-if="selectedProjectDetails.advertiser_number != null || selectedProjectDetails.advertiser_number_value != null">
                  <span class="detail-label">رقم المعلن</span>
                  <span class="detail-value number">{{ selectedProjectDetails.advertiser_number_value ?? selectedProjectDetails.advertiser_number ?? '—' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">حالة التسويق</span>
                  <span class="detail-value">
                    <span class="project-status" :class="getStatusClass(selectedProjectDetails.marketing_project?.status)">{{ getStatusText(selectedProjectDetails.marketing_project?.status) }}</span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">مدة العقد المتبقية</span>
                  <span class="detail-value">
                    <span class="project-status" :class="durationStatusClass(contractTimelineDaysLeft(selectedProjectDetails))">{{ contractTimelineLabel(selectedProjectDetails) }}</span>
                  </span>
                </div>
                <div class="detail-item clickable" @click="goToUnits(selectedProjectDetails.id)" style="cursor: pointer; border-color: #2563eb; background: rgba(37, 99, 235, 0.05)">
                  <span class="detail-label" style="color: #2563eb">وحدات المشروع</span>
                  <span class="detail-value link" style="color: #2563eb; font-weight: bold">
                    عرض الوحدات ({{ (selectedProjectDetails?.units?.length ?? Number(selectedProjectDetails?.available_units_count ?? 0) + Number(selectedProjectDetails?.pending_units_count ?? 0)) || '?' }}) ↗
                  </span>
                </div>
                <div class="detail-item clickable" @click="goToPhotography(selectedProjectDetails.id)" style="cursor: pointer; border-color: #059669; background: rgba(5, 150, 105, 0.05)">
                  <span class="detail-label" style="color: #059669">صور وفيديوهات التحرير</span>
                  <span class="detail-value link" style="color: #059669; font-weight: bold">عرض التصوير ↗</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1" v-if="(selectedProjectDetails.description || '').trim()">
                  <span class="detail-label">وصف المشروع</span>
                  <span class="detail-value">{{ selectedProjectDetails.description || '—' }}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1">
                  <span class="detail-label">ملاحظات</span>
                  <span class="detail-value">{{ selectedProjectDetails.notes || '—' }}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1">
                  <span class="detail-label">متطلبات المطور</span>
                  <span class="detail-value">{{ selectedProjectDetails.developer_requirement || '—' }}</span>
                </div>
              </div>

              <div class="overview-section" style="margin-top: 18px">
                <div class="section-header" style="margin-bottom: 14px">
                  <h3 class="section-title-chart">إدارة فرق التسويق</h3>
                  <p class="section-desc">تعيين الصلاحيات للفرق المسؤولة عن هذا المشروع.</p>
                </div>
                <div class="detail-item" style="margin-bottom: 12px">
                  <span class="detail-label">الموظف المقترح للتواصل</span>
                  <span class="detail-value">{{ getRecommendedEmployee(selectedProjectDetails) }}</span>
                </div>
                <div class="add-team-card-luxury" style="background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0">
                  <div class="add-team-form" style="display: flex; gap: 10px; align-items: center">
                    <div style="flex: 1; position: relative">
                      <select v-model="selectedTeamIdToAdd" class="luxury-select" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px">
                        <option value="" disabled selected>اختر فريقاً للإضافة...</option>
                        <option v-for="team in availableTeams" :key="team.id" :value="team.id">{{ team.name }}</option>
                      </select>
                    </div>
                    <button class="btn-primary" @click="assignTeamToProject" :disabled="!selectedTeamIdToAdd || isTeamActionLoading" style="white-space: nowrap">
                      {{ isTeamActionLoading ? 'جاري...' : 'إضافة +' }}
                    </button>
                  </div>
                </div>
                <div v-if="(selectedProjectDetails.marketing_project?.teams || []).length === 0" style="color: #64748b; text-align: center; padding: 20px">
                  لا توجد فرق معينة حالياً.
                </div>
                <div v-else class="teams-grid-luxury" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px">
                  <div v-for="t in selectedProjectDetails.marketing_project.teams" :key="t.id" class="team-card-mini" style="background: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 10px; display: flex; flex-direction: column; gap: 5px; position: relative">
                    <div style="display: flex; justify-content: space-between; align-items: start">
                      <span class="team-name" style="font-weight: bold; color: #1e3a5f">{{ t.name || t.user?.name || 'Team #' + t.id }}</span>
                      <button @click="removeTeamFromProject(t)" class="btn-icon-mini" title="إزالة" :disabled="isTeamActionLoading" style="background: none; border: none; color: #ef4444; cursor: pointer">
                        <span style="font-size: 16px">×</span>
                      </button>
                    </div>
                    <span class="team-role" style="font-size: 12px; color: #64748b">{{ t.description || 'فريق تسويق' }}</span>
                  </div>
                </div>
              </div>

              <div class="overview-section" style="margin-top: 18px">
                <div class="section-header" style="margin-bottom: 14px">
                  <h3 class="section-title-chart">خطة المطور</h3>
                  <p class="section-desc">تعرض الحقول المتاحة من developer_plan.</p>
                </div>
                <div v-if="!selectedProjectDetails.developer_plan" style="color: #64748b">لا توجد خطة مطور.</div>
                <div v-else class="details-grid" style="margin-top: 10px">
                  <div class="detail-item"><span class="detail-label">قيمة التسويق</span><span class="detail-value number">{{ formatCurrency(selectedProjectDetails.developer_plan.marketing_value || 0) }}</span></div>
                  <div class="detail-item"><span class="detail-label">Average CPM</span><span class="detail-value number">{{ selectedProjectDetails.developer_plan.average_cpm ?? '—' }}</span></div>
                  <div class="detail-item"><span class="detail-label">Average CPC</span><span class="detail-value number">{{ selectedProjectDetails.developer_plan.average_cpc ?? '—' }}</span></div>
                  <div class="detail-item"><span class="detail-label">Expected Impressions</span><span class="detail-value number">{{ formatNumber(selectedProjectDetails.developer_plan.expected_impressions || 0) }}</span></div>
                  <div class="detail-item"><span class="detail-label">Expected Clicks</span><span class="detail-value number">{{ formatNumber(selectedProjectDetails.developer_plan.expected_clicks || 0) }}</span></div>
                </div>
              </div>

              <div v-if="(selectedProjectDetails.employee_plans || []).length > 0" class="leads-table-container table-responsive" style="margin-top: 18px">
                <div class="section-header" style="margin-bottom: 10px">
                  <h3 class="section-title-chart" style="margin: 0">خطط الموظفين</h3>
                  <p class="section-desc" style="margin: 6px 0 0">حسب employee_plans في API.</p>
                </div>
                <table class="luxury-table table-mobile-stacked">
                  <thead><tr><th>الموظف</th><th>قيمة التسويق</th><th>قيمة العمولة</th><th>توزيع المنصات</th><th>توزيع الحملات</th></tr></thead>
                  <tbody>
                    <tr v-for="p in selectedProjectDetails.employee_plans" :key="p.id" class="hover-row">
                      <td data-label="الموظف">{{ p.user?.name || 'User #' + (p.user_id ?? '—') }}</td>
                      <td data-label="قيمة التسويق" class="number">{{ formatCurrency(p.marketing_value || 0) }}</td>
                      <td data-label="قيمة العمولة" class="number">{{ formatCurrency(p.commission_value || 0) }}</td>
                      <td data-label="توزيع المنصات">{{ formatDistribution(p.platform_distribution) }}</td>
                      <td data-label="توزيع الحملات">{{ formatDistribution(p.campaign_distribution) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else class="units-view">
              <div class="units-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
                <h4 style="margin: 0; font-family: 'Amiri'; color: #1e3a5f">وحدات المشروع ({{ selectedProjectDetails?.units?.length || 0 }})</h4>
                <button class="btn-text" @click="showUnitsTable = false" style="background: none; border: none; color: #b1a28f; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  عودة للتفاصيل
                </button>
              </div>
              <div v-if="isLoadingUnits" class="loading-state"><div class="spinner"></div><p>جاري تحميل الوحدات...</p></div>
              <div v-else-if="!selectedProjectDetails?.units?.length" class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <p>لا توجد وحدات مضافة.</p>
              </div>
              <div v-else class="table-wrapper table-responsive" style="max-height: 400px; overflow-y: auto">
                <table class="luxury-table table-mobile-stacked" style="width: 100%">
                  <thead><tr><th>رقم الوحدة</th><th>الدور</th><th>الغرف</th><th>مساحة</th><th>السعر</th></tr></thead>
                  <tbody>
                    <tr v-for="unit in selectedProjectDetails.units" :key="unit.id" class="hover-row">
                      <td data-label="رقم الوحدة">{{ unit.unit_number || '-' }}</td>
                      <td data-label="الدور">{{ unit.floor != null && !Number.isNaN(Number(unit.floor)) ? unit.floor : '-' }}</td>
                      <td data-label="الغرف">{{ unit.rooms || '-' }}</td>
                      <td data-label="مساحة">{{ unit.area ? unit.area + ' م²' : '-' }}</td>
                      <td data-label="السعر" class="number">{{ unit.price ? formatCurrency(unit.price) : '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showProjectDetailsModal = false">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Plan Unavailable Modal -->
    <div v-if="showPlanUnavailableModal" class="modal-overlay" @click.self="closePlanUnavailableModal">
      <div class="modal-content luxury-modal animate-scale-in" style="max-width: 420px">
        <div class="modal-header">
          <h3 class="modal-title">عرض خطة المشروع</h3>
          <button type="button" class="modal-close" @click="closePlanUnavailableModal">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-message">
            لا توجد خطة مرفقة لهذا المشروع حالياً.
            <template v-if="planUnavailableProject?.project_name || planUnavailableProject?.name">
              ({{ planUnavailableProject.project_name || planUnavailableProject.name }})
            </template>
          </p>
          <p class="modal-message sub">يمكنك إعداد الخطة من تبويب «خطة المطور» ثم اختيار المشروع.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="closePlanUnavailableModal">إغلاق</button>
          <button v-if="hasPermission('marketing.plans.create')" type="button" class="btn-primary" @click="goToManagePlanFromModal">الانتقال لإعداد الخطة</button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useMarketingProjects } from '@/composables/marketing/useMarketingProjects';

const {
  projects,
  filteredProjects,
  projectSearchQuery,
  isLoadingProjects,
  selectedProjectDetails,
  isLoadingProjectDetails,
  showUnitsTable,
  isLoadingUnits,
  availableTeams,
  selectedTeamIdToAdd,
  isTeamActionLoading,
  showProjectDetailsModal,
  showCalculateBudgetModal,
  showPlanUnavailableModal,
  planUnavailableProject,
  showConfirmModal,
  confirmModalConfig,
  budgetForm,
  budgetResult,
  isSubmitting,
  viewProjectDetails,
  assignTeamToProject,
  removeTeamFromProject,
  onConfirmModalConfirm,
  goToUnits,
  goToPhotography,
  managePlan,
  viewProjectPlan,
  closePlanUnavailableModal,
  goToManagePlanFromModal,
  onBudgetProjectChange,
  openCalculateBudgetModal,
  calculateBudget,
  getStatusClass,
  getStatusText,
  contractTimelineDaysLeft,
  durationStatusClass,
  contractTimelineLabel,
  getRecommendedEmployee,
  formatDistribution,
  formatCurrency,
  formatNumber,
  hasPermission,
} = useMarketingProjects();
</script>

<style scoped>
@media (max-width: 1200px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); }
  .details-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .projects-grid { grid-template-columns: 1fr; }
  .details-grid { grid-template-columns: 1fr; }
  .modal-content { margin: 10px; max-width: 100% !important; }
}
@media (max-width: 576px) {
  .project-card { padding: 14px; }
  .project-name { font-size: 15px; }
  .table-responsive { margin: 0 -12px; }
}
</style>
