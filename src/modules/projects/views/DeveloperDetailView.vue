<template>
  <div class="developer-detail-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">تفاصيل المطور</h1>
        <p class="welcome-subtitle">عرض تفاصيل المطور ومشاريعه</p>
      </div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <div v-if="developer.role" class="info-row">
            <span class="label">الصفة:</span>
            <span class="value">{{ developer.role }}</span>
          </div>
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
          <li
            v-for="p in projects"
            :key="p.id || p.contract_id"
            class="project-item project-item-clickable"
            role="button"
            @click="openProjectUnits(p)"
          >
            <span class="project-name">{{
              p.project_name || p.name || p.title || 'مشروع بدون اسم'
            }}</span>
            <span v-if="p.status" class="project-status">{{ statusLabelAr(p.status) }}</span>
            <span class="project-arrow" aria-hidden="true">←</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import contractService from '@/services/contractService';
import { normalizeDeveloper, enrichDeveloperFromContract } from '@/utils/developerMapper';
import { useFormatters } from '@/composables/useFormatters';
import logger from '@/utils/logger';

export default {
  name: 'DeveloperDetailView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const developer = ref(null);
    const projects = ref([]);
    const isLoadingProjects = ref(false);
    const { statusLabelAr } = useFormatters();

    const projectCount = computed(() => {
      if (developer.value?.projectCount != null) return Number(developer.value.projectCount);
      return Array.isArray(projects.value) ? projects.value.length : 0;
    });

    const goBack = () => {
      router.push({ name: 'Developers' });
    };

    const openProjectUnits = (project) => {
      const devId = route.params.id;
      const projectId = project.contract_id ?? project.id;
      if (!projectId) return;
      router.push({
        name: 'DeveloperProjectUnits',
        params: { id: devId, projectId: String(projectId) },
        state: { developer: developer.value, project },
      });
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
      const rawParam = route.params.id;
      if (!rawParam) return;
      const id = decodeURIComponent(String(rawParam));
      const looksLikeEmail = id.includes('@');

      if (looksLikeEmail) {
        developer.value = normalizeDeveloper({
          second_party_email: id,
          second_party_name: '—',
        });
        return;
      }

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
        applyContractDataToDeveloper();
      } catch (e) {
        logger.error('Failed to fetch developer projects', e);
        projects.value = [];
      } finally {
        isLoadingProjects.value = false;
      }
    };

    /** Fill developer card from first contract (عرض من العقد). */
    const applyContractDataToDeveloper = () => {
      if (!developer.value || !projects.value?.length) return;
      const firstContract = projects.value[0];
      developer.value = enrichDeveloperFromContract(developer.value, firstContract);
    };

    onMounted(async () => {
      const fromState = loadDeveloperFromState();
      if (!fromState) await loadDeveloperById();
      if (!developer.value) return;
      if (Array.isArray(developer.value.projects) && developer.value.projects.length > 0) {
        projects.value = developer.value.projects;
        applyContractDataToDeveloper();
      } else if (projects.value.length === 0 && developer.value?.email) {
        await loadProjects();
      } else if (projects.value.length > 0) {
        applyContractDataToDeveloper();
      }
    });

    return {
      developer,
      projects,
      projectCount,
      isLoadingProjects,
      goBack,
      openProjectUnits,
      statusLabelAr,
    };
  },
};
</script>

<style scoped src="./styles/DeveloperDetailView.scoped.s1.css"></style>
