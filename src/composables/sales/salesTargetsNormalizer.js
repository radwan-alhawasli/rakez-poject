/**
 * @param {any} v
 * @param {number} fallback
 */
export function num(v, fallback = 0) {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** @param {any} raw */
export function normalizeTargetStatus(raw) {
  const rawStatus = String(raw?.status ?? '').trim();
  if (['منجز', 'مكتمل'].includes(rawStatus)) return 'completed';
  const s = rawStatus.toLowerCase().replace(/-/g, '_');
  const ar = String(raw?.status_label_ar ?? '').trim();
  if (['completed', 'achieved', 'done', 'complete', 'closed'].includes(s)) return 'completed';
  if (['in_progress', 'inprogress', 'progress', 'active'].includes(s)) return 'in_progress';
  if (['new', 'pending', 'draft', 'open'].includes(s)) return 'new';
  if (ar === 'منجز' || ar === 'مكتمل') return 'completed';
  if (ar === 'جديد') return 'new';
  if (ar.includes('قيد')) return 'in_progress';
  if (['new', 'in_progress', 'completed'].includes(s)) return s;
  return 'new';
}

/** @param {any} uiStatus */
export function mapStatusForApiPatch(uiStatus) {
  const s = String(uiStatus ?? '').toLowerCase();
  if (s === 'completed' || s === 'new' || s === 'in_progress') return s;
  return s;
}

/** @param {any} raw */
export function extractSalesTargetRowId(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.sales_target === 'number' && Number.isFinite(raw.sales_target) && raw.sales_target > 0) {
    return raw.sales_target;
  }
  if (typeof raw.sales_target === 'string' && /^\d+$/.test(String(raw.sales_target).trim())) {
    return String(raw.sales_target).trim();
  }
  /** @param {any} o */
  const pick = (o) => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    return (
      o.id ??
      o.target_id ??
      o.sales_target_id ??
      o.salesTargetId ??
      o.goal_id ??
      null
    );
  };
  const pickFromUnits = () => {
    if (!Array.isArray(raw.units) || raw.units.length === 0) return null;
    for (const u of raw.units) {
      if (!u || typeof u !== 'object') continue;
      const nestedSt = u.sales_target;
      const fromNested =
        nestedSt && typeof nestedSt === 'object' && !Array.isArray(nestedSt) ? pick(nestedSt) : null;
      const x =
        u.sales_target_id ??
        u.target_id ??
        fromNested ??
        u.id;
      if (x != null && x !== '') return x;
    }
    return null;
  };
  const relSales = raw.relationships?.sales_target?.data ?? raw.relationships?.target?.data;
  const relPick =
    relSales && typeof relSales === 'object' && !Array.isArray(relSales)
      ? relSales.id ?? relSales.target_id ?? relSales.sales_target_id
      : null;
  const nestedBuckets = [
    raw.sales_target,
    raw.target,
    raw.salesTarget,
    raw.attributes,
    raw.resource,
    raw.model,
    raw.meta,
    raw.pivot,
    typeof raw.data === 'object' && raw.data != null && !Array.isArray(raw.data) ? raw.data : null,
  ];
  const fromNested = nestedBuckets.map(pick).find((v) => v != null && v !== '');
  const fromUnits = pickFromUnits();
  const v =
    pick(raw) ??
    raw.id ??
    raw.target_id ??
    raw.sales_target_id ??
    raw.salesTargetId ??
    raw.sales_target_row_id ??
    raw.sales_target_pk ??
    fromNested ??
    relPick ??
    fromUnits ??
    raw.uuid;
  if (v == null || v === '') return null;
  return v;
}

/** @param {any} raw */
export function normalizeSalesTargetItem(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const project = raw.project || raw.contract || {};
  const projectName =
    raw.project_name ??
    raw.project_title ??
    project.project_name ??
    project.name ??
    project.title ??
    project.contract_name ??
    '';

  const contractId =
    raw.contract_id ??
    project.id ??
    project.contract_id ??
    raw.project_id ??
    null;

  const targetId = extractSalesTargetRowId(raw);
  const mid = 
    raw.marketer_id ?? 
    raw.user_id ?? 
    raw.assignee_id ?? 
    raw.marketer?.id ?? 
    raw.marketer?.user_id ?? 
    raw.assignee?.id;
    
  const marketerId =
    mid != null && mid !== '' && Number.isFinite(Number(mid)) ? Number(mid) : mid;

  const targetValue = num(
    raw.target_value ??
      raw.goal_amount ??
      raw.goal ??
      raw.target_amount ??
      raw.amount ??
      project.target_value,
    0,
  );

  const achievedValue = num(
    raw.achieved_value ??
      raw.achieved_amount ??
      raw.current_amount ??
      raw.progress_value ??
      raw.realized_amount ??
      raw.sales_achieved ??
      raw.total_achieved,
    0,
  );

  const endDate =
    raw.end_date ??
    raw.deadline ??
    raw.period_end ??
    raw.target_end_date ??
    raw.ends_at ??
    project.end_date ??
    null;

  const resolvedEnd = endDate ?? raw.end_date ?? raw.deadline ?? null;
  const normalizedStatus = normalizeTargetStatus(raw);

  return {
    ...raw,
    project_name: projectName || raw.project_name || '',
    contract_id: contractId ?? raw.contract_id,
    id: targetId ?? raw.id,
    target_id: targetId ?? raw.target_id,
    marketer_id: marketerId ?? raw.marketer_id,
    target_value: targetValue,
    achieved_value: achievedValue,
    end_date: resolvedEnd,
    deadline: raw.deadline ?? resolvedEnd,
    status: normalizedStatus,
  };
}

/** @param {any} target */
export function getSalesTargetPatchId(target) {
  if (!target || typeof target !== 'object') return null;
  const direct =
    target.id ??
    target.target_id ??
    target.sales_target_id ??
    target.salesTargetId ??
    target.sales_target_row_id ??
    target.sales_target_pk ??
    target.uuid;
  if (direct != null && direct !== '') return direct;
  return extractSalesTargetRowId(target);
}
