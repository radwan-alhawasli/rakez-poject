import apiClient from '@/api/apiClient';
import { extractPaginatedData } from '@/utils/paginationUtils';

export default {
  async getTeamProjects(params = {}) {
    const response = await apiClient.get('/sales/team/projects', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  },

  async getMyAssignments(params = {}) {
    const response = await apiClient.get('/sales/assignments/my', { params });
    const { items, total } = extractPaginatedData(response, []);
    return { items, total };
  },

  async getProjectAssignments(params = {}) {
    const response = await apiClient.get('/admin/sales/project-assignments', { params });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  async getTeamMembers(params = {}) {
    const { with_ratings = true } = params;
    const response = await apiClient.get('/sales/team/members', {
      params: { with_ratings },
    });
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      rating: m.leader_rating != null ? Number(m.leader_rating) : (m.rating != null ? Number(m.rating) : null),
      confirmed_bookings: m.confirmed_reservations_count ?? m.confirmed_bookings ?? m.confirmed_count ?? 0,
    }));
  },

  async getTeamRecommendations() {
    const response = await apiClient.get('/sales/team/recommendations');
    const raw = response?.data?.data ?? response?.data ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map(m => ({
      ...m,
      id: m.id ?? m.user_id ?? m.marketer_id,
      name: m.name ?? m.full_name ?? m.marketer_name ?? m.email ?? `#${m.id ?? m.user_id ?? ''}`,
      recommendation_score: m.recommendation_score != null ? Number(m.recommendation_score) : null,
    }));
  },

  rateTeamMember(memberId, rating, comment = null) {
    const body = {};
    if (rating != null && rating !== '') body.rating = Number(rating);
    if (comment != null && String(comment).trim() !== '') body.comment = String(comment).trim();
    return apiClient.patch(`/sales/team/members/${memberId}/rating`, body);
  },

  removeTeamMember(memberId) {
    return apiClient.post(`/sales/team/members/${memberId}/remove`);
  },

  assignProject(data) {
    return apiClient.post('/admin/sales/project-assignments', data);
  },
};
