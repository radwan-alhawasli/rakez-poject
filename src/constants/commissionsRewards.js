export const COMMISSION_CONTRIBUTION_TYPES = [
  { value: 'bring', label: 'جلب' },
  { value: 'convince', label: 'إقناع' },
  { value: 'close', label: 'إقفال' },
];

export const COMMISSION_WEIGHT_OPTIONS = [
  { value: 0.25, key: 'quarter', label: 'ربع', description: '25%' },
  { value: 0.5, key: 'half', label: 'نصف', description: '50%' },
  { value: 0.75, key: 'three_quarters', label: 'ثلاثة أرباع', description: '75%' },
  { value: 1, key: 'full', label: 'كامل', description: '100%' },
];

export const COMMISSION_SOURCE_OPTIONS = [
  { value: 'buyer', label: 'من المشتري' },
  { value: 'owner', label: 'من المالك / المطور' },
];

export const COMMISSION_SOURCE_LABEL = {
  buyer: 'من المشتري',
  owner: 'من المالك / المطور',
};

