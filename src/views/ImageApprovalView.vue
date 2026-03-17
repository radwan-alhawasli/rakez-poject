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

    <!-- Rejection Modal (Dialog) -->
    <Dialog :open="showRejectModal" @update:open="showRejectModal = $event">
      <DialogContent class="image-reject-dialog max-w-md rounded-2xl p-6" dir="rtl">
        <DialogHeader>
          <DialogTitle>رفض الصور</DialogTitle>
        </DialogHeader>
        <p class="mb-3 text-sm text-muted-foreground">يرجى ذكر سبب الرفض ليتمكن المطور من التعديل:</p>
        <textarea
          v-model="rejectReasonInput"
          class="form-input mb-4 w-full rounded-lg border border-[var(--color-medium-gray)] px-3 py-2"
          rows="3"
          placeholder="سبب الرفض..."
        ></textarea>
        <DialogFooter class="flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" class="btn-text" @click="closeRejectModal">إلغاء</button>
          <button type="button" class="btn-danger-solid" @click="confirmReject">تأكيد الرفض</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
import { toast } from '@/composables/useToast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default {
  name: 'ImageApprovalView',
  components: {
    ConfirmModal,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
                  updated_at: new Date(data.updated_at || Date.now()).toLocaleDateString('ar-SA'),
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
      selectedItem.value = null;
    };

    const confirmReject = async () => {
      if (!rejectReasonInput.value) {
        toast.warning('يرجى إدخال سبب الرفض');
        return;
      }
      if (!selectedItem.value) return;

      try {
        await contractService.approvePhotography(selectedItem.value.projectId, {
          status: 'rejected',
          rejection_reason: rejectReasonInput.value,
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
      confirmReject,
    };
  },
};
</script>

<style scoped>
.image-approval-view {
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 50px;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.stats-bar {
  margin-bottom: 25px;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: fit-content;
}
.stat-item {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
}
.stat-value {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  color: #64748b;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.image-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  height: 180px;
  background: #f8fafc;
}
.project-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 15px;
}
.project-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.card-body {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.uploader-info {
  margin-bottom: 20px;
  flex: 1;
}
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  align-items: center;
}
.info-row.wide {
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.info-row .label {
  color: #64748b;
  white-space: nowrap;
  margin-left: 10px;
}
.info-row .value {
  color: #1e293b;
  font-weight: 600;
}
.description {
  font-weight: 400;
  line-height: 1.5;
  font-size: 13px;
  margin: 0;
  color: #334155;
}

.links-section {
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
}
.link-value {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  direction: ltr;
}
.link-value:hover {
  text-decoration: underline;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}
.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 13px;
  transition: background 0.2s;
}
.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.approve {
  background: #dcfce7;
  color: #166534;
}
.action-btn.approve:hover {
  background: #bbf7d0;
}

.action-btn.reject {
  background: #fee2e2;
  color: #991b1b;
}
.action-btn.reject:hover {
  background: #fecaca;
}

.empty-state,
.loading-state {
  text-align: center;
  color: #64748b;
  padding: 50px;
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
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-text {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.btn-danger-solid {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 10px;
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  .page-title {
    font-size: 24px;
  }
  .modal-content {
    max-width: 460px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .images-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .image-card:hover {
    transform: none;
  }
  .stats-bar {
    width: 100%;
    margin-bottom: 20px;
  }
  .modal-content {
    max-width: 90%;
    padding: 24px;
  }
  .info-row {
    font-size: 12px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .image-approval-view {
    overflow-x: hidden;
    padding-bottom: 30px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .stats-bar {
    padding: 12px 16px;
    border-radius: 10px;
  }
  .stat-item {
    font-size: 14px;
  }
  .image-wrapper {
    height: 160px;
  }
  .card-body {
    padding: 12px;
  }
  .action-btn {
    padding: 10px;
    min-height: 44px;
    font-size: 13px;
  }
  .action-btn svg {
    width: 18px;
    height: 18px;
  }
  .info-row .label {
    font-size: 12px;
  }
  .links-section {
    padding: 8px;
  }
  .link-value {
    font-size: 12px;
    word-break: break-all;
  }
  .modal-content {
    width: 95%;
    padding: 20px;
    border-radius: 10px;
  }
  .modal-content h3 {
    font-size: 16px;
  }
  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .btn-text,
  .btn-danger-solid {
    min-height: 44px;
    width: 100%;
    text-align: center;
  }
  .btn-danger-solid {
    padding: 12px 16px;
    border-radius: 8px;
  }
  .empty-state,
  .loading-state {
    padding: 32px 16px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .image-approval-view {
    overflow-x: hidden;
  }
  .page-title {
    font-size: 18px;
  }
  .page-subtitle {
    font-size: 12px;
  }
  .stats-bar {
    padding: 10px 12px;
    border-radius: 8px;
  }
  .stat-item {
    font-size: 13px;
    gap: 6px;
  }
  .image-wrapper {
    height: 140px;
  }
  .image-card {
    border-radius: 12px;
  }
  .card-body {
    padding: 10px;
  }
  .overlay {
    padding: 10px;
  }
  .project-badge {
    font-size: 11px;
    padding: 3px 8px;
  }
  .action-btn {
    font-size: 12px;
    border-radius: 6px;
  }
  .description {
    font-size: 12px;
  }
  .modal-content {
    width: 98%;
    padding: 16px;
  }
  .form-input {
    font-size: 14px;
    min-height: 44px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }
  .page-title {
    font-size: 30px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 32px;
  }
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 16px;
  }
  .image-card {
    border-radius: 20px;
  }
  .image-wrapper {
    height: 220px;
  }
  .card-body {
    padding: 20px;
  }
  .info-row {
    font-size: 14px;
    margin-bottom: 10px;
  }
  .action-btn {
    padding: 12px;
    font-size: 14px;
  }
  .stats-bar {
    padding: 18px 24px;
  }
  .stat-item {
    font-size: 16px;
  }
  .page-header {
    margin-bottom: 36px;
  }
  .modal-content {
    max-width: 560px;
    padding: 36px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
    gap: 36px;
  }
  .page-title {
    font-size: 36px;
  }
  .page-subtitle {
    font-size: 18px;
  }
  .image-card {
    border-radius: 24px;
  }
  .image-wrapper {
    height: 260px;
  }
  .card-body {
    padding: 24px;
  }
  .overlay {
    padding: 20px;
  }
  .project-badge {
    font-size: 14px;
    padding: 6px 14px;
  }
  .info-row {
    font-size: 16px;
    margin-bottom: 12px;
  }
  .description {
    font-size: 15px;
  }
  .link-value {
    font-size: 14px;
  }
  .action-btn {
    padding: 14px;
    font-size: 15px;
    border-radius: 10px;
  }
  .action-btn svg {
    width: 20px;
    height: 20px;
  }
  .stats-bar {
    padding: 20px 28px;
    border-radius: 16px;
  }
  .modal-content {
    max-width: 640px;
    padding: 40px;
    border-radius: 16px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(540px, 1fr));
    gap: 44px;
  }
  .page-title {
    font-size: 42px;
  }
  .page-subtitle {
    font-size: 22px;
  }
  .image-card {
    border-radius: 28px;
  }
  .image-wrapper {
    height: 320px;
  }
  .card-body {
    padding: 28px;
  }
  .overlay {
    padding: 24px;
  }
  .project-badge {
    font-size: 16px;
    padding: 8px 16px;
    border-radius: 10px;
  }
  .info-row {
    font-size: 18px;
    margin-bottom: 14px;
  }
  .info-row .label {
    font-size: 17px;
  }
  .description {
    font-size: 17px;
  }
  .links-section {
    padding: 16px;
    border-radius: 12px;
  }
  .action-btn {
    padding: 16px;
    font-size: 17px;
    border-radius: 12px;
  }
  .action-btn svg {
    width: 22px;
    height: 22px;
  }
  .stats-bar {
    padding: 24px 32px;
    border-radius: 18px;
  }
  .stat-item {
    font-size: 18px;
  }
  .page-header {
    margin-bottom: 44px;
  }
  .empty-state,
  .loading-state {
    padding: 64px 32px;
    font-size: 18px;
  }
  .spinner {
    width: 52px;
    height: 52px;
  }
  .modal-content {
    max-width: 740px;
    padding: 48px;
    border-radius: 20px;
  }
  .modal-content h3 {
    font-size: 22px;
  }
  .btn-danger-solid {
    padding: 14px 28px;
    font-size: 16px;
    border-radius: 10px;
  }
}
</style>
