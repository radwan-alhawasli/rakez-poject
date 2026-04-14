<template>
  <div class="tab-content">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    <template v-else>
      <div class="tracker-header-box">
        <h2 class="tracker-title">إدارة التصوير والوسائط</h2>
        <h3 class="tracker-subtitle">{{ projectName }}</h3>
        <p class="tracker-desc">يمكنك هنا رفع وتحديث صور وفيديوهات المشروع.</p>

        <div
          class="status-bar mt-4 flex gap-2.5 items-center"
        >
          <span
            class="status-badge"
            :class="{
              pending: photographyForm.status === 'pending',
              approved: photographyForm.status === 'approved',
              rejected: photographyForm.status === 'rejected',
            }"
          >
            {{
              photographyForm.status === 'approved'
                ? 'تم القبول'
                : photographyForm.status === 'rejected'
                ? 'مرفوض'
                : 'قيد الانتظار'
            }}
          </span>

          <div
            v-if="photographyForm.updated_at"
            class="update-info-badge text-gray-500 text-[13px]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="16"
              height="16"
              class="align-middle ml-1"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            آخر تحديث: {{ photographyForm.updated_at }}
          </div>
        </div>
      </div>

      <div class="stage-content-area max-w-[800px] mx-auto">
        <!-- Manager Approval Controls -->
        <div
          v-if="isManager && photographyForm.status === 'pending'"
          class="manager-actions-card bg-white border border-gray-200 p-5 rounded-xl mb-5 shadow-md"
        >
          <h4 class="mt-0 text-gray-800">طلب موافقة على الصور</h4>
          <p class="text-gray-500 text-sm mb-4">
            قام المطور برفع صور جديدة. يرجى المراجعة واتخاذ القرار.
          </p>
          <div class="flex gap-2.5">
            <button
              @click="approvePhotography"
              class="btn-success bg-emerald-500 text-white py-2 px-4 rounded-md border-none cursor-pointer font-bold"
            >
              قبول الصور
            </button>
            <button
              @click="openRejectModal"
              class="btn-danger bg-red-500 text-white py-2 px-4 rounded-md border-none cursor-pointer font-bold"
            >
              رفض
            </button>
          </div>
        </div>

        <form @submit.prevent="savePhotographyData">
          <fieldset
            :disabled="
              isPhotoSaving ||
              (isManager && photographyForm.status === 'pending') ||
              (photographyForm.status === 'approved' && !isManager) ||
              (photographyForm.status === 'pending' && !isEditingPending)
            "
            class="border-none p-0"
          >
            <div class="form-grid grid-cols-1! gap-5!">
              <div class="form-group">
                <label>رابط الصورة (Image URL)</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    v-model="photographyForm.image_url"
                    class="form-input"
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label>رابط الفيديو (Video URL)</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    v-model="photographyForm.video_url"
                    class="form-input"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div class="form-group">
                <label>وصف المحتوى (Description)</label>
                <textarea
                  v-model="photographyForm.description"
                  class="form-input min-h-[100px]"
                  rows="4"
                  placeholder="وصف للصور والمحتوى..."
                ></textarea>
              </div>
            </div>
          </fieldset>

          <div
            class="form-actions mt-5 text-left p-4 bg-gray-50 rounded-sm"
          >
            <div v-if="photographyForm.status !== 'approved'">
              <button
                v-if="photographyForm.status === 'pending' && !isEditingPending"
                type="button"
                class="update-btn secondary bg-slate-500! text-white!"
                @click="isEditingPending = true"
              >
                تعديل الطلب (Edit Request)
              </button>
              <button
                v-else
                type="submit"
                class="update-btn bg-[#b1a28f]! text-white!"
                :disabled="isPhotoSaving"
              >
                {{ isPhotoSaving ? 'جاري الحفظ...' : 'حفظ وإرسال للموافقة (Submit)' }}
              </button>
              <button
                v-if="isEditingPending"
                type="button"
                class="btn-text mr-2.5"
                @click="cancelPhotoEdit"
              >
                إلغاء
              </button>
            </div>
            <p
              v-if="photographyForm.status === 'approved'"
              class="text-emerald-500 font-bold m-0 flex items-center gap-1.5"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              تم اعتماد الصور
            </p>
          </div>

          <!-- سبب الرفض (للمطوّر): يظهر تحت زر الإرسال حتى يُحدَّث الطلب ويُعاد للمراجعة -->
          <div
            v-if="photographyForm.status === 'rejected'"
            class="photography-rejection-panel"
            role="region"
            aria-label="سبب رفض طلب التصوير"
          >
            <h4 class="photography-rejection-panel__title">سبب الرفض</h4>
            <p class="photography-rejection-panel__body">
              {{ photographyForm.rejection_reason || 'لم يُذكر سبب محدد.' }}
            </p>
            <p class="photography-rejection-panel__hint">
              عند تحديث الروابط أو الوصف والضغط على «حفظ وإرسال للموافقة» يُعاد إرسال الطلب لـ
              <strong>قيد المراجعة</strong> بعد اعتماد الخادم، ويختفي هذا الإشعار.
            </p>
          </div>
        </form>
      </div>

      <!-- تأكيد رفض التصوير — نفس نمط ConfirmModal مع حقل سبب الرفض -->
      <AlertDialog :open="showRejectModal" @update:open="onRejectOpenChange">
        <AlertDialogContent
          class="confirm-alert-content max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl"
          dir="rtl"
        >
          <AlertDialogHeader class="px-6 pt-6 pb-2 text-center sm:text-center">
            <AlertDialogTitle class="text-xl font-extrabold text-[var(--color-navy)]">
              رفض طلب التصوير
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div class="confirm-modal-body px-6 pb-4 pt-2 text-center">
            <div
              class="confirm-modal-icon icon-warning mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-10 w-10">
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <p class="confirm-modal-message mb-3 text-base font-medium text-[var(--color-dark-gray)]">
              يرجى ذكر سبب الرفض ليتمكن المطور من التعديل:
            </p>
            <label class="sr-only" for="photography-reject-reason">سبب الرفض</label>
            <textarea
              id="photography-reject-reason"
              v-model="rejectReasonInput"
              class="photography-reject-textarea"
              rows="4"
              placeholder="سبب الرفض..."
            ></textarea>
          </div>
          <AlertDialogFooter
            class="flex flex-row flex-wrap justify-center gap-3 border-t border-[var(--color-light-gray)] px-6 py-4 sm:justify-center"
          >
            <AlertDialogCancel
              type="button"
              class="btn-cancel min-w-[120px] rounded-xl border-2 border-[var(--color-medium-gray)] bg-[var(--color-light-gray)] px-8 py-3.5 text-[15px] font-bold text-[var(--color-dark-gray)] hover:bg-[var(--color-light-gray)] hover:text-[var(--color-charcoal)]"
              @click="closeRejectModal"
            >
              إلغاء
            </AlertDialogCancel>
            <button
              type="button"
              class="photography-reject-confirm-btn min-w-[120px] rounded-xl px-8 py-3.5 text-[15px] font-bold text-white shadow-md"
              @click="rejectPhotography"
            >
              تأكيد الرفض
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </template>

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
import { onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProjectPhotography } from '@/composables/project/useProjectPhotography';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  projectName: { type: String, default: '' },
  isManager: { type: Boolean, default: false },
});

