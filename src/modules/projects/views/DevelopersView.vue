<template>
  <div class="developers-view project-management-view project-management-design developers-view--rakez" dir="rtl">
    <div class="welcome-header project-mgmt-header developers-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة المطورين</h1>
        <p class="welcome-subtitle">الأطراف الثانية (المطورون) المرتبطة بالعقود — من مصدر بيانات موحّد.</p>
      </div>
      <div class="controls-area">
        <div class="search-container">
          <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="ابحث بالاسم، البريد، السجل التجاري، الهاتف..."
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <div class="view-content developers-view-content">
      <!-- خلفية بيج خلف اللوحات فقط (مثل إدارة المشاريع) -->
      <div class="developers-panels-surface">
        <div v-if="isLoading" class="developers-loading" aria-busy="true" aria-live="polite">
          <div class="developers-skeleton-grid" role="presentation">
            <div v-for="n in 6" :key="n" class="developer-skeleton-card">
              <div class="developer-skeleton-visual loading-skeleton"></div>
              <div class="developer-skeleton-body">
                <div class="loading-skeleton developer-skeleton-line developer-skeleton-line--title"></div>
                <div class="loading-skeleton developer-skeleton-line developer-skeleton-line--sub"></div>
                <div class="loading-skeleton developer-skeleton-line developer-skeleton-line--meta"></div>
                <div class="loading-skeleton developer-skeleton-btn"></div>
              </div>
            </div>
          </div>
          <p class="developers-loading-caption">جاري تحميل المطورين...</p>
        </div>
        <div v-else-if="allDevelopers.length === 0" class="empty-state developers-empty">
          <div class="developers-empty-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 8L12 18v16c0 11.2 8.5 21.6 20 24 11.5-2.4 20-12.8 20-24V18L32 8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <path d="M24 32l6 6 12-12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="developers-empty-text">
            {{ allDevelopers.length === 0 ? 'لا توجد أطراف ثانية مسجّلة حالياً.' : 'لا يوجد مطابق لبحثك.' }}
          </p>
        </div>
        <div v-else class="projects-grid developers-cards-grid">
          <article
            v-for="dev in allDevelopers"
            :key="developerRowKey(dev)"
            class="developer-pm-card rakez-card"
          >
            <div class="developer-card-visual">
              <span class="developer-card-avatar" aria-hidden="true">{{ developerInitial(dev) }}</span>
              <span v-if="dev.projectCount > 0" class="developer-card-badge">{{ dev.projectCount }} عقد</span>
            </div>
            <div class="card-title-block">
              <h3 class="card-title-main">{{ dev.name }}</h3>
              <p v-if="dev.role" class="card-title-type">{{ dev.role }}</p>
              <p v-else class="card-title-type muted">طرف ثانٍ</p>
            </div>
            <div class="card-content developer-card-body">
              <div class="developer-meta-row" v-if="dev.commercialRecord && dev.commercialRecord !== '-'">
                <span class="meta-label">السجل التجاري</span>
                <span class="meta-value number">{{ dev.commercialRecord }}</span>
              </div>
              <div class="developer-meta-row" v-if="dev.email">
                <span class="meta-label">البريد</span>
                <span class="meta-value meta-ellipsis" :title="dev.email">{{ dev.email }}</span>
              </div>
              <div class="developer-meta-row" v-if="dev.phone && dev.phone !== '-'">
                <span class="meta-label">الهاتف</span>
                <span class="meta-value number">{{ dev.phone }}</span>
              </div>
              <div class="developer-meta-row" v-if="dev.location && dev.location !== '-'">
                <span class="meta-label">العنوان</span>
                <span class="meta-value meta-ellipsis" :title="dev.location">{{ dev.location }}</span>
              </div>
              <button type="button" class="btn-view-details rakez-btn" @click="goToDeveloperDetail(dev)">
                عرض المشاريع والعقود
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
            </div>
          </article>
        </div>
        <Pagination
          v-if="totalItems > 0 && !isLoading"
          :current-page="currentPage"
          :total-items="totalItems"
          :per-page="perPage"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { normalizeDeveloper } from '@/utils/developerMapper';
import Pagination from '@/components/Pagination.vue';

const SEARCH_DEBOUNCE_MS = 350;

export default {
  name: 'DevelopersView',
  components: { Pagination },
  setup() {
    const router = useRouter();
    const searchQuery = ref('');
    const allDevelopers = ref([]);
    const isLoading = ref(true);
    const currentPage = ref(1);
    const perPage = ref(15);
    const totalItems = ref(0);
    let searchDebounce = null;

    const fetchDevelopers = async () => {
      isLoading.value = true;
      try {
        // GET /second-party-data/second-parties?page=4
        const { data, meta } = await contractService.getSecondPartiesList({
          search: searchQuery.value?.trim() || undefined,
          page: currentPage.value,
          per_page: perPage.value,
        });
        const list = Array.isArray(data) ? data : [];
        allDevelopers.value = list.map(d => normalizeDeveloper(d));
        totalItems.value = Number(meta?.total ?? list.length ?? 0);
      } catch (e) {
        logger.error('Failed to fetch developers list', e);
        allDevelopers.value = [];
        totalItems.value = 0;
      } finally {
        isLoading.value = false;
      }
    };

    watch(searchQuery, () => {
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        currentPage.value = 1;
        fetchDevelopers();
      }, SEARCH_DEBOUNCE_MS);
    });

    const handlePageChange = page => {
      currentPage.value = page;
      fetchDevelopers();
    };

    const handlePerPageChange = value => {
      perPage.value = value;
      currentPage.value = 1;
      fetchDevelopers();
    };

    const developerRowKey = dev => {
      if (dev?.id != null && dev.id !== '') return String(dev.id);
      if (dev?.email) return dev.email;
      return JSON.stringify(dev ?? {}).slice(0, 48);
    };

    const developerInitial = dev => {
      const n = (dev?.name || dev?.email || '?').trim();
      return n.charAt(0).toUpperCase() || '?';
    };

    const goToDeveloperDetail = dev => {
      const identifier = dev.id ?? dev.email;
      if (identifier == null || identifier === '') return;
      router.push({
        name: 'DeveloperDetail',
        params: { id: encodeURIComponent(String(identifier)) },
        state: { developer: dev },
      });
    };

    onMounted(() => {
      fetchDevelopers();
    });

    return {
      searchQuery,
      allDevelopers,
      isLoading,
      currentPage,
      perPage,
      totalItems,
      developerRowKey,
      developerInitial,
      goToDeveloperDetail,
      handlePageChange,
      handlePerPageChange,
    };
  },
};
</script>

<style scoped src="./styles/DevelopersView.scoped.s1.css"></style>
<style scoped src="./styles/DevelopersView.scoped.s2.css"></style>

