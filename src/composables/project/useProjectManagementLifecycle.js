import { watch, onMounted } from 'vue';

/**
 * Debounced search refetch + initial load for project management list (non-editor).
 * @param {{ searchQuery: import('vue').Ref<string>, isEditor: import('vue').ComputedRef<boolean>, currentPage: import('vue').Ref<number>, fetchProjects: () => Promise<void> }} opts
 */
export function useProjectManagementLifecycle({ searchQuery, isEditor, currentPage, fetchProjects }) {
  /** @type {any} */
  let searchDebounce = null;
  watch(searchQuery, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      if (!isEditor.value) {
        if ((searchQuery.value || '').trim()) currentPage.value = 1;
        fetchProjects();
      }
      searchDebounce = null;
    }, 350);
  });

  onMounted(fetchProjects);
}
