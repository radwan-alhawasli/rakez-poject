import { reactive } from 'vue';
import hrService from '@/services/hrService';
import logger from '@/utils/logger';

export function useHRPerformance() {
  const performanceData = reactive({
    teams: [],
    employees: [],
  });

  const marketerPerformanceData = reactive([]);

  const loadTeamPerformance = async () => {
    try {
      const data = await hrService.getTeamPerformance();
      performanceData.teams = data;
    } catch (error) {
      logger.error('Error loading team performance:', error);
      performanceData.teams = [
        {
          name: 'مبيعات الوسطى',
          achievement: 94,
          productivity: 88,
          quality: 95,
          status: 'excellent',
          statusLabel: 'ممتاز',
        },
        {
          name: 'مبيعات الغربية',
          achievement: 72,
          productivity: 75,
          quality: 82,
          status: 'good',
          statusLabel: 'جيد',
        },
      ];
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
    performanceData,
    marketerPerformanceData,
    loadTeamPerformance,
    loadMarketerPerformance,
  };
}
