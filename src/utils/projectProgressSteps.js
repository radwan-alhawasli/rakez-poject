/**
 * @typedef {{ step_number: number, completed?: boolean, label_ar?: string }} NormalizedProgressStep
 * @typedef {{ steps?: Array<{ step_number?: number, completed?: boolean, label_ar?: string }>, completed_count?: number }} ProjectProgressShape
 */

/** Keys saved via second-party-data (same order as UI tracker). */
export const TRACKER_SECOND_PARTY_KEYS = [
  'real_estate_papers_url',
  'plans_equipment_docs_url',
  'project_logo_url',
  'prices_units_url',
  'marketing_license_url',
  'advertiser_section_url',
];

/**
 * Response body from GET /second-party-data/show/:id may be `{ data: row }`, `{ data: { data: row } }`, or the row itself.
 * @param {unknown} snap
 * @returns {Record<string, unknown>|null}
 */
export function extractSecondPartyShowRow(snap) {
  if (snap == null || typeof snap !== 'object') return null;

  const hasTrackerKeys = (/** @type {unknown} */ obj) =>
    obj != null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    TRACKER_SECOND_PARTY_KEYS.some(k => Object.prototype.hasOwnProperty.call(obj, k));

  const asRow = (/** @type {unknown} */ o) =>
    hasTrackerKeys(o) ? /** @type {Record<string, unknown>} */ (o) : null;

  const d1 =
    'data' in snap && snap.data != null && typeof snap.data === 'object' && !Array.isArray(snap.data)
      ? snap.data
      : null;
  const d2 =
    d1 && 'data' in d1 && d1.data != null && typeof d1.data === 'object' && !Array.isArray(d1.data)
      ? d1.data
      : null;

  return asRow(d2) || asRow(d1) || asRow(snap);
}

/** True if a row already exists → use PUT /second-party-data/update/:id, else POST .../store/:id */
export function hasSecondPartyTrackerRecord(
  /** @type {Record<string, unknown>|null|undefined} */ row
) {
  if (!row || typeof row !== 'object') return false;
  if (row.id != null && String(row.id).trim() !== '') return true;
  if (row.second_party_data_id != null && String(row.second_party_data_id).trim() !== '') return true;
  return TRACKER_SECOND_PARTY_KEYS.some(k => {
    const v = row[k];
    return v != null && String(v).trim() !== '';
  });
}

/**
 * Body for POST store / PUT update (matches API: six fields only).
 * @param {Array<{ apiKey?: string, value?: unknown }>} stages
 */
export function buildSecondPartyTrackerPayload(stages) {
  const out = /** @type {Record<string, string | null>} */ ({});
  TRACKER_SECOND_PARTY_KEYS.forEach(key => {
    const stage = stages.find(s => s.apiKey === key);
    const raw = stage?.value;
    out[key] = raw != null && String(raw).trim() !== '' ? String(raw).trim() : null;
  });
  return out;
}

/**
 * Laravel / JSON sometimes sends completed as 1 or "1" instead of true.
 * @param {{ completed?: unknown }|null|undefined} step
 */
export function isStepMarkedComplete(step) {
  if (!step || step.completed == null) return false;
  const c = step.completed;
  if (c === true || c === 1) return true;
  if (typeof c === 'string') {
    const t = c.trim().toLowerCase();
    return t === '1' || t === 'true' || t === 'yes';
  }
  return false;
}

/**
 * Normalize `project_progress.steps` from the API to six UI stages aligned with
 * second-party fields: papers → plans → logo → prices → marketing license → advertiser.
 *
 * Legacy 7-step API: 1 papers, 2 plans, 3 logo, 4 completion cert, 5 prices,
 * 6 warranties, 7 advertiser → UI step 5 is completed only when both old 4 and 6 are done.
 *
 * @param {Array<{ step_number?: number, completed?: boolean, label_ar?: string }>|undefined|null} steps
 * @returns {NormalizedProgressStep[]}
 */
export function normalizeProjectProgressSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) return [];

  /** @param {{ step_number?: number, completed?: boolean, label_ar?: string }|null|undefined} s @param {number} fallback */
  const coerce = (s, fallback) => {
    if (!s || typeof s !== 'object') return null;
    const n = Number(s.step_number);
    const step_number = Number.isFinite(n) && n > 0 ? n : fallback;
    return /** @type {NormalizedProgressStep} */ ({
      step_number,
      completed: s.completed,
      label_ar: s.label_ar,
    });
  };

  const sorted = [...steps].sort((a, b) => Number(a.step_number) - Number(b.step_number));
  if (sorted.length === 7) {
    const by = Object.fromEntries(sorted.map(s => [Number(s.step_number), s]));
    /** @type {(NormalizedProgressStep | null)[]} */
    const merged = [
      coerce(by[1], 1),
      coerce(by[2], 2),
      coerce(by[3], 3),
      by[5] ? coerce({ ...by[5], step_number: 4 }, 4) : null,
      /** @type {NormalizedProgressStep} */ ({
        step_number: 5,
        label_ar: 'شهادة اتمام و ضمانات',
        // خطوتان قديمتان (4 و6) أصبحتا حقلاً واحداً — يكفي إكمال إحداهما
        completed: isStepMarkedComplete(by[4]) || isStepMarkedComplete(by[6]),
      }),
      by[7] ? coerce({ ...by[7], step_number: 6 }, 6) : null,
    ];
    return merged.filter(/** @returns {x is NormalizedProgressStep} */ (x) => x != null);
  }
  if (sorted.length > 6) {
    return sorted
      .slice(0, 6)
      .map((s, i) => coerce(s, i + 1))
      .filter(/** @returns {x is NormalizedProgressStep} */ x => x != null);
  }
  return sorted
    .map((s, i) => coerce(s, i + 1))
    .filter(/** @returns {x is NormalizedProgressStep} */ x => x != null);
}

