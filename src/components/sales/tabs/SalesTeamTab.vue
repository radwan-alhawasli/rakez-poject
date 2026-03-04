<template>
  <div class="team-tab">
    <div class="team-sections">
      <!-- Team Members -->
      <div class="team-section">
        <div class="team-section-header">
          <h3>أعضاء الفريق</h3>
          <label class="sort-toggle">
            <input type="checkbox" v-model="teamSortByRecommendation" />
            <span>ترتيب بالتوصية (ذكاء اصطناعي)</span>
          </label>
        </div>

        <LoadingSpinner v-if="isLoadingTeam" :text="teamSortByRecommendation && isLoadingTeamRecommendations ? 'جاري تحميل التوصيات...' : ''" />

        <div v-else class="team-members-grid">
          <div v-for="member in teamMembersDisplay" :key="member.id" class="member-card">
            <div class="member-avatar">{{ (member.name || '?').charAt(0) }}</div>
            <div class="member-info">
              <h4>{{ member.name }}</h4>
              <p>{{ member.role || 'عضو فريق' }}</p>
              <div class="member-stats">
                <span>{{ member.total_sales || 0 }} مبيعة</span>
                <span>{{ formatCurrency(member.total_value || 0) }}</span>
              </div>
              <div class="member-actions" v-if="hasPermission('sales.team.manage')">
                <button
                  type="button"
                  class="btn-remove-member"
                  :disabled="memberRemoveLoading === member.id"
                  @click="confirmRemoveMember(member)"
                >
                  إقالة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Projects -->
      <div class="team-section">
        <h3>مشاريع الفريق</h3>
        <LoadingSpinner v-if="isLoadingTeamProjects" />
        <div v-else class="team-projects-list">
          <div v-for="project in teamProjects" :key="project.id" class="team-project-card">
            <h4>{{ project.project_name }}</h4>
            <div class="project-stats">
              <div class="stat">
                <span class="label">الوحدات المتاحة:</span>
                <span class="value">{{ project.available_units }}</span>
              </div>
              <div class="stat">
                <span class="label">المبيعات:</span>
                <span class="value">{{ project.total_sales }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Remove Modal -->
    <div v-if="memberToRemove" class="modal-overlay" @click.self="cancelRemoveMember">
      <div class="modal-content small">
        <h3>تأكيد إخراج العضو من الفريق</h3>
        <p>هل أنت متأكد من إخراج <strong>{{ memberToRemove.name }}</strong> من الفريق؟</p>
        <div class="modal-actions">
          <button type="button" class="btn-text" @click="cancelRemoveMember">إلغاء</button>
          <button type="button" class="btn-primary danger" :disabled="!!memberRemoveLoading" @click="doRemoveMember">
            {{ memberRemoveLoading ? 'جاري...' : 'إقالة وإخراج من الفريق' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';

const {
  teamMembersDisplay, teamProjects, isLoadingTeam,
  isLoadingTeamProjects, isLoadingTeamRecommendations,
  teamSortByRecommendation, memberToRemove, memberRemoveLoading,
  hasPermission, formatCurrency,
  loadTeamMembers, loadTeamProjects,
  confirmRemoveMember, cancelRemoveMember, doRemoveMember,
} = useSalesTeam();

loadTeamMembers();
loadTeamProjects();
</script>

<style scoped>
/* تنسيقات الفريق — من الأب SalesViewExtended */
.team-tab {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4px;
  direction: rtl;
}

.team-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
}

@media (min-width: 900px) {
  .team-sections {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

.team-section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.team-section-header h3 {
  margin: 0;
  font-size: clamp(18px, 4vw, 20px);
  color: var(--color-navy);
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-medium-gray);
  flex: 1 1 auto;
  min-width: 0;
}

.sort-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(13px, 2.5vw, 14px);
  color: var(--color-dark-gray);
  cursor: pointer;
  flex-shrink: 0;
}

.sort-toggle input {
  width: 18px;
  height: 18px;
  min-width: 18px;
  cursor: pointer;
}

.team-section h3 {
  margin: 0 0 20px 0;
  font-size: clamp(18px, 4vw, 20px);
  color: var(--color-navy);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-medium-gray);
}

.team-members-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 520px) {
  .team-members-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }
}

@media (min-width: 768px) {
  .team-members-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1100px) {
  .team-members-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
  }
}

.member-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px;
  background: var(--color-white);
  border: 1px solid var(--color-medium-gray);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  min-width: 0;
}

.member-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-2px);
}

.member-avatar {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-info h4 {
  margin: 0 0 4px 0;
  font-size: clamp(15px, 3vw, 16px);
  color: var(--color-navy);
  font-weight: 600;
  line-height: 1.3;
  word-break: break-word;
}

.member-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--color-dark-gray);
  line-height: 1.4;
}

.member-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
}

.member-actions {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.btn-remove-member {
  padding: 8px 14px;
  font-size: 13px;
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  min-height: 40px;
}

.btn-remove-member:hover:not(:disabled) {
  background: rgba(185, 28, 28, 0.15);
  color: #991b1b;
}

.btn-remove-member:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.team-projects-list {
  display: grid;
  gap: 12px;
}

.team-project-card {
  padding: 16px;
  background: var(--color-light-gray);
  border-radius: 12px;
  border: 1px solid var(--color-medium-gray);
}

.team-project-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--color-navy);
}

.project-stats {
  display: grid;
  gap: 8px;
}

.project-stats .stat {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.project-stats .label {
  color: var(--color-dark-gray);
}

.project-stats .value {
  color: var(--color-navy);
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-white);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.modal-content.small {
  max-width: 420px;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: var(--color-navy);
}

.modal-content p {
  margin: 0 0 20px 0;
  color: var(--color-dark-gray);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-text {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--color-medium-gray);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  color: var(--color-dark-gray);
  transition: all 0.2s;
}

.btn-text:hover {
  background: var(--color-light-gray);
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  transition: all 0.3s ease;
}

.modal-actions .btn-primary.danger {
  background: #b91c1c;
  color: white;
  border: 1px solid #b91c1c;
}

.modal-actions .btn-primary.danger:hover:not(:disabled) {
  background: #991b1b;
}

.modal-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
