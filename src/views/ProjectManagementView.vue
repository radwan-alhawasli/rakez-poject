<template>
  <div class="project-management-view">
    <!-- Header: title + controls row (New Project → كل الفرق → Search) -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة المشاريع</h1>
        <p class="page-subtitle">عرض وإدارة جميع المشاريع النشطة والمكتملة والمؤرشفة.</p>
      </div>
      <div class="controls-area">
        <router-link to="/exclusive-request" class="btn-new-project">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          مشروع جديد
        </router-link>
        <div class="filter-dropdown">
          <select v-model="teamFilter">
            <option value="">كل الفرق</option>
            <option value="sales">فريق المبيعات</option>
            <option value="marketing">فريق التسويق</option>
          </select>
        </div>
        <div class="search-box">
          <svg
            class="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ابحث عن مشروع بالاسم أو الموقع..."
          />
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <!-- Editor: Single Tab for All Projects -->
      <button
        v-if="isEditor"
        :class="['tab-btn', { active: activeTab === 'all_projects' }]"
        @click="activeTab = 'all_projects'"
      >
        المشاريع ({{ allProjectsCount }})
      </button>

      <!-- Standard Tabs for Non-Editors -->
      <template v-else>
        <button
          :class="['tab-btn', { active: activeTab === 'not_ready' }]"
          @click="activeTab = 'not_ready'"
        >
          مشاريع غير جاهزة ({{ notReadyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'ready' }]"
          @click="activeTab = 'ready'"
        >
          مشاريع جاهزة للتسويق ({{ readyCount }})
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'archive' }]"
          @click="activeTab = 'archive'"
        >
          الأرشيف ({{ archiveCount }})
        </button>
      </template>
    </div>

    <!-- Projects Grid -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>لا توجد مشاريع مطابقة للعرض.</p>
    </div>

    <div v-else class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        :class="{ 'card-no-image': !project.hasImage }"
      >
        <!-- Card top: image or placeholder -->
        <div class="card-image" :class="{ 'card-image-placeholder': !project.hasImage }">
          <template v-if="project.hasImage">
            <img
              :src="project.image"
              alt=""
              @error="
                $event.target.src =
                  'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%2F%3E%3C%2Fsvg%3E'
              "
            />
          </template>
          <template v-else>
            <div class="placeholder-block">
              <span class="placeholder-name">{{ project.name }}</span>
            </div>
          </template>
          <div class="status-badge" :class="project.statusClass">{{ project.statusLabel }}</div>
          <div class="menu-container" @click.stop="toggleMenu(project.id)">
            <button class="menu-btn" type="button">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
            <div v-if="activeMenuId === project.id" class="dropdown-menu">
              <div class="menu-item" @click.stop="onEditProject(project)">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                تعديل المشروع
              </div>
              <div class="menu-item" @click.stop="onAssignTeam(project)">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                تعيين الفريق
              </div>
              <div class="menu-item" @click.stop="onArchiveProject(project)">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                أرشفة المشروع
              </div>
              <div class="menu-item" @click.stop="onMarkComplete(project)">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                تحديد كمكتمل
              </div>
              <div class="menu-item" @click.stop="onDownloadContract(project)">
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                تحميل العقد
              </div>
            </div>
          </div>
          <div
            v-if="activeMenuId === project.id"
            class="menu-backdrop"
            @click.stop="activeMenuId = null"
          ></div>
        </div>

        <div class="card-content">
          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-location">{{ project.location }}</p>
          <p class="project-description-line">{{ project.descriptionLine }}</p>
          <div class="assignee">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{{ project.assignee || 'غير معين' }}</span>
          </div>
          <div class="progress-row">
            <span class="progress-label">تقدم الإعداد</span>
            <span class="progress-value">{{ project.setupProgress }}%</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: Math.min(100, project.setupProgress) + '%' }"
              ></div>
            </div>
          </div>
          <div class="progress-row">
            <span class="progress-label">الوحدات المباعة</span>
            <span class="progress-value">{{ project.soldUnitsPercent }}%</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: Math.min(100, project.soldUnitsPercent) + '%' }"
              ></div>
            </div>
          </div>
          <div
            class="status-pill"
            :class="{ expired: project.daysLeft !== null && project.daysLeft < 0 }"
          >
            {{ project.timelinePillLabel }}
          </div>
          <button class="btn-view-details" @click="viewTracker(project)">عرض التفاصيل</button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-content large">
        <h3>تفاصيل المشروع: {{ selectedProject?.name }}</h3>

        <div class="details-grid">
          <div class="detail-box">
            <span class="label">رقم المعلن</span>
            <span class="value">{{ selectedProject?.advertiser_number || 'غير متوفر' }}</span>
            <span
              class="status-mini"
              :class="getStatusClass(selectedProject?.advertiser_number ? 'available' : 'notfound')"
            >
              {{ selectedProject?.advertiser_number ? 'Available' : 'Not Found' }}
            </span>
          </div>

          <div class="detail-box">
            <span class="label">متوسط سعر الوحدة</span>
            <span class="value highlight">{{
              selectedProject?.avgPrice ? formatCurrency(selectedProject.avgPrice) : 'غير محسوب'
            }}</span>
            <span
              class="status-mini"
              :class="getStatusClass(selectedProject?.avgPrice ? 'available' : 'pending')"
            >
              {{ selectedProject?.avgPrice ? 'Available' : 'Pending' }}
            </span>
          </div>

          <div class="detail-box clickable" @click="goToUnits(selectedProject)">
            <span class="label">عرض سعر الوحدات</span>
            <span class="value link">انقر للعرض ↗</span>
            <span
              class="status-mini"
              :class="getStatusClass(selectedProject?.units?.length ? 'available' : 'notfound')"
            >
              {{ selectedProject?.units?.length ? 'Available' : 'Not Found' }}
            </span>
          </div>

          <!-- Extra Details per requirement -->
          <div class="detail-box">
            <span class="label">تفاصيل المشروع</span>
            <span class="value">{{ selectedProject?.description ? 'مكتمل' : 'ناقص' }}</span>
            <span
              class="status-mini"
              :class="getStatusClass(selectedProject?.description ? 'available' : 'pending')"
            >
              {{ selectedProject?.description ? 'Available' : 'Pending' }}
            </span>
          </div>
        </div>

        <!-- Removed old Units Table inside modal as requested to Redirect instead -->
        <!-- But keeping basic list if user wants quick glance, logic: 'when clicked it redirects him' -->
        <!-- We kept the redirect button above. Hiding table or keeping it optional? User said 'redirects him'. -->
        <!-- Units Table Removed as per user request to only have Redirect -->
        <!-- <div class="table-wrapper">...</div> -->

        <button class="close-modal-btn" @click="closeDetailsModal">إغلاق</button>
      </div>
    </div>

    <!-- Workspace Modal -->
    <div v-if="showWorkspaceModal" class="modal-overlay" @click.self="closeWorkspaceModal">
      <div class="modal-content">
        <h3>مساحة العمل (Workspace)</h3>
        <p>إضافة رابط (Story, Video, Image)</p>

        <div class="form-group">
          <label>نوع الرابط</label>
          <select v-model="workspaceForm.type" class="form-input">
            <option value="story">Story</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div class="form-group">
          <label>الرابط (URL)</label>
          <input
            v-model="workspaceForm.url"
            type="text"
            class="form-input"
            placeholder="https://"
          />
        </div>

        <div class="modal-actions">
          <button class="btn-text" @click="closeWorkspaceModal">إلغاء</button>
          <button class="btn-primary" @click="submitWorkspaceLink">إرسال وتنبيه الإدارة</button>
        </div>
      </div>
    </div>

    <!-- Assign Team Modal -->
    <div v-if="showAssignTeamModal" class="modal-overlay" @click.self="closeAssignTeamModal">
      <div class="modal-content large">
        <h3>تعيين فريق تسويق</h3>
        <p v-if="projectForAssignTeam" style="color: #64748b; margin-bottom: 20px">
          المشروع: {{ projectForAssignTeam.name }}
        </p>

        <div class="assign-team-row">
          <div class="select-wrapper">
            <select v-model="assignTeamSelectedId" class="form-input">
              <option value="">-- اختر فريقًا --</option>
              <option v-for="team in assignTeamAvailable" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="btn-primary"
            @click="assignTeamSubmit"
            :disabled="!assignTeamSelectedId || assignTeamActionLoading"
          >
            {{ assignTeamActionLoading ? 'جاري الإضافة...' : 'إضافة الفريق' }}
          </button>
        </div>

        <h4 class="assign-team-subtitle">الفرق المعينة حالياً</h4>
        <div v-if="assignTeamLoading" class="loading-state"><div class="spinner"></div></div>
        <div v-else-if="assignTeamAssigned.length === 0" class="empty-state small">
          <p>لا توجد فرق معينة لهذا المشروع.</p>
        </div>
        <div v-else class="assigned-teams-list">
          <div v-for="team in assignTeamAssigned" :key="team.id" class="assigned-team-item">
            <span>{{ team.name }}</span>
            <button
              type="button"
              class="btn-remove-small"
              @click="assignTeamRemove(team)"
              :disabled="assignTeamActionLoading"
              title="إزالة الفريق"
            >
              ×
            </button>
          </div>
        </div>

        <button class="close-modal-btn" style="margin-top: 20px" @click="closeAssignTeamModal">
          إغلاق
        </button>
      </div>
    </div>

    <!-- Media (Montage) Modal -->
    <!-- Photography (Was Montage) Modal -->
    <div v-if="showMediaModalState" class="modal-overlay" @click.self="closeMediaModalState">
      <div class="modal-content">
        <h3>إدارة التصوير (Photography)</h3>
        <p style="color: #666; font-size: 13px; margin-bottom: 15px">
          تحديث صور وفيديوهات المشروع: {{ selectedProject?.name }}
        </p>

        <form @submit.prevent="submitMediaForm">
          <div class="form-group">
            <label>رابط الصورة (Image URL)</label>
            <input
              v-model="mediaForm.image_url"
              type="text"
              class="form-input"
              placeholder="https://..."
            />
          </div>
          <div class="form-group">
            <label>رابط الفيديو (Video URL)</label>
            <input
              v-model="mediaForm.video_url"
              type="text"
              class="form-input"
              placeholder="https://..."
            />
          </div>
          <div class="form-group">
            <label>الوصف (Description)</label>
            <textarea v-model="mediaForm.description" class="form-input" rows="3"></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-text" @click="closeMediaModalState">إلغاء</button>
            <button type="submit" class="btn-primary" :disabled="isMediaSaving">
              {{ isMediaSaving ? 'جاري الإرسال...' : 'حفظ وإرسال للموافقة' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '../services/contractService';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import teamService from '../services/teamService';
import logger from '../utils/logger';
import { toast } from '../composables/useToast';
import { useFormatters } from '../composables/useFormatters';

export default {
  name: 'ProjectManagementView',
  setup() {
    const router = useRouter();
    // const route = useRoute() // Unused now that we default activeTab
    const userRole = computed(() => {
      const u = authService.getCurrentUser();
      return u ? u.type : 0;
    });
    const isEditor = computed(() => userRole.value == 4);
    const isManager = computed(() => {
      const u = authService.getCurrentUser();
      return (u && u.type == 1) || (u && u.type == 3 && u.is_manager);
    });

    // Initialize activeTab based on user role
    const activeTab = ref(isEditor.value ? 'all_projects' : 'not_ready');

    // Watch role change to reset tab if necessary (optional)

    const searchQuery = ref('');
    const teamFilter = ref('');
    const isLoading = ref(false);
    const projects = ref([]);

    const activeMenuId = ref(null);
    const showDetailsModal = ref(false);
    const showWorkspaceModal = ref(false);
    const selectedProject = ref(null);

    // Assign team modal
    const showAssignTeamModal = ref(false);
    const projectForAssignTeam = ref(null);
    const assignTeamAssigned = ref([]);
    const assignTeamAvailable = ref([]);
    const assignTeamSelectedId = ref('');
    const assignTeamLoading = ref(false);
    const assignTeamActionLoading = ref(false);

    const workspaceForm = reactive({
      type: 'story',
      url: '',
    });

    // Media Modal State
    const showMediaModalState = ref(false);
    const mediaForm = reactive({
      image_url: '',
      video_url: '',
      description: '',
      isExisting: false,
    });
    const isMediaSaving = ref(false);

    const fetchProjects = async () => {
      isLoading.value = true;
      try {
        // All users use /contracts/index - editors will see all projects they have access to
        // Editor Role (4) uses specific endpoint
        const data = isEditor.value
          ? await contractService.getEditorContracts()
          : await contractService.getContracts();
        logger.debug('Fetched Projects:', data);
        logger.debug('User Role:', userRole.value, 'Is Editor:', isEditor.value);

        // Transform data to match UI
        const unitList = p => p.units || [];
        projects.value = (Array.isArray(data) ? data : []).map(p => {
          const units = unitList(p);
          const totalUnits = units.length;
          const soldCount = units.filter(
            u =>
              String(u.status || '').toLowerCase() === 'sold' ||
              String(u.status || '')
                .toLowerCase()
                .includes('sold')
          ).length;
          const daysLeftVal = (() => {
            const d = new Date(p.contract_end_date || p.end_date || p.agreement_end_date || 0);
            if (Number.isNaN(d.getTime())) return null;
            return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          })();
          const isExclusive = p.type === 'Exclusive' || p.is_exclusive;
          const unitType = p.unit_type || (units[0] && units[0].unit_type) || 'Apartment';
          const descLine = isExclusive
            ? `طلب مشروع حصري. ${p.total_units || totalUnits || 100} وحدة من نوع ${unitType}.`
            : (p.description || p.details || '').split('\n')[0] ||
              (totalUnits ? `${totalUnits} وحدة` : '');
          // جاهز للتسويق (معتمد وله وحدات) => تقدم الإعداد 100%، وإلا نسبة الـ tracker
          const isReadyForMarketing = p.status === 'Approved' && totalUnits > 0;
          const setupProgressVal = isReadyForMarketing
            ? 100
            : p.setup_progress != null
              ? Number(p.setup_progress)
              : 0;
          return {
            id: p.id,
            name: p.project_name || p.name || `مشروع #${p.id}`,
            location:
              `${(p.district || '').trim()}${p.district && p.city ? ', ' : ''}${(
                p.city || ''
              ).trim()}`.replace(/^,\s*|,\s*$/g, '') || '—',
            image: p.project_image_url,
            hasImage: !!(p.project_image_url && p.project_image_url.trim()),
            statusLabel: p.status === 'Approved' ? 'Active' : p.status,
            statusClass: p.status === 'Approved' ? 'active' : 'pending',
            units,
            advertiser_number: p.advertiser_number,
            assignee: p.marketer,
            status: p.status,
            description: p.description || p.details || '',
            descriptionLine: descLine,
            setupProgress: setupProgressVal,
            soldUnitsCount: soldCount,
            soldUnitsPercent: totalUnits ? Math.round((soldCount / totalUnits) * 100) : 0,
            avgPrice: units.length
              ? units.reduce((a, b) => a + (Number(b.price) || 0), 0) / units.length
              : 0,
            commission_percentage: Number(p.commission_percentage || 0),
            availableUnits: units.filter(
              u => String(u.status || '').toLowerCase() === 'available' || !u.status
            ).length,
            pendingUnits: units.filter(
              u =>
                String(u.status || '')
                  .toLowerCase()
                  .includes('pending') ||
                String(u.status || '')
                  .toLowerCase()
                  .includes('reserved')
            ).length,
            availableUnitsValue: units
              .filter(u => String(u.status || '').toLowerCase() === 'available' || !u.status)
              .reduce((acc, u) => acc + (Number(u.price) || 0), 0),
            endDate: p.contract_end_date || p.end_date || p.agreement_end_date || null,
            daysLeft: daysLeftVal,
            timelinePillLabel:
              daysLeftVal === null
                ? '—'
                : daysLeftVal < 0
                ? 'انتهت المهلة'
                : `خلال ${daysLeftVal} أيام`,
            distance: p.distance || '15',
            landmark: p.landmark || 'مطار الملك خالد',
          };
        });
      } catch (err) {
        logger.error('Error fetching projects:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const filteredProjects = computed(() => {
      let filtered = projects.value;

      // Filter by Tab
      if (activeTab.value === 'all_projects') {
        // All active projects (regardless of ready/not ready), exclude archived/refused if desired, or include ALL.
        // Requirement: "contain all the projects the ready and the not ready"
        // Usually excludes rejected.
        filtered = filtered.filter(p => p.status !== 'Rejected' && p.status !== 'Refused');
      } else if (activeTab.value === 'ready') {
        // Ready = Has units AND Approved
        filtered = filtered.filter(p => p.status === 'Approved' && p.units && p.units.length > 0);
      } else if (activeTab.value === 'not_ready') {
        // Not Ready = Not Approved OR No Units (Tracker incomplete)
        filtered = filtered.filter(
          p => p.status !== 'Approved' || !p.units || p.units.length === 0
        );
      } else if (activeTab.value === 'archive') {
        filtered = filtered.filter(p => p.status === 'Refused' || p.status === 'Rejected');
      }

      // Filter by Search
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
        );
      }

      return filtered;
    });

    // Removed photographyCount from logic as requested
    const notReadyCount = computed(
      () =>
        projects.value.filter(p => p.status !== 'Approved' || !p.units || p.units.length === 0)
          .length
    );
    const readyCount = computed(
      () =>
        projects.value.filter(p => p.status === 'Approved' && p.units && p.units.length > 0).length
    );
    const archiveCount = computed(
      () => projects.value.filter(p => p.status === 'Refused' || p.status === 'Rejected').length
    );
    const allProjectsCount = computed(
      () => projects.value.filter(p => p.status !== 'Rejected' && p.status !== 'Refused').length
    );

    const viewTracker = project => {
      router.push({ name: 'ProjectTracker', params: { id: project.id } });
    };

    const onEditProject = project => {
      activeMenuId.value = null;
      router.push({ name: 'ProjectTracker', params: { id: project.id } });
    };
    const onArchiveProject = async () => {
      activeMenuId.value = null;
      try {
        // TODO: call archive API when available (e.g. contractService.archiveContract(project.id))
        toast.info('أرشفة المشروع: سيتم ربطها بالـ API عند التوفر.');
      } catch (e) {
        toast.error('فشل أرشفة المشروع');
      }
    };
    const onMarkComplete = () => {
      activeMenuId.value = null;
      // TODO: call mark-complete API when available
      toast.info('تحديد كمكتمل: سيتم ربطها بالـ API عند التوفر.');
    };
    const onDownloadContract = async project => {
      activeMenuId.value = null;
      try {
        if (typeof contractService.downloadContract === 'function') {
          await contractService.downloadContract(project.id);
          toast.success('تم تحميل العقد');
        } else {
          toast.info('تحميل العقد: سيتم ربطها بالـ API عند التوفر.');
        }
      } catch (e) {
        toast.error('فشل تحميل العقد');
      }
    };

    const loadAssignTeamData = async () => {
      const project = projectForAssignTeam.value;
      if (!project) return;
      assignTeamLoading.value = true;
      try {
        const [assignedData, allTeams] = await Promise.all([
          teamService.getContractTeams(project.id),
          teamService.getTeams(),
        ]);
        const assigned = Array.isArray(assignedData) ? assignedData : assignedData?.data || [];
        assignTeamAssigned.value = assigned;
        const assignedIds = new Set(assigned.map(t => t.id));
        assignTeamAvailable.value = allTeams.filter(t => !assignedIds.has(t.id));
      } catch (error) {
        logger.error('Error loading teams for assign modal:', error);
        toast.error('فشل تحميل قائمة الفرق');
      } finally {
        assignTeamLoading.value = false;
      }
    };

    const assignTeamSubmit = async () => {
      const project = projectForAssignTeam.value;
      if (!project || !assignTeamSelectedId.value) return;
      assignTeamActionLoading.value = true;
      try {
        await teamService.addTeamsToContract(project.id, [assignTeamSelectedId.value]);
        toast.success('تم تعيين الفريق بنجاح');
        assignTeamSelectedId.value = '';
        await loadAssignTeamData();
        await fetchProjects();
      } catch (error) {
        logger.error('Error assigning team:', error);
        toast.error('حدث خطأ أثناء تعيين الفريق');
      } finally {
        assignTeamActionLoading.value = false;
      }
    };

    const assignTeamRemove = async team => {
      const project = projectForAssignTeam.value;
      if (!project) return;
      assignTeamActionLoading.value = true;
      try {
        await teamService.removeTeamsFromContract(project.id, [team.id]);
        toast.success('تم إزالة الفريق بنجاح');
        await loadAssignTeamData();
        await fetchProjects();
      } catch (error) {
        logger.error('Error removing team:', error);
        toast.error('حدث خطأ أثناء إزالة الفريق');
      } finally {
        assignTeamActionLoading.value = false;
      }
    };

    const closeAssignTeamModal = () => {
      showAssignTeamModal.value = false;
      projectForAssignTeam.value = null;
      assignTeamAssigned.value = [];
      assignTeamAvailable.value = [];
      assignTeamSelectedId.value = '';
    };

    const toggleMenu = id => {
      activeMenuId.value = activeMenuId.value === id ? null : id;
    };

    const openProjectDetails = async project => {
      // Start with basic info from the list to show immediately
      selectedProject.value = project;
      showDetailsModal.value = true;
      activeMenuId.value = null;

      try {
        let details = null;
        // Use the "Essential API" requested by the user
        if (isEditor.value) {
          details = await contractService.getEditorContractById(project.id);
        } else {
          details = await contractService.getContractById(project.id);
        }

        if (details) {
          logger.debug('Fetched Details:', details);
          // Normalize and merge data
          selectedProject.value = {
            ...selectedProject.value,
            ...details,
            // Map Backend keys to UI keys
            advertiser_number: details.advertiser_number || details.advertiser_section_url || null,
            avgPrice: details.average_unit_price || details.avg_price || null,
            description: details.description || details.project_description || null,
            units: details.units || [],
          };
        }
      } catch (e) {
        logger.error('Failed to fetch detailed project info', e);
      }
    };

    const openWorkspace = project => {
      selectedProject.value = project;
      workspaceForm.url = '';
      showWorkspaceModal.value = true;
      activeMenuId.value = null;
    };

    const closeDetailsModal = () => (showDetailsModal.value = false);
    const closeWorkspaceModal = () => (showWorkspaceModal.value = false);
    const closeMediaModalState = () => (showMediaModalState.value = false);

    const openMediaModal = async project => {
      selectedProject.value = project;
      // Fetch current photography data using Photography Service
      try {
        const photoData = await contractService.getPhotography(project.id);
        if (photoData && photoData.data) {
          mediaForm.image_url = photoData.data.image_url || '';
          mediaForm.video_url = photoData.data.video_url || '';
          mediaForm.description = photoData.data.description || '';
          mediaForm.isExisting = true;
        } else {
          // clear
          mediaForm.image_url = '';
          mediaForm.video_url = '';
          mediaForm.description = '';
          mediaForm.isExisting = false;
        }
      } catch (e) {
        logger.error(e);
        // clear on error
        mediaForm.image_url = '';
        mediaForm.video_url = '';
        mediaForm.description = '';
        mediaForm.isExisting = false;
      }
      showMediaModalState.value = true;
      activeMenuId.value = null;
    };

    const submitMediaForm = async () => {
      if (!selectedProject.value) return;
      isMediaSaving.value = true;
      try {
        // Include status: 'pending' to trigger approval workflow
        const payload = {
          image_url: mediaForm.image_url,
          video_url: mediaForm.video_url,
          description: mediaForm.description,
          status: 'pending',
        };

        if (mediaForm.isExisting) {
          await contractService.updatePhotography(selectedProject.value.id, payload);
          notificationService.addNotification(
            'تم تحديث الصور من قسم التحرير وإرسالها للموافقة',
            'success'
          );
        } else {
          await contractService.storePhotography(selectedProject.value.id, payload);
          notificationService.addNotification(
            'تم رفع الصور من قسم التحرير وإرسالها للموافقة',
            'success'
          );
          mediaForm.isExisting = true; // Mark as existing after successful store
        }
        closeMediaModalState();
      } catch (error) {
        logger.error('Save failed:', error);
        const msg = error.response?.data?.message || error.message;
        if (msg && msg.includes('يجب أن يكون العقد لديه معلومات')) {
          toast.warning(
            'تنبيه: لا يمكن إضافة صور لهذا المشروع لأنه يفتقر إلى بيانات العقد الأساسية. يرجى إكمال بيانات المشروع أولاً (الطرف الثاني، المعلومات المالية) في صفحة التتبع.'
          );
        } else {
          toast.error('فشل الحفظ: ' + msg);
        }
      } finally {
        isMediaSaving.value = false;
      }
    };

    const goToUnits = project => {
      // Redirect to Tracker Units Tab
      router.push({ name: 'ProjectTracker', params: { id: project.id }, query: { tab: 'units' } });
    };

    const getStatusClass = status => {
      switch (status) {
        case 'available':
          return 'ok';
        case 'pending':
          return 'pending';
        case 'notfound':
          return 'missing';
        default:
          return '';
      }
    };

    const submitWorkspaceLink = async () => {
      if (!workspaceForm.url) {
        toast.warning('الرجاء إدخال الرابط');
        return;
      }
      // Mock API call
      logger.debug(
        `Submitting workspace link for project ${selectedProject.value.id}:`,
        workspaceForm
      );

      // Simulate success and notification
      toast.success('تم إضافة الرابط بنجاح وإشعار الإدارة ومدير المشاريع.');
      closeWorkspaceModal();
    };

    const { formatCurrencyAr: formatCurrency } = useFormatters();

    const timelineClass = daysLeft => {
      if (daysLeft === null) return '';
      if (daysLeft < 30) return 'timeline-red';
      if (daysLeft < 90) return 'timeline-orange';
      return 'timeline-green';
    };

    const timelineLabel = daysLeft => {
      if (daysLeft === null) return 'المدة غير متاحة';
      if (daysLeft < 0) return 'العقد منتهي';
      if (daysLeft < 30) return `أحمر: ${daysLeft} يوم`;
      if (daysLeft < 90) return `برتقالي: ${daysLeft} يوم`;
      return `أخضر: ${daysLeft} يوم`;
    };

    onMounted(fetchProjects);

    return {
      activeTab,
      searchQuery,
      teamFilter,
      isLoading,
      filteredProjects,
      notReadyCount,
      readyCount,
      archiveCount,
      viewTracker,
      isEditor,
      activeMenuId,
      toggleMenu,
      onEditProject,
      onArchiveProject,
      onMarkComplete,
      onDownloadContract,
      onAssignTeam: project => {
        activeMenuId.value = null;
        projectForAssignTeam.value = project;
        assignTeamSelectedId.value = '';
        showAssignTeamModal.value = true;
        loadAssignTeamData();
      },
      showAssignTeamModal,
      projectForAssignTeam,
      assignTeamAssigned,
      assignTeamAvailable,
      assignTeamSelectedId,
      assignTeamLoading,
      assignTeamActionLoading,
      assignTeamSubmit,
      assignTeamRemove,
      closeAssignTeamModal,
      showDetailsModal,
      selectedProject,
      openProjectDetails,
      closeDetailsModal,
      showWorkspaceModal,
      workspaceForm,
      openWorkspace,
      closeWorkspaceModal,
      submitWorkspaceLink,
      formatCurrency,
      allProjectsCount,
      showMediaModalState,
      mediaForm,
      isMediaSaving,
      openMediaModal,
      closeMediaModalState,
      submitMediaForm,
      getStatusClass,
      goToUnits,
      isManager,
      timelineClass,
      timelineLabel,
    };
  },
};
</script>

<style scoped>
.project-management-view {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-new-project {
  background: #b1a28f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.btn-new-project:hover {
  background: #8c7851;
  color: white;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 5px 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 15px;
  margin: 0;
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

.controls-area {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  width: 300px;
  flex: none;
  position: relative;
  max-width: 100%;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  color: #94a3b8;
}
.search-box input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus {
  border-color: #b1a28f;
}

.filter-dropdown {
  flex-shrink: 0;
}

.filter-dropdown select {
  padding: 12px 30px 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  outline: none;
  min-width: 150px;
}

.tabs-container {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 30px;
  gap: 4px;
}
.tab-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-bottom: none;
  padding: 12px 20px;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  border-radius: 10px 10px 0 0;
}
.tab-btn:hover {
  color: #1e3a5f;
}
.tab-btn.active {
  background: white;
  color: #1e3a5f;
  font-weight: 700;
  border-color: #e2e8f0;
  border-bottom: 1px solid white;
  margin-bottom: -1px;
}
.tab-btn.active::after {
  display: none;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: visible; /* Changed to visible for dropdown */
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.card-image {
  height: 180px;
  position: relative;
  background: #f1f5f9;
  border-radius: 16px 16px 0 0;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px 16px 0 0;
}
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(4px);
}
.status-badge.active {
  background: #a3c9a0;
  color: #166534;
}
.status-badge.pending {
  background: #fef9c3;
  color: #854d0e;
}

/* Menu */
.menu-container {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}
.menu-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
.dropdown-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  min-width: 220px;
  width: max-content;
  max-width: 320px;
  z-index: 100;
  overflow: visible;
  animation: fadeIn 0.2s;
}
.menu-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  min-height: 40px;
}
.menu-item svg {
  flex-shrink: 0;
}
.menu-item:hover {
  background: #f8fafc;
}
.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  cursor: default;
}

