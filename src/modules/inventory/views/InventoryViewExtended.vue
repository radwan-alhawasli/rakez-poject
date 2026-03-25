<template>
  <div class="inventory-view-extended">
    <div class="inventory-tabs-header">
      <nav class="inventory-tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>
    <div class="tab-content">
      <InventoryDashboardTab v-if="activeTab === 'dashboard'" />
      <InventoryProjectsTab v-else-if="activeTab === 'projects'" />
      <InventoryContractsTab v-else-if="activeTab === 'contracts'" />
      <InventoryAISuggestionsTab v-else-if="activeTab === 'ai-suggestions'" />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { useInventoryRouting } from '@/composables/inventory/useInventoryRouting';

const InventoryDashboardTab = defineAsyncComponent(() =>
  import('@/modules/inventory/tabs/dashboard/InventoryDashboardTab.vue')
);
const InventoryProjectsTab = defineAsyncComponent(() =>
  import('@/modules/inventory/tabs/projects/InventoryProjectsTab.vue')
);
const InventoryContractsTab = defineAsyncComponent(() =>
  import('@/modules/inventory/tabs/contracts/InventoryContractsTab.vue')
);
const InventoryAISuggestionsTab = defineAsyncComponent(() =>
  import('@/modules/inventory/tabs/ai-suggestions/InventoryAISuggestionsTab.vue')
);

const TABS = [
  { id: 'dashboard', label: 'لوحة التحكم' },
  { id: 'projects', label: 'المشاريع' },
  { id: 'contracts', label: 'العقود' },
  { id: 'ai-suggestions', label: 'اقتراحات الذكاء الاصطناعي' },
];

export default {
  name: 'InventoryViewExtended',
  components: {
    InventoryDashboardTab,
    InventoryProjectsTab,
    InventoryContractsTab,
    InventoryAISuggestionsTab,
  },
  setup() {
    const { activeTab, switchTab } = useInventoryRouting();
    return {
      activeTab,
      switchTab,
      tabs: TABS,
    };
  },
};
</script>

<style scoped>
.inventory-view-extended {
  direction: rtl;
  min-height: 100vh;
  background: transparent;
  padding: 20px 30px;
}

.inventory-tabs-header {
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
}

.inventory-tabs-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: var(--color-dark-gray);
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(177, 162, 143, 0.1);
  color: var(--color-charcoal);
}

.tab-btn.active {
  background: var(--color-gold);
  color: var(--color-white);
}

.tab-content {
  min-height: 400px;
}

@media (max-width: 768px) {
  .inventory-view-extended {
    padding: 12px 16px;
  }
}
</style>
