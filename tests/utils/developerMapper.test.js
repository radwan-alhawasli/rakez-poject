/**
 * Developer Mapper Utils Tests
 */

import { describe, it, expect } from 'vitest'
import { normalizeDeveloper, normalizeDeveloperList } from '../../src/utils/developerMapper'

describe('developerMapper', () => {
  describe('normalizeDeveloper', () => {
    it('should return default shape for null/undefined', () => {
      const out = normalizeDeveloper(null)
      expect(out.id).toBeNull()
      expect(out.name).toBe('مطور غير معروف')
      expect(out.email).toBe('')
      expect(out.representative).toBe('-')
      expect(out.commercialRecord).toBe('-')
      expect(out.phone).toBe('-')
      expect(out.location).toBe('-')
      expect(out.projectCount).toBe(0)
    })

    it('should map name from name, second_party_name, developer_name', () => {
      expect(normalizeDeveloper({ name: 'Dev A' }).name).toBe('Dev A')
      expect(normalizeDeveloper({ second_party_name: 'SP' }).name).toBe('SP')
      expect(normalizeDeveloper({ developer_name: 'DN' }).name).toBe('DN')
    })

    it('should map commercialRecord from commercial_record, second_party_cr_number, developer_number', () => {
      expect(normalizeDeveloper({ commercial_record: 'CR123' }).commercialRecord).toBe('CR123')
      expect(normalizeDeveloper({ second_party_cr_number: 'CR456' }).commercialRecord).toBe('CR456')
    })

    it('should map phone and location', () => {
      expect(normalizeDeveloper({ phone: '0500000000' }).phone).toBe('0500000000')
      expect(normalizeDeveloper({ second_party_phone: '0511111111' }).phone).toBe('0511111111')
      expect(normalizeDeveloper({ city: 'Riyadh' }).location).toBe('Riyadh')
      expect(normalizeDeveloper({ second_party_address: 'Addr' }).location).toBe('Addr')
    })

    it('should accept options.projectCount', () => {
      expect(normalizeDeveloper({}, { projectCount: 5 }).projectCount).toBe(5)
    })

    it('should preserve projects and unitsCount when present', () => {
      const d = { id: 1, name: 'D', projects: [{ id: 1 }], units_count: 10 }
      const out = normalizeDeveloper(d)
      expect(out.projects).toEqual([{ id: 1 }])
      expect(out.unitsCount).toBe(10)
    })
  })

  describe('normalizeDeveloperList', () => {
    it('should return empty array for non-array', () => {
      expect(normalizeDeveloperList(null)).toEqual([])
      expect(normalizeDeveloperList({})).toEqual([])
    })

    it('should normalize each item', () => {
      const list = [{ name: 'A' }, { second_party_name: 'B' }]
      const out = normalizeDeveloperList(list)
      expect(out).toHaveLength(2)
      expect(out[0].name).toBe('A')
      expect(out[1].name).toBe('B')
    })

    it('should pass projectCount from options', () => {
      const list = [{}]
      const out = normalizeDeveloperList(list, { projectCount: 3 })
      expect(out[0].projectCount).toBe(3)
    })
  })
})
