<template>
  <div class="hr-view">
    <!-- Global header removed to avoid duplication with sub-sections -->

    <!-- Tabs removed as they are now in the sidebar -->

    <!-- Tab Content -->
    <div class="tab-content custom-scrollbar">
      <div v-if="activeTab === 'dashboard'" class="hr-dashboard-grid-view">
        <!-- Premium Header -->
        <div class="welcome-header">
          <h1 class="welcome-title">أهلاً بعودتك، {{ userName }}!</h1>
          <p class="welcome-subtitle">المؤشرات الرئيسية للأداء وإدارة القوى العاملة.</p>
        </div>

        <div class="stats-grid">
          <!-- KPI 1: إجمالي الموظفين -->
          <div class="stat-card animate-fade-in-up animate-stagger-1 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي الموظفين</span>
              <span class="stat-value number">{{ dashboardMetrics.totalEmployees || '0' }}</span>
              <span class="stat-desc">العدد الإجمالي للموظفين في الشركة</span>
            </div>
            <div class="stat-icon-bg units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>

          <!-- KPI 2: إجمالي الوحدات -->
          <div class="stat-card animate-fade-in-up animate-stagger-2 hover-lift">
            <div class="stat-content">
              <span class="stat-label">إجمالي الوحدات</span>
              <span class="stat-value number">{{ dashboardMetrics.totalUnits || '0' }}</span>
              <span class="stat-desc">إجمالي الوحدات السكنية المتاحة</span>
            </div>
            <div class="stat-icon-bg projects">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>

          <!-- KPI 3: الوحدات المباعة -->
          <div class="stat-card animate-fade-in-up animate-stagger-3 hover-lift">
            <div class="stat-content">
              <span class="stat-label">الوحدات المباعة</span>
              <span class="stat-value number">{{ dashboardMetrics.soldUnits || '0' }}</span>
              <span class="stat-desc">عدد الوحدات التي تم بيعها بنجاح</span>
            </div>
            <div class="stat-icon-bg ready">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- KPI 4: متوسط مبيع الموظف -->
          <div class="stat-card animate-fade-in-up animate-stagger-4 hover-lift">
            <div class="stat-content">
              <span class="stat-label">متوسط مبيع الموظف</span>
              <span class="stat-value number">{{ dashboardMetrics.avgEmployeeSales || '0' }}</span>
              <span class="stat-desc"
                >الوحدات المباعة ÷ عدد موظفي المبيعات ({{
                  dashboardMetrics.salesEmployeesCount
                }})</span
              >
            </div>
            <div class="stat-icon-bg dollar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Chart Section -->
        <div class="overview-section">
          <div class="section-header">
            <h3 class="section-title-chart">نظرة عامة على أداء الموظفين</h3>
            <p class="section-desc">توزيع الموظفين حسب حالتهم الحالية.</p>
          </div>
          <div class="chart-placeholder">
            <p style="color: #94a3b8">مخطط بياني لتوزيع الموظفين</p>
          </div>
        </div>
      </div>

      <!-- 2. Teams Tab (3.2 - إدارة الفرق) -->
      <div v-else-if="activeTab === 'teams'" class="hr-teams-view">
        <div class="section-header-compact section-header-compact--row">
          <div class="section-header-text">
            <h2 class="section-title">إدارة الفرق</h2>
            <p class="section-subtitle">إدارة وتوزيع المسوقين والمشاريع على مستوى الأفرقة.</p>
          </div>
          <div class="header-actions">
            <div class="search-box-mini">
              <input
                v-model="teamSearchQuery"
                type="text"
                placeholder="بحث عن فريق..."
                @input="loadTeams"
                class="search-input-mini"
              />
            </div>
            <button type="button" class="btn-primary" @click="openAddTeamModal">
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="mini-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ team.locations || 'غير محدد' }}
                </div>
              </div>
              <div class="team-member-count">{{ team.members?.length || 0 }} مسوقين</div>
            </div>

            <div
              class="team-marketers-list"
              @click="openMarketersModal(team)"
              style="cursor: pointer"
            >
              <div class="marketers-row">
                <span class="marketers-label">المسوقين:</span>
                <button
                  v-if="!isHR"
                  type="button"
                  class="btn-assign-employee"
                  title="تعيين موظفين للفريق"
                  @click.stop="handleLinkMarketers(team)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
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
                  <span class="no-members-icon">👥</span>
                  <span>لا يوجد مسوقين</span>
                </div>
              </div>
            </div>

            <div class="team-progress">
              <div class="progress-info">
                <span>متوسط مبيع الموظف</span>
                <span class="sales-average-value"
                  >{{
                    team.salesAverageFormatted ?? formatSalesAverage(team.salesAverage)
                  }}
                  وحدة</span
                >
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width:
                      (team.salesAverage || 0) > 0
                        ? Math.max(4, Math.min(team.salesAverage * 10, 100)) + '%'
                        : '0%',
                    backgroundColor: team.color || '#B1A28F',
                  }"
                ></div>
              </div>
            </div>
            <div
              class="team-stats clickable-stat"
              @click="openProjectsModal(team)"
              style="cursor: pointer"
            >
              <div class="stat-item stat-item--projects">
                <span class="stat-label">المشاريع المرتبطة</span>
                <span class="stat-value projects-count">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="mini-icon inline-icon"
                    aria-hidden="true"
                  >
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
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
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
      </div>

      <!-- 3. Team Performance Tab -->
      <div v-else-if="activeTab === 'team-performance'" class="performance-view">
        <div class="section-header-compact">
          <h2 class="section-title">أداء الأفرقة</h2>
          <p class="section-subtitle">تحليل الإنتاجية والجودة لكل فريق عمل.</p>
        </div>
        <div class="metrics-table-container">
          <div
            v-if="!performanceData.teams || performanceData.teams.length === 0"
            class="metrics-table-empty"
          >
            <div class="metrics-empty-icon">📊</div>
            <p class="metrics-empty-title">لا توجد بيانات أفرقة</p>
            <p class="metrics-empty-desc">لم يتم تحميل بيانات أداء الأفرقة بعد أو لا توجد فرق.</p>
          </div>
          <table v-else class="metrics-table">
            <thead>
              <tr>
                <th>الفريق</th>
                <th>نسبة تحقيق الأهداف</th>
                <th>الإنتاجية</th>
                <th>جودة العمل</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="team in performanceData.teams" :key="team.name">
                <td>{{ team.name }}</td>
                <td>
                  <div class="table-progress">
                    <span>{{ team.achievement }}%</span>
                    <div class="bar">
                      <div class="fill" :style="{ width: team.achievement + '%' }"></div>
                    </div>
                  </div>
                </td>
                <td>{{ team.productivity }}%</td>
                <td>{{ team.quality }}%</td>
                <td>
                  <span class="status-tag" :class="team.status">{{ team.statusLabel }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Marketer Performance Tab (3.3 - أداء المسوقين) -->
      <div v-else-if="activeTab === 'employee-performance'" class="performance-view">
        <div class="section-header-compact">
          <h2 class="section-title">أداء المسوقين</h2>
          <p class="section-subtitle">تتبع الأداء وتحقيق الأهداف لكل مسوق.</p>
        </div>

        <div class="metrics-table-container">
          <div
            v-if="!marketerPerformanceData || marketerPerformanceData.length === 0"
            class="metrics-table-empty"
          >
            <div class="metrics-empty-icon">👥</div>
            <p class="metrics-empty-title">لا توجد بيانات مسوقين</p>
            <p class="metrics-empty-desc">
              لم يتم تحميل بيانات الأداء بعد أو لا يوجد مسوقين لعرضهم.
            </p>
          </div>
          <table v-else class="metrics-table">
            <thead>
              <tr>
                <th>اسم الموظف</th>
                <th>نسبة تحقيق الأهداف</th>
                <th>عدد العرابين</th>
                <th>عدد التحذيرات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="marketer in marketerPerformanceData" :key="marketer.id">
                <td>
                  <div class="emp-user">
                    <div class="user-avatar">{{ (marketer.name || '؟').charAt(0) }}</div>
                    <span>{{ marketer.name || '—' }}</span>
                  </div>
                </td>
                <td>
                  <div class="table-progress">
                    <span>{{ marketer.goalAchievement ?? 0 }}%</span>
                    <div class="bar">
                      <div
                        class="fill"
                        :style="{
                          width:
                            Math.min(100, Math.max(0, Number(marketer.goalAchievement) || 0)) + '%',
                        }"
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge-info">{{ marketer.sponsorsCount ?? 0 }}</span>
                </td>
                <td>
                  <span class="badge-warning">{{ marketer.warningsCount ?? 0 }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. User Management Tab -->
      <div v-else-if="activeTab === 'users'" class="management-view">
        <UserManagement :use-hr-api="true" />
      </div>

      <!-- 6. Reports Tab -->
      <div v-else-if="activeTab === 'reports'" class="reports-view">
        <ReportsTab />

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
    </div>

    <!-- Modals -->
    <AddUserModal
      v-if="showAddUserModal"
      @close="showAddUserModal = false"
      @submit="handleUserSubmit"
      :isLoading="isSavingUser"
    />

    <SlideOverPanel
      :show="showTargetModal"
      title="تعيين الهدف البيعي"
      @close="showTargetModal = false"
    >
      <SetTargetModal
        v-if="selectedEmployee"
        :employee="selectedEmployee"
        :isLoading="isSavingTarget"
        embedded
        @close="showTargetModal = false"
        @submit="handleTargetSubmit"
      />
    </SlideOverPanel>

    <TeamModal
      v-if="showTeamModal"
      :team="editingTeam"
      :isHR="isHR"
      @close="showTeamModal = false"
      @submit="handleTeamSubmit"
    />

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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="mini-icon"
                    >
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="mini-icon"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    {{ project.unit_count }} وحدات
                  </span>
                </div>
                <div
                  class="project-extra-info-mini"
                  v-if="project.developer_name || project.total_price"
                >
                  <span v-if="project.developer_name" class="developer-name-mini">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="mini-icon"
                    >
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
          <button
            type="button"
            class="close-btn"
            aria-label="إغلاق"
            @click="showMarketersModal = false"
          >
            &times;
          </button>
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
                {{
                  (marketer != null && typeof marketer === 'string'
                    ? marketer
                    : marketer != null
                    ? String(marketer)
                    : ''
                  ).charAt(0) || '؟'
                }}
              </div>
              <span class="marketer-name-full">{{ marketer != null ? marketer : '' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import UserManagement from '../components/UserManagement.vue';
import AddUserModal from '../components/AddUserModal.vue';
import SetTargetModal from '../components/SetTargetModal.vue';
import SlideOverPanel from '../components/SlideOverPanel.vue';
import TeamModal from '../components/TeamModal.vue';
import LinkMarketersModal from '../components/LinkMarketersModal.vue';
import ReportsTab from '../components/ReportsTab.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import hrService from '../services/hrService';
import authService from '../services/authService';
import logger from '../utils/logger';
import { toast } from '../composables/useToast';

export default {
  name: 'HRView',
  components: {
    UserManagement,
    AddUserModal,
    SetTargetModal,
    SlideOverPanel,
    TeamModal,
    LinkMarketersModal,
    ReportsTab,
    ConfirmModal,
  },
  setup() {
    const route = useRoute();
    const user = ref(authService.getCurrentUser());
    const userName = computed(() => user.value?.name || 'الموارد البشرية');
    const isHR = computed(() => {
      const type = String(user.value?.type || '').toLowerCase();
      return type === 'hr' || type === '8' || type === '9';
    });
    const showAddUserModal = ref(false);
    const isLoading = ref(false);
    const teamSearchQuery = ref('');
    const teamsLoadId = ref(0);

    // Modal states for projects and marketers
    const showProjectsModal = ref(false);
    const showMarketersModal = ref(false);
    const selectedTeamDetails = ref(null);
    const teamProjects = ref([]);
    const teamMarketers = ref([]);
    const isLoadingDetails = ref(false);

    const openProjectsModal = async team => {
      selectedTeamDetails.value = team;
      showProjectsModal.value = true;
      isLoadingDetails.value = true;
      try {
        // Fetch contracts/projects for this team using HR specific endpoint
        const contractsResponse = await hrService.getTeamContracts(team.id);
        const contracts = contractsResponse.data || contractsResponse || [];

        // For each contract, fetch location details
        const enrichedContracts = await Promise.all(
          contracts.map(async contract => {
            try {
              // Get contract location by team ID (assuming contract has location info)
              const locationsResponse = await hrService.getTeamContractLocations(team.id);
              const locations = locationsResponse.data || locationsResponse || [];

              // Find matching location for this contract (if available by matching IDs or names)
              const contractLocation =
                locations.find(loc => loc.contract_id === contract.id) || locations[0] || {};

              return {
                ...contract,
                city: contractLocation.city || contract.city || '',
                district: contractLocation.district || contract.district || '',
                location: contractLocation.location || contract.location || '',
                address: contractLocation.address || contract.address || '',
              };
            } catch (locErr) {
              logger.error('Error fetching location for contract:', locErr);
              return contract;
            }
          })
        );

        teamProjects.value = enrichedContracts;
      } catch (error) {
        logger.error('Error fetching team projects:', error);
        teamProjects.value = [];
      } finally {
        isLoadingDetails.value = false;
      }
    };

    const isLoadingMarketers = ref(false);
    const openMarketersModal = async team => {
      if (!team) return;
      selectedTeamDetails.value = team;
      teamMarketers.value = [];
      showMarketersModal.value = true;
      if (team.id == null) {
        return;
      }
      isLoadingMarketers.value = true;
      try {
        const membersList = await hrService.getHRTeamMembers(team.id);
        const list = Array.isArray(membersList) ? membersList : [];
        const names = list
          .map(m => {
            if (typeof m === 'string') return m.trim() || null;
            return memberName(m) || (m?.id != null ? String(m.id) : null) || null;
          })
          .filter(Boolean);
        teamMarketers.value = names;
      } catch (err) {
        logger.error('Error loading team marketers:', err);
        teamMarketers.value = [];
      } finally {
        isLoadingMarketers.value = false;
      }
    };

    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'HRDashboard') return 'dashboard';
      if (name === 'HRTeams') return 'teams';
      if (name === 'HRTeamPerformance') return 'team-performance';
      if (name === 'HREmployeePerformance') return 'employee-performance';
      if (name === 'HRUsers') return 'users';
      if (name === 'HRReports') return 'reports';
      return 'dashboard';
    });

    // Watch for team search query changes
    watch(teamSearchQuery, () => {
      if (activeTab.value === 'teams') {
        loadTeams();
      }
    });

    const isSavingUser = ref(false);
    const showTargetModal = ref(false);
    const selectedEmployee = ref(null);
    const isSavingTarget = ref(false);

    const isSavingTeam = ref(false);

    // Team Modal State
    const showTeamModal = ref(false);
    const editingTeam = ref(null);

    // Link Marketers Modal State
    const showLinkModal = ref(false);
    const selectedTeamToLink = ref(null);
    const isLinking = ref(false);

    // Team Handlers
    const openAddTeamModal = () => {
      editingTeam.value = null;
      showTeamModal.value = true;
    };

    const openEditTeamModal = team => {
      editingTeam.value = { ...team };
      showTeamModal.value = true;
    };

    const handleTeamSubmit = async teamData => {
      isSavingTeam.value = true;
      try {
        if (editingTeam.value) {
          // Update existing team
          await hrService.updateTeam(editingTeam.value.id, teamData);
          toast.success('تم تحديث بيانات الفريق بنجاح');
        } else {
          // Create new team
          await hrService.createTeam(teamData);
          toast.success('تم إنشاء الفريق بنجاح');
        }
        showTeamModal.value = false;
        loadTeams(); // Refresh list
      } catch (error) {
        logger.error('Error saving team:', error);
        toast.error('حدث خطأ أثناء حفظ بيانات الفريق');
      } finally {
        isSavingTeam.value = false;
      }
    };

    const showConfirmModal = ref(false);
    const confirmModalConfig = ref({
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'تأكيد',
      resolve: null,
    });

    const handleDeleteTeam = team => {
      confirmModalConfig.value = {
        title: 'حذف الفريق',
        message: `هل أنت متأكد من حذف فريق "${team.name}"؟`,
        type: 'danger',
        confirmText: 'حذف',
        resolve: async () => {
          try {
            await hrService.deleteTeam(team.id);
            toast.success('تم حذف الفريق بنجاح');
            loadTeams();
          } catch (error) {
            logger.error('Error deleting team:', error);
            toast.error('حدث خطأ أثناء حذف الفريق');
          }
        },
      };
      showConfirmModal.value = true;
    };

    const onConfirmModalConfirm = async () => {
      const fn = confirmModalConfig.value.resolve;
      if (fn) await fn();
      showConfirmModal.value = false;
    };

    const handleLinkMarketers = team => {
      selectedTeamToLink.value = team;
      showLinkModal.value = true;
    };

    const handleLinkMarketersSubmit = async selectedIds => {
      isLinking.value = true;
      try {
        await hrService.linkMarketersToTeam(selectedTeamToLink.value.id, selectedIds);
        toast.success('تم ربط المسوقين بالفريق بنجاح');
        showLinkModal.value = false;
        loadTeams();
      } catch (error) {
        logger.error(error);
        toast.error('حدث خطأ أثناء ربط المسوقين');
      } finally {
        isLinking.value = false;
      }
    };

    // Dashboard Metrics (3.1)
    const dashboardMetrics = reactive({
      totalEmployees: 0,
      totalUnits: 0,
      salesEmployeesCount: 0,
      soldUnits: 0,
      avgEmployeeSales: 0,
    });

    // Teams Data (3.2) - Using shallowRef for better performance with large arrays
    const teamsData = shallowRef([]);
    const filteredTeams = computed(() => {
      const list = teamsData.value;
      return Array.isArray(list) ? list.filter(t => t != null) : [];
    });

    const formatSalesAverage = value => {
      const n = Number(value);
      if (Number.isNaN(n) || n === 0) return '0';
      if (Number.isInteger(n)) return String(n);
      return n.toFixed(2).replace(/\.?0+$/, '');
    };

    const memberName = m => {
      if (m == null) return '';
      if (typeof m === 'string') return m.trim();
      return (
        m?.name ??
        m?.full_name ??
        m?.user?.name ??
        m?.user?.full_name ??
        m?.email ??
        (m?.id != null ? String(m.id) : '')
      );
    };

    // Team Performance Data
    const performanceData = reactive({
      teams: [],
      employees: [],
    });

    // Marketer Performance Data (3.3)
    const marketerPerformanceData = reactive([]);

    // Load dashboard metrics
    const loadDashboardMetrics = async () => {
      isLoading.value = true;
      try {
        const response = await hrService.getDashboardMetrics();
        const data = response.data;

        if (data) {
          dashboardMetrics.totalEmployees = data.employees?.total_employees || 0;
          dashboardMetrics.totalUnits = data.units?.total_all_units || 0;
          dashboardMetrics.salesEmployeesCount = data.units?.sales_employees_count || 0;
          dashboardMetrics.soldUnits = data.units?.sold_units || 0;
          dashboardMetrics.avgEmployeeSales = data.units?.sold_units_per_sales_employee || 0;
        }
      } catch (error) {
        logger.error('Error loading dashboard metrics:', error);
        // Set default values on error
        dashboardMetrics.totalEmployees = 19;
        dashboardMetrics.totalUnits = 10;
        dashboardMetrics.salesEmployeesCount = 4;
        dashboardMetrics.soldUnits = 2;
        dashboardMetrics.avgEmployeeSales = 0.5;
      } finally {
        isLoading.value = false;
      }
    };

    // Load teams data
    const loadTeams = async () => {
      const currentLoadId = teamsLoadId.value + 1;
      teamsLoadId.value = currentLoadId;
      try {
        logger.debug('Loading teams...');
        const params = {};
        if (teamSearchQuery.value) {
          params.search = teamSearchQuery.value;
        }
        const data = await hrService.getTeams(params);
        logger.debug('Received teams data:', data);
        // Handle paginated response: { items, total } or legacy array
        const teams = data?.items ?? (Array.isArray(data) ? data : data?.data || []);
        const safeTeams = Array.isArray(teams) ? teams : [];
        logger.debug('Teams array:', safeTeams, 'Count:', safeTeams.length);

        // Normalize members from API (array of strings or objects with name)
        const toMemberNames = list => {
          if (!Array.isArray(list)) return [];
          return list
            .map(m =>
              typeof m === 'string'
                ? m
                : m?.name ?? m?.user?.name ?? m?.email ?? String(m?.id ?? '')
            )
            .filter(Boolean);
        };

        // Always return a string for locations (never raw array)
        const toLocationsString = team => {
          const loc = team.locations;
          if (typeof loc === 'string' && loc.trim()) return loc.trim();
          if (Array.isArray(loc)) {
            const parts = loc
              .map(l => (typeof l === 'string' ? l : l?.city || l?.district || ''))
              .filter(Boolean);
            return parts.length ? parts.join('، ') : '';
          }
          if (Array.isArray(team.contract_locations)) {
            const parts = team.contract_locations
              .map(l =>
                typeof l === 'string' ? l.trim() : `${l?.city || ''} ${l?.district || ''}`.trim()
              )
              .filter(Boolean);
            return parts.length ? parts.join('، ') : '';
          }
          return '';
        };

        // Display teams immediately with basic data; use any members/projects from list response
        const basicTeams = safeTeams.map((team, idx) => {
          const rawMembers = team.members ?? team.users ?? team.team_members ?? [];
          const members = toMemberNames(rawMembers);
          const soldProjects =
            team.sold_projects ?? team.projects_count ?? team.contracts_count ?? 0;
          const salesAverage =
            team.sales_average ?? team.average_sales ?? team.sold_units_per_sales_employee ?? 0;
          const locationsStr = toLocationsString(team) || 'جاري التحميل...';
          const avg = typeof salesAverage === 'number' ? salesAverage : 0;
          return {
            ...team,
            id: team.id ?? `team-${idx}`,
            soldProjects: typeof soldProjects === 'number' ? soldProjects : 0,
            salesAverage: avg,
            salesAverageFormatted: formatSalesAverage(avg),
            locations: locationsStr,
            goalProgress: team.goal_progress ?? 0,
            members: Array.isArray(members) ? members : [],
            color: team.color || '#B1A28F',
          };
        });

        teamsData.value = basicTeams;
        logger.debug('Teams displayed:', teamsData.value.length, 'teams');

        // Enrich each team in background (members, contracts, sales average, locations)
        safeTeams.forEach(async (team, index) => {
          const results = await Promise.allSettled([
            hrService.getTeamContracts(team.id),
            hrService.getTeamSalesAverage(team.id),
            hrService.getTeamContractLocations(team.id),
            hrService.getHRTeamMembers(team.id),
          ]);

          if (teamsLoadId.value !== currentLoadId) return;

          const contracts = results[0].status === 'fulfilled' ? results[0].value : [];
          const salesAvg = results[1].status === 'fulfilled' ? results[1].value : {};
          const locations = results[2].status === 'fulfilled' ? results[2].value : [];
          const membersList = results[3].status === 'fulfilled' ? results[3].value : [];

          const contractsArray = Array.isArray(contracts) ? contracts : contracts?.data || [];
          const avgValue =
            salesAvg?.average_sales?.sold_units_per_sales_employee ??
            salesAvg?.data?.average_sales?.sold_units_per_sales_employee ??
            0;
          const locationsArray = Array.isArray(locations) ? locations : locations?.data || [];
          const locationsText =
            locationsArray
              .map(loc => `${loc.city || ''} ${loc.district || ''}`)
              .filter(Boolean)
              .join('، ') || 'غير محدد';

          const memberNames = Array.isArray(membersList)
            ? membersList.map(m => memberName(m) || String(m?.id ?? '')).filter(Boolean)
            : [];

          const current = teamsData.value[index];
          if (
            teamsLoadId.value !== currentLoadId ||
            !current ||
            current.id !== (team.id ?? basicTeams[index]?.id)
          )
            return;
          const updatedTeams = [...teamsData.value];
          updatedTeams[index] = {
            ...updatedTeams[index],
            soldProjects: contractsArray.length,
            salesAverage: avgValue,
            salesAverageFormatted: formatSalesAverage(avgValue),
            locations: locationsText,
            members:
              Array.isArray(memberNames) && memberNames.length
                ? memberNames
                : Array.isArray(updatedTeams[index].members)
                ? updatedTeams[index].members
                : [],
          };
          teamsData.value = updatedTeams;
        });
      } catch (error) {
        logger.error('Error loading teams:', error);
        logger.debug('Using fallback mock data...');
        // Fallback to mock data
        const mockTeams = [
          {
            id: 1,
            name: 'فريق المبيعات الرياض',
            members: ['أحمد', 'خالد', 'سارة', 'فهد', 'محمد', 'نورة'],
            goalProgress: 85,
            soldProjects: 12,
            totalValue: '1.2M',
            color: '#B1A28F',
            locations: 'الرياض - حي الياسمين، حي النرجس',
            salesAverage: 2.5,
          },
          {
            id: 2,
            name: 'فريق التطوير العقاري',
            members: ['علي', 'عمر', 'ريم', 'ليلى', 'حسن'],
            goalProgress: 60,
            soldProjects: 4,
            totalValue: '3.5M',
            color: '#1e3a5f',
            locations: 'جدة - أبحر الشمالية',
            salesAverage: 1.8,
          },
          {
            id: 3,
            name: 'فريق التسويق الميداني',
            members: ['سلطان', 'ماجد', 'أمل', 'نواف'],
            goalProgress: 92,
            soldProjects: 24,
            totalValue: '850K',
            color: '#B1A28F',
            locations: 'الدمام - حي الشاطئ',
            salesAverage: 3.2,
          },
        ];
        teamsData.value = mockTeams;
        logger.debug('Mock teams loaded:', mockTeams.length, 'teams');
      }
    };

    // Load team performance
    const loadTeamPerformance = async () => {
      try {
        const data = await hrService.getTeamPerformance();
        performanceData.teams = data;
      } catch (error) {
        logger.error('Error loading team performance:', error);
        // Fallback to mock data
        performanceData.teams = [
          {
            name: 'مبيعات الوسطى',
            achievement: 94,
            productivity: 88,
            quality: 95,
            status: 'excellent',
            statusLabel: 'ممتاز',
          },
          {
            name: 'مبيعات الغربية',
            achievement: 72,
            productivity: 75,
            quality: 82,
            status: 'good',
            statusLabel: 'جيد',
          },
        ];
      }
    };

    // Load marketer performance (3.3) - use HR endpoint /hr/marketers/performance
    const loadMarketerPerformance = async () => {
      try {
        const list = await hrService.listMarketerPerformance();
        const normalized = (Array.isArray(list) ? list : []).map(item => ({
          id: item.id ?? item.user_id ?? item.marketer_id,
          name: item.name ?? item.user?.name ?? item.employee_name ?? '—',
          goalAchievement: item.goalAchievement ?? item.goal_achievement ?? item.achievement ?? 0,
          sponsorsCount: item.sponsorsCount ?? item.sponsors_count ?? item.عرابين ?? 0,
          warningsCount: item.warningsCount ?? item.warnings_count ?? 0,
        }));
        marketerPerformanceData.splice(0, marketerPerformanceData.length, ...normalized);
      } catch (error) {
        logger.error('Error loading marketer performance:', error);
        marketerPerformanceData.splice(0, marketerPerformanceData.length);
      }
    };

    // Watch for tab changes to reload data (must be after load functions are defined)
    watch(
      activeTab,
      newTab => {
        if (newTab === 'dashboard') loadDashboardMetrics();
        if (newTab === 'teams') loadTeams();
        if (newTab === 'team-performance') loadTeamPerformance();
        if (newTab === 'employee-performance') loadMarketerPerformance();
      },
      { immediate: true }
    );

    const openSetTarget = emp => {
      selectedEmployee.value = emp;
      showTargetModal.value = true;
    };

    const handleTargetSubmit = async targetData => {
      isSavingTarget.value = true;
      try {
        logger.debug('Setting target:', targetData);
        await new Promise(r => setTimeout(r, 1000));

        // Update local state for demo
        const emp = performanceData.employees.find(e => e.name === selectedEmployee.value.name);
        if (emp) emp.goals = targetData.targetValue;

        toast.success(`تم تحديث الهدف البيعي للموظف ${selectedEmployee.value.name} بنجاح!`);
        showTargetModal.value = false;
      } finally {
        isSavingTarget.value = false;
      }
    };

    const formatCurrency = val => {
      // Force English/Western numerals by using 'en-US' locale
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
        maximumFractionDigits: 0,
      }).format(val);
    };

    const handleUserSubmit = async userData => {
      isSavingUser.value = true;
      try {
        logger.debug('Saving user with HR logic:', userData);
        // Simulated delay for "notification and contract sending"
        await new Promise(r => setTimeout(r, 1500));
        toast.success(
          `تم إنشاء الموظف بنجاح! تم إرسال عقد العمل إلى: ${userData.email}. تم إرسال إشعار لمدير القسم.`
        );
        showAddUserModal.value = false;
      } finally {
        isSavingUser.value = false;
      }
    };

    // Load data on component mount
    onMounted(() => {
      // Initial load handled by watch
    });

    return {
      activeTab,
      showAddUserModal,
      userName,
      isSavingUser,
      teamsData,
      filteredTeams,
      formatSalesAverage,
      memberName,
      performanceData,
      dashboardMetrics,
      marketerPerformanceData,
      isLoading,
      teamSearchQuery,
      handleUserSubmit,
      showTargetModal,
      selectedEmployee,
      isSavingTarget,
      openSetTarget,
      handleTargetSubmit,
      formatCurrency,
      showTeamModal,
      editingTeam,
      isSavingTeam,
      openAddTeamModal,
      openEditTeamModal,
      handleTeamSubmit,
      handleDeleteTeam,
      showConfirmModal,
      confirmModalConfig,
      onConfirmModalConfirm,
      handleLinkMarketers,
      showLinkModal,
      selectedTeamToLink,
      isLinking,
      handleLinkMarketersSubmit,
      isHR,
      showProjectsModal,
      showMarketersModal,
      selectedTeamDetails,
      teamProjects,
      teamMarketers,
      isLoadingMarketers,
      isLoadingDetails,
      openProjectsModal,
      openMarketersModal,
    };
  },
};
</script>

