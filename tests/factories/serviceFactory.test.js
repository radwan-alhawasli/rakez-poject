/**
 * Service Factory Tests
 */

import { describe, it, expect } from 'vitest';
import serviceFactory from '../../src/factories/serviceFactory';

describe('serviceFactory', () => {
  it('get should return service for known name', () => {
    const contract = serviceFactory.get('contract');
    expect(contract).toBeDefined();
    expect(typeof contract.getContracts).toBe('function');
  });

  it('get should return auth service for "auth"', () => {
    const auth = serviceFactory.get('auth');
    expect(auth).toBeDefined();
    expect(typeof auth.login).toBe('function');
  });

  it('get should throw for unknown service name', () => {
    expect(() => serviceFactory.get('unknownService')).toThrow(
      "Service 'unknownService' not found"
    );
  });

  it('has should return true for known service', () => {
    expect(serviceFactory.has('contract')).toBe(true);
    expect(serviceFactory.has('credit')).toBe(true);
  });

  it('has should return false for unknown service', () => {
    expect(serviceFactory.has('unknown')).toBe(false);
  });

  it('getAll should return object with service keys', () => {
    const all = serviceFactory.getAll();
    expect(typeof all).toBe('object');
    expect(all.contract).toBeDefined();
    expect(all.auth).toBeDefined();
  });
});
