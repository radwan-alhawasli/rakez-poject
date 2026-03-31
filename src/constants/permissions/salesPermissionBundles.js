/** صلاحيات السيلز (أساس) — نفسها تُعطى لـ sales */
export const SALES_BASE_PERMISSIONS = [
  'tasks.create',
  'sales.dashboard.view',
  'sales.projects.view',
  'sales.units.view',
  'sales.units.book',
  'sales.reservations.create',
  'sales.reservations.view',
  'sales.reservations.confirm',
  'sales.reservations.cancel',
  'sales.waiting_list.create',
  'sales.goals.view',
  'sales.schedule.view',
  'sales.targets.view',
  'sales.targets.update',
  'sales.attendance.view',
  'sales.sold_units.view',
  'sales.deposits.view',
  'sales.analytics.view',
  'notifications.view',
  'exclusive_projects.view',
  'exclusive_projects.request',
  'exclusive_projects.contract.complete',
  'exclusive_projects.contract.export',
  'use-ai-assistant',
  /** View second party data (project tracker / second-party-data/show) */
  'second_party.view',
];

/** صلاحيات إضافية لقائد المبيعات فقط — مع SALES_BASE = كل السيلز + أمور القائد كاملة */
export const SALES_LEADER_EXTRA_PERMISSIONS = [
  'sales.waiting_list.convert',
  'sales.goals.create',
  'sales.team.manage',
  'sales.attendance.manage',
  'sales.tasks.manage',
  'sales.tasks.create_for_marketing',
  'sales.projects.allocate_shifts',
  'sales.negotiation.approve',
  'sales.payment_plan.manage',
  'ai-calls.manage',
];
