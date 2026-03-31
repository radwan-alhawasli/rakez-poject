/**
 * Manager domain routes — التقييم (employees, reviews, tasks).
 * Accessible when user.is_manager === true.
 * @module core/router/routes/domainManager
 */

export default {
  path: 'manager',
  component: () => import('@/modules/manager/views/ManagerLayout.vue'),
  meta: { requiresManager: true },
  children: [
    { path: '', name: 'Manager', redirect: { name: 'ManagerEmployees' } },
    { path: 'employees', name: 'ManagerEmployees', component: () => import('@/modules/manager/views/ManagerEmployeesView.vue'), meta: { requiresManager: true } },
    { path: 'employees/:id', name: 'ManagerEmployeeDetail', component: () => import('@/modules/manager/views/ManagerEmployeeDetailView.vue'), meta: { requiresManager: true } },
    { path: 'tasks', name: 'ManagerTasks', component: () => import('@/modules/manager/views/ManagerTasksView.vue'), meta: { requiresManager: true } },
  ],
};
