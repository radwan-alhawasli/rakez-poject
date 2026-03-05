<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content large">
      <h3>تعيين فريق تسويق</h3>
      <p v-if="project" style="color: #64748b; margin-bottom: 20px">
        المشروع: {{ project.name }}
      </p>

      <div class="assign-team-row">
        <div class="select-wrapper">
          <select :value="selectedTeamId" @change="$emit('update:selected-team-id', $event.target.value)" class="form-input">
            <option value="">-- اختر فريقًا --</option>
            <option v-for="team in availableTeams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>
        <button
          type="button"
          class="btn-primary"
          @click="$emit('assign-submit')"
          :disabled="!selectedTeamId || actionLoading"
        >
          {{ actionLoading ? 'جاري الإضافة...' : 'إضافة الفريق' }}
        </button>
      </div>

      <h4 class="assign-team-subtitle">الفرق المعينة حالياً</h4>
      <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
      <div v-else-if="assignedTeams.length === 0" class="empty-state small">
        <p>لا توجد فرق معينة لهذا المشروع.</p>
      </div>
      <div v-else class="assigned-teams-list">
        <div v-for="team in assignedTeams" :key="team.id" class="assigned-team-item">
          <span>{{ team.name }}</span>
          <button
            type="button"
            class="btn-remove-small"
            @click="$emit('remove-team', team)"
            :disabled="actionLoading"
            title="إزالة الفريق"
          >
            ×
          </button>
        </div>
      </div>

      <button class="close-modal-btn" style="margin-top: 20px" @click="$emit('close')">
        إغلاق
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  project: { type: Object, default: null },
  assignedTeams: { type: Array, default: () => [] },
  availableTeams: { type: Array, default: () => [] },
  selectedTeamId: { type: [String, Number], default: '' },
  loading: { type: Boolean, default: false },
  actionLoading: { type: Boolean, default: false },
});

defineEmits(['close', 'assign-submit', 'remove-team', 'update:selected-team-id']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content.large {
  max-width: 700px;
}

.btn-primary {
  background: #b1a28f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.btn-primary:hover {
  background: #8c7851;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.assign-team-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.assign-team-row .select-wrapper {
  flex: 1;
  min-width: 200px;
}
.assign-team-row .form-input {
  width: 100%;
}
.assign-team-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: #1e3a5f;
  margin: 0 0 12px 0;
  border-right: 4px solid #b1a28f;
  padding-right: 10px;
}
.assigned-teams-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.assigned-team-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.assigned-team-item span {
  font-weight: 500;
  color: #1e293b;
}
.btn-remove-small {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-remove-small:hover:not(:disabled) {
  background: #fecaca;
}
.btn-remove-small:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
.empty-state.small {
  padding: 20px;
  font-size: 14px;
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
  to {
    transform: rotate(360deg);
  }
}

.close-modal-btn {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 992px) {
  .modal-content.large {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 24px;
    border-radius: 14px;
  }
  .assign-team-row {
    flex-direction: column;
  }
  .assign-team-row .select-wrapper {
    width: 100%;
    min-width: unset;
  }
  .assign-team-row .btn-primary {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
}

@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    padding: 20px;
    max-height: 85vh;
  }
  .modal-content h3 {
    font-size: 18px;
  }
  .close-modal-btn {
    min-height: 44px;
  }
}

@media (max-width: 320px) {
  .modal-content {
    padding: 16px;
  }
}

@media (min-width: 1920px) {
  .modal-content {
    padding: 40px;
  }
}
</style>
