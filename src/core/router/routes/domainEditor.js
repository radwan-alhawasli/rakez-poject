/**
 * Editor domain routes (nested under EditorLayout).
 * @module core/router/routes/domainEditor
 */

import { ROLE_EDITOR } from '@/constants/roles';

export default {
  path: 'editor',
  component: () => import('@/layouts/EditorLayout.vue'),
  meta: { roles: [ROLE_EDITOR] },
  children: [
    { path: '', name: 'Editor', redirect: { name: 'EditorDashboard' } },
    { path: 'dashboard', name: 'EditorDashboard', component: () => import('@/views/editor/EditorDashboardView.vue') },
    { path: 'projects', name: 'EditorProjects', component: () => import('@/views/editor/EditorProjectsView.vue') },
    { path: 'projects/not-montaged', name: 'EditorProjectsNotMontaged', redirect: { name: 'EditorProjects', query: { tab: 'before' } } },
    { path: 'projects/after-montage', name: 'EditorProjectsAfterMontage', redirect: { name: 'EditorProjects', query: { tab: 'after' } } },
    { path: 'teams', name: 'EditorTeams', component: () => import('@/views/editor/EditorTeamsView.vue') },
    { path: 'ratings', name: 'EditorRatings', component: () => import('@/views/editor/EditorRatingsView.vue') },
    { path: 'contracts', name: 'EditorContracts', component: () => import('@/views/EditorView.vue') },
    { path: 'contracts/:id', name: 'EditorContractDetail', component: () => import('@/views/EditorDetailView.vue') },
  ],
};
