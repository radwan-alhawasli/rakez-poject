<template>
  <div class="developers-view">
    <!-- Header -->
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">إدارة المطورين</h1>
        <p class="welcome-subtitle">عرض وإدارة المطورين العقاريين ومشاريعهم.</p>
      </div>
    </div>

    <!-- Search -->
    <div class="search-container">
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
          placeholder="ابحث عن مطور بالاسم أو اسم الممثل..."
        />
      </div>
    </div>

    <!-- Developers Grid -->
    <div v-if="isLoading" class="loading-state">
      <span class="spinner"></span>
      <p>جاري تحميل المطورين...</p>
    </div>
    <div v-else-if="developers.length === 0" class="empty-state">
      <p>لا يوجد مطورين مطابقين للبحث.</p>
    </div>

    <template v-else>
      <div class="developers-grid">
        <div v-for="dev in developers" :key="dev.id" class="developer-card">
          <div class="card-header">
            <div class="dev-info">
              <h3 class="dev-name">{{ dev.name }}</h3>
              <span class="project-count">لديه {{ dev.projectCount }} مشاريع</span>
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

          <p class="card-disclaimer">التفاصيل الكاملة متاحة للمستخدمين المصرح لهم فقط.</p>

          <button class="view-projects-btn" @click="goToDeveloperDetail(dev)">عرض المشاريع</button>
        </div>
      </div>

      <div v-if="(meta.last_page || 0) > 1" class="pagination">
        <button
          type="button"
          class="pagination-btn"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          السابق
        </button>
        <span class="pagination-info">صفحة {{ currentPage }} من {{ meta.last_page || 1 }}</span>
        <button
          type="button"
          class="pagination-btn"
          :disabled="currentPage >= (meta.last_page || 1)"
          @click="goToPage(currentPage + 1)"
        >
          التالي
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import contractService from '@/services/contractService';
import logger from '@/utils/logger';
import { normalizeDeveloper } from '@/utils/developerMapper';

const PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

export default {
  name: 'DevelopersView',
  setup() {
    const router = useRouter();
    const searchQuery = ref('');
    const developers = ref([]);
    const isLoading = ref(true);
    const meta = ref({});
    const currentPage = ref(1);
    let searchDebounce = null;

    const fetchDevelopers = async () => {
      isLoading.value = true;
      try {
        const { data, meta: m } = await contractService.getDevelopersList({
          search: searchQuery.value.trim(),
          per_page: PER_PAGE,
          page: currentPage.value,
        });
        developers.value = (Array.isArray(data) ? data : []).map(d => normalizeDeveloper(d));
        meta.value = m;
      } catch (e) {
        logger.error('Failed to fetch developers', e);
        developers.value = [];
        meta.value = {};
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

    const goToPage = page => {
      if (page < 1 || page > (meta.value.last_page ?? 1)) return;
      currentPage.value = page;
      fetchDevelopers();
    };

    const goToDeveloperDetail = dev => {
      // إرسال بالـ id الرقمي فقط (GET /developers/:id) — القائمة يجب أن تُرجع حقل id من الـ API
      const identifier = dev.id ?? dev.developer_number;
      if (identifier == null || identifier === '') return;
      router.push({
        name: 'DeveloperDetail',
        params: { id: String(identifier) },
        state: { developer: dev },
      });
    };

    onMounted(() => {
      fetchDevelopers();
    });

    return {
      searchQuery,
      developers,
      meta,
      currentPage,
      fetchDevelopers,
      goToPage,
      goToDeveloperDetail,
    };
  },
};
</script>

<style scoped src="./styles/DevelopersView.scoped.s1.css"></style>
