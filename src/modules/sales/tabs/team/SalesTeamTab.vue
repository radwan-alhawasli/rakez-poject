<template>
  <div class="team-tab">
    <div class="team-tabs">
      <button v-for="t in tabs" :key="t.id" class="team-tab-btn" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">{{ t.label }}</button>
    </div>

    <!-- Members Tab -->
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
        <TeamMemberCard
          v-for="member in teamMembersDisplay" :key="member.id"
          :member="member"
          :can-manage="hasPermission('sales.team.manage')"
          :is-saving="memberRatingSaving === member.id"
          :is-removing="memberRemoveLoading === member.id"
          :is-editing-comment="memberCommentEditId === member.id"
          :comment-draft="memberCommentDrafts[member.id]"
          :format-currency="formatCurrency"
          @rate="setMemberRating(member.id, $event)"
          @edit-comment="openMemberComment(member)"
          @update:comment-draft="patchMemberCommentDraft(member.id, $event)"
          @save-comment="saveMemberComment(member, $event)"
          @cancel-comment="cancelMemberComment"
          @remove="confirmRemoveMember(member)"
        />
      </div>
    </div>

    <!-- Projects Tab -->
    <div v-show="activeTab === 'projects'" class="team-tab-panel">
      <h3 class="panel-title">مشاريع الفريق</h3>
      <LoadingSpinner v-if="isLoadingTeamProjects" />
      <div v-else class="team-projects-grid">
        <TeamProjectCard v-for="project in teamProjects" :key="project.id" :project="project" />
      </div>
    </div>

    <!-- Remove Confirm Modal -->
    <div v-if="memberToRemove" class="modal-overlay" @click.self="cancelRemoveMember">
      <div class="modal-content small">
        <h3>تأكيد إخراج العضو</h3>
        <p>هل أنت متأكد من إخراج <strong>{{ memberToRemove.name }}</strong>؟</p>
        <div class="modal-actions">
          <button class="btn-text" @click="cancelRemoveMember">إلغاء</button>
          <button class="btn-primary danger" :disabled="!!memberRemoveLoading" @click="doRemoveMember">{{ memberRemoveLoading ? 'جاري...' : 'تأكيد الإخراج' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useSalesTeam } from '@/composables/sales/useSalesTeam';
import TeamMemberCard from './components/TeamMemberCard.vue';
import TeamProjectCard from './components/TeamProjectCard.vue';

const activeTab = ref('members');
const tabs = [{ id: 'members', label: 'أعضاء الفريق' }, { id: 'projects', label: 'مشاريع الفريق' }];

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

function patchMemberCommentDraft(memberId, value) {
  memberCommentDrafts.value = { ...memberCommentDrafts.value, [memberId]: value };
}

loadTeamMembers();
loadTeamProjects();
</script>

<style scoped>
.team-tab { width: 100%; max-width: 1200px; margin: 0 auto; direction: rtl; }
.team-tabs { display: flex; gap: 8px; margin-bottom: 24px; padding: 6px; background: #f8fafc; border-radius: 12px; max-width: 400px; }
.team-tab-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; color: #64748b; background: transparent; }
.team-tab-btn.active { background: white; color: #27374d; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.team-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.panel-title { font-size: 1.1rem; color: #27374d; font-weight: 800; }
.team-members-grid, .team-projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 24px; border-radius: 16px; width: 400px; }
.btn-primary.danger { background: #b91c1c; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.btn-text { background: transparent; border: 1px solid #ddd; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
</style>
