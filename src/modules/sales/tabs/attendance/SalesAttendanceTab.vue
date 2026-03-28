<template>
  <div class="attendance-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">{{ hasPermission('sales.attendance.manage') ? 'حضور الفريق' : 'دوامي' }}</h1>
        <p class="welcome-subtitle">
          {{ hasPermission('sales.attendance.manage') ? 'إدارة جداول دوام الفريق ومتابعة الحضور' : 'متابعة سجل دوامك وتوقيتات الدخول والخروج' }}
        </p>
      </div>
      <button v-if="hasPermission('sales.attendance.manage')" type="button" class="btn-add" @click="openScheduleModalClick">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        إنشاء جدول
      </button>
    </div>

    <LoadingSpinner v-if="isLoadingAttendance" text="جاري تحميل البيانات..." />

    <div v-else-if="totalAttendance === 0" class="empty-state">
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
            <th v-if="hasPermission('sales.attendance.manage')">الموظف</th>
            <th>اسم المشروع</th>
            <th>التاريخ</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in paginatedAttendance" :key="record.id">
            <td v-if="hasPermission('sales.attendance.manage')" data-label="الموظف">{{ record.employee_name }}</td>
            <td data-label="اسم المشروع">{{ record.project_name || '—' }}</td>
            <td data-label="التاريخ">{{ formatDate(record.date) }}</td>
            <td data-label="وقت الدخول">{{ record.check_in_time || '—' }}</td>
            <td data-label="وقت الخروج">{{ record.check_out_time || '—' }}</td>
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

loadAttendance();
</script>

<style scoped>
/* تنسيقات الحضور — من الأب SalesViewExtended */
.attendance-tab {
  width: 100%;
  direction: rtl;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-add svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  margin-top: 24px;
  padding: 32px 20px;
  text-align: center;
  color: var(--color-dark-gray);
  background: var(--color-light-gray);
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.attendance-table-container {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  background: var(--color-light-gray);
  padding: 12px;
  text-align: right;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid var(--color-medium-gray);
}

.attendance-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.attendance-table tr:hover {
  background: var(--color-light-gray);
}

.attendance-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.attendance-status.present {
  background: #d1fae5;
  color: #065f46;
}

.attendance-status.absent {
  background: #fee2e2;
  color: #991b1b;
}

.attendance-status.late {
  background: #fef3c7;
  color: #92400e;
}

.attendance-status.on_leave {
  background: #dbeafe;
  color: #1e40af;
}

.assign-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.assign-modal {
  background: var(--color-white);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 440px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.assign-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.assign-modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-navy);
}

.assign-close {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-dark-gray);
  cursor: pointer;
  border-radius: 6px;
}

.assign-close:hover {
  background: #f1f5f9;
  color: var(--color-navy);
}

.schedule-form {
  padding: 16px 20px 0;
}

.schedule-form .form-row {
  margin-bottom: 14px;
}

.schedule-form .form-row-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.schedule-form .form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: 6px;
}

.schedule-form .form-select,
.schedule-form .form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: var(--color-white);
}

.schedule-form .form-select:focus,
.schedule-form .form-input:focus {
  outline: none;
  border-color: var(--color-navy);
}

.assign-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
}

.btn-secondary {
  padding: 10px 18px;
  border: 1px solid var(--color-medium-gray);
  background: var(--color-white);
  color: var(--color-navy);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8fafc;
}

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    align-items: stretch;
  }

  .schedule-form .form-row-times {
    grid-template-columns: 1fr;
  }
}
</style>