<style scoped>
.hr-view {
  padding: 0;
  color: #1e293b;
  min-height: calc(100vh - 150px);
  display: flex;
  flex-direction: column;
}

.hr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.view-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin-bottom: 5px;
}

.view-subtitle {
  color: #64748b;
  margin: 0;
}

.section-header-compact {
  margin-bottom: 32px;
  border-right: 5px solid #b1a28f;
  padding-right: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
  position: relative;
}

.section-header-compact--row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header-text {
  min-width: 0;
}

.section-header-compact--row .header-actions,
.header-actions {
  display: flex;
  gap: 50px;
  align-items: center;
  flex-wrap: wrap;
}

.section-header-compact::before {
  content: '';
  position: absolute;
  right: -5px;
  top: 0;
  width: 5px;
  height: 60%;
  background: linear-gradient(180deg, #b1a28f 0%, transparent 100%);
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.btn-primary {
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(177, 162, 143, 0.35);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 15px;
  letter-spacing: 0.02em;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.btn-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(177, 162, 143, 0.45);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:active {
  transform: translateY(-2px) scale(1.01);
}

.plus-icon {
  font-size: 20px;
  line-height: 1;
  margin-top: -2px;
}

/* Tabs */
.hr-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 10px;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #b1a28f;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #b1a28f;
  border-radius: 3px 3px 0 0;
}

.tab-icon {
  font-size: 18px;
}

/* Dashboard UI Sync with Standard View - Luxury Enhanced */
.welcome-header {
  margin-bottom: 40px;
  text-align: right;
  padding-bottom: 25px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.15);
}

.welcome-title {
  font-size: 32px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.welcome-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 24px;
  padding: 32px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(177, 162, 143, 0.12);
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: default;
  box-shadow: 0 8px 30px -8px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle at top right, rgba(177, 162, 143, 0.06) 0%, transparent 60%);
  border-radius: 0 24px 0 100%;
  opacity: 0.5;
  transition: opacity 0.5s ease;
}

