/**
 * @param {any} value
 * @returns {boolean}
 */
function isTruthyFlag(value) {
  if (value === true || value === 1 || value === '1') return true;
  const text = String(value ?? '').trim().toLowerCase();
  return text === 'true' || text === 'yes';
}

/**
 * @param {any} raw
 * @returns {string}
 */
function normalizeText(raw) {
  const text = String(raw ?? '').trim();
  return text;
}

/**
 * @param {any} project
 * @returns {string}
 */
export function resolveProjectDeveloperName(project) {
  if (!project || typeof project !== 'object') return '';
  const developer = project.developer && typeof project.developer === 'object' ? project.developer : {};
  const developerInfo =
    project.developer_info && typeof project.developer_info === 'object' ? project.developer_info : {};
  const secondParty =
    project.second_party && typeof project.second_party === 'object' ? project.second_party : {};
  const secondPartyData =
    project.second_party_data && typeof project.second_party_data === 'object'
      ? project.second_party_data
      : {};

  const candidates = [
    project.developer_name,
    project.second_party_name,
    project.developer,
    developer.name,
    developer.full_name,
    developer.user?.name,
    developerInfo.name,
    secondParty.name,
    secondParty.second_party_name,
    secondPartyData.second_party_name,
    secondPartyData.developer_name,
    secondPartyData.name,
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const value = normalizeText(candidates[i]);
    if (value) return value;
  }
  return '';
}

/**
 * @param {any} project
 * @returns {'جاهز' | 'على الخارطة' | 'غير محدد'}
 */
export function resolveProjectTypeLabel(project) {
  if (!project || typeof project !== 'object') return 'غير محدد';

  const offPlanSources = [
    project.is_off_plan,
    project.project?.is_off_plan,
    project.info?.is_off_plan,
    project.second_party_data?.is_off_plan,
  ];

  if (offPlanSources.some(isTruthyFlag)) return 'على الخارطة';
  if (offPlanSources.some(v => v === false || v === 0 || v === '0')) return 'جاهز';

  const candidates = [
    project.project_type,
    project.property_type,
    project.type,
    project.unit_type,
    project.info?.project_type,
    project.second_party_data?.project_type,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .map(value => value.toLowerCase());

  if (
    candidates.some(value =>
      value.includes('خارطة') ||
      value.includes('الخارطة') ||
      value.includes('on_map') ||
      value.includes('on map') ||
      value.includes('off-plan') ||
      value.includes('off_plan') ||
      value.includes('under_construction')
    )
  ) {
    return 'على الخارطة';
  }

  if (
    candidates.some(value =>
      value.includes('جاهز') ||
      value.includes('ready') ||
      value.includes('completed')
    )
  ) {
    return 'جاهز';
  }

  const isReady =
    isTruthyFlag(project.is_ready) ||
    isTruthyFlag(project.ready_for_marketing) ||
    ['ready', 'ready_for_marketing', 'completed'].includes(
      String(project.status ?? project.contract_status ?? '')
        .trim()
        .toLowerCase()
    );

  return isReady ? 'جاهز' : 'على الخارطة';
}
