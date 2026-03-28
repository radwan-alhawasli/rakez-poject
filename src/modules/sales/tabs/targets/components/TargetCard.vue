<template>
  <div
    class="target-card"
    :class="{
      'target-card-clickable': target.contract_id,
      'target-card-completed': isTargetCompleted(target),
    }"
    role="button"
    tabindex="0"
    @click="$emit('card-click', target)"
    @keydown.enter="target.contract_id && $emit('open-units', target)"
  >
    <!-- شارة الإنجاز -->
    <div v-if="isTargetCompleted(target)" class="completed-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>

    <!-- زر ثلاث نقاط -->
    <div class="card-menu-wrap">
      <button
        type="button"
        class="card-menu-btn"
        aria-label="خيارات"
        @click.stop="$emit('toggle-menu', target.target_id || target.id)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <circle cx="12" cy="5" r="1.5"></circle>
          <circle cx="12" cy="12" r="1.5"></circle>
          <circle cx="12" cy="19" r="1.5"></circle>
        </svg>
      </button>
      <div v-if="isOpen" class="card-dropdown" @click.stop>
        <button
          v-if="hasPermission('sales.team.manage')"
          type="button"
          class="card-dropdown-item"
          @click="$emit('assign-marketers', target)"
        >
          إضافة مسوقين للمشروع
        </button>
        <template v-if="canUpdate">
          <div class="card-dropdown-status">
            <span class="card-dropdown-label">تغيير الحالة</span>
            <select
              :value="(target.status || '').toLowerCase()"
              class="card-dropdown-select"
              :disabled="isUpdating"
              @change="$emit('update-status', target, $event.target.value)"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <button
            v-if="(target.status || '').toLowerCase() !== 'completed'"
            type="button"
            class="card-dropdown-item card-dropdown-item-done"
            :disabled="isUpdating"
            @click="$emit('update-status', target, 'completed')"
          >
            جعل منجز (تحقق)
          </button>
        </template>
      </div>
    </div>

    <div class="target-header">
      <div class="target-info">
        <h3 class="target-project-name">{{ target.project_name || 'هدف مبيعات' }}</h3>
        <p class="target-marketer">{{ assigneeLine }}</p>
        <p v-if="!isLeaderView" class="target-marketer target-assigned-units">{{ unitsLine }}</p>
      </div>
      <div class="target-value-block">
        <span class="target-value">{{ formatCurrency(target.target_value) }}</span>
        <span class="target-value-label">الهدف</span>
      </div>
    </div>

    <div class="target-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :class="statusClass"
          :style="{ width: progressPct + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        <span>محقق: {{ formatCurrency(achievedValue) }}</span>
        <span class="progress-pct">{{ progressPct }}%</span>
      </div>
    </div>

    <div class="target-footer">
      <div class="target-footer-left">
        <div class="target-deadline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>الموعد النهائي: {{ formatDate(target.end_date || target.deadline) }}</span>
        </div>
      </div>
      <span class="target-status" :class="statusClass">
        {{ target.status_label_ar || statusText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  target: { type: Object, required: true },
  isOpen: { type: Boolean, default: false },
  isUpdating: { type: Boolean, default: false },
  isLeaderView: { type: Boolean, default: false },
  canUpdate: { type: Boolean, default: false },
  statusOptions: { type: Array, required: true },
  hasPermission: { type: Function, required: true },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  getTargetStatusClass: { type: Function, required: true },
  getTargetStatusText: { type: Function, required: true },
  getProgressPercentage: { type: Function, required: true },
});

defineEmits(['card-click', 'open-units', 'toggle-menu', 'assign-marketers', 'update-status']);

const isTargetCompleted = (target) => {
  const status = String(target?.status || '').toLowerCase();
  const label = String(target?.status_label_ar || '').trim();
  return status === 'completed' || status === 'achieved' || status === 'done' || label === 'منجز';
};

const assigneeLine = computed(() => {
  if (props.isLeaderView) return props.target.marketer_name || '—';
  return props.target.assigned_by ? `أُسند لك من: ${props.target.assigned_by}` : 'أُسند لك هذا الهدف';
});

