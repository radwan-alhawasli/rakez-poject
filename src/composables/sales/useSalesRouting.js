import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';

const TAB_ROUTE_ENTRIES = Object.freeze([
  ['SalesDashboard', 'dashboard'],
  ['SalesTargets', 'targets'],
  ['SalesProjects', 'projects'],
  ['SalesReservations', 'reservations'],
  ['SalesAttendance', 'attendance'],
  ['SalesTeam', 'team'],
  ['SalesTasks', 'tasks'],
  ['SalesNegotiations', 'negotiations'],
  ['SalesWaitingList', 'waiting-list'],
  ['SalesAssignments', 'assignments'],
  ['SalesPaymentPlans', 'payment-plans'],
  ['SalesProjectSchedules', 'project-schedules'],
  ['SalesProjectScheduleDetail', 'project-schedules'],
  ['SalesUnitSearch', 'unit-search'],
  ['SalesSoldUnits', 'sold-units'],
]);

const TAB_ROUTE_MAP = Object.freeze(Object.fromEntries(TAB_ROUTE_ENTRIES));
const ROUTE_NAME_MAP = Object.freeze(
  TAB_ROUTE_ENTRIES.reduce((acc, [routeName, tabId]) => {
    if (!acc[tabId]) {
      acc[tabId] = routeName;
    }
    return acc;
  }, {})
);

const ALL_TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '<rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>',
    requiredPermission: PERMISSIONS.SALES_DASHBOARD_VIEW,
  },
  {
    id: 'targets',
    label: 'Targets',
    icon: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
    requiredPermission: PERMISSIONS.SALES_TARGETS_VIEW,
  },
  {
    id: 'projects',
    label: 'المشاريع قيد التسويق',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    requiredPermission: PERMISSIONS.SALES_PROJECTS_VIEW,
  },
  {
    id: 'unit-search',
    label: 'بحث الوحدات',
    icon: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    requiredPermission: PERMISSIONS.SALES_PROJECTS_VIEW,
  },
  {
    id: 'reservations',
    label: 'Reservations',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    requiredPermission: PERMISSIONS.SALES_RESERVATIONS_VIEW,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
    requiredPermission: PERMISSIONS.SALES_ATTENDANCE_VIEW,
  },
  {
    id: 'negotiations',
    label: 'Negotiations',
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    requiredPermission: PERMISSIONS.SALES_NEGOTIATION_APPROVE,
  },
  {
    id: 'team',
    label: 'Team',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    requiredPermission: PERMISSIONS.SALES_TEAM_MANAGE,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline>',
    requiredPermission: PERMISSIONS.SALES_TASKS_MANAGE,
  },
  {
    id: 'waiting-list',
    label: 'Waiting List',
    icon: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
    requiredAny: [PERMISSIONS.SALES_WAITING_LIST_CREATE, PERMISSIONS.SALES_WAITING_LIST_CONVERT],
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
    requiredPermission: PERMISSIONS.SALES_PROJECTS_ALLOCATE_SHIFTS,
  },
  {
    id: 'payment-plans',
    label: 'Payment Plans',
    icon: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    requiredPermission: PERMISSIONS.SALES_PAYMENT_PLAN_MANAGE,
  },
  {
    id: 'project-schedules',
    label: 'Project Schedules',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
    requiredPermission: PERMISSIONS.SALES_PROJECT_SCHEDULES_MANAGE,
  },
  {
    id: 'sold-units',
    label: 'Sold Units',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><path d="M9 3H5a2 2 0 0 0-2 2v4m0 0h18M3 9v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"></path>',
    requiredPermission: PERMISSIONS.SALES_SOLD_UNITS_VIEW,
  },
];

export function useSalesRouting() {
  const route = useRoute();
  const router = useRouter();
  const { hasPermission, hasAnyPermission } = usePermissions();

  const getTabFromRoute = () => TAB_ROUTE_MAP[route.name] || 'dashboard';

  const activeTab = ref(getTabFromRoute());

  watch(
    () => route.name,
    () => {
      const newTab = getTabFromRoute();
      if (activeTab.value !== newTab) {
        activeTab.value = newTab;
      }
    }
  );

  const visibleTabs = computed(() =>
    ALL_TABS.filter(tab => {
      if (tab.requiredPermission) return hasPermission(tab.requiredPermission);
      if (tab.requiredAny) return hasAnyPermission(tab.requiredAny);
      return true;
    })
  );

  const switchTab = tabId => {
    const targetRoute = ROUTE_NAME_MAP[tabId];
    if (targetRoute) router.push({ name: targetRoute });
  };

  return {
    activeTab,
    allTabs: ALL_TABS,
    visibleTabs,
    switchTab,
    getTabFromRoute,
  };
}
