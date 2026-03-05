<template>
  <div class="performance-view">
    <div class="section-header-compact">
      <h2 class="section-title">أداء الأفرقة</h2>
      <p class="section-subtitle">تحليل الإنتاجية والجودة لكل فريق عمل.</p>
    </div>
    <div class="metrics-table-container">
      <div v-if="!performanceData.teams || performanceData.teams.length === 0" class="metrics-table-empty">
        <div class="metrics-empty-icon">📊</div>
        <p class="metrics-empty-title">لا توجد بيانات أفرقة</p>
        <p class="metrics-empty-desc">لم يتم تحميل بيانات أداء الأفرقة بعد أو لا توجد فرق.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="metrics-table table-mobile-stacked">
          <thead>
            <tr>
              <th>الفريق</th>
              <th>نسبة تحقيق الأهداف</th>
              <th>الإنتاجية</th>
              <th>جودة العمل</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in performanceData.teams" :key="team.name">
              <td data-label="الفريق">{{ team.name }}</td>
              <td>
                <div class="table-progress">
                  <span>{{ team.achievement }}%</span>
                  <div class="bar">
                    <div class="fill" :style="{ width: team.achievement + '%' }"></div>
                  </div>
                </div>
              </td>
              <td data-label="الإنتاجية">{{ team.productivity }}%</td>
              <td data-label="جودة العمل">{{ team.quality }}%</td>
              <td>
                <span class="status-tag" :class="team.status">{{ team.statusLabel }}</span>
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

const { performanceData, loadTeamPerformance } = useHRPerformance();

onMounted(() => {
  loadTeamPerformance();
});
</script>

<style scoped>
.section-header-compact {
  margin-bottom: 32px;
  border-right: 5px solid #b1a28f;
  padding-right: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
  position: relative;
}

.section-header-compact::before {
  content: '';
  position: absolute;
  right: -5px;
  top: 0;
  width: 5px;
  height: 60%;
  background: linear-gradient(180deg, #b1a28f 0%, transparent 100%);
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

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
.status-tag { padding: 4px 12px; border-radius: var(--radius-lg, 12px); font-size: 11px; font-weight: 700; }
.status-tag.excellent { background: #dcfce7; color: #16a34a; }
.status-tag.good { background: #eff6ff; color: #3b82f6; }

@media (max-width: 576px) {
  .metrics-table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 16px; }
  .metrics-table { min-width: 480px; }
  .metrics-table th, .metrics-table td { padding: 12px 14px; font-size: 13px; }
}
</style>
