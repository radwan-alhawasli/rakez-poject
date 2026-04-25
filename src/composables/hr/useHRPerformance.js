import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/**
 * استخراج رقم من كائن باستخدام قائمة مفاتيح (تطابق حقول Laravel / camelCase).
 * @param {any} obj
 * @param {any[]} keys
 * @param {number} fallback
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

/** يعيد null إن لم يُوجد أي مفتاح (لتمييز «لا بيانات» عن الصفر). 
 * @param {any} obj
 * @param {any[]} keys
 */
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

/** نص اختياري من عدة مفاتيح (للبريد، الهاتف، اسم الفريق، إلخ). 
 * @param {any} obj
 * @param {any[]} keys
 */
function pickString(obj, keys) {
  if (obj == null || typeof obj !== 'object') return null;
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

/** @param {any} n */
function clampPct(n) {
  if (Number.isNaN(n) || n == null) return 0;
  return Math.min(100, Math.max(0, Math.round(Number(n) * 100) / 100));
}

/** نسبة تحقيق الهدف: يدعم 0–100 أو كسر عشري 0–1 كما في بعض واجهات Laravel 
 * @param {any} raw */
function normalizeGoalPercentValue(raw) {
  if (raw == null || raw === '') return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  if (n > 0 && n <= 1) return clampPct(n * 100);
  return clampPct(n);
}

/**
 * صف أداء مسوق — محاذاة مع تقرير PDF (target_achievement_rate, deposits_count, warnings_count)
 * وجميع المفاتيح البديلة الشائعة في الاستجابة.
 * @param {any} item
 */
function buildMarketerPerformanceRow(item) {
  const user = item?.user && typeof item.user === 'object' ? item.user : {};
  const teamObj = item?.team && typeof item.team === 'object' ? item.team : {};

  const id =
    item?.id ??
    item?.user_id ??
    item?.marketer_id ??
    item?.employee_id ??
    user?.id ??
    null;

  const nameFromUserParts = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const name =
    item?.name ||
    item?.full_name ||
    item?.employee_name ||
    item?.marketer_name ||
    user?.name ||
    user?.full_name ||
    nameFromUserParts ||
    '—';

  const email = pickString(item, ['email']) ?? pickString(user, ['email']);
  const phone =
    pickString(item, ['phone', 'mobile', 'work_phone']) ?? pickString(user, ['phone', 'mobile']);

  const teamName =
    pickString(teamObj, ['name', 'team_name', 'code']) ??
    pickString(item, ['team_name']) ??
    null;

  const roleType = pickString(item, ['type', 'role', 'user_type']) ?? pickString(user, ['type']);

  const jobTitle = pickString(item, ['job_title']) ?? pickString(user, ['job_title']);

  const isManager = Boolean(item?.is_manager ?? user?.is_manager);
  let isActive = null;
  if (item?.is_active !== undefined && item?.is_active !== null) {
    isActive = Boolean(item.is_active);
  } else if (user?.is_active !== undefined && user?.is_active !== null) {
    isActive = Boolean(user.is_active);
  }

  const goalRaw =
    pickNumberOptional(item, [
      'target_achievement_rate',
      'goal_achievement_rate',
      'goal_achievement_percent',
      'goal_percentage',
      'goal_percent',
      'goalAchievement',
      'goal_achievement',
      'achievement',
      'achievement_percent',
      'progress',
      'goals_percent',
    ]) ?? pickNumberOptional(user, ['target_achievement_rate', 'goal_achievement', 'achievement']);

  const goalAchievement = normalizeGoalPercentValue(goalRaw ?? 0);

  const depositsCount = pickNumber(
    item,
    [
      'deposits_count',
      'sponsors_count',
      'sponsorsCount',
      'arabon_count',
      'leads_count',
      'lead_count',
    ],
    0
  );

  let warningsCount = pickNumberOptional(item, ['warnings_count', 'warningsCount', 'alerts_count']);
  const warningsList = Array.isArray(item?.warnings) ? item.warnings : [];
  if (warningsCount == null) {
    warningsCount = warningsList.length;
  }

  return {
    id,
    name,
    email,
    phone,
    teamName,
    roleType,
    jobTitle,
    isManager,
    isActive,
    goalAchievement,
    depositsCount,
    warningsCount,
    warningsList,
  };
}

/**
 * متوسط المبيعات من استجابة GET /hr/teams/sales-average/:teamId
 * @param {any} payload
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
 * @param {any} perf
 */
function mergeTeamPerformancePayload(perf) {
  if (perf == null || typeof perf !== 'object') return {};
  const data = perf?.data && typeof perf.data === 'object' ? perf.data : perf;
  return data;
}

/**
 * صف جدول أداء الفرق — حقول متوافقة مع استجابة الفريق من HR + التحقيق من الخدمات المساعدة.
 * @param {any} team
 * @param {any} salesHrPayload
 * @param {any} perfPayload
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

  const periodYear = ref(new Date().getFullYear());
  const periodMonth = ref(new Date().getMonth() + 1);

  const performanceData = reactive({
    /** @type {any[]} */
    teams: [],
    /** @type {any[]} */
    employees: [],
  });

  /** @type {import('vue').UnwrapNestedRefs<any[]>} */
  const marketerPerformanceData = reactive([]);

  /** فلتر نصي اختياري لـ GET /hr/marketers/performance (إن دعمه الخادم) */
  const marketerSearchQuery = ref('');

  const loadTeamPerformance = async () => {
    error.value = null;
    isLoading.value = true;
    try {
      const params = { per_page: 100 };
      const y = periodYear.value;
      const m = periodMonth.value;
      if (y != null && String(y) !== '') (/** @type {any} */ (params)).year = Number(y);
      if (m != null && String(m) !== '') (/** @type {any} */ (params)).month = Number(m);

      const res = await hrService.getTeams(params);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];

      const rows = await Promise.all(
        items.map(async (/** @type {any} */ team) => {
          const id = team?.id;
          if (id == null) {
            return buildTeamPerformanceRow(team, {}, {});
          }

          const [salesSettled, perfSettled] = await Promise.allSettled([
            hrService.getTeamSalesAverage(id),
            teamService.getTeamPerformance(id, { year: (/** @type {any} */ (params)).year, month: (/** @type {any} */ (params)).month }),
          ]);

          const salesPayload = salesSettled.status === 'fulfilled' ? salesSettled.value : {};
          const perfPayload = perfSettled.status === 'fulfilled' ? perfSettled.value : {};

          return buildTeamPerformanceRow(team, salesPayload, perfPayload);
        })
      );

      performanceData.teams = rows;
    } catch (err) {
      logger.error('Error loading team performance:', err);
      error.value = (/** @type {any} */ ('حدث خطأ أثناء تحميل أداء الفرق'));
      toast.error('حدث خطأ أثناء تحميل أداء الفرق');
      performanceData.teams = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadMarketerPerformance = async () => {
    error.value = null;
    isLoading.value = true;
    try {
      const params = {};
      const y = periodYear.value;
      const m = periodMonth.value;
      if (y != null && String(y) !== '') (/** @type {any} */ (params)).year = Number(y);
      if (m != null && String(m) !== '') (/** @type {any} */ (params)).month = Number(m);
      const q = String(marketerSearchQuery.value || '').trim();
      if (q) (/** @type {any} */ (params)).search = q;

      const list = await hrService.listMarketerPerformance(params);
      const normalized = (Array.isArray(list) ? list : []).map(item => buildMarketerPerformanceRow(item));
      marketerPerformanceData.splice(0, marketerPerformanceData.length, ...normalized);
    } catch (e) {
      logger.error('Error loading marketer performance:', e);
      error.value = (/** @type {any} */ ('تعذر تحميل أداء المسوقين'));
      toast.error('تعذر تحميل أداء المسوقين');
      marketerPerformanceData.splice(0, marketerPerformanceData.length);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    error,
    isLoading,
    periodYear,
    periodMonth,
    marketerSearchQuery,
    performanceData,
    marketerPerformanceData,
    loadTeamPerformance,
    loadMarketerPerformance,
  };
}
