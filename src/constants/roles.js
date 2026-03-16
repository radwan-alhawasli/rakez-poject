/**
 * أدوار المستخدمين — معرّفات رقمية ومفاتيح النص كما في الـ API
 * 1: admin, 2: project_management, 3: editor, 4: developer, 5: marketing,
 * 6: sales, 7: sales_leader, 8: hr, 9: credit, 10: accounting, 11: inventory,
 * 12: default, 13: accountant
 */
export const ROLE_ADMIN = 1;
export const ROLE_PROJECT_MANAGEMENT = 2;
export const ROLE_EDITOR = 3;
export const ROLE_DEVELOPER = 4;
export const ROLE_MARKETING = 5;
export const ROLE_SALES = 6;
export const ROLE_SALES_LEADER = 7;
export const ROLE_HR = 8;
export const ROLE_CREDIT = 9;
export const ROLE_ACCOUNTING = 10;
export const ROLE_INVENTORY = 11;
export const ROLE_DEFAULT = 12;
export const ROLE_ACCOUNTANT = 13;

/** مفتاح النص ← المعرّف الرقمي (للاستجابة من الـ API) */
export const ROLE_MAP = {
  admin: ROLE_ADMIN,
  project_management: ROLE_PROJECT_MANAGEMENT,
  editor: ROLE_EDITOR,
  developer: ROLE_DEVELOPER,
  marketing: ROLE_MARKETING,
  sales: ROLE_SALES,
  sales_leader: ROLE_SALES_LEADER,
  hr: ROLE_HR,
  credit: ROLE_CREDIT,
  accounting: ROLE_ACCOUNTING,
  inventory: ROLE_INVENTORY,
  default: ROLE_DEFAULT,
  accountant: ROLE_ACCOUNTANT,
};

/** المعرّف الرقمي ← { label عربي احترافي، key، class للـ badge } */
export const ROLES = {
  [ROLE_ADMIN]: { label: 'الإدارة', key: 'admin', class: 'role-admin' },
  [ROLE_PROJECT_MANAGEMENT]: { label: 'إدارة المشاريع', key: 'project_management', class: 'role-pm' },
  [ROLE_EDITOR]: { label: 'المونتاج', key: 'editor', class: 'role-editor' },
  [ROLE_DEVELOPER]: { label: 'المطور', key: 'developer', class: 'role-developer' },
  [ROLE_MARKETING]: { label: 'التسويق', key: 'marketing', class: 'role-marketing' },
  [ROLE_SALES]: { label: 'المبيعات', key: 'sales', class: 'role-sales' },
  [ROLE_SALES_LEADER]: { label: 'قائد المبيعات', key: 'sales_leader', class: 'role-sales-leader' },
  [ROLE_HR]: { label: 'الموارد البشرية', key: 'hr', class: 'role-hr' },
  [ROLE_CREDIT]: { label: 'الائتمان', key: 'credit', class: 'role-credit' },
  [ROLE_ACCOUNTING]: { label: 'المحاسبة', key: 'accounting', class: 'role-accounting' },
  [ROLE_INVENTORY]: { label: 'المخزون', key: 'inventory', class: 'role-inventory' },
  [ROLE_DEFAULT]: { label: 'افتراضي', key: 'default', class: 'role-default' },
  [ROLE_ACCOUNTANT]: { label: 'المحاسب', key: 'accountant', class: 'role-accountant' },
};

/**
 * قائمة الأدوار لاستخدامها في نموذج إضافة/تعديل المستخدم (القسم / الإدارة).
 * ترتيب احترافي: الإدارة أولاً، ثم الأقسام التشغيلية.
 */
export const ROLE_OPTIONS = [
  { value: ROLE_ADMIN, label: 'الإدارة' },
  { value: ROLE_PROJECT_MANAGEMENT, label: 'إدارة المشاريع' },
  { value: ROLE_EDITOR, label: 'المونتاج' },
  { value: ROLE_DEVELOPER, label: 'المطور' },
  { value: ROLE_MARKETING, label: 'التسويق' },
  { value: ROLE_SALES, label: 'المبيعات' },
  { value: ROLE_SALES_LEADER, label: 'قائد المبيعات' },
  { value: ROLE_HR, label: 'الموارد البشرية' },
  { value: ROLE_CREDIT, label: 'الائتمان' },
  { value: ROLE_ACCOUNTING, label: 'المحاسبة' },
  { value: ROLE_ACCOUNTANT, label: 'المحاسب' },
  { value: ROLE_INVENTORY, label: 'المخزون' },
  { value: ROLE_DEFAULT, label: 'افتراضي' },
];

export const getRoleLabel = (type, isManager = false) => {
  const normalizedType =
    typeof type === 'string' && ROLE_MAP[type] !== undefined ? ROLE_MAP[type] : type;
  if (normalizedType === ROLE_PROJECT_MANAGEMENT && isManager) {
    return 'مدير إدارة المشاريع';
  }
  return ROLES[normalizedType]?.label ?? (type != null && type !== '' ? `دور ${type}` : 'غير محدد');
};

export const getRoleClass = type => {
  const normalizedType =
    typeof type === 'string' && ROLE_MAP[type] !== undefined ? ROLE_MAP[type] : type;
  return ROLES[normalizedType]?.class ?? 'role-default';
};