.stat-card:hover {
  border-color: rgba(177, 162, 143, 0.35);
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px -12px rgba(177, 162, 143, 0.25), 0 8px 20px rgba(30, 58, 95, 0.12);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover::after {
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: right;
  gap: 6px;
  z-index: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0;
  order: 1;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  margin: 8px 0;
  order: 2;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-value {
  color: #b1a28f;
  transform: scale(1.05);
}

.stat-desc {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  order: 3;
  letter-spacing: 0.01em;
  opacity: 0.85;
}

.stat-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  order: 3;
  position: relative;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.stat-icon-bg::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-card:hover .stat-icon-bg {
  transform: scale(1.12) rotate(-8deg);
}

.stat-card:hover .stat-icon-bg::before {
  opacity: 1;
}

.stat-icon-bg svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-icon-bg.dollar {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
}
.stat-icon-bg.units {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}
.stat-icon-bg.projects {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
}
.stat-icon-bg.ready {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
}

.metric-trend.positive {
  color: #10b981;
}
.metric-trend.negative {
  color: #ef4444;
}
.metric-trend.neutral {
  color: #94a3b8;
}

/* Teams View */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}

.team-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.team-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: #e2e8f0;
  transform: translateY(-2px);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.team-name {
  font-weight: 800;
  font-size: 18px;
}
.team-member-count {
  font-size: 12px;
  color: #94a3b8;
}

.team-progress {
  margin-bottom: 20px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #64748b;
}

.sales-average-value {
  color: #b1a28f;
  font-weight: 800;
  font-size: 14px;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.team-stats {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

.team-stats.clickable-stat {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  margin-top: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  transition: all 0.3s ease;
  min-width: 0;
  overflow: hidden;
}

.team-stats.clickable-stat:hover {
  border-color: #b1a28f;
  background: linear-gradient(135deg, #fdfbf7 0%, #ffffff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.15);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-item--projects {
  min-width: 0;
  overflow: hidden;
}

.stat-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}
.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.projects-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b1a28f;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  flex-wrap: nowrap;
}

.projects-count-num {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.projects-count-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.95;
}

.inline-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #b1a28f;
}

/* Performance Tables - Luxury Enhanced */
.metrics-table-container {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(30, 58, 95, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(177, 162, 143, 0.12);
  backdrop-filter: blur(10px);
}

.metrics-table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 200px;
}

.metrics-empty-icon {
  font-size: 48px;
  opacity: 0.7;
  margin-bottom: 16px;
}

.metrics-empty-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.metrics-empty-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  max-width: 320px;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.metrics-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 22px 24px;
  font-size: 13px;
  color: #475569;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(177, 162, 143, 0.15);
}

