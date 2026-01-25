<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">ربط المسوقين بفريق: {{ team.name }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="search-box">
          <input v-model="searchQuery" type="text" class="search-input" placeholder="ابحث عن مسوق بالاسم أو البريد..." />
        </div>

        <div class="marketers-list custom-scrollbar">
          <div v-if="filteredMarketers.length === 0" class="empty-state">
             لا يوجد مسوقين مطابقين للبحث.
          </div>
          <div 
            v-for="marketer in filteredMarketers" 
            :key="marketer.id" 
            class="marketer-item"
            :class="{ selected: selectedIds.includes(marketer.id) }"
            @click="toggleSelection(marketer.id)"
          >
            <div class="check-box">
              <svg v-if="selectedIds.includes(marketer.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="marketer-info">
              <div class="name">{{ marketer.name }}</div>
              <div class="email">{{ marketer.email }}</div>
            </div>
            <div v-if="marketer.team && marketer.team !== team.id" class="other-team-tag">
                عضو بالـ {{ marketer.teamName }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="selected-count">تم تحديد {{ selectedIds.length }} مسوقين</div>
        <div class="actions">
            <button class="btn-secondary" @click="$emit('close')">إلغاء</button>
            <button class="btn-primary" @click="handleSave" :disabled="isLoading">
                {{ isLoading ? 'جاري الحفظ...' : 'حفظ الروابط' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import userService from '../services/userService'

export default {
  name: 'LinkMarketersModal',
  props: {
    team: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const allMarketers = ref([])
    const selectedIds = ref([...(props.team.memberIds || [])])

    const fetchMarketers = async () => {
        try {
            // Fetch only marketers (type 0)
            const data = await userService.getEmployees({ type: 0 })
            allMarketers.value = data
        } catch (error) {
            console.error(error)
            // Mock if fails
            allMarketers.value = [
                { id: 101, name: 'أحمد العتيبي', email: 'ahmad@rakez.sa', team: props.team.id },
                { id: 102, name: 'سارة محمد', email: 'sara@rakez.sa', team: 2, teamName: 'فريق جدة' },
                { id: 103, name: 'خالد الصالح', email: 'khaled@rakez.sa' }
            ]
        }
    }

    const filteredMarketers = computed(() => {
        return allMarketers.value.filter(m => 
            m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    })

    const toggleSelection = (id) => {
        const index = selectedIds.value.indexOf(id)
        if (index > -1) {
            selectedIds.value.splice(index, 1)
        } else {
            selectedIds.value.push(id)
        }
    }

    const handleSave = () => {
        emit('submit', selectedIds.value)
    }

    onMounted(fetchMarketers)

    return {
        searchQuery,
        filteredMarketers,
        selectedIds,
        toggleSelection,
        handleSave
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
  z-index: 2100; backdrop-filter: blur(5px);
}

.modal-container {
  background: white; border-radius: 24px; width: 500px; max-width: 90%;
  max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out;
}

@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header {
  padding: 24px 30px; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-title { margin: 0; font-size: 20px; font-weight: 800; color: #1e3a5f; font-family: 'Amiri', serif; }

.close-btn { background: #f1f5f9; border: none; padding: 6px; border-radius: 8px; cursor: pointer; color: #94a3b8; display: flex; }

.modal-body { padding: 24px; flex: 1; overflow-y: auto; }

.search-box { margin-bottom: 20px; }
.search-input {
    width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px;
    font-family: 'Tajawal', sans-serif; transition: all 0.2s;
}
.search-input:focus { border-color: #B1A28F; outline: none; box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1); }

.marketers-list { display: flex; flex-direction: column; gap: 10px; max-height: 400px; }

.marketer-item {
    display: flex; align-items: center; gap: 15px; padding: 12px;
    border-radius: 12px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
}

.marketer-item:hover { background: #f8fafc; border-color: #cbd5e1; }
.marketer-item.selected { background: #fdfbf7; border-color: #B1A28F; }

.check-box {
    width: 20px; height: 20px; border-radius: 6px; border: 2px solid #cbd5e1;
    display: flex; align-items: center; justify-content: center; color: white;
}
.selected .check-box { background: #B1A28F; border-color: #B1A28F; }
.check-box svg { width: 14px; height: 14px; }

.marketer-info { flex: 1; }
.marketer-info .name { font-weight: 700; color: #1e293b; font-size: 14px; }
.marketer-info .email { font-size: 12px; color: #94a3b8; }

.other-team-tag { font-size: 10px; padding: 2px 8px; background: #e2e8f0; color: #475569; border-radius: 10px; font-weight: 600; }

.modal-footer {
    padding: 20px 24px; border-top: 1px solid #f1f5f9;
    display: flex; justify-content: space-between; align-items: center;
}

.selected-count { font-size: 13px; font-weight: 600; color: #64748b; }

.actions { display: flex; gap: 12px; }

.btn-primary, .btn-secondary {
    padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; font-family: 'Tajawal', sans-serif;
}

.btn-primary { background: #1e3a5f; color: white; }
.btn-secondary { background: #f1f5f9; color: #64748b; }

.empty-state { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
</style>
