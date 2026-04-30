/**
 * ØªÙƒÙˆÙŠÙ† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠØ© Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙˆØ± â€” Ù…ØµØ¯Ø± ÙˆØ§Ø­Ø¯ Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª
 * ÙƒÙ„ Ø¹Ù†ØµØ±: { to, label, tooltip, icon (SVG path string), permission?, showIf? }
 * Ø£Ùˆ Ø¹Ù†ÙˆØ§Ù† Ù‚Ø³Ù…: { type: 'section', label } â€” ÙŠÙØ³ØªØ®Ø¯Ù… ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¥Ø¯Ù…Ù† Ù„Ø¹Ù†Ø§ÙˆÙŠÙ† Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø§Ù„Ù…Ø¯Ù…Ø¬Ø©.
 * Ø§Ù„Ø¥Ø¯Ù…Ù† (Ø¯ÙˆØ± 1): Ø¯Ù…Ø¬ Ù‚ÙˆØ§Ø¦Ù… Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ø¨Ø§Ù„ØªØ±ØªÙŠØ¨ + Â«Ø¥Ø­Ø¶Ø§Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹Â»ØŒ Ù…Ø¹ Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…ÙƒØ±Ø±Ø© Ù„Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§Ø± (to).
 *
 * Ø§Ù„Ø£Ø¯ÙˆØ§Ø±:
 * 1: admin, 2: project_management, 3: editor, 4: developer, 5: marketing,
 * 6: sales, 7: sales_leader, 8: hr, 9: credit, 10: accounting, 11: inventory,
 * 12: default, 13: accountant
 */

// â”€â”€ Ø£ÙŠÙ‚ÙˆÙ†Ø§Øª SVG (paths ÙÙ‚Ø· â€” ÙŠÙØ±Ø³Ù… Ø¯Ø§Ø®Ù„ viewBox 0 0 24 24) â”€â”€
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

