/**
 * Domain → path for views migrated from src/views (Phase 2).
 * Source of truth for grep/audits; router imports use @/modules/... directly.
 */
export const VIEW_DOMAIN_MAP = {
  app: [
    'DashboardView',
    'AiAssistantView',
    'ChatView',
    'ProfileView',
    'NotificationsView',
    'TasksView',
    'BoardsView',
  ],
  auth: ['LoginView'],
  knowledge: ['KnowledgeManagementView'],
  projects: [
    'ProjectManagementView',
    'ProjectTrackerView',
    'MyRequestsView',
    'DevelopersView',
    'DeveloperDetailView',
    'DeveloperProjectUnitsView',
    'ExclusiveProjectView',
  ],
  contracts: ['ContractsView'],
  sales: ['ReservationsView', 'CancelledReservationsView'],
  hr: ['UsersView', 'AgentsView', 'TeamsView', 'TeamManagementView'],
  inventory: ['InventoryView'],
  accounting: ['CommissionDepositsView'],
  editor: ['ImageApprovalView'],
  manager: [
    'ManagerLayout',
    'ManagerEmployeesView',
    'ManagerEmployeeDetailView',
    'ManagerTasksView',
  ],
};
