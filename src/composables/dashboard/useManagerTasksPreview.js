import { ref } from 'vue';
import managerService from '@/services/managerService';
import authService from '@/services/authService';
import { mapManagerTasks } from '@/utils/dashboardData';

export function useManagerTasksPreview() {
  /** @type {import('vue').Ref<any[]>} */
  const items = ref([]);

  const load = async () => {
    const u = authService.getCurrentUser();
    const isMgr =
      u && (u.is_manager === true || String(u.is_manager) === '1');
    if (!isMgr) {
      items.value = [];
      return;
    }
    const r = await managerService.getTasks({
      per_page: 6,
      sort_by: 'due_at',
      sort_order: 'asc',
    });
    items.value = mapManagerTasks(r.items ?? []);
  };

  return { items, load };
}
