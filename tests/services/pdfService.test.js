/**
 * PDF Service Tests
 * Mocks pdf-lib, fontkit, and fetch to test downloadFilledContract
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSave = vi.hoisted(() => vi.fn().mockResolvedValue(new Uint8Array(100)));
const mockPdfDoc = vi.hoisted(() => ({
  registerFontkit: vi.fn(),
  embedFont: vi.fn().mockResolvedValue({ widthOfTextAtSize: vi.fn(() => 10) }),
  getPages: () => [
    {
      getSize: () => ({ height: 300 }),
      drawRectangle: vi.fn(),
      drawText: vi.fn(),
    },
  ],
  save: mockSave,
}));

vi.mock('../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn().mockResolvedValue(mockPdfDoc),
  },
  rgb: vi.fn(() => ({})),
}));

vi.mock('@pdf-lib/fontkit', () => ({ default: {} }));

const mockArrayBuffer = new ArrayBuffer(8);

import { downloadFilledContract } from '../../src/services/pdfService';

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockArrayBuffer),
    })
  );
  mockPdfDoc.registerFontkit.mockClear?.();
  mockSave.mockResolvedValue(new Uint8Array(100));
});

describe('pdfService', () => {
  describe('downloadFilledContract', () => {
    it('should return PDF bytes when given contract data', async () => {
      const contractData = {
        units_count: '1',
        district: 'District',
        unit_type: 'Type',
        project_name: 'Project',
        gregorian_date: '2024-01-15',
        hijri_date: '1445-07-04',
        contract_day: 'الاثنين',
        contract_city: 'Riyadh',
        second_party_cr_number: '123',
        second_party_id: '456',
        second_party_name: 'Name',
        second_party_address: 'Address',
        second_party_signatory: 'Signatory',
        second_party_role: 'owner',
        second_party_phone: '0500000000',
        agreement_duration_days: '90',
        commission_from: 'owner',
        commission_percent: '2',
      };

      const result = await downloadFilledContract(contractData);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(100);
      expect(global.fetch).toHaveBeenCalledWith('/contract_template_v2.pdf');
      expect(mockPdfDoc.registerFontkit).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(downloadFilledContract({})).rejects.toThrow('Network error');
    });
  });
});
