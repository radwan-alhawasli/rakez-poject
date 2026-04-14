<template>
  <div class="image-approval-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">الموافقة على الصور</h1>
        <p class="welcome-subtitle">مراجعة واعتماد الصور المرفوعة من قبل مدراء المشاريع.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">قيد الانتظار:</span>
        <span class="stat-value">{{ isLoading ? '...' : pendingImages.length }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري البحث عن طلبات معلقة...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingImages.length === 0" class="empty-state">
      <p>لا يوجد صور بانتظار الموافقة حالياً.</p>
    </div>

    <!-- Images Grid -->
    <div v-else class="images-grid">
      <div v-for="img in pendingImages" :key="img.projectId" class="image-card">
        <div class="image-wrapper">
          <img
            :src="img.image_url"
            :alt="img.projectName || 'صورة مشروع'"
            width="600"
            height="400"
            loading="lazy"
            @error="
              $event.target.src =
                'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%23cccccc%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23666666%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'
            "
            class="project-img"
          />
          <div class="overlay">
            <span class="project-badge">{{ img.projectName }}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="uploader-info">
            <div class="info-row wide">
              <span class="label">الوصف:</span>
              <p class="value description">{{ img.description || 'لا يوجد وصف' }}</p>
            </div>

            <div class="links-section">
              <div class="info-row">
                <span class="label">رابط الصورة:</span>
                <a :href="img.image_url" target="_blank" rel="noopener noreferrer" class="link-value">{{
                  truncateUrl(img.image_url)
                }}</a>
              </div>
              <div class="info-row" v-if="img.video_url">
                <span class="label">رابط الفيديو:</span>
                <a :href="img.video_url" target="_blank" rel="noopener noreferrer" class="link-value">{{
                  truncateUrl(img.video_url)
                }}</a>
              </div>
            </div>

            <div class="info-row">
              <span class="label">تاريخ التحديث:</span>
              <span class="value">{{ img.updated_at }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="action-btn reject" @click="openRejectModal(img)" title="رفض">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              رفض
            </button>
            <button class="action-btn approve" @click="approveImage(img)" title="موافقة">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              موافقة
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- تأكيد رفض الصور — نفس نمط ConfirmModal / ProjectPhotographyTab -->
    <AlertDialog :open="showRejectModal" @update:open="onRejectOpenChange">
      <AlertDialogContent
        class="confirm-alert-content max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl"
        dir="rtl"
      >
        <AlertDialogHeader class="px-6 pt-6 pb-2 text-center sm:text-center">
          <AlertDialogTitle class="text-xl font-extrabold text-[var(--color-navy)]">
            رفض الصور
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
          <label class="sr-only" for="image-approval-reject-reason">سبب الرفض</label>
          <textarea
            id="image-approval-reject-reason"
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
            @click="confirmReject"
          >
            تأكيد الرفض
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

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

<script>
import { ref, onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { localeOpts } from '@/utils/intlLatn';
import { toast } from '@/composables/useToast';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default {
  name: 'ImageApprovalView',
  components: {
    ConfirmModal,
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  },
  setup() {
    const pendingImages = ref([]);
    const isLoading = ref(true);
    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'info',
      confirmText: 'تأكيد',
      resolve: null,
    });
    const showRejectModal = ref(false);
    const rejectReasonInput = ref('');
    const selectedItem = ref(null);

    const fetchPendingRequests = async () => {
      isLoading.value = true;
      try {
        // 1. Get All Contracts
        const { items } = await contractService.getContracts({ page: 1, per_page: 500 });
        const contracts = items ?? [];

        // 2. Filter & Parallel Fetch Photography Data
        // We need to check each project for "pending" photography status.
        // Limiting concurrency might be needed for large sets, but here assume manageable count.
        // 2. Filter & Parallel Fetch Photography Data
        const results = await Promise.all(
          contracts.map(async project => {
            try {
              const response = await contractService.getPhotography(project.id);
              // Normalize: response can be { data: { ... } } or just { ... }
              // contractService.getPhotography uses response.data, so response here is what getPhotography returns.
              // Ideally strictly typed but we'll try both.
              const data = response && response.data ? response.data : response;

              // Debug log
              // console.log(`Project ${project.id} photo data:`, data)

              if (data && data.status === 'pending') {
                return {
                  projectId: project.id,
                  projectName: project.project_name || project.name || `Project #${project.id}`,
                  ...data,
                  updated_at: new Date(data.updated_at || Date.now()).toLocaleDateString('ar-SA', localeOpts()),
                };
              }
            } catch (_e) {
              // console.error(`Error fetching photo for project ${project.id}`, e)
              return null;
            }
            return null;
          })
        );

        pendingImages.value = results.filter(item => item !== null);
      } catch (error) {
        logger.error('Error fetching requests:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const truncateUrl = url => {
      if (!url) return '';
      if (url.length > 40) return url.substring(0, 37) + '...';
      return url;
    };

    const approveImage = img => {
      confirmModalConfig.value = {
        title: 'الموافقة على الصور',
        message: 'هل أنت متأكد من الموافقة على هذه الصور؟',
        type: 'info',
        confirmText: 'موافقة',
        resolve: async () => {
          try {
            await contractService.approvePhotography(img.projectId, { status: 'approved' });
            pendingImages.value = pendingImages.value.filter(i => i.projectId !== img.projectId);
            toast.success('تمت الموافقة بنجاح');
          } catch (error) {
            logger.error('Error approving images:', error);
            toast.error('حدث خطأ أثناء الموافقة');
          }
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    const openRejectModal = img => {
      selectedItem.value = img;
      rejectReasonInput.value = '';
      showRejectModal.value = true;
    };

    const closeRejectModal = () => {
      showRejectModal.value = false;
      rejectReasonInput.value = '';
      selectedItem.value = null;
    };

    const onRejectOpenChange = open => {
      if (!open) closeRejectModal();
    };

    const confirmReject = async () => {
      const reason = String(rejectReasonInput.value || '').trim();
      if (!reason) {
        toast.warning('يرجى إدخال سبب الرفض');
        return;
      }
      if (!selectedItem.value) return;

      try {
        await contractService.approvePhotography(selectedItem.value.projectId, {
          approved: '0',
          comment: reason,
          rejection_comment: reason,
        });
        // Remove from list
        pendingImages.value = pendingImages.value.filter(
          i => i.projectId !== selectedItem.value.projectId
        );
        toast.success('تم رفض الصور');
        closeRejectModal();
      } catch (error) {
        logger.error('Error rejecting images:', error);
        toast.error('حدث خطأ أثناء الرفض');
      }
    };

    onMounted(() => {
      fetchPendingRequests();
    });

    return {
      pendingImages,
      isLoading,
      truncateUrl,
      approveImage,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      showRejectModal,
      rejectReasonInput,
      openRejectModal,
      closeRejectModal,
      onRejectOpenChange,
      confirmReject,
    };
  },
};
</script>

<style scoped src="./styles/ImageApprovalView.scoped.s1.css"></style>
<style scoped src="./styles/ImageApprovalView.scoped.s2.css"></style>
<style scoped>
/* نفس نمط رفض التصوير في ProjectPhotographyTab */
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
</style>
