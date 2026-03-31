<template>
  <div class="reports-tab">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">التقارير والإحصائيات</h1>
        <p class="welcome-subtitle">إصدار تقارير دورية للأداء، الموظفين، والعقود.</p>
      </div>
    </div>

    <div class="reports-grid">
      <!-- 1. Team Performance Report -->
      <div class="report-card">
        <div class="report-icon blue">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="28"
            height="28"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
        <div class="report-content">
          <h3 class="report-title">تقرير أداء الفرق</h3>
          <p class="report-desc">تقرير شهري يوضح أداء الفرق وتحقيق الأهداف.</p>

          <div class="report-controls">
            <select v-model="teamReport.month" class="form-select small">
              <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
            </select>
            <select v-model="teamReport.year" class="form-select small">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <button class="btn-generate" @click="generateTeamReport" :disabled="loading.team">
            <span v-if="loading.team">جاري التحميل...</span>
            <span v-else
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              إصدار التقرير</span
            >
          </button>
        </div>
      </div>

      <!-- 2. Marketer Performance Report -->
      <div class="report-card">
        <div class="report-icon purple">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="28"
            height="28"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="report-content">
          <h3 class="report-title">تقرير أداء مسوق</h3>
          <p class="report-desc">تقرير تفصيلي لأداء مسوق محدد خلال شهر.</p>

          <div class="report-controls">
            <select v-model="marketerReport.marketerId" class="form-select block">
              <option value="" disabled selected>اختر المسوق</option>
              <option v-for="m in marketers" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <div class="flex-row">
              <select v-model="marketerReport.month" class="form-select small">
                <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
              </select>
              <select v-model="marketerReport.year" class="form-select small">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <button
            class="btn-generate"
            @click="generateMarketerReport"
            :disabled="loading.marketer || !marketerReport.marketerId"
          >
            <span v-if="loading.marketer">جاري التحميل...</span>
            <span v-else
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              إصدار التقرير</span
            >
          </button>
        </div>
      </div>

      <!-- 3. Current Employees Report -->
      <div class="report-card">
        <div class="report-icon green">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="28"
            height="28"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="report-content">
          <h3 class="report-title">قائمة الموظفين الحاليين</h3>
          <p class="report-desc">تقرير شامل بجميع الموظفين النشطين في النظام.</p>
          <div class="spacer"></div>
          <button
            class="btn-generate"
            @click="generateEmployeesReport"
            :disabled="loading.employees"
          >
            <span v-if="loading.employees">جاري التحميل...</span>
            <span v-else
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              تحميل القائمة</span
            >
          </button>
        </div>
      </div>

      <!-- 4. Expiring Contracts Report -->
      <div class="report-card">
        <div class="report-icon red">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="28"
            height="28"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="report-content">
          <h3 class="report-title">العقود وفترات التجربة</h3>
          <p class="report-desc">تقرير بالعقود المنتهية وقرب انتهاء فترة التجربة.</p>

          <div class="report-controls">
            <label class="control-label">تنبيه قبل (أيام):</label>
            <input
              type="number"
              v-model="contractsReport.days"
              class="form-input small"
              min="1"
              max="90"
            />
          </div>

          <button
            class="btn-generate"
            @click="generateContractsReport"
            :disabled="loading.contracts"
          >
            <span v-if="loading.contracts">جاري التحميل...</span>
            <span v-else
              ><svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="16"
                height="16"
                style="vertical-align: middle; margin-left: 4px"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              تحميل التقرير</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

export default {
  name: 'ReportsTab',
  setup() {
    const loading = reactive({
      team: false,
      marketer: false,
      employees: false,
      contracts: false,
    });

    const marketers = ref([]);
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];

    const teamReport = reactive({ month: new Date().getMonth() + 1, year: currentYear });
    const marketerReport = reactive({
      marketerId: '',
      month: new Date().getMonth() + 1,
      year: currentYear,
    });
    const contractsReport = reactive({ days: 30 });

    const getMonthName = m => {
      const months = [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ];
      return months[m - 1];
    };

    const loadMarketers = async () => {
      try {
        const list = await hrService.listMarketerPerformance();
        const arr = Array.isArray(list) ? list : [];
        marketers.value = arr
          .map(m => ({
            id: m.id ?? m.user_id ?? m.marketer_id,
            name: m.name ?? m.user?.name ?? m.employee_name ?? '—',
          }))
          .filter(m => m.id != null || m.name !== '—');
      } catch (error) {
        logger.error('Error loading marketers', error);
        marketers.value = [];
      }
    };

    const generateTeamReport = async () => {
      loading.team = true;
      try {
        await hrService.generateTeamPerformanceReport(teamReport.month, teamReport.year);
      } catch (error) {
        logger.error('Error generating team report', error);
        toast.error('حدث خطأ أثناء إصدار التقرير');
      } finally {
        loading.team = false;
      }
    };

    const generateMarketerReport = async () => {
      if (!marketerReport.marketerId) return;
      loading.marketer = true;
      try {
        await hrService.generateMarketerReport(
          marketerReport.marketerId,
          marketerReport.month,
          marketerReport.year
        );
      } catch (error) {
        logger.error('Error generating marketer report', error);
        toast.error('حدث خطأ أثناء إصدار التقرير');
      } finally {
        loading.marketer = false;
      }
    };

    const generateEmployeesReport = async () => {
      loading.employees = true;
      try {
        await hrService.generateEmployeesReport();
      } catch (error) {
        logger.error('Error generating employees report', error);
        toast.error('حدث خطأ أثناء إصدار التقرير');
      } finally {
        loading.employees = false;
      }
    };

    const generateContractsReport = async () => {
      loading.contracts = true;
      try {
        await hrService.generateExpiringContractsReport(contractsReport.days);
      } catch (error) {
        logger.error('Error generating contracts report', error);
        toast.error('حدث خطأ أثناء إصدار التقرير');
      } finally {
        loading.contracts = false;
      }
    };

    onMounted(() => {
      loadMarketers();
    });

    return {
      loading,
      marketers,
      years,
      teamReport,
      marketerReport,
      contractsReport,
      getMonthName,
      generateTeamReport,
      generateMarketerReport,
      generateEmployeesReport,
      generateContractsReport,
    };
  },
};
</script>

<style scoped src="./styles/ReportsTab.scoped.s1.css"></style>
