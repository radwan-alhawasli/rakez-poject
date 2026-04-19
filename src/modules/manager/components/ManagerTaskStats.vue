<template>
  <div>
    <div class="tasks-stats-row" role="region" aria-label="إحصائيات المهام">
      <div class="stat-card">
        <span class="stat-label">إجمالي المهام</span>
        <span class="stat-value">{{ tasksCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">المكتملة</span>
        <span class="stat-value">{{ doneTasksCount }}</span>
      </div>
      <div class="stat-card stat-card--accent">
        <span class="stat-label">نسبة الإنجاز</span>
        <span class="stat-value">{{ completionPercentDisplay }}٪</span>
      </div>
    </div>
    <div class="tasks-status-breakdown" role="region" aria-label="نسب المهام حسب الحالة">
      <div class="breakdown-item">
        <span class="breakdown-label">قيد الانتظار</span>
        <span class="breakdown-pct">{{ statusBreakdown.pendingPct }}٪</span>
        <span class="breakdown-count">({{ statusBreakdown.pending }})</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">قيد التنفيذ</span>
        <span class="breakdown-pct">{{ statusBreakdown.inProgressPct }}٪</span>
        <span class="breakdown-count">({{ statusBreakdown.inProgress }})</span>
      </div>
      <div class="breakdown-item breakdown-item--done">
        <span class="breakdown-label">مكتمل</span>
        <span class="breakdown-pct">{{ statusBreakdown.donePct }}٪</span>
        <span class="breakdown-count">({{ statusBreakdown.done }})</span>
      </div>
      <div v-if="statusBreakdown.other > 0" class="breakdown-item">
        <span class="breakdown-label">أخرى</span>
        <span class="breakdown-pct">{{ statusBreakdown.otherPct }}٪</span>
        <span class="breakdown-count">({{ statusBreakdown.other }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tasksCount: {
    type: Number,
    required: true
  },
  doneTasksCount: {
    type: Number,
    required: true
  },
  completionPercentDisplay: {
    type: [Number, String],
    required: true
  },
  statusBreakdown: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.tasks-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card--accent {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #a7f3d0;
}

.stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
}

.tasks-status-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.breakdown-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  justify-content: space-between;
}

.breakdown-item--done .breakdown-pct {
  color: #047857;
}

.breakdown-label {
  font-size: 0.85rem;
  color: #64748b;
  width: 100%;
}

.breakdown-pct {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.breakdown-count {
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>
