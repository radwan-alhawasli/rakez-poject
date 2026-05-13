// دوال بناء النموذج الخاص بمكافآت المشاريع
import { MANAGEMENT_ROLES } from './constsProjectRewards.js';
import { toBoolean } from './utilsProjectRewards.js';

export function emptyRewardForm(contractId) {
  const base = {
    contract_id: String(contractId || '').trim(),
    calculation_mode: 'percentage_of_sale',
    reward_percentage: '',
    source: 'company',
    tax_enabled: false,
    vat_percentage: '15',
    assigned_bring_percentage: '',
    assigned_convince_percentage: '',
    assigned_close_percentage: '',
    outside_bring_percentage: '',
    outside_convince_percentage: '',
    outside_close_percentage: '',
    is_active: true,
  };

  MANAGEMENT_ROLES.forEach(role => {
    base[role.userKey] = '';
    base[role.bringKey] = '';
    base[role.convinceKey] = '';
    base[role.closeKey] = '';
  });

  return base;
}

export function fillFormFromSetting(setting, contractId) {
  const next = emptyRewardForm(contractId);
  for (const key of Object.keys(next)) {
    if (key === 'contract_id') continue;
    if (key === 'is_active' || key === 'tax_enabled') {
      next[key] = toBoolean(setting?.[key]);
      continue;
    }
    next[key] = setting?.[key] ?? next[key];
  }
  for (const key of Object.keys(next)) {
    if (key.endsWith('_user_id')) next[key] = next[key] ? String(next[key]) : '';
    else if (typeof next[key] === 'number') next[key] = String(next[key]);
  }
  return next;
}

export function resetFormToDefaults(contractId, form) {
  Object.assign(form, emptyRewardForm(contractId));
}
