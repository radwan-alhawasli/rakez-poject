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
          class="status-bar"
          style="margin-top: 15px; display: flex; gap: 10px; align-items: center"
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
            class="update-info-badge"
            style="color: #6b7280; font-size: 13px"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="16"
              height="16"
              style="vertical-align: middle; margin-left: 4px"
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
          class="alert-box error"
          style="
            margin-top: 15px;
            background: #fee2e2;
            padding: 10px;
            border-radius: var(--radius-sm);
            color: #991b1b;
          "
        >
          <strong>سبب الرفض:</strong> {{ photographyForm.rejection_reason }}
        </div>
      </div>

      <div class="stage-content-area" style="max-width: 800px; margin: 0 auto">
        <!-- Manager Approval Controls -->
        <div
          v-if="isManager && photographyForm.status === 'pending'"
          class="manager-actions-card"
          style="
            background: white;
            border: 1px solid #e5e7eb;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          "
        >
          <h4 style="margin-top: 0; color: #1f2937">طلب موافقة على الصور</h4>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px">
            قام المطور برفع صور جديدة. يرجى المراجعة واتخاذ القرار.
          </p>
          <div style="display: flex; gap: 10px">
            <button
              @click="approvePhotography"
              class="btn-success"
              style="
                background: #10b981;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: bold;
              "
            >
              قبول الصور
            </button>
            <button
              @click="openRejectModal"
              class="btn-danger"
              style="
                background: #ef4444;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                font-weight: bold;
              "
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
            style="border: none; padding: 0"
          >
            <div class="form-grid" style="grid-template-columns: 1fr; gap: 20px">
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
                  class="form-input"
                  rows="4"
                  placeholder="وصف للصور والمحتوى..."
                  style="min-height: 100px"
                ></textarea>
              </div>
            </div>
          </fieldset>

          <div
            class="form-actions"
            style="
              margin-top: 20px;
              text-align: left;
              padding: 15px;
              background: #f9fafb;
              border-radius: var(--radius-sm);
            "
          >
            <div v-if="photographyForm.status !== 'approved'">
              <button
                v-if="photographyForm.status === 'pending' && !isEditingPending"
                type="button"
                class="update-btn secondary"
                @click="isEditingPending = true"
                style="background: #64748b; color: white"
              >
                تعديل الطلب (Edit Request)
              </button>
              <button
                v-else
                type="submit"
                class="update-btn"
                :disabled="isPhotoSaving"
                style="background: #b1a28f; color: white"
              >
                {{ isPhotoSaving ? 'جاري الحفظ...' : 'حفظ وإرسال للموافقة (Submit)' }}
              </button>
              <button
                v-if="isEditingPending"
                type="button"
                class="btn-text"
                @click="cancelPhotoEdit"
                style="margin-right: 10px"
              >
                إلغاء
              </button>
            </div>
            <p
              v-if="photographyForm.status === 'approved'"
              style="
                color: #10b981;
                font-weight: bold;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 6px;
              "
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
            class="form-input"
            rows="3"
            placeholder="سبب الرفض..."
            style="width: 100%; margin-bottom: 15px"
          ></textarea>
          <div class="modal-actions">
            <button class="btn-text" @click="showRejectModal = false">إلغاء</button>
            <button
              class="btn-danger"
              @click="rejectPhotography"
              style="
                background: #ef4444;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
              "
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
