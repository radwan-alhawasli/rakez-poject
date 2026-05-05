import { ref, watch, onMounted, computed } from 'vue';
import { ROLE_MAP, ROLE_OPTIONS, ROLE_SALES, ROLE_SALES_LEADER } from '@/constants/roles';
import { NATIONALITIES, MARITAL_STATUSES } from '@/constants/lookups';
import hrService from '@/services/hrService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { createUserSchema, editUserSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';

/**
 * @param {any} props
 * @param {any} emit
 */
export function useAddUserModal(props, emit) {
  const ROLE_MARKETING = ROLE_MAP.marketing;

  const isEdit = ref(false);
  const dateType = ref('gregorian');
  const cvFileInput = ref(null);

  const createValidation = useValidation(createUserSchema);
  const editValidation = useValidation(editUserSchema);
  /** @param {string} field */
  const getFieldError = field => {
    const v = /** @type {any} */ (isEdit.value ? editValidation : createValidation);
    return v.getFieldError(field);
  };

  const signatureFileInput = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const teamsList = ref([]);
  /** @type {import('vue').Ref<any[]>} */
  const teamGroupsList = ref([]);
  const isLoadingTeamGroups = ref(false);

  const form = ref({
    name: '',
    identity_number: '',
    birthday: '',
    phone: '',
    nationality: '',
    marital_status: 'single',
    job_title: '',
    type: '',
    salary: '',
    contract_type: 'full_time',
    date_of_works: '',
    trial_period_days: 90,
    additional_benefits: '',
    team: '',
    team_group_id: '',
    email: '',
    password: '',
    iban: '',
    cv_file: null,
    signature_file: null,
    work_phone_consent: false,
    logo_usage_consent: false,
    is_manager: false,
    is_executive_director: false,
  });

  const selectedType = computed(() => Number(form.value.type));
  const isSalesType = computed(() => selectedType.value === ROLE_SALES);
  const isSalesLeaderType = computed(() => selectedType.value === ROLE_SALES_LEADER);
  const isSalesManagerSelected = computed(
    () => isSalesType.value && Boolean(form.value.is_manager)
  );
  const isSalesExecutiveSelected = computed(
    () => isSalesType.value && Boolean(form.value.is_executive_director)
  );

  const isTeamRequired = computed(() => {
    if (isSalesLeaderType.value) return true;
    if (isSalesType.value) {
      return !isSalesManagerSelected.value && !isSalesExecutiveSelected.value;
    }
    return false;
  });

  const isTeamGroupRequired = computed(
    () =>
      isSalesType.value &&
      !isSalesManagerSelected.value &&
      !isSalesExecutiveSelected.value
  );
  const showTeamGroupField = computed(() => isTeamGroupRequired.value);

  const mapTeamItems = list =>
    (Array.isArray(list) ? list : []).map(/** @param {any} t */ t => ({
      id: t.id ?? t.team_id,
      name: t.name || t.team_name || `Team ${t.id ?? t.team_id}`,
    }));

  const mapTeamGroupItems = list =>
    (Array.isArray(list) ? list : []).map(/** @param {any} g */ g => ({
      id: g.id ?? g.team_group_id,
      name: g.name || g.group_name || `Group ${g.id ?? g.team_group_id}`,
    }));

  const loadTeams = async () => {
    try {
      if (props.useAdminApi) {
        const list = await teamService.getTeams({ per_page: 100 });
        teamsList.value = mapTeamItems(list);
        return;
      }
      const res = /** @type {any} */ (await hrService.getTeams({ per_page: 100 }));
      teamsList.value = mapTeamItems(res?.items ?? []);
    } catch (e) {
      teamsList.value = [];
      logger.error('AddUserModal: failed to load teams', e);
    }
  };

  const loadTeamGroups = async teamId => {
    const normalizedTeamId = Number(teamId);
    if (!Number.isFinite(normalizedTeamId) || normalizedTeamId <= 0) {
      teamGroupsList.value = [];
      return;
    }
    isLoadingTeamGroups.value = true;
    try {
      const list = await teamService.getTeamGroups({ team_id: normalizedTeamId });
      teamGroupsList.value = mapTeamGroupItems(list);
    } catch (e) {
      teamGroupsList.value = [];
      logger.error('AddUserModal: failed to load team groups', e);
    } finally {
      isLoadingTeamGroups.value = false;
    }
  };

  onMounted(async () => {
    await loadTeams();
  });

  /** @param {any} event */
  const handleCVUpload = event => {
    const file = event.target.files[0];
    if (file) {
      form.value.cv_file = file;
    }
  };

  /** @param {any} event */
  const handleSignatureUpload = event => {
    const file = event.target.files[0];
    if (file) {
      form.value.signature_file = file;
    }
  };

  const resetForm = () => {
    form.value = {
      name: '',
      identity_number: '',
      birthday: '',
      phone: '',
      nationality: '',
      marital_status: 'single',
      job_title: '',
      type: '',
      salary: '',
      contract_type: 'full_time',
      date_of_works: '',
      trial_period_days: 90,
      additional_benefits: '',
      team: '',
      team_group_id: '',
      email: '',
      password: '',
      iban: '',
      cv_file: null,
      signature_file: null,
      work_phone_consent: false,
      logo_usage_consent: false,
      is_manager: false,
      is_executive_director: false,
    };
    teamGroupsList.value = [];
  };

  watch(
    () => props.editUser,
    user => {
      if (user) {
        isEdit.value = true;
        const typeValue =
          typeof user.type === 'string' && ROLE_MAP[user.type] !== undefined
            ? ROLE_MAP[user.type]
            : user.type;

        form.value = {
          ...user,
          type: typeValue,
          team: user?.team?.id ?? user?.team_id ?? user?.team ?? '',
          team_group_id: user?.team_group?.id ?? user?.team_group_id ?? '',
          password: '',
          is_manager: !!user.is_manager,
          is_executive_director: !!user.is_executive_director,
          cv_file: null,
          signature_file: null,
        };
        if (
          form.value.team &&
          Number(form.value.type) === ROLE_SALES &&
          !form.value.is_manager &&
          !form.value.is_executive_director
        ) {
          loadTeamGroups(form.value.team);
        } else {
          teamGroupsList.value = [];
        }
      } else {
        isEdit.value = false;
        resetForm();
      }
    },
    { immediate: true }
  );

  watch(
    () => form.value.type,
    newType => {
      const normalizedType = Number(newType);
      const salesOrMarketingOrLeader =
        normalizedType === ROLE_MARKETING ||
        normalizedType === ROLE_SALES ||
        normalizedType === ROLE_SALES_LEADER;
      if (!salesOrMarketingOrLeader) {
        form.value.team = '';
      }

      if (normalizedType !== ROLE_SALES) {
        form.value.is_manager = false;
        form.value.is_executive_director = false;
      }
      if (normalizedType === ROLE_SALES_LEADER) {
        form.value.team_group_id = '';
      }
      if (normalizedType !== ROLE_SALES) {
        teamGroupsList.value = [];
      } else if (
        form.value.team &&
        !form.value.is_manager &&
        !form.value.is_executive_director
      ) {
        loadTeamGroups(form.value.team);
      } else {
        teamGroupsList.value = [];
      }
    }
  );

  watch(
    () => form.value.is_manager,
    isManager => {
      if (isSalesType.value && isManager) {
        form.value.is_executive_director = false;
        form.value.team_group_id = '';
      }
    }
  );

  watch(
    () => form.value.is_executive_director,
    isExecutiveDirector => {
      if (isSalesType.value && isExecutiveDirector) {
        form.value.is_manager = false;
        form.value.team_group_id = '';
      }
    }
  );

  watch(
    () => form.value.team,
    async teamId => {
      if (!showTeamGroupField.value) {
        teamGroupsList.value = [];
        form.value.team_group_id = '';
        return;
      }
      await loadTeamGroups(teamId);
      if (
        form.value.team_group_id &&
        !teamGroupsList.value.some(g => Number(g.id) === Number(form.value.team_group_id))
      ) {
        form.value.team_group_id = '';
      }
    }
  );

  const handleSubmit = () => {
    const v = /** @type {any} */ (isEdit.value ? editValidation : createValidation);
    v.clearErrors();
    const dataToValidate = {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || '',
      role: String(form.value.type || ''),
      ...(isEdit.value
        ? {}
        : {
            password: form.value.password,
            password_confirmation: form.value.password,
          }),
    };

    if (!v.validate(dataToValidate)) {
      return;
    }

    if (isSalesType.value && form.value.is_manager && form.value.is_executive_director) {
      v.errors.is_manager = ['لا يمكن أن يكون الموظف مدير مبيعات ومديرًا تنفيذيًا للمبيعات في نفس الوقت.'];
      return;
    }
    if (isTeamRequired.value && !form.value.team) {
      v.errors.team = ['الفريق مطلوب لهذا الدور.'];
      return;
    }
    if (isTeamGroupRequired.value && !form.value.team_group_id) {
      v.errors.team_group_id = ['المجموعة مطلوبة لموظف المبيعات العادي.'];
      return;
    }

    /** @type {any} */
    const submissionData = {
      id: props.editUser?.id,
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      identity_number: form.value.identity_number,
      birthday: form.value.birthday,
      date_of_works: form.value.date_of_works,
      contract_type: form.value.contract_type,
      salary: form.value.salary,
      iban: form.value.iban,
      marital_status: form.value.marital_status,
      team: form.value.team,
      team_group_id: form.value.team_group_id,
      is_manager: form.value.is_manager,
      is_executive_director: form.value.is_executive_director,
    };

    submissionData.type =
      typeof form.value.type === 'number' ? form.value.type : parseInt(form.value.type, 10);

    const roleType = Number(submissionData.type);
    if (roleType === ROLE_SALES) {
      const isManager = Boolean(form.value.is_manager);
      const isExecutiveDirector = Boolean(form.value.is_executive_director) && !isManager;
      submissionData.is_manager = isManager;
      submissionData.is_executive_director = isExecutiveDirector;

      if (isManager || isExecutiveDirector) {
        delete submissionData.team;
        delete submissionData.team_group_id;
      } else {
        submissionData.team = Number(form.value.team);
        submissionData.team_group_id = Number(form.value.team_group_id);
      }
    } else if (roleType === ROLE_SALES_LEADER) {
      submissionData.is_manager = false;
      submissionData.is_executive_director = false;
      submissionData.team = Number(form.value.team);
      delete submissionData.team_group_id;
    } else {
      submissionData.is_executive_director = false;
      if (form.value.team !== '' && form.value.team != null) {
        submissionData.team = Number(form.value.team);
      } else if (props.useAdminApi) {
        delete submissionData.team;
      }
      delete submissionData.team_group_id;
    }

    /** @param {any} dateStr */
    const formatDateForAPI = dateStr => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;
    };

    submissionData.birthday = formatDateForAPI(submissionData.birthday);
    submissionData.date_of_works = formatDateForAPI(submissionData.date_of_works);

    if (isEdit.value && !submissionData.password) {
      delete submissionData.password;
    }

    if (form.value.cv_file) {
      submissionData.cv_file = form.value.cv_file;
    }
    if (form.value.signature_file) {
      submissionData.signature_file = form.value.signature_file;
    }

    emit('submit', submissionData);
  };

  return {
    form,
    isEdit,
    dateType,
    teamsList,
    teamGroupsList,
    isLoadingTeamGroups,
    isSalesType,
    isSalesLeaderType,
    isTeamRequired,
    isTeamGroupRequired,
    showTeamGroupField,
    getFieldError,
    NATIONALITIES,
    MARITAL_STATUSES,
    ROLE_OPTIONS,
    cvFileInput,
    signatureFileInput,
    handleCVUpload,
    handleSignatureUpload,
    handleSubmit,
  };
}
