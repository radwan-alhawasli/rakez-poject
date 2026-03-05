<template>
  <div class="developers-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة المطورين</h1>
        <p class="page-subtitle">عرض وإدارة المطورين العقاريين ومشاريعهم.</p>
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
      router.push({
        name: 'DeveloperDetail',
        params: { id: String(dev.id) },
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

<style scoped>
.developers-view {
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
  align-items: center;
  margin-bottom: 30px;
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-navy);
  margin: 0 0 5px 0;
}
.page-subtitle {
  color: var(--color-dark-gray);
  font-size: 15px;
  margin: 0;
}

.search-container {
  margin-bottom: 30px;
}
.search-box {
  position: relative;
  max-width: 500px;
}
.search-box input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  transition: border 0.3s;
}
.search-box input:focus {
  border-color: var(--color-navy);
  outline: none;
}
.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  color: var(--color-dark-gray);
}

.developers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.developer-card {
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.developer-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.dev-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy);
  margin: 0 0 4px 0;
}
.project-count {
  font-size: 12px;
  color: var(--color-dark-gray);
}
.dev-icon {
  width: 40px;
  height: 40px;
  background: var(--color-light-gray);
  border-radius: 8px;
  color: var(--color-dark-gray);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dev-icon svg {
  width: 20px;
}

.card-disclaimer {
  flex: 1;
  margin: 0 0 20px 0;
  font-size: 13px;
  color: var(--color-dark-gray);
  line-height: 1.5;
}

.view-projects-btn {
  width: 100%;
  background: var(--color-navy);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.view-projects-btn:hover {
  background: #0f172a;
}

.loading-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-dark-gray);
}
.loading-state .spinner {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-medium-gray);
  border-top-color: var(--color-navy);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}
.pagination-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  background: #fff;
  color: var(--color-navy);
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.pagination-btn:hover:not(:disabled) {
  background: var(--color-light-gray);
  border-color: var(--color-medium-gray);
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 14px;
  color: var(--color-dark-gray);
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }
  .page-title {
    font-size: 24px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .page-title {
    font-size: 22px;
  }
  .page-subtitle {
    font-size: 14px;
  }
  .search-box {
    max-width: 100%;
  }
  .developers-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .developer-card {
    padding: 20px;
  }
  .pagination {
    flex-wrap: wrap;
    gap: 10px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .developers-view {
    overflow-x: hidden;
  }
  .page-title {
    font-size: 20px;
  }
  .page-subtitle {
    font-size: 13px;
  }
  .search-container {
    margin-bottom: 20px;
  }
  .search-box input {
    padding: 10px 36px 10px 12px;
    font-size: 13px;
  }
  .developer-card {
    padding: 16px;
    border-radius: 10px;
  }
  .dev-name {
    font-size: 16px;
  }
  .card-disclaimer {
    font-size: 12px;
  }
  .view-projects-btn {
    padding: 12px;
    min-height: 44px;
    font-size: 14px;
  }
  .pagination-btn {
    padding: 10px 14px;
    min-height: 44px;
    font-size: 13px;
  }
  .pagination-info {
    font-size: 13px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .page-title {
    font-size: 18px;
  }
  .developer-card {
    padding: 12px;
  }
  .card-header {
    gap: 8px;
  }
  .dev-name {
    font-size: 15px;
  }
  .dev-icon {
    width: 34px;
    height: 34px;
  }
  .dev-icon svg {
    width: 16px;
  }
  .card-disclaimer {
    font-size: 11px;
    margin-bottom: 14px;
  }
  .view-projects-btn {
    font-size: 13px;
  }
  .pagination {
    padding: 10px 0;
  }
  .pagination-btn {
    padding: 8px 10px;
    font-size: 12px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  .page-title {
    font-size: 30px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 28px;
  }
  .page-title {
    font-size: 32px;
  }
  .page-subtitle {
    font-size: 16px;
  }
  .developer-card {
    padding: 28px;
  }
  .dev-name {
    font-size: 20px;
  }
  .card-disclaimer {
    font-size: 14px;
  }
  .view-projects-btn {
    padding: 12px;
    font-size: 15px;
  }
  .search-box input {
    padding: 14px 44px 14px 18px;
    font-size: 15px;
  }
  .page-header {
    margin-bottom: 36px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 32px;
  }
  .page-title {
    font-size: 36px;
  }
  .page-subtitle {
    font-size: 18px;
  }
  .developer-card {
    padding: 32px;
    border-radius: 16px;
  }
  .dev-name {
    font-size: 22px;
  }
  .dev-icon {
    width: 48px;
    height: 48px;
  }
  .dev-icon svg {
    width: 24px;
  }
  .card-disclaimer {
    font-size: 15px;
  }
  .view-projects-btn {
    padding: 14px;
    font-size: 16px;
    border-radius: 10px;
  }
  .search-box {
    max-width: 600px;
  }
  .search-box input {
    padding: 16px 48px 16px 20px;
    font-size: 16px;
    border-radius: 12px;
  }
  .pagination-btn {
    padding: 12px 24px;
    font-size: 16px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .developers-grid {
    grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
    gap: 40px;
  }
  .page-title {
    font-size: 42px;
  }
  .page-subtitle {
    font-size: 20px;
  }
  .developer-card {
    padding: 40px;
    border-radius: 20px;
  }
  .dev-name {
    font-size: 26px;
  }
  .project-count {
    font-size: 16px;
  }
  .dev-icon {
    width: 56px;
    height: 56px;
  }
  .card-disclaimer {
    font-size: 17px;
  }
  .view-projects-btn {
    padding: 16px;
    font-size: 18px;
    border-radius: 12px;
  }
  .search-box {
    max-width: 700px;
  }
  .search-box input {
    padding: 18px 52px 18px 22px;
    font-size: 18px;
  }
  .page-header {
    margin-bottom: 44px;
  }
  .pagination-btn {
    padding: 14px 28px;
    font-size: 18px;
    border-radius: 10px;
  }
  .pagination-info {
    font-size: 18px;
  }
}
</style>
