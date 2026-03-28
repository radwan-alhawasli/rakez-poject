/**
 * Normalizes raw status from API to a consistent UI value.
 */
export function normalizeContractStatus(contract) {
  const raw = (
    contract?.status ??
    contract?.approval_status ??
    contract?.contract_status ??
    contract?.admin_status ??
    contract?.admin_approval_status ??
    contract?.data?.status ??
    contract?.contract?.status ??
    ''
  ).toString().toLowerCase().trim();

  const approvedValues = ['approved', 'معتمد', '1', 'completed', 'مكتمل', 'complete', 'done', 'finished', 'closed', 'مغلق', 'active', 'نشط'];
  const refusedValues = ['rejected', 'refused', 'مرفوض', '0', 'cancelled', 'ملغى', 'canceled'];

  if (approvedValues.includes(raw)) return 'Approved';
  if (refusedValues.includes(raw)) return 'Refused';

  const progress = (contract?.project_progress ?? contract?.progress ?? '').toString().toLowerCase().trim();
  if (progress && ['completed', 'مكتمل', 'complete', 'done', 'finished', 'closed'].includes(progress)) {
    return 'Approved';
  }
  return 'Pending';
}

/**
 * Maps a raw API contract object to the view model used in the UI.
 */
export function mapContract(contract) {
  if (!contract || typeof contract !== 'object') return contract;
  
  const status = normalizeContractStatus(contract);
  const created = contract.created_at ?? contract.createdAt ?? contract.date;
  const createdDate = created 
    ? new Date(created).toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '—';

  const commRaw = contract.commission_percent ?? contract.commission_percentage ?? contract.info?.commission_percent;
  let commissionLabel = '—';
  if (commRaw !== undefined && commRaw !== null && String(commRaw).trim() !== '') {
    const n = parseFloat(String(commRaw).replace(/%/g, '').replace(/,/g, '').trim());
    commissionLabel = Number.isFinite(n) ? `${n}%` : `${String(commRaw).trim()}%`;
  }

  return {
    ...contract,
    id: contract.id ?? contract.contract_id,
    number: contract.number ?? contract.project_name ?? contract.id ?? contract.contract_id ?? '—',
    developer: contract.developer_name ?? contract.developer ?? contract.second_party_name ?? '—',
    commissionLabel,
    createdDate,
    status,
    type: contract.contract_type ?? contract.type ?? 'Full Contract',
    marketer: contract.marketer_name ?? contract.marketer ?? contract.user_name ?? '—',
    pending: status === 'Pending',
    rejected: status === 'Refused',
    approved: status === 'Approved',
  };
}