const {
  isLoading,
  photographyForm,
  isPhotoSaving,
  isEditingPending,
  showRejectModal,
  rejectReasonInput,
  showConfirmModal,
  confirmModalConfig,
  onConfirmModalConfirm,
  loadPhotography,
  savePhotographyData,
  cancelPhotoEdit,
  approvePhotography,
  openRejectModal,
  closeRejectModal,
  rejectPhotography,
} = useProjectPhotography(props.projectId);

const onRejectOpenChange = open => {
  if (!open) closeRejectModal();
};

onMounted(() => {
  loadPhotography();
});
</script>

<style scoped>
.loading-state {
  padding: 100px;
  text-align: center;
  color: #94a3b8;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.tracker-header-box {
  margin-bottom: 50px;
  position: relative;
}
.tracker-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
}
.tracker-desc {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}
.stage-content-area {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
}
.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}
.status-badge.approved {
  background: #dcfce7;
  color: #16a34a;
}
.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

/* نفس أيقونة التحذير في ConfirmModal */
.confirm-modal-icon.icon-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
  border: 3px solid #fbbf24;
}

.confirm-modal-message {
  line-height: 1.6;
}

.photography-reject-textarea {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 12px 14px;
  font: inherit;
  font-size: 15px;
  line-height: 1.55;
  color: var(--color-navy, #27374d);
  background: #f8fafc;
  border: 2px solid var(--color-light-gray, #e2e8f0);
  border-radius: 12px;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.photography-reject-textarea::placeholder {
  color: #94a3b8;
}

.photography-reject-textarea:focus {
  outline: none;
  border-color: #b1a28f;
  background: #fff;
}

.photography-reject-confirm-btn {
  background: linear-gradient(135deg, var(--color-error, #ef4444) 0%, #dc2626 100%);
}

.photography-reject-confirm-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.photography-rejection-panel {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 10px;
  border: 1px solid #fecaca;
  background: linear-gradient(180deg, #fff5f5 0%, #fef2f2 100%);
  box-shadow: 0 1px 3px rgba(153, 27, 27, 0.08);
  text-align: right;
}
.photography-rejection-panel__title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #991b1b;
}
.photography-rejection-panel__body {
  margin: 0 0 0.65rem 0;
  color: #7f1d1d;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.photography-rejection-panel__hint {
  margin: 0;
  font-size: 0.85rem;
  color: #9a3412;
  line-height: 1.45;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm);
  background: #f8fafc;
  color: #1e293b;
  transition: border-color 0.2s;
}
.form-input:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}
.form-input:focus {
  outline: none;
  border-color: #b1a28f;
  background: white;
}
.update-btn {
  margin-top: 20px;
  background: #8e7d5c;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}
.update-btn.secondary {
  background: #64748b;
}
.btn-text {
  background: none;
  border: none;
  color: #b1a28f;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 768px) {
  .stage-content-area {
    padding: 20px;
    max-width: 100%;
  }
  .form-grid { grid-template-columns: 1fr; }
}

@media (max-width: 576px) {
  .stage-content-area {
    padding: 16px;
    border-radius: 10px;
  }
  .form-input {
    padding: 10px 12px;
    min-height: 44px;
  }
  .update-btn {
    padding: 12px 20px;
    min-height: 44px;
    width: 100%;
  }
}
</style>
