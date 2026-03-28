import logger from '@/utils/logger';
import { toast } from '@/composables/useToast';
import salesService from '@/services/salesService';

/**
 * Handles the logic for downloading a reservation voucher PDF.
 * Extracts data from multiple possible service endpoints and fallbacks.
 */
export async function downloadReservationVoucher(reservation) {
  try {
    const id = reservation.reservation_id || reservation.id;
    const { generateReservationVoucherPdf } = await import('@/services/pdfService');
    
    let reservationData;
    let project = {};
    let unit = {};
    let employee = {};

    try {
      const { getReservationVoucherData } = await import('@/services/pdfApi');
      const data = await getReservationVoucherData(id);
      if (data?.reservation != null) {
        reservationData = data.reservation;
        project = data.project ?? {};
        unit = data.unit ?? {};
        employee = data.employee ?? {};
      }
    } catch (_) {
      // Fallback allowed
    }

    if (reservationData == null) {
      let detail = reservation;
      try {
        const full = await salesService.getReservation(id);
        if (full && typeof full === 'object') detail = full;
      } catch (_) {
        // Fallback to initial payload
      }
      
      reservationData = detail;
      project = detail.project ?? {
        name: detail.project_name ?? detail.projectName,
        city: detail.project_city ?? detail.city,
        district: detail.project_district ?? detail.district,
        developer_name: detail.developer_name ?? detail.developerName,
      };
      unit = detail.unit ?? {
        number: detail.unit_number ?? detail.unitNumber,
        type: detail.unit_type ?? detail.unitType,
        area: detail.unit_area ?? detail.area,
        floor: detail.unit_floor ?? detail.floor,
        price: detail.unit_price ?? detail.price,
      };
      employee = detail.employee ?? { 
        name: detail.employee_name ?? detail.employeeName, 
        team: detail.employee_team ?? detail.team 
      };
    }

    const pdfBytes = await generateReservationVoucherPdf(reservationData, project, unit, employee);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    logger.error('Error downloading voucher:', e);
    toast.error('حدث خطأ أثناء تحميل السند');
    throw e;
  }
}
