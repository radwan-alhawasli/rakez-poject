/**
 * Manager domain routes — التقييم (employees, reviews, tasks).
 * Accessible when user.is_manager === true.
 * @module core/router/routes/domainManager
 */

export default {
  path: 'manager',
  component: () => import('@/views/manager/ManagerLayout.vue'),
  meta: { requiresManager: true },
  children: [
    { path: '', name: 'Manager', redirect: { name: 'ManagerEmployees' } },
    { path: 'employees', name: 'ManagerEmployees', component: () => import('@/views/manager/ManagerEmployeesView.vue'), meta: { requiresManager: true } },
    { path: 'employees/:id', name: 'ManagerEmployeeDetail', component: () => import('@/views/manager/ManagerEmployeeDetailView.vue'), meta: { requiresManager: true } },
    { path: 'tasks', name: 'ManagerTasks', component: () => import('@/views/manager/ManagerTasksView.vue'), meta: { requiresManager: true } },
  ],
};
