/**
 * Map frontend role type (number) to bootstrap role key
 * sales_leader: role 5 + (is_manager or is_leader) => use sales_leader map
 */
/** مفتاح Bootstrap حسب المعرّف الرقمي للأدوار (1–13) */
export const ROLE_TO_BOOTSTRAP_KEY = {
  1: 'admin',
  2: 'project_management',
  3: 'editor',
  4: 'developer',
  5: 'marketing',
  6: 'sales',
  7: 'sales_leader',
  8: 'hr',
  9: 'credit',
  10: 'accounting',
  11: 'inventory',
  12: 'default',
  13: 'accountant',
};
