import { ref, watch, onMounted } from 'vue';
import { ROLE_MAP, ROLE_OPTIONS } from '@/constants/roles';
import { NATIONALITIES, MARITAL_STATUSES } from '@/constants/lookups';
import hrService from '@/services/hrService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { createUserSchema, editUserSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';

export function useAddUserModal(props, emit) {
  const isEdit = ref(false);
  const dateType = ref('gregorian');
  const cvFileInput = ref(null);

  const createValidation = useValidation(createUserSchema);
  const editValidation = useValidation(editUserSchema);
  const getFieldError = field => {
    const v = isEdit.value ? editValidation : createValidation;
    return v.getFieldError(field);
  };
  const signatureFileInput = ref(null);
  const teamsList = ref([]);

  onMounted(async () => {
    try {
      if (props.useAdminApi) {
        const list = await teamService.getTeams({ per_page: 100 });
        teamsList.value = (Array.isArray(list) ? list : []).map(t => ({
          id: t.id ?? t.team_id,
          name: t.name || t.team_name || `فريق ${t.id ?? t.team_id}`,
        }));
      } else {
        const res = await hrService.getTeams({ per_page: 100 });
        const items = res?.items ?? [];
        teamsList.value = items.map(t => ({
          id: t.id ?? t.team_id,
          name: t.name || t.team_name || `فريق ${t.id ?? t.team_id}`,
        }));
      }
    } catch (e) {
      logger.error('AddUserModal: failed to load teams', e);
    }
  });

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
    email: '',
    password: '',
    iban: '',
    cv_file: null,
    signature_file: null,
    work_phone_consent: false,
    logo_usage_consent: false,
    is_manager: false,
  });

  const handleCVUpload = event => {
    const file = event.target.files[0];
    if (file) {
      form.value.cv_file = file;
    }
  };

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
      email: '',
      password: '',
      iban: '',
      cv_file: null,
      signature_file: null,
      work_phone_consent: false,
      logo_usage_consent: false,
      is_manager: false,
    };
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
          password: '',
          is_manager: !!user.is_manager,
          cv_file: null,
          signature_file: null,
        };
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
      const salesOrMarketing = 5 === newType || 6 === newType;
      if (!salesOrMarketing) {
        form.value.team = '';
      }
    }
  );

  const handleSubmit = () => {
    const v = isEdit.value ? editValidation : createValidation;
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
      is_manager: form.value.is_manager,
    };

    submissionData.type =
      typeof form.value.type === 'number' ? form.value.type : parseInt(form.value.type, 10);
    if (form.value.team !== '' && form.value.team != null) {
      submissionData.team = Number(form.value.team);
    } else if (props.useAdminApi) {
      delete submissionData.team;
    }

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
