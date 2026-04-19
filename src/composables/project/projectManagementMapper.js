
import {
  computeSetupProgressPercentSixStages,
} from '@/utils/projectProgressSteps';
import { contractTimelineDisplay, isCompleteSecondTruthy } from '@/composables/project/useProjectManagementHelpers';

/**
 * Creates the initial mapped project structure from raw API list item.
 */
export function mapProjectItem(p) {
  const units = p.units || [];
  const totalUnits = units.length;
  const soldCount = units.filter(
    u =>
      String(u.status || '').toLowerCase() === 'sold' ||
      String(u.status || '').toLowerCase().includes('sold')
  ).length;

  const timeline = contractTimelineDisplay(p);
  const { daysLeftVal, contractRemainingLabel, contractColor, contractDurationPercent } = timeline;

  const isExclusive = p.type === 'Exclusive' || p.is_exclusive;
  const unitType = p.unit_type || (units[0] && units[0].unit_type) || 'Apartment';
  const descLine = isExclusive
    ? `طلب مشروع حصري. ${p.total_units || totalUnits || 100} وحدة من نوع ${unitType}.`
    : (p.description || p.details || '').split('\n')[0] || (totalUnits ? `${totalUnits} وحدة` : '');

  const setupProgressVal = computeSetupProgressPercentSixStages(p);

  const unitPrices = units.map(u => Number(u.price) || 0).filter(Boolean);
  const priceMin = p.price_min ?? p.min_price ?? (unitPrices.length ? Math.min(...unitPrices) : null);
  const priceMax = p.price_max ?? p.max_price ?? (unitPrices.length ? Math.max(...unitPrices) : null);
  const avgPrice = units.length ? units.reduce((a, b) => a + (Number(b.price) || 0), 0) / units.length : (p.average_unit_price ?? p.avg_unit_price);
  
  let priceRangeText = '—';
  if (priceMin != null && priceMax != null && priceMin !== priceMax) {
    priceRangeText = `${Number(priceMax).toLocaleString('en-US')} - ${Number(priceMin).toLocaleString('en-US')}`;
  } else if (priceMin != null || priceMax != null) {
    const single = priceMax ?? priceMin;
    priceRangeText = `${Number(single).toLocaleString('en-US')} - ${Number(single).toLocaleString('en-US')}`;
  } else if (avgPrice != null && Number(avgPrice) > 0) {
    priceRangeText = `${Number(avgPrice).toLocaleString('en-US')} - ${Number(avgPrice).toLocaleString('en-US')}`;
  }

  const unitAreas = units.map(u => Number(u.area) || Number(u.area_m2) || 0).filter(Boolean);
  const areaMin = p.area_min_m2 ?? p.area_min ?? (unitAreas.length ? Math.min(...unitAreas) : null);
  const areaMax = p.area_max_m2 ?? p.area_max ?? (unitAreas.length ? Math.max(...unitAreas) : null);
  const areaRange = areaMin != null && areaMax != null ? `${areaMin} - ${areaMax} م²` : areaMax != null ? `${areaMax} م²` : areaMin != null ? `${areaMin} م²` : '—';

  const bedroomsMin = p.bedrooms_min ?? (units[0] && units[0].bedrooms);
  const bedroomsMax = p.bedrooms_max ?? (units[0] && units[0].bedrooms);
  const bedroomsRange = bedroomsMin != null && bedroomsMax != null ? `${bedroomsMin} - ${bedroomsMax}` : bedroomsMax != null ? `${bedroomsMax}` : bedroomsMin != null ? `${bedroomsMin}` : '—';

  const isReadyFlag = p.is_ready === true || p.is_ready === 1 || String(p.is_ready || '').toLowerCase() === 'true' ||
                      p.ready_for_marketing === true || p.ready_for_marketing === 1 || String(p.ready_for_marketing || '').toLowerCase() === 'true';
  const completeSecond = isCompleteSecondTruthy(p);
  const statusLower = String(p.status || '').toLowerCase();
  const isCompletedContract = statusLower === 'completed';

  const rakezStatusLabel = p.status === 'Approved' || isReadyFlag || completeSecond || isCompletedContract
    ? 'متاح'
    : p.status === 'Rejected' || p.status === 'Refused'
      ? 'مؤرشف'
      : p.statusLabel || p.status || '—';

  const propertyTypeLabel = (p.unit_type_label_ar && String(p.unit_type_label_ar).trim()) || unitType || (totalUnits ? 'وحدات' : 'مشروع');
  
  const photo = p.photography_department;
  const imageUrl = p.project_image_url ?? (photo && (photo.image_url ?? photo.image)) ?? p.image ?? p.image_url ?? p.main_image ?? p.cover_image ?? p.photo ?? (typeof p.project_image === 'string' ? p.project_image : null);
  const imageStr = typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : '';
  const imagePending = !!photo && (String(photo.status || '').toLowerCase() === 'pending' || String(photo.approval_status || '').toLowerCase() === 'pending');

  return {
    id: p.id,
    contract_id: p.contract_id ?? p.id,
    name: p.project_name ?? p.name ?? `مشروع #${p.id}`,
    imagePending: !!imageStr && imagePending,
    location: `${(p.district || '').trim()}${p.district && p.city ? ', ' : ''}${(p.city || '').trim()}`.replace(/^,\s*|,\s*$/g, '') || '—',
    image: imageStr || null,
    hasImage: !!imageStr,
    statusLabel: p.status === 'Approved' || isReadyFlag || completeSecond || isCompletedContract ? 'Active' : p.status,
    statusClass: p.status === 'Approved' || isReadyFlag || completeSecond || isCompletedContract ? 'active' : 'pending',
    units,
    advertiser_number: p.advertiser_number,
    assignee: p.marketer,
    status: p.status,
    is_complete_second: completeSecond,
    is_ready_for_marketing: completeSecond || p.status === 'Approved' || isReadyFlag,
    description: p.description || p.details || '',
    descriptionLine: descLine,
    setupProgress: setupProgressVal,
    soldUnitsCount: soldCount,
    soldUnitsPercent: totalUnits ? Math.round((soldCount / totalUnits) * 100) : 0,
    avgPrice: units.length ? units.reduce((a, b) => a + (Number(b.price) || 0), 0) / units.length : 0,
    commission_percentage: Number(p.commission_percentage || 0),
    availableUnits: units.filter(u => String(u.status || '').toLowerCase() === 'available' || !u.status).length,
    pendingUnits: units.filter(u => String(u.status || '').toLowerCase().includes('pending') || String(u.status || '').toLowerCase().includes('reserved')).length,
    availableUnitsValue: units.filter(u => String(u.status || '').toLowerCase() === 'available' || !u.status).reduce((acc, u) => acc + (Number(u.price) || 0), 0),
    endDate: p.contract_end_date || p.end_date || p.agreement_end_date || null,
    agreement_duration_days: p.agreement_duration_days ?? null,
    created_at: p.created_at ?? null,
    release_date: p.release_date ?? null,
    info: p.info ?? null,
    second_party_data: p.second_party_data ?? null,
    daysLeft: daysLeftVal,
    contractRemainingLabel,
    contractColor,
    contractDurationPercent,
    timelinePillLabel: daysLeftVal === null ? '—' : daysLeftVal < 0 ? 'انتهت المهلة' : `خلال ${daysLeftVal} أيام`,
    distance: p.distance || '15',
    landmark: p.landmark || 'مطار الملك خالد',
    priceRangeText,
    areaRange,
    bedroomsRange,
    rakezStatusLabel,
    propertyTypeLabel,
  };
}

