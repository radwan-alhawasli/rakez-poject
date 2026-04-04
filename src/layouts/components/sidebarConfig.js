/**
 * تكوين القائمة الجانبية حسب الدور — مصدر واحد للبيانات
 * كل عنصر: { to, label, tooltip, icon (SVG path string), permission?, showIf? }
 *
 * الأدوار:
 * 1: admin, 2: project_management, 3: editor, 4: developer, 5: marketing,
 * 6: sales, 7: sales_leader, 8: hr, 9: credit, 10: accounting, 11: inventory,
 * 12: default, 13: accountant
 */

// ── أيقونات SVG (paths فقط — يُرسم داخل viewBox 0 0 24 24) ──
export const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
  notifications: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
  projects: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  analytics: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
  contracts: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
  users: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  teams: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  teamCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>',
  tasks: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
  agents: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  knowledge: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
  money: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
  edit: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
  search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
  help: '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  exclusive: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>',
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
  pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>',
  inventory: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  ai: '<path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>',
  calendarDots: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>',
  market: '<path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="9" y1="21" x2="9" y2="10"></line><line x1="13" y1="21" x2="13" y2="10"></line><line x1="17" y1="21" x2="17" y2="10"></line>',
  pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>',
};

// ── عناصر مشتركة (تظهر في عدة أدوار) ──
const COMMON_ITEMS = {
  myRequests: { to: '/my-requests', label: 'طلباتي', tooltip: 'طلباتي', icon: ICONS.help },
  exclusiveRequest: { to: '/exclusive-request', label: 'طلب مشروع حصري', tooltip: 'طلب مشروع حصري', icon: ICONS.exclusive },
  aiAssistant: { to: '/ai-assistant', label: 'المساعد الذكي', tooltip: 'المساعد الذكي', icon: ICONS.agents },
  profile: { to: '/profile', label: 'الملف الشخصي', tooltip: 'الملف الشخصي', icon: ICONS.profile },
  tasks: { to: '/tasks', label: 'إدارة المهام', tooltip: 'إدارة المهام', icon: ICONS.tasks, permission: 'tasks.create' },
  notifications: { to: '/notifications', label: 'الإشعارات', tooltip: 'الإشعارات', icon: ICONS.notifications, hasBadge: true },
  dashboard: { to: '/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard },
  chat: { to: '/chat', label: 'الدردشة', tooltip: 'المحادثات الفورية', icon: ICONS.agents },
};

// ── تعريف القوائم حسب الدور ──

/** Admin (دور 1) — وصول كامل لجميع الأقسام */
const adminItems = [
  COMMON_ITEMS.dashboard,
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications },
  { to: '/project-management', label: 'إدارة المشاريع', tooltip: 'إدارة المشاريع', icon: ICONS.projects },
  { to: '/contracts', label: 'العقود', tooltip: 'العقود', icon: ICONS.contracts },
  { to: '/developers', label: 'المطورون', tooltip: 'المطورون', icon: ICONS.teams },
  { to: '/team-management', label: 'إدارة الفرق', tooltip: 'إدارة الفرق', icon: ICONS.teamCheck },
  { to: '/users', label: 'إدارة المستخدمين', tooltip: 'إدارة المستخدمين', icon: ICONS.users },
  { ...COMMON_ITEMS.tasks },
  { to: '/contract-form', label: 'إحضار المشاريع', tooltip: 'إحضار المشاريع', icon: ICONS.edit },
  { to: '/reservations', label: 'الحجوزات', tooltip: 'الحجوزات', icon: ICONS.check },
  { to: '/sales/sold-units', label: 'الوحدات المباعة', tooltip: 'الوحدات المباعة', icon: ICONS.money },
  { to: '/accounting/dashboard', label: 'الحسابات', tooltip: 'الحسابات', icon: ICONS.pulse },
  { to: '/image-approval', label: 'الموافقة على الصور', tooltip: 'الموافقة على الصور', icon: ICONS.image },

  // قسم المبيعات
  { to: '/sales/dashboard', label: 'لوحة المبيعات', tooltip: 'لوحة المبيعات', icon: ICONS.dashboard },
  { to: '/sales/projects', label: 'مشاريع المبيعات', tooltip: 'مشاريع المبيعات', icon: ICONS.projects },
  { to: '/sales/unit-search', label: 'بحث الوحدات', tooltip: 'بحث الوحدات', icon: ICONS.search },
  { to: '/sales/reservations', label: 'حجوزات المبيعات', tooltip: 'حجوزات المبيعات', icon: ICONS.calendar },
  { to: '/sales/targets', label: 'أهداف المبيعات', tooltip: 'أهداف المبيعات', icon: ICONS.target },
  { to: '/sales/team', label: 'فريق المبيعات', tooltip: 'فريق المبيعات', icon: ICONS.teams },
  { to: '/sales/attendance', label: 'الحضور', tooltip: 'الحضور', icon: ICONS.clock },
  { to: '/sales/project-schedules', label: 'دوام المشاريع', tooltip: 'دوام المشاريع', icon: ICONS.calendar },

  // قسم الموارد البشرية
  { to: '/hr/dashboard', label: 'لوحة الموارد البشرية', tooltip: 'لوحة الموارد البشرية', icon: ICONS.dashboard },
  { to: '/hr/teams', label: 'فرق الموارد البشرية', tooltip: 'فرق الموارد البشرية', icon: ICONS.teams },
  { to: '/hr/employee-performance', label: 'أداء المسوقين', tooltip: 'أداء المسوقين', icon: ICONS.pie },
  { to: '/hr/users', label: 'مستخدمو الموارد البشرية', tooltip: 'مستخدمي الموارد البشرية', icon: ICONS.users },
  { to: '/hr/reports', label: 'تقارير الموارد البشرية', tooltip: 'تقارير الموارد البشرية', icon: ICONS.contracts },

  // قسم الائتمان
  { to: '/credit/dashboard', label: 'لوحة الائتمان', tooltip: 'لوحة الائتمان', icon: ICONS.dashboard },
  { to: '/credit/notifications', label: 'إشعارات الائتمان', tooltip: 'إشعارات الائتمان', icon: ICONS.notifications },
  { to: '/credit/bookings', label: 'إدارة الحجوزات (الائتمان)', tooltip: 'إدارة الحجوزات (الائتمان)', icon: ICONS.tasks },

  // قسم المحاسبة
  { to: '/accounting/notifications', label: 'إشعارات المحاسبة', tooltip: 'إشعارات المحاسبة', icon: ICONS.notifications },
  { to: '/accounting/sold-units', label: 'وحدات المحاسبة المباعة', tooltip: 'وحدات المحاسبة المباعة', icon: ICONS.projects },
  { to: '/accounting/salaries', label: 'الرواتب وتوزيع العمولات', tooltip: 'الرواتب والعمولات', icon: ICONS.teams },

  // قسم التسويق
  { to: '/marketing/dashboard', label: 'لوحة التسويق', tooltip: 'لوحة التسويق', icon: ICONS.dashboard },
  { to: '/marketing/projects', label: 'مشاريع التسويق', tooltip: 'مشاريع التسويق', icon: ICONS.market },
  { to: '/marketing/developer-plan', label: 'خطة المطور', tooltip: 'خطة المطور', icon: ICONS.calendar },
  { to: '/marketing/employee-plans', label: 'خطط الموظفين', tooltip: 'خطط الموظفين', icon: ICONS.teams },
  { to: '/marketing/reports', label: 'تقارير التسويق', tooltip: 'تقارير التسويق', icon: ICONS.pie },

  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** إدارة المشاريع (دور 2) */
const pmItems = [
  COMMON_ITEMS.dashboard,
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications },
  { to: '/project-management', label: 'إدارة المشاريع', tooltip: 'إدارة المشاريع', icon: ICONS.projects },
  { ...COMMON_ITEMS.tasks },
  { to: '/image-approval', label: 'الموافقة على الصور', tooltip: 'الموافقة على الصور', icon: ICONS.image, showIf: 'isManager' },
  { to: '/team-management', label: 'إدارة الفرق', tooltip: 'إدارة الفرق', icon: ICONS.teams },
  { to: '/developers', label: 'المطورون', tooltip: 'المطورون', icon: ICONS.teams },
  { to: '/reservations', label: 'الحجوزات', tooltip: 'الحجوزات', icon: ICONS.check },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** المونتاج / المحرر (دور 3) */
const editorItems = [
  { to: '/editor/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard },
  { to: '/chat', label: 'الدردشة', tooltip: 'الدردشة', icon: ICONS.agents },
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/editor/projects', label: 'المشاريع', tooltip: 'المشاريع (قبل / بعد المونتاج)', icon: ICONS.contracts },
  { to: '/ai-assistant', label: 'الذكاء الاصطناعي', tooltip: 'الذكاء الاصطناعي', icon: ICONS.ai },
  { to: '/editor/teams', label: 'الفرق', tooltip: 'الفرق', icon: ICONS.teams },
  { to: '/editor/ratings', label: 'التقييمات', tooltip: 'تقييمات الموظفين', icon: ICONS.star, showIf: 'isManager' },
  COMMON_ITEMS.profile,
];

/** المطور (دور 4) */
const developerItems = [
  COMMON_ITEMS.dashboard,
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  COMMON_ITEMS.profile,
];

/** التسويق (دور 5) */
const marketingItems = [
  { to: '/marketing/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard, permission: 'marketing.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  { to: '/marketing/projects', label: 'مشاريع التسويق', tooltip: 'مشاريع التسويق', icon: ICONS.market, permission: 'marketing.projects.view' },
  { to: '/marketing/developer-plan', label: 'خطة المطور', tooltip: 'خطة المطور', icon: ICONS.calendar, permission: 'marketing.plans.create' },
  { to: '/marketing/employee-plans', label: 'خطط الموظفين', tooltip: 'خطط الموظفين', icon: ICONS.teams, permission: 'marketing.plans.create' },
  { to: '/marketing/reports', label: 'أدائي', tooltip: 'أدائي', icon: ICONS.pie, permission: 'marketing.reports.view' },
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** المبيعات (دور 6) وقائد المبيعات (دور 7) — نفس الواجهة */
const salesItems = [
  { to: '/sales/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard, permission: 'sales.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, permission: 'notifications.view', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/sales/projects', label: 'المشاريع', tooltip: 'المشاريع', icon: ICONS.projects, permission: 'sales.projects.view' },
  { to: '/sales/unit-search', label: 'بحث الوحدات', tooltip: 'بحث الوحدات', icon: ICONS.search, permission: 'sales.projects.view' },
  { to: '/sales/reservations', label: 'الحجوزات', tooltip: 'الحجوزات', icon: ICONS.calendar, permission: 'sales.reservations.view' },
  { to: '/sales/targets', label: 'الأهداف', tooltip: 'الأهداف', icon: ICONS.target, permission: 'sales.targets.view', dynamicLabel: { permission: 'sales.team.manage', ifTrue: 'أهداف الفريق', ifFalse: 'أهدافي' } },
  { to: '/sales/team', label: 'الفريق', tooltip: 'الفريق', icon: ICONS.teams, permission: 'sales.team.manage' },
  { to: '/sales/attendance', label: 'دوامي', tooltip: 'دوامي', icon: ICONS.clock, permission: 'sales.attendance.view' },
  { to: '/sales/project-schedules', label: 'إدارة دوام المشاريع', tooltip: 'إدارة دوام المشاريع', icon: ICONS.calendarDots, permission: 'sales.attendance.manage' },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** الموارد البشرية (دور 8) */
const hrItems = [
  { to: '/hr/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard, permission: 'hr.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, permission: 'notifications.view', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/hr/teams', label: 'إدارة الفرق', tooltip: 'إدارة الفرق', icon: ICONS.teams, permission: 'hr.teams.manage' },
  { to: '/hr/employee-performance', label: 'أداء المسوقين', tooltip: 'أداء المسوقين', icon: ICONS.pie, permission: 'hr.performance.view' },
  { to: '/hr/users', label: 'إدارة المستخدمين', tooltip: 'إدارة المستخدمين', icon: ICONS.users, permission: 'hr.users.create' },
  { to: '/hr/reports', label: 'التقارير', tooltip: 'التقارير', icon: ICONS.contracts, permission: 'hr.reports.view' },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** الائتمان (دور 9) */
const creditItems = [
  { to: '/credit/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/credit/bookings', label: 'إدارة الحجوزات', tooltip: 'إدارة الحجوزات', icon: ICONS.tasks },
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** المحاسبة (دور 10) والمحاسب (دور 13) */
const accountingItems = [
  { to: '/accounting/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, to: '/accounting/notifications', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/accounting/sold-units', label: 'الوحدات المباعة', tooltip: 'الوحدات المباعة', icon: ICONS.projects },
  { to: '/accounting/salaries', label: 'الرواتب وتوزيع العمولات', tooltip: 'الرواتب وتوزيع العمولات', icon: ICONS.teams },
  { to: '/developers', label: 'عرض المطورين', tooltip: 'عرض المطورين', icon: ICONS.teams },
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** المخزون (دور 11) */
const inventoryItems = [
  { to: '/inventory/dashboard', label: 'لوحة التحكم', tooltip: 'لوحة التحكم', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { to: '/inventory/projects', label: 'المشاريع', tooltip: 'المشاريع على الخريطة', icon: ICONS.projects },
  { to: '/inventory/contracts', label: 'العقود', tooltip: 'العقود', icon: ICONS.contracts },
  { to: '/inventory/ai-suggestions', label: 'اقتراحات الذكاء الاصطناعي', tooltip: 'اقتراحات الذكاء الاصطناعي', icon: ICONS.ai },
  { ...COMMON_ITEMS.notifications },
  { ...COMMON_ITEMS.tasks },
  COMMON_ITEMS.profile,
];

/** عناصر للمديرين فقط (is_manager) — تظهر في كل الأدوار */
const MANAGER_ONLY_ITEMS = [
  { to: '/manager/employees', label: 'التقييم', tooltip: 'التقييم والمراجعات', icon: ICONS.star, showIf: 'isManager' },
];

/**
 * خريطة القوائم حسب رقم الدور
 * المفتاح = userRole (رقم 1-13)
 */
export const SIDEBAR_NAV_MAP = {
  1: adminItems,        // admin
  2: pmItems,           // project_management
  3: editorItems,       // editor
  4: developerItems,    // developer
  5: marketingItems,    // marketing
  6: salesItems,        // sales
  7: salesItems,        // sales_leader (نفس واجهة المبيعات)
  8: hrItems,           // hr
  9: creditItems,       // credit
  10: accountingItems,  // accounting
  11: inventoryItems,   // inventory
  12: marketingItems,   // default (يعرض واجهة التسويق)
  13: accountingItems,  // accountant (نفس واجهة المحاسبة)
};

/**
 * الحصول على قائمة التنقل حسب الدور
 * @param {number} role - رقم الدور (1-13)
 * @returns {Array} قائمة عناصر التنقل
 */
export function getNavItemsForRole(role) {
  const roleItems = SIDEBAR_NAV_MAP[role] || marketingItems;
  return [...MANAGER_ONLY_ITEMS, ...roleItems];
}
