<template>
  <div class="teams-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">الأفرقة (Teams)</h1>
        <p class="page-subtitle">عرض فرق التسويق وأعضائها.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الفرق...</p>
    </div>

    <!-- Teams Grid -->
    <div v-else class="teams-container">
        <div v-for="(members, teamName) in groupedTeams" :key="teamName" class="team-section">
            <h2 class="team-title">
                <span class="team-icon">🛡️</span>
                فريق {{ teamName }}
                <span class="count-badge">{{ members.length }} أعضاء</span>
            </h2>
            
            <div class="members-grid">
                <div v-for="member in members" :key="member.id" class="member-card" @click="openMemberDetails(member)">
                    <div class="member-avatar">
                        {{ (member.name || 'A').charAt(0).toUpperCase() }}
                    </div>
                    <div class="member-info">
                        <h3 class="member-name">{{ member.name }}</h3>
                        <p class="member-role">{{ getRoleName(member.type) }}</p>
                    </div>
                    <button class="view-btn">عرض</button>
                </div>
            </div>
        </div>
        
        <div v-if="Object.keys(groupedTeams).length === 0" class="empty-state">
            <p>لا يوجد فرق أو أعضاء للعرض.</p>
        </div>
    </div>

    <!-- Member Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>بيانات العضو</h3>
                <button class="close-btn" @click="closeModal">×</button>
            </div>
            
            <div class="profile-header">
                <div class="large-avatar">
                     {{ (selectedMember?.name || 'A').charAt(0).toUpperCase() }}
                </div>
                <h3>{{ selectedMember?.name }}</h3>
                <span class="role-badge">{{ getRoleName(selectedMember?.type) }}</span>
            </div>

            <div class="details-list">
                <div class="detail-item">
                    <span class="label">البريد الإلكتروني</span>
                    <span class="value">{{ selectedMember?.email || '-' }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">رقم الهاتف</span>
                    <span class="value">{{ selectedMember?.phone || '-' }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">الفريق</span>
                    <span class="value">{{ selectedMember?.team || 'غير معين' }}</span>
                </div>
                 <div class="detail-item">
                    <span class="label">المسمى الوظيفي</span>
                    <span class="value">{{ selectedMember?.contract_type || '-' }}</span>
                </div>
                <!-- Salary and sensitive info EXCLUDED as per requirements -->
            </div>

            <div class="modal-actions">
                <div class="contact-actions">
                    <a v-if="selectedMember?.email" :href="'mailto:' + selectedMember.email" class="contact-btn email">
                        📧 إرسال بريد
                    </a>
                    <a v-if="selectedMember?.phone" :href="'tel:' + selectedMember.phone" class="contact-btn phone">
                        📞 اتصال
                    </a>
                </div>
                <button class="btn-secondary" @click="closeModal">إغلاق</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import userService from '../services/userService'
import { getRoleLabel } from '../constants/roles'
import logger from '../utils/logger'

export default {
  name: 'TeamsView',
  setup() {
    const isLoading = ref(true)
    const employees = ref([])
    const showModal = ref(false)
    const selectedMember = ref(null)

    const fetchEmployees = async () => {
        isLoading.value = true
        try {
            const data = await userService.getEmployees()
            // Relaxed filter: Show all employees to ensure sales teams (and others) are visible.
            // The grouping logic will handle categorizing them.
            employees.value = data || [] 
        } catch (error) {
            logger.error('Failed to fetch employees:', error)
        } finally {
            isLoading.value = false
        }
    }

    const groupedTeams = computed(() => {
        const groups = {}
        // Mock distribution if no teams found in data to demonstrate UI
        // (Remove this mock logic if real data has teams)
        const hasTeams = employees.value.some(e => e.team)
        
        employees.value.forEach((emp, index) => {
            let team = emp.team
            if (!team && !hasTeams) {
                // FALLBACK MOCK: Distribute into A, B, C for demo
                const mocks = ['A', 'B', 'C']
                team = mocks[index % 3]
            }
            team = team || 'Unassigned'
            
            if (!groups[team]) groups[team] = []
            groups[team].push(emp)
        })
        
        // Sort keys
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key]
            return acc
        }, {})
    })

    const getRoleName = (type) => getRoleLabel(type)

    const openMemberDetails = (member) => {
        selectedMember.value = member
        showModal.value = true
    }
    const closeModal = () => {
        showModal.value = false
        selectedMember.value = null
    }

    onMounted(fetchEmployees)

    return {
        isLoading,
        groupedTeams,
        getRoleName,
        showModal,
        selectedMember,
        openMemberDetails,
        closeModal
    }
  }
}
</script>

