<template>
  <div class="dashboard-view rakez-erp-dashboard rakez-kpi-dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button type="button" @click="fetchData">إعادة المحاولة</button>
    </div>

    <template v-else>
      <DashboardWelcomeHeader
        :user-name="userName"
        subtitle="إدارة المشاريع والموافقات."
        english-title="Welcome Back"
        english-subtitle="Projects and approvals management"
      />

      <h3 class="rakez-dashboard-section-title">المؤشرات الرئيسية</h3>
      <div class="rakez-widget-grid rakez-widget-grid--dense dashboard-main-grid">
        <LuxuryStatCard
          label="الوحدات المتاحة"
          :value="formatCompact(availableUnits)"
          :title="formatNumber(availableUnits)"
          description="وحدة سكنية جاهزة للبيع (تقديري من العقود)"
        >
          <template #icon>
            <DashboardStatIcon name="units" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          clickable
          label="مشاريع التسويق (إجمالي)"
          :value="formatCompact(totalProjects)"
          :title="formatNumber(totalProjects)"
          description="اضغط للعرض"
          @click="$router.push('/project-management')"
        >
          <template #icon>
            <DashboardStatIcon name="clipboard" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="المشاريع الجاهزة"
          :value="formatCompact(readyProjects)"
          :title="formatNumber(readyProjects)"
          description="مشاريع مكتملة تحتوي على وحدات"
        >
          <template #icon>
            <DashboardStatIcon name="successCircle" />
          </template>
        </LuxuryStatCard>

        <LuxuryStatCard
          label="المشاريع غير الجاهزة"
          :value="formatCompact(notReadyProjects)"
          :title="formatNumber(notReadyProjects)"
          description="لم يكتمل المتتبع (Tracker)"
        >
          <template #icon>
            <DashboardStatIcon name="warningCircle" />
          </template>
        </LuxuryStatCard>
      </div>

      <h3 class="rakez-dashboard-section-title">لوحة المؤشرات</h3>
      <div class="rakez-widget-grid dashboard-widgets-bottom">
        <DarkWidgetShell title="توزيع المشاريع" :subtitle="`جاهز للتسويق ${readinessPct}%`">
          <DonutKpiWidget
            :segments="projectReadinessSplit"
            :height="200"
            :central-label="readinessPct + '%'"
            central-sub-label="جاهز للتسويق"
          />
        </DarkWidgetShell>
        <DarkWidgetShell title="تفصيل الجاهزية" subtitle="عدد المشاريع حسب الحالة">
          <ProgressBreakdownWidget :rows="projectReadinessSplit" value-type="number" />
          <p class="dashboard-portfolio-note">إجمالي قيمة الوحدات (تقديري): {{ formatCurrencyAr(totalPortfolioValue) }}</p>
        </DarkWidgetShell>
        <DarkWidgetShell class="rakez-widget-span-2" title="مؤشرات سريعة" subtitle="وحدات ومشاريع">
          <DashboardMetricsBarChart :series="mainBarSeries" :height="240" />
        </DarkWidgetShell>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/authService';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { useFormatters } from '@/composables/useFormatters';
import LuxuryStatCard from '@/components/dashboard/widgets/LuxuryStatCard.vue';
import DarkWidgetShell from '@/components/dashboard/widgets/DarkWidgetShell.vue';
import DonutKpiWidget from '@/components/dashboard/widgets/DonutKpiWidget.vue';
import ProgressBreakdownWidget from '@/components/dashboard/widgets/ProgressBreakdownWidget.vue';
import DashboardMetricsBarChart from '@/components/dashboard/DashboardMetricsBarChart.vue';
import DashboardWelcomeHeader from '@/components/dashboard/DashboardWelcomeHeader.vue';
import DashboardStatIcon from '@/components/dashboard/DashboardStatIcon.vue';

const router = useRouter();
const user = ref(authService.getCurrentUser());
const userName = computed(() => user.value?.name || 'مستخدم');
const { formatCompact, formatNumber, formatCurrencyAr } = useFormatters();

const isLoading = ref(true);
const error = ref(null);

const totalPortfolioValue = ref(0);
const availableUnits = ref(0);
const totalProjects = ref(0);
const readyProjects = ref(0);
const notReadyProjects = ref(0);

const readinessPct = computed(() => {
  const t = totalProjects.value;
  if (!t) return 0;
  return Math.round((readyProjects.value / t) * 100);
});

/** دونات + شريط تقدم: نفس قيمة جاهز / غير جاهز */
const projectReadinessSplit = computed(() => [
  { label: 'جاهز للتسويق', value: Number(readyProjects.value) || 0 },
  { label: 'تحت الإعداد', value: Number(notReadyProjects.value) || 0 },
]);

const mainBarSeries = computed(() => [
  { label: 'وحدات (تقدير)', value: Number(availableUnits.value) || 0 },
  { label: 'مشاريع', value: Number(totalProjects.value) || 0 },
  { label: 'جاهزة', value: Number(readyProjects.value) || 0 },
  { label: 'غير جاهزة', value: Number(notReadyProjects.value) || 0 },
]);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    let apps = [];
    const isUserAdmin = user.value && (user.value.type === 1 || user.value.type === 'admin');
    const isUserEditor = user.value && user.value.type === 3;

    if (isUserAdmin) {
      const adminRes = await contractService.getAllContracts({ page: 1, per_page: 500 });
      apps = adminRes.items ?? [];
    } else if (isUserEditor) {
      apps = await contractService.getEditorContracts();
    } else {
      const res = await contractService.getContracts({ page: 1, per_page: 500 });
      apps = res.items ?? [];
    }

    const projects = Array.isArray(apps) ? apps : [];

    totalProjects.value = projects.length;

    const readyCount = projects.filter(
      p => p.status === 'Approved' || (p.units && p.units.length > 0)
    ).length;
    readyProjects.value = readyCount;
    notReadyProjects.value = Math.max(0, projects.length - readyCount);

    let valueSum = 0;
    let unitsSum = 0;

    projects.forEach(p => {
      if (p.units && Array.isArray(p.units)) {
        p.units.forEach(u => {
          const count = parseInt(u.count) || 1;
          const price = parseFloat(u.price) || 0;
          unitsSum += count;
          valueSum += price * count;
        });
      }
    });

    availableUnits.value = unitsSum;
    totalPortfolioValue.value = valueSum;
  } catch (e) {
    logger.error('Error fetching dashboard data', e);
    error.value = 'حدث خطأ في تحميل البيانات';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const currentUser = authService.getCurrentUser();
  if (currentUser?.type == 8) {
    router.push('/hr/dashboard');
    return;
  }
  fetchData();
});
</script>

<style scoped src="./styles/DashboardView.scoped.s1.css"></style>
