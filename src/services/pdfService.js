/**
 * PDF Service Facade
 * This file acts as a single entry point for all PDF generation logic,
 * which has been modularized into specialized services to meet the <500 lines policy.
 */

export { 
  getPdfDeps, 
  loadArabicFontBytes, 
  reshapeArabic, 
  reshapeArabicLogical, 
  drawTextRtl, 
  PDF_LAYOUT, 
  buildDocumentPdf 
} from './pdf/pdfCore';

export { 
  downloadFilledContract, 
  generateContractSummaryPdf 
} from './pdf/pdfContractService';

export { 
  generateMarketerPerformanceReportPdf, 
  generateExpiringContractsReportPdf, 
  generateMarketingPlanExportPdf, 
  generatePlatformDistributionPdf 
} from './pdf/pdfReportService';

export { 
  generateCommissionClaimPdf, 
  generateDepositClaimPdf, 
  generateReservationVoucherPdf 
} from './pdf/pdfVoucherService';

export { 
  generateUnitDetailsPdf 
} from './pdf/pdfUnitService';