.metrics-table td {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  font-size: 15px;
  font-weight: 500;
  transition: background 0.3s ease;
}

.metrics-table tr:hover td {
  background: rgba(177, 162, 143, 0.03);
}

.metrics-table tr:last-child td {
  border-bottom: none;
}

.table-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
}
.table-progress .bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}
.table-progress .bar .fill {
  height: 100%;
  background: #b1a28f;
}

.status-tag {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
}

.status-tag.excellent {
  background: #dcfce7;
  color: #16a34a;
}
.status-tag.good {
  background: #eff6ff;
  color: #3b82f6;
}

.emp-user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #b1a28f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.rating {
  color: #e2e8f0;
  font-size: 18px;
  line-height: 1;
}
.star.gold {
  color: #fbbf24;
}

/* Premium Performance Cards */
.performance-premium-view {
  animation: fadeIn 0.6s ease-out;
}

.performance-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 10px;
}

.premium-card {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.premium-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 30px 60px rgba(177, 162, 143, 0.15);
  border-color: rgba(177, 162, 143, 0.3);
}

.card-glass-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.emp-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.avatar-large {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2c3e50 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(30, 58, 95, 0.2);
}

.emp-info .name {
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
}
.emp-info .team-tag {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 600;
}

.achievement-ring {
  margin-right: auto;
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(#b1a28f var(--progress), #f1f5f9 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-ring::before {
  content: '';
  position: absolute;
  width: 68px;
  height: 68px;
  background: white;
  border-radius: 50%;
}

.ring-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.ring-content .percentage {
  font-size: 18px;
  font-weight: 800;
  color: #1e3a5f;
}
.ring-content .label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
}

