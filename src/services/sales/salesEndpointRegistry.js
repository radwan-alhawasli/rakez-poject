/**
 * Sales API endpoint registry (Postman alignment)
 *
 * Sales Module API — Base URL: /api/sales (Auth: Bearer token, Content-Type: application/json)
 * Aligned with: "Sales Module - Complete API Collection"
 * - Part 1: Sales Staff (dashboard, projects, units, reservation-context, reservations CRUD, targets, attendance, waiting-list, sold-units, deposits, analytics, notifications)
 * - Part 2: Sales Leader (team/projects, team/members, rating, remove, recommendations, emergency-contacts, targets, attendance/schedules, attendance/project, marketing-tasks, waiting-list/convert)
 * - Admin: project-assignments
 * Create reservation (1.6): reservation_type aliases (عقد→confirmed_reservation, تفاوض→negotiation), required fields and defaults applied in _normalizeReservationPayload. Cancel (1.9): body { cancellation_reason }.
 *
 * Sales API registry (Union of both Postman collections, priority: 249 collection)
 * - preferred_249: endpoint exists in "RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json"
 * - merge_only: endpoint taken from "RAKEZ_ERP_COMPLETE_API_COLLECTION.postman_collection.json" when missing in 249
 */
export const SALES_API_ENDPOINT_REGISTRY = {
  getTeamProjects: { method: 'GET', endpoint: '/sales/team/projects', source: 'preferred_249' },
  getTeamMembers: { method: 'GET', endpoint: '/sales/team/members', source: 'preferred_249' },
  getDashboard: { method: 'GET', endpoint: '/sales/dashboard', source: 'preferred_249' },
  getSoldUnits: { method: 'GET', endpoint: '/sales/sold-units', source: 'preferred_249' },
  getSoldUnitCommissionSummary: {
    method: 'GET',
    endpoint: '/sales/sold-units/{unit_id}/commission-summary',
    source: 'preferred_249',
  },
  getDepositsManagement: {
    method: 'GET',
    endpoint: '/sales/deposits/management',
    source: 'preferred_249',
  },
  getDepositsFollowUp: {
    method: 'GET',
    endpoint: '/sales/deposits/follow-up',
    source: 'preferred_249',
  },
  getAnalyticsDashboard: {
    method: 'GET',
    endpoint: '/sales/analytics/dashboard',
    source: 'preferred_249',
  },
  getAnalyticsSoldUnits: {
    method: 'GET',
    endpoint: '/sales/analytics/sold-units',
    source: 'preferred_249',
  },
  getAnalyticsDepositStatsByProject: {
    method: 'GET',
    endpoint: '/sales/analytics/deposits/stats/project/{contract_id}',
    source: 'preferred_249',
  },
  getAnalyticsCommissionStatsByEmployee: {
    method: 'GET',
    endpoint: '/sales/analytics/commissions/stats/employee/{user_id}',
    source: 'preferred_249',
  },
  getAnalyticsMonthlyCommissionReport: {
    method: 'GET',
    endpoint: '/sales/analytics/commissions/monthly-report',
    source: 'preferred_249',
  },
  getProjects: { method: 'GET', endpoint: '/sales/projects', source: 'preferred_249' },
  getProjectDetails: {
    method: 'GET',
    endpoint: '/sales/projects/{contract_id}',
    source: 'preferred_249',
  },
  getProjectUnits: {
    method: 'GET',
    endpoint: '/sales/projects/{contract_id}/units',
    source: 'preferred_249',
  },
  getReservationContext: {
    method: 'GET',
    endpoint: '/sales/units/{unit_id}/reservation-context',
    source: 'preferred_249',
  },
  getReservations: { method: 'POST', endpoint: '/sales/reservations/filter', source: 'preferred_249', fallback: { method: 'GET', endpoint: '/sales/reservations' } },
  createReservation: { method: 'POST', endpoint: '/sales/reservations', source: 'preferred_249' },
  confirmReservation: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/confirm',
    source: 'preferred_249',
  },
  cancelReservation: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/cancel',
    source: 'preferred_249',
  },
  getMyTargets: { method: 'GET', endpoint: '/sales/targets/my', source: 'preferred_249' },
  getTargetsByProject: { method: 'GET', endpoint: '/sales/targets/by-project/{contract_id}', source: 'preferred_249' },
  createTarget: { method: 'POST', endpoint: '/sales/targets', source: 'preferred_249' },
  updateTarget: {
    method: 'PATCH',
    endpoint: '/sales/targets/{target_id}',
    source: 'preferred_249',
  },
  getExecutiveAvailableUnits: {
    method: 'GET',
    endpoint: '/sales/executive/available-units',
    source: 'phase1_sales_roles',
  },
  getExecutiveTargets: {
    method: 'GET',
    endpoint: '/sales/executive-director-lines',
    source: 'phase1_sales_roles',
  },
  getExecutiveTarget: {
    method: 'GET',
    endpoint: '/sales/executive-director-lines/{target_id}',
    source: 'phase1_sales_roles',
  },
  createExecutiveTarget: {
    method: 'POST',
    endpoint: '/sales/executive-director-lines',
    source: 'phase1_sales_roles',
  },
  updateExecutiveTarget: {
    method: 'PUT',
    endpoint: '/sales/executive-director-lines/{target_id}',
    source: 'phase1_sales_roles',
  },
  deleteExecutiveTarget: {
    method: 'DELETE',
    endpoint: '/sales/executive-director-lines/{target_id}',
    source: 'phase1_sales_roles',
  },
  getManagerTargets: {
    method: 'GET',
    endpoint: '/sales/executive/targets',
    source: 'phase1_sales_roles',
  },
  getSalesTeams: {
    method: 'GET',
    endpoint: '/sales/team/index',
    source: 'phase1_sales_roles',
  },
  assignTargetToTeams: {
    method: 'POST',
    endpoint: '/sales/executive-director-lines/{target_id}/teams',
    source: 'phase1_sales_roles',
  },
  getManagerMemberTargets: {
    method: 'GET',
    endpoint: '/sales/manager/executive-director-lines/{member_user_id}',
    source: 'sales_hierarchy_phase2',
  },
  getTeamLeaderTargets: {
    method: 'GET',
    endpoint: '/sales/team/executive-director-lines',
    source: 'sales_hierarchy_phase2',
  },
  assignTargetToTeamGroups: {
    method: 'POST',
    endpoint: '/sales/team/executive-director-lines/{line_id}/team-groups',
    source: 'sales_hierarchy_phase2',
  },
  getTeamGroupLeaders: {
    method: 'GET',
    endpoint: '/sales/team/group-leaders',
    source: 'sales_hierarchy_phase2',
  },
  getTeamGroups: {
    method: 'GET',
    endpoint: '/sales/team/groups',
    source: 'sales_hierarchy_phase2',
  },
  getLedTeam: {
    method: 'GET',
    endpoint: '/sales/team/led',
    source: 'sales_hierarchy_phase2',
  },
  getGroupLeaderTargets: {
    method: 'GET',
    endpoint: '/sales/team-group/executive-director-lines',
    source: 'sales_hierarchy_phase2',
  },
  getGroupLeaderLedTeam: {
    method: 'GET',
    endpoint: '/sales/team-group/led-team',
    source: 'sales_hierarchy_phase2',
  },
  getGroupLeaderLedGroups: {
    method: 'GET',
    endpoint: '/sales/team-group/led-groups',
    source: 'sales_hierarchy_phase2',
  },
  getGroupLeaderMembers: {
    method: 'GET',
    endpoint: '/sales/team-group/members',
    source: 'sales_hierarchy_phase2',
  },
  assignTargetToMembers: {
    method: 'POST',
    endpoint: '/sales/team-group/executive-director-lines/{line_id}/members',
    source: 'sales_hierarchy_phase2',
  },
  getMemberTargets: {
    method: 'GET',
    endpoint: '/sales/member/executive-director-lines',
    source: 'sales_hierarchy_phase2',
  },
  getMyAttendance: { method: 'GET', endpoint: '/sales/attendance/my', source: 'preferred_249' },
  getTeamAttendance: { method: 'GET', endpoint: '/sales/attendance/team', source: 'preferred_249' },
  createSchedule: {
    method: 'POST',
    endpoint: '/sales/attendance/schedules',
    source: 'preferred_249',
  },
  getWaitingList: { method: 'GET', endpoint: '/sales/waiting-list', source: 'preferred_249' },
  convertToReservation: {
    method: 'POST',
    endpoint: '/sales/waiting-list/{waiting_list_id}/convert',
    source: 'preferred_249',
  },
  getPendingNegotiations: {
    method: 'GET',
    endpoint: '/sales/negotiations/pending',
    source: 'preferred_249',
  },
  approveNegotiation: {
    method: 'POST',
    endpoint: '/sales/negotiations/{negotiation_id}/approve',
    source: 'preferred_249',
  },
  rejectNegotiation: {
    method: 'POST',
    endpoint: '/sales/negotiations/{negotiation_id}/reject',
    source: 'preferred_249',
  },
  getPaymentPlan: {
    method: 'GET',
    endpoint: '/sales/reservations/{reservation_id}/payment-plan',
    source: 'preferred_249',
  },
  createPaymentPlan: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/payment-plan',
    source: 'preferred_249',
  },
  getTaskProjects: { method: 'GET', endpoint: '/sales/tasks/projects', source: 'preferred_249' },
  getProjectTasks: {
    method: 'GET',
    endpoint: '/sales/tasks/projects/{contract_id}',
    source: 'preferred_249',
  },
  createMarketingTask: {
    method: 'POST',
    endpoint: '/sales/marketing-tasks',
    source: 'preferred_249',
  },
  updateTaskStatus: {
    method: 'PATCH',
    endpoint: '/sales/marketing-tasks/{task_id}',
    source: 'preferred_249',
  },
  logReservationAction: {
    method: 'POST',
    endpoint: '/sales/reservations/{reservation_id}/actions',
    source: 'preferred_249',
  },
  downloadVoucher: {
    method: 'GET',
    endpoint: '/sales/reservations/{reservation_id}/voucher',
    source: 'preferred_249',
  },
  createWaitingList: { method: 'POST', endpoint: '/sales/waiting-list', source: 'preferred_249' },
  getWaitingListByUnit: {
    method: 'GET',
    endpoint: '/sales/waiting-list/unit/{unit_id}',
    source: 'preferred_249',
  },
  deleteWaitingList: {
    method: 'DELETE',
    endpoint: '/sales/waiting-list/{waiting_list_id}',
    source: 'preferred_249',
  },
  updateEmergencyContacts: {
    method: 'PATCH',
    endpoint: '/sales/projects/{contract_id}/emergency-contacts',
    source: 'preferred_249',
  },
  assignProjectToLeader: {
    method: 'POST',
    endpoint: '/admin/sales/project-assignments',
    source: 'preferred_249',
  },
  getProjectAssignments: {
    method: 'GET',
    endpoint: '/admin/sales/project-assignments',
    source: 'preferred_249',
  },
  getMyAssignments: { method: 'GET', endpoint: '/sales/assignments/my', source: 'preferred_249' },
  getProjectAttendanceOverview: {
    method: 'GET',
    endpoint: '/sales/attendance/project/{contract_id}',
    source: 'preferred_249',
  },
  bulkSaveProjectAttendance: {
    method: 'POST',
    endpoint: '/sales/attendance/project/{contract_id}/bulk',
    source: 'preferred_249',
  },
};
