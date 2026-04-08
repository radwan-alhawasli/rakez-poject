import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/**
 * استخراج رقم من كائن باستخدام قائمة مفاتيح (تطابق حقول Laravel / camelCase).
 */
function pickNumber(obj, keys, fallback = 0) {
  if (obj == null || typeof obj !== 'object') return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
}

/** يعيد null إن لم يُوجد أي مفتاح (لتمييز «لا بيانات» عن الصفر). */
function pickNumberOptional(obj, keys) {
  if (obj == null || typeof obj !== 'object') return null;
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== '') {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function clampPct(n) {
  if (Number.isNaN(n) || n == null) return 0;
  return Math.min(100, Math.max(0, Math.round(Number(n) * 100) / 100));
}

/**
 * متوسط المبيعات من استجابة GET /hr/teams/sales-average/:teamId
 */
function salesAverageFromHrPayload(payload) {
  if (payload == null || typeof payload !== 'object') return null;
  const v =
    payload?.average_sales?.sold_units_per_sales_employee ??
    payload?.data?.average_sales?.sold_units_per_sales_employee ??
    payload?.sold_units_per_sales_employee ??
    payload?.average_sales;
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/**
 * دمج GET /teams/:id/performance إن وُجد (اختياري؛ قد يعيد مؤشرات إضافية).
 */
function mergeTeamPerformancePayload(perf) {
  if (perf == null || typeof perf !== 'object') return {};
  const data = perf?.data && typeof perf.data === 'object' ? perf.data : perf;
  return data;
}

/**
 * صف جدول أداء الفرق — حقول متوافقة مع استجابة الفريق من HR + التحقيق من الخدمات المساعدة.
 */
function buildTeamPerformanceRow(team, salesHrPayload, perfPayload) {
  const id = team?.id ?? null;
  const name = team?.name ?? team?.team_name ?? team?.title ?? (id != null ? `فريق #${id}` : '—');

  const perf = mergeTeamPerformancePayload(perfPayload);

  const goalRaw =
    pickNumberOptional(team, [
      'goal_progress',
      'goal_achievement',
      'goals_percent',
      'goal_percent',
      'goal_percentage',
    ]) ??
    pickNumberOptional(perf, [
      'goal_progress',
      'goal_achievement',
      'goalAchievement',
      'achievement',
      'achievement_percent',
      'goals_percent',
    ]);
  const hasGoalData = goalRaw != null;
  const goalProgress = clampPct(goalRaw ?? 0);

  const fromList = pickNumberOptional(team, ['sales_average', 'average_sales', 'sold_units_per_sales_employee']);
  const fromHrSales = salesAverageFromHrPayload(salesHrPayload);
  const fromPerf = pickNumberOptional(perf, ['sold_units_per_sales_employee', 'sales_average', 'average_sales']);

  let salesAverage = 0;
  if (fromHrSales != null) salesAverage = fromHrSales;
  else if (fromList != null) salesAverage = fromList;
  else if (fromPerf != null) salesAverage = fromPerf;

  const projectsCount = Math.round(
    pickNumberOptional(team, ['sold_projects', 'projects_count', 'contracts_count']) ??
      pickNumberOptional(perf, ['projects_count', 'contracts_count', 'sold_projects']) ??
      0
  );

  const membersRaw = team?.members ?? team?.users ?? team?.team_members;
  let membersCount = pickNumberOptional(team, ['members_count', 'users_count', 'team_members_count']);
  if (membersCount == null) {
    membersCount = Array.isArray(membersRaw) ? membersRaw.length : 0;
  }

  let status = 'good';
  let statusLabel = 'جيد';
  if (!hasGoalData) {
    status = 'neutral';
    statusLabel = 'لا يوجد هدف';
  } else if (goalProgress >= 85) {
    status = 'excellent';
    statusLabel = 'ممتاز';
  } else if (goalProgress < 50) {
    status = 'needs_improvement';
    statusLabel = 'يحتاج تحسين';
  }

  return {
    id,
    name,
    hasGoalData,
    goalProgress,
    salesAverage,
    projectsCount,
    membersCount,
    status,
    statusLabel,
  };
}

export function useHRPerformance() {
  const error = ref(null);
  const isLoading = ref(false);

  /** فترة اختيارية لـ GET /hr/teams (year, month) عندما يدعمها الـ backend */
  const periodYear = ref(new Date().getFullYear());
  const periodMonth = ref(new Date().getMonth() + 1);

  const performanceData = reactive({
    teams: [],
    employees: [],
  });

  const marketerPerformanceData = reactive([]);

  const loadTeamPerformance = async () => {
    error.value = null;
    isLoading.value = true;
    try {
      const params = { per_page: 100 };
      const y = periodYear.value;
      const m = periodMonth.value;
      if (y != null && y !== '') params.year = Number(y);
      if (m != null && m !== '') params.month = Number(m);

      const res = await hrService.getTeams(params);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];

      const rows = await Promise.all(
        items.map(async team => {
          const id = team?.id;
          if (id == null) {
            return buildTeamPerformanceRow(team, {}, {});
          }

          const [salesSettled, perfSettled] = await Promise.allSettled([
            hrService.getTeamSalesAverage(id),
            teamService.getTeamPerformance(id, { year: params.year, month: params.month }),
          ]);

          const salesPayload = salesSettled.status === 'fulfilled' ? salesSettled.value : {};
          const perfPayload = perfSettled.status === 'fulfilled' ? perfSettled.value : {};

          return buildTeamPerformanceRow(team, salesPayload, perfPayload);
        })
      );

      performanceData.teams = rows;
    } catch (err) {
      logger.error('Error loading team performance:', err);
      error.value = 'حدث خطأ أثناء تحميل أداء الفرق';
      toast.error('حدث خطأ أثناء تحميل أداء الفرق');
      performanceData.teams = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadMarketerPerformance = async () => {
    try {
      const list = await hrService.listMarketerPerformance();
      const normalized = (Array.isArray(list) ? list : []).map(item => ({
        id: item.id ?? item.user_id ?? item.marketer_id,
        name: item.name ?? item.user?.name ?? item.employee_name ?? '—',
        goalAchievement: item.goalAchievement ?? item.goal_achievement ?? item.achievement ?? 0,
        sponsorsCount:
          item.sponsorsCount ??
          item.sponsors_count ??
          item[String.fromCharCode(0x0639, 0x0631, 0x0627, 0x0628, 0x064a, 0x0646)] ??
          0,
        warningsCount: item.warningsCount ?? item.warnings_count ?? 0,
      }));
      marketerPerformanceData.splice(0, marketerPerformanceData.length, ...normalized);
    } catch (e) {
      logger.error('Error loading marketer performance:', e);
      marketerPerformanceData.splice(0, marketerPerformanceData.length);
    }
  };

  return {
    error,
    isLoading,
    periodYear,
    periodMonth,
    performanceData,
    marketerPerformanceData,
    loadTeamPerformance,
    loadMarketerPerformance,
  };
}
