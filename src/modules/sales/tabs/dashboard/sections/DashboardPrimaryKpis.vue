<template>
  <div>
    <LoadingSpinner v-if="isLoading" text="جاري تحميل البيانات..." />

    <div v-else-if="dashboardData" class="dashboard-kpis">
      <div class="kpi-section">
        <h3 class="kpi-section-title">المؤشرات الرئيسية</h3>
        <div class="stats-grid stats-grid-primary">
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد الوحدات المحجوزة</span>
                <span class="stat-value number" :title="formatNumber(dashboardData.reserved_units ?? 0)">{{
                  formatCompact(dashboardData.reserved_units ?? 0)
                }}</span>
              </div>
              <div class="stat-icon-bg reserved">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد الوحدات المتاحة</span>
                <span class="stat-value number" :title="formatNumber(dashboardData.available_units ?? 0)">{{
                  formatCompact(dashboardData.available_units ?? 0)
                }}</span>
              </div>
              <div class="stat-icon-bg available">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">عدد المشاريع قيد التسويق</span>
                <span
                  class="stat-value number"
                  :title="formatNumber(dashboardData.projects_under_marketing ?? 0)"
                  >{{ formatCompact(dashboardData.projects_under_marketing ?? 0) }}</span
                >
              </div>
              <div class="stat-icon-bg marketing">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">حجوزات مؤكدة</span>
                <span class="stat-value number">{{ confirmedBookingsCount }}</span>
                <span class="stat-sublabel">حجوزات مؤكدة حتى الآن</span>
              </div>
              <div class="stat-icon-bg confirmed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </CardContent>
          </Card>
          <Card class="kpi-card stat-card">
            <CardContent class="stat-card-inner">
              <div class="stat-content">
                <span class="stat-label">حجوزات تحت التفاوض</span>
                <span class="stat-value number">{{ underNegotiationCount }}</span>
                <span class="stat-sublabel">قيد المتابعة والتفاوض</span>
              </div>
              <div class="stat-icon-bg negotiation">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { Card, CardContent } from '@/components/ui/card';
import { useFormatters } from '@/composables/useFormatters';

defineProps({
  dashboardData: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  confirmedBookingsCount: { type: Number, default: 0 },
  underNegotiationCount: { type: Number, default: 0 },
});

const { formatCompact, formatNumber } = useFormatters();
</script>

<style scoped>
.dashboard-kpis {
  margin-top: 8px;
}

.kpi-section {
  margin-bottom: 2rem;
}

.kpi-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.2);
}

.stats-grid,
.stats-grid-primary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(10px, 2vw, 20px);
  margin-top: 16px;
  margin-bottom: 20px;
  overflow: visible;
}

.stats-grid-primary {
  margin-bottom: 8px;
}

.stat-sublabel {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary, #64748b);
  margin-top: 2px;
}

:deep(.stat-card) {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-off-white) 100%);
  border-radius: 14px;
  padding: 0;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(30, 58, 95, 0.06);
  position: relative;
  overflow: visible;
  min-height: 0;
}

:deep(.stat-card:hover) {
  border-color: rgba(177, 162, 143, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 58, 95, 0.1);
}

:deep(.stat-card-inner) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px !important;
  min-height: 0;
  min-width: 0;
}

:deep(.stat-icon-bg) {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

:deep(.stat-card:hover .stat-icon-bg) {
  transform: scale(1.05);
}

:deep(.stat-icon-bg svg) {
  width: 22px;
  height: 22px;
  position: relative;
  z-index: 1;
  color: #b5a99a;
  filter:
    drop-shadow(0 0 8px rgba(181, 169, 154, 0.6)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

:deep(.stat-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 2px;
  min-width: 0;
}

:deep(.stat-label) {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-dark-gray);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.stat-value) {
  font-size: clamp(1.55rem, 3.2vw, 2.05rem);
  font-weight: 800;
  color: var(--color-charcoal);
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
  direction: ltr;
  unicode-bidi: embed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.stat-card:hover .stat-value) {
  color: var(--color-gold);
}

.stat-value-currency-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.stat-value-currency-block .stat-value-main {
  font-size: clamp(1.55rem, 3.2vw, 2.05rem);
  font-weight: 800;
  color: var(--color-charcoal);
  line-height: 1.2;
  letter-spacing: -0.02em;
  direction: ltr;
  unicode-bidi: embed;
}
.stat-value-currency-block .stat-value-currency-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
:deep(.stat-card:hover .stat-value-currency-block .stat-value-main) {
  color: var(--color-gold);
}

@media (max-width: 1200px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }
}
@media (max-width: 768px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  :deep(.stat-card-inner) {
    padding: 12px 14px !important;
  }
  :deep(.stat-icon-bg) {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 10px;
  }
  :deep(.stat-icon-bg svg) {
    width: 20px;
    height: 20px;
  }
  :deep(.stat-label) {
    font-size: 0.75rem;
  }
  :deep(.stat-value) {
    font-size: 1.4rem;
  }
  .stat-value-currency-block .stat-value-main {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .stats-grid,
  .stats-grid-primary {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  :deep(.stat-card-inner) {
    padding: 10px 12px !important;
  }
  :deep(.stat-icon-bg) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }
  :deep(.stat-icon-bg svg) {
    width: 18px;
    height: 18px;
  }
  :deep(.stat-value) {
    font-size: 1.25rem;
  }
  .stat-value-currency-block .stat-value-main {
    font-size: 1.25rem;
  }
}
</style>
