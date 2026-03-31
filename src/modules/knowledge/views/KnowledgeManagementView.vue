<template>
  <div class="knowledge-view">
    <div class="knowledge-header">
      <div>
        <h1 class="knowledge-title">إدارة قاعدة المعرفة</h1>
        <p class="knowledge-subtitle">إدارة مقالات ومحتويات المساعد الذكي</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreateModal">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        إضافة مقال
      </button>
    </div>

    <!-- الفلاتر -->
    <div class="knowledge-filters">
      <div class="filter-group">
        <input
          v-model="filters.search"
          type="text"
          class="filter-input"
          placeholder="بحث في العنوان والمحتوى..."
          @input="debouncedLoad"
        />
      </div>
      <div class="filter-group">
        <select v-model="filters.module" class="filter-select" @change="loadEntries">
          <option value="">كل الأقسام</option>
          <option value="contracts">العقود</option>
          <option value="hr">الموارد البشرية</option>
          <option value="sales">المبيعات</option>
          <option value="marketing">التسويق</option>
          <option value="accounting">المحاسبة</option>
          <option value="credit">الائتمان</option>
          <option value="projects">المشاريع</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filters.language" class="filter-select" @change="loadEntries">
          <option value="">كل اللغات</option>
          <option value="ar">العربية</option>
          <option value="en">الإنجليزية</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filters.is_active" class="filter-select" @change="loadEntries">
          <option value="">الحالة</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </select>
      </div>
    </div>

    <!-- الجدول -->
    <div class="knowledge-table-wrap">
      <div v-if="loading" class="knowledge-loading">جاري التحميل...</div>
      <div v-else class="table-responsive">
      <table class="knowledge-table table-mobile-stacked">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>القسم</th>
            <th>الصفحة</th>
            <th>اللغة</th>
            <th>الأولوية</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="entries.length === 0">
            <td data-label="" colspan="7" class="knowledge-empty">لا توجد مقالات</td>
          </tr>
          <tr v-for="entry in entries" :key="entry.id">
            <td data-label="العنوان" class="knowledge-cell-title">{{ entry.title }}</td>
            <td data-label="القسم">{{ entry.module || '—' }}</td>
            <td data-label="الصفحة">{{ entry.page_key || '—' }}</td>
            <td data-label="اللغة">
              <span class="knowledge-lang-badge">{{
                entry.language === 'ar' ? 'عربي' : 'English'
              }}</span>
            </td>
            <td data-label="الأولوية">{{ entry.priority ?? 100 }}</td>
            <td data-label="الحالة">
              <span :class="['knowledge-status', entry.is_active ? 'active' : 'inactive']">
                {{ entry.is_active ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
            <td data-label="الإجراءات" class="knowledge-actions-cell">
              <button type="button" class="btn-icon" title="تعديل" @click="openEditModal(entry)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                type="button"
                class="btn-icon btn-icon-danger"
                title="حذف"
                @click="confirmDelete(entry)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- ترقيم الصفحات -->
    <Pagination
      v-if="totalItems > 0"
      :current-page="currentPage"
      :total-items="totalItems"
      :per-page="perPage"
      @page-change="onPageChange"
      @per-page-change="onPerPageChange"
    />

    <!-- نافذة إنشاء / تعديل المقال -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="knowledge-modal">
        <div class="knowledge-modal-header">
          <h2>{{ editingEntry ? 'تعديل مقال' : 'إضافة مقال جديد' }}</h2>
          <button type="button" class="btn-close" @click="closeFormModal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form class="knowledge-form" @submit.prevent="saveEntry">
          <div class="form-row">
            <div class="form-group">
              <label>العنوان <span class="required">*</span></label>
              <input v-model="form.title" type="text" required maxlength="255" />
            </div>
          </div>
          <div class="form-row form-row-2">
            <div class="form-group">
              <label>القسم <span class="required">*</span></label>
              <select v-model="form.module" required>
                <option value="">اختر القسم</option>
                <option value="contracts">العقود</option>
                <option value="hr">الموارد البشرية</option>
                <option value="sales">المبيعات</option>
                <option value="marketing">التسويق</option>
                <option value="accounting">المحاسبة</option>
                <option value="credit">الائتمان</option>
                <option value="projects">المشاريع</option>
              </select>
            </div>
            <div class="form-group">
              <label>مفتاح الصفحة</label>
              <input
                v-model="form.page_key"
                type="text"
                maxlength="180"
                placeholder="مثال: contracts.create"
              />
            </div>
          </div>
          <div class="form-group">
            <label>المحتوى (Markdown) <span class="required">*</span></label>
            <textarea v-model="form.content_md" rows="8" required></textarea>
          </div>
          <div class="form-row form-row-2">
            <div class="form-group">
              <label>اللغة <span class="required">*</span></label>
              <select v-model="form.language" required>
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
              </select>
            </div>
            <div class="form-group">
              <label>الأولوية</label>
              <input v-model.number="form.priority" type="number" min="0" max="65535" />
            </div>
          </div>
          <div class="form-group">
            <label>الوسوم (مفصولة بفاصلة)</label>
            <input v-model="tagsString" type="text" placeholder="contracts, create, guide" />
          </div>
          <div class="form-row form-row-2">
            <div class="form-group">
              <label>الأدوار المسموحة (مفصولة بفاصلة)</label>
              <input v-model="rolesString" type="text" placeholder="admin, sales" />
            </div>
            <div class="form-group">
              <label>الصلاحيات المطلوبة (مفصولة بفاصلة)</label>
              <input v-model="permissionsString" type="text" placeholder="create-contracts" />
            </div>
          </div>
          <div class="form-group form-group-checkbox">
            <label>
              <input type="checkbox" v-model="form.is_active" />
              نشط
            </label>
          </div>
          <div class="knowledge-modal-actions">
            <button type="button" class="btn-cancel" @click="closeFormModal">إلغاء</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving">جاري الحفظ...</span>
              <span v-else>{{ editingEntry ? 'تحديث' : 'إنشاء' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- تأكيد الحذف -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="حذف المقال"
      :message="`هل أنت متأكد من حذف &quot;${deletingEntry?.title}&quot;؟ لا يمكن التراجع عن هذا الإجراء.`"
      type="danger"
      confirm-text="حذف"
      :is-loading="deleting"
      @confirm="doDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import aiService from '@/services/aiService';
import Pagination from '@/components/Pagination.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import logger from '@/utils/logger';

const entries = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const perPage = ref(15);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);

const filters = ref({
  search: '',
  module: '',
  language: '',
  is_active: '',
});

const showFormModal = ref(false);
const editingEntry = ref(null);
const form = ref(emptyForm());

const tagsString = ref('');
const rolesString = ref('');
const permissionsString = ref('');

const showDeleteConfirm = ref(false);
const deletingEntry = ref(null);

let searchTimeout = null;

/** إرجاع نموذج فارغ */
function emptyForm() {
  return {
    module: '',
    page_key: '',
    title: '',
    content_md: '',
    language: 'ar',
    is_active: true,
    priority: 100,
  };
}

function splitCsv(str) {
  return str
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

async function loadEntries() {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    };
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.module) params.module = filters.value.module;
    if (filters.value.language) params.language = filters.value.language;
    if (filters.value.is_active) params.is_active = filters.value.is_active;

    const result = await aiService.getKnowledge(params);
    entries.value = result?.items || [];
    totalItems.value = result?.total || 0;
  } catch (err) {
    logger.error('Failed to load knowledge entries:', err);
  } finally {
    loading.value = false;
  }
}

function debouncedLoad() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadEntries();
  }, 400);
}

