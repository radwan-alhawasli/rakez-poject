# Component Refactoring Plan

**Last audited:** 2026-03-31 (line counts are approximate; run `Get-Content <file> | Measure-Object -Line` on Windows to refresh).

## Overview

Large **shell** views were split into lazy-loaded tabs under `src/modules/<domain>/tabs/`. The plan below separates **done** work from **remaining** hot spots (files still large or dense).

## Completed (architecture)

| Area | Shell view (lines) | Tab / child location |
|------|--------------------|----------------------|
| Sales | `SalesViewExtended.vue` (~127) | `src/modules/sales/tabs/*` (dashboard, targets, projects, reservations host, attendance, team, tasks, …) |
| Marketing | `MarketingView.vue` (~113) | `src/modules/marketing/tabs/*` (e.g. `MarketingProjectsTab.vue`, plans, leads, tasks, …) |
| HR | `HRView.vue` (~47) | `src/modules/hr/tabs/*` (`HRDashboardTab`, `HRTeamsTab`, `HRUsersTab`, reports, performance) |

`ReservationsView.vue` (~347) hosts sub-tabs (active / waiting / negotiations) with logic in `useReservationsView` — candidate for further extraction (see below).

## Remaining large files (priority for next extractions)

| File (approx. lines) | Note |
|----------------------|------|
| `src/modules/editor/views/EditorView.vue` (~644) | Highest single SFC; extract tool regions / panels |
| `src/modules/marketing/tabs/projects/MarketingProjectsTab.vue` (~487) | Split grid vs modals vs filters |
| `src/modules/contracts/views/ContractFormView.vue` (~366) | Form sections → subcomponents |
| `src/modules/sales/views/ReservationsView.vue` (~310) | ✅ `ReservationDetailModal.vue` extracted; optional: waiting/negotiation list panels |
| `src/modules/editor/views/EditorProjectsView.vue` (~251) | Optional: list vs detail blocks |
| `src/components/UserManagement.vue` (~227) | Table + modals |
| `src/components/EditContractInfoModal.vue` | eslint max-lines may apply; split sections |
| `src/modules/accounting/components/SoldUnitDetailView.vue` | Detail + `SoldUnitDetailDistributions.vue` already partial |

## Implementation strategy (unchanged)

1. Extract tab or panel components under `src/modules/<domain>/components/` or `tabs/<name>/`.
2. Keep props/emits explicit; move data logic to composables where it reduces duplication.
3. Prefer `defineAsyncComponent` for heavy tabs (already used in sales shell).

## Progress tracking

- [x] Sales shell + sales tabs extracted
- [x] Marketing shell + marketing tabs extracted
- [x] HR shell + HR tabs extracted
- [ ] EditorView breakdown
- [ ] MarketingProjectsTab breakdown
- [ ] ContractFormView / ReservationsView / UserManagement as needed

## References

- [`TEN_OF_TEN_BACKLOG.txt`](../TEN_OF_TEN_BACKLOG.txt) section A — large services & Vue list
- [`docs/SECURITY.md`](SECURITY.md) — when new UI renders HTML
