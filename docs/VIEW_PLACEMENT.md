# Where to put route-level views

## Rule (canonical)

- New **page components** that are registered in Vue Router live under:

  `src/modules/<domain>/views/`

  Choose `<domain>` to match an existing module (`app`, `sales`, `contracts`, `hr`, …) or add a module if the feature is a new bounded area.

- Register routes only from files under [`src/core/router/routes/`](../src/core/router/routes/) using dynamic imports, e.g. `() => import('@/modules/sales/views/ExampleView.vue')`.

## Audit reference

- [`src/core/router/viewDomainMap.js`](../src/core/router/viewDomainMap.js) lists view names grouped by domain for greps and reviews.

## Single source path (no `src/views`)

- There is **no** `src/views` tree for screens in this repo. **All route-level pages live under `src/modules/<domain>/views/`.** The router and tests import only `@/modules/.../views/...`.
- Add or edit screens only under `src/modules/...`; do not reintroduce a parallel `src/views` folder.

## Bundle analysis (performance)

- Run `npm run build:analyze` to produce `dist/stats.html` (Rollup visualizer, treemap). Use it to spot large chunks before adding lazy-loaded routes or `defineAsyncComponent` for heavy modals/tabs.

## API integration tests (optional)

- Env vars and skip rules are documented at the top of [`tests/integration/api-integration.test.js`](../tests/integration/api-integration.test.js).
- In GitHub Actions, the **Live API smoke** job runs only when repository secret `STAGING_API_BASE_URL` is set (same value should be passed as `VITE_APP_API_BASE_URL` for the client). Optional secrets: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` for login assertions.

## E2E (Playwright, optional)

- Local default: `npm run test:e2e` starts Vite via [`playwright.config.js`](../playwright.config.js) (`webServer` on `http://localhost:8080`).
- **PR CI:** workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) job **e2e-smoke** (E2E (preview, seeded auth)) runs `npm run build`, serves `vite preview` on `127.0.0.1:4173`, then `playwright test e2e` (all specs under [`e2e/`](../e2e/)) with `PLAYWRIGHT_SKIP_WEBSERVER=1`. No repo secrets required. Layering details: [`docs/E2E_CI.md`](E2E_CI.md).
- **Staging / manual:** workflow [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml) (`workflow_dispatch`). Set input **base_url** to a running deployment. The workflow sets `PLAYWRIGHT_SKIP_WEBSERVER=1` and `PLAYWRIGHT_BASE_URL` so tests hit that origin only (no dev server in the runner).
- **Local preview parity:** set `CI_E2E_PREVIEW=1` to use `vite preview` on port 4173 via Playwright `webServer` (see `playwright.config.js`).
