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
      <table v-else class="knowledge-table">
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
            <td colspan="7" class="knowledge-empty">لا توجد مقالات</td>
          </tr>
          <tr v-for="entry in entries" :key="entry.id">
            <td class="knowledge-cell-title">{{ entry.title }}</td>
            <td>{{ entry.module || '—' }}</td>
            <td>{{ entry.page_key || '—' }}</td>
            <td>
              <span class="knowledge-lang-badge">{{
                entry.language === 'ar' ? 'عربي' : 'English'
              }}</span>
            </td>
            <td>{{ entry.priority ?? 100 }}</td>
            <td>
              <span :class="['knowledge-status', entry.is_active ? 'active' : 'inactive']">
                {{ entry.is_active ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
            <td class="knowledge-actions-cell">
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

<script>
import { ref, onMounted } from 'vue';
import aiService from '../services/aiService';
import Pagination from '../components/Pagination.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import logger from '../utils/logger';

export default {
  name: 'KnowledgeManagementView',
  components: { Pagination, ConfirmModal },
  setup() {
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

    /** تقسيم نص مفصول بفاصلة إلى مصفوفة */
    function splitCsv(str) {
      return str
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    /** تحميل مقالات قاعدة المعرفة */
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
        logger.error('فشل تحميل مقالات قاعدة المعرفة:', err);
      } finally {
        loading.value = false;
      }
    }

    /** تحميل مؤجل عند البحث */
    function debouncedLoad() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        loadEntries();
      }, 400);
    }

    /** تغيير الصفحة */
    function onPageChange(page) {
      currentPage.value = page;
      loadEntries();
    }

    /** تغيير عدد العناصر بالصفحة */
    function onPerPageChange(pp) {
      perPage.value = pp;
      currentPage.value = 1;
      loadEntries();
    }

    /** فتح نافذة إنشاء مقال جديد */
    function openCreateModal() {
      editingEntry.value = null;
      form.value = emptyForm();
      tagsString.value = '';
      rolesString.value = '';
      permissionsString.value = '';
      showFormModal.value = true;
    }

    /** فتح نافذة تعديل مقال */
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
      permissionsString.value = Array.isArray(entry.permissions)
        ? entry.permissions.join(', ')
        : '';
      showFormModal.value = true;
    }

    /** إغلاق نافذة النموذج */
    function closeFormModal() {
      showFormModal.value = false;
      editingEntry.value = null;
    }

    /** حفظ المقال (إنشاء أو تحديث) */
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
        logger.error('فشل حفظ مقال قاعدة المعرفة:', err);
      } finally {
        saving.value = false;
      }
    }

    /** تأكيد حذف مقال */
    function confirmDelete(entry) {
      deletingEntry.value = entry;
      showDeleteConfirm.value = true;
    }

    /** تنفيذ الحذف */
    async function doDelete() {
      if (!deletingEntry.value) return;
      deleting.value = true;
      try {
        await aiService.deleteKnowledge(deletingEntry.value.id);
        showDeleteConfirm.value = false;
        deletingEntry.value = null;
        await loadEntries();
      } catch (err) {
        logger.error('فشل حذف مقال قاعدة المعرفة:', err);
      } finally {
        deleting.value = false;
      }
    }

    onMounted(loadEntries);

    return {
      entries,
      totalItems,
      currentPage,
      perPage,
      loading,
      saving,
      deleting,
      filters,
      showFormModal,
      editingEntry,
      form,
      tagsString,
      rolesString,
      permissionsString,
      showDeleteConfirm,
      deletingEntry,
      loadEntries,
      debouncedLoad,
      onPageChange,
      onPerPageChange,
      openCreateModal,
      openEditModal,
      closeFormModal,
      saveEntry,
      confirmDelete,
      doDelete,
    };
  },
};
</script>

