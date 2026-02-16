/**
 * Vitest setup file
 * Configures test environment and global mocks
 */

import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.location to avoid jsdom "Not implemented: navigation" when apiClient redirects on 401
let locationHref = 'http://localhost/'
const locationMock = {
  get href() { return locationHref },
  set href(v) { locationHref = v },
  pathname: '/',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn()
}
Object.defineProperty(window, 'location', {
  writable: true,
  configurable: true,
  value: locationMock
})

// Global test configuration
config.global.mocks = {
  $t: (key) => key,
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  $route: {
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