.card-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.project-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.project-location {
  color: #64748b;
  font-size: 13px;
  margin: 0;
}
.project-description-line {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.progress-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.progress-label {
  font-size: 12px;
  color: #64748b;
}
.progress-value {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin-right: auto;
}
.progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  flex: 1 1 100%;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #b1a28f;
  border-radius: 3px;
  transition: width 0.2s;
}

.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #fef9c3;
  color: #854d0e;
}
.status-pill.expired {
  background: #fef3c7;
  color: #92400e;
}

.btn-view-details {
  margin-top: 8px;
  width: 100%;
  padding: 12px;
  background: #b1a28f;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}
.btn-view-details:hover {
  background: #8c7851;
}

.card-image-placeholder {
  height: 80px;
}
.card-image-placeholder .placeholder-block {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}
.placeholder-name {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}
.timeline-red {
  color: #dc2626;
}
.timeline-orange {
  color: #d97706;
}
.timeline-green {
  color: #16a34a;
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

/* Modals */
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

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}
.detail-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.detail-box .label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 5px;
}
.detail-box .value {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}
.value.highlight {
  color: #b1a28f;
  font-size: 16px;
}

.status-mini {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 5px;
}
.status-mini.ok {
  background: #dcfce7;
  color: #166534;
}
.status-mini.missing {
  background: #fee2e2;
  color: #991b1b;
}

