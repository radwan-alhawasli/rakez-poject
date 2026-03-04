<template>
  <div class="hr-dashboard-grid-view">
    <!-- Premium Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
      <p class="welcome-subtitle">المؤشرات الرئيسية لإدارة الائتمان والتمويل.</p>
    </div>

    <div class="stats-grid">
      <!-- KPI 1: الحجوزات المؤكدة -->
      <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
        <div class="stat-content">
          <span class="stat-label">الحجوزات المؤكدة</span>
          <span class="stat-value number">{{ dashboardMetrics.confirmedBookings || '0' }}</span>
          <span class="stat-desc">إجمالي الحجوزات المؤكدة</span>
        </div>
        <div class="stat-icon-bg units">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
      </div>

      <!-- KPI 2: المفاوضات المعلقة -->
      <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
        <div class="stat-content">
          <span class="stat-label">المفاوضات المعلقة</span>
          <span class="stat-value number">{{
            dashboardMetrics.pendingNegotiations || '0'
          }}</span>
          <span class="stat-desc">عدد الحجوزات قيد التفاوض</span>
        </div>
        <div class="stat-icon-bg projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      </div>

      <!-- KPI 3: الحجوزات المنتظرة -->
      <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
        <div class="stat-content">
          <span class="stat-label">الحجوزات المنتظرة</span>
          <span class="stat-value number">{{ dashboardMetrics.waitingBookings || '0' }}</span>
          <span class="stat-desc">عدد الحجوزات المنتظرة للمعالجة</span>
        </div>
        <div class="stat-icon-bg ready">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>

      <!-- KPI 4: طلبات التمويل النشطة -->
      <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
        <div class="stat-content">
          <span class="stat-label">طلبات التمويل النشطة</span>
          <span class="stat-value number">{{ dashboardMetrics.activeFinancing || '0' }}</span>
          <span class="stat-desc">عدد طلبات التمويل قيد المعالجة</span>
        </div>
        <div class="stat-icon-bg dollar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
      </div>

      <!-- KPI 5: نقل الملكية قيد التنفيذ -->
      <div class="stat-card animate-fade-in-up animate-stagger-5 hover-lift">
        <div class="stat-content">
          <span class="stat-label">نقل الملكية قيد التنفيذ</span>
          <span class="stat-value number">{{ dashboardMetrics.titleTransfers || '0' }}</span>
          <span class="stat-desc">عدد طلبات نقل الملكية قيد المعالجة</span>
        </div>
        <div class="stat-icon-bg units">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
      </div>

      <!-- KPI 6: ملفات المطالبة المعلقة -->
      <div class="stat-card animate-fade-in-up animate-stagger-6 hover-lift">
        <div class="stat-content">
          <span class="stat-label">ملفات المطالبة المعلقة</span>
          <span class="stat-value number">{{ dashboardMetrics.pendingClaims || '0' }}</span>
          <span class="stat-desc">عدد ملفات المطالبة المعلقة</span>
        </div>
        <div class="stat-icon-bg projects">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="overview-section">
      <div class="section-header">
        <h3 class="section-title-chart">نظرة عامة على عمليات الائتمان</h3>
        <p class="section-desc">توزيع الحجوزات والتمويل حسب حالتها الحالية.</p>
      </div>
      <div class="chart-placeholder">
        <p style="color: var(--color-dark-gray)">مخطط بياني لتوزيع عمليات الائتمان</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCreditDashboard } from '@/composables/credit/useCreditDashboard';

const { userName, dashboardMetrics, loadDashboardMetrics } = useCreditDashboard();

onMounted(() => {
  loadDashboardMetrics();
});
</script>
