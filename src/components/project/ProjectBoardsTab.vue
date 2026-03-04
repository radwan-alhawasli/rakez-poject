<template>
  <div class="tab-content">
    <div class="tracker-header-box">
      <h2 class="tracker-title">اللوحات</h2>
      <h3 class="tracker-subtitle">{{ projectName }}</h3>
      <p class="tracker-desc">إدارة لوحات المشروع وإضافة تفاصيل الوحدات.</p>
    </div>

    <div class="boards-content-area">
      <!-- Pending State: Premium CTA -->
      <div v-if="boardsTabState === 'pending'" class="board-cta-container">
        <div class="board-cta-card">
          <div class="cta-icon">
            <svg viewBox="0 0 24 24" fill="none" class="animate-pulse">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M9 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M15 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 9H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M3 15H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <h3 class="cta-title">إعداد لوحات المشروع</h3>
          <p class="cta-description">
            ابدأ بإعداد اللوحات والمخططات لهذا المشروع. سيتم إنشاء سجل اللوحات تلقائياً.
          </p>

          <button class="cta-btn-premium" @click="saveBoard" :disabled="isBoardSaving">
            <span v-if="!isBoardSaving">تأكيد وبدء اللوحات</span>
            <span v-else>جاري الإعداد...</span>
            <svg
              v-if="!isBoardSaving"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 5 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Completed State: Data View -->
      <div v-else class="board-completed-view">
        <div class="completed-info-card">
          <div class="success-header">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <h3>تم إضافة اللوحات بنجاح</h3>
          </div>
          <div class="details-summary">
            <p>تم حفظ تفاصيل لوحات المشروع وهي متاحة الآن في النظام.</p>
            <button class="btn-text" @click="boardsTabState = 'pending'">
              تعديل البيانات
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProjectBoards } from '@/composables/project/useProjectBoards';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  projectName: { type: String, default: '' },
});

const {
  boardsTabState,
  isBoardSaving,
  loadBoards,
  saveBoard,
} = useProjectBoards(props.projectId, props.projectName);

onMounted(() => {
  loadBoards();
});
</script>

<style scoped>
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
.board-cta-container {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
.board-cta-card {
  background: white;
  padding: 50px;
  border-radius: 24px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(177, 162, 143, 0.2);
  text-align: center;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.board-cta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #1e3a5f, #b1a28f, #1e3a5f);
}
.cta-icon {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: #b1a28f;
  border: 1px solid #e2e8f0;
}
.cta-icon svg {
  width: 40px;
  height: 40px;
}
.cta-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a5f;
  margin-bottom: 12px;
}
.cta-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 35px;
  font-size: 15px;
}
.cta-btn-premium {
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px -5px rgba(30, 58, 95, 0.25);
}
.cta-btn-premium:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px -5px rgba(30, 58, 95, 0.35);
  background: linear-gradient(135deg, #2c3e50 0%, #1e3a5f 100%);
}
.cta-btn-premium:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}
.animate-pulse {
  animation: pulse 3s infinite;
}
@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.board-completed-view {
  padding: 40px 20px;
  text-align: center;
}
.completed-info-card {
  background: white;
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid #e2e8f0;
  max-width: 500px;
  margin: 0 auto;
}
.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #10b981;
  margin-bottom: 20px;
}
.success-header h3 {
  margin: 0;
  font-size: 20px;
}
.details-summary p {
  color: #64748b;
  margin-bottom: 20px;
}
.btn-text {
  background: none;
  border: none;
  color: #b1a28f;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

@media (max-width: 768px) {
  .board-cta-card {
    padding: 30px 20px;
    max-width: 100%;
  }
  .cta-title { font-size: 20px; }
  .cta-description { font-size: 14px; }
  .completed-info-card {
    padding: 24px;
    max-width: 100%;
  }
}
@media (max-width: 576px) {
  .board-cta-card {
    padding: 24px 16px;
    border-radius: 16px;
  }
  .cta-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }
  .cta-icon svg {
    width: 32px;
    height: 32px;
  }
  .cta-title { font-size: 18px; }
  .cta-description {
    font-size: 13px;
    margin-bottom: 24px;
  }
  .cta-btn-premium {
    padding: 14px 24px;
    font-size: 14px;
    min-height: 44px;
  }
}
@media (max-width: 320px) {
  .board-cta-card { padding: 20px 12px; }
  .cta-title { font-size: 16px; }
  .cta-btn-premium {
    font-size: 13px;
    padding: 12px 16px;
  }
}
@media (min-width: 1920px) {
  .board-cta-card {
    padding: 60px;
    max-width: 520px;
  }
  .cta-title { font-size: 28px; }
  .cta-description { font-size: 17px; }
}
</style>