.table-wrapper {
  overflow-x: auto;
  margin-top: 15px;
}
.units-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.units-table th,
.units-table td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: right;
}
.units-table th {
  color: #64748b;
  font-weight: 600;
  background: #f8fafc;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-text {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 13px;
}
.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Responsive: Large Tablet / Small Desktop */
@media (max-width: 1200px) {
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive: Tablet Landscape */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  .controls-area {
    width: 100%;
  }
  .search-box {
    width: auto;
    flex: 1;
    min-width: 200px;
  }
  .page-title {
    font-size: 24px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  .tabs-container {
    gap: 2px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex-wrap: nowrap;
  }
  .tab-btn {
    white-space: nowrap;
    font-size: 14px;
    padding: 10px 16px;
  }
  .modal-content.large {
    max-width: 90%;
  }
}

/* Responsive: Tablet Portrait */
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .controls-area {
    flex-direction: column;
    gap: 10px;
  }
  .btn-new-project {
    width: 100%;
    justify-content: center;
    min-height: 44px;
  }
  .filter-dropdown {
    width: 100%;
  }
  .filter-dropdown select {
    width: 100%;
    min-height: 44px;
  }
  .search-box {
    width: 100%;
    flex: none;
  }
  .search-box input {
    min-height: 44px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
  .card-image {
    height: 150px;
  }
  .card-content {
    padding: 14px;
    gap: 8px;
  }
  .tabs-container {
    margin-bottom: 20px;
  }
  .tab-btn {
    font-size: 13px;
    padding: 10px 14px;
    min-height: 44px;
  }
  .btn-view-details {
    min-height: 44px;
  }
  .modal-content {
    padding: 24px;
    border-radius: 14px;
  }
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
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
  .menu-item {
    min-height: 44px;
    padding: 12px 16px;
  }
  .modal-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }
  .modal-actions .btn-primary,
  .modal-actions .btn-text {
    width: 100%;
    text-align: center;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Responsive: Mobile */
@media (max-width: 576px) {
  .page-header {
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 12px;
  }
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .card-image {
    height: 140px;
  }
  .card-content {
    padding: 12px;
  }
  .project-name {
    font-size: 15px;
  }
  .tabs-container {
    gap: 2px;
    margin-bottom: 16px;
    padding-bottom: 2px;
  }
  .tab-btn {
    font-size: 12px;
    padding: 8px 10px;
    min-height: 44px;
  }
  .btn-new-project {
    padding: 10px 16px;
    font-size: 14px;
  }
  .modal-content {
    width: 95%;
    padding: 20px;
    max-height: 85vh;
  }
  .modal-content h3 {
    font-size: 18px;
  }
  .detail-box {
    padding: 12px;
  }
  .form-group label {
    font-size: 12px;
  }
  .form-input {
    padding: 10px;
    min-height: 44px;
  }
  .close-modal-btn {
    min-height: 44px;
  }
  .dropdown-menu {
    min-width: 180px;
  }
  .menu-item {
    font-size: 13px;
  }
}

/* Responsive: Extra Small Mobile */
@media (max-width: 320px) {
  .page-title {
    font-size: 18px;
  }
  .card-image {
    height: 120px;
  }
  .card-content {
    padding: 10px;
    gap: 6px;
  }
  .project-name {
    font-size: 14px;
  }
  .project-location {
    font-size: 12px;
  }
  .btn-view-details {
    padding: 10px;
    font-size: 13px;
  }
  .tab-btn {
    font-size: 11px;
    padding: 8px;
  }
  .modal-content {
    padding: 16px;
  }
  .status-pill {
    font-size: 11px;
    padding: 3px 10px;
  }
}

/* Responsive: Large Desktop */
@media (min-width: 1920px) {
  .page-title {
    font-size: 34px;
  }
  .page-subtitle {
    font-size: 17px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 28px;
  }
  .card-image {
    height: 220px;
  }
  .card-content {
    padding: 24px;
    gap: 14px;
  }
  .project-name {
    font-size: 18px;
  }
  .tab-btn {
    font-size: 16px;
    padding: 14px 28px;
  }
  .tabs-container {
    margin-bottom: 40px;
  }
  .btn-new-project {
    padding: 14px 28px;
    font-size: 16px;
  }
  .search-box {
    width: 400px;
  }
  .search-box input {
    padding: 14px 44px 14px 18px;
    font-size: 16px;
  }
  .filter-dropdown select {
    padding: 14px 34px 14px 18px;
    font-size: 16px;
  }
  .btn-view-details {
    padding: 14px;
    font-size: 16px;
  }
  .modal-content {
    padding: 40px;
  }
}

/* Responsive: Ultra-wide */
@media (min-width: 2560px) {
  .page-title {
    font-size: 38px;
  }
  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 32px;
  }
  .card-content {
    padding: 28px;
  }
}
</style>
