<template>
  <div class="developer-project-units-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">وحدات المشروع</h1>
        <p class="welcome-subtitle">
          {{ projectName ? `الوحدات المباعة — ${projectName}` : 'الوحدات المباعة للمشروع' }}
        </p>
      </div>
      <button class="back-btn" @click="goBack">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {{ developerName ? `العودة لـ ${developerName}` : 'العودة للمطور' }}
      </button>
    </div>

    <div v-if="!projectName && !isLoadingCandidates" class="empty-state">
      <p>لم يتم تحديد المشروع. افتح الصفحة من تفاصيل المطور.</p>
      <router-link :to="developerDetailRoute" class="link-back">العودة لتفاصيل المطور</router-link>
    </div>

    <template v-else>
      <!-- Mode & Create -->
      <div class="toolbar">
        <div class="mode-toggle">
          <button
            type="button"
            :class="['mode-btn', { active: mode === 'combined' }]"
            @click="mode = 'combined'"
          >
            ملف مطالبة مجمّع
          </button>
          <button
            type="button"
            :class="['mode-btn', { active: mode === 'individual' }]"
            @click="mode = 'individual'"
          >
            ملف لكل حجز
          </button>
        </div>
        <div class="selection-summary" v-if="selectedIds.length > 0">
          <span class="badge">{{ selectedIds.length }}</span>
          وحدة محددة
          <span v-if="mode === 'combined' && selectedIds.length < 2" class="min-warn">
            (يلزم حجزين على الأقل للملف المجمّع)
          </span>
        </div>
        <button
          type="button"
          class="btn-primary create-btn"
          :disabled="!canSubmit || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="!isSubmitting">
            {{
              mode === 'combined'
                ? `إنشاء ملف مجمّع (${selectedIds.length})`
                : `إنشاء ${selectedIds.length} ملف`
            }}
          </span>
          <span v-else>جاري الإنشاء...</span>
        </button>
      </div>

      <!-- Notes (combined only) -->
      <div class="form-group" v-if="mode === 'combined' && selectedIds.length >= 2">
        <label class="form-label">ملاحظات (اختياري)</label>
        <textarea
          v-model="notes"
          class="form-textarea"
          placeholder="ملاحظات إضافية..."
          rows="2"
          maxlength="1000"
        ></textarea>
      </div>

      <!-- Result message -->
      <div v-if="bulkResult" class="bulk-result">
        <div v-if="bulkResult.createdCount > 0" class="bulk-success">
          تم إنشاء {{ bulkResult.createdCount }} ملف مطالبة بنجاح.
        </div>
        <div v-if="bulkResult.errorCount > 0" class="bulk-errors">
          <p>فشل إنشاء {{ bulkResult.errorCount }} ملف:</p>
          <ul>
            <li v-for="(msg, resId) in bulkResult.errors" :key="resId">
              حجز {{ resId }}: {{ msg }}
            </li>
          </ul>
        </div>
      </div>

      <section class="units-section">
        <h2 class="section-title">الوحدات المباعة — كل المشروع</h2>
        <div v-if="isLoadingCandidates" class="loading-state">
          <span class="spinner"></span>
          <p>جاري تحميل الوحدات...</p>
        </div>
        <div v-else-if="claimFilesForbidden" class="empty-state permission-state">
          <p>لا تملك صلاحية الوصول لملفات المطالبة. يرجى التأكد من منح صلاحية المحاسبة في النظام الخلفي (Backend).</p>
        </div>
        <div v-else-if="filteredCandidates.length === 0" class="empty-state">
          <p>{{ searchTerm ? 'لا توجد نتائج مطابقة' : 'لا توجد وحدات مباعة لهذا المشروع.' }}</p>
        </div>
        <div v-else class="table-wrapper table-responsive">
          <div class="search-box-mini">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="بحث برقم الحجز أو الوحدة..."
              class="search-input-mini"
            />
          </div>
          <table class="metrics-table">
            <thead>
              <tr>
                <th class="th-checkbox" v-if="hasClaimFileColumn">
                  <input
                    type="checkbox"
                    :checked="allVisibleSelected"
                    :indeterminate="someVisibleSelected && !allVisibleSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>رقم الحجز</th>
                <th>الوحدة</th>
                <th>مبلغ المطالبة</th>
                <th>ملف مطالبة</th>
                <th>تحميل</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredCandidates"
                :key="row.reservation_id"
                :class="{ 'row-selected': isSelectable(row) && isSelected(row) }"
                @click="isSelectable(row) ? toggleCandidate(row) : null"
              >
                <td class="td-checkbox" v-if="hasClaimFileColumn">
                  <input
                    v-if="isSelectable(row)"
                    type="checkbox"
                    :checked="isSelected(row)"
                    @click.stop
                    @change="toggleCandidate(row)"
                  />
                  <span v-else>—</span>
                </td>
                <td>{{ row.reservation_id }}</td>
                <td>{{ row.unit_number || '—' }}</td>
                <td>{{ formatCurrency(row.claim_amount) }}</td>
                <td>
                  <span v-if="row.has_claim_file || row.has_pdf" class="status-tag good">نعم</span>
                  <span v-else class="status-tag">—</span>
                </td>
                <td>
                  <button
                    type="button"
                    class="btn-download-mini"
                    :disabled="isDownloading === row.reservation_id"
                    @click.stop="openDownload(row)"
                  >
                    {{ isDownloading === row.reservation_id ? 'جاري...' : 'تحميل' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import accountingService from '@/services/accountingService';
import creditService from '@/services/creditService';
import contractService from '@/services/contractService';
import { normalizeDeveloper } from '@/utils/developerMapper';
import { useFormatters } from '@/composables/useFormatters';
import { toast } from '@/composables/useToast';
import logger from '@/utils/logger';

export default {
  name: 'DeveloperProjectUnitsView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const developer = ref(null);
    const project = ref(null);
    const projectName = ref('');
    const developerName = ref('');
    const candidates = ref([]);
    const soldUnits = ref([]);
    const isLoadingCandidates = ref(false);
    const claimFilesForbidden = ref(false);
    const isDownloading = ref(null);
    const selectedIds = ref([]);
    const notes = ref('');
    const searchTerm = ref('');
    const mode = ref('combined');
    const bulkResult = ref(null);
    const isSubmitting = ref(false);

    const { formatCurrency } = useFormatters();

    const projectId = computed(() => route.params.projectId || '');
    const developerId = computed(() => route.params.id || '');

    const developerDetailRoute = computed(() =>
      developerId.value ? { name: 'DeveloperDetail', params: { id: developerId.value } } : { name: 'Developers' }
    );

    const candidatesRequestedWithContractId = ref(false);

    const projectCandidates = computed(() => {
      if (soldUnits.value.length > 0) return soldUnits.value;
      const pid = projectId.value;
      const pName = (project.value?.project_name || project.value?.name || project.value?.title || '').trim();
      if (!candidates.value.length) return [];
      if (pid && candidatesRequestedWithContractId.value) {
        return candidates.value;
      }
      return candidates.value.filter(c => {
        if (pid && c.contract_id != null && c.contract_id !== '') {
          return String(c.contract_id) === String(pid);
        }
        if (pName && (c.project_name || '').trim()) {
          return (c.project_name || '').trim() === pName;
        }
        if (pid) return false;
        return true;
      });
    });

    const hasClaimFileColumn = computed(() =>
      projectCandidates.value.some(r => !r.has_claim_file)
    );

    function isSelectable(row) {
      return !row.has_claim_file;
    }

    const filteredCandidates = computed(() => {
      if (!searchTerm.value.trim()) return projectCandidates.value;
      const q = searchTerm.value.trim().toLowerCase();
      return projectCandidates.value.filter(c => {
        const unit = (c.unit_number || '').toLowerCase();
        const id = String(c.reservation_id || '');
        return unit.includes(q) || id.includes(q);
      });
    });

    const selectableCandidates = computed(() =>
      filteredCandidates.value.filter(c => !c.has_claim_file)
    );

    const allVisibleSelected = computed(() => {
      if (selectableCandidates.value.length === 0) return false;
      return selectableCandidates.value.every(c => selectedIds.value.includes(c.reservation_id));
    });

    const someVisibleSelected = computed(() =>
      selectableCandidates.value.some(c => selectedIds.value.includes(c.reservation_id))
    );

    const canSubmit = computed(() => {
      if (selectedIds.value.length === 0) return false;
      if (mode.value === 'combined' && selectedIds.value.length < 2) return false;
      return true;
    });

    function isSelected(candidate) {
      return selectedIds.value.includes(candidate.reservation_id);
    }

    function toggleCandidate(candidate) {
      bulkResult.value = null;
      const idx = selectedIds.value.indexOf(candidate.reservation_id);
      if (idx >= 0) {
        selectedIds.value.splice(idx, 1);
      } else {
        selectedIds.value.push(candidate.reservation_id);
      }
    }

    function toggleSelectAll() {
      bulkResult.value = null;
      const selectable = selectableCandidates.value;
      if (allVisibleSelected.value) {
        const visibleIds = new Set(selectable.map(c => c.reservation_id));
        selectedIds.value = selectedIds.value.filter(id => !visibleIds.has(id));
      } else {
        const current = new Set(selectedIds.value);
        selectable.forEach(c => current.add(c.reservation_id));
        selectedIds.value = [...current];
      }
    }

    async function loadCandidates() {
      isLoadingCandidates.value = true;
      claimFilesForbidden.value = false;
      const pid = projectId.value;
      try {
        if (pid) {
          const units = await accountingService.getClaimFileSoldUnits(pid);
          soldUnits.value = Array.isArray(units) ? [...units] : [];
        } else {
          soldUnits.value = [];
        }
        if (soldUnits.value.length === 0) {
          const params = { per_page: 500 };
          if (pid) {
            params.contract_id = pid;
            candidatesRequestedWithContractId.value = true;
          } else {
            candidatesRequestedWithContractId.value = false;
          }
          const data = await accountingService.getClaimFileCandidates(params);
          claimFilesForbidden.value = !!data?.forbidden;
          candidates.value = data?.items ?? (Array.isArray(data) ? data : []);
        } else {
          candidatesRequestedWithContractId.value = false;
        }
      } catch (error) {
        logger.error('Error loading claim file units', error);
        candidates.value = [];
        toast.error('حدث خطأ أثناء تحميل الوحدات');
      } finally {
        isLoadingCandidates.value = false;
      }
    }

    async function openDownload(row) {
      const rid = row.reservation_id;
      if (!rid) return;
      isDownloading.value = rid;
      try {
        await accountingService.openClaimFileDownload(rid);
      } catch (_e) {
        toast.error('فشل تحميل ملف المطالبة');
      } finally {
        isDownloading.value = null;
      }
    }

    async function handleSubmit() {
      if (!canSubmit.value) return;
      isSubmitting.value = true;
      bulkResult.value = null;
      try {
        if (mode.value === 'combined') {
          const result = await creditService.createCombinedClaimFile({
            booking_ids: [...selectedIds.value],
            claim_type: 'commission',
            notes: notes.value.trim() || undefined,
          });
          const fileId = result?.id ?? '';
          toast.success(
            fileId ? `تم إنشاء ملف المطالبة المجمّع رقم ${fileId}` : 'تم إنشاء ملف المطالبة المجمّع بنجاح'
          );
          selectedIds.value = [];
          await loadCandidates();
        } else {
          const result = await creditService.generateBulkClaimFiles({
            reservation_ids: [...selectedIds.value],
          });
          const created = result?.created ?? {};
          const errors = result?.errors ?? {};
          const createdCount = Object.keys(created).length;
          const errorCount = Object.keys(errors).length;
          bulkResult.value = {
            createdCount,
            errorCount,
            errors,
          };
          if (createdCount > 0 && errorCount === 0) {
            toast.success(`تم إنشاء ${createdCount} ملف مطالبة بنجاح`);
            selectedIds.value = [];
            await loadCandidates();
          } else if (createdCount > 0) {
            toast.warning(`تم إنشاء ${createdCount} ملف، فشل ${errorCount}`);
            selectedIds.value = selectedIds.value.filter(id => !(id in created));
          } else {
            toast.error('فشل إنشاء ملفات المطالبة');
          }
        }
      } catch (error) {
        logger.error('Error creating claim file(s)', error);
        const msg = error?.response?.data?.message;
        toast.error(msg || 'حدث خطأ أثناء إنشاء ملف/ملفات المطالبة');
      } finally {
        isSubmitting.value = false;
      }
    }

    const goBack = () => {
      if (developerId.value) {
        router.push({ name: 'DeveloperDetail', params: { id: developerId.value } });
      } else {
        router.push({ name: 'Developers' });
      }
    };

    function initFromState() {
      const state = window.history.state;
      if (state?.developer) {
        developer.value = state.developer;
        developerName.value = state.developer?.name || '';
      }
      if (state?.project) {
        project.value = state.project;
        projectName.value =
          state.project?.project_name || state.project?.name || state.project?.title || 'المشروع';
      }
    }

    async function loadDeveloperAndProject() {
      const devId = developerId.value;
      const projId = projectId.value;
      if (!devId || !projId) return;
      try {
        const raw = await contractService.getDeveloperDetail(devId);
        if (raw && typeof raw === 'object') {
          developer.value = normalizeDeveloper(raw);
          developerName.value = developer.value?.name || '';
          const list = Array.isArray(raw.projects) ? raw.projects : [];
          const found =
            list.find(
              p => String(p.contract_id ?? p.id) === String(projId)
            ) ||
            list.find(p => String(p.id) === String(projId));
          if (found) {
            project.value = found;
            projectName.value =
              found.project_name || found.name || found.title || 'المشروع';
          } else {
            projectName.value = 'المشروع';
          }
        }
      } catch (e) {
        logger.error('Failed to load developer/project for units view', e);
      }
    }

    onMounted(async () => {
      initFromState();
      if (!project.value && developerId.value && projectId.value) {
        await loadDeveloperAndProject();
      }
      if (project.value && !projectName.value) {
        projectName.value =
          project.value?.project_name || project.value?.name || project.value?.title || 'المشروع';
      }
      await loadCandidates();
    });

    watch(
      () => [route.params.projectId, route.params.id],
      ([newPid]) => {
        initFromState();
        if (newPid) loadCandidates();
      },
      { immediate: false }
    );

    return {
      developerName,
      projectName,
      developerDetailRoute,
      candidates: projectCandidates,
      filteredCandidates,
      isLoadingCandidates,
      claimFilesForbidden,
      hasClaimFileColumn,
      isSelectable,
      isDownloading,
      openDownload,
      selectedIds,
      notes,
      searchTerm,
      mode,
      bulkResult,
      isSubmitting,
      canSubmit,
      allVisibleSelected,
      someVisibleSelected,
      isSelected,
      toggleCandidate,
      toggleSelectAll,
      formatCurrency,
      handleSubmit,
      goBack,
    };
  },
};
</script>

<style scoped>
.developer-project-units-view {
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

.welcome-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: var(--color-navy);
  border-radius: 16px;
  color: white;
}
.header-content {
  flex: 1;
  min-width: 200px;
}
.welcome-title {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 700;
}
.welcome-subtitle {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  color: var(--color-navy);
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
}
.back-btn:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}
.back-btn svg {
  width: 18px;
  height: 18px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 12px;
}
.mode-toggle {
  display: flex;
  gap: 8px;
}
.mode-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  background: white;
  color: var(--color-charcoal);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.mode-btn.active {
  background: var(--color-navy);
  border-color: var(--color-navy);
  color: white;
}
.mode-btn:hover:not(.active) {
  background: var(--color-light-gray);
}
.selection-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-charcoal);
}
.selection-summary .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: var(--color-navy);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}
.min-warn {
  color: var(--color-dark-gray);
  font-size: 0.85rem;
}
.create-btn {
  margin-right: auto;
}
.form-group {
  margin-bottom: 16px;
  max-width: 400px;
}
.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--color-charcoal);
  font-size: 0.9rem;
}
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}
.bulk-result {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--color-light-gray);
}
.bulk-success {
  color: var(--color-success, #0d6b2b);
  font-weight: 600;
}
.bulk-errors {
  color: var(--color-error, #b91c1c);
  font-size: 0.9rem;
}
.bulk-errors ul {
  margin: 8px 0 0 0;
  padding-right: 20px;
}

.units-section {
  background: white;
  border: 1px solid var(--color-medium-gray);
  border-radius: 16px;
  padding: 24px;
}
.section-title {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-charcoal);
}
.loading-state,
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-dark-gray);
}
.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-medium-gray);
  border-top-color: var(--color-navy);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.link-back {
  display: inline-block;
  margin-top: 12px;
  color: var(--color-navy);
  font-weight: 600;
  text-decoration: none;
}
.link-back:hover {
  text-decoration: underline;
}

