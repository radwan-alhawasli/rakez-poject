# Security Policy — RAKEZ Real Estate Platform

## Content Security Policy (CSP)

CSP is enforced via a `<meta>` tag in `index.html`:

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Only allow same-origin resources |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | Required for Vue SFC + Vite HMR |
| `style-src` | `'self' 'unsafe-inline'` | Required for scoped styles |
| `font-src` | `'self' fonts.gstatic.com data:` | Google Fonts |
| `img-src` | `'self' data: blob: https:` | Images from CDN / blob URLs |
| `connect-src` | `'self' api.rakez.com.sa ws: wss: *.pusher.com` | API + Pusher WebSocket |
| `object-src` | `'none'` | Block plugins |
| `frame-src` | `'self'` | No third-party iframes |
| `base-uri` | `'self'` | Prevent base-tag injection |
| `form-action` | `'self'` | Forms submit only to same origin |

Additional headers are set via `<meta http-equiv>`:
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## XSS Prevention

### v-html Usage

Only **2 locations** in the codebase use `v-html`:

| File | Usage | Sanitized? |
|------|-------|-----------|
| `ChatbotPanel.vue` | `v-html="msg.contentHtml"` | Yes — via `sanitizeMarkdown()` using DOMPurify |
| `ToastContainer.vue` | `v-html="iconSvg(t.type)"` | Safe — hardcoded SVG icons, no user input |

### Sanitization Stack

- **DOMPurify** (`src/utils/safeHtml.js`) — Sanitizes all markdown-derived HTML
- **escapeHtml** (`src/utils/sanitizer.js`) — Escapes raw text for safe rendering
- **isSafeContent** — Checks for dangerous patterns (`<script>`, `javascript:`, event handlers)

All AI assistant responses pass through `sanitizeMarkdown()` before rendering.

## Authentication & Authorization

- **Token-based auth** stored in `secureStorage` (encrypted localStorage wrapper)
- **Automatic token refresh** via `tokenRefresh.js` interceptor
- **CSRF protection** via `src/utils/csrf.js` token injection
- **RBAC** via `src/utils/rbac.js` — role-based route access and UI visibility
- **Router guards** enforce `meta.requiresAuth` on protected routes

## API Security

- All API calls go through `src/api/apiClient.js` (Axios instance)
- 401 responses trigger automatic token refresh or redirect to login
- Request/response interceptors add auth headers and CSRF tokens
- Input validation via Zod schemas (`src/validation/schemas.js`)

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. Do **not** open a public issue
2. Email security findings to the development team
3. Include steps to reproduce and potential impact
