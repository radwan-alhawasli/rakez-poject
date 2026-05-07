/**
 * Build POST /contracts/store payload for exclusive project request (matches contractService.createContract).
 * @param {{
 *   form: Record<string, unknown> & {
 *     developer_id?: string|number,
 *     developer_name?: string,
 *     developer_cr_number?: string,
 *     project_name?: string,
 *     project_type?: string,
 *     side?: string,
 *     city?: string,
 *     city_id?: string|number,
 *     neighborhood?: string,
 *     district_id?: string|number,
 *     developer_requiment?: string,
 *     project_location_url?: string,
 *     note?: string,
 *     commission_from?: string,
 *     unit_rows: Array<{ unit_type?: string, units_count?: number, avg_unit_price?: number }>,
 *   },
 *   developers: Array<{ id?: string|number, name?: string, commercialRecord?: string }>,
 *   commissionPercentInput: string,
 *   unitTypeOptions: Array<{ value?: string, label?: string }>,
 * }} args
 * @returns {Record<string, unknown>}
 */
export function buildExclusiveContractPayload({
  form,
  developers,
  commissionPercentInput,
  unitTypeOptions,
}) {
  const developerName =
    form.developer_name?.trim() ||
    (form.developer_id &&
      developers.find(d => String(d.id) === String(form.developer_id))?.name) ||
    '';
  const developerNumber =
    form.developer_cr_number?.trim() ||
    (form.developer_id &&
      developers.find(d => String(d.id) === String(form.developer_id))?.commercialRecord) ||
    '';

  const units = form.unit_rows
    .filter(r => r.unit_type || (Number(r.units_count) || 0) > 0)
    .map(r => {
      const label = unitTypeOptions.find(opt => opt.value === r.unit_type)?.label || r.unit_type || '';
      return {
        type: label,
        count: Number(r.units_count) || 0,
        price: Number(r.avg_unit_price) || 0,
      };
    });

  const pctNum = parseFloat(String(commissionPercentInput || '0').replace(',', '.'));
  const pctValid = Number.isFinite(pctNum) ? pctNum : 0;
  const isOffPlan = String(form.project_type || 'ready') === 'off_plan';

  return {
    side: form.side,
    project_name: form.project_name?.trim() || '',
    is_off_plan: isOffPlan,
    developer_name: developerName,
    developer_number: developerNumber,
    city: form.city?.trim() || '',
    city_id: String(form.city_id),
    district: form.neighborhood?.trim() || '',
    district_id: String(form.district_id),
    developer_requiment: form.developer_requiment?.trim() || undefined,
    project_image_url: form.project_location_url?.trim() || undefined,
    note: form.note?.trim() || undefined,
    units,
    commission_percent: String(pctValid),
    commission_percentage: pctValid,
    commission_from: form.commission_from || 'owner',
  };
}