// â”€â”€ Ø¹Ù†Ø§ØµØ± Ù…Ø´ØªØ±ÙƒØ© (ØªØ¸Ù‡Ø± ÙÙŠ Ø¹Ø¯Ø© Ø£Ø¯ÙˆØ§Ø±) â”€â”€
const COMMON_ITEMS = {
  myRequests: { to: '/my-requests', label: 'Ø·Ù„Ø¨Ø§ØªÙŠ', tooltip: 'Ø·Ù„Ø¨Ø§ØªÙŠ', icon: ICONS.help },
  exclusiveRequest: { to: '/exclusive-request', label: 'Ø·Ù„Ø¨ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠ', tooltip: 'Ø·Ù„Ø¨ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠ', icon: ICONS.exclusive },
  aiAssistant: { to: '/ai-assistant', label: 'Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ', tooltip: 'Ø§Ù„Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒÙŠ', icon: ICONS.agents },
  profile: { to: '/profile', label: 'Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ', tooltip: 'Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ', icon: ICONS.profile },
  tasks: { to: '/tasks', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù‡Ø§Ù…', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ù‡Ø§Ù…', icon: ICONS.tasks },
  notifications: { to: '/notifications', label: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª', tooltip: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª', icon: ICONS.notifications, hasBadge: true },
  dashboard: { to: '/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard },
  chat: { to: '/chat', label: 'Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©', tooltip: 'Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø§Øª Ø§Ù„ÙÙˆØ±ÙŠØ©', icon: ICONS.agents },
};

// â”€â”€ ØªØ¹Ø±ÙŠÙ Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙˆØ± â”€â”€

/** Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ (Ø¯ÙˆØ± 2) */
const pmItems = [
  COMMON_ITEMS.dashboard,
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications },
  { to: '/project-management', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', icon: ICONS.projects },
  { ...COMMON_ITEMS.tasks },
  { to: '/image-approval', label: 'Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„ØµÙˆØ±', tooltip: 'Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„ØµÙˆØ±', icon: ICONS.image, showIf: 'isManager' },
  { to: '/team-management', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±Ù‚', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±Ù‚', icon: ICONS.teams },
  { to: '/developers', label: 'Ø§Ù„Ù…Ø·ÙˆØ±ÙˆÙ†', tooltip: 'Ø§Ù„Ù…Ø·ÙˆØ±ÙˆÙ†', icon: ICONS.teams },
  { to: '/reservations', label: 'Ø­Ø¬ÙˆØ²Ø§ØªÙŠ', tooltip: 'Ø­Ø¬ÙˆØ²Ø§ØªÙŠ â€” Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', icon: ICONS.check },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…ÙˆÙ†ØªØ§Ø¬ / Ø§Ù„Ù…Ø­Ø±Ø± (Ø¯ÙˆØ± 3) */
const editorItems = [
  { to: '/editor/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard },
  { to: '/chat', label: 'Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©', tooltip: 'Ø§Ù„Ø¯Ø±Ø¯Ø´Ø©', icon: ICONS.agents },
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/editor/projects', label: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', tooltip: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ (Ù‚Ø¨Ù„ / Ø¨Ø¹Ø¯ Ø§Ù„Ù…ÙˆÙ†ØªØ§Ø¬)', icon: ICONS.contracts },
  {
    to: '/editor/projects?filter=pending',
    label: 'Ù‚Ø¨ÙˆÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·',
    tooltip: 'Ù…Ø´Ø§Ø±ÙŠØ¹ Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…ÙˆÙ†ØªØ§Ø¬ (Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©)',
    icon: ICONS.teamCheck,
    showIf: 'isManager',
  },
  { to: '/ai-assistant', label: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', tooltip: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', icon: ICONS.ai },
  { to: '/editor/teams', label: 'Ø§Ù„ÙØ±Ù‚', tooltip: 'Ø§Ù„ÙØ±Ù‚', icon: ICONS.teams },
  { to: '/editor/ratings', label: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª', tooltip: 'ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†', icon: ICONS.star, showIf: 'isManager' },
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…Ø·ÙˆØ± (Ø¯ÙˆØ± 4) */
const developerItems = [
  COMMON_ITEMS.dashboard,
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  COMMON_ITEMS.profile,
];

/** Ø§Ù„ØªØ³ÙˆÙŠÙ‚ (Ø¯ÙˆØ± 5) â€” Ø¨Ø¯ÙˆÙ† Â«Ø·Ù„Ø¨Ø§ØªÙŠÂ» ÙˆÂ«Ø·Ù„Ø¨ Ù…Ø´Ø±ÙˆØ¹ Ø­ØµØ±ÙŠÂ» (Ù…Ø®ØµØµ Ù„Ø£Ø¯ÙˆØ§Ø± Ø£Ø®Ø±Ù‰) */
const marketingItems = [
  { to: '/marketing/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard, permission: 'marketing.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/marketing/projects', label: 'Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„ØªØ³ÙˆÙŠÙ‚', tooltip: 'Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„ØªØ³ÙˆÙŠÙ‚', icon: ICONS.market, permission: 'marketing.projects.view' },
  { to: '/marketing/developer-plan', label: 'Ø®Ø·Ø© Ø§Ù„Ù…Ø·ÙˆØ±', tooltip: 'Ø®Ø·Ø© Ø§Ù„Ù…Ø·ÙˆØ±', icon: ICONS.calendar, permission: 'marketing.plans.create' },
  { to: '/marketing/employee-plans', label: 'Ø®Ø·Ø· Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†', tooltip: 'Ø®Ø·Ø· Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†', icon: ICONS.teams, permission: 'marketing.plans.create' },
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª (Ø¯ÙˆØ± 6) ÙˆÙ‚Ø§Ø¦Ø¯ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª (Ø¯ÙˆØ± 7) â€” Ù†ÙØ³ Ø§Ù„ÙˆØ§Ø¬Ù‡Ø© */
const salesItems = [
  { to: '/sales/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard, permission: 'sales.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, permission: 'notifications.view', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/sales/projects', label: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', tooltip: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', icon: ICONS.projects, permission: 'sales.projects.view' },
  { to: '/sales/unit-search', label: 'Ø¨Ø­Ø« Ø§Ù„ÙˆØ­Ø¯Ø§Øª', tooltip: 'Ø¨Ø­Ø« Ø§Ù„ÙˆØ­Ø¯Ø§Øª', icon: ICONS.search, permission: 'sales.projects.view' },
  { to: '/sales/reservations', label: 'Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª', tooltip: 'Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª', icon: ICONS.calendar, permission: 'sales.reservations.view' },
  {
    to: '/sales/targets',
    label: 'Ø£Ù‡Ø¯Ø§ÙÙŠ',
    tooltip: 'Ø£Ù‡Ø¯Ø§ÙÙŠ',
    icon: ICONS.target,
    permission: 'sales.targets.view',
    /** Ù‚Ø§Ø¦Ø¯ Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª (Ø¯ÙˆØ± 7): ØªØ³Ù…ÙŠØ© Ù…Ø®ØªÙ„ÙØ© ÙÙŠ Ø§Ù„Ø´Ø±ÙŠØ· */
    // @ts-ignore
    labelByRole: { 7: 'Ø£Ù‡Ø¯Ø§Ù Ø§Ù„ÙØ±Ù‚' },
    // @ts-ignore
    tooltipByRole: { 7: 'Ø£Ù‡Ø¯Ø§Ù Ø§Ù„ÙØ±Ù‚' },
  },
  { to: '/sales/team', label: 'Ø§Ù„ÙØ±ÙŠÙ‚', tooltip: 'Ø§Ù„ÙØ±ÙŠÙ‚', icon: ICONS.teams, permission: 'sales.team.manage' },
  {
    to: '/sales/attendance',
    label: 'Ø¯ÙˆØ§Ù…ÙŠ',
    tooltip: 'Ø¯ÙˆØ§Ù…ÙŠ',
    icon: ICONS.clock,
    permission: 'sales.attendance.view',
    /** Ù…Ø¯ÙŠØ± Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª / Ù…Ù† Ù„Ø¯ÙŠÙ‡ Ø¥Ø¯Ø§Ø±Ø© Ø­Ø¶ÙˆØ± Ø§Ù„ÙØ±ÙŠÙ‚ â€” Ù†ÙØ³ Ù…Ù†Ø·Ù‚ SalesAttendanceTab (Ø¹Ù†ÙˆØ§Ù† Â«Ø¯ÙˆØ§Ù… Ø§Ù„ÙØ±Ù‚Â») */
    // @ts-ignore
    dynamicLabel: {
      permission: 'sales.attendance.manage',
      ifTrue: 'Ø¯ÙˆØ§Ù… Ø§Ù„ÙØ±Ù‚',
      ifFalse: 'Ø¯ÙˆØ§Ù…ÙŠ',
    },
  },
  { to: '/sales/project-schedules', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø¯ÙˆØ§Ù… Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø¯ÙˆØ§Ù… Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', icon: ICONS.calendarDots, permission: 'sales.attendance.manage' },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ© (Ø¯ÙˆØ± 8) */
const hrItems = [
  { to: '/hr/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard, permission: 'hr.dashboard.view' },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, permission: 'notifications.view', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/hr/teams', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±Ù‚', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ÙØ±Ù‚', icon: ICONS.teams, permission: 'hr.teams.manage' },
  { to: '/hr/team-performance', label: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„ÙÙØ±Ù‚', tooltip: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„ÙÙØ±Ù‚', icon: ICONS.analytics, permission: 'hr.performance.view' },
  { to: '/hr/employee-performance', label: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ø³ÙˆÙ‚ÙŠÙ†', tooltip: 'Ø£Ø¯Ø§Ø¡ Ø§Ù„Ù…Ø³ÙˆÙ‚ÙŠÙ†', icon: ICONS.pie, permission: 'hr.performance.view' },
  { to: '/hr/users', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†', icon: ICONS.users, permission: 'hr.users.create' },
  { to: '/hr/reports', label: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±', tooltip: 'Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±', icon: ICONS.contracts, permission: 'hr.reports.view' },
  COMMON_ITEMS.myRequests,
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ø§Ø¦ØªÙ…Ø§Ù† (Ø¯ÙˆØ± 9) */
const creditItems = [
  { to: '/credit/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/credit/bookings', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª', tooltip: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª', icon: ICONS.tasks },
  { to: '/credit/marketing-requests', label: 'Ø·Ù„Ø¨ ØªØ³ÙˆÙŠÙ‚', tooltip: 'Ø·Ù„Ø¨ ØªØ³ÙˆÙŠÙ‚', icon: ICONS.tasks },
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø© (Ø¯ÙˆØ± 10) ÙˆØ§Ù„Ù…Ø­Ø§Ø³Ø¨ (Ø¯ÙˆØ± 13) */
const accountingItems = [
  { to: '/accounting/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { ...COMMON_ITEMS.notifications, to: '/accounting/notifications', hasBadge: true },
  { ...COMMON_ITEMS.tasks },
  { to: '/accounting/projects', label: 'Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø·Ø§Ù„Ø¨Ù‡', tooltip: 'Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø·Ø§Ù„Ø¨Ù‡', icon: ICONS.projects },
  { to: '/accounting/sold-units', label: 'Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø¹Ø©', tooltip: 'Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…Ø¨Ø§Ø¹Ø©', icon: ICONS.projects },
  { to: '/accounting/deposits', label: 'Ø§Ù„Ø¹Ø±Ø¨ÙˆÙ†', tooltip: 'ØªØ£ÙƒÙŠØ¯ ÙˆØ¥Ø±Ø¬Ø§Ø¹ Ø§Ù„Ø¹Ø±Ø¨ÙˆÙ†', icon: ICONS.calendar, permission: 'accounting.deposits.view' },
  { to: '/accounting/salaries', label: 'Ø§Ù„Ø±ÙˆØ§ØªØ¨ ÙˆØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª', tooltip: 'Ø§Ù„Ø±ÙˆØ§ØªØ¨ ÙˆØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¹Ù…ÙˆÙ„Ø§Øª', icon: ICONS.teams },
  { to: '/developers', label: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø·ÙˆØ±ÙŠÙ†', tooltip: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø·ÙˆØ±ÙŠÙ†', icon: ICONS.teams },
  COMMON_ITEMS.exclusiveRequest,
  COMMON_ITEMS.aiAssistant,
  COMMON_ITEMS.profile,
];

/** Ø§Ù„Ù…Ø®Ø²ÙˆÙ† (Ø¯ÙˆØ± 11) */
const inventoryItems = [
  { to: '/inventory/dashboard', label: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', tooltip: 'Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…', icon: ICONS.dashboard },
  COMMON_ITEMS.chat,
  { to: '/inventory/projects', label: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', tooltip: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø¹Ù„Ù‰ Ø§Ù„Ø®Ø±ÙŠØ·Ø©', icon: ICONS.projects },
  { to: '/inventory/contracts', label: 'Ø§Ù„Ø¹Ù‚ÙˆØ¯', tooltip: 'Ø§Ù„Ø¹Ù‚ÙˆØ¯', icon: ICONS.contracts },
  { to: '/inventory/ai-suggestions', label: 'Ø§Ù‚ØªØ±Ø§Ø­Ø§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', tooltip: 'Ø§Ù‚ØªØ±Ø§Ø­Ø§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ', icon: ICONS.ai },
  { ...COMMON_ITEMS.notifications },
  { ...COMMON_ITEMS.tasks },
  COMMON_ITEMS.profile,
];

/** Ø¥Ø¯Ø§Ø±Ø© Ø¹Ø§Ù…Ø© â€” Ø¥Ø­Ø¶Ø§Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ (Ø¥Ø¯Ù…Ù† ÙÙ‚Ø·Ø› ÙŠÙØ¯Ø±ÙŽØ¬ Ø¨ÙŠÙ† Ù‚Ø³Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ ÙˆØ§Ù„Ù…ÙˆÙ†ØªØ§Ø¬) */
const ADMIN_CONTRACT_FORM_ITEM = {
  to: '/contract-form',
  label: 'Ø¥Ø­Ø¶Ø§Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹',
  tooltip: 'Ø¥Ø­Ø¶Ø§Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹',
  icon: ICONS.edit,
};
const ADMIN_LOCATIONS_ITEM = {
  to: '/admin/locations',
  label: 'إدارة المدن والأحياء',
  tooltip: 'إدارة المدن والأحياء',
  icon: ICONS.projects,
};
const ADMIN_ORDER_MARKETING_DEVELOPERS_ITEM = {
  to: '/admin/order-marketing-developers',
  label: 'طلبات مطوري التسويق',
  tooltip: 'طلبات مطوري التسويق',
  icon: ICONS.tasks,
};

/**
 * ÙƒØªÙ„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¥Ø¯Ù…Ù† â€” ÙŠÙØ²Ø§Ù„ Ø§Ù„ØªÙƒØ±Ø§Ø± Ø­Ø³Ø¨ `to` Ù…Ø¹ Ø§Ù„Ø¥Ø¨Ù‚Ø§Ø¡ Ø¹Ù„Ù‰ Ø£ÙˆÙ„ Ø¸Ù‡ÙˆØ± (ØªØ³Ù…ÙŠØ§Øª Ù‚Ø³Ù… Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø£ÙˆÙ„Ø§Ù‹).
 */
const ADMIN_NAV_BLOCKS = [
  { label: 'الإدارة', items: [ADMIN_LOCATIONS_ITEM, ADMIN_ORDER_MARKETING_DEVELOPERS_ITEM] },
  { label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹', items: [...pmItems, ADMIN_CONTRACT_FORM_ITEM] },
  { label: 'Ø§Ù„Ù…ÙˆÙ†ØªØ§Ø¬', items: editorItems },
  { label: 'Ø§Ù„Ù…Ø·ÙˆØ±', items: developerItems },
  { label: 'Ø§Ù„ØªØ³ÙˆÙŠÙ‚', items: marketingItems },
  { label: 'Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª', items: salesItems },
  { label: 'Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©', items: hrItems },
  { label: 'Ø§Ù„Ø§Ø¦ØªÙ…Ø§Ù†', items: creditItems },
  { label: 'Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø©', items: accountingItems },
  { label: 'Ø§Ù„Ù…Ø®Ø²ÙˆÙ†', items: inventoryItems },
];

function buildAdminNavDedupedByPath() {
  const seen = new Set();
  const out = [];
  for (const { label, items } of ADMIN_NAV_BLOCKS) {
    const chunk = [];
    for (const item of items) {
      if (/** @type {any} */ (item).type === 'section') continue;
      const path = item.to;
      if (!path) continue;
      if (seen.has(path)) continue;
      seen.add(path);
      chunk.push(item);
    }
    if (chunk.length) {
      out.push({ type: 'section', label });
      out.push(...chunk);
    }
  }
  return out;
}

/** Admin (Ø¯ÙˆØ± 1) â€” Ø¯Ù…Ø¬ Ø£Ù‚Ø³Ø§Ù… + Ø¥Ø­Ø¶Ø§Ø± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ØŒ Ø¨Ø¯ÙˆÙ† ØªØ¨ÙˆÙŠØ¨Ø§Øª Ù…ÙƒØ±Ø±Ø© Ù„Ù†ÙØ³ Ø§Ù„Ù…Ø³Ø§Ø± */
const adminItems = buildAdminNavDedupedByPath();

/** Ø¹Ù†Ø§ØµØ± Ù„Ù„Ù…Ø¯ÙŠØ±ÙŠÙ† ÙÙ‚Ø· (is_manager) â€” ØªØ¸Ù‡Ø± ÙÙŠ ÙƒÙ„ Ø§Ù„Ø£Ø¯ÙˆØ§Ø± */
/** @type {any[]} */
const MANAGER_ONLY_ITEMS = [
  { to: '/manager/employees', label: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ…', tooltip: 'Ø§Ù„ØªÙ‚ÙŠÙŠÙ… ÙˆØ§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø§Øª', icon: ICONS.star, showIf: 'isManager' },
];

/**
 * Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ù‚ÙˆØ§Ø¦Ù… Ø­Ø³Ø¨ Ø±Ù‚Ù… Ø§Ù„Ø¯ÙˆØ±
 * Ø§Ù„Ù…ÙØªØ§Ø­ = userRole (Ø±Ù‚Ù… 1-13)
 * @type {Record<number, any[]>}
 */
export const SIDEBAR_NAV_MAP = {
  1: adminItems,        // admin
  2: pmItems,           // project_management
  3: editorItems,       // editor
  4: developerItems,    // developer
  5: marketingItems,    // marketing
  6: salesItems,        // sales
  7: salesItems,        // sales_leader (Ù†ÙØ³ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ù…Ø¨ÙŠØ¹Ø§Øª)
  8: hrItems,           // hr
  9: creditItems,       // credit
  10: accountingItems,  // accounting
  11: inventoryItems,   // inventory
  12: marketingItems,   // default (ÙŠØ¹Ø±Ø¶ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„ØªØ³ÙˆÙŠÙ‚)
  13: accountingItems,  // accountant (Ù†ÙØ³ ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø©)
};

/**
 * Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ØªÙ†Ù‚Ù„ Ø­Ø³Ø¨ Ø§Ù„Ø¯ÙˆØ±
 * @param {number} role - Ø±Ù‚Ù… Ø§Ù„Ø¯ÙˆØ± (1-13)
 * @returns {any[]} Ù‚Ø§Ø¦Ù…Ø© Ø¹Ù†Ø§ØµØ± Ø§Ù„ØªÙ†Ù‚Ù„
 */
export function getNavItemsForRole(role) {
  const roleItems = SIDEBAR_NAV_MAP[role] || marketingItems;
  // Ø§Ù„Ø¥Ø¯Ù…Ù† (1): Ø¨Ø¯ÙˆÙ† Ø±Ø§Ø¨Ø· Â«Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Â» /manager/employees
  if (role === 1) {
    return roleItems;
  }
  return [...MANAGER_ONLY_ITEMS, ...roleItems];
}

