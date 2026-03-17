<template>
  <div class="editor-dashboard-view dashboard-view">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <div class="welcome-header">
        <h1 class="welcome-title">لوحة تحكم قسم المونتاج</h1>
        <p class="welcome-subtitle">عرض المشاريع حسب الحالة (غير جاهزة / جاهزة للتسويق).</p>
      </div>

      <div class="stats-grid">
        <div
          class="stat-card clickable animate-fade-in-up animate-stagger-1 hover-lift hover-shine"
          @click="$router.push({ name: 'EditorProjects', query: { tab: 'after' } })"
        >
          <div class="stat-content">
            <span class="stat-label">مشاريع التسويق (إجمالي المشاريع)</span>
            <span class="stat-value number" :title="String(readyCount)">{{ formatCompact(readyCount) }}</span>
            <span class="stat-desc">مشروع جاهز للتسويق - اضغط للعرض</span>
          </div>
          <div class="stat-icon-bg projects">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
          <div class="stat-content">
            <span class="stat-label">المشاريع الجاهزة</span>
            <span class="stat-value number" :title="String(readyCount)">{{ formatCompact(readyCount) }}</span>
            <span class="stat-desc">مشاريع مكتملة تحتوي على وحدات</span>
          </div>
          <div class="stat-icon-bg ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
          <div class="stat-content">
            <span class="stat-label">المشاريع غير الجاهزة</span>
            <span class="stat-value number" :title="String(notReadyCount)">{{ formatCompact(notReadyCount) }}</span>
            <span class="stat-desc">لم يكتمل المتتبع (Tracker)</span>
          </div>
          <div class="stat-icon-bg not-ready">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>
      </div>

      <div class="overview-section">
        <div class="section-header">
          <h3 class="section-title">نظرة عامة على المشاريع</h3>
          <p class="section-desc">توزيع المشاريع حسب حالتها الحالية.</p>
        </div>
        <div class="chart-placeholder">
          <p class="placeholder-text">مخطط بياني لتوزيع المشاريع</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEditorDashboard } from '@/composables/editor/useEditorDashboard';
import { useFormatters } from '@/composables/useFormatters';

const { formatCompact } = useFormatters();

const {
  isLoading,
  notReadyCount,
  readyCount,
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

/* Reuse dashboard stat cards and overview from DashboardView - ensure variables exist */
.editor-dashboard-view :deep(.welcome-header) {
  margin-bottom: 40px;
  text-align: right;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
}

.editor-dashboard-view :deep(.welcome-title) {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 0.25rem 0;
}

.editor-dashboard-view :deep(.welcome-subtitle) {
  color: var(--color-dark-gray, #64748b);
  margin: 0;
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: linear-gradient(135deg, var(--color-white, #fff) 0%, var(--color-off-white, #f8fafc) 100%);
  border-radius: 24px;
  padding: 32px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: default;
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25), 0 8px 20px rgba(30, 58, 95, 0.12);
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-dark-gray, #64748b);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: var(--color-charcoal, #1e293b);
  line-height: 1;
  margin: 8px 0;
  letter-spacing: -0.03em;
}

.stat-desc {
  font-size: 12px;
  color: var(--color-dark-gray, #64748b);
  font-weight: 500;
  opacity: 0.85;
}

.stat-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--color-navy, #1e3a5f);
  color: #fff;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.stat-icon-bg svg {
  width: 32px;
  height: 32px;
}

.overview-section {
  background: linear-gradient(135deg, var(--color-white, #fff) 0%, var(--color-off-white, #f8fafc) 100%);
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  min-height: 450px;
  box-shadow: 0 12px 40px -10px rgba(30, 58, 95, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 35px;
  text-align: right;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-navy, #1e3a5f);
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.section-desc {
  color: var(--color-dark-gray, #64748b);
  font-size: 15px;
  margin: 0;
  font-weight: 500;
}

.chart-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-light-gray, #f1f5f9) 0%, var(--color-white, #fff) 100%);
  border-radius: 20px;
  border: 2px dashed rgba(177, 162, 143, 0.25);
  margin-top: 25px;
}

.placeholder-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-dark-gray, #64748b);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border-radius: 50%;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
