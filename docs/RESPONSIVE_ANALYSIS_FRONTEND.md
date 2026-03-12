# Frontend Responsive Analysis

**Scope:** Frontend (Vue components, layouts, marketing plans)  
**Include:** breakpoints, layout-grid, typography, spacing, nav, sidebar, header, footer, forms, tables, modals, dialogs, toasts, overflow, scroll, positioning, z-index, touch-targets, RTL, common bugs  
**Device matrix:** 320, 360, 375, 390, 414, 428, 768, 820, 1024, 1280, 1440, 1536  
**Browser matrix:** Chrome, Firefox, Safari

---

## Summary

- **Fixed in this pass:** Marketing Developer Plan tab — duplicate table removed (manual mode), tables stacked on small viewports, overflow contained, touch targets ≥44px, tab-content padding and scroll on mobile.
- **Existing assets:** `responsive-breakpoints.css` (320–3840px), `responsive-enhancements.css` (grid, tables, RTL), layout uses `min-h-0` and `overflow-auto` for scroll.
- **Remaining risks:** Some views still use ad-hoc `min-width` on tables/cards; modals and dialogs should be re-checked on 320–390px; RTL is applied but not every component uses logical properties.

---

## Findings, Severity, Root Cause, Locations, Quick Fixes

### 1. Table overflow / duplicate table (Marketing Plans) — FIXED

| Item | Detail |
|------|--------|
| **Severity** | High |
| **Root cause** | Manual mode showed two tables (input + result) with identical data; side-by-side layout with `min-width: 280px` caused horizontal overflow on viewports &lt;600px. |
| **Exact locations** | `src/components/marketing/MarketingDeveloperPlanTab.vue` — manual section `.platform-tables-wrap` with two `.platform-table` blocks. |
| **Quick fix (done)** | Removed duplicate result table in manual mode; single table with class `platform-tables-wrap--single` and `platform-table--full`. Added `max-width: 100%`, `overflow-x: auto` on tables; at `max-width: 1024px` stack tables in column. |

### 2. Content cut off at bottom (mobile)

| Item | Detail |
|------|--------|
| **Severity** | High |
| **Root cause** | Tab content could be clipped when main area height was constrained; padding-bottom insufficient on small screens. |
| **Exact locations** | `src/views/MarketingView.vue` — `.tab-content` (max-height, overflow-y). |
| **Quick fix (done)** | Added `overflow-x: hidden`, `min-height: 0`, `padding-bottom: 2rem`; at 768px padding 16px, at 390px padding 12px and 1.5rem bottom. |

### 3. Touch targets (buttons)

| Item | Detail |
|------|--------|
| **Severity** | Medium |
| **Root cause** | Some action buttons had no minimum size for 44×44px touch target. |
| **Exact locations** | `MarketingDeveloperPlanTab.vue` — `.mode-tab`, `.dev-plan-actions .btn-primary`, `.btn-secondary`. |
| **Quick fix (done)** | `min-height: 44px; min-width: 44px` and padding on mode tabs and action buttons; buttons as flex for alignment. |

### 4. Breakpoints consistency

| Item | Detail |
|------|--------|
| **Severity** | Low |
| **Root cause** | Project uses both CSS variables (`--bp-md: 768px`) and raw values; device matrix 320–1536 not all used in one place. |
| **Exact locations** | `src/assets/responsive-breakpoints.css` (320, 576, 768, 992, 1200, 1920, 2560, 3840); components use 360, 390, 428, 768, 1024. |
| **Quick fix** | Prefer `var(--bp-*)` in new code; add 360, 390, 414, 428, 820, 1024, 1280, 1440, 1536 to a single breakpoint map or CSS vars if needed. |

### 5. Horizontal scroll (common bug)

| Item | Detail |
|------|--------|
| **Severity** | Medium |
| **Root cause** | Any flex/grid child with `min-width` &gt; viewport or wide content without `overflow-x: auto` on the child can cause page-level horizontal scroll. |
| **Exact locations** | Mitigated in Developer Plan tab; other tables/cards in `MarketingProjectsTab`, `ReservationsView`, `ProjectUnitsTab`, etc. may still cause it. |
| **Quick fix** | Parent: `overflow-x: hidden` or `min-width: 0`; wide content wrapper: `overflow-x: auto; -webkit-overflow-scrolling: touch`. |

### 6. RTL

| Item | Detail |
|------|--------|
| **Severity** | Low |
| **Root cause** | Marketing view sets `direction: rtl`; layout and sidebar are RTL-aware; some components use physical `left`/`right` instead of logical `inline-start`/`inline-end`. |
| **Exact locations** | `MarketingView.vue` (direction: rtl); `responsive-enhancements.css` has RTL table rules; various modals/headers. |
| **Quick fix** | Use `margin-inline-start`, `padding-inline-end`, `text-align: start` where layout depends on reading direction. |

### 7. Modals / dialogs (clipped-modal risk)

| Item | Detail |
|------|--------|
| **Severity** | Medium |
| **Root cause** | Fixed or max-height modals on short viewports (e.g. 320–390px height) can clip content or buttons. |
| **Exact locations** | `AppModalContent.vue`, `ContractModal.vue`, `CommissionDistributionModal.vue`, and other modal wrappers. |
| **Quick fix** | Use `max-height: min(90vh, 600px)` and `overflow-y: auto` on modal body; ensure footer/actions stay visible or sticky. |

### 8. Z-index

| Item | Detail |
|------|--------|
| **Severity** | Low |
| **Root cause** | Multiple components use ad-hoc z-index (10, 50, 100, 1000); risk of overlap (e.g. toasts under sidebar). |
| **Exact locations** | Layouts, sidebar, header dropdowns, toasts, modals. |
| **Quick fix** | Centralize in CSS vars (e.g. `--z-dropdown: 1000`, `--z-modal: 1050`, `--z-toast: 1100`, `--z-sidebar: 1200`). |

---

## Device matrix (quick reference)

| Width (px) | Target | Notes |
|------------|--------|--------|
| 320 | iPhone SE, small Android | Single column, smallest touch targets, reduce table columns. |
| 360–390 | Common phones | Developer Plan tables: 90–100px + 64–70px columns. |
| 414, 428 | Large phones | Comfortable for current layout. |
| 768, 820 | Tablets | Tables can sit side-by-side where designed. |
| 1024–1536 | Desktop | Full layout; sidebar visible. |

---

## Browser matrix

- **Chrome:** Primary; scroll and flex behavior as expected.
- **Firefox:** `overflow-x: hidden` and `min-height: 0` behave correctly.
- **Safari (iOS):** Use `-webkit-overflow-scrolling: touch` on scrollable tables/containers; test 100dvh and safe-area on notched devices.

---

## Changes made in this session

1. **MarketingDeveloperPlanTab.vue**
   - Manual mode: one table only (removed duplicate result table).
   - Wrapper: `.marketing-developer-plan-tab` with `min-width: 0`, `overflow-x: hidden`.
   - Tables: `platform-tables-wrap` max-width 100%; at ≤1024px `flex-direction: column`; table `overflow-x: auto`.
   - Touch: `.mode-tab` and `.dev-plan-actions` buttons `min-height/min-width: 44px`.
   - Breakpoints: 1024, 768, 428, 390, 360 with reduced columns and padding.

2. **MarketingView.vue**
   - `.tab-content`: `overflow-x: hidden`, `min-height: 0`, `padding-bottom: 2rem`.
   - At 768px: padding 16px; at 390px: padding 12px, padding-bottom 1.5rem.

---

*Generated for responsive analysis — frontend scope. Re-run after layout or new views change.*
