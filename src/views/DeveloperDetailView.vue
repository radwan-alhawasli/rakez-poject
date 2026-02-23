<template>
  <div class="developer-detail-view">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        العودة للمطورين
      </button>
    </div>

    <div v-if="!developer" class="empty-state">
      <p>لم يتم العثور على بيانات المطور. ربما تم فتح الرابط مباشرة.</p>
      <router-link to="/developers" class="link-back">العودة لقائمة المطورين</router-link>
    </div>

    <template v-else>
      <div class="detail-card">
        <div class="card-header">
          <div class="dev-info">
            <h1 class="dev-name">{{ developer.name }}</h1>
            <span class="project-count">لديه {{ projectCount }} مشاريع</span>
          </div>
          <div class="dev-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <line x1="9" y1="2" x2="9" y2="22"></line>
              <line x1="15" y1="2" x2="15" y2="22"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="7" x2="20" y2="7"></line>
              <line x1="4" y1="17" x2="20" y2="17"></line>
            </svg>
          </div>
        </div>

        <div class="card-body">
          <div class="info-row">
            <span class="label">الممثل:</span>
            <span class="value">{{ developer.representative || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">السجل التجاري:</span>
            <span class="value">{{ developer.commercialRecord || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">الهاتف:</span>
            <span class="value">{{ developer.phone || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">الموقع:</span>
            <span class="value">{{ developer.location || '-' }}</span>
          </div>
          <div v-if="developer.email" class="info-row">
            <span class="label">البريد الإلكتروني:</span>
            <span class="value">{{ developer.email }}</span>
          </div>
        </div>
      </div>

      <section class="projects-section">
        <h2 class="section-title">المشاريع</h2>
        <div v-if="isLoadingProjects" class="loading-state">
          <span class="spinner"></span>
          <p>جاري تحميل المشاريع...</p>
        </div>
        <div v-else-if="projects.length === 0" class="empty-projects">
          <p>لا توجد مشاريع مسجلة لهذا المطور.</p>
        </div>
        <ul v-else class="projects-list">
          <li v-for="p in projects" :key="p.id || p.contract_id" class="project-item">
            <span class="project-name">{{
              p.project_name || p.name || p.title || 'مشروع بدون اسم'
            }}</span>
            <span v-if="p.status" class="project-status">{{ p.status }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import contractService from '../services/contractService';
import { normalizeDeveloper } from '../utils/developerMapper';
import logger from '../utils/logger';

export default {
  name: 'DeveloperDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const developer = ref(null);
    const projects = ref([]);
    const isLoadingProjects = ref(false);

    const projectCount = computed(() => {
      if (developer.value?.projectCount != null) return Number(developer.value.projectCount);
      return Array.isArray(projects.value) ? projects.value.length : 0;
    });

    const goBack = () => {
      router.push({ name: 'Developers' });
    };

    const loadDeveloperFromState = () => {
      const state = window.history.state;
      if (state?.developer) {
        developer.value = state.developer;
        return true;
      }
      return false;
    };

    const loadDeveloperById = async () => {
      const id = route.params.id;
      if (!id) return;
      try {
        const raw = await contractService.getDeveloperDetail(id);
        if (raw && typeof raw === 'object') {
          developer.value = normalizeDeveloper(raw);
          if (Array.isArray(raw.projects)) projects.value = raw.projects;
        }
      } catch (e) {
        logger.error('Failed to load developer detail', e);
      }
    };

    const loadProjects = async () => {
      if (!developer.value?.email) return;
      isLoadingProjects.value = true;
      try {
        const res = await contractService.getDeveloperContractsByEmail(developer.value.email);
        const raw = res?.data ?? res;
        projects.value = Array.isArray(raw) ? raw : raw && Array.isArray(raw.data) ? raw.data : [];
      } catch (e) {
        logger.error('Failed to fetch developer projects', e);
        projects.value = [];
      } finally {
        isLoadingProjects.value = false;
      }
    };

    onMounted(async () => {
      const fromState = loadDeveloperFromState();
      if (!fromState) await loadDeveloperById();
      if (!developer.value) return;
      if (Array.isArray(developer.value.projects) && developer.value.projects.length > 0) {
        projects.value = developer.value.projects;
      } else if (projects.value.length === 0 && developer.value?.email) {
        await loadProjects();
      }
    });

    return {
      developer,
      projects,
      projectCount,
      isLoadingProjects,
      goBack,
    };
  },
};
</script>

<style scoped>
.developer-detail-view {
  font-family: 'Tajawal', sans-serif;
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
  margin-bottom: 24px;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  color: #1e3a5f;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, border-color 0.2s;
}
.back-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}
.back-btn svg {
  width: 18px;
  height: 18px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}
.empty-state p {
  color: #64748b;
  margin: 0 0 16px 0;
}
.link-back {
  color: #1e3a5f;
  font-weight: 600;
  text-decoration: none;
}
.link-back:hover {
  text-decoration: underline;
}

.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.dev-name {
  font-size: 24px;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 4px 0;
}
.project-count {
  font-size: 14px;
  color: #64748b;
}
.dev-icon {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dev-icon svg {
  width: 24px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.info-row .label {
  color: #94a3b8;
}
.info-row .value {
  color: #1e293b;
  font-weight: 600;
}

.projects-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 16px 0;
}
.loading-state,
.empty-projects {
  text-align: center;
  padding: 24px;
  color: #64748b;
}
.loading-state .spinner,
.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #1e3a5f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 8px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.projects-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 8px;
}
.project-item:last-child {
  margin-bottom: 0;
}
.project-name {
  font-weight: 600;
  color: #1e293b;
}
.project-status {
  font-size: 12px;
  color: #64748b;
}
</style>
