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

    <div v-if="!projectId && !isLoadingCandidates" class="empty-state">
      <p>لم يتم تحديد المشروع. افتح الصفحة من تفاصيل المطور.</p>
      <router-link :to="developerDetailRoute" class="link-back">العودة لتفاصيل المطور</router-link>
    </div>

    <template v-else>
      <!-- Mode & Create -->
      <div class="toolbar">
        <div class="selection-summary" v-if="selectedIds.length > 0">
          <span class="badge">{{ selectedIds.length }}</span>
          وحدة محددة
        </div>
        <button
          type="button"
          class="btn-primary create-btn"
          :disabled="!canSubmit || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="!isSubmitting">
            إنشاء ملف مطالبة ({{ selectedIds.length }})
          </span>
          <span v-else>جاري الإنشاء...</span>
        </button>
      </div>

      <!-- Notes -->
      <div class="form-group" v-if="selectedIds.length >= 1">
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
                <td>{{ row.reservation_id || row.booking_id || row.id }}</td>
                <td>{{ row.unit_number || row.unit_name || '\u2014' }}</td>
                <td>{{ formatCurrency(row.claim_amount || row.amount || 0) }}</td>
                <td>
                  <span v-if="row.has_claim_file || row.has_pdf || row.claim_file_id" class="status-tag good">نعم</span>
                  <span v-else class="status-tag">\u2014</span>
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
import { showApiError } from '@/utils/errorHandler';
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
      let list = [];
      if (soldUnits.value.length > 0) {
        list = soldUnits.value;
      } else {
        list = candidates.value || [];
      }
      
      if (!list.length) return [];
      
      const pid = projectId.value;
      const pName = (project.value?.project_name || project.value?.name || project.value?.title || '').trim();

      // If we specifically requested this project's candidates, return them all
      if (pid && candidatesRequestedWithContractId.value) {
        return list;
      }

      return list.filter(c => {
        const c_id = c.contract_id ?? c.project_id ?? c.id;
        if (pid && c_id != null && c_id !== '') {
          return String(c_id) === String(pid);
        }
        if (pName && (c.project_name || '').trim()) {
          return (c.project_name || '').trim() === pName;
        }
        return !pid; // If no pid, show all
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
      return selectedIds.value.length > 0;
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
        // We call candidates API as requested by the user for contract_id filter
        const params = { per_page: 500 };
        if (pid) {
          params.contract_id = pid;
          candidatesRequestedWithContractId.value = true;
        } else {
          candidatesRequestedWithContractId.value = false;
        }

        const res = await accountingService.getClaimFileCandidates(params);
        claimFilesForbidden.value = !!res?.forbidden;
        
        // Handle both {items, total} and raw array
        const rawItems = res?.items ?? (Array.isArray(res) ? res : []);
        candidates.value = rawItems;

        // Optionally supplement with soldUnits if candidates is empty or for full status
        if (pid && candidates.value.length === 0) {
          // Pass as object { contract_id: pid } to match API expectation and avoid 'target must be an object' error
          const units = await accountingService.getClaimFileSoldUnits({ contract_id: pid });
          soldUnits.value = Array.isArray(units) ? [...units] : [];
        } else {
          soldUnits.value = [];
        }
      } catch (error) {
        logger.error('Error loading claim file units', error);
        candidates.value = [];
        showApiError(error, '\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0648\u062d\u062f\u0627\u062a');
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
        showApiError(_e, 'فشل تحميل ملف المطالبة');
      } finally {
        isDownloading.value = null;
      }
    }

    async function handleSubmit() {
      if (!canSubmit.value) return;
      isSubmitting.value = true;
      bulkResult.value = null;
      try {
        // Use accountingService for all claims as requested
        const result = await accountingService.createCombinedClaimFile({
          booking_ids: [...selectedIds.value],
          claim_type: 'commissions',
          notes: notes.value.trim() || undefined,
          contract_id: projectId.value || undefined
        });

        const fileId = result?.id ?? '';
        toast.success(
          fileId ? `تم إنشاء ملف المطالبة رقم ${fileId}` : 'تم إنشاء ملف المطالبة بنجاح'
        );
        selectedIds.value = [];
        await loadCandidates();
      } catch (error) {
        logger.error('Error creating claim file', error);
        showApiError(error, 'حدث خطأ أثناء إنشاء ملف المطالبة');
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
        let raw;
        // If devId is an email, try fetching by email first to get contracts and potentially the numeric ID
        if (devId.includes('@')) {
          const emailRes = await contractService.getDeveloperContractsByEmail(devId);
          // If the response contains developer info (sometimes nested in contracts or as a separate key)
          if (emailRes?.developer) {
            raw = emailRes.developer;
          } else if (Array.isArray(emailRes) && emailRes.length > 0 && emailRes[0].developer) {
            raw = emailRes[0].developer;
          } else {
            // Fallback to getDeveloperDetail but handle potential numeric ID vs email
            raw = await contractService.getDeveloperDetail(devId);
          }
        } else {
          raw = await contractService.getDeveloperDetail(devId);
        }

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
        if (!projectName.value) projectName.value = 'مشروع رقم ' + projId;
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
        if (newPid) {
          if (!projectName.value) loadDeveloperAndProject();
          loadCandidates();
        }
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
      projectId,
    };
  },
};
</script>

<style scoped src="./styles/DeveloperProjectUnitsView.scoped.s1.css"></style>
