<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">ربط المسوقين بفريق: {{ team.name }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="ابحث عن مسوق بالاسم أو البريد..."
          />
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
              <svg
                v-if="selectedIds.includes(marketer.id)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
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
import { ref, computed, onMounted } from 'vue';
import userService from '@/services/userService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';

const isTruthyFlag = value => value === true || value === 1 || value === '1';

const isDisallowedSalesRole = user => {
  const role = Number(user?.type ?? user?.user?.type ?? user?.employee_type);
  if (role !== 6) return false;
  const isManager = isTruthyFlag(user?.is_manager ?? user?.user?.is_manager);
  const isExecutive = isTruthyFlag(
    user?.is_executive_director ?? user?.user?.is_executive_director
  );
  return isManager || isExecutive;
};

export default {
  name: 'LinkMarketersModal',
  props: {
    team: {
      type: Object,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const allMarketers = ref([]);
    const selectedIds = ref([...(props.team.memberIds || [])]);

    const fetchMarketers = async () => {
      try {
        let raw = [];
        try {
          const data = await userService.getEmployees({ type: 6 });
          raw = Array.isArray(data) ? data : data?.items || [];
        } catch (_) {
          raw = [];
        }
        if (!Array.isArray(raw) || raw.length === 0) {
          const fallback = await teamService.getSalesWithoutTeam();
          raw = Array.isArray(fallback) ? fallback : [];
        }
        allMarketers.value = raw.filter(m => !isDisallowedSalesRole(m));
      } catch (error) {
        logger.error('Failed to fetch marketers:', error);
        // Mock if fails
        allMarketers.value = [
          { id: 101, name: 'أحمد العتيبي', email: 'ahmad@rakez.sa', team: props.team.id },
          { id: 102, name: 'سارة محمد', email: 'sara@rakez.sa', team: 2, teamName: 'فريق جدة' },
          { id: 103, name: 'خالد الصالح', email: 'khaled@rakez.sa' },
        ];
      }
    };

    const filteredMarketers = computed(() => {
      return allMarketers.value.filter(
        m =>
          m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const toggleSelection = id => {
      const index = selectedIds.value.indexOf(id);
      if (index > -1) {
        selectedIds.value.splice(index, 1);
      } else {
        selectedIds.value.push(id);
      }
    };

    const handleSave = () => {
      emit('submit', selectedIds.value);
    };

    onMounted(fetchMarketers);

    return {
      searchQuery,
      filteredMarketers,
      selectedIds,
      toggleSelection,
      handleSave,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-popover);
  backdrop-filter: blur(5px);
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px 30px;
  border-bottom: 1px solid var(--color-light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-navy);
}

.close-btn {
  background: var(--color-light-gray);
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-dark-gray);
  display: flex;
}

.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.search-box {
  margin-bottom: 20px;
}
.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-medium-gray);
  border-radius: 12px;
  transition: all 0.2s;
}
.search-input:focus {
  border-color: var(--color-gold);
  outline: none;
  box-shadow: 0 0 0 3px rgba(177, 162, 143, 0.1);
}

.marketers-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
}

.marketer-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--color-light-gray);
  cursor: pointer;
  transition: all 0.2s;
}

.marketer-item:hover {
  background: var(--color-light-gray);
  border-color: var(--color-medium-gray);
}
.marketer-item.selected {
  background: var(--color-off-white);
  border-color: var(--color-gold);
}

.check-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--color-medium-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.selected .check-box {
  background: var(--color-gold);
  border-color: var(--color-gold);
}
.check-box svg {
  width: 14px;
  height: 14px;
}

.marketer-info {
  flex: 1;
}
.marketer-info .name {
  font-weight: 700;
  color: var(--color-charcoal);
  font-size: 14px;
}
.marketer-info .email {
  font-size: 12px;
  color: var(--color-dark-gray);
}

.other-team-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--color-medium-gray);
  color: var(--color-charcoal);
  border-radius: 10px;
  font-weight: 600;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--color-light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-dark-gray);
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-navy);
  color: white;
}
.btn-secondary {
  background: var(--color-light-gray);
  color: var(--color-dark-gray);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-dark-gray);
  font-size: 14px;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 85vh;
  }
  .modal-header {
    padding: 20px;
  }
  .modal-body {
    padding: 20px;
  }
  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
  .actions {
    width: 100%;
    justify-content: stretch;
  }
  .actions .btn-primary,
  .actions .btn-secondary {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .modal-container {
    max-width: 100%;
    width: 100%;
    max-height: 90vh;
    border-radius: 16px;
    margin: 0 8px;
  }
  .modal-header {
    padding: 16px;
  }
  .modal-title {
    font-size: 18px;
  }
  .modal-body {
    padding: 16px;
  }
  .marketer-item {
    padding: 10px;
    gap: 10px;
  }
}

@media (max-width: 320px) {
  .modal-container {
    border-radius: 12px;
    margin: 0 4px;
  }
  .modal-header {
    padding: 14px 12px;
  }
  .modal-title {
    font-size: 16px;
  }
  .modal-body {
    padding: 12px;
  }
  .modal-footer {
    padding: 12px;
  }
  .btn-primary,
  .btn-secondary {
    padding: 10px 14px;
    font-size: 13px;
  }
}
</style>
