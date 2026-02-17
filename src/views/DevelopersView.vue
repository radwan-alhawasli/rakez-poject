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
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" placeholder="ابحث عن مطور بالاسم أو اسم الممثل..." />
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="2" x2="9" y2="22"></line><line x1="15" y1="2" x2="15" y2="22"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>
          </div>
        </div>

        <p class="card-disclaimer">التفاصيل الكاملة متاحة للمستخدمين المصرح لهم فقط.</p>

        <button class="view-projects-btn" @click="goToDeveloperDetail(dev)">عرض المشاريع</button>
      </div>
    </div>

    <div v-if="(meta.last_page || 0) > 1" class="pagination">
      <button type="button" class="pagination-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">السابق</button>
      <span class="pagination-info">صفحة {{ currentPage }} من {{ meta.last_page || 1 }}</span>
      <button type="button" class="pagination-btn" :disabled="currentPage >= (meta.last_page || 1)" @click="goToPage(currentPage + 1)">التالي</button>
    </div>
    </template>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import contractService from '../services/contractService'
import logger from '../utils/logger'
import { normalizeDeveloper } from '../utils/developerMapper'

const PER_PAGE = 15
const SEARCH_DEBOUNCE_MS = 400

export default {
  name: 'DevelopersView',
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const developers = ref([])
    const isLoading = ref(true)
    const meta = ref({})
    const currentPage = ref(1)
    let searchDebounce = null

    const fetchDevelopers = async () => {
       isLoading.value = true
       try {
          const { data, meta: m } = await contractService.getDevelopersList({
            search: searchQuery.value.trim(),
            per_page: PER_PAGE,
            page: currentPage.value
          })
          developers.value = (Array.isArray(data) ? data : []).map(d => normalizeDeveloper(d))
          meta.value = m
       } catch (e) {
         logger.error('Failed to fetch developers', e)
         developers.value = []
         meta.value = {}
       } finally {
         isLoading.value = false
       }
    }

    watch(searchQuery, () => {
       if (searchDebounce) clearTimeout(searchDebounce)
       searchDebounce = setTimeout(() => {
         currentPage.value = 1
         fetchDevelopers()
       }, SEARCH_DEBOUNCE_MS)
    })

    const goToPage = (page) => {
       if (page < 1 || page > (meta.value.last_page ?? 1)) return
       currentPage.value = page
       fetchDevelopers()
    }

    const goToDeveloperDetail = (dev) => {
       router.push({
         name: 'DeveloperDetail',
         params: { id: String(dev.id) },
         state: { developer: dev }
       })
    }

    onMounted(() => {
       fetchDevelopers()
    })

    return {
       searchQuery,
       developers,
       meta,
       currentPage,
       fetchDevelopers,
       goToPage,
       goToDeveloperDetail
    }
  }
}
</script>

<style scoped>
.developers-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
}
.page-title {
  font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Amiri', serif;
}
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.search-container { margin-bottom: 30px; }
.search-box { position: relative; max-width: 500px; }
.search-box input {
   width: 100%; padding: 12px 40px 12px 15px; border: 1px solid #e2e8f0;
   border-radius: 10px; font-family: inherit; font-size: 14px;
   transition: border 0.3s;
}
.search-box input:focus { border-color: #1e3a5f; outline: none; }
.search-icon {
   position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 18px; color: #94a3b8;
}

.developers-grid {
   display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}

.developer-card {
   background: white; border: 1px solid #e2e8f0; border-radius: 12px;
   padding: 24px; transition: transform 0.2s, box-shadow 0.2s;
   display: flex; flex-direction: column;
}
.developer-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(0,0,0,0.05); }

.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.dev-name { font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0 0 4px 0; }
.project-count { font-size: 12px; color: #64748b; }
.dev-icon { 
   width: 40px; height: 40px; background: #f1f5f9; border-radius: 8px; color: #64748b;
   display: flex; align-items: center; justify-content: center;
}
.dev-icon svg { width: 20px; }

.card-disclaimer {
  flex: 1;
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.view-projects-btn {
   width: 100%; background: #1e3a5f; color: white; border: none; padding: 10px;
   border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.view-projects-btn:hover { background: #0f172a; }

.loading-state {
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
}
.loading-state .spinner {
  display: inline-block;
  width: 28px;
  height: 28px;
  border: 2px solid #e2e8f0;
  border-top-color: #1e3a5f;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

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
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #1e3a5f;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 14px;
  color: #64748b;
}
</style>
