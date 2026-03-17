<template>
  <div class="inventory-ai-suggestions-tab">
    <div class="welcome-header">
      <h1 class="welcome-title">اقتراحات الذكاء الاصطناعي</h1>
      <p class="welcome-subtitle">تحليل توزيع المشاريع وأنواع الوحدات لدعم قرارات مدير التسويق.</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحليل البيانات...</p>
    </div>

    <div v-else-if="suggestions.length === 0" class="empty-state">
      <p>لا توجد بيانات كافية لتحليل التوزيع.</p>
    </div>

    <div v-else class="suggestions-list">
      <div
        v-for="(s, idx) in suggestions"
        :key="idx"
        class="suggestion-card"
      >
        <div class="suggestion-header">
          <span class="area-badge">{{ s.area }}</span>
          <span class="percentage">{{ s.percentage }}%</span>
        </div>
        <p class="suggestion-body">{{ s.message }}</p>
        <p class="suggestion-recommendation">{{ s.recommendation }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import inventoryService from '@/services/inventoryService';

const isLoading = ref(true);
const contracts = ref([]);
const locations = ref([]);

const suggestions = computed(() => {
  const items = contracts.value.length ? contracts.value : locations.value;
  if (!items.length) return [];

  const byArea = {};
  items.forEach(item => {
    const area = item.district || item.city || item.location || 'غير محدد';
    if (!byArea[area]) byArea[area] = { total: 0, unitTypes: {} };
    byArea[area].total += 1;

    const types = item.unit_type
      ? [item.unit_type]
      : (item.unit_types || []).length
        ? (Array.isArray(item.unit_types) ? item.unit_types : [item.unit_types])
        : ['غير محدد'];
    types.forEach(t => {
      const t2 = t || 'غير محدد';
      byArea[area].unitTypes[t2] = (byArea[area].unitTypes[t2] || 0) + 1;
    });
  });

  const result = [];
  Object.entries(byArea).forEach(([area, data]) => {
    const entries = Object.entries(data.unitTypes).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return;
    const [dominantType, dominantCount] = entries[0];
    const pct = Math.round((dominantCount / data.total) * 100);
    if (pct >= 70) {
      result.push({
        area,
        percentage: pct,
        dominantType,
        message: `${pct}% من المشاريع في ${area} من نوع "${dominantType}".`,
        recommendation: 'يوصى بدراسة تنويع نوع الوحدات في هذه المنطقة لاستغلال فرص السوق.',
      });
    }
  });
  return result;
});

onMounted(async () => {
  isLoading.value = true;
  try {
    const [indexRes, locRes] = await Promise.all([
      inventoryService.getContractsAdminIndex({ per_page: 500 }),
      inventoryService.getContractsLocations({ per_page: 500 }),
    ]);
    contracts.value = indexRes?.items ?? [];
    locations.value = Array.isArray(locRes) ? locRes : (locRes?.data ?? []);
  } catch (e) {
    contracts.value = [];
    locations.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.inventory-ai-suggestions-tab {
  direction: rtl;
}

.welcome-header {
  margin-bottom: 24px;
  text-align: right;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  margin: 0;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.suggestion-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(177, 162, 143, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.area-badge {
  background: var(--color-gold);
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
}

.percentage {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-charcoal);
}

.suggestion-body {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: var(--color-charcoal);
  line-height: 1.6;
}

.suggestion-recommendation {
  margin: 0;
  font-size: 14px;
  color: var(--color-dark-gray);
  font-style: italic;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
