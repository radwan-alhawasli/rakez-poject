<template>
  <div class="project-management-view project-management-design editor-dashboard-view">
    <div class="welcome-header project-mgmt-header">
      <div class="header-content">
        <h1 class="welcome-title">لوحة تحكم قسم المونتاج</h1>
        <p class="welcome-subtitle">عرض المشاريع حسب الحالة (غير جاهزة / جاهزة للتسويق / الأرشيف).</p>
      </div>
      <div class="controls-area">
        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="ابحث عن مشروع بالاسم..."
          />
        </div>
      </div>
    </div>

    <div class="view-content">
      <div class="tabs-container">
        <button
          :class="['tab-btn', { active: activeTab === 'not_ready' }]"
          @click="activeTab = 'not_ready'"
        >
          مشاريع غير جاهزة ({{ notReadyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'ready' }]"
          @click="activeTab = 'ready'"
        >
          مشاريع جاهزة للتسويق ({{ readyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'archive' }]"
          @click="activeTab = 'archive'"
        >
          الأرشيف ({{ archiveCount }})
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>جاري تحميل المشاريع...</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <p>لا توجد مشاريع مطابقة للعرض.</p>
      </div>

      <div v-else class="projects-grid">
        <router-link
          v-for="item in filteredProjects"
          :key="item.id"
          :to="{ name: 'EditorProjects', query: { tab: activeTab === 'not_ready' ? 'before' : activeTab === 'ready' ? 'after' : 'archive' } }"
          class="editor-dashboard-card"
        >
          <h3 class="card-title">{{ item.name || item.project_name || item.title || item.project_title || item.contract_number || item.contract_id || '—' }}</h3>
          <p class="card-meta">عرض التفاصيل</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEditorDashboard } from '@/composables/editor/useEditorDashboard';

const {
  searchQuery,
  isLoading,
  activeTab,
  notReadyCount,
  readyCount,
  archiveCount,
  filteredProjects,
  fetchContracts,
} = useEditorDashboard();

onMounted(() => fetchContracts());
</script>

<style scoped>
.editor-dashboard-view {
  direction: rtl;
  padding: 20px 30px;
  min-height: 100vh;
  background: #f8fafc;
}
.editor-dashboard-view .project-mgmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.editor-dashboard-view .view-content {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.editor-dashboard-view .tabs-container {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 30px;
  gap: 4px;
}
.editor-dashboard-view .tab-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 12px 20px;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
  border-radius: 10px 10px 0 0;
}
.editor-dashboard-view .tab-btn.active {
  background: white;
  color: #1e3a5f;
  font-weight: 700;
  border-color: #e2e8f0;
  border-bottom: 1px solid white;
  margin-bottom: -1px;
}
.editor-dashboard-view .projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.editor-dashboard-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  background: #f8fafc;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.editor-dashboard-card:hover {
  border-color: #b1a28f;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.editor-dashboard-card .card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}
.editor-dashboard-card .card-meta {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 40px;
  color: #64748b;
  font-size: 15px;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.search-container {
  position: relative;
  width: 300px;
  max-width: 100%;
}
.search-container .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
}
.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  color: #1e293b;
  outline: none;
}
.search-input:focus {
  border-color: #b1a28f;
}
</style>
