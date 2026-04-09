<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content luxury-modal animate-scale-in project-plans-modal">
      <div class="modal-header">
        <h3 class="modal-title">خطط المشروع</h3>
        <button type="button" class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body project-plans-modal-body">
        <p v-if="projectPlansModalProject?.project_name || projectPlansModalProject?.name" class="modal-message" style="margin-top: 0">
          {{ projectPlansModalProject.project_name || projectPlansModalProject.name }}
        </p>

        <section class="project-plans-section">
          <h4 class="project-plans-section-title">خطة المطور والمرفقات</h4>
          <div v-if="projectPlansModalPlanUrl" class="project-plans-actions">
            <button type="button" class="btn-primary" @click="openProjectPlanAttachment">فتح المرفق في تبويب جديد</button>
          </div>
          <p v-if="projectPlansModalHasDeveloperPlan" class="modal-message sub" style="margin: 8px 0">
            يوجد سجل خطة مطور مرتبط بالعقد.
          </p>
          <div v-if="projectPlansModalHasDeveloperPlan" class="project-plans-actions">
            <button type="button" class="btn-secondary" @click="goToDeveloperPlanEditorFromModal">عرض وتعديل خطة المطور</button>
          </div>
          <p
            v-if="!projectPlansModalPlanUrl && !projectPlansModalHasDeveloperPlan"
            class="modal-message sub"
          >
            لا يوجد مرفق خطة ولا سجل خطة مطور لهذا المشروع حالياً.
          </p>
        </section>

        <section class="project-plans-section">
          <h4 class="project-plans-section-title">خطط الموظفين</h4>
          <div v-if="projectPlansModalLoading" class="loading-state loading-state--inline">
            <div class="spinner"></div>
            <p>جاري تحميل خطط الموظفين...</p>
          </div>
          <template v-else-if="projectPlansModalEmployeePlans.length > 0">
            <div class="table-wrapper table-responsive project-plans-employee-table-wrap">
              <table class="luxury-table table-mobile-stacked" style="font-size: 0.9rem">
                <thead>
                  <tr>
                    <th>الموظف</th>
                    <th>قيمة التسويق</th>
                    <th>قيمة العمولة</th>
                    <th>توزيع المنصات</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ep in projectPlansModalEmployeePlans" :key="ep.id" class="hover-row">
                    <td data-label="الموظف">{{ ep.user?.name || ep.user_name || 'User #' + (ep.user_id ?? '—') }}</td>
                    <td data-label="قيمة التسويق" class="number">{{ formatCurrency(ep.marketing_value || 0) }}</td>
                    <td data-label="قيمة العمولة" class="number">{{ formatCurrency(ep.commission_value || 0) }}</td>
                    <td data-label="توزيع المنصات">{{ formatDistribution(ep.platform_distribution) }}</td>
                    <td data-label="التاريخ">{{ formatDate(ep.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <p v-else class="modal-message sub">لا توجد خطط موظفين مسجّلة لهذا المشروع.</p>
        </section>
      </div>
      <div class="modal-footer project-plans-modal-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')">إغلاق</button>
        <button
          v-if="hasPermission('marketing.plans.create')"
          type="button"
          class="btn-secondary"
          @click="goToEmployeePlansManagementFromModal"
        >
          إدارة خطط الموظفين
        </button>
        <button
          v-if="hasPermission('marketing.plans.create') && !projectPlansModalHasDeveloperPlan && !projectPlansModalPlanUrl"
          type="button"
          class="btn-primary"
          @click="goToManageDeveloperPlanFromPlansModal"
        >
          الانتقال لإعداد خطة المطور
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projectPlansModalProject: { type: Object, default: null },
  projectPlansModalLoading: { type: Boolean, default: false },
  projectPlansModalPlanUrl: { type: String, default: '' },
  projectPlansModalHasDeveloperPlan: { type: Boolean, default: false },
  projectPlansModalEmployeePlans: { type: Array, default: () => [] },
  formatCurrency: { type: Function, required: true },
  formatDistribution: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  hasPermission: { type: Function, required: true },
  openProjectPlanAttachment: { type: Function, required: true },
  goToDeveloperPlanEditorFromModal: { type: Function, required: true },
  goToEmployeePlansManagementFromModal: { type: Function, required: true },
  goToManageDeveloperPlanFromPlansModal: { type: Function, required: true },
});

defineEmits(['close']);
</script>

<style scoped src="./styles/MarketingProjectsTab.scoped.css"></style>