/**
 * @param {ProjectProgressShape|null|undefined} progress
 */
export function isProjectProgressFullyCompleted(progress) {
  const norm = normalizeProjectProgressSteps(progress?.steps);
  return norm.length > 0 && norm.every(s => isStepMarkedComplete(s));
}

/** مراحل «تقدم الإعداد» في البطاقة — دائماً 6 (كل مرحلة ≈ 16.67%). */
export const TRACKER_STAGE_COUNT = 6;

/**
 * قيمة مرحلة واحدة مملوءة (يستبعد 0 و false والنص الفارغ؛ يقبل أرقام المعلن غير الصفرية).
 * @param {unknown} value
 */
export function isSecondPartyFieldFilled(value) {
  if (value == null) return false;
  if (typeof value === 'boolean') return value === true;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return false;
    return value !== 0;
  }
  if (typeof value === 'string') return value.trim() !== '';
  return false;
}

/**
 * مرحلة شهادة الإتمام: قد يُرسل الخادم marketing_license_url أو completion_certificate_url.
 * @param {Record<string, unknown>|null|undefined} data
 */
function isMarketingLicenseStageFilled(data) {
  if (!data || typeof data !== 'object') return false;
  return (
    isSecondPartyFieldFilled(data.marketing_license_url) ||
    isSecondPartyFieldFilled(data.completion_certificate_url)
  );
}

/**
 * عدد الحقول المملوءة من الستة على `second_party_data` (أو كائن مماثل).
 * @param {Record<string, unknown>|null|undefined} row
 */
export function countFilledSecondPartyTrackerFields(row) {
  if (!row || typeof row !== 'object') return 0;
  let n = 0;
  for (const k of TRACKER_SECOND_PARTY_KEYS) {
    if (k === 'marketing_license_url') {
      if (isMarketingLicenseStageFilled(row)) n += 1;
    } else if (isSecondPartyFieldFilled(row[k])) {
      n += 1;
    }
  }
  return n;
}

/**
 * نسبة «تقدم الإعداد» 0–100 للبطاقات: المقام ثابت = 6.
 * يأخذ الأعلى بين: خطوات `project_progress` المطبّعة، وحقول الطرف الثاني، ثم `completed_count` احتياطياً.
 * @param {Record<string, unknown>|null|undefined} contractLike
 */
export function computeSetupProgressPercentSixStages(contractLike) {
  if (!contractLike || typeof contractLike !== 'object') return 0;

  const ppRaw = contractLike['project_progress'];
  const pp =
    ppRaw != null && typeof ppRaw === 'object' && !Array.isArray(ppRaw)
      ? /** @type {ProjectProgressShape & Record<string, unknown>} */ (ppRaw)
      : null;
  const stepsRaw = pp?.steps;
  const norm = normalizeProjectProgressSteps(Array.isArray(stepsRaw) ? stepsRaw : undefined);
  let completed = norm.length > 0 ? norm.filter(s => isStepMarkedComplete(s)).length : 0;

  const sp =
    contractLike.second_party_data != null && typeof contractLike.second_party_data === 'object'
      ? /** @type {Record<string, unknown>} */ (contractLike.second_party_data)
      : contractLike.second_party != null && typeof contractLike.second_party === 'object'
        ? /** @type {Record<string, unknown>} */ (contractLike.second_party)
        : null;
  if (sp) completed = Math.max(completed, countFilledSecondPartyTrackerFields(sp));

  if (
    completed === 0 &&
    pp &&
    pp.completed_count != null &&
    Number.isFinite(Number(pp.completed_count))
  ) {
    completed = Math.max(
      completed,
      Math.min(TRACKER_STAGE_COUNT, Number(pp.completed_count)),
    );
  }

  completed = Math.min(TRACKER_STAGE_COUNT, completed);
  return Math.round((completed / TRACKER_STAGE_COUNT) * 100);
}

/**
 * الست مراحل المتتبع (GET /second-party-data/show/:id) مكتملة.
 * @param {Record<string, unknown>|null|undefined} data - صف الطرف الثاني بعد extractSecondPartyShowRow
 */
export function isSecondPartyTrackerComplete(data) {
  if (!data || typeof data !== 'object') return false;
  for (const k of TRACKER_SECOND_PARTY_KEYS) {
    if (k === 'marketing_license_url') {
      if (!isMarketingLicenseStageFilled(data)) return false;
    } else if (!isSecondPartyFieldFilled(data[k])) {
      return false;
    }
  }
  return true;
}

/**
 * استجابة GET /second-party-data/show/:id — هل المتتبع مكتمل (الست حقول).
 * @param {unknown} apiResponse - جسم الاستجابة الخام من الـ API
 */
export function isSecondPartyTrackerShowResponseComplete(apiResponse) {
  const row = extractSecondPartyShowRow(apiResponse);
  if (!row) return false;
  return isSecondPartyTrackerComplete(row);
}
