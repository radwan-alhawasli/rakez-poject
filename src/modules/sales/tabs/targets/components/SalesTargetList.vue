<template>
  <div class="targets-grid">
    <div
      v-for="(target, targetIndex) in displayTargets"
      :key="getTargetStableId(target, targetIndex)"
      class="target-card"
      :class="{
        'target-card-clickable': target.contract_id,
        'target-card-completed': isTargetCompleted(target),
        'target-card--menu-open': openMenuId === getTargetStableId(target, targetIndex),
      }"
      role="button"
      :tabindex="target.contract_id ? 0 : -1"
      @click="onCardClick($event, target)"
      @keydown.enter.prevent="target.contract_id && openUnitsModal(target)"
      @keydown.space.prevent="target.contract_id && openUnitsModal(target)"
    >
      <div class="target-card-surface">
        <!-- شارة إنجاز — شريط علوي أنيق -->
        <div v-if="isTargetCompleted(target)" class="target-card-ribbon" aria-hidden="true">
          <span class="target-card-ribbon__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span class="target-card-ribbon__text">مكتمل</span>
        </div>

        <!-- زر ثلاث نقاط — أعلى يسار البطاقة -->
        <div class="card-menu-wrap" @click.stop>
          <button
            type="button"
            class="card-menu-btn"
            :aria-expanded="openMenuId === getTargetStableId(target, targetIndex)"
            aria-haspopup="true"
            aria-label="خيارات الهدف"
            @click.stop="toggleCardMenu(getTargetStableId(target, targetIndex))"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
          <div v-if="openMenuId === getTargetStableId(target, targetIndex)" class="card-dropdown" @click.stop>
            <button
              v-if="isManager"
              type="button"
              class="card-dropdown-item"
              @click="$emit('assign-marketers', target)"
            >
              إضافة مسوقين للمشروع
            </button>
            <template v-if="canUpdateTarget(target)">
              <div class="card-dropdown-status">
                <span class="card-dropdown-label">تغيير الحالة</span>
                <select
                  :value="target.status || 'new'"
                  class="card-dropdown-select"
                  :disabled="isTargetUpdating(target)"
                  @change="updateTargetStatus(target, $event.target.value)"
                >
                  <option v-for="opt in TARGET_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <button
                v-if="target.status !== 'completed'"
                type="button"
                class="card-dropdown-item card-dropdown-item-done"
                :disabled="isTargetUpdating(target)"
                @click.stop="updateTargetStatus(target, 'completed')"
              >
                جعل منجز (تحقق)
              </button>
            </template>
          </div>
        </div>

        <div class="target-card__core">
          <div class="target-header">
            <div class="target-info">
              <h3 class="target-project-name">{{ target.project_name || 'هدف مبيعات' }}</h3>
              
              <!-- عرض الموقع إن وُجد -->
              <div v-if="target.project_location" class="target-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>
                  {{ target.project_location.city_name || 'الرياض' }} 
                  {{ target.project_location.district_name ? ` - ${target.project_location.district_name}` : '' }}
                </span>
              </div>

              <p class="target-marketer">{{ getTargetAssigneeLine(target, isSalesLeaderView) }}</p>
              <p class="target-marketer target-assigned-units">{{ getAssignedUnitsLine(target, isSalesLeaderView) }}</p>
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
                :class="getTargetStatusClass(target)"
                :style="{ width: getProgressPercentage(target) + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              <span>محقق: {{ formatCurrency(getDisplayedAchievedValue(target)) }}</span>
              <span class="progress-pct">{{ getProgressPercentage(target) }}%</span>
            </div>
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

          <!-- خيار تحديد الحالة للمسوق -->
          <div class="target-card-actions" v-if="canUpdateTarget(target)" @click.stop>
            <button 
              type="button" 
              class="btn-status-toggle" 
              :class="{ 'active': target.status === 'in_progress' }"
              :disabled="isTargetUpdating(target)"
              @click="updateTargetStatus(target, 'in_progress')"
            >
              قيد التنفيذ
            </button>
            <button 
              type="button" 
              class="btn-status-toggle btn-success" 
              :class="{ 'active': target.status === 'completed' }"
              :disabled="isTargetUpdating(target)"
              @click="updateTargetStatus(target, 'completed')"
            >
              مكتمل
            </button>
          </div>
          
          <span v-else class="target-status" :class="getTargetStatusClass(target)">
            {{ target.status_label_ar || getTargetStatusText(target) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  getTargetStableId,
  getTargetAssigneeLine,
  getAssignedUnitsLine,
  isTargetCompleted,
} from '@/modules/sales/tabs/targets/salesTargetsTabDisplay.js';

defineProps({
  displayTargets: {
    type: Array,
    required: true
  },
  openMenuId: {
    type: [String, Number],
    default: null
  },
  isSalesLeaderView: {
    type: Boolean,
    default: false
  },
  isManager: {
    type: Boolean,
    default: false
  },
  isTargetUpdating: {
    type: Function,
    required: true
  },
  getTargetStatusClass: {
    type: Function,
    required: true
  },
  getTargetStatusText: {
    type: Function,
    required: true
  },
  getProgressPercentage: {
    type: Function,
    required: true
  },
  getDisplayedAchievedValue: {
    type: Function,
    required: true
  },
  canUpdateTarget: {
    type: Function,
    required: true
  },
  formatCurrency: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['open-units-modal', 'toggle-card-menu', 'assign-marketers', 'update-target-status']);

const TARGET_STATUS_OPTIONS = [
  { value: 'new', label: 'جديد' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'منجز' },
];

function onCardClick(e, target) {
  if (target.contract_id) emit('open-units-modal', target);
}

function openUnitsModal(target) {
  emit('open-units-modal', target);
}

function toggleCardMenu(id) {
  emit('toggle-card-menu', id);
}

function updateTargetStatus(target, newStatus) {
  emit('update-target-status', target, newStatus);
}
</script>

<style scoped src="../styles/SalesTargetList.scoped.css"></style>
