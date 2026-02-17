/**
 * App Config Smoke Tests
 */

import { describe, it, expect } from 'vitest'
import appConfig from '../../src/config/appConfig'

describe('appConfig', () => {
  it('should have apiBaseUrl', () => {
    expect(appConfig).toHaveProperty('apiBaseUrl')
    expect(typeof appConfig.apiBaseUrl).toBe('string')
  })

  it('should have apiTimeout', () => {
    expect(appConfig).toHaveProperty('apiTimeout')
    expect(typeof appConfig.apiTimeout).toBe('number')
  })

  it('should have isDevelopment', () => {
    expect(appConfig).toHaveProperty('isDevelopment')
    expect(typeof appConfig.isDevelopment).toBe('boolean')
  })

  it('should have isProduction', () => {
    expect(appConfig).toHaveProperty('isProduction')
    expect(typeof appConfig.isProduction).toBe('boolean')
  })

  it('should have env', () => {
    expect(appConfig).toHaveProperty('env')
  })

  it('should have sessionTimeout and sessionWarningTime', () => {
    expect(appConfig).toHaveProperty('sessionTimeout')
    expect(appConfig).toHaveProperty('sessionWarningTime')
  })

  it('should have pusherKey and pusherCluster', () => {
    expect(appConfig).toHaveProperty('pusherKey')
    expect(appConfig).toHaveProperty('pusherCluster')
  })
})