.search-box-mini {
  margin-bottom: 12px;
  max-width: 280px;
}
.search-input-mini {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-medium-gray);
  border-radius: 8px;
  font-size: 0.95rem;
}
.table-wrapper {
  overflow-x: auto;
}
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.metrics-table th,
.metrics-table td {
  padding: 12px 14px;
  text-align: right;
  border-bottom: 1px solid var(--color-medium-gray);
}
.metrics-table th {
  background: var(--color-light-gray);
  font-weight: 600;
  color: var(--color-charcoal);
}
.th-checkbox,
.td-checkbox {
  width: 44px;
  text-align: center;
}
.metrics-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}
.metrics-table tbody tr:hover,
.metrics-table tbody tr.row-selected {
  background: rgba(13, 43, 89, 0.06);
}
.status-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}
.status-tag.good {
  background: rgba(13, 107, 43, 0.12);
  color: var(--color-success, #0d6b2b);
}
.empty-cell {
  text-align: center;
  color: var(--color-dark-gray);
  padding: 24px !important;
}
.btn-primary {
  padding: 10px 20px;
  background: var(--color-navy);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.95;
}
.btn-download-mini {
  padding: 6px 12px;
  font-size: 13px;
  background: var(--color-navy, #1e3a5f);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-download-mini:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
