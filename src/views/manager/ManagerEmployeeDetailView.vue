<template>
  <div class="manager-employee-detail">
    <div class="back-bar">
      <router-link :to="{ name: 'ManagerEmployees' }" class="back-link">← العودة للموظفين</router-link>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <div class="employee-header">
        <div class="avatar">{{ (employee.name || employee.user_name || '?').charAt(0).toUpperCase() }}</div>
        <div class="info">
          <h1>{{ employee.name || employee.user_name || '—' }}</h1>
          <p>{{ employee.email || employee.team_name || '—' }}</p>
        </div>
      </div>

      <div class="reviews-section">
        <div class="section-header">
          <h2>المراجعات</h2>
          <button type="button" class="btn-primary" @click="openReviewForm()">إضافة مراجعة</button>
        </div>

        <div v-if="reviewsLoading" class="loading-inline">جاري تحميل المراجعات...</div>
        <div v-else-if="reviews.length === 0" class="empty-inline">لا توجد مراجعات.</div>
        <div v-else class="reviews-list">
          <div v-for="r in reviews" :key="r.id" class="review-card">
            <div class="review-header">
              <span class="review-date">{{ formatDate(r.created_at || r.date) }}</span>
              <div class="review-actions">
                <button type="button" class="btn-icon" @click="openReviewForm(r)" title="تعديل">✎</button>
                <button type="button" class="btn-icon danger" @click="confirmDelete(r)" title="حذف">×</button>
              </div>
            </div>
            <p class="review-body">{{ r.comment || r.notes || r.review || '—' }}</p>
          </div>
        </div>
      </div>

      <div v-if="showReviewForm" class="review-modal">
        <div class="modal-content">
          <h3>{{ editingReview ? 'تعديل المراجعة' : 'إضافة مراجعة' }}</h3>
          <form @submit.prevent="submitReview">
            <div class="form-group">
              <label>التعليق / الملاحظات</label>
              <textarea v-model="reviewForm.comment" rows="4" required></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeReviewForm">إلغاء</button>
              <button type="submit" class="btn-primary" :disabled="reviewSaving">حفظ</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-content small">
          <p>هل تريد حذف هذه المراجعة؟</p>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showDeleteConfirm = false">إلغاء</button>
            <button type="button" class="btn-danger" @click="doDelete">حذف</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import managerService from '@/services/managerService';

const route = useRoute();
const employeeId = computed(() => route.params.id);

const employee = ref({});
const reviews = ref([]);
const isLoading = ref(true);
const reviewsLoading = ref(false);
const showReviewForm = ref(false);
const showDeleteConfirm = ref(false);
const reviewSaving = ref(false);
const editingReview = ref(null);
const reviewToDelete = ref(null);

const reviewForm = ref({ comment: '' });

function formatDate(d) {
  if (!d) return '—';
  const d2 = new Date(d);
  return isNaN(d2.getTime()) ? d : d2.toLocaleDateString('ar-SA');
}

async function fetchEmployee() {
  const id = employeeId.value;
  if (!id) return;
  isLoading.value = true;
  try {
    employee.value = await managerService.getEmployee(id);
  } catch (_) {
    employee.value = {};
  } finally {
    isLoading.value = false;
  }
}

async function fetchReviews() {
  const id = employeeId.value;
  if (!id) return;
  reviewsLoading.value = true;
  try {
    reviews.value = await managerService.getReviews(id);
  } catch (_) {
    reviews.value = [];
  } finally {
    reviewsLoading.value = false;
  }
}

function openReviewForm(r = null) {
  editingReview.value = r;
  reviewForm.value = { comment: r?.comment ?? r?.notes ?? r?.review ?? '' };
  showReviewForm.value = true;
}

function closeReviewForm() {
  showReviewForm.value = false;
  editingReview.value = null;
  reviewForm.value = { comment: '' };
}

async function submitReview() {
  const id = employeeId.value;
  if (!id) return;
  reviewSaving.value = true;
  try {
    if (editingReview.value) {
      await managerService.updateReview(id, editingReview.value.id, reviewForm.value);
    } else {
      await managerService.createReview(id, reviewForm.value);
    }
    closeReviewForm();
    await fetchReviews();
  } catch (e) {
    alert(e?.message ?? 'حدث خطأ');
  } finally {
    reviewSaving.value = false;
  }
}

function confirmDelete(r) {
  reviewToDelete.value = r;
  showDeleteConfirm.value = true;
}

async function doDelete() {
  const id = employeeId.value;
  const r = reviewToDelete.value;
  if (!id || !r) return;
  try {
    await managerService.deleteReview(id, r.id);
    showDeleteConfirm.value = false;
    reviewToDelete.value = null;
    await fetchReviews();
  } catch (e) {
    alert(e?.message ?? 'حدث خطأ');
  }
}

watch(employeeId, () => {
  fetchEmployee();
  fetchReviews();
}, { immediate: true });

onMounted(() => {
  fetchEmployee();
  fetchReviews();
});
</script>

<style scoped>
.manager-employee-detail {
  direction: rtl;
}

.back-bar {
  margin-bottom: 20px;
}

.back-link {
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-gold);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.employee-header h1 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.employee-header p {
  margin: 0;
  color: var(--color-dark-gray);
}

.reviews-section {
  background: var(--color-white);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(177, 162, 143, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-primary {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: var(--color-gold);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  background: var(--color-white);
  cursor: pointer;
}

.btn-danger {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #dc2626;
  color: white;
  cursor: pointer;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1rem;
}

.btn-icon.danger {
  color: #dc2626;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  padding: 16px;
  margin-bottom: 0;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-date {
  font-size: 0.9rem;
  color: var(--color-dark-gray);
}

.review-body {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.review-modal,
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-white);
  border-radius: 16px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
}

.modal-content.small {
  min-width: 320px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(177, 162, 143, 0.3);
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.loading-state,
.loading-inline,
.empty-inline {
  text-align: center;
  padding: 2rem;
  color: var(--color-dark-gray);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
