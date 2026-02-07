<template>
  <div class="team-management-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">إدارة الفرق</h1>
        <p class="page-subtitle">إنشاء وتعديل وحذف فرق العمل</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة فريق جديد
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        @input="searchTeams"
        type="text" 
        class="search-input" 
        placeholder="البحث عن فريق..."
      />
      <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <!-- Teams Table -->
    <div v-else class="teams-table-container">
      <table class="teams-table">
        <thead>
          <tr>
            <th>اسم الفريق</th>
            <th>الوصف</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td class="team-name">{{ team.name }}</td>
            <td class="team-description">{{ team.description || '-' }}</td>
            <td>{{ formatDate(team.created_at) }}</td>
            <td class="actions">
              <button class="btn-icon view" @click="viewTeam(team)" title="عرض">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="btn-icon edit" @click="openEditModal(team)" title="تعديل">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete" @click="confirmDelete(team)" title="حذف">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="teams.length === 0" class="empty-state">
        <p>لا توجد فرق حالياً</p>
        <button class="btn-secondary" @click="openCreateModal">إنشاء فريق جديد</button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'تعديل الفريق' : 'إضافة فريق جديد' }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="saveTeam">
          <div class="form-group">
            <label>اسم الفريق *</label>
            <input 
              v-model="teamForm.name" 
              type="text" 
              class="form-input" 
              placeholder="أدخل اسم الفريق"
              required
            />
          </div>

          <div class="form-group">
            <label>الوصف</label>
            <textarea 
              v-model="teamForm.description" 
              class="form-input" 
              rows="4"
              placeholder="وصف الفريق (اختياري)"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-text" @click="closeModal">إلغاء</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'تحديث' : 'حفظ') }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import teamService from '../services/teamService'
import logger from '../utils/logger'

export default {
  name: 'TeamManagementView',
  setup() {
    const teams = ref([])
    const isLoading = ref(false)
    const showModal = ref(false)
    const isEditing = ref(false)
    const isSaving = ref(false)
    const searchQuery = ref('')
    
    const teamForm = reactive({
      id: null,
      name: '',
      description: ''
    })

    const fetchTeams = async (search = '') => {
      isLoading.value = true
      try {
        const data = await teamService.getTeams(search)
        teams.value = data
      } catch (error) {
        logger.error('Error fetching teams:', error)
        alert('حدث خطأ أثناء جلب البيانات')
      } finally {
        isLoading.value = false
      }
    }

    const searchTeams = () => {
      fetchTeams(searchQuery.value)
    }

    const openCreateModal = () => {
      isEditing.value = false
      teamForm.id = null
      teamForm.name = ''
      teamForm.description = ''
      showModal.value = true
    }

    const openEditModal = (team) => {
      isEditing.value = true
      teamForm.id = team.id
      teamForm.name = team.name
      teamForm.description = team.description || ''
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }

    const saveTeam = async () => {
      isSaving.value = true
      try {
        const payload = {
          name: teamForm.name,
          description: teamForm.description
        }

        if (isEditing.value) {
          await teamService.updateTeam(teamForm.id, payload)
          alert('تم تحديث الفريق بنجاح')
        } else {
          await teamService.createTeam(payload)
          alert('تم إنشاء الفريق بنجاح')
        }

        closeModal()
        fetchTeams(searchQuery.value)
      } catch (error) {
        logger.error('Error saving team:', error)
        alert('حدث خطأ أثناء الحفظ: ' + (error.response?.data?.message || error.message))
      } finally {
        isSaving.value = false
      }
    }

    const confirmDelete = async (team) => {
      if (!confirm(`هل أنت متأكد من حذف الفريق "${team.name}"؟`)) return

      try {
        await teamService.deleteTeam(team.id)
        alert('تم حذف الفريق بنجاح')
        fetchTeams(searchQuery.value)
      } catch (error) {
        logger.error('Error deleting team:', error)
        alert('حدث خطأ أثناء الحذف: ' + (error.response?.data?.message || error.message))
      }
    }

    const viewTeam = async (team) => {
      try {
        const data = await teamService.getTeamById(team.id)
        logger.debug('Team details:', data)
        // You can open a detail modal or navigate to a detail page here
        alert(`تفاصيل الفريق: ${team.name}\n\n${team.description || 'لا يوجد وصف'}`)
      } catch (error) {
        logger.error('Error viewing team:', error)
        alert('حدث خطأ أثناء عرض التفاصيل')
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    onMounted(() => {
      fetchTeams()
    })

    return {
      teams,
      isLoading,
      showModal,
      isEditing,
      isSaving,
      searchQuery,
      teamForm,
      fetchTeams,
      searchTeams,
      openCreateModal,
      openEditModal,
      closeModal,
      saveTeam,
      confirmDelete,
      viewTeam,
      formatDate
    }
  }
}
</script>

<style scoped>
.team-management-view {
  font-family: 'Tajawal', sans-serif;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-content h1 {
  font-size: 28px;
  color: #1a1a1a;
  margin: 0 0 5px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.search-container {
  position: relative;
  margin-bottom: 25px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border 0.2s;
}

.search-input:focus {
  border-color: #667eea;
  outline: none;
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 15px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.teams-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.teams-table {
  width: 100%;
  border-collapse: collapse;
}

.teams-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.teams-table th {
  padding: 15px;
  text-align: right;
  font-weight: 600;
  font-size: 14px;
}

.teams-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.teams-table tbody tr:hover {
  background: #f8f9ff;
}

.team-name {
  font-weight: 600;
  color: #333;
}

.team-description {
  color: #666;
  max-width: 400px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f0f0f0;
}

.btn-icon:hover {
  transform: translateY(-2px);
}

.btn-icon.view { background: #e3f2fd; color: #1976d2; }
.btn-icon.edit { background: #fff3e0; color: #f57c00; }
.btn-icon.delete { background: #ffebee; color: #c62828; }

.btn-icon.view:hover { background: #bbdefb; }
.btn-icon.edit:hover { background: #ffe0b2; }
.btn-icon.delete:hover { background: #ffcdd2; }

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Tajawal', sans-serif;
  transition: border 0.2s;
}

.form-input:focus {
  border-color: #667eea;
  outline: none;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-text {
  padding: 10px 20px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.2s;
}

.btn-text:hover {
  background: #f0f0f0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
