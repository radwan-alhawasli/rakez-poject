<template>
  <div class="hr-teams-view">
    <div class="section-header-compact section-header-compact--row hr-teams-hero">
      <div class="section-header-text">
        <h2 class="section-title">إدارة الفرق</h2>
        <p class="section-subtitle">إدارة وتوزيع المسوقين والمشاريع على مستوى الأفرقة.</p>
      </div>
      <div class="header-actions">
        <div class="search-box-mini search-box-mini--hero">
          <svg class="search-box-mini__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input
            v-model="teamSearchQuery"
            type="text"
            placeholder="بحث عن فريق..."
            class="search-input-mini"
            autocomplete="off"
          />
        </div>
        <button type="button" class="btn-primary hr-teams-add-btn" @click="openAddTeamModal">
          <span class="plus-icon">+</span> إضافة فريق جديد
        </button>
      </div>
    </div>
    <div class="teams-grid">
      <div
        v-for="(team, teamIdx) in filteredTeams"
        :key="team.id != null && team.id !== '' ? team.id : 'team-' + teamIdx"
        class="team-card"
      >
        <div class="team-header">
          <div>
            <div class="team-name">{{ team.name || 'فريق بدون اسم' }}</div>
            <div class="team-locations">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ team.locations || 'غير محدد' }}
            </div>
          </div>
          <div class="team-member-count">{{ team.members?.length || 0 }} مسوقين</div>
        </div>
        <div class="team-groups" v-if="(team.groupsCount || 0) > 0 || (team.groups || []).length > 0">
          <div class="team-groups-title">
            <span>Groups</span>
            <span class="team-groups-count">{{ team.groupsCount || (team.groups || []).length }}</span>
          </div>
          <div class="team-groups-list">
            <span
              v-for="(g, gi) in (team.groups || []).slice(0, 4)"
              :key="(g?.id ?? 'g') + '-' + gi"
              class="team-group-chip"
            >
              {{ g?.name || 'Group' }}
            </span>
            <span v-if="(team.groups || []).length > 4" class="team-group-chip team-group-chip--muted">
              +{{ (team.groups || []).length - 4 }}
            </span>
          </div>
        </div>

        <div class="team-marketers-list" @click="openMarketersModal(team)" style="cursor: pointer">
          <div class="marketers-row">
            <span class="marketers-label">المسوقين:</span>
            <button
              v-if="!isHR"
              type="button"
              class="btn-assign-employee"
              title="تعيين موظفين للفريق"
              @click.stop="handleLinkMarketers(team)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              تعيين
            </button>
          </div>
          <div class="marketer-avatars">
            <div
              v-for="(m, i) in (team.members || []).slice(0, 5)"
              :key="(team.id != null ? team.id : 't') + '-m-' + i"
              class="small-avatar"
              :title="memberName(m)"
            >
              {{ (memberName(m) || '؟').charAt(0) }}
            </div>
            <div v-if="team.members?.length > 5" class="small-avatar extra">
              +{{ team.members.length - 5 }}
            </div>
            <div v-else-if="!team.members || team.members.length === 0" class="no-members-hint">
              <span class="no-members-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>لا يوجد مسوقين</span>
            </div>
          </div>
        </div>

        <div class="team-progress">
          <div class="progress-info">
            <span>متوسط مبيع الموظف</span>
            <span class="sales-average-value">{{ team.salesAverageFormatted ?? formatSalesAverage(team.salesAverage) }} وحدة</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: (team.salesAverage || 0) > 0 ? Math.max(4, Math.min(team.salesAverage * 10, 100)) + '%' : '0%',
                backgroundColor: team.color || '#B1A28F',
              }"
            ></div>
          </div>
        </div>
        <div class="team-stats clickable-stat" @click="openProjectsModal(team)" style="cursor: pointer">
          <div class="stat-item stat-item--projects">
            <span class="stat-label">المشاريع المرتبطة</span>
            <span class="stat-value projects-count">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon inline-icon" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span class="projects-count-num">{{ team.soldProjects || 0 }}</span>
              <span class="projects-count-label">مشروع</span>
            </span>
          </div>
        </div>
        <div class="team-actions">
          <button v-if="!isHR" class="btn-action edit" @click="openEditTeamModal(team)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            تعديل
          </button>
          <button v-if="!isHR" class="btn-action delete" @click="handleDeleteTeam(team)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            حذف
          </button>
          <button v-if="!isHR" class="btn-action link" @click="handleLinkMarketers(team)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 1 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            ربط مسوقين
          </button>
        </div>
      </div>
    </div>

    <TeamGroupsManagementPanel :teams="teamsData" source="hr" />

    <!-- Team Modal -->
    <TeamModal
      v-if="showTeamModal"
      :team="editingTeam"
      :isHR="isHR"
      @close="showTeamModal = false"
      @submit="handleTeamSubmit"
    />

    <!-- Link Marketers Modal -->
    <LinkMarketersModal
      v-if="showLinkModal"
      :team="selectedTeamToLink"
      :isLoading="isLinking"
      @close="showLinkModal = false"
      @submit="handleLinkMarketersSubmit"
    />

    <!-- Projects List Modal -->
    <div v-if="showProjectsModal" class="modal-overlay" @click="showProjectsModal = false">
      <div class="modal-content luxury-card" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">مشاريع فريق: {{ selectedTeamDetails?.name }}</h3>
          <button class="close-btn" @click="showProjectsModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetails" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل المشاريع...</p>
          </div>
          <div v-else-if="teamProjects.length === 0" class="empty-state">
            <p>لا توجد مشاريع مرتبطة بهذا الفريق حالياً.</p>
          </div>
          <div v-else class="projects-list">
            <div
              v-for="(project, pIdx) in teamProjects"
              :key="project?.id != null ? project.id : 'proj-' + pIdx"
              class="project-item-mini"
            >
              <div class="project-info-mini">
                <span class="project-name-mini">{{
                  project.project_name || project.name || project.contract_name || 'مشروع بدون اسم'
                }}</span>
                <div class="project-details-row-mini">
                  <span class="project-location-mini">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <template v-if="project.city || project.district">
                      {{ project.city }}{{ project.district ? ' - ' + project.district : '' }}
                    </template>
                    <template v-else>
                      {{ project.location || project.address || 'الموقع غير محدد' }}
                    </template>
                  </span>
                  <span v-if="project.unit_count" class="project-units-mini">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    {{ project.unit_count }} وحدات
                  </span>
                </div>
                <div class="project-extra-info-mini" v-if="project.developer_name || project.total_price">
                  <span v-if="project.developer_name" class="developer-name-mini">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-icon">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {{ project.developer_name }}
                  </span>
                  <span v-if="project.total_price" class="price-tag-mini">
                    {{ formatCurrency(project.total_price) }}
                  </span>
                </div>
              </div>
              <span class="project-status-tag" :class="project.status">{{
                project.status_label || (project.status === 'completed' ? 'مكتمل' : 'نشط')
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Marketers List Modal -->
    <div v-if="showMarketersModal" class="modal-overlay" @click="showMarketersModal = false">
      <div class="modal-content modal-content--marketers luxury-card" @click.stop>
        <div class="modal-header modal-header--marketers">
          <h3 class="modal-title">
            <span class="modal-title-team">{{ selectedTeamDetails?.name || 'الفريق' }}</span>
            <span class="modal-title-label">مسوقي فريق</span>
          </h3>
          <button type="button" class="close-btn" aria-label="إغلاق" @click="showMarketersModal = false">&times;</button>
        </div>
        <div class="modal-body modal-body--marketers">
          <div v-if="isLoadingMarketers" class="loading-state">
            <div class="spinner"></div>
            <p>جاري تحميل المسوقين...</p>
          </div>
          <div v-else-if="teamMarketers.length === 0" class="empty-state">
            <p>لا يوجد مسوقين في هذا الفريق حالياً.</p>
          </div>
          <div v-else class="marketers-list-full">
            <div
              v-for="(marketer, mi) in teamMarketers"
              :key="marketer != null ? String(marketer) : 'm-' + mi"
              class="marketer-item-full"
            >
              <div class="marketer-item-avatar">
                {{ (marketer?.__name || (marketer != null ? String(marketer) : '')).charAt(0) || '؟' }}
              </div>
              <span class="marketer-name-full">
                {{ marketer?.__name || (marketer != null ? String(marketer) : '') }}
                <small v-if="marketer?.__groupLabel" style="display:block;color:#64748b;">Group: {{ marketer.__groupLabel }}</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
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
import { useHRTeams } from '@/composables/hr/useHRTeams';
import TeamModal from '@/components/TeamModal.vue';
import LinkMarketersModal from '@/components/LinkMarketersModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import TeamGroupsManagementPanel from '@/modules/hr/tabs/teams/TeamGroupsManagementPanel.vue';

const props = defineProps({
  isHR: { type: Boolean, default: false },
});

const {
  teamSearchQuery, teamsData, filteredTeams, formatSalesAverage, memberName, formatCurrency,
  showTeamModal, editingTeam, openAddTeamModal, openEditTeamModal,
  handleTeamSubmit, handleDeleteTeam, showConfirmModal, confirmModalConfig,
  onConfirmModalConfirm, handleLinkMarketers, showLinkModal, selectedTeamToLink,
  isLinking, handleLinkMarketersSubmit, showProjectsModal, showMarketersModal,
  selectedTeamDetails, teamProjects, teamMarketers, isLoadingDetails, isLoadingMarketers,
  openProjectsModal, openMarketersModal, loadTeams,
} = useHRTeams(props.isHR);

onMounted(() => {
  loadTeams();
});
</script>

<style scoped src="./styles/HRTeamsTab.scoped.s1.css"></style>

