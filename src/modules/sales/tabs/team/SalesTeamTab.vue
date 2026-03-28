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

/* شريط التبويبات — وضوح أعلى + هوية راكز */
.team-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: clamp(22px, 3vw, 32px);
  padding: 8px;
  width: 100%;
  max-width: 520px;
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(248, 250, 252, 0.38) 50%,
    rgba(255, 255, 255, 0.4) 100%
  );
  backdrop-filter: blur(10px) saturate(1.02);
  -webkit-backdrop-filter: blur(10px) saturate(1.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.55) inset,
    0 8px 28px -12px rgba(15, 23, 42, 0.12);
}

.team-tab-btn {
  flex: 1 1 auto;
  min-width: min(100%, 10rem);
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-dark-gray, #64748b);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.team-tab-btn:hover:not(.active) {
  color: var(--color-navy, #27374d);
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(226, 232, 240, 0.6);
}

.team-tab-btn.active {
  color: var(--color-navy, #27374d);
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(39, 55, 77, 0.12);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
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
  font-size: clamp(1.05rem, 2.2vw, 1.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-navy, #27374d);
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(196, 165, 116, 0.32);
  background: linear-gradient(
    145deg,
    rgba(255, 253, 248, 0.94) 0%,
    rgba(250, 246, 238, 0.88) 45%,
    rgba(255, 255, 255, 0.82) 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 6px 20px -12px rgba(15, 23, 42, 0.12);
}

.team-section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: clamp(18px, 2.5vw, 24px);
}

.team-section-header .panel-title {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
}

.sort-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-navy, #27374d);
  cursor: pointer;
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(39, 55, 77, 0.1);
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
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: clamp(18px, 2.5vw, 26px);
}

.member-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 26px 22px 22px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 55, 77, 0.14);
  border-radius: 16px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 10px 36px -14px rgba(15, 23, 42, 0.14);
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  min-width: 0;
}

.member-card:hover {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 16px 44px -16px rgba(15, 23, 42, 0.18);
  border-color: rgba(181, 169, 154, 0.45);
  transform: translateY(-2px);
}

.member-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--color-navy-dark, #1a2636) 0%, var(--color-navy, #27374d) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(39, 55, 77, 0.22);
}

.member-info {
  width: 100%;
  min-width: 0;
}

.member-info h4 {
  margin: 0 0 8px 0;
  font-size: 1.0625rem;
  color: var(--color-navy, #27374d);
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
  letter-spacing: -0.02em;
}

.member-role {
  margin: 0 0 14px 0;
  font-size: 0.875rem;
  color: var(--color-dark-gray, #64748b);
  line-height: 1.4;
  font-weight: 600;
}

.member-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 12px;
  font-size: 0.8125rem;
  color: var(--color-charcoal, #1e293b);
  margin-bottom: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.9);
  width: 100%;
  box-sizing: border-box;
}

.member-stat {
  white-space: nowrap;
}

.member-stat strong {
  color: var(--color-navy, #27374d);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

/* تقييم ونجوم — كانت بدون أنماط تقريباً */
.member-rating-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(39, 55, 77, 0.1);
  width: 100%;
  text-align: right;
}

.member-rating {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-bottom: 12px;
}

.rating-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-navy, #27374d);
  letter-spacing: 0.02em;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 4px;
  direction: ltr;
}

.star-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.9);
  color: #cbd5e1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.star-btn svg {
  width: 22px;
  height: 22px;
}

.star-btn:hover:not(:disabled) {
  background: rgba(254, 243, 199, 0.6);
  color: #f59e0b;
  transform: scale(1.06);
}

.star-btn.filled {
  color: #f59e0b;
  background: rgba(254, 243, 199, 0.45);
}

.star-btn.saving {
  opacity: 0.55;
  pointer-events: none;
}

.member-comment-section {
  margin-top: 4px;
}

.member-comment-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 10px 0;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-charcoal, #1e293b);
  background: rgba(241, 245, 249, 0.95);
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  text-align: right;
}

.comment-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  color: var(--color-navy, #27374d);
  opacity: 0.65;
}

.btn-add-comment {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-navy, #27374d);
  background: transparent;
  border: 1px dashed rgba(39, 55, 77, 0.25);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.btn-add-comment:hover {
  background: rgba(39, 55, 77, 0.06);
  border-color: var(--color-gold, #b5a99a);
  color: var(--color-navy-dark, #1a2636);
}

.comment-textarea {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 10px;
  border: 1px solid rgba(39, 55, 77, 0.18);
  background: rgba(255, 255, 255, 0.98);
  color: var(--color-charcoal, #1e293b);
  resize: vertical;
  min-height: 72px;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-gold, #b5a99a);
  box-shadow: 0 0 0 2px rgba(181, 169, 154, 0.25);
}

.comment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.btn-comment-save {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-navy, #27374d) 0%, var(--color-navy-dark, #1a2636) 100%);
  box-shadow: 0 2px 10px rgba(39, 55, 77, 0.25);
}

.btn-comment-save:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-comment-cancel {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray, #64748b);
  background: rgba(248, 250, 252, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 10px;
  cursor: pointer;
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
  padding: 22px 20px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(39, 55, 77, 0.14);
  border-radius: 16px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 10px 32px -14px rgba(15, 23, 42, 0.12);
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}

.team-project-card:hover {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.85) inset,
    0 14px 40px -14px rgba(15, 23, 42, 0.16);
  border-color: rgba(181, 169, 154, 0.4);
  transform: translateY(-2px);
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