.card-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}

.stat-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
}

.stat-box.highlighted {
  background: #fdfbf7;
  border: 1px solid rgba(177, 162, 143, 0.2);
}
.stat-box .label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  margin-bottom: 5px;
}
.stat-box .value {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.rating-stars {
  display: flex;
  gap: 4px;
}
.rating-stars .star {
  color: #e2e8f0;
  font-size: 20px;
}
.rating-stars .star.filled {
  color: #fbbf24;
}

.btn-action-outline {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-action-outline:hover {
  border-color: #b1a28f;
  color: #b1a28f;
  background: #fdfbf7;
}

.team-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px dashed #f1f5f9;
  justify-content: flex-end;
}

.btn-icon {
  background: #f8fafc;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.btn-icon.delete:hover {
  background: #fee2e2;
  color: #ef4444;
}

.btn-link {
  background: none;
  border: 1px solid #b1a28f;
  color: #b1a28f;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-right: auto;
}

.btn-link:hover {
  background: #b1a28f;
  color: white;
}

/* Badges for Marketer Performance */
.badge-info {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 700;
  background: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 700;
  background: #fef3c7;
  color: #b45309;
}

/* Metric Description */
.metric-description {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  margin-top: 5px;
}

/* Gold icon color */
.metric-icon.gold {
  background: rgba(251, 191, 36, 0.1);
}

/* Overview Section - Luxury Enhanced */
.overview-section {
  background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%);
  border-radius: var(--radius-xl);
  padding: 40px;
  border: 1px solid rgba(177, 162, 143, 0.15);
  min-height: 450px;
  box-shadow: 0 12px 40px -10px rgba(30, 58, 95, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.overview-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(177, 162, 143, 0.08) 0%, transparent 70%);
  border-radius: 0 28px 0 100%;
  opacity: 0.6;
}

