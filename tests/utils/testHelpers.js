/**
 * Test Helpers
 * Common utilities for testing
 */

import { nextTick } from 'vue'

/**
 * Wait for Vue to update
 */
export async function waitForUpdate() {
  await nextTick()
}

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 */
export function wait(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create mock user object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    type: 1, // admin
    phone: '+966501234567',
    created_at: '2026-01-01T00:00:00.000000Z',
    ...overrides
  }
}

/**
 * Create mock auth token
 * @returns {string} Mock token
 */
export function createMockToken() {
  return '1|mock_token_abcdefghijklmnopqrstuvwxyz1234567890'
}

/**
 * Create mock API response wrapper
 * @param {*} data - Response data
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @returns {Object} Mock API response
 */
export function createApiResponse(data, success = true, message = 'Success') {
  return {
    success,
    message,
    data
  }
}

/**
 * Create mock paginated response
 * @param {Array} items - Array of items
 * @param {number} page - Current page
 * @param {number} perPage - Items per page
 * @param {number} total - Total items
 * @returns {Object} Mock paginated response
 */
export function createPaginatedResponse(items, page = 1, perPage = 20, total = null) {
  const totalItems = total !== null ? total : items.length
  return {
    success: true,
    data: items,
    meta: {
      current_page: page,
      per_page: perPage,
      total: totalItems,
      last_page: Math.ceil(totalItems / perPage)
    }
  }
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString() },
    removeItem: (key) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) }
  }
}

/**
 * Mock sessionStorage
 */
export function mockSessionStorage() {
  return mockLocalStorage()
}

/**
 * Create mock router
 */
export function createMockRouter() {
  const { vi } = require('vitest')
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        params: {},
        query: {},
        hash: '',
        fullPath: '/',
        matched: [],
        meta: {},
        name: null
      }
    }
  }
}

/**
 * Create mock route
 */
export function createMockRoute(overrides = {}) {
  return {
    path: '/',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    name: null,
    ...overrides
  }
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
  await nextTick()
  return new Promise(resolve => setImmediate(resolve))
}

export default {
  waitForUpdate,
  wait,
  createMockUser,
  createMockToken,
  createApiResponse,
  createPaginatedResponse,
  mockLocalStorage,
  mockSessionStorage,
  createMockRouter,
  createMockRoute,
  flushPromises
}