<style scoped>
.knowledge-view {
  padding: 24px;
  direction: rtl;
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.knowledge-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-navy, var(--color-navy));
  margin: 0 0 4px 0;
}
.knowledge-subtitle {
  font-size: 14px;
  color: var(--color-dark-gray, var(--color-dark-gray));
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--color-gold, var(--color-gold)) 0%,
    var(--color-gold-dark, var(--color-gold-dark)) 100%
  );
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(177, 162, 143, 0.35);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* الفلاتر */
.knowledge-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.filter-group {
  flex: 1;
  min-width: 160px;
}
.filter-input,
.filter-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-charcoal, var(--color-charcoal));
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.filter-input:focus,
.filter-select:focus {
  border-color: var(--color-gold, var(--color-gold));
}

/* الجدول */
.knowledge-table-wrap {
  background: #fff;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
}
.knowledge-loading {
  padding: 40px;
  text-align: center;
  color: var(--color-dark-gray, var(--color-dark-gray));
  font-size: 14px;
}
.knowledge-table {
  width: 100%;
  border-collapse: collapse;
}
.knowledge-table th {
  text-align: right;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-dark-gray, var(--color-dark-gray));
  background: var(--color-light-gray, var(--color-light-gray));
  border-bottom: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  white-space: nowrap;
}
.knowledge-table td {
  padding: 12px 16px;
  font-size: 13px;
  border-bottom: 1px solid var(--color-light-gray);
  color: var(--color-charcoal, var(--color-charcoal));
}
.knowledge-table tr:last-child td {
  border-bottom: none;
}
.knowledge-table tr:hover td {
  background: #fafbfc;
}
.knowledge-cell-title {
  font-weight: 600;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.knowledge-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--color-dark-gray, var(--color-dark-gray));
}

.knowledge-lang-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: #eef2ff;
  color: #4338ca;
}
.knowledge-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}
.knowledge-status.active {
  background: #ecfdf5;
  color: #059669;
}
.knowledge-status.inactive {
  background: #fef2f2;
  color: #dc2626;
}

.knowledge-actions-cell {
  display: flex;
  gap: 6px;
}
.btn-icon {
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-dark-gray, var(--color-dark-gray));
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, background 0.15s;
}
.btn-icon:hover {
  background: var(--color-light-gray, var(--color-light-gray));
  color: var(--color-navy, var(--color-navy));
}
.btn-icon-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* النافذة المنبثقة */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 58, 95, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
  backdrop-filter: blur(2px);
}
.knowledge-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.18);
}
.knowledge-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-medium-gray, var(--color-medium-gray));
}
.knowledge-modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-navy, var(--color-navy));
  margin: 0;
}
.btn-close {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-dark-gray, var(--color-dark-gray));
  border-radius: 8px;
  display: flex;
  transition: color 0.15s;
}
.btn-close:hover {
  color: var(--color-navy, var(--color-navy));
}

.knowledge-form {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: flex;
  gap: 16px;
}
.form-row-2 > .form-group {
  flex: 1;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-charcoal, var(--color-charcoal));
}
.required {
  color: #dc2626;
}
.form-group input[type='text'],
.form-group input[type='number'],
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-charcoal, var(--color-charcoal));
  outline: none;
  transition: border-color 0.15s;
  direction: rtl;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--color-gold, var(--color-gold));
}
.form-group textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}
.form-group-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.form-group-checkbox input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-gold, var(--color-gold));
}

