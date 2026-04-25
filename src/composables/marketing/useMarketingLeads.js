import { ref, reactive, computed, onMounted } from 'vue';
import marketingService from '@/services/marketingService';
import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import { LEAD_SOURCES } from '@/constants/lookups';

export function useMarketingLeads() {
  /** @type {import('vue').Ref<any[]>} */
  const leads = ref([]);
  const isLoadingLeads = ref(false);
  const leadSearchQuery = ref('');

  const filteredLeads = computed(() => {
    /** @type {any[]} */
    let list = leads.value;
    if (leadSearchQuery.value) {
      const q = leadSearchQuery.value.toLowerCase();
      list = list.filter(
        (/** @type {any} */ l) =>
          (l.name || l.client_name || '').toLowerCase().includes(q) ||
          (l.phone || '').includes(q)
      );
    }
    return list;
  });

  // Add lead modal
  const showAddLeadModal = ref(false);
  const isSubmitting = ref(false);
  const leadForm = reactive({
    name: '',
    contact_info: '',
    source: '',
    project_id: '',
  });

  // Projects needed for the lead form dropdown
  /** @type {import('vue').Ref<any[]>} */
  const projects = ref([]);
  const isLoadingProjects = ref(false);

  const loadLeads = async () => {
    isLoadingLeads.value = true;
    try {
      const data = await marketingService.getLeads();
      leads.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading leads:', error);
      leads.value = [];
    } finally {
      isLoadingLeads.value = false;
    }
  };

  const loadProjects = async () => {
    isLoadingProjects.value = true;
    try {
      const data = await marketingService.getProjects({});
      projects.value = data?.items ?? (Array.isArray(data) ? data : []);
    } catch (error) {
      logger.error('Error loading projects for leads:', error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  };

  const openAddLeadModal = () => {
    leadForm.name = '';
    leadForm.contact_info = '';
    leadForm.source = '';
    leadForm.project_id = '';
    showAddLeadModal.value = true;
  };

  const saveLead = async () => {
    if (!leadForm.name || !leadForm.contact_info || !leadForm.source) {
      toast.warning('الرجاء إدخال جميع الحقول المطلوبة');
      return;
    }
    try {
      isSubmitting.value = true;
      await marketingService.storeLead({
        name: leadForm.name,
        contact_info: leadForm.contact_info,
        source: leadForm.source,
        project_id: leadForm.project_id || null,
      });
      toast.success(`تم إضافة العميل المحتمل "${leadForm.name}" بنجاح`);
      showAddLeadModal.value = false;
      loadLeads();
    } catch (error) {
      logger.error('Error saving lead:', error);
      toast.error('حدث خطأ أثناء حفظ العميل المحتمل');
    } finally {
      isSubmitting.value = false;
    }
  };

  /** @param {any} lead */
  const openLeadDetail = lead => {
    logger.debug('View lead details:', lead?.id ?? lead);
  };

  /** @param {any} source */
  const getSourceClass = source => {
    /** @type {any} */
    const sourceMap = { Snapchat: 'source-snapchat', Instagram: 'source-instagram', Twitter: 'source-twitter', Facebook: 'source-facebook', 'Google Ads': 'source-google', Website: 'source-website', Referral: 'source-referral', Other: 'source-other' };
    return sourceMap[source] || 'source-other';
  };

  /** @param {any} dateString */
  const formatDate = dateString => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB').format(date);
  };

  onMounted(() => {
    loadLeads();
    loadProjects();
  });

  return {
    filteredLeads,
    leadSearchQuery,
    isLoadingLeads,
    showAddLeadModal,
    isSubmitting,
    leadForm,
    projects,
    LEAD_SOURCES,
    openAddLeadModal,
    saveLead,
    openLeadDetail,
    getSourceClass,
    formatDate,
    loadLeads,
  };
}
