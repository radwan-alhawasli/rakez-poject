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

        <!-- Rejection Reason Warning -->
        <div
          v-if="photographyForm.status === 'rejected' && photographyForm.rejection_reason"
          class="alert-box error mt-4 bg-red-100 p-2.5 rounded-sm text-red-800"
        >
          <strong>سبب الرفض:</strong> {{ photographyForm.rejection_reason }}
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
        </form>
      </div>

      <!-- Rejection Modal -->
      <div v-if="showRejectModal" class="modal-overlay">
        <div class="modal-content">
          <h3>رفض الصور</h3>
          <p>يرجى ذكر سبب الرفض ليتمكن المطور من التعديل:</p>
          <textarea
            v-model="rejectReasonInput"
            class="form-input w-full mb-4"
            rows="3"
            placeholder="سبب الرفض..."
          ></textarea>
          <div class="modal-actions">
            <button class="btn-text" @click="showRejectModal = false">إلغاء</button>
            <button
              class="btn-danger bg-red-500 text-white py-2 px-4 rounded-md border-none"
              @click="rejectPhotography"
            >
              تأكيد الرفض
            </button>
          </div>
        </div>
      </div>
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
  rejectPhotography,
} = useProjectPhotography(props.projectId);

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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
}
.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  .modal-content {
    max-width: 90%;
    padding: 24px;
  }
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
  .modal-content {
    max-width: 95%;
    padding: 20px;
  }
  .modal-actions { flex-direction: column; }
  .modal-actions button { min-height: 44px; }
}
</style>
