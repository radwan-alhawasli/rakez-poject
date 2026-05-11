<template>
  <div class="modal-overlay" @click.self="$emit('close')">
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
        <button type="button" class="modal-close" @click="$emit('close')">×</button>
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
                <span class="detail-value">{{ formatProjectLocationRow(selectedProjectDetails) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">المدينة / الحي</span>
                <span class="detail-value">{{ formatCityDistrictRow(selectedProjectDetails) }}</span>
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
                <span class="detail-label">نسبة السعي</span>
                <span class="detail-value number">{{ Number(selectedProjectDetails.commission_percentage ?? 0) + '%' }}</span>
              </div>
              <div class="detail-item detail-item--stacked marketing-percent-block">
                <span class="detail-label">نسبة التسويق (المشروع)</span>
                <span
                  v-if="selectedProjectDetails.marketing_percent_source === 'marketing_project'"
                  class="marketing-percent-source-badge"
                  title="القيمة من سجل مشروع التسويق"
                >مصدر: مشروع تسويق</span>
                <template v-if="hasPermission('marketing.budgets.manage')">
                  <div class="marketing-percent-input-row">
                    <input
                      :value="marketingPercentDraft"
                      type="number"
                      class="form-input marketing-percent-ui-input"
                      min="6"
                      max="10"
                      step="0.5"
                      inputmode="decimal"
                      placeholder="6–10 أو اترك فارغاً للمسح عند الحفظ"
                      :disabled="isSavingMarketingPercent || isLoadingProjectDetails"
                      aria-describedby="marketing-percent-hint"
                      @input="$emit('update:marketingPercentDraft', ($event.target).value)"
                    />
                    <button
                      type="button"
                      class="btn-primary marketing-percent-save-btn"
                      :disabled="isSavingMarketingPercent || isLoadingProjectDetails"
                      @click="saveProjectMarketingPercent"
                    >
                      حفظ
                    </button>
                    <button
                      type="button"
                      class="btn-secondary marketing-percent-clear-btn"
                      :disabled="isSavingMarketingPercent || isLoadingProjectDetails"
                      @click="clearProjectMarketingPercent"
                    >
                      مسح النسبة
                    </button>
                  </div>
                </template>
                <template v-else>
                  <p class="detail-value number marketing-percent-readonly">
                    {{
                      selectedProjectDetails.marketing_percent != null &&
                      selectedProjectDetails.marketing_percent !== ''
                        ? Number(selectedProjectDetails.marketing_percent) + '%'
                        : 'غير محدد'
                    }}
                  </p>
                </template>
                <p id="marketing-percent-hint" class="detail-ui-only-hint">
                  <template v-if="hasPermission('marketing.budgets.manage')">
                    النسبة الرسمية للمشروع (6%–10%)؛ تُزامن مع خطط المطور والموظفين بعد الحفظ. التعديل يتطلب صلاحية إدارة الميزانية.
                  </template>
                  <template v-else>عرض فقط — تعديل النسبة يتطلب صلاحية إدارة الميزانية (marketing.budgets.manage).</template>
                </p>
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

            <div class="overview-section marketing-teams-panel" style="margin-top: 18px">
              <header class="marketing-teams-panel__header">
                <div class="marketing-teams-panel__header-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div class="marketing-teams-panel__header-text">
                  <h3 class="marketing-teams-panel__title">فرق التسويق</h3>
                  <p class="marketing-teams-panel__subtitle">
                    فرق المبيعات المسؤولة عن المشروع وأعضاء كل فريق وتقييمهم — من بيانات المشروع نفسها.
                  </p>
                </div>
              </header>

              <div v-if="!marketingTeamsWithMembers.length" class="marketing-teams-empty" role="status">
                <div class="marketing-teams-empty__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 8h4M7 12h10M7 16h6" />
                  </svg>
                </div>
                <p class="marketing-teams-empty__title">لا توجد فرق مسجّلة لهذا المشروع</p>
                <p class="marketing-teams-empty__hint">عند ربط فرق تسويق بالمشروع ستظهر هنا مع تفاصيل الأعضاء والتقييمات.</p>
              </div>

              <div v-else class="marketing-teams-stack">
                <div
                  v-for="(row, idx) in marketingTeamsWithMembers"
                  :key="row.team?.id ?? idx"
                  class="marketing-team-card"
                >
                  <div class="marketing-team-card__head">
                    <span class="marketing-team-card__badge" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </span>
                    <div class="marketing-team-card__head-text">
                      <h4 class="marketing-team-card__title">{{ marketingTeamDisplayName(row.team) }}</h4>
                      <span v-if="row.team?.description" class="marketing-team-card__desc">{{ row.team.description }}</span>
                    </div>
                  </div>
                  <p v-if="!row.members.length" class="marketing-team-card__empty">
                    لا يوجد أعضاء مدرَجون لهذا الفريق في بيانات المشروع.
                  </p>
                  <div v-else class="table-wrapper table-responsive marketing-team-table-wrap">
                    <table class="luxury-table table-mobile-stacked marketing-team-members-table">
                      <thead>
                        <tr>
                          <th>العضو</th>
                          <th>التقييم</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(m, mi) in row.members" :key="m.id ?? m.user_id ?? mi" class="hover-row">
                          <td data-label="العضو" class="marketing-team-member-name">{{ marketingMemberDisplayName(m) }}</td>
                          <td data-label="التقييم">
                            <span
                              class="marketing-rating-pill"
                              :class="{ 'marketing-rating-pill--muted': marketingMemberRatingLabel(m) === '—' }"
                            >{{ marketingMemberRatingLabel(m) }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
              <button type="button" class="btn-text" @click="$emit('update:showUnitsTable', false)" style="background: none; border: none; color: #b1a28f; cursor: pointer; font-weight: bold; display: inline-flex; align-items: center; gap: 6px">
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
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedProjectDetails: { type: Object, default: null },
  isLoadingProjectDetails: { type: Boolean, default: false },
  isLoadingUnits: { type: Boolean, default: false },
  showUnitsTable: { type: Boolean, default: false },
  marketingPercentDraft: { type: [String, Number], default: '' },
  isSavingMarketingPercent: { type: Boolean, default: false },
  marketingTeamsWithMembers: { type: Array, default: () => [] },
  formatProjectLocationRow: { type: Function, required: true },
  formatCityDistrictRow: { type: Function, required: true },
  getStatusClass: { type: Function, required: true },
  getStatusText: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  contractTimelineDaysLeft: { type: Function, required: true },
  durationStatusClass: { type: Function, required: true },
  contractTimelineLabel: { type: Function, required: true },
  saveProjectMarketingPercent: { type: Function, required: true },
  clearProjectMarketingPercent: { type: Function, required: true },
  goToUnits: { type: Function, required: true },
  goToPhotography: { type: Function, required: true },
  hasPermission: { type: Function, required: true },
  marketingTeamDisplayName: { type: Function, required: true },
  marketingMemberDisplayName: { type: Function, required: true },
  marketingMemberRatingLabel: { type: Function, required: true },
  formatDistribution: { type: Function, required: true },
});

defineEmits(['close', 'update:showUnitsTable', 'update:marketingPercentDraft']);
</script>

<style scoped src="./styles/MarketingProjectsTab.scoped.css"></style>
