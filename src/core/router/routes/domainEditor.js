/**
 * Editor domain routes (nested under EditorLayout).
 * @module core/router/routes/domainEditor
 */

import { ROLE_ADMIN, ROLE_EDITOR } from '@/constants/roles';

export default {
  path: 'editor',
  component: () => import('@/layouts/EditorLayout.vue'),
  meta: { roles: [ROLE_ADMIN, ROLE_EDITOR] },
  children: [
    { path: '', name: 'Editor', redirect: { name: 'EditorDashboard' } },
    { path: 'dashboard', name: 'EditorDashboard', component: () => import('@/modules/editor/views/EditorDashboardView.vue') },
    { path: 'projects', name: 'EditorProjects', component: () => import('@/modules/editor/views/EditorProjectsView.vue') },
    { path: 'projects/not-montaged', name: 'EditorProjectsNotMontaged', redirect: { name: 'EditorProjects', query: { tab: 'before' } } },
    { path: 'projects/after-montage', name: 'EditorProjectsAfterMontage', redirect: { name: 'EditorProjects', query: { tab: 'after' } } },
    { path: 'teams', name: 'EditorTeams', component: () => import('@/modules/editor/views/EditorTeamsView.vue') },
    { path: 'ratings', name: 'EditorRatings', component: () => import('@/modules/editor/views/EditorRatingsView.vue') },
    { path: 'contracts', name: 'EditorContracts', component: () => import('@/modules/editor/views/EditorView.vue') },
    { path: 'contracts/:id', name: 'EditorContractDetail', component: () => import('@/modules/editor/views/EditorDetailView.vue') },
  ],
};