/**
 * Enriches the mapped project structure with individual detail values if fetched.
 */
export function enrichProjectItem(proj, detail) {
  if (!detail) return proj;

  const mergedCompleteSecond = isCompleteSecondTruthy(detail) || proj.is_complete_second;
  const detailStatus = detail?.status ?? proj.status;
  const pp = detail?.project_progress;
  const detailImage = detail?.project_image_url ?? detail?.image ?? detail?.image_url ?? detail?.main_image ?? '';
  const detailImageStr = typeof detailImage === 'string' && detailImage.trim() ? detailImage.trim() : '';
  const hasImageFromDetail = !!detailImageStr;

  const timelineFromDetail = contractTimelineDisplay({
    ...proj,
    contract_end_date: detail?.contract_end_date ?? proj.endDate,
    end_date: detail?.end_date,
    agreement_end_date: detail?.agreement_end_date,
    release_date: detail?.release_date,
    agreement_duration_days: detail?.agreement_duration_days ?? proj.agreement_duration_days,
    created_at: detail?.created_at ?? proj.created_at,
    contract_start_date: detail?.contract_start_date,
    agreement_start_date: detail?.agreement_start_date,
    info: detail?.info,
    second_party_data: detail?.second_party_data,
  });

  const mergedForSetup = {
    ...proj,
    project_progress: detail?.project_progress ?? proj.project_progress,
    second_party_data: detail?.second_party_data ?? proj.second_party_data,
  };
  const setupProgressVal = computeSetupProgressPercentSixStages(mergedForSetup);

  const completeVisuals = mergedCompleteSecond
    ? {
        rakezStatusLabel: 'متاح',
        statusLabel: 'Active',
        statusClass: 'active',
        status: detailStatus,
        is_complete_second: true,
        is_ready_for_marketing: true,
      }
    : {
        is_complete_second: mergedCompleteSecond,
        is_ready_for_marketing: mergedCompleteSecond || proj.is_ready_for_marketing,
        status: detailStatus,
      };

  const endDate = detail?.contract_end_date || detail?.end_date || detail?.agreement_end_date || proj.endDate;
    
  if (!pp) {
    const base = hasImageFromDetail && !proj.hasImage
      ? { ...proj, image: detailImageStr, hasImage: true }
      : { ...proj };
    
    return {
      ...base,
      ...completeVisuals,
      setupProgress: setupProgressVal,
      ...timelineFromDetail,
      daysLeft: timelineFromDetail.daysLeftVal,
      contractRemainingLabel: timelineFromDetail.contractRemainingLabel,
      contractColor: timelineFromDetail.contractColor,
      contractDurationPercent: timelineFromDetail.contractDurationPercent,
      agreement_duration_days: detail?.agreement_duration_days ?? proj.agreement_duration_days,
      endDate,
      timelinePillLabel: timelineFromDetail.daysLeftVal === null ? '—' : timelineFromDetail.daysLeftVal < 0 ? 'انتهت المهلة' : `خلال ${timelineFromDetail.daysLeftVal} أيام`,
    };
  }

  return {
    ...proj,
    ...completeVisuals,
    setupProgress: setupProgressVal,
    ...timelineFromDetail,
    daysLeft: timelineFromDetail.daysLeftVal,
    contractRemainingLabel: timelineFromDetail.contractRemainingLabel,
    contractColor: timelineFromDetail.contractColor,
    contractDurationPercent: timelineFromDetail.contractDurationPercent,
    agreement_duration_days: detail?.agreement_duration_days ?? proj.agreement_duration_days,
    endDate,
    timelinePillLabel: timelineFromDetail.daysLeftVal === null ? '—' : timelineFromDetail.daysLeftVal < 0 ? 'انتهت المهلة' : `خلال ${timelineFromDetail.daysLeftVal} أيام`,
    ...(hasImageFromDetail && !proj.hasImage ? { image: detailImageStr, hasImage: true } : {}),
  };
}
