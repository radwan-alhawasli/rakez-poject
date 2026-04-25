/**
 * Domain -> route-level view names under src/modules/<domain>/views.
 * Source of truth for audits; router imports use module paths.
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
  hr: ['UsersView', 'TeamsView', 'TeamManagementView'],
  inventory: ['InventoryView'],
  accounting: ['AccountingView'],
  editor: ['ImageApprovalView'],
  manager: [
    'ManagerLayout',
    'ManagerEmployeesView',
    'ManagerEmployeeDetailView',
    'ManagerTasksView',
  ],
};
