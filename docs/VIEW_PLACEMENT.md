# Where to put route-level views

## Rule (canonical)

- New **page components** that are registered in Vue Router live under:

  `src/modules/<domain>/views/`

  Choose `<domain>` to match an existing module (`app`, `sales`, `contracts`, `hr`, …) or add a module if the feature is a new bounded area.

- Register routes only from files under [`src/core/router/routes/`](../src/core/router/routes/) using dynamic imports, e.g. `() => import('@/modules/sales/views/ExampleView.vue')`.

## Audit reference

- [`src/core/router/viewDomainMap.js`](../src/core/router/viewDomainMap.js) lists view names grouped by domain for greps and reviews.

## Legacy folder `src/views/`

- The tree [`src/views/`](../src/views/) still contains older copies of some screens. **The router and tests in this repo import from `@/modules/.../views`, not from `@/views`.**
- Do **not** treat `src/views/` as the source of truth for edits: change the file under `src/modules/...` that the router imports.
- See [`src/views/README.md`](../src/views/README.md) for a short pointer.

## Bundle analysis (performance)

- Run `npm run build:analyze` to produce `dist/stats.html` (Rollup visualizer, treemap). Use it to spot large chunks before adding lazy-loaded routes or `defineAsyncComponent` for heavy modals/tabs.

## API integration tests (optional)

- Env vars and skip rules are documented at the top of [`tests/integration/api-integration.test.js`](../tests/integration/api-integration.test.js).
- In GitHub Actions, the **Live API smoke** job runs only when repository secret `STAGING_API_BASE_URL` is set (same value should be passed as `VITE_APP_API_BASE_URL` for the client). Optional secrets: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` for login assertions.