function onPageChange(page) {
  currentPage.value = page;
  loadEntries();
}

function onPerPageChange(pp) {
  perPage.value = pp;
  currentPage.value = 1;
  loadEntries();
}

function openCreateModal() {
  editingEntry.value = null;
  form.value = emptyForm();
  tagsString.value = '';
  rolesString.value = '';
  permissionsString.value = '';
  showFormModal.value = true;
}

function openEditModal(entry) {
  editingEntry.value = entry;
  form.value = {
    module: entry.module || '',
    page_key: entry.page_key || '',
    title: entry.title || '',
    content_md: entry.content_md || '',
    language: entry.language || 'ar',
    is_active: entry.is_active !== false,
    priority: entry.priority ?? 100,
  };
  tagsString.value = Array.isArray(entry.tags) ? entry.tags.join(', ') : '';
  rolesString.value = Array.isArray(entry.roles) ? entry.roles.join(', ') : '';
  permissionsString.value = Array.isArray(entry.permissions) ? entry.permissions.join(', ') : '';
  showFormModal.value = true;
}

function closeFormModal() {
  showFormModal.value = false;
  editingEntry.value = null;
}

async function saveEntry() {
  saving.value = true;
  try {
    const data = { ...form.value };
    const tags = splitCsv(tagsString.value);
    const roles = splitCsv(rolesString.value);
    const permissions = splitCsv(permissionsString.value);
    if (tags.length) data.tags = tags;
    if (roles.length) data.roles = roles;
    if (permissions.length) data.permissions = permissions;

    if (editingEntry.value) {
      await aiService.updateKnowledge(editingEntry.value.id, data);
    } else {
      await aiService.createKnowledge(data);
    }
    closeFormModal();
    await loadEntries();
  } catch (err) {
    logger.error('Failed to save knowledge entry:', err);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(entry) {
  deletingEntry.value = entry;
  showDeleteConfirm.value = true;
}

async function doDelete() {
  if (!deletingEntry.value) return;
  deleting.value = true;
  try {
    await aiService.deleteKnowledge(deletingEntry.value.id);
    showDeleteConfirm.value = false;
    deletingEntry.value = null;
    await loadEntries();
  } catch (err) {
    logger.error('Failed to delete knowledge entry:', err);
  } finally {
    deleting.value = false;
  }
}

onMounted(loadEntries);
</script>

<style scoped src="./styles/KnowledgeManagementView.scoped.s1.css"></style>
<style scoped src="./styles/KnowledgeManagementView.scoped.s2.css"></style>