.section-header {
  margin-bottom: 35px;
  text-align: right;
  position: relative;
  z-index: 1;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(177, 162, 143, 0.12);
}

.section-title-chart {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 10px 0;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.section-desc {
  color: #64748b;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.chart-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: var(--radius-lg);
  border: 2px dashed rgba(177, 162, 143, 0.25);
  margin-top: 25px;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.4s ease;
}

.chart-placeholder:hover {
  border-color: rgba(177, 162, 143, 0.4);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.chart-placeholder p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .performance-cards-grid {
    grid-template-columns: 1fr;
  }
}

/* Expanded Team Card Styles */
.team-locations {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  min-height: 20px;
  margin-top: 4px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-icon {
  width: 14px;
  height: 14px;
  color: #b1a28f;
}

.team-marketers-list {
  margin: 15px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.marketers-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.marketers-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  margin: 0;
}

.btn-assign-employee {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #b1a28f 0%, #8c7851 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-assign-employee:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.35);
}

.btn-assign-employee svg {
  flex-shrink: 0;
}

.marketer-avatars {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 32px;
}

.no-members-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  padding: 6px 10px;
  background: rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-sm);
  border: 1px dashed #e2e8f0;
}
.no-members-hint .no-members-icon {
  font-size: 14px;
  opacity: 0.8;
}