const unitsLine = computed(() => {
  const units = Array.isArray(props.target?.units) ? props.target.units : [];
  if (units.length > 0) {
    const unitNumbers = units.map((u) => u?.unit_number).filter(Boolean);
    if (unitNumbers.length > 0) return `المسند لك: ${unitNumbers.join('، ')}`;
  }
  if (props.target?.unit_number) return `المسند لك: ${props.target.unit_number}`;
  return 'المسند لك: كامل المشروع';
});

const achievedValue = computed(() => {
  const achieved = Number(props.target?.achieved_value || 0);
  const goal = Number(props.target?.target_value || 0);
  if (isTargetCompleted(props.target) && achieved === 0 && goal > 0) return goal;
  return achieved;
});

const progressPct = computed(() => props.getProgressPercentage(props.target));
const statusClass = computed(() => props.getTargetStatusClass(props.target));
const statusText = computed(() => props.getTargetStatusText(props.target));
</script>

<style scoped>
/* Individual Card Styles from original file */
.target-card {
  position: relative;
  background: var(--color-white);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: 16px;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: visible;
}

.target-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--color-navy, #27374D);
  opacity: 0.9;
  border-radius: 16px 16px 0 0;
  transition: background 0.3s ease;
}

.target-card-completed {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%);
  border-color: rgba(5, 150, 105, 0.25);
}

.target-card-completed::before {
  height: 5px;
  background: linear-gradient(90deg, #10b981, #059669, #047857);
  opacity: 1;
}

.completed-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.35);
}

.completed-badge svg {
  width: 20px;
  height: 20px;
  color: white;
}

.card-menu-wrap {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
}

.card-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  color: var(--color-navy);
  cursor: pointer;
}

.card-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 200px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 6px 0;
}

.card-dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: right;
  font-size: 0.9375rem;
  color: var(--color-navy);
  cursor: pointer;
}

.card-dropdown-item:hover { background: #f1f5f9; }

.card-dropdown-status {
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
}

.card-dropdown-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-dark-gray);
  margin-bottom: 6px;
}

.card-dropdown-select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
}

.card-dropdown-item-done { font-weight: 600; color: #059669; }

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  gap: 12px;
  padding: 20px 22px 0;
  padding-inline-end: 54px;
}

.target-project-name {
  margin: 0 0 6px 0;
  font-size: 1.2rem;
  color: var(--color-navy);
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.target-marketer { margin: 0; font-size: 0.8125rem; color: #64748b; font-weight: 500; }

.target-value-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 5px 9px;
  background: rgba(39, 55, 77, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(39, 55, 77, 0.08);
}

.target-value { font-size: 0.95rem; font-weight: 800; color: #047857; }
.target-value-label { font-size: 0.6rem; color: #64748b; font-weight: 600; }

.target-progress {
  margin-bottom: 18px;
  padding: 0 22px;
  padding-inline-end: 54px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(39, 55, 77, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill:not(.completed) { background: linear-gradient(90deg, #34d399 0%, #059669 100%); }
.progress-fill.completed { background: linear-gradient(90deg, #10b981 0%, #047857 100%); }

.progress-text { display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; color: #64748b; }
.progress-pct { font-weight: 700; color: var(--color-navy); }

.target-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px 22px;
  padding-inline-end: 54px;
  border-top: 1px solid rgba(39, 55, 77, 0.08);
  background: rgba(248, 250, 252, 0.8);
  border-radius: 0 0 16px 16px;
}

.target-deadline { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: #475569; }
.target-deadline svg { width: 16px; height: 16px; color: var(--color-navy); }

.target-status {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.target-status.completed { background: #d1fae5; color: #065f46; border: 1px solid rgba(5, 150, 105, 0.25); }
.target-status.on-track { background: #dbeafe; color: #1e40af; border: 1px solid rgba(30, 64, 175, 0.2); }
.target-status.in-progress { background: #fef9c3; color: #a16207; border: 1px solid rgba(161, 98, 7, 0.2); }
.target-status.at-risk { background: #fef2f2; color: #b91c1c; border: 1px solid rgba(185, 28, 28, 0.2); }

.target-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(39, 55, 77, 0.12); }
</style>