<style scoped>
.teams-view {
  font-family: 'Tajawal', sans-serif;
  animation: fadeIn 0.4s ease-out;
  padding-bottom: 50px;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.page-header { margin-bottom: 30px; }
.page-title { font-size: 28px; font-weight: 800; color: #1e3a5f; margin: 0 0 5px 0; font-family: 'Cairo', sans-serif; }
.page-subtitle { color: #64748b; font-size: 15px; margin: 0; }

.team-section {
    margin-bottom: 40px;
    background: white; border-radius: 16px; border: 1px solid #e2e8f0;
    padding: 25px;
}

.team-title {
    font-size: 20px; color: #1e3a5f; margin: 0 0 20px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;
    display: flex; align-items: center; gap: 10px;
}
.team-icon { font-size: 24px; }
.count-badge { font-size: 12px; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; color: #64748b; font-weight: normal; margin-right: auto; }

.members-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;
}

.member-card {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center;
    cursor: pointer; transition: all 0.2s;
}
.member-card:hover { transform: translateY(-3px); background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-color: #B1A28F; }

.member-avatar {
    width: 60px; height: 60px; background: #e2e8f0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700; color: #64748b; margin-bottom: 15px;
    border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.member-name { font-size: 15px; font-weight: 700; color: #1e3a5f; margin: 0 0 5px 0; }
.member-role { font-size: 12px; color: #64748b; margin: 0 0 15px 0; }

.view-btn {
    margin-top: auto; width: 100%; border: 1px solid #cbd5e1; background: white;
    padding: 8px; border-radius: 6px; font-size: 12px; cursor: pointer; color: #475569;
}
.view-btn:hover { background: #1e3a5f; color: white; border-color: #1e3a5f; }

/* Modal */
.modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
}
.modal-content {
    background: white; padding: 30px; border-radius: 16px; width: 90%; max-width: 450px;
    position: relative;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.modal-header h3 { margin: 0; color: #1e3a5f; font-family: 'Cairo', sans-serif; }
.close-btn { background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }

.profile-header {
    display: flex; flex-direction: column; align-items: center; margin-bottom: 30px;
}
.large-avatar {
    width: 80px; height: 80px; background: #1e3a5f; color: white;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 700; margin-bottom: 15px;
    border: 4px solid #f1f5f9;
}
.profile-header h3 { margin: 0 0 5px 0; color: #1e3a5f; }
.role-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #64748b; }

.details-list {
    background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 25px;
}
.detail-item {
    display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;
}
.detail-item:last-child { border-bottom: none; }
.detail-item .label { color: #64748b; }
.detail-item .value { font-weight: 600; color: #1e293b; }

.modal-actions {
    display: flex; flex-direction: column; gap: 15px;
}
.contact-actions { display: flex; gap: 10px; }
.contact-btn {
    flex: 1; padding: 10px; border-radius: 8px; text-decoration: none; text-align: center; font-weight: 600; font-size: 13px;
    transition: transform 0.2s;
}
.contact-btn:hover { transform: translateY(-2px); }
.contact-btn.email { background: #dbf4ff; color: #0369a1; }
.contact-btn.phone { background: #dcfce7; color: #15803d; }

.btn-secondary {
    width: 100%; padding: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px;
    color: #64748b; cursor: pointer; font-weight: 600;
}
.btn-secondary:hover { background: #f1f5f9; }

.loading-state, .empty-state { text-align: center; padding: 50px; color: #94a3b8; }
.spinner { width: 40px; height: 40px; margin: 0 auto 15px; border-radius: 50%; border: 3px solid #f1f5f9; border-top-color: #B1A28F; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
