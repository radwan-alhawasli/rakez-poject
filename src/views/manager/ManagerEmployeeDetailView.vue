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

      <div class="tasks-section">
        <div class="section-header">
          <h2>المهام</h2>
        </div>
        <div v-if="tasksLoading" class="loading-inline">جاري تحميل المهام...</div>
        <div v-else-if="tasks.length === 0" class="empty-inline">لا توجد مهام لهذا الموظف.</div>
        <div v-else class="tasks-list">
          <div v-for="t in tasks" :key="t.id" class="task-card">
            <div class="task-header">
              <h4>{{ t.title || t.name || '—' }}</h4>
              <span :class="['task-status', taskStatusClass(t.status)]">{{ formatTaskStatus(t.status) }}</span>
            </div>
            <p v-if="t.description" class="task-desc">{{ t.description }}</p>
            <div class="task-meta">
              <span v-if="t.due_at">الموعد: {{ formatDate(t.due_at) }}</span>
              <span v-if="t.section">القسم: {{ t.section }}</span>
            </div>
          </div>
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
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import managerService from '@/services/managerService';

const route = useRoute();
const employeeId = computed(() => route.params.id);

const employee = ref({});
const reviews = ref([]);
const tasks = ref([]);
const isLoading = ref(true);
const reviewsLoading = ref(false);
const tasksLoading = ref(false);
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

function taskStatusClass(status) {
  return String(status || 'unknown').toLowerCase().replace(/[\s-]+/g, '_');
}

function formatTaskStatus(status) {
  const s = String(status || '').toLowerCase().replace(/[\s-]+/g, '_');
  const map = {
    pending: 'قيد الانتظار',
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    could_not_complete: 'لم يكتمل',
  };
  return map[s] || status || '—';
}

async function fetchEmployee() {
  const id = employeeId.value;
  if (!id) return;
  isLoading.value = true;
  try {
    employee.value = await managerService.getEmployee(id);
    await fetchEmployeeTasks();
  } catch (_) {
    employee.value = {};
    await fetchEmployeeTasks();
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

async function fetchEmployeeTasks() {
  const id = employeeId.value;
  if (!id) return;
  tasksLoading.value = true;
  try {
    const params = {
      assigned_to: id,
      per_page: 100,
      sort_by: 'due_at',
      sort_order: 'desc',
    };
    let res = await managerService.getTasks(params);
    let items = res?.items ?? [];
    if (!items.length && employee.value?.email) {
      res = await managerService.getTasks({ ...params, assigned_to: employee.value.email });
      items = res?.items ?? [];
    }
    tasks.value = items;
  } catch (_) {
    tasks.value = [];
  } finally {
    tasksLoading.value = false;
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
</script>

<style scoped src="./styles/ManagerEmployeeDetailView.scoped.s1.css"></style>