.knowledge-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
.btn-cancel {
  padding: 10px 20px;
  border: 1px solid var(--color-medium-gray, var(--color-medium-gray));
  border-radius: 10px;
  background: #fff;
  color: var(--color-charcoal, var(--color-charcoal));
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancel:hover {
  background: var(--color-light-gray, var(--color-light-gray));
}

/* Responsive: tablet landscape */
@media (max-width: 992px) {
  .knowledge-view {
    padding: 20px;
  }
  .knowledge-title {
    font-size: 20px;
  }
  .knowledge-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .knowledge-table {
    min-width: 700px;
  }
}

/* Responsive: tablet portrait */
@media (max-width: 768px) {
  .knowledge-view {
    padding: 16px;
  }
  .knowledge-header {
    flex-direction: column;
    align-items: stretch;
  }
  .knowledge-title {
    font-size: 18px;
  }
  .btn-primary {
    align-self: flex-start;
  }
  .knowledge-filters {
    flex-direction: column;
    gap: 10px;
  }
  .filter-group {
    min-width: 100%;
  }
  .knowledge-table-wrap {
    margin-inline: -16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  .knowledge-modal {
    max-width: 95vw;
  }
  .form-row.form-row-2 {
    flex-direction: column;
  }
  .form-row.form-row-2 > .form-group {
    flex: none;
    width: 100%;
  }
  .knowledge-modal-header {
    padding: 16px 20px;
  }
  .knowledge-form {
    padding: 16px 20px 20px;
  }
}

/* Responsive: mobile */
@media (max-width: 576px) {
  .knowledge-view {
    padding: 12px;
    overflow-x: hidden;
  }
  .knowledge-title {
    font-size: 17px;
  }
  .knowledge-subtitle {
    font-size: 13px;
  }
  .btn-primary {
    padding: 10px 16px;
    font-size: 13px;
    min-height: 44px;
    width: 100%;
    justify-content: center;
  }
  .filter-input,
  .filter-select {
    padding: 10px 12px;
    min-height: 44px;
    font-size: 14px;
  }
  .knowledge-table th {
    padding: 10px 10px;
    font-size: 11px;
  }
  .knowledge-table td {
    padding: 10px 10px;
    font-size: 12px;
  }
  .knowledge-cell-title {
    max-width: 150px;
  }
  .btn-icon {
    padding: 10px;
    min-width: 44px;
    min-height: 44px;
  }
  .knowledge-modal {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 12px;
  }
  .knowledge-modal-header h2 {
    font-size: 16px;
  }
  .knowledge-modal-actions {
    flex-direction: column-reverse;
  }
  .btn-cancel,
  .knowledge-modal-actions .btn-primary {
    width: 100%;
    text-align: center;
    justify-content: center;
    min-height: 44px;
  }
  .form-group input[type='text'],
  .form-group input[type='number'],
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    font-size: 14px;
    min-height: 44px;
  }
}

/* Responsive: extra small mobile */
@media (max-width: 320px) {
  .knowledge-view {
    padding: 8px;
  }
  .knowledge-title {
    font-size: 16px;
  }
  .knowledge-header {
    gap: 10px;
  }
  .knowledge-table th,
  .knowledge-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  .knowledge-cell-title {
    max-width: 100px;
    font-size: 11px;
  }
  .knowledge-lang-badge,
  .knowledge-status {
    font-size: 10px;
    padding: 2px 6px;
  }
  .knowledge-modal-header {
    padding: 12px 14px;
  }
  .knowledge-modal-header h2 {
    font-size: 15px;
  }
  .knowledge-form {
    padding: 12px 14px 16px;
    gap: 12px;
  }
  .form-group label {
    font-size: 12px;
  }
}

/* Responsive: large desktop */
@media (min-width: 1200px) {
  .knowledge-view {
    padding: 28px;
  }
  .knowledge-title {
    font-size: 24px;
  }
  .knowledge-table th {
    padding: 14px 20px;
    font-size: 13px;
  }
  .knowledge-table td {
    padding: 14px 20px;
    font-size: 14px;
  }
}

/* Responsive: full HD */
@media (min-width: 1920px) {
  .knowledge-view {
    padding: 32px;
  }
  .knowledge-title {
    font-size: 26px;
  }
  .knowledge-subtitle {
    font-size: 16px;
  }
  .knowledge-table th {
    padding: 16px 24px;
    font-size: 14px;
  }
  .knowledge-table td {
    padding: 16px 24px;
    font-size: 15px;
  }
  .knowledge-cell-title {
    max-width: 360px;
  }
  .filter-input,
  .filter-select {
    padding: 12px 16px;
    font-size: 14px;
  }
  .btn-primary {
    padding: 12px 24px;
    font-size: 15px;
  }
  .knowledge-lang-badge,
  .knowledge-status {
    font-size: 12px;
    padding: 4px 12px;
  }
  .knowledge-modal {
    max-width: 720px;
  }
  .knowledge-modal-header h2 {
    font-size: 20px;
  }
  .form-group input[type='text'],
  .form-group input[type='number'],
  .form-group select,
  .form-group textarea {
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* Responsive: 2K ultra-wide */
@media (min-width: 2560px) {
  .knowledge-view {
    padding: 40px;
  }
  .knowledge-title {
    font-size: 30px;
  }
  .knowledge-subtitle {
    font-size: 18px;
  }
  .knowledge-header {
    margin-bottom: 32px;
  }
  .knowledge-table-wrap {
    border-radius: 18px;
  }
  .knowledge-table th {
    padding: 18px 28px;
    font-size: 15px;
  }
  .knowledge-table td {
    padding: 18px 28px;
    font-size: 16px;
  }
  .knowledge-cell-title {
    max-width: 440px;
  }
  .filter-input,
  .filter-select {
    padding: 14px 18px;
    font-size: 15px;
    border-radius: 12px;
  }
  .knowledge-filters {
    gap: 16px;
    margin-bottom: 28px;
  }
  .btn-primary {
    padding: 14px 28px;
    font-size: 16px;
    border-radius: 12px;
  }
  .btn-icon {
    padding: 10px;
  }
  .btn-icon svg {
    width: 20px;
    height: 20px;
  }
  .knowledge-lang-badge,
  .knowledge-status {
    font-size: 13px;
    padding: 4px 14px;
  }
  .knowledge-modal {
    max-width: 800px;
    border-radius: 20px;
  }
  .knowledge-modal-header h2 {
    font-size: 22px;
  }
  .form-group label {
    font-size: 15px;
  }
  .form-group input[type='text'],
  .form-group input[type='number'],
  .form-group select,
  .form-group textarea {
    padding: 14px 18px;
    font-size: 15px;
    border-radius: 12px;
  }
  .btn-cancel {
    padding: 12px 24px;
    font-size: 15px;
  }
}

/* Responsive: 4K */
@media (min-width: 3840px) {
  .knowledge-view {
    padding: 48px;
  }
  .knowledge-title {
    font-size: 36px;
  }
  .knowledge-subtitle {
    font-size: 20px;
  }
  .knowledge-header {
    margin-bottom: 40px;
  }
  .knowledge-table-wrap {
    border-radius: 22px;
  }
  .knowledge-table th {
    padding: 22px 32px;
    font-size: 17px;
  }
  .knowledge-table td {
    padding: 22px 32px;
    font-size: 18px;
  }
  .knowledge-cell-title {
    max-width: 520px;
    font-size: 18px;
  }
  .filter-input,
  .filter-select {
    padding: 16px 22px;
    font-size: 17px;
    border-radius: 14px;
  }
  .filter-group {
    min-width: 200px;
  }
  .knowledge-filters {
    gap: 20px;
    margin-bottom: 32px;
  }
  .btn-primary {
    padding: 16px 32px;
    font-size: 18px;
    border-radius: 14px;
  }
  .btn-icon {
    padding: 12px;
    min-width: 48px;
    min-height: 48px;
  }
  .btn-icon svg {
    width: 24px;
    height: 24px;
  }
  .knowledge-lang-badge,
  .knowledge-status {
    font-size: 15px;
    padding: 6px 16px;
    border-radius: 14px;
  }
  .knowledge-modal {
    max-width: 900px;
    border-radius: 24px;
  }
  .knowledge-modal-header {
    padding: 28px 32px;
  }
  .knowledge-modal-header h2 {
    font-size: 26px;
  }
  .knowledge-form {
    padding: 28px 32px 32px;
    gap: 20px;
  }
  .form-group label {
    font-size: 17px;
  }
  .form-group input[type='text'],
  .form-group input[type='number'],
  .form-group select,
  .form-group textarea {
    padding: 16px 22px;
    font-size: 17px;
    border-radius: 14px;
  }
  .btn-cancel {
    padding: 14px 28px;
    font-size: 17px;
    border-radius: 14px;
  }
  .knowledge-empty {
    padding: 56px 24px;
    font-size: 18px;
  }
  .knowledge-loading {
    padding: 56px;
    font-size: 17px;
  }
}
</style>
