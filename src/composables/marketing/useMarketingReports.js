import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import hrService from '@/services/hrService';
import userService from '@/services/userService';
import logger from '@/utils/logger';
import { normalizeReportRows } from '@/utils/marketingNormalizers';

export function useMarketingReports() {
  const reportFilters = reactive({
    project_id: '',
    user_id: '',
    start_date: '',
    end_date: '',
  });
  const reportsData = reactive({
    projectPerformance: {},
    budgetAnalysis: {},
    bookingStats: {},
    employeePerformance: {},
  });
  const isLoadingReports = ref(false);

  const projects = ref([]);
  const isLoadingProjects = ref(false);
  const marketingEmployees = ref([]);
  const isLoadingEmployees = ref(false);

  const formatReportSummary = value => {
    if (!value) return '—';
    if (Array.isArray(value)) return `${value.length} records`;
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (!keys.length) return 'No data';
      return keys.slice(0, 4).map(k => `${k}: ${value[k]}`).join(' | ');
    }
    return String(value);
  };

  const reportSummary = computed(() => ({
    projectPerformance: formatReportSummary(reportsData.projectPerformance),
    budgetAnalysis: formatReportSummary(reportsData.budgetAnalysis),
    bookingStats: formatReportSummary(reportsData.bookingStats),
    employeePerformance: formatReportSummary(reportsData.employeePerformance),
  }));

  const reportRows = computed(() => {
    const sections = [
      { section: 'أداء المشاريع', value: reportsData.projectPerformance },
      { section: 'تحليل الميزانية', value: reportsData.budgetAnalysis },
      { section: 'إحصائيات الحجوزات', value: reportsData.bookingStats },
      { section: 'أداء الموظفين', value: reportsData.employeePerformance },
    ];
    return sections.flatMap(item =>
      normalizeReportRows(item.value, item.section).map(row => ({
        section: item.section,
        ...row,
      }))
    );
  });

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const data = await marketingService.getProjects({});
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects for reports:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const loadEmployees = async () => {
    isLoadingEmployees.value = true;
    try {
      const employees = await userService.getEmployees();
      const normalizedEmployees = Array.isArray(employees) ? employees : employees?.items || [];
      marketingEmployees.value = normalizedEmployees.filter(
        e =>
          String(e.type) === '0' || e.type === 0 || String(e.type).toLowerCase() === 'marketing'
      );
    } catch (error) {
      logger.error('Error loading employees:', error);
      marketingEmployees.value = [];
    } finally {
      isLoadingEmployees.value = false;
    }
  };

  const loadReports = async () => {
    isLoadingReports.value = true;
    try {
      const projectId = reportFilters.project_id || null;
      const userId = reportFilters.user_id || null;
      const [projectPerformance, budgetAnalysis, bookingStats, employeePerformance] =
        await Promise.all([
          projectId
            ? marketingService.getProjectPerformanceReport(projectId)
            : Promise.resolve({}),
          marketingService.getBudgetReport(),
          marketingService.getExpectedBookingsReport(),
          userId
            ? marketingService.getEmployeePerformanceReport(userId)
            : hrService.getMarketerPerformanceReport({}).catch(() => ({})),
        ]);
      reportsData.projectPerformance = projectPerformance || {};
      reportsData.budgetAnalysis = budgetAnalysis || {};
      reportsData.bookingStats = bookingStats || {};
      reportsData.employeePerformance = employeePerformance || {};
    } catch (error) {
      logger.error('Error loading reports:', error);
    } finally {
      isLoadingReports.value = false;
    }
  };

  const exportReportsExcel = () => {
    const rows = [['القسم', 'البند', 'القيمة']];
    reportRows.value.forEach(row => rows.push([row.section, row.name, row.summary]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `marketing_reports_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportReportsPdf = async () => {
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let y = 800;
      const draw = (text, size = 12) => {
        page.drawText(String(text), { x: 40, y, size, font, color: rgb(0.1, 0.2, 0.3) });
        y -= size + 10;
      };
      draw('Marketing Reports', 16);
      draw(`Date: ${new Date().toISOString().slice(0, 10)}`);
      reportRows.value.slice(0, 40).forEach(row => draw(`${row.section} / ${row.name}: ${row.summary}`));
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `marketing_reports_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    } catch (error) {
      logger.error('Error exporting PDF report:', error);
    }
  };

  onMounted(() => {
    loadProjects();
    loadEmployees();
    loadReports();
  });

  return {
    reportRows,
    reportSummary,
    reportFilters,
    isLoadingReports,
    projects,
    marketingEmployees,
    loadReports,
    exportReportsExcel,
    exportReportsPdf,
  };
}
