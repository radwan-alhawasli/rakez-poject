<template>
  <div class="attendance-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ hasPermission('sales.attendance.manage') ? 'حضور الفريق' : 'دوامي' }}
        </h1>
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
            <th v-if="hasPermission('sales.attendance.manage')">الموظف</th>
            <th>رقم الجدول</th>
            <th>معرّف المستخدم</th>
            <th>اسم المستخدم</th>
            <th>معرّف المشروع</th>
            <th>اسم المشروع</th>
            <th>موقع المشروع</th>
            <th>التاريخ</th>
            <th>اليوم (عربي)</th>
            <th>اليوم (إنجليزي)</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in paginatedAttendance"
            :key="`${record.schedule_id ?? record.id ?? ''}-${record.date ?? ''}-${record.user_id ?? ''}`"
          >
            <td v-if="hasPermission('sales.attendance.manage')" data-label="الموظف">{{ record.employee_name }}</td>
            <td data-label="رقم الجدول">{{ record.schedule_id != null ? record.schedule_id : '—' }}</td>
            <td data-label="معرّف المستخدم">{{ record.user_id != null ? record.user_id : '—' }}</td>
            <td data-label="اسم المستخدم">{{ record.user_name || '—' }}</td>
            <td data-label="معرّف المشروع">{{ record.project_id != null ? record.project_id : '—' }}</td>
            <td data-label="اسم المشروع">{{ record.project_name || '—' }}</td>
            <td data-label="موقع المشروع">{{ record.project_location || '—' }}</td>
            <td data-label="التاريخ">{{ formatDate(record.date) }}</td>
            <td data-label="اليوم (عربي)">{{ record.day_name_ar || '—' }}</td>
            <td data-label="اليوم (إنجليزي)">{{ record.day_of_week || '—' }}</td>
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

loadAttendance();
</script>

<style scoped>
/* ===== تنسيقات الحضور — هوية راكز (كحلي / ذهبي / زجاجي) ===== */
.attendance-tab {
  width: 100%;
  direction: rtl;
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: var(--color-gold, #b5a99a);
  flex-shrink: 0;
}

.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-gold, #b5a99a) 0%, var(--color-gold-dark, #9a8d7d) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(177, 162, 143, 0.45);
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

/* ===== الحالة الفارغة / خطأ ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  padding: 48px 20px;
  text-align: center;
  color: var(--color-dark-gray, #64748b);
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(248, 250, 252, 0.88) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(39, 55, 77, 0.08);
  border-radius: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

.empty-icon {
  width: 44px;
  height: 44px;
  color: var(--color-gold, #b5a99a);
  margin-bottom: 14px;
  opacity: 0.7;
}

.empty-state.error-state {
  border-color: rgba(185, 28, 28, 0.12);
}

.empty-state.error-state .empty-icon {
  color: #b91c1c;
  opacity: 0.8;
}

.empty-state.error-state p {
  color: #b91c1c;
  font-weight: 600;
  margin-bottom: 12px;
}

/* ===== جدول الحضور — زجاجي ===== */
.attendance-table-container {
  overflow-x: auto;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(248, 250, 252, 0.88) 100%
  );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 16px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 4px 16px rgba(39, 55, 77, 0.08);
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table th {
  background: linear-gradient(
    180deg,
    rgba(39, 55, 77, 0.06) 0%,
    rgba(39, 55, 77, 0.03) 100%
  );
  padding: 14px 16px;
  text-align: right;
  font-weight: 700;
  font-size: 0.8125rem;
  color: var(--color-navy, #27374D);
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(39, 55, 77, 0.08);
}

.attendance-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(39, 55, 77, 0.05);
  font-size: 0.9rem;
  color: var(--color-charcoal, #1e293b);
}

.attendance-table tbody tr {
  transition: background 0.15s ease;
}

.attendance-table tbody tr:hover {
  background: rgba(181, 169, 154, 0.06);
}

.attendance-table tbody tr:last-child td {
  border-bottom: none;
}

/* ===== شارات الحالة ===== */
.attendance-status {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.73rem;
  font-weight: 700;
  white-space: nowrap;
}

.attendance-status.present {
  background: rgba(5, 150, 105, 0.1);
  color: #065f46;
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.attendance-status.absent {
  background: rgba(185, 28, 28, 0.08);
  color: #991b1b;
  border: 1px solid rgba(185, 28, 28, 0.15);
}

.attendance-status.late {
  background: rgba(181, 169, 154, 0.15);
  color: var(--color-gold-dark, #7a6f60);
  border: 1px solid rgba(181, 169, 154, 0.25);
}

.attendance-status.on_leave {
  background: rgba(39, 55, 77, 0.08);
  color: var(--color-navy, #27374D);
  border: 1px solid rgba(39, 55, 77, 0.12);
}

/* ===== المودال — زجاجي ===== */
.assign-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.assign-modal {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.96) 100%
  );
  border: 1px solid rgba(39, 55, 77, 0.08);
  border-radius: 18px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.7) inset,
    0 24px 56px rgba(15, 23, 42, 0.22),
    0 8px 24px rgba(0, 0, 0, 0.08);
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
  padding: 20px 22px;
  border-bottom: 1px solid rgba(39, 55, 77, 0.08);
  background: rgba(248, 250, 252, 0.6);
  border-radius: 18px 18px 0 0;
}

.assign-modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-navy, #27374D);
  letter-spacing: -0.01em;
}

.assign-close {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: rgba(248, 250, 252, 0.8);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-dark-gray, #64748b);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.assign-close:hover {
  background: rgba(39, 55, 77, 0.08);
  color: var(--color-navy, #27374D);
}

.schedule-form {
  padding: 18px 22px 0;
}

.schedule-form .form-row {
  margin-bottom: 16px;
}

.schedule-form .form-row-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.schedule-form .form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-navy, #27374D);
  margin-bottom: 6px;
}

.schedule-form .form-select,
.schedule-form .form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(39, 55, 77, 0.12);
  border-radius: 10px;
  font-size: 0.9375rem;
  background: rgba(255, 255, 255, 0.88);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.schedule-form .form-select:focus,
.schedule-form .form-input:focus {
  outline: none;
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 0 0 2px rgba(181, 169, 154, 0.2);
}

.assign-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 22px;
  border-top: 1px solid rgba(39, 55, 77, 0.06);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 0 0 18px 18px;
  margin-top: 8px;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid rgba(39, 55, 77, 0.14);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-navy, #27374D);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(248, 250, 252, 0.95);
  border-color: rgba(39, 55, 77, 0.2);
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
