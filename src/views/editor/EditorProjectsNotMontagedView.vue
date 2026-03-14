<template>
  <div class="editor-not-montaged">
    <div class="page-header">
      <h1 class="page-title">مشاريع غير مونتاج</h1>
      <p class="page-subtitle">المشاريع التي لم يُؤكد إكمال المونتاج لها بعد (بيانات من الـ API)</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>جاري تحميل المشاريع...</p>
    </div>
    <div v-else-if="notMontagedProjects.length === 0" class="empty-state">
      <p>لا توجد مشاريع قبل المونتاج.</p>
    </div>
    <div v-else class="cards-grid">
      <div v-for="p in notMontagedProjects" :key="p.id" class="card">
        <h3 class="card-title">{{ p.name || p.project_name || p.contract_number || '—' }}</h3>
        <p class="card-meta">المطور: {{ p.developer_name || p.developer || '—' }}</p>
        <button type="button" class="btn-link" @click="openSeeMore(p)">عرض المزيد</button>
        <div class="card-actions">
          <router-link :to="{ name: 'EditorProjects', query: { tab: 'before' } }" class="btn-primary">
            إضافة رابط المونتاج
          </router-link>
        </div>
      </div>
    </div>

    <!-- See more modal -->
    <div v-if="seeMoreProject" class="modal-overlay" @click.self="seeMoreProject = null">
      <div class="modal-box">
        <h3>{{ seeMoreProject.name || seeMoreProject.project_name || '—' }}</h3>
        <dl class="detail-list">
          <dt>رقم المعلن</dt>
          <dd>{{ seeMoreProject.advertiser_number ?? seeMoreProject.publisher_number ?? '—' }}</dd>
          <dt>رابط التصوير</dt>
          <dd>
            <a v-if="seeMoreProject.photography_link || seeMoreProject.photography_url" :href="seeMoreProject.photography_link || seeMoreProject.photography_url" target="_blank" rel="noopener">{{ seeMoreProject.photography_link || seeMoreProject.photography_url }}</a>
            <span v-else>—</span>
          </dd>
          <dt>الوصف</dt>
          <dd>{{ seeMoreProject.description || '—' }}</dd>
          <dt>الوحدات المتاحة</dt>
          <dd>{{ seeMoreProject.available_units ?? '—' }}</dd>
        </dl>
        <button type="button" class="btn-secondary" @click="seeMoreProject = null">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import editorService from '@/services/editorService';

const contracts = ref([]);
const loading = ref(true);
const seeMoreProject = ref(null);

// API: has_photography_data, has_montage_data (both === 1 → after montage)
const isAfterMontage = c =>
  (c.has_photography_data == 1 || c.has_photography == 1 || c.has_photography === true) &&
  (c.has_montage_data == 1 || c.has_montage == 1 || c.has_montage === true);

const notMontagedProjects = computed(() =>
  contracts.value.filter(c => !isAfterMontage(c))
);

async function fetchContracts() {
  loading.value = true;
  try {
    const list = await editorService.getContracts();
    contracts.value = Array.isArray(list) ? list : [];
  } catch (_) {
    contracts.value = [];
  } finally {
    loading.value = false;
  }
}

function openSeeMore(p) {
  seeMoreProject.value = { ...p };
}

onMounted(() => {
  fetchContracts();
});
</script>

<style scoped>
.editor-not-montaged {
  padding: 1.5rem;
  direction: rtl;
  max-width: 1000px;
  margin: 0 auto;
}
.page-header { margin-bottom: 1.5rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.9rem; }
.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
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
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  background: #fff;
}
.card-title { font-size: 1.1rem; margin: 0 0 0.5rem 0; }
.card-meta { margin: 0.25rem 0; font-size: 0.875rem; color: #64748b; }
.btn-link {
  background: none;
  border: none;
  color: #27374d;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.25rem 0;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}
.card-actions { margin-top: 1rem; }
.btn-primary {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #27374d;
  color: #fff;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-secondary {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  color: #334155;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 480px;
  width: 100%;
}
.modal-box h3 { margin: 0 0 1rem 0; font-size: 1.1rem; }
.detail-list { margin: 1rem 0; }
.detail-list dt { font-weight: 600; margin-top: 0.5rem; color: #64748b; font-size: 0.85rem; }
.detail-list dd { margin: 0.15rem 0 0 0; }
.detail-list a { color: #27374d; word-break: break-all; }
</style>
