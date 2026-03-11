/**
 * Mock data for Editor (Montage) department - no API until provided.
 * Persists montage links and status in sessionStorage so they survive refresh.
 */

import { ref, computed } from 'vue';

const STORAGE_KEY = 'rakez_editor_mock';

// In-memory + sessionStorage for projects with montage link (after montage)
const montageProjectsRaw = ref([]);

// Load from sessionStorage on init
try {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) montageProjectsRaw.value = parsed;
  }
} catch (_) {}

function persistMontageProjects() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(montageProjectsRaw.value));
  } catch (_) {}
}

// Mock: dashboard buckets (Available, Ready, Not Ready)
const MOCK_DASHBOARD = {
  available: [
    { id: 1, name: 'برج النخيل', developer: 'شركة النخيل', unitsCount: 24 },
    { id: 2, name: 'مجمع الياسمين', developer: 'تطوير الياسمين', unitsCount: 12 },
    { id: 3, name: 'فلل الراحة', developer: 'راحة العقارية', unitsCount: 8 },
  ],
  ready: [
    { id: 4, name: 'أبراج الرياض', developer: 'رياض للتطوير', unitsCount: 50 },
    { id: 5, name: 'واحة الخليج', developer: 'واحة الاستثمار', unitsCount: 30 },
  ],
  notReady: [
    { id: 6, name: 'مشروع المستقبل', developer: 'مستقبل العقار', unitsCount: 0 },
    { id: 7, name: 'الواحة الجديدة', developer: 'الواحة للمطورين', unitsCount: 0 },
  ],
};

// Mock: projects not yet montaged (for Not Montaged view)
const MOCK_NOT_MONTAGED = [
  {
    id: 101,
    name: 'برج النخيل',
    developer: 'شركة النخيل',
    publisherNumber: '12345',
    photographyLink: 'https://example.com/photo1',
    description: 'مشروع سكني فاخر في قلب الرياض',
    availableUnits: 24,
  },
  {
    id: 102,
    name: 'مجمع الياسمين',
    developer: 'تطوير الياسمين',
    publisherNumber: '',
    photographyLink: 'https://example.com/photo2',
    description: 'وحدات عائلية مع مسابح',
    availableUnits: 12,
  },
  {
    id: 103,
    name: 'فلل الراحة',
    developer: 'راحة العقارية',
    publisherNumber: '67890',
    photographyLink: '',
    description: 'فلل فاخرة مع حدائق',
    availableUnits: 8,
  },
];

// Mock: teams (read-only)
const MOCK_TEAMS = [
  {
    id: 1,
    name: 'فريق المونتاج أ',
    lead: 'أحمد المونتاج',
    members: [
      { id: 1, name: 'أحمد المونتاج', role: 'قائد الفريق', email: 'ahmed@example.com' },
      { id: 2, name: 'فاطمة المصورة', role: 'محرر', email: 'fatima@example.com' },
      { id: 3, name: 'خالد التحرير', role: 'محرر', email: 'khalid@example.com' },
    ],
  },
  {
    id: 2,
    name: 'فريق المونتاج ب',
    lead: 'سارة المدير',
    members: [
      { id: 4, name: 'سارة المدير', role: 'قائد الفريق', email: 'sara@example.com' },
      { id: 5, name: 'محمد المحرر', role: 'محرر', email: 'mohammed@example.com' },
    ],
  },
];

// Mock: employees for ratings (manager only)
const MOCK_EMPLOYEES = [
  { id: 1, name: 'أحمد المونتاج', team: 'فريق المونتاج أ' },
  { id: 2, name: 'فاطمة المصورة', team: 'فريق المونتاج أ' },
  { id: 3, name: 'خالد التحرير', team: 'فريق المونتاج أ' },
  { id: 4, name: 'سارة المدير', team: 'فريق المونتاج ب' },
  { id: 5, name: 'محمد المحرر', team: 'فريق المونتاج ب' },
];

const employeeRatingsRaw = ref({}); // { [employeeId]: number 1-5 }
try {
  const savedRatings = sessionStorage.getItem(STORAGE_KEY + '_ratings');
  if (savedRatings) employeeRatingsRaw.value = JSON.parse(savedRatings);
} catch (_) {}

function persistRatings() {
  try {
    sessionStorage.setItem(STORAGE_KEY + '_ratings', JSON.stringify(employeeRatingsRaw.value));
  } catch (_) {}
}

export function useEditorMockData() {
  const dashboardAvailable = ref(MOCK_DASHBOARD.available);
  const dashboardReady = ref(MOCK_DASHBOARD.ready);
  const dashboardNotReady = ref(MOCK_DASHBOARD.notReady);

  const notMontagedProjects = computed(() => {
    const submittedIds = new Set(montageProjectsRaw.value.map(p => p.projectId));
    return MOCK_NOT_MONTAGED.filter(p => !submittedIds.has(p.id)).map(p => ({ ...p }));
  });

  const montageProjects = computed(() => [...montageProjectsRaw.value]);

  const teams = ref(MOCK_TEAMS.map(t => ({ ...t })));
  const employees = ref(MOCK_EMPLOYEES.map(e => ({ ...e })));

  function addMontageLink(projectId, projectName, montageLink) {
    const existing = montageProjectsRaw.value.find(p => p.projectId === projectId);
    if (existing) {
      existing.montageLink = montageLink;
      existing.status = 'pending';
      existing.submittedAt = new Date().toISOString();
    } else {
      montageProjectsRaw.value.push({
        projectId,
        projectName,
        montageLink,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
    }
    persistMontageProjects();
  }

  function setMontageStatus(projectId, status) {
    const p = montageProjectsRaw.value.find(x => x.projectId === projectId);
    if (p) {
      p.status = status;
      persistMontageProjects();
    }
  }

  function getNotMontagedProject(id) {
    return notMontagedProjects.value.find(p => p.id === id) || MOCK_NOT_MONTAGED.find(p => p.id === id);
  }

  function setEmployeeRating(employeeId, rating) {
    employeeRatingsRaw.value[String(employeeId)] = rating;
    persistRatings();
  }

  function getEmployeeRating(employeeId) {
    return employeeRatingsRaw.value[String(employeeId)] ?? null;
  }

  return {
    dashboardAvailable,
    dashboardReady,
    dashboardNotReady,
    notMontagedProjects,
    montageProjects,
    teams,
    employees,
    addMontageLink,
    setMontageStatus,
    getNotMontagedProject,
    setEmployeeRating,
    getEmployeeRating,
  };
}
