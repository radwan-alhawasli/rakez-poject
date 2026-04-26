/**
 * Vitest setup file
 * Configures test environment and global mocks
 */

import { vi } from 'vitest';
import { config } from '@vue/test-utils';

const originalConsoleError = console.error.bind(console);
vi.spyOn(console, 'error').mockImplementation((...args) => {
  if (String(args[0] || '').includes('Could not parse CSS stylesheet')) return;
  originalConsoleError(...args);
});

// jsdom: @unovis axis may call .node().getBBox() on non-SVG nodes — stub on Element
if (typeof Element !== 'undefined' && typeof Element.prototype.getBBox !== 'function') {
  Element.prototype.getBBox = function rakezTestGetBBox() {
    return { x: 0, y: 0, width: 100, height: 24 };
  };
}

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
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.location to avoid jsdom "Not implemented: navigation" when apiClient redirects on 401
let locationHref = 'http://localhost/';
const locationMock = {
  get href() {
    return locationHref;
  },
  set href(v) {
    locationHref = v;
  },
  pathname: '/',
  search: '',
  hash: '',
  origin: 'http://localhost',
  protocol: 'http:',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};
Object.defineProperty(window, 'location', {
  writable: true,
  configurable: true,
  value: locationMock,
});

// Surface unhandled errors with context (Vitest sometimes reports empty stacks)
if (!global.__RAKEZ_TEST_UNHANDLED_HOOKS__) {
  global.__RAKEZ_TEST_UNHANDLED_HOOKS__ = true;

  const logUnhandled = (label, err) => {
    // eslint-disable-next-line no-console
    console.error(`[test] ${label}:`, err);
  };

  // Node-level handlers
  process.on('unhandledRejection', reason => logUnhandled('unhandledRejection', reason));
  process.on('uncaughtException', err => logUnhandled('uncaughtException', err));

  // Browser-level handlers (jsdom)
  window.addEventListener('unhandledrejection', event =>
    logUnhandled('window.unhandledrejection', event.reason)
  );
  window.addEventListener('error', event =>
    logUnhandled('window.error', event.error || event.message)
  );
}

// Global test configuration
config.global.mocks = {
  $t: key => key,
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
  $route: {
    path: '/',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
    name: null,
  },
};
