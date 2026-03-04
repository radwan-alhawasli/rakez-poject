<template>
  <div class="tab-content">
    <div class="tracker-header-simple" style="margin-bottom: 25px">
      <h2 style="font-family: 'Amiri', serif; color: #1e3a5f; margin-bottom: 10px">
        فرق التسويق
      </h2>
      <p style="color: #64748b">إدارة الصلاحيات والوصول لفرق التسويق على هذا المشروع.</p>
    </div>

    <div class="teams-container" style="display: grid; gap: 30px">
      <!-- Add Team Card -->
      <div
        class="add-team-card"
        style="
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8f 100%);
          padding: 25px;
          border-radius: 16px;
          color: white;
          box-shadow: 0 10px 25px -5px rgba(30, 58, 95, 0.3);
        "
      >
        <h4
          style="
            margin: 0 0 15px 0;
            font-size: 18px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 10px;
          "
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            style="vertical-align: text-bottom; margin-left: 8px"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          إضافة فريق جديد
        </h4>

        <div class="add-team-form" style="display: flex; gap: 15px; align-items: center">
          <div style="flex: 1; position: relative">
            <select v-model="selectedTeamId" class="glass-select">
              <option value="" disabled selected>اختر الفريق من القائمة...</option>
              <option
                v-for="team in availableTeams"
                :key="team.id"
                :value="team.id"
                style="color: #1e3a5f"
              >
                {{ team.name }}
              </option>
            </select>
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="white"
              stroke-width="2"
              fill="none"
              class="select-arrow"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <button
            class="glass-btn"
            @click="assignTeam"
            :disabled="!selectedTeamId || isTeamActionLoading"
          >
            {{ isTeamActionLoading ? 'جاري الإضافة...' : 'إضافة الفريق +' }}
          </button>
        </div>
      </div>

      <!-- Assigned Teams Grid -->
      <div class="assigned-teams-section">
        <h4
          style="
            color: #1e3a5f;
            margin-bottom: 15px;
            font-weight: bold;
            border-left: 4px solid #b1a28f;
            padding-left: 10px;
          "
        >
          الفرق المعينة حالياً
        </h4>

        <div v-if="assignedTeamsLoading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div
          v-else-if="assignedTeams.length === 0"
          class="empty-state"
          style="
            background: #f8fafc;
            border: 2px dashed #e2e8f0;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
          "
        >
          <svg
            viewBox="0 0 24 24"
            width="48"
            height="48"
            stroke="#94a3b8"
            stroke-width="1.5"
            fill="none"
            style="margin-bottom: 15px"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p style="color: #64748b; margin: 0">لا توجد فرق معينة لهذا المشروع حتى الآن.</p>
        </div>

        <div
          v-else
          class="teams-grid-luxury"
          style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          "
        >
          <div v-for="team in assignedTeams" :key="team.id" class="team-card-luxury">
            <div class="team-avatar">
              <span>{{ team.name.charAt(0) }}</span>
            </div>
            <div class="team-info">
              <h3>{{ team.name }}</h3>
              <p>{{ team.description || 'فريق تسويق معتمد' }}</p>
            </div>
            <button
              class="btn-remove"
              @click="removeTeam(team)"
              title="إنهاء تعيين الفريق"
              :disabled="isTeamActionLoading"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :type="confirmModalConfig.type"
      :confirm-text="confirmModalConfig.confirmText"
      @confirm="onConfirmModalConfirm"
      @close="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import { useProjectTeams } from '@/composables/project/useProjectTeams';

const props = defineProps({
  projectId: { type: [String, Number], required: true },
});

const {
  assignedTeams,
  availableTeams,
  selectedTeamId,
  assignedTeamsLoading,
  isTeamActionLoading,
  showConfirmModal,
  confirmModalConfig,
  onConfirmModalConfirm,
  loadTeams,
  assignTeam,
  removeTeam,
} = useProjectTeams(props.projectId);

onMounted(() => {
  loadTeams();
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

.glass-select {
  width: 100%;
  padding: 12px 15px;
  padding-left: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: #1e3a5f;
  outline: none;
  appearance: none;
  cursor: pointer;
  font-weight: 500;
}
.select-arrow {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  stroke: #1e3a5f;
}
.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(5px);
}
.glass-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}
.glass-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.team-card-luxury {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.team-card-luxury::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #b1a28f;
  opacity: 0;
  transition: opacity 0.3s;
}
.team-card-luxury:hover {
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
  transform: translateY(-3px);
}
.team-card-luxury:hover::before {
  opacity: 1;
}
.team-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #64748b;
  flex-shrink: 0;
}
.team-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1e293b;
}
.team-info p {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
}
.btn-remove {
  margin-right: auto;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid #fee2e2;
  background: #fff5f5;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}
.team-card-luxury:hover .btn-remove {
  opacity: 1;
}
.btn-remove:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

@media (max-width: 576px) {
  .glass-select { min-height: 44px; }
  .glass-btn {
    min-height: 44px;
    padding: 12px 20px;
  }
  .team-card-luxury { padding: 14px; }
  .team-avatar {
    width: 42px;
    height: 42px;
    font-size: 16px;
  }
  .team-info h3 { font-size: 14px; }
  .team-info p { font-size: 12px; }
  .btn-remove {
    opacity: 1;
    width: 44px;
    height: 44px;
  }
}
</style>
