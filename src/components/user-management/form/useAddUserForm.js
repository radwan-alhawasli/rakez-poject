import { ref, watch, onMounted } from 'vue';
import hrService from '@/services/hrService';
import teamService from '@/services/teamService';
import logger from '@/utils/logger';
import { createUserSchema, editUserSchema } from '@/validation/schemas';
import { useValidation } from '@/composables/useValidation';

export function useAddUserForm(props, emit) {
  const isEdit = ref(!!props.editUser);
  const dateType = ref('gregorian');
  const teamsList = ref([]);
  const createValidation = useValidation(createUserSchema);
  const editValidation = useValidation(editUserSchema);

  const form = ref({
    name: '', identity_number: '', birthday: '', phone: '', nationality: '', marital_status: 'single',
    job_title: '', type: '', salary: '', contract_type: 'full_time', date_of_works: '', trial_period_days: 90,
    additional_benefits: '', team: '', email: '', password: '', iban: '', cv_file: null, signature_file: null,
    work_phone_consent: false, logo_usage_consent: false, is_manager: false,
  });

  const resetForm = () => {
    form.value = {
      name: '', identity_number: '', birthday: '', phone: '', nationality: '', marital_status: 'single',
      job_title: '', type: '', salary: '', contract_type: 'full_time', date_of_works: '', trial_period_days: 90,
      additional_benefits: '', team: '', email: '', password: '', iban: '', cv_file: null, signature_file: null,
      work_phone_consent: false, logo_usage_consent: false, is_manager: false,
    };
  };

  onMounted(async () => {
    try {
      const res = props.useAdminApi ? await teamService.getTeams({ per_page: 100 }) : await hrService.getTeams({ per_page: 100 });
      const items = res?.items ?? (Array.isArray(res) ? res : []);
      teamsList.value = items.map(t => ({ id: t.id ?? t.team_id, name: t.name || t.team_name || `فريق ${t.id}` }));
    } catch (e) { logger.error('Load teams error', e); }
  });

  watch(() => props.editUser, user => {
    if (user) {
      isEdit.value = true;
      form.value = { ...user, password: '', is_manager: !!user.is_manager, cv_file: null, signature_file: null };
    } else { isEdit.value = false; resetForm(); }
  }, { immediate: true });

  const formatDateForAPI = d => {
    if (!d) return ''; const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };

  const handleSubmit = () => {
    const v = isEdit.value ? editValidation : createValidation; v.clearErrors();
    const dataToValidate = {
      name: form.value.name, email: form.value.email, phone: form.value.phone || '', role: String(form.value.type || ''),
      ...(isEdit.value ? {} : { password: form.value.password, password_confirmation: form.value.password }),
    };
    if (!v.validate(dataToValidate)) return;

    const subData = { ...form.value, id: props.editUser?.id };
    subData.type = Number(form.value.type);
    if (form.value.team) subData.team = Number(form.value.team);
    else if (props.useAdminApi) delete subData.team;

    subData.birthday = formatDateForAPI(subData.birthday);
    subData.date_of_works = formatDateForAPI(subData.date_of_works);
    if (isEdit.value && !subData.password) delete subData.password;

    emit('submit', subData);
  };

  return { form, isEdit, dateType, teamsList, handleSubmit, getFieldError: (f) => (isEdit.value ? editValidation : createValidation).getFieldError(f) };
}
