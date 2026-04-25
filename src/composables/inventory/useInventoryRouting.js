import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const TAB_ROUTE_ENTRIES = Object.freeze([
  ['InventoryDashboard', 'dashboard'],
  ['InventoryProjects', 'projects'],
  ['InventoryContracts', 'contracts'],
  ['InventoryAISuggestions', 'ai-suggestions'],
]);

const TAB_ROUTE_MAP = Object.freeze(Object.fromEntries(TAB_ROUTE_ENTRIES));
const ROUTE_NAME_MAP = Object.freeze(
  TAB_ROUTE_ENTRIES.reduce((acc, [routeName, tabId]) => {
    if (!(/** @type {any} */ (acc))[tabId]) (/** @type {any} */ (acc))[tabId] = routeName;
    return acc;
  }, {})
);

export function useInventoryRouting() {
  const route = useRoute();
  const router = useRouter();

  const getTabFromRoute = () => {
    const name = String(route.name || '');
    return (/** @type {any} */ (TAB_ROUTE_MAP))[name] || 'dashboard';
  };

  const activeTab = ref(getTabFromRoute());

  watch(
    () => route.name,
    () => {
      const newTab = getTabFromRoute();
      if (activeTab.value !== newTab) activeTab.value = newTab;
    }
  );

  /** @param {any} tabId */
  const switchTab = tabId => {
    const targetRoute = (/** @type {any} */ (ROUTE_NAME_MAP))[tabId];
    if (targetRoute) router.push({ name: targetRoute });
  };

  return {
    activeTab,
    switchTab,
    getTabFromRoute,
  };
}
