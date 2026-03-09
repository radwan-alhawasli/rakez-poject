<template>
  <div class="team-tab">
    <div class="team-tabs">
      <button
        type="button"
        class="team-tab-btn"
        :class="{ active: activeTab === 'members' }"
        @click="activeTab = 'members'"
      >
        أعضاء الفريق
      </button>
      <button
        type="button"
        class="team-tab-btn"
        :class="{ active: activeTab === 'projects' }"
        @click="activeTab = 'projects'"
      >
        مشاريع الفريق
      </button>
    </div>

    <!-- تبويب أعضاء الفريق -->
    <div v-show="activeTab === 'members'" class="team-tab-panel">
      <div class="team-section-header">
        <h3 class="panel-title">أعضاء الفريق</h3>
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
            <p class="member-role">{{ member.role || 'عضو فريق' }}</p>
            <div class="member-stats">
              <span class="member-stat"><strong>{{ member.total_sales ?? 0 }}</strong> مبيعة</span>
              <span class="member-stat">{{ formatCurrency(member.total_value ?? 0) }}</span>
            </div>

            <!-- تقييم بالنجوم -->
            <div v-if="hasPermission('sales.team.manage')" class="member-rating-section">
              <div class="member-rating">
                <span class="rating-label">التقييم</span>
                <div class="star-rating">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="star-btn"
                    :class="{ filled: star <= (member.rating || 0), saving: memberRatingSaving === member.id }"
                    :disabled="memberRatingSaving === member.id"
                    :aria-label="'تقييم ' + star + ' من 5'"
                    @click="setMemberRating(member.id, star)"
                  >
                    <svg viewBox="0 0 24 24" :fill="star <= (member.rating || 0) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- عرض التعليق الحالي أو زر إضافة تعليق -->
              <div class="member-comment-section">
                <template v-if="memberCommentEditId === member.id">
                  <textarea
                    v-model="memberCommentDrafts[member.id]"
                    class="comment-textarea"
                    placeholder="اكتب تعليقك عن أداء الموظف..."
                    rows="3"
                    maxlength="2000"
                  ></textarea>
                  <div class="comment-actions">
                    <button type="button" class="btn-comment-save" :disabled="memberRatingSaving === member.id" @click="saveMemberComment(member)">
                      {{ memberRatingSaving === member.id ? 'جاري الحفظ...' : 'حفظ التعليق' }}
                    </button>
                    <button type="button" class="btn-comment-cancel" @click="cancelMemberComment">إلغاء</button>
                  </div>
                </template>
                <template v-else>
                  <p v-if="member.comment" class="member-comment-text">
                    <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {{ member.comment }}
                  </p>
                  <button type="button" class="btn-add-comment" @click="openMemberComment(member)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    {{ member.comment ? 'تعديل التعليق' : 'إضافة تعليق' }}
                  </button>
                </template>
              </div>
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

    <!-- تبويب مشاريع الفريق -->
    <div v-show="activeTab === 'projects'" class="team-tab-panel">
      <h3 class="panel-title">مشاريع الفريق</h3>
      <LoadingSpinner v-if="isLoadingTeamProjects" />
      <div v-else class="team-projects-grid">
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
import { ref } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';

const activeTab = ref('members');

const {
  teamMembersDisplay, teamProjects, isLoadingTeam,
  isLoadingTeamProjects, isLoadingTeamRecommendations,
  teamSortByRecommendation, memberToRemove, memberRemoveLoading,
  memberRatingSaving, memberCommentEditId, memberCommentDrafts,
  hasPermission, formatCurrency,
  loadTeamMembers, loadTeamProjects,
  setMemberRating, openMemberComment, cancelMemberComment, saveMemberComment,
  confirmRemoveMember, cancelRemoveMember, doRemoveMember,
} = useSalesTeam();

loadTeamMembers();
loadTeamProjects();
</script>

<style scoped>
.team-tab {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 4px;
  direction: rtl;
}

/* شريط التبويبات */
.team-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: rgba(39, 55, 77, 0.06);
  border-radius: var(--radius-md, 14px);
  border: 1px solid rgba(39, 55, 77, 0.08);
  width: fit-content;
}

.team-tab-btn {
  padding: 12px 24px;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-navy);
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.team-tab-btn:hover {
  background: rgba(39, 55, 77, 0.06);
  color: var(--color-navy);
}

.team-tab-btn.active {
  background: var(--color-white);
  color: var(--color-navy);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.team-tab-panel {
  animation: panel-fade 0.2s ease-out;
}

@keyframes panel-fade {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.panel-title,
.team-section-header .panel-title {
  margin: 0 0 20px 0;
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  color: var(--color-navy);
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(39, 55, 77, 0.12);
}

.team-section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.team-section-header .panel-title {
  margin: 0;
  padding-bottom: 0;
  border-bottom: none;
  flex: 1 1 auto;
  min-width: 0;
}

.sort-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: clamp(0.8125rem, 2vw, 0.875rem);
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

/* شبكة الأعضاء — موحدة ومنتظمة */
.team-members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (min-width: 600px) {
  .team-members-grid {
    gap: 24px;
  }
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 20px;
  background: var(--color-white);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: var(--radius-md, 14px);
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.06);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  min-width: 0;
}

.member-card:hover {
  box-shadow: 0 8px 24px rgba(39, 55, 77, 0.1);
  border-color: rgba(181, 169, 154, 0.35);
  transform: translateY(-3px);
}

.member-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 14px;
  flex-shrink: 0;
}

.member-info {
  width: 100%;
  min-width: 0;
}

.member-info h4 {
  margin: 0 0 6px 0;
  font-size: 1rem;
  color: var(--color-navy);
  font-weight: 700;
  line-height: 1.3;
  word-break: break-word;
}

.member-role {
  margin: 0 0 12px 0;
  font-size: 0.8125rem;
  color: var(--color-dark-gray);
  line-height: 1.4;
}

.member-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 20px;
  font-size: 0.8125rem;
  color: #475569;
  margin-bottom: 0;
}

.member-stat {
  white-space: nowrap;
}

.member-stat strong {
  color: var(--color-navy);
  font-weight: 700;
}

.member-actions {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(39, 55, 77, 0.08);
  width: 100%;
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

.team-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.team-project-card {
  padding: 20px;
  background: var(--color-white);
  border: 1px solid rgba(39, 55, 77, 0.1);
  border-radius: var(--radius-md, 14px);
  box-shadow: 0 2px 12px rgba(39, 55, 77, 0.06);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.team-project-card:hover {
  box-shadow: 0 6px 20px rgba(39, 55, 77, 0.08);
  border-color: rgba(181, 169, 154, 0.25);
}

.team-project-card h4 {
  margin: 0 0 14px 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-navy);
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(39, 55, 77, 0.08);
}

.project-stats {
  display: grid;
  gap: 10px;
}

.project-stats .stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.project-stats .label {
  color: var(--color-dark-gray);
}

.project-stats .value {
  color: var(--color-navy);
  font-weight: 700;
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
