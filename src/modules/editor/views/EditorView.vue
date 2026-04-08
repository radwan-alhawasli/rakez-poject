<template>
  <div class="editor-view">
    <div class="welcome-header">
      <div class="header-content">
        <h1 class="welcome-title">قسم المحرر</h1>
        <p class="welcome-subtitle">إدارة العقود والتصوير والمونتاج واللوحات للمشاريع.</p>
      </div>
    </div>

    <nav class="editor-tabs" aria-label="أقسام المحرر">
      <router-link
        v-for="tab in editorTabs"
        :key="tab.id"
        :to="{ name: tab.name }"
        class="editor-tab"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.label }}
      </router-link>
    </nav>

    <div class="tab-content custom-scrollbar">
      <EditorContractsSection
        v-if="activeTab === 'contracts'"
        :contracts="contracts"
        :is-loading="isLoading"
        :selected-contract-id="selectedContractId"
      />

      <EditorSecondPartySection
        v-else-if="activeTab === 'second-party'"
        :selected-contract-id="selectedContractId"
        :second-party-data="secondPartyData"
        :is-loading="isLoadingSecondParty"
      />

      <EditorUnitsSection
        v-else-if="activeTab === 'units'"
        :selected-contract-id="selectedContractId"
        :contract-units="contractUnits"
        :is-loading="isLoadingUnits"
      />

      <!-- 4. Developers -->
      <div v-else-if="activeTab === 'developers'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">المطورون</h2>
            <p class="section-subtitle">قائمة المطورين وتفاصيلهم.</p>
          </div>
        </div>
        <div class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>رقم المطور</th>
                <th>الاسم</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dev in developers" :key="dev.developer_number || dev.id">
                <td>{{ dev.developer_number || dev.id }}</td>
                <td>{{ dev.name || dev.developer_name || '—' }}</td>
                <td>
                  <router-link :to="{ name: 'EditorDeveloperDetail', params: { developerNumber: String(dev.developer_number || dev.id) } }" class="btn-action edit">
                    عرض
                  </router-link>
                </td>
              </tr>
              <tr v-if="developers.length === 0 && !isLoadingDevs">
                <td colspan="3" style="text-align: center; padding: 40px; color: var(--color-dark-gray)">
                  لا يوجد مطورون
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Montage -->
      <div v-else-if="activeTab === 'montage'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">قسم المونتاج</h2>
            <p class="section-subtitle">عرض وإدارة بيانات المونتاج.</p>
          </div>
        </div>
        <div v-if="!selectedContractId" class="empty-state">
          <p>اختر عقداً من العقود لإدارة بيانات المونتاج.</p>
        </div>
        <div v-else-if="isLoadingMontage" class="empty-state">
          <p>جاري التحميل...</p>
        </div>
        <div v-else-if="montageData && Object.keys(montageData).length > 0" class="metrics-table-container table-responsive">
          <table class="metrics-table">
            <thead>
              <tr>
                <th>الحقل</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(value, key) in montageData" :key="key">
                <td>{{ key }}</td>
                <td>{{ value !== null && value !== undefined ? value : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <p>لا توجد بيانات مونتاج لهذا العقد.</p>
        </div>
      </div>

      <EditorPhotographySection
        v-else-if="activeTab === 'photography'"
        :selected-contract-id="selectedContractId"
        :photography-data="photographyData"
        :is-loading="isLoadingPhotography"
      />

      <EditorBoardsSection
        v-else-if="activeTab === 'boards'"
        :selected-contract-id="selectedContractId"
        :boards-data="boardsData"
        :is-loading="isLoadingBoards"
      />

      <!-- 8. Media -->
      <div v-else-if="activeTab === 'media'" class="management-view">
        <div class="section-header-compact">
          <div>
            <h2 class="section-title">الموافقة على الصور</h2>
            <p class="section-subtitle">مراجعة واعتماد الصور المرفوعة.</p>
          </div>
        </div>
        <div class="empty-state">
          <p>استخدم الموافقة على الصور من القائمة الرئيسية.</p>
        </div>
      </div>
    </div>

    <!-- Modal: تفاصيل العقد -->
    <EditorContractDetailSection
      v-if="showContractModal"
      :contract-id="selectedContractId"
      :selected-contract="selectedContract"
      :contract-detail-rows="contractDetailRows"
      :is-loading="isLoadingContractDetail"
      @close="closeContractModal"
    />

    <!-- Modal: تفاصيل المطور -->
    <div v-if="showDeveloperModal" class="editor-modal-overlay" @click.self="closeDeveloperModal">
      <div class="editor-modal" role="dialog" aria-labelledby="developer-modal-title">
        <div class="editor-modal-header">
          <h2 id="developer-modal-title" class="editor-modal-title">تفاصيل المطور</h2>
          <button type="button" class="editor-modal-close" @click="closeDeveloperModal" aria-label="إغلاق">&times;</button>
        </div>
        <div class="editor-modal-body">
          <div v-if="selectedDeveloper && developerDetailRows.length > 0" class="metrics-table-container table-responsive">
            <table class="metrics-table">
              <thead>
                <tr>
                  <th>الحقل</th>
                  <th>القيمة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in developerDetailRows" :key="row.key">
                  <td class="detail-key-cell">{{ row.label }}</td>
                  <td class="detail-value-cell">
                    <template v-if="row.type === 'scalar'">{{ row.value }}</template>
                    <template v-else-if="row.type === 'array'">
                      <div v-if="!row.data || row.data.length === 0">—</div>
                      <div v-else class="nested-array">
                        <table class="metrics-table nested-table">
                          <thead>
                            <tr>
                              <th v-for="col in row.columns" :key="col">{{ formatDetailKey(col) }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(item, idx) in row.data" :key="idx">
                              <td v-for="col in row.columns" :key="col">{{ formatNestedValue(item[col], col) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </template>
                    <template v-else-if="row.type === 'object'">
                      <div v-if="!row.data || Object.keys(row.data).length === 0">—</div>
                      <table v-else class="metrics-table nested-table">
                        <tbody>
                          <tr v-for="(v, k) in row.data" :key="k">
                            <td class="nested-key">{{ formatDetailKey(k) }}</td>
                            <td>{{ formatNestedValue(v, k) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable max-lines -- Documented exception: editor shell with contracts/photo/boards sections; composition split planned per submodule. */
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import editorService from '@/services/editorService';
import logger from '@/utils/logger';
import EditorContractsSection from '@/modules/editor/components/EditorContractsSection.vue';
import EditorContractDetailSection from '@/modules/editor/components/EditorContractDetailSection.vue';
import EditorSecondPartySection from '@/modules/editor/components/EditorSecondPartySection.vue';
import EditorUnitsSection from '@/modules/editor/components/EditorUnitsSection.vue';
import EditorPhotographySection from '@/modules/editor/components/EditorPhotographySection.vue';
import EditorBoardsSection from '@/modules/editor/components/EditorBoardsSection.vue';

const EDITOR_TABS = [
  { id: 'contracts', name: 'EditorContracts', label: 'عقود' },
  { id: 'second-party', name: 'EditorSecondParty', label: 'الطرف الثاني' },
  { id: 'units', name: 'EditorUnits', label: 'الوحدات' },
  { id: 'developers', name: 'EditorDevelopers', label: 'المطورون' },
  { id: 'montage', name: 'EditorMontage', label: 'المونتاج' },
  { id: 'photography', name: 'EditorPhotography', label: 'التصوير' },
  { id: 'boards', name: 'EditorBoards', label: 'اللوحات' },
  { id: 'media', name: 'EditorMedia', label: 'الإعلام' },
];

export default {
  name: 'EditorView',
  components: {
    EditorContractsSection,
    EditorContractDetailSection,
    EditorSecondPartySection,
    EditorUnitsSection,
    EditorPhotographySection,
    EditorBoardsSection,
  },
  setup() {
    const route = useRoute();

    const isLoading = ref(false);
    const isLoadingDevs = ref(false);
    const isLoadingContractDetail = ref(false);
    const isLoadingSecondParty = ref(false);
    const isLoadingUnits = ref(false);
    const isLoadingMontage = ref(false);
    const isLoadingPhotography = ref(false);
    const isLoadingBoards = ref(false);

    const activeTab = computed(() => {
      const name = route.name;
      if (name === 'EditorContractDetail') return 'contracts';
      if (name === 'EditorDeveloperDetail') return 'developers';
      const t = EDITOR_TABS.find(tab => tab.name === name);
      return t ? t.id : 'contracts';
    });

    const editorTabs = EDITOR_TABS;
    const contracts = ref([]);
    const developers = ref([]);
    const selectedContractId = ref(null);
    const selectedContract = ref({});
    const selectedDeveloper = ref({});
    const secondPartyData = ref({});
    const contractUnits = ref([]);
    const montageData = ref({});
    const photographyData = ref({});
    const boardsData = ref({});

    const loadContracts = async () => {
      isLoading.value = true;
      try {
        const data = await editorService.getContracts();
        contracts.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading editor contracts:', error);
        contracts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const loadDevelopers = async () => {
      isLoadingDevs.value = true;
      try {
        const data = await editorService.getDevelopers();
        developers.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading editor developers:', error);
        developers.value = [];
      } finally {
        isLoadingDevs.value = false;
      }
    };

    const loadSecondParty = async () => {
      if (!selectedContractId.value) return;
      isLoadingSecondParty.value = true;
      try {
        secondPartyData.value = await editorService.getSecondPartyData(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading second party data:', error);
        secondPartyData.value = {};
      } finally {
        isLoadingSecondParty.value = false;
      }
    };

    const loadUnits = async () => {
      if (!selectedContractId.value) return;
      isLoadingUnits.value = true;
      try {
        const data = await editorService.getContractUnits(selectedContractId.value);
        contractUnits.value = Array.isArray(data) ? data : [];
      } catch (error) {
        logger.error('Error loading contract units:', error);
        contractUnits.value = [];
      } finally {
        isLoadingUnits.value = false;
      }
    };

    const loadMontage = async () => {
      if (!selectedContractId.value) return;
      isLoadingMontage.value = true;
      try {
        montageData.value = await editorService.getMontage(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading montage data:', error);
        montageData.value = {};
      } finally {
        isLoadingMontage.value = false;
      }
    };

    const loadPhotography = async () => {
      if (!selectedContractId.value) return;
      isLoadingPhotography.value = true;
      try {
        photographyData.value = await editorService.getPhotography(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading photography data:', error);
        photographyData.value = {};
      } finally {
        isLoadingPhotography.value = false;
      }
    };

    const loadBoards = async () => {
      if (!selectedContractId.value) return;
      isLoadingBoards.value = true;
      try {
        boardsData.value = await editorService.getBoards(selectedContractId.value);
      } catch (error) {
        logger.error('Error loading boards data:', error);
        boardsData.value = {};
      } finally {
        isLoadingBoards.value = false;
      }
    };

    const showContractModal = ref(false);
    const showDeveloperModal = ref(false);

    function normalizeContractPayload(raw) {
      if (!raw || typeof raw !== 'object') return {};
      if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) return raw.data;
      if (raw.contract && typeof raw.contract === 'object') return raw.contract;
      return raw;
    }

    const CONTRACT_FIELD_LABELS = {
      id: 'رقم العقد',
      contract_id: 'رقم العقد',
      contract_name: 'اسم العقد',
      project_name: 'اسم المشروع',
      project_id: 'رقم المشروع',
      status: 'الحالة',
      type: 'النوع',
      developer_id: 'رقم المطور',
      developer_name: 'اسم المطور',
      developer_number: 'رقم المطور',
      location: 'الموقع',
      city: 'المدينة',
      district: 'الحي',
      address: 'العنوان',
      area: 'المساحة',
      area_m2: 'المساحة (م²)',
      floor: 'الدور',
      price: 'السعر',
      total_price: 'السعر الإجمالي',
      unit_number: 'رقم الوحدة',
      unit_type: 'نوع الوحدة',
      unit_id: 'رقم الوحدة',
      units: 'الوحدات',
      notes: 'ملاحظات',
      description: 'الوصف',
      team_id: 'رقم الفريق',
      team_name: 'اسم الفريق',
      assigned_team: 'الفريق المعين',
      start_date: 'تاريخ البدء',
      end_date: 'تاريخ الانتهاء',
      expiry_date: 'تاريخ الانتهاء',
      contract_date: 'تاريخ العقد',
      created_at: 'تاريخ الإنشاء',
      updated_at: 'تاريخ التحديث',
      deleted_at: 'تاريخ الحذف',
      created_by: 'أنشئ بواسطة',
      updated_by: 'حُدِّث بواسطة',
      approved_by: 'اعتمد بواسطة',
      approved_at: 'تاريخ الاعتماد',
      second_party: 'الطرف الثاني',
      second_party_name: 'اسم الطرف الثاني',
      second_party_email: 'بريد الطرف الثاني',
      second_party_phone: 'هاتف الطرف الثاني',
      photography_status: 'حالة التصوير',
      boards_status: 'حالة اللوحات',
      montage_status: 'حالة المونتاج',
      rejection_reason: 'سبب الرفض',
      is_approved: 'معتمد',
      is_active: 'نشط',
    };

    const CONTRACT_STATUS_LABELS = {
      active: 'نشط',
      Active: 'نشط',
      pending: 'قيد الانتظار',
      Pending: 'قيد الانتظار',
      approved: 'معتمد',
      Approved: 'معتمد',
      rejected: 'مرفوض',
      Rejected: 'مرفوض',
      cancelled: 'ملغى',
      Cancelled: 'ملغى',
      completed: 'مكتمل',
      Completed: 'مكتمل',
      draft: 'مسودة',
      Draft: 'مسودة',
      in_progress: 'قيد التنفيذ',
      'In Progress': 'قيد التنفيذ',
      expired: 'منتهي',
      Expired: 'منتهي',
      suspended: 'موقوف',
      Suspended: 'موقوف',
    };

    const DEVELOPER_FIELD_LABELS = {
      id: 'المعرف',
      developer_number: 'رقم المطور',
      name: 'الاسم',
      developer_name: 'اسم المطور',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      mobile: 'رقم الجوال',
      address: 'العنوان',
      city: 'المدينة',
      country: 'الدولة',
      website: 'الموقع الإلكتروني',
      description: 'الوصف',
      notes: 'ملاحظات',
      status: 'الحالة',
      is_active: 'نشط',
      contracts_count: 'عدد العقود',
      created_at: 'تاريخ الإنشاء',
      updated_at: 'تاريخ التحديث',
    };

    function formatDisplayDate(val) {
      if (val === null || val === undefined) return '—';
      const s = String(val).trim();
      if (!s) return '—';
      const date = new Date(s);
      if (Number.isNaN(date.getTime())) return s;
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    function formatDetailValueForRow(value) {
      if (value === null || value === undefined) return '—';
      if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
      if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
      if (typeof value === 'object') return '—';
      const str = String(value);
      if (CONTRACT_STATUS_LABELS[str]) return CONTRACT_STATUS_LABELS[str];
      const date = new Date(str);
      if (str.length >= 10 && !Number.isNaN(date.getTime())) return formatDisplayDate(str);
      return str;
    }

    function formatNestedValue(value) {
      if (value === null || value === undefined) return '—';
      if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
      if (Array.isArray(value)) return value.length ? `${value.length} عنصر` : '—';
      if (typeof value === 'object') return JSON.stringify(value, null, 2);
      const str = String(value);
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        const date = new Date(str);
        if (!Number.isNaN(date.getTime())) return formatDisplayDate(str);
      }
      return str;
    }

    function getAllKeysFromItems(items) {
      if (!Array.isArray(items) || items.length === 0) return [];
      const set = new Set();
      items.forEach(item => {
        if (item && typeof item === 'object') Object.keys(item).forEach(k => set.add(k));
      });
      return Array.from(set);
    }

    const contractDetailRows = computed(() => {
      const c = selectedContract.value;
      if (!c || typeof c !== 'object') return [];
      if (Array.isArray(c)) {
        return [{
          key: 'units',
          label: 'الوحدات',
          type: 'array',
          data: c,
          columns: getAllKeysFromItems(c),
        }];
      }
      return Object.entries(c).map(([key, val]) => {
        const label = CONTRACT_FIELD_LABELS[key] || key;
        if (val === null || val === undefined || typeof val !== 'object') {
          return { key, label, type: 'scalar', value: formatDetailValueForRow(val) };
        }
        if (Array.isArray(val)) {
          return {
            key,
            label,
            type: 'array',
            data: val,
            columns: getAllKeysFromItems(val),
          };
        }
        return { key, label, type: 'object', data: val };
      });
    });

    const developerDetailRows = computed(() => {
      const d = selectedDeveloper.value;
      if (!d || typeof d !== 'object') return [];
      return Object.entries(d).map(([key, val]) => {
        const label = DEVELOPER_FIELD_LABELS[key] || key;
        if (val === null || val === undefined || typeof val !== 'object') {
          return { key, label, type: 'scalar', value: formatDetailValueForRow(val) };
        }
        if (Array.isArray(val)) {
          return {
            key,
            label,
            type: 'array',
            data: val,
            columns: getAllKeysFromItems(val),
          };
        }
        return { key, label, type: 'object', data: val };
      });
    });

    function formatDetailKey(key) {
      return CONTRACT_FIELD_LABELS[key] || DEVELOPER_FIELD_LABELS[key] || key;
    }

    function translateStatus(val) {
      return CONTRACT_STATUS_LABELS[val] || val || 'قيد المعالجة';
    }

    function formatDetailValue(value) {
      return formatDetailValueForRow(value);
    }

    const viewContract = async (contract) => {
      const id = contract?.id;
      if (id == null) return;
      selectedContractId.value = id;
      selectedContract.value = {};
      showContractModal.value = true;
      isLoadingContractDetail.value = true;
      try {
        const raw = await editorService.getContractById(id);
        selectedContract.value = normalizeContractPayload(raw);
      } catch (error) {
        logger.error('Error loading contract detail:', error);
      } finally {
        isLoadingContractDetail.value = false;
      }
    };

    const closeContractModal = () => {
      showContractModal.value = false;
      selectedContractId.value = null;
      selectedContract.value = {};
    };

    const closeDeveloperModal = () => {
      showDeveloperModal.value = false;
      selectedDeveloper.value = {};
    };

    const viewDeveloper = async (dev) => {
      selectedDeveloper.value = {};
      showDeveloperModal.value = true;
      try {
        selectedDeveloper.value = await editorService.getDeveloperByNumber(dev.developer_number || dev.id);
      } catch (error) {
        logger.error('Error loading developer detail:', error);
      }
    };

    /** تحميل واحد لكل تغيير (تبويب + عقد) يقلل الطلبات المزدوجة وعدم اتساق الواجهة */
    function runEditorTabDataLoads() {
      const tab = activeTab.value;
      const id = selectedContractId.value;
      if (tab === 'contracts') loadContracts();
      else if (tab === 'developers') loadDevelopers();
      if (!id) return;
      if (tab === 'second-party') loadSecondParty();
      else if (tab === 'units') loadUnits();
      else if (tab === 'montage') loadMontage();
      else if (tab === 'photography') loadPhotography();
      else if (tab === 'boards') loadBoards();
    }

    watch(
      () => [activeTab.value, selectedContractId.value],
      () => runEditorTabDataLoads(),
      { immediate: true }
    );

    return {
      activeTab,
      editorTabs,
      isLoading,
      isLoadingDevs,
      isLoadingContractDetail,
      isLoadingSecondParty,
      isLoadingUnits,
      isLoadingMontage,
      isLoadingPhotography,
      isLoadingBoards,
      contracts,
      developers,
      selectedContractId,
      selectedContract,
      selectedDeveloper,
      secondPartyData,
      contractUnits,
      montageData,
      photographyData,
      boardsData,
      showContractModal,
      showDeveloperModal,
      contractDetailRows,
      developerDetailRows,
      formatDisplayDate,
      formatDetailKey,
      formatDetailValue,
      formatNestedValue,
      translateStatus,
      viewContract,
      viewDeveloper,
      closeContractModal,
      closeDeveloperModal,
    };
  },
};
</script>

<style scoped src="./styles/EditorView.scoped.s1.css"></style>
