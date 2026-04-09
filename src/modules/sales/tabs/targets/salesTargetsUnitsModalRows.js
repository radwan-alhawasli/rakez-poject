/** @param {Record<string, unknown>} t @param {Record<string, unknown>|null} u */
export function pickUnitLabel(t, u) {
  const raw =
    (u && (u.unit_number ?? u.unit_no ?? u.number)) ?? (t && (t.unit_number ?? t.unit_no ?? t.number));
  const s = raw != null && raw !== '' ? String(raw).trim() : '';
  return s || '—';
}

/** @param {Record<string, unknown>} t @param {Record<string, unknown>|null} u */
export function pickUnitCardFields(t, u) {
  const id =
    (u && (u.id ?? u.unit_id ?? u.contract_unit_id)) ??
    t.contract_unit_id ??
    t.unit_id ??
    t.target_id ??
    t.id;
  const rawStatus = (u && (u.status ?? u.unit_status)) ?? t.unit_status ?? t.unit?.status ?? null;
  let status = rawStatus;
  if (status != null && status !== '') {
    const s = String(status).toLowerCase().trim();
    if (['متاح', 'متاحة'].includes(String(rawStatus).trim())) status = 'available';
    else if (['محجوز', 'محجوزة'].includes(String(rawStatus).trim())) status = 'reserved';
    else if (['مباع', 'مباعة'].includes(String(rawStatus).trim())) status = 'sold';
    else if (s === 'available' || s === 'reserved' || s === 'sold' || s === 'pending') status = s;
    else status = rawStatus;
  } else {
    status = null;
  }
  const price = (u && (u.price ?? u.unit_price ?? u.total_price)) ?? t.unit_price ?? t.price ?? null;
  const area = (u && (u.area ?? u.total_area)) ?? t.area ?? t.unit?.area ?? null;
  const rooms = (u && (u.bedrooms ?? u.rooms)) ?? t.bedrooms ?? t.rooms ?? null;
  const floor = (u && u.floor != null ? u.floor : null) ?? (t.floor != null ? t.floor : null);
  return {
    id,
    status,
    price: price != null && price !== '' ? price : null,
    area: area != null && area !== '' ? area : null,
    rooms: rooms != null && rooms !== '' ? rooms : null,
    floor: floor != null && floor !== '' ? floor : null,
  };
}

/**
 * @param {unknown[]} list
 * @param {(x: unknown) => unknown} normalizeSalesTargetItem
 */
export function buildUnitsModalRows(list, normalizeSalesTargetItem) {
  return list.map(normalizeSalesTargetItem).flatMap((t) => {
    const units = Array.isArray(t.units) ? t.units : [];
    if (units.length === 0) {
      const card = pickUnitCardFields(t, null);
      return [
        {
          unit_id: card.id,
          unit_number: pickUnitLabel(t, null),
          marketer_id: t.marketer_id,
          marketer_name: t.marketer_name ?? '—',
          ...card,
        },
      ];
    }
    return units.map((u) => {
      const card = pickUnitCardFields(t, u);
      return {
        unit_id: card.id ?? u.unit_id ?? u.id ?? u.contract_unit_id,
        unit_number: pickUnitLabel(t, u),
        marketer_id: t.marketer_id,
        marketer_name: t.marketer_name ?? '—',
        ...card,
      };
    });
  });
}
