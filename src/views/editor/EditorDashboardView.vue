<template>
  <div class="editor-dashboard">
    <div class="page-header">
      <h1 class="page-title">لوحة تحكم قسم المونتاج</h1>
      <p class="page-subtitle">عرض المشاريع حسب الحالة (بدون API حتى يتم توفيره)</p>
    </div>

    <div class="tabs-row">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ getCount(tab.key) }}</span>
      </button>
    </div>

    <div class="content-panel">
      <section v-if="activeTab === 'available'" class="section">
        <h2 class="section-title">متاح للعمل</h2>
        <div class="cards-grid">
          <div v-for="p in dashboardAvailable" :key="p.id" class="card">
            <h3 class="card-title">{{ p.name }}</h3>
            <p class="card-meta">المطور: {{ p.developer }}</p>
            <p class="card-meta">الوحدات: {{ p.unitsCount }}</p>
          </div>
        </div>
      </section>
      <section v-else-if="activeTab === 'ready'" class="section">
        <h2 class="section-title">جاهز للتسليم</h2>
        <div class="cards-grid">
          <div v-for="p in dashboardReady" :key="p.id" class="card">
            <h3 class="card-title">{{ p.name }}</h3>
            <p class="card-meta">المطور: {{ p.developer }}</p>
            <p class="card-meta">الوحدات: {{ p.unitsCount }}</p>
          </div>
        </div>
      </section>
      <section v-else class="section">
        <h2 class="section-title">غير جاهز</h2>
        <div class="cards-grid">
          <div v-for="p in dashboardNotReady" :key="p.id" class="card">
            <h3 class="card-title">{{ p.name }}</h3>
            <p class="card-meta">المطور: {{ p.developer }}</p>
            <p class="card-meta">الوحدات: {{ p.unitsCount }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEditorMockData } from '@/composables/editor/useEditorMockData';

const { dashboardAvailable, dashboardReady, dashboardNotReady } = useEditorMockData();

const activeTab = ref('available');
const tabs = [
  { key: 'available', label: 'متاح' },
  { key: 'ready', label: 'جاهز' },
  { key: 'notReady', label: 'غير جاهز' },
];

function getCount(key) {
  if (key === 'available') return dashboardAvailable.value.length;
  if (key === 'ready') return dashboardReady.value.length;
  return dashboardNotReady.value.length;
}
</script>

<style scoped>
.editor-dashboard {
  padding: 1.5rem;
  direction: rtl;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: 1.5rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}
.page-subtitle {
  color: var(--muted, #64748b);
  margin: 0;
  font-size: 0.9rem;
}
.tabs-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tab-btn.active {
  background: #27374d;
  color: #fff;
  border-color: #27374d;
}
.tab-count {
  background: rgba(0,0,0,0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.tab-btn.active .tab-count {
  background: rgba(255,255,255,0.25);
}
.content-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
}
.section-title {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem;
  background: #f8fafc;
}
.card-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}
.card-meta {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #64748b;
}
</style>
