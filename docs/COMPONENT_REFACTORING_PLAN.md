# Component Refactoring Plan

**Date:** 2026-02-10  
**Status:** In Progress

## Overview

This document outlines the plan for refactoring large view components (>1000 lines) into smaller, reusable components to improve maintainability, testability, and performance.

## Components to Refactor

### 1. HRView.vue (~1920 lines)
**Current Structure:**
- Dashboard Tab (~70 lines)
- Teams Tab (~270 lines)
- Employees Tab (~200 lines)
- Contracts Tab (~150 lines)
- Reports Tab (already extracted to ReportsTab.vue)

**Refactoring Plan:**
- ✅ ReportsTab already extracted
- Extract `HRDashboardTab.vue` - Dashboard with KPI cards and charts
- Extract `HRTeamsTab.vue` - Teams management section
- Extract `HREmployeesTab.vue` - Employee management section
- Extract `HRContractsTab.vue` - Contracts management section

**Estimated Reduction:** ~1920 lines → ~500 lines (main view) + 4 tab components (~350 lines each)

### 2. MarketingView.vue (~3143 lines)
**Current Structure:**
- Dashboard Tab (~70 lines)
- Projects Tab (~60 lines)
- Plans Tab (~200 lines)
- Leads Tab (~300 lines)
- Tasks Tab (~150 lines)
- Reports Tab (already extracted to ReportsTab.vue)

**Refactoring Plan:**
- ✅ ReportsTab already extracted
- Extract `MarketingDashboardTab.vue` - Dashboard with KPI cards
- Extract `MarketingProjectsTab.vue` - Projects grid and management
- Extract `MarketingPlansTab.vue` - Developer and employee plans
- Extract `MarketingLeadsTab.vue` - Leads management
- Extract `MarketingTasksTab.vue` - Tasks management

**Estimated Reduction:** ~3143 lines → ~600 lines (main view) + 5 tab components (~500 lines each)

### 3. SalesViewExtended.vue (~3496 lines)
**Current Structure:**
- Dashboard Tab (~90 lines)
- Targets Tab (~100 lines)
- Projects Tab (~80 lines)
- Reservations Tab (~200 lines)
- Attendance Tab (~100 lines)
- Negotiations Tab (~150 lines)
- Team Tab (~100 lines)
- Tasks Tab (~80 lines)

**Refactoring Plan:**
- Extract `SalesDashboardTab.vue` - Dashboard with stats
- Extract `SalesTargetsTab.vue` - Targets management
- Extract `SalesProjectsTab.vue` - Projects grid
- Extract `SalesReservationsTab.vue` - Reservations table and forms
- Extract `SalesAttendanceTab.vue` - Attendance records
- Extract `SalesNegotiationsTab.vue` - Negotiations management
- Extract `SalesTeamTab.vue` - Team members and projects
- Extract `SalesTasksTab.vue` - Tasks management

**Estimated Reduction:** ~3496 lines → ~700 lines (main view) + 8 tab components (~350 lines each)

## Implementation Strategy

### Phase 1: Extract Tab Components (Current)
1. Create tab component files in `src/components/{module}/` directories
2. Move tab-specific template, script, and styles
3. Define props for data and methods
4. Emit events for user actions
5. Update parent view to use new components

### Phase 2: Extract Shared Components
1. Extract common KPI card component
2. Extract common stat card component
3. Extract common table/list components
4. Extract common form components

### Phase 3: Extract Composables
1. Create `useHRDashboard.js` composable
2. Create `useMarketingDashboard.js` composable
3. Create `useSalesDashboard.js` composable
4. Extract shared data fetching logic

## Benefits

1. **Maintainability:** Smaller, focused components are easier to understand and modify
2. **Testability:** Individual components can be tested in isolation
3. **Reusability:** Tab components can be reused in other contexts
4. **Performance:** Smaller components enable better code splitting
5. **Developer Experience:** Easier to navigate and work with smaller files

## Progress Tracking

- [x] Performance optimizations (v-memo, shallowRef, lazy loading) - Completed
- [ ] HRView refactoring - Pending
- [ ] MarketingView refactoring - Pending
- [ ] SalesViewExtended refactoring - Pending

## Notes

- All extracted components should maintain the same styling and functionality
- Props and events should be well-documented with JSDoc
- Each component should be independently testable
- Consider using TypeScript for better type safety in future iterations
