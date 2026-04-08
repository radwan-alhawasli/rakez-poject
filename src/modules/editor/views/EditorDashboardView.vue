<template>
  <div class="editor-dashboard-view dashboard-view rakez-erp-dashboard rakez-kpi-dashboard">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <div class="kpi-dashboard-grid">
      <DashboardWelcomeHeader
        greeting-name="قسم المونتاج"
        subtitle="عدد المشاريع قبل المونتاج وبعده (نفس تصنيف صفحة المشاريع)."
      />

      <div class="kpi-top-row">
        <LuxuryStatCard
          clickable
          label="مشاريع بعد المونتاج"
          :value="formatCompact(readyCount)"
          description="تصوير ومونتاج مكتملان — اضغط للقائمة"
          @click="goProjectsTab('after')"
        >
          <template #icon>
            <DashboardStatIcon name="successCircle" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          clickable
          label="مشاريع قبل المونتاج"
          :value="formatCompact(notReadyCount)"
          description="بانتظار إكمال التصوير أو المونتاج — اضغط للقائمة"
          @click="goProjectsTab('before')"
        >
          <template #icon>
            <DashboardStatIcon name="warningCircle" />
          </template>
        </LuxuryStatCard>
      </div>

      <div class="kpi-main-grid">
        <DarkWidgetShell class="kpi-span-4" title="بعد المونتاج مقابل قبله" subtitle="من قائمة محرر العقود">
          <DonutKpiWidget :segments="editorDonutSegments" :height="200" central-sub-label="مشاريع" />
        </DarkWidgetShell>
        <DarkWidgetShell class="kpi-span-8" title="مقارنة سريعة" subtitle="مخطط أعمدة">
          <DashboardMetricsBarChart :series="editorChartSeries" :height="240" />
        </DarkWidgetShell>
      </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import { useEditorDashboard } from '@/modules/editor/composables/useEditorDashboard';
import { useFormatters } from '@/composables/useFormatters';
import { editorProjectSegments } from '@/utils/dashboardData';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const router = useRouter();
const { formatCompact } = useFormatters();

const { isLoading, notReadyCount, readyCount, fetchContracts } = useEditorDashboard();

const editorChartSeries = computed(() => [
  { label: 'بعد المونتاج', value: Number(readyCount.value) || 0 },
  { label: 'قبل المونتاج', value: Number(notReadyCount.value) || 0 },
]);

const editorDonutSegments = computed(() =>
  editorProjectSegments(readyCount.value, notReadyCount.value)
);

/** @param {'before' | 'after'} tab */
function goProjectsTab(tab) {
  router.push({ name: 'EditorProjects', query: { tab } });
}

onMounted(() => fetchContracts());
</script>

<style scoped>
.editor-dashboard-view {
  direction: rtl;
  min-height: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 12px;
}
</style>
