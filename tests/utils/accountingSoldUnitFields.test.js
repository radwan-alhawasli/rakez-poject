import { describe, it, expect } from 'vitest';
import {
  pickFinalSalePriceFromUnit,
  mergeSoldUnitDetail,
  pickCommissionPercentForSoldUnit,
  pickCommissionSourceForSoldUnit,
} from '../../src/utils/accountingSoldUnitFields';

describe('accountingSoldUnitFields', () => {
  describe('pickFinalSalePriceFromUnit', () => {
    it('returns first finite price among known keys', () => {
      expect(pickFinalSalePriceFromUnit({ final_selling_price: 500000 })).toBe(500000);
      expect(
        pickFinalSalePriceFromUnit({
          final_sale_price: 100,
          final_selling_price: 200,
        })
      ).toBe(100);
      expect(pickFinalSalePriceFromUnit({ total_value: 300 })).toBe(300);
      expect(pickFinalSalePriceFromUnit({ amount: 400 })).toBe(400);
    });

    it('returns null when no valid price', () => {
      expect(pickFinalSalePriceFromUnit(null)).toBeNull();
      expect(pickFinalSalePriceFromUnit({})).toBeNull();
    });
  });

  describe('pickCommissionPercentForSoldUnit', () => {
    it('prefers nested contract over root', () => {
      expect(
        pickCommissionPercentForSoldUnit({
          commission_percentage: 1,
          contract: { commission_percentage: 2.5 },
        })
      ).toBe(2.5);
    });

    it('falls back to root commission_percentage', () => {
      expect(pickCommissionPercentForSoldUnit({ commission_percentage: 3 })).toBe(3);
    });

    it('returns null when absent', () => {
      expect(pickCommissionPercentForSoldUnit({})).toBeNull();
    });
  });

  describe('pickCommissionSourceForSoldUnit', () => {
    it('prefers contract source then root', () => {
      expect(
        pickCommissionSourceForSoldUnit({
          commission_source: 'buyer',
          contract: { commission_source: 'owner' },
        })
      ).toBe('owner');
      expect(pickCommissionSourceForSoldUnit({ commission_source: 'buyer' })).toBe('buyer');
    });
  });

  describe('mergeSoldUnitDetail', () => {
    it('preserves list financial fields when detail sends null', () => {
      const base = {
        final_sale_price: 500000,
        commission_percentage: 2.5,
        team_name: 'فريق أ',
      };
      const detail = {
        final_sale_price: null,
        commission_percentage: null,
        extra_from_api: true,
      };
      const m = mergeSoldUnitDetail(base, detail);
      expect(m.final_sale_price).toBe(500000);
      expect(m.commission_percentage).toBe(2.5);
      expect(m.extra_from_api).toBe(true);
      expect(m.team_name).toBe('فريق أ');
    });

    it('applies detail values when defined', () => {
      const base = { final_sale_price: 100 };
      const detail = { final_sale_price: 200 };
      expect(mergeSoldUnitDetail(base, detail).final_sale_price).toBe(200);
    });
  });
});
