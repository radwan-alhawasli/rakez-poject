<template>
  <div class="tab-content">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
    <template v-else>
      <!-- Tracker Header (design match) -->
      <div class="tracker-header-box">
        <h2 class="tracker-title">متتبع حالة المشروع</h2>
        <p class="tracker-desc">
          {{ isSalesUser ? 'عرض تقدم المشروع فقط — لا توجد نماذج للتعديل.' : 'أكمل جميع المراحل لتمكين إضافة الوحدات. اضغط على مرحلة لإدخال بياناتها.' }}
        </p>
        <div class="progress-indicator">
          <span class="progress-label">التقدم</span>
          <span class="progress-val">{{ completedStages }}/{{ stages.length }}</span>
        </div>
      </div>

      <!-- Stepper -->
      <Stepper v-model="activeStageIndex" :steps="stages" />

      <!-- Stage details card — hidden for sales users -->
      <div v-if="!isSalesUser" class="stage-content-area">
        <h3 class="stage-section-title">تفاصيل المرحلة: {{ stages[activeStageIndex].name }}</h3>
        <p class="stage-section-subtitle">
          {{
            stages[activeStageIndex].apiKey === 'advertiser_section_url'
              ? 'يرجى تقديم رقم المعلن والتاريخ لهذه المرحلة.'
              : 'يرجى تقديم الرابط والتاريخ لهذه المرحلة.'
          }}
        </p>
        <div class="input-group">
          <label>{{ stages[activeStageIndex].inputLabel || 'رابط المستند' }}</label>
          <div class="input-wrapper">
            <input
              :type="stages[activeStageIndex].inputType || 'text'"
              v-model="stages[activeStageIndex].value"
              class="form-input"
              :placeholder="stages[activeStageIndex].placeholder || 'https://example.com/document'"
              :disabled="stages[activeStageIndex].status === 'completed'"
            />
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </span>
          </div>
        </div>
        <div class="input-group">
          <label>تاريخ الإدخال</label>
          <div class="input-wrapper">
            <input
              type="date"
              v-model="stages[activeStageIndex].entryDate"
              class="form-input"
              :disabled="stages[activeStageIndex].status === 'completed'"
            />
            <span class="input-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <button
            v-if="stages[activeStageIndex].status !== 'completed'"
            class="update-btn"
            @click="saveProgress"
          >
            حفظ وتحديد كمكتمل
          </button>
          <button
            v-else
            class="update-btn secondary"
            @click="stages[activeStageIndex].status = 'pending'"
          >
            تعديل الربط
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Stepper from '@/components/ui/Stepper.vue';
import { useProjectProgress } from '@/composables/project/useProjectProgress';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  isSalesUser: { type: Boolean, default: false },
  projectProgress: { type: Object, default: null },
});

const emit = defineEmits(['tracker-completed']);

const {
  isLoading,
  stages,
  activeStageIndex,
  completedStages,
  saveProgress,
  loadProgress,
} = useProjectProgress(props.projectId, {
  onTrackerFullyCompleted: () => emit('tracker-completed'),
});

onMounted(() => {
  loadProgress(props.projectProgress);
});
</script>

<style scoped>
.loading-state {
  padding: 100px;
  text-align: center;
  color: #94a3b8;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.tracker-header-box {
  margin-bottom: 50px;
  position: relative;
}
.tracker-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 10px 0;
}
.tracker-desc {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}
.progress-indicator {
  position: absolute;
  right: 0;
  top: 5px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.progress-label {
  font-size: 12px;
  color: #94a3b8;
}
.progress-val {
  font-size: 16px;
  font-weight: 700;
  color: #b1a28f;
}
.stage-content-area {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}
.stage-section-title {
  color: #1e3a5f;
  font-size: 18px;
  margin: 0 0 8px 0;
}
.stage-section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}
.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: #64748b;
}
.documents-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  margin: 30px auto 0;
}
.documents-card-title {
  color: #1e3a5f;
  font-size: 18px;
  margin: 0 0 20px 0;
}
.documents-update-btn {
  margin-top: 16px;
  background: #4a3d3c;
  color: white;
}
.input-group label {
  display: block;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm);
  background: #f8fafc;
  color: #1e293b;
  transition: border-color 0.2s;
}
.form-input:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}
.form-input:focus {
  outline: none;
  border-color: #b1a28f;
  background: white;
}
.update-btn {
  margin-top: 20px;
  background: #8e7d5c;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
}
.update-btn.secondary {
  background: #64748b;
}

@media (max-width: 768px) {
  .stage-content-area,
  .documents-card {
    padding: 20px;
    max-width: 100%;
  }
  .stage-section-title { font-size: 16px; }
  .tracker-title { font-size: 20px; }
  .tracker-desc { font-size: 13px; }
}
@media (max-width: 576px) {
  .stage-content-area,
  .documents-card {
    padding: 16px;
    border-radius: 10px;
  }
  .stage-section-title { font-size: 15px; }
  .stage-section-subtitle { font-size: 13px; }
  .tracker-title { font-size: 18px; }
  .progress-indicator {
    position: static;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }
  .tracker-header-box { margin-bottom: 30px; }
  .form-input {
    padding: 10px 12px;
    min-height: 44px;
  }
  .update-btn {
    padding: 12px 20px;
    min-height: 44px;
    width: 100%;
  }
}
@media (max-width: 320px) {
  .tracker-title { font-size: 16px; }
  .stage-content-area,
  .documents-card { padding: 12px; }
}
@media (min-width: 1920px) {
  .tracker-title { font-size: 28px; }
  .tracker-desc { font-size: 17px; }
  .stage-content-area,
  .documents-card {
    padding: 40px;
    max-width: 900px;
  }
  .stage-section-title { font-size: 22px; }
}
</style>
