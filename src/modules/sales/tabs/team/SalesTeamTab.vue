<template>
  <div class="team-tab">
    <header class="team-hero" aria-labelledby="team-hero-title">
      <div class="team-hero-inner">
        <div class="team-hero-title-row">
          <span class="title-icon-wrap" aria-hidden="true">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <div class="team-hero-text">
            <h2 id="team-hero-title" class="team-hero-title">الفريق</h2>
            <p class="team-hero-lead">متابعة أعضاء فريق المبيعات والمشاريع المعينة لهم.</p>
          </div>
        </div>

        <div class="team-tabs team-tabs--hero" role="tablist" aria-label="أقسام الفريق">
          <button
            type="button"
            role="tab"
            class="team-tab-btn"
            :class="{ active: activeTab === 'members' }"
            :aria-selected="activeTab === 'members'"
            @click="activeTab = 'members'"
          >
            أعضاء الفريق
          </button>
          <button
            type="button"
            role="tab"
            class="team-tab-btn"
            :class="{ active: activeTab === 'projects' }"
            :aria-selected="activeTab === 'projects'"
            @click="activeTab = 'projects'"
          >
            مشاريع الفريق
          </button>
        </div>
      </div>
    </header>

    <!-- تبويب أعضاء الفريق -->
    <div v-show="activeTab === 'members'" class="team-tab-panel">
      <div class="team-panel-toolbar">
        <p class="team-panel-hint">قائمة المسوقين؛ فعّل الترتيب بالتوصية لعرض الأنسب أولاً.</p>
        <label class="sort-toggle">
          <input type="checkbox" v-model="teamSortByRecommendation" />
          <span class="sort-toggle__text">ترتيب بالتوصية <span class="sort-toggle__badge">ذكاء اصطناعي</span></span>
        </label>
      </div>

      <LoadingSpinner v-if="isLoadingTeam" :text="teamSortByRecommendation && isLoadingTeamRecommendations ? 'جاري تحميل التوصيات...' : ''" />

      <div v-else-if="teamLoadError" class="empty-state error-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ teamLoadError }}</p>
        <button type="button" class="btn-retry" @click="loadTeamMembers()">إعادة المحاولة</button>
      </div>

      <div v-else-if="teamMembersDisplay.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
        </svg>
        <p>لا يوجد أعضاء في الفريق حالياً.</p>
      </div>

      <div v-else class="team-members-grid">
        <div v-for="member in teamMembersDisplay" :key="member.id" class="member-card">
          <div class="member-avatar-wrap">
            <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="member-image" />
            <div v-else class="member-avatar">{{ (member.name || '?').charAt(0) }}</div>
            <div v-if="teamSortByRecommendation && member.recommendationScore" class="recommendation-badge" title="درجة التوصية">
              {{ Math.round(member.recommendationScore) }}
            </div>
          </div>
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
    <div v-show="activeTab === 'projects'" class="team-tab-panel team-tab-panel--projects">
      <p class="team-panel-hint team-panel-hint--solo">المشاريع المرتبطة بفريق المبيعات والوحدات المتاحة.</p>
      <LoadingSpinner v-if="isLoadingTeamProjects" />

      <div v-else-if="teamProjectsLoadError" class="empty-state error-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ teamProjectsLoadError }}</p>
        <button type="button" class="btn-retry" @click="loadTeamProjects()">إعادة المحاولة</button>
      </div>

      <div v-else-if="teamProjects.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <p>لا توجد مشاريع معينة للفريق حالياً.</p>
      </div>

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
  teamLoadError, teamProjectsLoadError,
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
