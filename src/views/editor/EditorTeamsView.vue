<template>
  <div class="editor-teams">
    <div class="page-header">
      <h1 class="page-title">الفرق</h1>
      <p class="page-subtitle">عرض الفرق وأعضائها (للعرض فقط — لا يمكن التعديل حتى يتم توفير الـ API)</p>
    </div>

    <div class="teams-list">
      <section v-for="team in teams" :key="team.id" class="team-card">
        <h2 class="team-name">{{ team.name }}</h2>
        <p class="team-lead">قائد الفريق: {{ team.lead }}</p>
        <table class="members-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in team.members" :key="m.id">
              <td>{{ m.name }}</td>
              <td>{{ m.role }}</td>
              <td>{{ m.email }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useEditorMockData } from '@/composables/editor/useEditorMockData';

const { teams } = useEditorMockData();
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
