import { ref, reactive } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';

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
      const data = await hrService.getTeamPerformance();
      performanceData.teams = data;
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
