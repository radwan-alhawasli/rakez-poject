<template>
  <div class="editor-dashboard-view dashboard-view rakez-erp-dashboard">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <template v-else>
      <DashboardWelcomeHeader greeting-name="قسم المونتاج" subtitle="عرض المشاريع حسب الحالة (غير جاهزة / جاهزة للتسويق)." />

      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense">
        <LuxuryStatCard
          clickable
          label="مشاريع التسويق (إجمالي)"
          :value="formatCompact(readyCount)"
          description="اضغط لعرض المشاريع"
          @click="goAfterMontage"
        >
          <template #icon>
            <DashboardStatIcon name="clipboard" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard label="المشاريع الجاهزة" :value="formatCompact(readyCount)" description="مشاريع مكتملة تحتوي على وحدات">
          <template #icon>
            <DashboardStatIcon name="successCircle" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard label="المشاريع غير الجاهزة" :value="formatCompact(notReadyCount)" description="لم يكتمل المتتبع (Tracker)">
          <template #icon>
            <DashboardStatIcon name="warningCircle" />
          </template>
        </LuxuryStatCard>
      </div>

      <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
      <div class="rakez-widget-grid">
        <DarkWidgetShell title="جاهزة مقابل غير جاهزة" subtitle="من بيانات العقود المحمّلة">
          <DonutKpiWidget :segments="editorDonutSegments" :height="200" central-sub-label="مشاريع" />
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="مقارنة سريعة" subtitle="مخطط أعمدة">
          <DashboardMetricsBarChart :series="editorChartSeries" :height="240" />
        </DarkWidgetShell>
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
  { label: 'جاهزة للتسويق', value: Number(readyCount.value) || 0 },
  { label: 'غير جاهزة', value: Number(notReadyCount.value) || 0 },
]);

const editorDonutSegments = computed(() =>
  editorProjectSegments(readyCount.value, notReadyCount.value)
);

function goAfterMontage() {
  router.push({ name: 'EditorProjects', query: { tab: 'after' } });
}

onMounted(() => fetchContracts());
</script>

<style scoped>
.editor-dashboard-view {
  direction: rtl;
  padding: 20px 30px;
  min-height: 100vh;
  background: #f8fafc;
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
