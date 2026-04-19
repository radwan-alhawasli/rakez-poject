# Sales Leader Permission/API Matrix

## Scope
- Source RBAC: PHP permissions map (sales base + sales leader extras).
- API source of truth: Union of both Postman collections.
- Conflict rule: `RAKEZ ERP - Complete API Collection _249 Endpoints_.postman_collection.json` is preferred.

## Permission -> UI -> Route -> Service -> Endpoint

| Permission | UI | Route | Service Method | Endpoint | Status |
|---|---|---|---|---|---|
| `sales.dashboard.view` | Dashboard tab | `/sales/dashboard` | `getDashboard` | `GET /sales/dashboard` | Implemented |
| `sales.projects.view` | Projects tab | `/sales/projects` | `getProjects`, `getProjectDetails`, `getProjectUnits` | `GET /sales/projects`, `GET /sales/projects/{contract_id}`, `GET /sales/projects/{contract_id}/units` | Implemented |
| `sales.units.view` | Units inside project details | `/sales/projects` | `getProjectUnits` | `GET /sales/projects/{contract_id}/units` | Implemented |
| `sales.units.book` | Reserve unit action | `/sales/projects` | `createReservation` | `POST /sales/reservations` | Implemented |
| `sales.reservations.create` | Reservation form submit | `/sales/reservations` | `createReservation` | `POST /sales/reservations` | Implemented |
| `sales.reservations.view` | Reservations tab | `/sales/reservations` | `getReservations` | `GET /sales/reservations` | Implemented |
| `sales.reservations.confirm` | Confirm reservation action | `/sales/reservations` | `confirmReservation` | `POST /sales/reservations/{reservation_id}/confirm` | Implemented |
| `sales.reservations.cancel` | Cancel reservation action | `/sales/reservations` | `cancelReservation` | `POST /sales/reservations/{reservation_id}/cancel` | Implemented |
| `sales.waiting_list.create` | Waiting list tab/actions | `/sales/waiting-list` | `getWaitingList`, `addToWaitingList`, `cancelWaitingListEntry` | `GET/POST/DELETE /sales/waiting-list*` | Implemented |
| `sales.waiting_list.convert` | Convert waiting entry action | `/sales/waiting-list` | `convertToReservation` | `POST /sales/waiting-list/{waiting_list_id}/convert` | Implemented |
| `sales.goals.view` | Targets tab | `/sales/targets` | `getMyTargets` | `GET /sales/targets/my` | Implemented |
| `sales.goals.create` | Create target action | `/sales/targets` | `createTarget` | `POST /sales/targets` | Implemented |
| `sales.schedule.view` | Attendance tab (read) | `/sales/attendance` | `getMyAttendance` | `GET /sales/attendance/my` | Implemented |
| `sales.targets.view` | Targets tab read | `/sales/targets` | `getMyTargets` | `GET /sales/targets/my` | Implemented |
| `sales.targets.update` | Target update flow | `/sales/targets` | `updateTarget` | `PATCH /sales/targets/{target_id}` | Implemented |
| `sales.attendance.view` | Attendance tab | `/sales/attendance` | `getMyAttendance`, `getTeamAttendance` | `GET /sales/attendance/my`, `GET /sales/attendance/team` | Implemented |
| `sales.attendance.manage` | Create schedule action | `/sales/attendance` | `createSchedule` | `POST /sales/attendance/schedules` | Implemented |
| `sales.tasks.manage` | Tasks tab + status update | `/sales/tasks` | `getTaskProjects`, `getProjectTasks`, `updateTaskStatus` | `GET /sales/tasks/projects*`, `PUT /sales/marketing-tasks/{task_id}` | Implemented |
| `sales.tasks.create_for_marketing` | Create marketing task | `/sales/tasks` | `createMarketingTask` | `POST /sales/marketing-tasks` | Implemented |
| `sales.projects.allocate_shifts` | Assignments tab | `/sales/assignments` | `getMyAssignments`, `getProjectAssignments`, `assignProject` | `GET /sales/assignments/my`, `GET/POST /admin/sales/project-assignments` | Implemented |
| `sales.negotiation.approve` | Negotiations tab/actions | `/sales/negotiations` | `getPendingNegotiations`, `approveNegotiation`, `rejectNegotiation` | `GET /sales/negotiations/pending`, `POST /sales/negotiations/{id}/approve`, `POST /sales/negotiations/{id}/reject` | Implemented |
| `sales.payment-plan.manage` | Payment plans tab + off-plan actions | `/sales/payment-plans`, `/sales/reservations` | `getPaymentPlan`, `createPaymentPlan`, `updatePaymentInstallment`, `deletePaymentInstallment` | `GET/POST /sales/reservations/{reservation_id}/payment-plan`, `PUT/DELETE /sales/payment-installments/{installment_id}` | Implemented |
| `notifications.view` | Notifications nav | `/notifications` | `notificationService.*` | `/notifications*` | Implemented |
| `exclusive_projects.request` | My requests nav | `/my-requests` | `exclusiveProjectService.*` | project module endpoints | Implemented |
| `exclusive_projects.contract.complete` | Contract complete flow | module dependent | backend flow | module dependent | N/A in SalesView |
| `exclusive_projects.contract.export` | Contract export flow | module dependent | backend flow | module dependent | N/A in SalesView |
| `use-ai-assistant` | AI assistant access | module dependent | ai service | module dependent | N/A in SalesView |

## API Merge Diff (Union)

| Endpoint | preferred_from_249 | Exists in complete collection | Note |
|---|---|---|---|
| `/sales/assignments/my` | `true` | `false` | Added from 249-only coverage |
| `/sales/team/projects` | `true` | `true` | Query defaults differ; normalized in service |
| `/sales/waiting-list/*` | `true` | `true` | Same paths, unified response handling |
| `/sales/negotiations/*` | `true` | `true` | Same paths, stricter UI permission guards |
| `/sales/reservations/{id}/payment-plan` | `true` | `true` | Same path, used for payment-plan permission |

