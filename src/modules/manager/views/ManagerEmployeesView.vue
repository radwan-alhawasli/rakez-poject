<template>
  <div class="manager-employees-view">
    <div class="page-header">
      <h1 class="page-title">الموظفون</h1>
      <p class="page-subtitle">قائمة الموظفين التابعين لك — انقر لعرض مهامه ومراجعاته.</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>

    <div v-else-if="!isManager" class="no-access">
      <p>هذه الصفحة متاحة للمديرين فقط.</p>
    </div>

    <div v-else-if="employees.length === 0" class="empty-state">
      <p>لا يوجد موظفون.</p>
    </div>

    <div v-else class="employees-grid">
      <router-link
        v-for="emp in employees"
        :key="emp.id"
        :to="{ name: 'ManagerEmployeeDetail', params: { id: emp.id } }"
        class="employee-card"
      >
        <div class="card-avatar">{{ (emp.name || emp.user_name || '?').charAt(0).toUpperCase() }}</div>
        <div class="card-info">
          <h4>{{ emp.name || emp.user_name || '—' }}</h4>
          <p>{{ emp.email || emp.team_name || emp.team || '—' }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import authService from '@/services/authService';
import managerService from '@/services/managerService';
import { filterEmployeesByManagerRole } from '@/utils/managerEmployeeRoleFilter';

const user = computed(() => authService.getCurrentUser());
const isManager = computed(() => user.value?.is_manager === true || user.value?.is_manager === 1);

const employees = ref([]);
const isLoading = ref(true);

async function fetchEmployees() {
  if (!isManager.value) return;
  isLoading.value = true;
  try {
    const res = await managerService.getEmployees();
    const raw = res?.items ?? [];
    employees.value = filterEmployeesByManagerRole(raw, user.value);
  } catch (_) {
    employees.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchEmployees);
</script>

<style scoped>
.manager-employees-view {
  direction: rtl;
}

.page-header {
  margin-bottom: 24px;
  text-align: right;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--color-dark-gray);
  margin: 0;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid rgba(177, 162, 143, 0.2);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.employee-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--color-gold);
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-gold);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
}

.card-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.card-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-dark-gray);
}

.loading-state,
.empty-state,
.no-access {
  text-align: center;
  padding: 3rem;
}

.no-access {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  color: #92400e;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(177, 162, 143, 0.2);
  border-top-color: var(--color-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
