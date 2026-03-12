<template>
  <div class="attendance-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">{{ hasPermission('sales.attendance.manage') ? 'حضور الفريق' : 'دوامي' }}</h1>
        <p class="welcome-subtitle">
          {{ hasPermission('sales.attendance.manage') ? 'إدارة جداول دوام الفريق ومتابعة الحضور' : 'متابعة سجل دوامك وتوقيتات الدخول والخروج' }}
        </p>
      </div>
      <button v-if="hasPermission('sales.attendance.manage')" @click="showScheduleModal = true" class="btn-add">
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
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import Pagination from '@/components/Pagination.vue';
import { useSalesAttendance } from '@/composables/sales/useSalesAttendance';

const {
  paginatedAttendance, attendanceRecords, isLoadingAttendance,
  attendancePage: currentPage, attendancePerPage: perPage,
  hasPermission, formatDate,
  handleAttendancePageChange, handleAttendancePerPageChange,
  loadAttendance, showScheduleModal,
} = useSalesAttendance();

const totalAttendance = computed(() => attendanceRecords.value.length);

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

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.4);
}

.btn-add svg {
  width: 18px;
  height: 18px;
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

@media (max-width: 768px) {
  .welcome-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