.small-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid white;
}

.small-avatar.extra {
  background: #b1a28f;
  color: white;
  font-size: 10px;
}

.btn-action {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  transition: all 0.2s;
}

.btn-action svg {
  width: 14px;
  height: 14px;
}

.btn-action:hover {
  border-color: #b1a28f;
  color: #b1a28f;
  background: #fdfbf7;
}
.btn-action.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}
.btn-action.link {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #dbeafe;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
}
.btn-action.link:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.team-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

/* Search Box Mini */
.search-box-mini {
  position: relative;
  width: 200px;
  min-width: 0;
}

.search-input-mini {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  transition: all 0.2s;
}

.search-input-mini:focus {
  outline: none;
  border-color: #b1a28f;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content.luxury-card {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-content--marketers {
  max-width: 560px;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 15px;
}

.modal-header--marketers {
  margin-bottom: 0;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header--marketers .modal-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e3a5f;
}

.modal-title-team {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}

.modal-title-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body--marketers {
  padding: 20px 24px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(85vh - 80px);
  flex: 1 1 auto;
}

.modal-body--marketers::-webkit-scrollbar {
  width: 8px;
}

.modal-body--marketers::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.modal-body--marketers::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-body--marketers::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Projects List Mini */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

.project-item-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.project-item-mini:hover {
  border-color: #b1a28f;
  background: #fdfbf7;
  transform: translateX(-5px);
}

