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
          <h2>التقييمات الشهرية</h2>
        </div>
        <p class="reviews-hint">تقييم من 1 إلى 5 نجوم مع تعليق؛ يُحفظ سجل شهري يمكن عرضه أدناه.</p>

        <div class="rating-add-row">
          <div class="rating-add-label">{{ employee.name || employee.user_name || 'الموظف' }}</div>
          <div class="star-rating-input" role="group" aria-label="التقييم بالنجوم">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="star-btn"
              :class="{ active: star <= draftRating }"
              :aria-pressed="star <= draftRating"
              @click="draftRating = star"
            >
              <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 3.1l2.4 5.5 6 .6-4.5 4 1.3 6-5.2-2.8-5.2 2.8 1.3-6-4.5-4 6-.6L12 3.1z"
                  :opacity="star <= draftRating ? 1 : 0.25"
                />
              </svg>
            </button>
          </div>
          <div class="rating-comment-wrap">
            <textarea
              v-model="draftComment"
              class="rating-comment-input"
              rows="2"
              placeholder="تعليق التقييم (اختياري)"
            ></textarea>
          </div>
          <button
            type="button"
            class="btn-primary btn-add-rating"
            :disabled="reviewSaving || draftRating < 1"
            @click="submitNewReview"
          >
            {{ reviewSaving ? 'جاري الإرسال...' : 'إضافة تقييم' }}
          </button>
        </div>

        <div v-if="reviewsLoading" class="loading-inline">جاري تحميل التقييمات...</div>
        <template v-else>
          <div v-if="reviewsSorted.length === 0" class="empty-inline">لا توجد تقييمات بعد.</div>
          <div v-else class="reviews-history-block">
            <button type="button" class="btn-toggle-history" @click="showFullHistory = !showFullHistory">
              {{ showFullHistory ? 'إخفاء السجل' : 'عرض المزيد — السجل الشهري' }}
            </button>

            <div v-if="!showFullHistory" class="reviews-preview">
              <div v-for="r in reviewsPreview" :key="r.id" class="review-mini-card">
                <div class="review-mini-top">
                  <span class="review-stars-inline" :title="String(r.rating ?? '')">{{ starsText(r.rating) }}</span>
                  <span class="review-date-small">{{ formatDate(r.created_at) }}</span>
                </div>
                <p class="review-mini-comment">{{ r.comment || '—' }}</p>
                <button type="button" class="btn-link-danger" @click="confirmDelete(r)">حذف</button>
              </div>
            </div>

            <div v-else class="reviews-by-month">
              <div v-for="[monthKey, monthReviews] in groupedReviewsByMonth" :key="monthKey" class="month-group">
                <h3 class="month-title">{{ monthLabel(monthKey) }}</h3>
                <div class="month-cards-row">
                  <div v-for="r in monthReviews" :key="r.id" class="review-mini-card">
                    <div class="review-mini-top">
                      <span class="review-stars-inline">{{ starsText(r.rating) }}</span>
                      <span class="review-date-small">{{ formatDate(r.created_at) }}</span>
                    </div>
                    <p class="review-mini-comment">{{ r.comment || '—' }}</p>
                    <button type="button" class="btn-link-danger" @click="confirmDelete(r)">حذف</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-content small">
          <p>هل تريد حذف هذا التقييم؟</p>
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
import { toast } from '@/composables/useToast';

const route = useRoute();
const employeeId = computed(() => route.params.id);

const employee = ref({});
const reviews = ref([]);
const tasks = ref([]);
const isLoading = ref(true);
const reviewsLoading = ref(false);
const tasksLoading = ref(false);
const reviewSaving = ref(false);
const showDeleteConfirm = ref(false);
const reviewToDelete = ref(null);

const draftRating = ref(0);
const draftComment = ref('');
const showFullHistory = ref(false);

const PREVIEW_COUNT = 3;

function formatDate(d) {
  if (!d) return '—';
  const d2 = new Date(d);
  return Number.isNaN(d2.getTime()) ? String(d) : d2.toLocaleDateString('ar-SA');
}

function starsText(n) {
  const r = Math.min(5, Math.max(0, Number(n) || 0));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
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

const reviewsSorted = computed(() => {
  const list = [...reviews.value];
  list.sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });
  return list;
});

const reviewsPreview = computed(() => reviewsSorted.value.slice(0, PREVIEW_COUNT));

/** مفاتيح YYYY-MM مرتبة من الأحدث */
const groupedReviewsByMonth = computed(() => {
  const map = new Map();
  for (const r of reviewsSorted.value) {
    const d = new Date(r.created_at || 0);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  const entries = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  for (const [, arr] of entries) {
    arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }
  return entries;
});

function monthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number);
  if (!y || !m) return yyyyMm;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
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

async function submitNewReview() {
  const id = employeeId.value;
  if (!id) return;
  if (draftRating.value < 1 || draftRating.value > 5) {
    toast.warning('اختر تقييماً بين 1 و 5 نجوم');
    return;
  }
  reviewSaving.value = true;
  try {
    await managerService.createReview(id, {
      rating: draftRating.value,
      comment: draftComment.value,
    });
    draftRating.value = 0;
    draftComment.value = '';
    await fetchReviews();
    toast.success('تم إضافة التقييم');
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر إضافة التقييم');
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
    toast.success('تم حذف التقييم');
  } catch (e) {
    toast.error(e?.response?.data?.message || e?.message || 'تعذر الحذف');
  }
}

watch(employeeId, () => {
  fetchEmployee();
  fetchReviews();
}, { immediate: true });
</script>

<style scoped src="./styles/ManagerEmployeeDetailView.scoped.s1.css"></style>
