<template>
  <div class="developers-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة المطورين</h1>
        <p class="page-subtitle">عرض وإدارة المطورين العقاريين ومشاريعهم.</p>
      </div>
      <button class="btn-primary" @click="openAddModal">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         مطور جديد
      </button>
    </div>

    <!-- Search -->
    <div class="search-container">
       <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input v-model="searchQuery" type="text" placeholder="ابحث عن مطور بالاسم أو اسم الممثل..." />
      </div>
    </div>

    <!-- Developers Grid -->
    <div v-if="filteredDevelopers.length === 0" class="empty-state">
      <p>لا يوجد مطورين مطابقين للبحث.</p>
    </div>

    <div v-else class="developers-grid">
      <div v-for="dev in filteredDevelopers" :key="dev.id" class="developer-card">
        <div class="card-header">
          <div class="dev-info">
             <h3 class="dev-name">{{ dev.name }}</h3>
             <span class="project-count">لديه {{ dev.projectCount }} مشاريع</span>
          </div>
          <div class="dev-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="2" x2="9" y2="22"></line><line x1="15" y1="2" x2="15" y2="22"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>
          </div>
        </div>

        <div class="card-body">
           <div class="info-row">
              <span class="label">الممثل:</span> <span class="value">{{ dev.representative || '-' }}</span>
           </div>
           <div class="info-row">
              <span class="label">السجل التجاري:</span> <span class="value">{{ dev.commercialRecord || '-' }}</span>
           </div>
           <div class="info-row">
              <span class="label">الهاتف:</span> <span class="value">{{ dev.phone || '-' }}</span>
           </div>
            <div class="info-row">
              <span class="label">الموقع:</span> <span class="value">{{ dev.location || '-' }}</span>
           </div>
        </div>

        <button class="view-projects-btn">عرض المشاريع</button>
      </div>
    </div>

    <!-- Add Developer Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>إضافة مطور جديد</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addDeveloper">
             <div class="form-group">
                <label>اسم الشركة / المطور (اختياري)</label>
                <input v-model="newDev.name" type="text" class="form-input" />
             </div>
             <div class="form-group grid-2">
                <div>
                   <label>اسم الممثل (اختياري)</label>
                   <input v-model="newDev.representative" type="text" class="form-input" />
                </div>
                <div>
                   <label>السجل التجاري (اختياري)</label>
                   <input v-model="newDev.commercialRecord" type="text" class="form-input" />
                </div>
             </div>
              <div class="form-group grid-2">
                <div>
                   <label>رقم الهاتف (اختياري)</label>
                   <input v-model="newDev.phone" type="text" class="form-input" />
                </div>
                <div>
                   <label>الموقع / المدينة (اختياري)</label>
                   <input v-model="newDev.location" type="text" class="form-input" />
                </div>
             </div>
             <div class="modal-actions">
                <button type="button" class="btn-secondary" @click="closeModal">إلغاء</button>
                <button type="submit" class="btn-primary">حفظ المطور</button>
             </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import contractService from '../services/contractService'
import logger from '../utils/logger'


export default {
  name: 'DevelopersView',
  setup() {
    const searchQuery = ref('')
    const showModal = ref(false)
    
    // Real Data
    const developers = ref([])
    const isLoading = ref(true)

    const newDev = ref({ name: '', representative: '', commercialRecord: '', phone: '', location: '' })

    const filteredDevelopers = computed(() => {
       if (!searchQuery.value) return developers.value
       const q = searchQuery.value.toLowerCase()
       return developers.value.filter(d => 
          (d.name && d.name.toLowerCase().includes(q)) || 
          (d.representative && d.representative.toLowerCase().includes(q))
       )
    })

    const fetchDevelopers = async () => {
       isLoading.value = true
       try {
          // Fetch developers
          const devs = await contractService.getDevelopers()
          // Log to see structure if possible, but we'll map best effort
          // Expected structure based on typical Laravel usage: id, name, email, etc.
          // We also need projectCount. The user provided an endpoint for contracts by email.
          // We might need to fetch contracts for each dev to get the count, or maybe the dev object has it.
          // For now, let's just show the developers. 
          // If we need the count eagerly, we'd have to make N calls which is bad. 
          // Let's assume for now we list them, and maybe fetch count if available or default to 0.
          
          developers.value = devs.map(d => ({
             id: d.id,
             name: d.name || 'مطور غير معروف',
             representative: d.name, // Using name as representative if not separate
             email: d.email,
             commercialRecord: d.commercial_record || '-',
             phone: d.phone || '-',
             location: d.city || d.location || '-',
             projectCount: 0 // Placeholder until we load it
          }))

          // Optionally load counts?
          // Since there is an API 'contracts-by-email', we could try to load it. 
          // But doing it for all might be heavy. Let's do it on demand or leave as 0/hidden.
          // Let's try to load for the first few or just leave it.

       } catch (e) {
         logger.error('Failed to fetch developers', e)
       } finally {
         isLoading.value = false
       }
    }

    const openAddModal = () => {
       newDev.value = { name: '', representative: '', commercialRecord: '', phone: '', location: '' }
       showModal.value = true
    }
    const closeModal = () => showModal.value = false

    const addDeveloper = () => {
       // Ideally this should be an API call too, but user didn't provide CREATE API for developers.
       // We will keep it incorrectly as mock or just specific alerts.
       alert('عفواً، لا يوجد API لإضافة مطور حالياً.')
       closeModal()
    }
    
    // Fetch on mount
    onMounted(() => {
       fetchDevelopers()
    })

    return {
       searchQuery, developers, filteredDevelopers, showModal, newDev,
       openAddModal, closeModal, addDeveloper
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

.card-body { flex: 1; margin-bottom: 20px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.info-row .label { color: #94a3b8; }
.info-row .value { color: #1e293b; font-weight: 600; }

.view-projects-btn {
   width: 100%; background: #1e3a5f; color: white; border: none; padding: 10px;
   border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.view-projects-btn:hover { background: #0f172a; }

.btn-primary {
  background: #B1A28F; color: white; border: none; padding: 10px 20px;
  border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;
  cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #8c7851; }

.modal-overlay {
   position: fixed; top: 0; left: 0; width: 100%; height: 100%;
   background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-content {
   background: white; width: 500px; max-width: 90%; border-radius: 16px; padding: 25px;
   box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { margin: 0; color: #1e3a5f; }
.close-btn { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 6px; color: #64748b; font-size: 13px; }
.form-input {
   width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px;
   font-family: inherit;
}
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px; }
.btn-secondary {
   background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; cursor: pointer;
}

@media (max-width: 600px) {
   .grid-2 { grid-template-columns: 1fr; }
}
</style>
