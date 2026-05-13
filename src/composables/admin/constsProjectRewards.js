export const PROJECT_SAI_PERCENTAGE_KEYS = [
  'commission_percentage', 'commission_percent', 'commission_rate',
  'saei_percentage', 'sai_percentage', 'pursuit_percentage',
  'brokerage_percentage', 'sales_commission_percentage',
  'contract.commission_percentage', 'contract.commission_percent', 'contract.commission_rate',
  'contract.saei_percentage', 'contract.sai_percentage', 'contract.pursuit_percentage',
  'contract.brokerage_percentage', 'contract.sales_commission_percentage',
  'contract_info.commission_percentage', 'contract_info.commission_percent', 'contract_info.commission_rate',
  'contract_info.saei_percentage', 'contract_info.sai_percentage', 'contract_info.pursuit_percentage',
  'contract_info.brokerage_percentage', 'contract_info.sales_commission_percentage'
];

export const PROJECT_SAI_SOURCE_KEYS = [
  'commission_source', 'commission_from', 'saei_source', 'sai_source',
  'pursuit_source', 'brokerage_source', 'commission_paid_by',
  'contract.commission_source', 'contract.commission_from', 'contract.saei_source',
  'contract.sai_source', 'contract.pursuit_source', 'contract.brokerage_source', 'contract.commission_paid_by',
  'contract_info.commission_source', 'contract_info.commission_from', 'contract_info.saei_source',
  'contract_info.sai_source', 'contract_info.pursuit_source', 'contract_info.brokerage_source',
  'contract_info.commission_paid_by'
];

export const PROJECT_SAI_SOURCE_LABELS = {
  buyer: 'من المشتري',
  owner: 'من المالك',
  developer: 'من الما��ك / المطور',
};

export const REWARD_SOURCE_OPTIONS = [
  { value: 'company', label: 'من الشركة' },
  { value: 'developer', label: 'من المالك / المطور' },
];

export const CALCULATION_MODE_OPTIONS = [
  { value: 'percentage_of_sale', label: 'نسبة من قيمة البيع' },
  { value: 'manual_amount', label: 'قيمة مكافأة يدوية' },
];

export const DEGREE_OPTIONS = [
  { key: 'quarter', label: 'ربع', value: 0.25 },
  { key: 'half', label: 'نصف', value: 0.5 },
  { key: 'three_quarters', label: 'ثلاثة أرباع', value: 0.75 },
  { key: 'full', label: 'كامل', value: 1 },
];

export const OPERATION_FIELDS = [
  { key: 'bring', label: 'جلب' },
  { key: 'convince', label: 'إقناع' },
  { key: 'close', label: 'إقفال' },
];

export const SCOPE_FIELDS = [
  { key: 'assigned', label: 'فريق المشروع' },
  { key: 'outside', label: 'خارج فريق المشروع' },
];

export const MANAGEMENT_ROLES = [
  { key: 'ceo', label: 'المدير التنفيذي', userKey: 'ceo_user_id', bringKey: 'ceo_bring_percentage', convinceKey: 'ceo_convince_percentage', closeKey: 'ceo_close_percentage', sourceType: 'ceo' },
  { key: 'sales_manager', label: 'مدير التسويق والمبيعات', userKey: 'sales_manager_user_id', bringKey: 'sales_manager_bring_percentage', convinceKey: 'sales_manager_convince_percentage', closeKey: 'sales_manager_close_percentage', sourceType: 'sales_manager' },
  { key: 'sales_leader', label: 'السيلز ليدر', userKey: 'sales_leader_user_id', bringKey: 'sales_leader_bring_percentage', convinceKey: 'sales_leader_convince_percentage', closeKey: 'sales_leader_close_percentage', sourceType: 'sales_leader' },
  { key: 'group_leader', label: 'قائد المجموعة / الجروب ليدر', userKey: 'group_leader_user_id', bringKey: 'group_leader_bring_percentage', convinceKey: 'group_leader_convince_percentage', closeKey: 'group_leader_close_percentage', sourceType: 'group_leader' },
  { key: 'external_marketer', label: 'المسوق الخارجي', userKey: 'external_marketer_user_id', bringKey: 'external_marketer_bring_percentage', convinceKey: 'external_marketer_convince_percentage', closeKey: 'external_marketer_close_percentage', sourceType: 'external_marketer' },
];

export const REWARD_STATUS_LABELS = {
  pending: 'بانتظار الاعتماد',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
  paid: 'مدفوعة',
};

export const SOURCE_SCOPE_LABELS = {
  assigned_project_team: 'فريق المشروع',
  outside_project_team: 'خارج فريق المشروع',
  management: 'الإدارة',
};

export const SOURCE_TYPE_LABELS = {
  bring: 'جلب',
  convince: 'إقناع',
  close: 'إقفال',
  ceo: 'المدير التنفيذي',
  sales_manager: 'مدير التسويق والمبيعات',
  sales_leader: 'السيلز ليدر',
  group_leader: 'قائد المجموعة',
  external_marketer: 'المسوق الخارجي',
};

export const UNRESOLVED_REASON_LABELS = {
  no_matching_participants: 'لا يوجد مشاركون مطابقون لهذه النسبة.',
  missing_management_user: 'توجد نسبة إدارية بدون موظف محدد.',
};

export const UNAVAILABLE_TEXT = 'غير متوفر من بيانات المشروع';
export const UNSUPPORTED_TEXT = 'غير مدعوم حالياً من واجهة API';
