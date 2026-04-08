import { ref, reactive, computed, shallowRef } from 'vue';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import { usePermissions } from '@/composables/usePermissions';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export function useSalesAttendance() {
  const { hasPermission } = usePermissions();
  const { formatDate } = useFormatters();

  const attendanceRecords = shallowRef([]);
  const isLoadingAttendance = ref(false);
  const attendanceLoadError = ref('');
  const attendancePage = ref(1);
  const attendancePerPage = ref(25);
  const showScheduleModal = ref(false);
  const scheduleCreateSaving = ref(false);
  const scheduleForm = reactive({
    contract_id: '',
    employee_id: '',
    date: '',
    start_time: '',
    end_time: '',
  });

  const paginatedAttendance = computed(() => {
    const list = Array.isArray(attendanceRecords.value) ? attendanceRecords.value : [];
    const start = (attendancePage.value - 1) * attendancePerPage.value;
    return list.slice(start, start + attendancePerPage.value);
  });

  const loadAttendance = async () => {
    isLoadingAttendance.value = true;
    attendanceLoadError.value = '';
    try {
      const list = hasPermission('sales.attendance.manage')
        ? await salesService.getTeamAttendance()
        : await salesService.getMyAttendance();
      const raw = Array.isArray(list) ? list : [];
      attendanceRecords.value = raw.map(r => ({
        id: r.id ?? r.schedule_id ?? r.attendance_id,
        schedule_id: r.schedule_id ?? r.id ?? null,
        user_id: r.user_id ?? null,
        user_name: r.user_name ?? r.employee_name ?? r.marketer_name ?? r.name ?? '—',
        employee_name: r.employee_name ?? r.user_name ?? r.marketer_name ?? r.name ?? '—',
        project_id: r.project_id ?? r.contract_id ?? null,
        project_name: r.project_name ?? r.contract_name ?? r.project?.name ?? '—',
        project_location: r.project_location != null && String(r.project_location).trim() !== '' ? String(r.project_location).trim() : '',
        date: r.date ?? r.schedule_date ?? r.attendance_date,
        schedule_date: r.schedule_date ?? r.date ?? r.attendance_date,
        day_of_week: r.day_of_week != null && String(r.day_of_week).trim() !== '' ? String(r.day_of_week).trim() : '',
        day_name_ar: r.day_name_ar != null && String(r.day_name_ar).trim() !== '' ? String(r.day_name_ar).trim() : '',
        check_in_time: r.check_in_time ?? r.start_time ?? r.check_in,
        check_out_time: r.check_out_time ?? r.end_time ?? r.check_out,
        status: r.status ?? r.attendance_status,
        hours_worked: r.hours_worked ?? r.work_hours ?? r.total_hours,
      }));
    } catch (error) {
      logger.error('[SalesAttendance] Error loading attendance:', error);
      attendanceRecords.value = [];
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message;
      if (status === 403) {
        attendanceLoadError.value = 'ليس لديك صلاحية عرض سجلات الحضور.';
      } else if (status === 401) {
        attendanceLoadError.value = 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
      } else {
        attendanceLoadError.value = msg ? `فشل تحميل البيانات: ${msg}` : 'فشل تحميل سجلات الحضور. تحقق من الاتصال.';
      }
    } finally {
      isLoadingAttendance.value = false;
    }
  };

  const getAttendanceStatusText = status => {
    const statusMap = {
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      on_leave: 'إجازة',
    };
    return statusMap[status] || status;
  };

  const handleAttendancePageChange = page => {
    attendancePage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAttendancePerPageChange = newPerPage => {
    attendancePerPage.value = newPerPage;
    attendancePage.value = 1;
  };

  const openScheduleModal = async (teamMembers, teamProjects, loadTeamMembers, loadTeamProjects) => {
    if (teamMembers.value.length === 0) await loadTeamMembers();
    if (teamProjects.value.length === 0) await loadTeamProjects();
    const today = new Date().toISOString().slice(0, 10);
    Object.assign(scheduleForm, {
      contract_id: '',
      employee_id: '',
      date: today,
      start_time: '08:00',
      end_time: '17:00',
    });
    showScheduleModal.value = true;
  };

  const createSchedule = async () => {
    if (!hasPermission('sales.attendance.manage')) {
      notificationService.addNotification('غير مصرح لك بإدارة الدوام', 'warning');
      return;
    }
    if (!scheduleForm.contract_id || !scheduleForm.employee_id || !scheduleForm.date) {
      notificationService.addNotification('يرجى اختيار المسوق والمشروع والتاريخ', 'warning');
      return;
    }
    scheduleCreateSaving.value = true;
    try {
      await salesService.createSchedule({
        contract_id: scheduleForm.contract_id,
        user_id: scheduleForm.employee_id,
        schedule_date: scheduleForm.date,
        start_time: scheduleForm.start_time || '08:00',
        end_time: scheduleForm.end_time || '17:00',
      });
      notificationService.addNotification('تم إنشاء الجدول بنجاح', 'success');
      showScheduleModal.value = false;
      loadAttendance();
      Object.assign(scheduleForm, {
        contract_id: '',
        employee_id: '',
        date: new Date().toISOString().slice(0, 10),
        start_time: '08:00',
        end_time: '17:00',
      });
    } catch (error) {
      logger.error('Error creating schedule:', error);
      notificationService.addNotification('حدث خطأ أثناء إنشاء الجدول', 'error');
    } finally {
      scheduleCreateSaving.value = false;
    }
  };

  return {
    attendanceRecords,
    isLoadingAttendance,
    attendanceLoadError,
    paginatedAttendance,
    attendancePage,
    attendancePerPage,
    showScheduleModal,
    scheduleCreateSaving,
    scheduleForm,
    loadAttendance,
    getAttendanceStatusText,
    handleAttendancePageChange,
    handleAttendancePerPageChange,
    openScheduleModal,
    createSchedule,
    hasPermission,
    formatDate,
  };
}
