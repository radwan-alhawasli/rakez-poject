/**
 * Marketing Normalizers Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeMarketingDashboard,
  normalizeProjectDetails,
  normalizeExpectedSale,
  normalizeListResponse,
} from '../../src/utils/marketingNormalizers';

describe('marketingNormalizers', () => {
  describe('normalizeMarketingDashboard', () => {
    it('should return object with numeric fields', () => {
      const raw = { total_leads: 100, available_units_count: 5, daily_task_achievement_rate: 0.8 };
      const out = normalizeMarketingDashboard(raw);
      expect(out.total_leads).toBe(100);
      expect(out.available_units_count).toBe(5);
      expect(out.daily_task_achievement_rate).toBe(0.8);
    });

    it('should default missing values to 0', () => {
      const out = normalizeMarketingDashboard({});
      expect(out.total_leads).toBe(0);
      expect(out.available_units_value).toBe(0);
    });

    it('should coerce string numbers', () => {
      const out = normalizeMarketingDashboard({ total_leads: '50' });
      expect(out.total_leads).toBe(50);
    });
  });

  describe('normalizeProjectDetails', () => {
    it('should include units and computed counts', () => {
      const raw = {
        units: [
          { status: 'available', price: 100 },
          { status: 'pending', price: 200 },
        ],
        available_units_count: 1,
        pending_units_count: 1,
      };
      const out = normalizeProjectDetails(raw);
      expect(out.units).toHaveLength(2);
      expect(out.available_units_count).toBe(1);
      expect(out.pending_units_count).toBe(1);
      expect(out.available_units_value).toBe(100);
    });
  });

  describe('normalizeExpectedSale', () => {
    it('should map direct_communications and hand_raises', () => {
      const raw = { direct_communications: 10, hand_raises: 5, conversion_rate: 0.2 };
      const out = normalizeExpectedSale(raw);
      expect(out.direct_communications).toBe(10);
      expect(out.hand_raises).toBe(5);
      expect(out.conversion_rate).toBe(20);
    });

    it('should compute expected_bookings from conversion', () => {
      const raw = { direct_communications: 100, hand_raises: 0, conversion_rate: 0.1 };
      const out = normalizeExpectedSale(raw);
      expect(out.expected_bookings).toBe(10);
    });
  });

  describe('normalizeListResponse', () => {
    it('should return array as-is', () => {
      const items = [{ id: 1 }, { id: 2 }];
      expect(normalizeListResponse(items)).toEqual(items);
    });

    it('should return [] for non-array', () => {
      expect(normalizeListResponse(null)).toEqual([]);
      expect(normalizeListResponse({})).toEqual([]);
    });
  });
});
