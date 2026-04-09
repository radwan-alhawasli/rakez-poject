<template>
  <div class="attendance-tab">
    <div class="welcome-header attendance-hero">
      <div class="header-content">
        <h1 class="welcome-title">
          <span class="title-icon-wrap" aria-hidden="true">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </span>
          {{ hasPermission('sales.attendance.manage') ? 'دوام الفرق' : 'دوامي' }}
        </h1>
        <p class="welcome-subtitle">
          {{ hasPermission('sales.attendance.manage') ? 'إدارة جداول دوام الفرق ومتابعة الحضور' : 'متابعة سجل دوامك وتوقيتات الدخول والخروج' }}
        </p>
      </div>
      <button v-if="hasPermission('sales.attendance.manage')" type="button" class="btn-add btn-add--schedule" @click="openScheduleModalClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        إنشاء جدول
      </button>
    </div>

    <LoadingSpinner v-if="isLoadingAttendance" text="جاري تحميل البيانات..." />

    <div v-else-if="attendanceLoadError" class="empty-state error-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ attendanceLoadError }}</p>
      <button type="button" class="btn-add" @click="loadAttendance()">إعادة المحاولة</button>
    </div>

    <div v-else-if="totalAttendance === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <p>
        {{
          hasPermission('sales.attendance.manage')
            ? 'لا توجد سجلات حضور للفريق حالياً.'
            : 'لا توجد سجلات دوام لك في الفترة المعروضة.'
        }}
      </p>
    </div>

    <div v-else class="attendance-table-container table-scroll-wrapper">
      <table class="attendance-table table-mobile-stacked">
        <thead>
          <tr>
            <th v-if="hasPermission('sales.attendance.manage')" scope="col">الموظف</th>
            <th scope="col">التاريخ</th>
            <th scope="col">اليوم</th>
            <th scope="col">اليوم (إنجليزي)</th>
            <th scope="col">دخول</th>
            <th scope="col">خروج</th>
            <th scope="col">المشروع</th>
            <th scope="col">الموقع</th>
            <th scope="col">اسم المستخدم</th>
            <th scope="col">رقم الجدول</th>
            <th scope="col" class="th-id"># مستخدم</th>
            <th scope="col" class="th-id"># مشروع</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in paginatedAttendance"
            :key="`${record.schedule_id ?? record.id ?? ''}-${record.date ?? ''}-${record.user_id ?? ''}`"
          >
            <td v-if="hasPermission('sales.attendance.manage')" data-label="الموظف">
              {{ record.employee_name }}
            </td>
            <td data-label="التاريخ" class="cell-strong">{{ formatDate(record.date) }}</td>
            <td data-label="اليوم">{{ record.day_name_ar || '—' }}</td>
            <td data-label="اليوم (إنجليزي)" dir="auto">{{ record.day_of_week || '—' }}</td>
            <td data-label="وقت الدخول" dir="ltr" class="cell-time">{{ formatTimeCell(record.check_in_time) }}</td>
            <td data-label="وقت الخروج" dir="ltr" class="cell-time">{{ formatTimeCell(record.check_out_time) }}</td>
            <td data-label="المشروع" class="cell-strong">{{ record.project_name || '—' }}</td>
            <td data-label="الموقع">{{ record.project_location || '—' }}</td>
            <td data-label="اسم المستخدم">{{ record.user_name || '—' }}</td>
            <td data-label="رقم الجدول" class="cell-id">{{ record.schedule_id != null ? record.schedule_id : '—' }}</td>
            <td data-label="# مستخدم" class="cell-id">{{ record.user_id != null ? record.user_id : '—' }}</td>
            <td data-label="# مشروع" class="cell-id">{{ record.project_id != null ? record.project_id : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-if="totalAttendance > 0"
      :current-page="currentPage"
      :total-items="totalAttendance"
      :per-page="perPage"
      @page-change="handleAttendancePageChange"
      @per-page-change="handleAttendancePerPageChange"
    />

    <!-- مودال إنشاء جدول دوام (مدير المبيعات) -->
    <div v-if="showScheduleModal" class="assign-overlay" @click.self="closeScheduleModal">
      <div class="assign-modal schedule-modal">
        <div class="assign-modal-header">
          <h3>إنشاء جدول دوام</h3>
          <button type="button" class="assign-close" aria-label="إغلاق" @click="closeScheduleModal">&times;</button>
        </div>
        <form class="schedule-form" @submit.prevent="handleCreateSchedule">
          <div class="form-row">
            <label class="form-label">المسوق</label>
            <select v-model="scheduleForm.employee_id" class="form-select" required>
              <option value="">— اختر المسوق —</option>
              <option v-for="m in teamMembersList" :key="m.id" :value="String(m.id)">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">المشروع</label>
            <select v-model="scheduleForm.contract_id" class="form-select" required>
              <option value="">— اختر المشروع —</option>
              <option v-for="p in teamProjectsList" :key="p.id || p.contract_id" :value="String(p.contract_id ?? p.id)">
                {{ p.project_name || p.name || p.contract_name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">تاريخ الدوام</label>
            <input v-model="scheduleForm.date" type="date" class="form-input" required />
          </div>
          <div class="form-row form-row-times">
            <div>
              <label class="form-label">من</label>
              <input v-model="scheduleForm.start_time" type="time" class="form-input" />
            </div>
            <div>
              <label class="form-label">إلى</label>
              <input v-model="scheduleForm.end_time" type="time" class="form-input" />
            </div>
          </div>
          <div class="assign-modal-actions">
            <button type="button" class="btn-secondary" @click="closeScheduleModal">إلغاء</button>
            <button type="submit" class="btn-add" :disabled="scheduleCreateSaving">
              {{ scheduleCreateSaving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import Pagination from '@/components/Pagination.vue';
import { useSalesAttendance } from '@/composables/sales/useSalesAttendance';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';

const {
  paginatedAttendance, attendanceRecords, isLoadingAttendance,
  attendanceLoadError,
  attendancePage: currentPage, attendancePerPage: perPage,
  hasPermission, formatDate,
  handleAttendancePageChange, handleAttendancePerPageChange,
  loadAttendance, showScheduleModal, scheduleForm, scheduleCreateSaving,
  openScheduleModal, createSchedule,
} = useSalesAttendance();

const { teamMembers, teamProjects, loadTeamMembers, loadTeamProjects } = useSalesTeam();

const teamMembersList = computed(() => (Array.isArray(teamMembers.value) ? teamMembers.value : []));
const teamProjectsList = computed(() => (Array.isArray(teamProjects.value) ? teamProjects.value : []));

const totalAttendance = computed(() => attendanceRecords.value.length);

async function openScheduleModalClick() {
  await openScheduleModal(teamMembers, teamProjects, loadTeamMembers, loadTeamProjects);
}

function closeScheduleModal() {
  showScheduleModal.value = false;
}

async function handleCreateSchedule() {
  await createSchedule();
}

/** عرض وقت الدخول/الخروج بدون ثوانٍ عند الإمكان */
function formatTimeCell(raw) {
  if (raw == null || raw === '') return '—';
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}:\d{2})(?::\d{2})?/);
  return m ? m[1] : s;
}

loadAttendance();
</script>

<style scoped src="./styles/SalesAttendanceTab.scoped.css"></style>
