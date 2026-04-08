<template>
  <div class="tasks-view">
    <div class="welcome-header tasks-view-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة المهام</h1>
        <p class="welcome-subtitle">
          متابعة المهام المكلّف بها والمهام التي طلبتها من الأقسام والفرق.
        </p>
      </div>
      <button
        v-if="canCreateTasks"
        type="button"
        class="tasks-add-btn"
        @click="showCreateModal = true"
      >
        <svg class="tasks-add-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>إضافة مهمة</span>
      </button>
    </div>

    <section class="tasks-controls" aria-label="تصفية المهام والتبويبات">
      <div class="tabs-container">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'assigned' }"
          @click="switchTab('assigned')"
        >
          <span class="tab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </span>
          مهام مطلوبة مني
          <span v-if="assignedTotal > 0" class="tab-count">{{ assignedTotal }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'requested' }"
          @click="switchTab('requested')"
        >
          <span class="tab-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
          </span>
          مهام طلبتها من الآخرين
          <span v-if="requestedTotal > 0" class="tab-count">{{ requestedTotal }}</span>
        </button>
      </div>

      <div class="filters">
        <label class="filters-label" for="tasks-status-filter">الحالة</label>
        <select
          id="tasks-status-filter"
          v-model="filterStatus"
          @change="loadCurrentTab(1)"
          class="form-input"
        >
          <option value="">جميع الحالات</option>
          <option value="in_progress">قيد التنفيذ</option>
          <option value="completed">مكتملة</option>
          <option value="could_not_complete">لم تكتمل</option>
        </select>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadCurrentTab(1)">إعادة المحاولة</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentTasks.length === 0" class="empty-state">
      <p v-if="activeTab === 'assigned'">لا توجد مهام مطلوبة منك حالياً</p>
      <p v-else>لم تطلب أي مهام من الآخرين بعد</p>
    </div>

    <!-- Tasks Grid -->
    <div v-else class="tasks-grid">
      <div v-for="task in currentTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3 class="task-title">{{ task.title || task.task_name || task.name }}</h3>
          <span class="status-badge" :class="task.status">{{ getStatusLabel(task.status) }}</span>
        </div>

        <!-- Origin Badge -->
        <div class="task-origin">
          <span v-if="activeTab === 'assigned'" class="origin-badge assigned-badge">
            <span class="origin-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </span>
            مطلوبة مني
          </span>
          <span v-else class="origin-badge requested-badge">
            <span class="origin-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
            طلبتها من آخرين
          </span>
        </div>

        <p v-if="task.description" class="task-description">{{ task.description }}</p>

        <div class="task-details">
          <p v-if="task.section_label || task.section_key">
            <strong>القسم:</strong>
            {{ task.section_label || getSectionLabel(task.section_key) }}
          </p>
          <p v-if="task.due_at || task.due_date">
            <strong>تاريخ الاستحقاق:</strong>
            <time
              class="task-datetime"
              :datetime="taskDateAttr(task.due_at || task.due_date)"
              dir="ltr"
              >{{ formatDate(task.due_at || task.due_date) }}</time>
          </p>
          <p v-if="task.created_at">
            <strong>تاريخ الإنشاء:</strong>
            <time class="task-datetime" :datetime="taskDateAttr(task.created_at)" dir="ltr">{{
              formatDate(task.created_at)
            }}</time>
          </p>
          <p v-if="task.team_id || task.team?.name || task.team_name">
            <strong>الفريق:</strong> {{ task.team_name || task.team?.name || task.team_id }}
          </p>

          <!-- For tasks assigned to me: show who requested it -->
          <p v-if="activeTab === 'assigned' && (task.creator_name || task.created_by_name)">
            <strong>طُلبت بواسطة:</strong>
            <span class="person-name requester">{{ task.creator_name || task.created_by_name }}</span>
          </p>

          <!-- For tasks I requested: show who is assigned -->
          <p v-if="activeTab === 'requested' && (task.assignee?.name || task.assigned_to_name || task.assignee_name)">
            <strong>مُكلَّف بها:</strong>
            <span class="person-name assignee">{{ task.assignee?.name || task.assigned_to_name || task.assignee_name }}</span>
          </p>

          <!-- For tasks assigned to me: show assignee if different context -->
          <p v-if="activeTab === 'assigned' && (task.assigned_to || task.assignee?.name) && !task.creator_name && !task.created_by_name">
            <strong>المسؤول:</strong> {{ task.assignee?.name || task.assigned_to }}
          </p>

          <p v-if="task.cannot_complete_reason" class="reason">
            <strong>السبب:</strong> {{ task.cannot_complete_reason }}
          </p>
        </div>

        <!-- Status progress indicator -->
        <div class="status-indicator">
          <div class="status-steps">
            <div class="step" :class="{ done: true }">
              <span class="step-dot"></span>
              <span class="step-label">تم الإنشاء</span>
            </div>
            <div class="step-line" :class="{ active: task.status !== 'pending' }"></div>
            <div class="step" :class="{ done: task.status === 'in_progress' || task.status === 'completed' }">
              <span class="step-dot"></span>
              <span class="step-label">قيد التنفيذ</span>
            </div>
            <div class="step-line" :class="{ active: task.status === 'completed' }"></div>
            <div class="step" :class="{ done: task.status === 'completed', failed: task.status === 'could_not_complete' }">
              <span class="step-dot"></span>
              <span class="step-label">{{ task.status === 'could_not_complete' ? 'لم تكتمل' : 'مكتملة' }}</span>
            </div>
          </div>
        </div>

        <!-- Actions only for tasks assigned to me and in progress -->
        <div class="task-actions" v-if="activeTab === 'assigned' && task.status === 'in_progress'">
          <button class="btn-success" @click="updateStatus(task.id, 'completed')">إكمال</button>
          <button class="btn-danger" @click="openReasonModal(task.id)">تعذر الإكمال</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="currentTotalPages > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="loadCurrentTab(currentPage - 1)">السابق</button>
      <span>{{ currentPage }} / {{ currentTotalPages }}</span>
      <button :disabled="currentPage === currentTotalPages" @click="loadCurrentTab(currentPage + 1)">
        التالي
      </button>
    </div>

    <!-- Create Task Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>إضافة مهمة جديدة</h3>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label>عنوان المهمة</label>
            <input v-model="taskForm.title" required class="form-input" />
          </div>
          <div class="form-group">
            <label>وصف المهمة</label>
            <textarea v-model="taskForm.description" class="form-input" rows="3" placeholder="وصف تفصيلي للمهمة (اختياري)"></textarea>
          </div>
          <div class="form-group">
            <label>القسم</label>
            <select v-model="taskForm.section_key" required class="form-input">
              <option value="" disabled>اختر القسم...</option>
              <option v-for="section in taskSections" :key="section.key" :value="section.key">
                {{ section.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>موعد الاستحقاق</label>
            <input type="datetime-local" v-model="taskForm.due_at" required class="form-input" />
          </div>
          <div class="form-group">
            <label>المسؤول</label>
            <select
              v-model="taskForm.assigned_to"
              required
              class="form-input"
              :disabled="!taskForm.section_key || sectionUsersLoading"
            >
              <option value="" disabled>
                {{ !taskForm.section_key ? 'اختر القسم أولاً' : (sectionUsersLoading ? 'جاري التحميل...' : 'اختر الموظف المسؤول...') }}
              </option>
              <option
                v-if="
                  taskForm.section_key &&
                  currentUser &&
                  sectionUsers.some(user => user.id === currentUser.id)
                "
                :value="currentUser.id"
              >
                -- تعيين لنفسي ({{ currentUser.name }}) --
              </option>
              <option v-for="user in sectionUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              إلغاء
            </button>
            <button type="submit" class="btn-primary" :disabled="isCreating">حفظ</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reason Modal -->
    <div v-if="showReasonModal" class="modal-overlay" @click.self="closeReasonModal">
      <div class="modal-content">
        <h3>سبب عدم الإكمال</h3>
        <form @submit.prevent="submitReasonModal">
          <div class="form-group">
            <label>السبب</label>
            <textarea v-model="reasonForm.reason" required class="form-input" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeReasonModal" class="btn-secondary">إلغاء</button>
            <button type="submit" class="btn-primary">تأكيد</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTasksView } from '@/composables/views/useTasksView';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions/permissionKeys';

const { hasPermission } = usePermissions();
const canCreateTasks = computed(() => hasPermission(PERMISSIONS.TASKS_CREATE));

const {
  currentUser,
  activeTab,
  assignedTotal,
  requestedTotal,
  isLoading,
  error,
  filterStatus,
  showCreateModal,
  isCreating,
  taskForm,
  showReasonModal,
  reasonForm,
  sectionUsers,
  sectionUsersLoading,
  currentTasks,
  currentPage,
  currentTotalPages,
  taskSections,
  switchTab,
  loadCurrentTab,
  getStatusLabel,
  getSectionLabel,
  formatDate,
  taskDateAttr,
  createTask,
  updateStatus,
  openReasonModal,
  closeReasonModal,
  submitReasonModal,
} = useTasksView();
</script>

<style scoped src="./styles/TasksView.scoped.s1.css"></style>
<style scoped src="./styles/TasksView.scoped.s2.css"></style>
