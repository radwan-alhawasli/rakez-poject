<template>
  <div>
    <LoadingSpinner v-if="isLoading" text="جاري تحميل البيانات..." />

    <div v-else-if="dashboardData" class="dashboard-kpis">
      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense">
        <LuxuryStatCard
          label="عدد الوحدات المحجوزة"
          :value="formatCompact(dashboardData.reserved_units ?? 0)"
          description="وحدات محجوزة حالياً"
        >
          <template #icon>
            <DashboardStatIcon name="building" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="عدد الوحدات المتاحة"
          :value="formatCompact(dashboardData.available_units ?? 0)"
          description="وحدات متاحة للبيع"
        >
          <template #icon>
            <DashboardStatIcon name="lock" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="المشاريع قيد التسويق"
          :value="formatCompact(dashboardData.projects_under_marketing ?? 0)"
          description="مشاريع تحت التسويق"
        >
          <template #icon>
            <DashboardStatIcon name="chartBars" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="حجوزات مؤكدة"
          :value="formatCompact(confirmedCount)"
          description="حجوزات مؤكدة حتى الآن"
        >
          <template #icon>
            <DashboardStatIcon name="successCircle" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="حجوزات تحت التفاوض"
          :value="formatCompact(negotiationCount)"
          description="قيد المتابعة والتفاوض"
        >
          <template #icon>
            <DashboardStatIcon name="leads" />
          </template>
        </LuxuryStatCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';
import { useFormatters } from '@/composables/useFormatters';

const props = defineProps({
  dashboardData: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
});

const { formatCompact } = useFormatters();

const confirmedCount = computed(() => {
  const d = props.dashboardData;
  if (!d) return 0;
  return Number(d.confirmed_count ?? d.confirmed_reservations ?? 0) || 0;
});

const negotiationCount = computed(() => {
  const d = props.dashboardData;
  if (!d) return 0;
  return Number(d.negotiation_count ?? d.negotiation_reservations ?? 0) || 0;
});
</script>

<style scoped>
.dashboard-kpis {
  margin-top: 8px;
}
</style>
