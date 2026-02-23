/** Numeric role IDs - use these instead of magic numbers in router and RBAC */
export const ROLE_MARKETING = 0;
export const ROLE_ADMIN = 1;
export const ROLE_PROJECT_ACQUISITION = 2;
export const ROLE_PROJECT_MANAGEMENT = 3;
export const ROLE_EDITOR = 4;
export const ROLE_SALES = 5;
export const ROLE_CREDIT = 6;
export const ROLE_ACCOUNTING = 7;
export const ROLE_HR = 8;

export const ROLE_MAP = {
  marketing: ROLE_MARKETING,
  admin: ROLE_ADMIN,
  project_acquisition: ROLE_PROJECT_ACQUISITION,
  project_management: ROLE_PROJECT_MANAGEMENT,
  editor: ROLE_EDITOR,
  sales: ROLE_SALES,
  credit: ROLE_CREDIT,
  accounting: ROLE_ACCOUNTING,
  hr: ROLE_HR,
};

export const ROLES = {
  [ROLE_MARKETING]: { label: 'التسويق / Marketing', key: 'marketing', class: 'role-marketing' },
  [ROLE_ADMIN]: { label: 'الإدارة / Admin', key: 'admin', class: 'role-admin' },
  [ROLE_PROJECT_ACQUISITION]: {
    label: 'العقود / Acquisition',
    key: 'project_acquisition',
    class: 'role-acquisition',
  },
  [ROLE_PROJECT_MANAGEMENT]: {
    label: 'إدارة المشاريع / PM',
    key: 'project_management',
    class: 'role-pm',
  },
  [ROLE_EDITOR]: { label: 'المونتاج / Editor', key: 'editor', class: 'role-editor' },
  [ROLE_SALES]: { label: 'المبيعات / Sales', key: 'sales', class: 'role-sales' },
  [ROLE_CREDIT]: { label: 'الائتمان / Credit', key: 'credit', class: 'role-credit' },
  [ROLE_ACCOUNTING]: {
    label: 'المحاسبة / Accounting',
    key: 'accounting',
    class: 'role-accounting',
  },
  [ROLE_HR]: { label: 'الموارد البشرية / HR', key: 'hr', class: 'role-hr' },
};

export const getRoleLabel = (type, isManager = false) => {
  const normalizedType =
    typeof type === 'string' && ROLE_MAP[type] !== undefined ? ROLE_MAP[type] : type;

  if (normalizedType === ROLE_PROJECT_MANAGEMENT) {
    return isManager ? 'مدير إدارة المشاريع' : 'موظف إدارة المشاريع';
  }

  return ROLES[normalizedType]?.label ?? (type || 'غير محدد');
};

export const getRoleClass = type => {
  const normalizedType =
    typeof type === 'string' && ROLE_MAP[type] !== undefined ? ROLE_MAP[type] : type;
  return ROLES[normalizedType]?.class ?? 'role-default';
};
