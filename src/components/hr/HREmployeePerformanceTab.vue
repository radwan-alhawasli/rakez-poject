<template>
  <div class="performance-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">أداء المسوقين</h1>
        <p class="welcome-subtitle">تتبع الأداء وتحقيق الأهداف لكل مسوق.</p>
      </div>
    </div>

    <div class="metrics-table-container">
      <div v-if="!marketerPerformanceData || marketerPerformanceData.length === 0" class="metrics-table-empty">
        <div class="metrics-empty-icon">📊</div>
        <p class="metrics-empty-title">لا توجد بيانات مسوقين</p>
        <p class="metrics-empty-desc">لم يتم تحميل بيانات الأداء بعد أو لا يوجد مسوقين لعرضهم.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="metrics-table table-mobile-stacked">
          <thead>
            <tr>
              <th>اسم الموظف</th>
              <th>نسبة تحقيق الأهداف</th>
              <th>عدد العرابين</th>
              <th>عدد التحذيرات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="marketer in marketerPerformanceData" :key="marketer.id">
              <td data-label="اسم الموظف">
                <div class="emp-user">
                  <div class="user-avatar">{{ (marketer.name || '؟').charAt(0) }}</div>
                  <span>{{ marketer.name || '—' }}</span>
                </div>
              </td>
              <td data-label="نسبة تحقيق الأهداف">
                <div class="table-progress">
                  <span>{{ marketer.goalAchievement ?? 0 }}%</span>
                  <div class="bar">
                    <div class="fill" :style="{ width: Math.min(100, Math.max(0, Number(marketer.goalAchievement) || 0)) + '%' }"></div>
                  </div>
                </div>
              </td>
              <td data-label="عدد العرابين">
                <span class="badge-info">{{ marketer.sponsorsCount ?? 0 }}</span>
              </td>
              <td data-label="عدد التحذيرات">
                <span class="badge-warning">{{ marketer.warningsCount ?? 0 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHRPerformance } from '@/composables/hr/useHRPerformance';

const { marketerPerformanceData, loadMarketerPerformance } = useHRPerformance();

onMounted(() => {
  loadMarketerPerformance();
});
</script>

<style scoped>
.metrics-table-container {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(177, 162, 143, 0.12);
  backdrop-filter: blur(10px);
}

.metrics-table-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; min-height: 200px; }
.metrics-empty-icon { font-size: 48px; opacity: 0.7; margin-bottom: 16px; }
.metrics-empty-title { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 8px 0; }
.metrics-empty-desc { font-size: 14px; color: #64748b; margin: 0; font-weight: 500; max-width: 320px; }
.metrics-table { width: 100%; border-collapse: collapse; text-align: right; }
.metrics-table th { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 22px 24px; font-size: 13px; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid rgba(177, 162, 143, 0.15); }
.metrics-table td { padding: 18px 24px; border-bottom: 1px solid rgba(226, 232, 240, 0.5); font-size: 15px; font-weight: 500; transition: background 0.3s ease; }
.metrics-table tr:hover td { background: rgba(177, 162, 143, 0.03); }
.metrics-table tr:last-child td { border-bottom: none; }
.table-progress { display: flex; align-items: center; gap: 10px; font-weight: 700; }
.table-progress .bar { flex: 1; height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.table-progress .bar .fill { height: 100%; background: #b1a28f; }

.emp-user { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #b1a28f; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.badge-info { display: inline-block; padding: 4px 12px; border-radius: var(--radius-lg, 12px); font-size: 12px; font-weight: 700; background: #dbeafe; color: #1e40af; }
.badge-warning { display: inline-block; padding: 4px 12px; border-radius: var(--radius-lg, 12px); font-size: 12px; font-weight: 700; background: #fef3c7; color: #b45309; }

@media (max-width: 576px) {
  .metrics-table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 16px; }
  .metrics-table { min-width: 480px; }
  .metrics-table th, .metrics-table td { padding: 12px 14px; font-size: 13px; }
}
</style>
