import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

/**
 * تحويل عنصر فريق من الـ API إلى شكل جدول أداء الفرق.
 * (لا يوجد getTeamPerformance على hrService — المصدر الفعلي قائمة الفرق من GET /hr/teams)
 */
function normalizeTeamPerformanceRow(t) {
  if (!t || typeof t !== 'object') {
    return {
      name: '—',
      achievement: 0,
      productivity: 0,
      quality: 0,
      status: 'good',
      statusLabel: 'جيد',
    };
  }
  const name = t.name ?? t.team_name ?? t.title ?? `فريق #${t.id ?? '—'}`;
  const achievement =
    Number(t.goal_achievement ?? t.goalAchievement ?? t.achievement ?? t.goals_percent ?? t.goal_percent ?? 0) || 0;
  const productivity =
    Number(
      t.productivity ?? t.productivity_percent ?? t.productivity_score ?? t.performance_productivity ?? achievement
    ) || 0;
  const quality =
    Number(t.quality ?? t.quality_percent ?? t.quality_score ?? t.performance_quality ?? achievement) || 0;
  const ach = Math.min(100, Math.max(0, achievement));
  const prod = Math.min(100, Math.max(0, productivity));
  const qual = Math.min(100, Math.max(0, quality));
  const raw = String(t.performance_status ?? t.performanceStatus ?? t.status ?? '').toLowerCase();
  let status = 'good';
  if (raw === 'excellent' || raw === 'ممتاز') status = 'excellent';
  else if (raw === 'good' || raw === 'جيد') status = 'good';
  else if (ach >= 85) status = 'excellent';
  const statusLabel = status === 'excellent' ? 'ممتاز' : 'جيد';
  return { name, achievement: ach, productivity: prod, quality: qual, status, statusLabel };
}

export function useHRPerformance() {
  const error = ref(null);

  const performanceData = reactive({
    teams: [],
    employees: [],
  });

  const marketerPerformanceData = reactive([]);

  const loadTeamPerformance = async () => {
    error.value = null;
    try {
      const res = await hrService.getTeams({ per_page: 100 });
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      performanceData.teams = items.map(normalizeTeamPerformanceRow);
    } catch (err) {
      logger.error('Error loading team performance:', err);
      error.value = 'حدث خطأ أثناء تحميل أداء الفرق';
      toast.error('حدث خطأ أثناء تحميل أداء الفرق');
      performanceData.teams = [];
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
    } catch (error) {
      logger.error('Error loading marketer performance:', error);
      marketerPerformanceData.splice(0, marketerPerformanceData.length);
    }
  };

  return {
    error,
    performanceData,
    marketerPerformanceData,
    loadTeamPerformance,
    loadMarketerPerformance,
  };
}
