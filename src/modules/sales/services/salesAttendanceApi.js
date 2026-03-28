import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  async getMyAttendance(params = {}) {
    const response = await apiClient.get('/sales/attendance/my', { params });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : response?.data?.data ?? response?.data ?? [];
    return Array.isArray(list) ? list : [];
  },

  async getTeamAttendance(params = {}) {
    const response = await apiClient.get('/sales/attendance/team', { params });
    const { items } = extractPaginatedData(response, []);
    const list = Array.isArray(items) ? items : response?.data?.data ?? response?.data ?? [];
    return Array.isArray(list) ? list : [];
  },

  createSchedule(data) {
    return apiClient.post('/sales/attendance/schedules', data);
  },

  async getProjectScheduleMembers(projectId, date) {
    const params = {};
    if (date) params.date = date;
    try {
      const response = await apiClient.get(`/sales/attendance/project/${projectId}`, { params });
      const payload = response?.data?.data ?? response?.data ?? {};
      const raw = payload?.members ?? (Array.isArray(payload) ? payload : []);
      const members = Array.isArray(raw) ? raw : [];
      return {
        members,
        server_date: payload.server_date ?? payload.date ?? date ?? null,
        server_time: payload.server_time ?? null,
        day_name_ar: payload.day_name_ar ?? null,
      };
    } catch {
      // Manual fallback if API fails
      return { members: [], server_date: date, server_time: null, day_name_ar: null };
    }
  },

  async saveProjectSchedules(projectId, schedules, date) {
    const schedule_date = (date || new Date().toISOString().slice(0, 10)).replace(/\//g, '-');
    const toTime = v => {
      if (!v) return '08:00';
      const s = String(v).trim();
      return s.length > 5 ? s.slice(0, 8) : s;
    };
    try {
      const payload = {
        date: schedule_date,
        schedules: schedules.map(s => ({
          user_id: s.user_id,
          present: s.is_present ?? s.present ?? false,
          start_time: toTime(s.start_time) || '08:00',
          end_time: toTime(s.end_time) || '17:00',
        })),
      };
      const response = await apiClient.post(`/sales/attendance/project/${projectId}/bulk`, payload);
      return response.data?.data ?? response.data ?? {};
    } catch {
      // Single fallback
      return { saved: 0, items: [] };
    }
  },
};
