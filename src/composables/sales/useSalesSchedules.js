import { ref, reactive, computed, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import salesService from '@/services/salesService';
import notificationService from '@/services/notificationService';
import authService from '@/services/authService';
import { isSalesLeader } from '@/utils/rbac';
import html2canvas from 'html2canvas';
import logger from '@/utils/logger';

export function useSalesSchedules() {
  const router = useRouter();

  const scheduleProjects = shallowRef([]);
  const isLoadingScheduleProjects = ref(false);
  const selectedScheduleProject = ref(null);
  const scheduleMembers = ref([]);
  const isLoadingScheduleDetail = ref(false);
  const isSavingSchedules = ref(false);
  const emergencyContact = reactive({ name: '', phone: '', role: 'أخرى' });
  const scheduleDetailRef = ref(null);
  const scheduleViewDate = ref(new Date().toISOString().slice(0, 10));
  const scheduleViewTime = ref('');
  const scheduleServerDate = ref('');
  const scheduleServerTime = ref('');
  const scheduleDayNameAr = ref('');

  const normalizeProjects = raw =>
    raw.map(p => ({
      ...p,
      id: p.contract_id ?? p.id,
      contract_id: p.contract_id ?? p.id,
      project_name: p.project_name || p.name || p.contract_name,
    }));

  const toTimeHHMM = v => {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    if (!s) return null;
    const part = s.slice(0, 5);
    return /^\d{1,2}:\d{2}$/.test(part) ? part : null;
  };

  const normalizeScheduleMember = m => ({
    ...m,
    is_present: !!(m.is_present ?? m.present),
    start_time: toTimeHHMM(m.start_time ?? m.check_in_time) || '08:00',
    end_time: toTimeHHMM(m.end_time ?? m.check_out_time) || '17:00',
  });

  const getArabicDayForDate = dateStr => {
    if (!dateStr) return getArabicDayForDate(new Date().toISOString().slice(0, 10));
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    try {
      const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return days[date.getDay()];
    } catch {
      return days[new Date().getDay()];
    }
  };

  const scheduleViewDateFormatted = computed(() => {
    const d = scheduleViewDate.value;
    if (!d) return '—';
    try {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return d;
    }
  });

  const scheduleDisplayDate = computed(() => {
    const s = scheduleServerDate.value;
    if (s && s.trim()) return s;
    return scheduleViewDateFormatted.value;
  });

  const scheduleDisplayTime = computed(() => {
    const s = scheduleServerTime.value;
    if (s != null && String(s).trim()) {
      const parts = String(s).trim().split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parts[1];
        const sec = parts[2] || '00';
        if (h >= 0 && h <= 23) {
          const period = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          return `${h12}:${m}:${sec} ${period}`;
        }
      }
      return s;
    }
    return scheduleViewTime.value;
  });

  const scheduleDisplayDayName = computed(() => {
    const ar = scheduleDayNameAr.value;
    if (ar && ar.trim()) return ar;
    return getArabicDayForDate(scheduleViewDate.value);
  });

  const updateScheduleViewTime = () => {
    const now = new Date();
    scheduleViewTime.value = now.toLocaleTimeString('ar-SA', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getAvatarColor = id => {
    const colors = [
      '#2ecc71', '#3498db', '#9b59b6', '#e67e22',
      '#1abc9c', '#e74c3c', '#f39c12', '#2c3e50',
    ];
    return colors[(id || 0) % colors.length];
  };

  const loadScheduleProjects = async () => {
    isLoadingScheduleProjects.value = true;
    try {
      const data = await salesService.getTeamProjects();
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      if (raw.length > 0) {
        scheduleProjects.value = normalizeProjects(raw);
        return;
      }
      const assignments = await salesService.getMyAssignments();
      const assignRaw = assignments?.items ?? (Array.isArray(assignments) ? assignments : []);
      if (assignRaw.length > 0) {
        scheduleProjects.value = normalizeProjects(assignRaw);
        return;
      }
      const user = authService.getCurrentUser();
      const scope = user && isSalesLeader(user) ? 'team' : 'me';
      const res = await salesService.getProjects({ scope, per_page: 100 });
      const list = res?.data?.data ?? res?.data ?? res;
      const projRaw = Array.isArray(list) ? list : [];
      scheduleProjects.value = normalizeProjects(projRaw);
    } catch (error) {
      logger.error('Error loading schedule projects:', error);
    } finally {
      isLoadingScheduleProjects.value = false;
    }
  };

  const loadScheduleForSelectedDate = async () => {
    const project = selectedScheduleProject.value;
    if (!project) return;
    const projectId = project.contract_id || project.id;
    const date = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
    isLoadingScheduleDetail.value = true;
    try {
      const result = await salesService.getProjectScheduleMembers(projectId, date);
      const list = result.members ?? [];
      scheduleMembers.value = list.map(m => normalizeScheduleMember(m));
      scheduleServerDate.value = result.server_date ?? '';
      scheduleServerTime.value = result.server_time ?? '';
      scheduleDayNameAr.value = result.day_name_ar ?? '';
      if (!result.server_time) updateScheduleViewTime();
    } catch (error) {
      logger.error('Error loading schedule for date:', error);
      notificationService.addNotification('حدث خطأ أثناء تحميل دوام التاريخ المحدد', 'error');
    } finally {
      isLoadingScheduleDetail.value = false;
    }
  };

  const openProjectSchedule = async project => {
    selectedScheduleProject.value = project;
    scheduleViewDate.value = new Date().toISOString().slice(0, 10);
    scheduleServerDate.value = '';
    scheduleServerTime.value = '';
    scheduleDayNameAr.value = '';
    isLoadingScheduleDetail.value = true;
    try {
      const projectId = project.contract_id || project.id;
      const date = scheduleViewDate.value;
      const [scheduleResult, ecData] = await Promise.all([
        salesService.getProjectScheduleMembers(projectId, date),
        salesService.getEmergencyContacts(projectId).catch(() => ({})),
      ]);
      const list = scheduleResult.members ?? [];
      scheduleMembers.value = list.map(m => normalizeScheduleMember(m));
      scheduleServerDate.value = scheduleResult.server_date ?? '';
      scheduleServerTime.value = scheduleResult.server_time ?? '';
      scheduleDayNameAr.value = scheduleResult.day_name_ar ?? '';
      if (!scheduleResult.server_time) updateScheduleViewTime();
      const ec = Array.isArray(ecData) ? ecData[0] : ecData;
      if (ec) {
        emergencyContact.name = ec.name || ec.contact_name || '';
        emergencyContact.phone = ec.phone || ec.contact_phone || '';
        emergencyContact.role = ec.role || ec.contact_role || 'أخرى';
      } else {
        Object.assign(emergencyContact, { name: '', phone: '', role: 'أخرى' });
      }
      router.push({ name: 'SalesProjectScheduleDetail', params: { projectId } });
    } catch (error) {
      logger.error('Error loading project schedule:', error);
      notificationService.addNotification('حدث خطأ أثناء تحميل بيانات المشروع', 'error');
    } finally {
      isLoadingScheduleDetail.value = false;
    }
  };

  const toggleScheduleMember = member => {
    const idx = scheduleMembers.value.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      scheduleMembers.value[idx] = {
        ...scheduleMembers.value[idx],
        is_present: !member.is_present,
      };
      scheduleMembers.value = [...scheduleMembers.value];
    }
  };

  const updateMemberScheduleTime = (member, field, value) => {
    const idx = scheduleMembers.value.findIndex(m => m.id === member.id);
    if (idx !== -1 && (field === 'start_time' || field === 'end_time')) {
      const next = { ...scheduleMembers.value[idx], [field]: value || (field === 'start_time' ? '08:00' : '17:00') };
      scheduleMembers.value[idx] = next;
      scheduleMembers.value = [...scheduleMembers.value];
    }
  };

  const backToList = () => {
    selectedScheduleProject.value = null;
    scheduleMembers.value = [];
  };

  const saveAllSchedules = async () => {
    isSavingSchedules.value = true;
    try {
      const projectId =
        selectedScheduleProject.value?.contract_id || selectedScheduleProject.value?.id;
      const date = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
      const schedules = scheduleMembers.value.map(m => ({
        user_id: m.id,
        is_present: !!(m.is_present ?? m.present),
        start_time: m.start_time || '08:00',
        end_time: m.end_time || '17:00',
      }));

      const result = await salesService.saveProjectSchedules(projectId, schedules, date);
      await salesService.updateEmergencyContacts(projectId, {
        name: emergencyContact.name,
        phone: emergencyContact.phone,
        role: emergencyContact.role,
      });

      await loadScheduleForSelectedDate();

      if (scheduleDetailRef.value) {
        try {
          const canvas = await html2canvas(scheduleDetailRef.value, {
            useCORS: true,
            scale: 1.5,
            backgroundColor: '#f8fafc',
          });
          const link = document.createElement('a');
          const dateForFile = scheduleViewDate.value || new Date().toISOString().slice(0, 10);
          link.download = `attendance-${dateForFile}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch (imgErr) {
          logger.error('Error capturing attendance image:', imgErr);
        }
      }

      const items = result?.items ?? result?.schedules ?? (Array.isArray(result) ? result : []);
      const first = items[0];
      const dayName = first?.day_name_ar ?? scheduleDisplayDayName.value ?? '';
      const scheduleDate = first?.schedule_date ?? date ?? scheduleViewDate.value ?? '';
      const startTime = first?.start_time ?? schedules[0]?.start_time ?? '08:00';
      const endTime = first?.end_time ?? schedules[0]?.end_time ?? '17:00';
      const timeRange = `${String(startTime).slice(0, 5)} إلى ${String(endTime).slice(0, 5)}`;
      const detailMsg =
        dayName && scheduleDate
          ? `تم تعيين الدوام: ${dayName} ${scheduleDate} من ${timeRange}`
          : 'تم حفظ الجداول وإرسال الإشعارات للفريق بنجاح';
      notificationService.addNotification(detailMsg, 'success');
    } catch (error) {
      logger.error('Error saving schedules:', error);
      notificationService.addNotification('حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
      isSavingSchedules.value = false;
    }
  };

  return {
    scheduleProjects,
    isLoadingScheduleProjects,
    selectedScheduleProject,
    scheduleMembers,
    isLoadingScheduleDetail,
    isSavingSchedules,
    emergencyContact,
    scheduleDetailRef,
    scheduleViewDate,
    scheduleDisplayDate,
    scheduleDisplayTime,
    scheduleDisplayDayName,
    getAvatarColor,
    loadScheduleProjects,
    loadScheduleForSelectedDate,
    openProjectSchedule,
    toggleScheduleMember,
    updateMemberScheduleTime,
    backToList,
    saveAllSchedules,
  };
}
