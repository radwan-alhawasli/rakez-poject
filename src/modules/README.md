# Feature modules (`src/modules`)

Each **business domain** (sales, marketing, accounting, …) lives under `src/modules/<domain>/`.

## Layout

| Path | Purpose |
|------|---------|
| `views/` | Route-level shells (tab host + layout only). |
| `tabs/<tab-key>/` | One folder per sidebar/route tab; main file `*Tab.vue`. |
| `tabs/<tab-key>/sections/` | Optional: large UI blocks split from a tab for readability. |
| `components/` | Domain-only shared pieces (e.g. modals used from multiple tabs). |
| `styles/` | Module-level CSS imported by shells (e.g. child-targeting rules). |

## Imports

- Prefer `@/modules/<domain>/...` or `@modules/<domain>/...` (see Vite alias `@modules` → `src/modules`).
- Shared UI stays in `@/components/ui`; cross-cutting utils in `@/utils`, API in `@/services` unless a module gains its own API layer later.

## Security (frontend)

- Route access remains enforced in [`src/core/router`](../core/router) via `meta.permissions` / `meta.roles`; folder structure does not replace server-side authorization.
- No secrets in module code; use `VITE_*` env for public config only ([`appConfig`](../config/appConfig.js)).
- User-generated HTML from APIs should keep using [`sanitizer`](../utils/sanitizer.js); forms should use shared validation ([`validation/schemas`](../validation/schemas.js)).

## Naming

- `tab-key` matches the route segment (e.g. `dashboard`, `sold-units`).
- Tab components keep the existing `Sales*Tab.vue` / `Marketing*Tab.vue` names for stable git history and search.
