<template>
  <div class="management-view">
    <div class="section-header-compact">
      <div>
        <h2 class="section-title">ملفات المطالبة</h2>
        <p class="section-subtitle">
          إدارة ملفات المطالبة بالعمولات (فردية ومجمّعة). إنشاء ملفات جديدة من واجهة المطورين → تفاصيل المطور → اختر المشروع.
        </p>
      </div>
    </div>
    <div class="metrics-table-container">
      <div class="table-responsive">
      <table class="metrics-table table-mobile-stacked">
        <thead>
          <tr>
            <th>رقم الملف</th>
            <th>النوع</th>
            <th>المشروع</th>
            <th>المبلغ</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="claim in claimFiles" :key="claim.id">
            <td data-label="رقم الملف">{{ claim.id }}</td>
            <td data-label="النوع">
              <span v-if="claim.is_combined" class="type-badge combined">
                مجمّع ({{ claim.reservation_count || '—' }})
              </span>
              <span v-else class="type-badge single">فردي</span>
            </td>
            <td data-label="المشروع">{{ claim.project_name || 'غير محدد' }}</td>
            <td data-label="المبلغ">
              {{
                formatCurrency(
                  claim.is_combined ? claim.total_claim_amount : claim.claim_amount
                )
              }}
            </td>
            <td data-label="الحالة">
              <span class="status-tag" :class="getClaimStatusClass(claim.status)">
                {{ claim.status_label_ar || claim.status || 'قيد المعالجة' }}
              </span>
            </td>
            <td data-label="التاريخ">{{ formatDate(claim.created_at) }}</td>
            <td data-label="الإجراءات">
              <RowActions>
                <button
                  v-if="claim.has_pdf"
                  class="btn-action edit"
                  @click="downloadClaimPdf(claim)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  PDF
                </button>
                <button
                  v-if="!claim.has_pdf"
                  class="btn-action edit"
                  @click="generateClaimPdf(claim)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  إنشاء PDF
                </button>
                <button
                  v-if="claim.status === 'pending'"
                  class="btn-action edit"
                  @click="submitClaim(claim)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  إرسال
                </button>
                <button
                  v-if="claim.status === 'submitted'"
                  class="btn-action edit"
                  @click="approveClaim(claim)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  الموافقة
                </button>
                <template #menu>
                  <DropdownMenuItem v-if="claim.has_pdf" @click="downloadClaimPdf(claim)">PDF</DropdownMenuItem>
                  <DropdownMenuItem v-if="!claim.has_pdf" @click="generateClaimPdf(claim)">إنشاء PDF</DropdownMenuItem>
                  <DropdownMenuItem v-if="claim.status === 'pending'" @click="submitClaim(claim)">إرسال</DropdownMenuItem>
                  <DropdownMenuItem v-if="claim.status === 'submitted'" @click="approveClaim(claim)">الموافقة</DropdownMenuItem>
                </template>
              </RowActions>
            </td>
          </tr>
          <tr v-if="claimFiles.length === 0 && !isLoading">
            <td
              colspan="7"
              style="text-align: center; padding: 40px; color: var(--color-dark-gray)"
            >
              لا توجد ملفات مطالبة
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    <Pagination
      v-if="creditTotalItems > 0"
      :current-page="creditCurrentPage"
      :total-items="creditTotalItems"
      :per-page="creditPerPage"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />

    <ClaimFileForm
      v-if="showClaimModal"
      :claim="selectedClaim"
      :isLoading="isSavingClaim"
      @close="showClaimModal = false"
      @submit="handleClaimSubmit"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Pagination from '@/components/Pagination.vue';
import ClaimFileForm from '@/modules/credit/components/ClaimFileForm.vue';
import RowActions from '@/components/RowActions.vue';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useCreditClaimFiles } from '@/composables/credit/useCreditClaimFiles';

const {
  isLoading,
  claimFiles,
  currentPage: creditCurrentPage,
  perPage: creditPerPage,
  totalItems: creditTotalItems,
  showClaimModal,
  selectedClaim,
  isSavingClaim,
  formatCurrency,
  formatDate,
  getClaimStatusClass,
  loadClaimFiles,
  downloadClaimPdf,
  generateClaimPdf,
  submitClaim,
  approveClaim,
  handleClaimSubmit,
  handlePageChange,
  handlePerPageChange,
} = useCreditClaimFiles();

onMounted(() => {
  loadClaimFiles();
});
</script>

<style scoped>
@media (max-width: 768px) {
  .section-header-compact { padding: 16px; }
  .section-title { font-size: 18px; }
  .section-subtitle { font-size: 13px; }
}
@media (max-width: 576px) {
  .section-header-compact { padding: 12px; }
  .table-responsive { margin: 0 -12px; }
}
</style>
