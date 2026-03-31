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

<style scoped src="./styles/SalesTeamTab.scoped.s1.css"></style>
<style scoped src="./styles/SalesTeamTab.scoped.s2.css"></style>
