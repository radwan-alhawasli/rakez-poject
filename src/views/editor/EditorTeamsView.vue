<template>
  <div class="editor-teams">
    <div class="page-header">
      <h1 class="page-title">الفرق</h1>
      <p class="page-subtitle">فرق المبيعات وأعضاء الفريق </p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل الفرق...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="teams.length === 0" class="empty-state">
      <p>لا توجد فرق.</p>
    </div>
    <div v-else class="teams-list">
      <section v-for="team in teams" :key="team.id" class="team-card">
        <h2 class="team-name">{{ team.name || team.team_name || 'فريق' }}</h2>
        <p v-if="team.lead" class="team-lead">قائد الفريق: {{ team.lead }}</p>
        <table class="members-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد</th>
              <th>الهاتف</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in teamMarketers(team)" :key="m.id || m.marketer_id">
              <td>{{ m.name || m.user_name || m.marketer_name || '—' }}</td>
              <td>{{ m.role || m.role_name || '—' }}</td>
              <td>{{ m.email || '—' }}</td>
              <td>{{ m.phone || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import editorService from '@/services/editorService';

const teams = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchTeams() {
  loading.value = true;
  error.value = '';
  try {
    const data = await editorService.getEditorTeams();
    teams.value = Array.isArray(data) ? data : [];
  } catch (e) {
    teams.value = [];
    error.value = e?.message || 'فشل تحميل الفرق';
  } finally {
    loading.value = false;
  }
}

function teamMarketers(team) {
  return team.marketers || team.members || team.users || [];
}

onMounted(() => {
  fetchTeams();
});
</script>

<style scoped>
.editor-teams {
  padding: 1.5rem;
  direction: rtl;
  max-width: 900px;
  margin: 0 auto;
}
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.9rem; }
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
.error-state { color: #b91c1c; }
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid #e2e8f0;
  border-top-color: #27374d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.teams-list { display: flex; flex-direction: column; gap: 1.5rem; }
.team-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}
.team-name { font-size: 1.15rem; margin: 0 0 0.35rem 0; }
.team-lead { color: #64748b; margin: 0 0 1rem 0; font-size: 0.9rem; }
.members-table { width: 100%; border-collapse: collapse; }
.members-table th,
.members-table td { padding: 0.5rem 0.75rem; text-align: right; border-bottom: 1px solid #e2e8f0; }
.members-table th { background: #f8fafc; font-weight: 600; font-size: 0.85rem; }
</style>
