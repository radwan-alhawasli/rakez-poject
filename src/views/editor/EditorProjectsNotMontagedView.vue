<template>
  <div class="editor-not-montaged">
    <div class="page-header">
      <h1 class="page-title">مشاريع غير مونتاج</h1>
      <p class="page-subtitle">المشاريع التي لم يُؤكد إكمال المونتاج لها بعد</p>
    </div>

    <div class="cards-grid">
      <div v-for="p in notMontagedProjects" :key="p.id" class="card">
        <h3 class="card-title">{{ p.name }}</h3>
        <p class="card-meta">المطور: {{ p.developer }}</p>
        <button type="button" class="btn-link" @click="openSeeMore(p)">عرض المزيد</button>
        <div class="card-actions">
          <button type="button" class="btn-primary" @click="openMontageForm(p)">إضافة رابط المونتاج</button>
        </div>
      </div>
    </div>

    <!-- See more modal -->
    <div v-if="seeMoreProject" class="modal-overlay" @click.self="seeMoreProject = null">
      <div class="modal-box">
        <h3>{{ seeMoreProject.name }}</h3>
        <dl class="detail-list">
          <dt>رقم المعلن</dt>
          <dd>{{ seeMoreProject.publisherNumber || '—' }}</dd>
          <dt>رابط التصوير</dt>
          <dd>
            <a v-if="seeMoreProject.photographyLink" :href="seeMoreProject.photographyLink" target="_blank" rel="noopener">{{ seeMoreProject.photographyLink }}</a>
            <span v-else>—</span>
          </dd>
          <dt>الوصف</dt>
          <dd>{{ seeMoreProject.description || '—' }}</dd>
          <dt>الوحدات المتاحة</dt>
          <dd>{{ seeMoreProject.availableUnits ?? '—' }}</dd>
        </dl>
        <button type="button" class="btn-secondary" @click="seeMoreProject = null">إغلاق</button>
      </div>
    </div>

    <!-- Add montage link modal -->
    <div v-if="montageFormProject" class="modal-overlay" @click.self="montageFormProject = null">
      <div class="modal-box">
        <h3>إضافة رابط المونتاج — {{ montageFormProject.name }}</h3>
        <div class="form-group">
          <label>رابط المونتاج</label>
          <input v-model="montageLinkInput" type="url" class="form-input" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="montageFormProject = null">إلغاء</button>
          <button type="button" class="btn-primary" :disabled="!montageLinkInput?.trim()" @click="submitMontageLink">إرسال</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEditorMockData } from '@/composables/editor/useEditorMockData';
import { toast } from '@/composables/useToast';

const router = useRouter();
const { notMontagedProjects, addMontageLink } = useEditorMockData();

const seeMoreProject = ref(null);
const montageFormProject = ref(null);
const montageLinkInput = ref('');

function openSeeMore(p) {
  seeMoreProject.value = { ...p };
}

function openMontageForm(p) {
  montageFormProject.value = p;
  montageLinkInput.value = '';
}

function submitMontageLink() {
  const link = montageLinkInput.value?.trim();
  if (!link || !montageFormProject.value) return;
  addMontageLink(montageFormProject.value.id, montageFormProject.value.name, link);
  toast.success('تم إرسال رابط المونتاج. سيتم مراجعته من المدير.');
  montageFormProject.value = null;
  montageLinkInput.value = '';
  router.push({ name: 'EditorProjectsAfterMontage' });
}
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
  padding: 0.5rem 1rem;
  background: #27374d;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
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
.form-group { margin: 1rem 0; }
.form-group label { display: block; margin-bottom: 0.35rem; font-weight: 500; }
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem; }
</style>