.project-info-mini {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.project-details-row-mini,
.project-extra-info-mini {
  display: flex;
  align-items: center;
  gap: 15px;
}

.project-extra-info-mini {
  margin-top: 4px;
}

.project-name-mini {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
}

.project-location-mini,
.project-units-mini,
.developer-name-mini {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
}

.price-tag-mini {
  font-size: 13px;
  font-weight: 800;
  color: #b1a28f;
}

.project-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-lg);
  background: #dcfce7;
  color: #16a34a;
}

/* Marketers List Full */
.marketers-list-full {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.marketer-item-full {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.marketer-item-full:hover {
  border-color: #b1a28f;
  background: #fdfbf7;
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.12);
}

.marketer-item-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b1a28f 0%, #9a8b76 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.marketer-name-full {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 600;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #b1a28f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==========================================
   RESPONSIVE DESIGN (HR View)
   ========================================== */
@media (max-width: 992px) {
  .section-header-compact--row {
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .search-box-mini {
    flex: 1 1 180px;
    max-width: 260px;
  }
  .btn-primary {
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding-right: 12px;
    padding-left: 12px;
  }
  .hr-teams-view,
  .hr-dashboard-grid-view {
    padding-bottom: 24px;
  }
  .section-header-compact {
    padding-right: 16px;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .section-header-compact--row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .section-title {
    font-size: 22px;
  }
  .section-subtitle {
    font-size: 14px;
  }
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .search-box-mini {
    width: 100%;
    max-width: none;
    flex: 1 1 auto;
  }
  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    font-size: 14px;
  }
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .team-card {
    padding: 16px;
  }
  .team-name {
    font-size: 16px;
  }
  .team-actions {
    gap: 6px;
  }
  .btn-action {
    padding: 6px 10px;
    font-size: 11px;
  }
  .modal-content.luxury-card {
    width: 94%;
    max-width: none;
    padding: 20px;
    border-radius: var(--radius-lg);
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .modal-content--marketers {
    max-height: 88vh;
  }
  .modal-header--marketers,
  .modal-body--marketers {
    padding-left: 16px;
    padding-right: 16px;
  }
  .marketers-list-full {
    grid-template-columns: 1fr;
  }
  .welcome-title {
    font-size: 26px;
  }
  .welcome-subtitle {
    font-size: 14px;
  }
  .stat-card {
    padding: 24px 20px;
  }
}

@media (max-width: 576px) {
  .hr-view {
    min-height: calc(100vh - 120px);
  }
  .tab-content {
    padding-right: 10px;
    padding-left: 10px;
  }
  .section-header-compact {
    padding-right: 12px;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 20px;
  }
  .teams-grid {
    gap: 14px;
  }
  .team-card {
    padding: 14px;
  }
  .team-header {
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .team-marketers-list {
    padding: 10px;
    margin: 12px 0;
  }
  .team-stats.clickable-stat {
    padding: 10px;
  }
  .modal-content.luxury-card {
    width: 96%;
    padding: 16px;
    border-radius: 16px;
  }
  .modal-title-team {
    font-size: 18px;
  }
  .marketer-item-full {
    padding: 10px 12px;
  }
  .marketer-item-avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
    font-size: 14px;
  }
  .projects-list {
    max-height: 50vh;
  }
  .metrics-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 16px;
  }
  .metrics-table {
    min-width: 480px;
  }
  .metrics-table th,
  .metrics-table td {
    padding: 12px 14px;
    font-size: 13px;
  }
}

/* Large screens */
@media (min-width: 1920px) {
  .hr-view {
    padding: 28px 40px;
  }
  .page-title {
    font-size: 32px;
  }
  .data-table th,
  .data-table td,
  .metrics-table th,
  .metrics-table td {
    padding: 22px 24px;
    font-size: 15px;
  }
}

@media (min-width: 2560px) {
  .hr-view {
    padding: 36px 52px;
  }
  .page-title {
    font-size: 38px;
  }
  .data-table th,
  .data-table td,
  .metrics-table th,
  .metrics-table td {
    padding: 26px 28px;
    font-size: 16px;
  }
}

@media (min-width: 3840px) {
  .hr-view {
    padding: 48px 60px;
  }
  .page-title {
    font-size: 48px;
  }
  .data-table th,
  .data-table td,
  .metrics-table th,
  .metrics-table td {
    padding: 32px;
    font-size: 20px;
  }
  .stat-card {
    padding: 32px;
    border-radius: 24px;
  }
}
</style>
