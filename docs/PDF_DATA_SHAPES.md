# PDF Data API — Expected JSON Shapes

Backend returns **JSON only** (no PDF file). Frontend uses these responses to build, design, and download the PDF (Arabic, RTL, fonts).

**Implemented:** Backend exposes these endpoints; frontend calls them via `src/services/pdfApi.js` and passes the response to the appropriate `pdfService` function. All endpoints respond with `Content-Type: application/json`. No existing Arabic report/PDF generation logic was changed.

---

## 1. Contract fill data (عقد حصري — ملء قالب)

**Endpoint:** `GET /api/contracts/{id}/fill-data`

**Frontend use:** `downloadFilledContract(contractData)`

**Backend:** `ContractPdfDataService` builds display-ready values.

**Response shape:** Flat object with template fields (display-ready, e.g. date DD-MM-YYYY, contract_day in Arabic, commission_from المالك|المشتري).

```json
{
  "units_count": "string",
  "district": "string",
  "unit_type": "string",
  "project_name": "string",
  "gregorian_date": "DD-MM-YYYY",
  "hijri_date": "string",
  "contract_day": "string (Arabic)",
  "contract_city": "string",
  "second_party_cr_number": "string",
  "second_party_id": "string",
  "second_party_name": "string",
  "second_party_address": "string",
  "second_party_signatory": "string",
  "second_party_role": "string",
  "second_party_phone": "string",
  "agreement_duration_months": "string",
  "commission_from": "المالك | المشتري",
  "commission_percent": "string"
}
```

Optional: `agreement_duration_days` (number) when present; frontend can derive `agreement_duration_months` via `daysToMonths()`.

---

## 2. Reservation voucher data (سند حجز)

**Endpoint:** `GET /api/sales/reservations/{id}/voucher-data`

**Frontend use:** `generateReservationVoucherPdf(reservation, project, unit, employee)`

**Note:** `downloadVoucher` (file download) is unchanged when a stored PDF exists.

**Response shape:** `{ reservation, project, unit, employee }` with expected fields (snake_case).

```json
{
  "reservation": {
    "id": "number",
    "reservation_type": "confirmed_reservation | negotiation",
    "payment_method": "bank_transfer | cash | bank_financing",
    "purchase_mechanism": "cash | supported_bank | unsupported_bank",
    "down_payment_status": "refundable | non_refundable",
    "down_payment_amount": "number",
    "contract_date": "YYYY-MM-DD",
    "client_name": "string",
    "client_mobile": "string",
    "client_nationality": "string",
    "client_iban": "string",
    "negotiation_notes": "string"
  },
  "project": {
    "name": "string",
    "city": "string",
    "district": "string",
    "developer_name": "string"
  },
  "unit": {
    "number": "string",
    "type": "string",
    "area": "string|number",
    "floor": "string|number",
    "price": "number"
  },
  "employee": {
    "name": "string",
    "team": "string"
  }
}
```

Field names may be snake_case or camelCase; frontend normalizes (e.g. `unit_number` vs `unit.number`).

---

## 3. Unit details for PDF (تفاصيل وحدة)

**Endpoint:** `GET /sales/units/:unitId/pdf-data` or `GET /api/units/:unitId/pdf-data`

**Frontend use:** `generateUnitDetailsPdf(unit, { projectName })`

**Response shape:**

```json
{
  "unit": {
    "unit_number": "string",
    "id": "number",
    "status": "available | reserved | sold | pending",
    "floor": "number",
    "area": "number",
    "private_area": "number",
    "total_area": "number",
    "bedrooms": "number",
    "rooms": "number",
    "facade": "string",
    "view": "string",
    "price": "number",
    "total_price": "number"
  },
  "projectName": "string"
}
```

Or flat: `{ unit_number, status, floor, area, ... , projectName }`. Frontend passes `unit` and `options: { projectName }`.

---

## 4. Commission claim PDF data (مطالبة عمولة)

**Endpoint:** `GET /api/commission-claims/:id/pdf-data` (or accounting module path)

**Frontend use:** `generateCommissionClaimPdf(commission, distributions)`

**Response shape:**

```json
{
  "commission": {
    "id": "number",
    "final_selling_price": "number",
    "commission_percentage": "number",
    "status": "pending | approved | paid | rejected",
    "total_amount": "number",
    "vat": "number",
    "marketing_expenses": "number",
    "bank_fees": "number",
    "net_amount": "number"
  },
  "distributions": [
    {
      "recipient": { "name": "string" },
      "external_marketer_name": "string",
      "type": "string",
      "percentage": "number",
      "amount": "number",
      "status": "string"
    }
  ]
}
```

---

## 5. Deposit claim PDF data (مطالبة عربون)

**Endpoint:** `GET /api/deposit-claims/:id/pdf-data` (or accounting module path)

**Frontend use:** `generateDepositClaimPdf(deposit)`

**Response shape:** Single object compatible with existing `deposit` in frontend (with relations):

```json
{
  "id": "number",
  "commission_source": "owner | buyer",
  "payment_method": "string",
  "payment_date": "string",
  "status": "pending | received | confirmed | refunded",
  "notes": "string",
  "contract": { "project_name": "string" },
  "contractUnit": { "unit_type": "string", "unit_number": "string" },
  "confirmedBy": { "name": "string" },
  "confirmed_at": "string",
  "refund_reason": "string",
  "refunded_at": "string"
}
```

---

## 6. Unified report shape (تقارير: أداء مسوقين، عقود منتهية، تسويق، خطط)

Used for: marketer performance, expiring contracts, marketing reports list, developer plan, employee plans.

**Endpoints (examples):**

- `GET /hr/reports/marketer-performance?month=&year=`
- `GET /hr/reports/expiring-contracts?days=30`
- `GET /marketing/reports?...` (with same filters as current report)
- `GET /marketing/reports/developer-plan/:contractId/pdf-data`
- `GET /marketing/employee-plans/pdf-data?marketing_project_id=`

**Response shape:**

```json
{
  "title": "string",
  "subtitle": "string",
  "sections": [
    {
      "sectionTitle": "string",
      "infoRows": [["label", "value"], ...],
      "headers": ["col1", "col2"],
      "rows": [["cell1", "cell2"], ...]
    }
  ],
  "footer": "string"
}
```

- For a section: either `infoRows` (label-value pairs) or `headers` + `rows` (table), or both.
- Frontend passes this to `buildDocumentPdf(payload)` (exported from pdfService for this shape).

**Marketer performance** alternative: return the same structure that `generateMarketerPerformanceReportPdf(report, generatedAt)` expects (`report.marketers`, `report.totals`, `report.period`). Same for **expiring contracts** and `generateExpiringContractsReportPdf(report, days)`.

---

## 7. Contract summary (ملخص عقد — إدارة مشاريع)

**Endpoint:** `GET /api/contracts/:id/summary-pdf-data`

**Frontend use:** `generateContractSummaryPdf(contract)`

**Response shape:**

```json
{
  "project_name": "string",
  "developer_name": "string",
  "city": "string",
  "district": "string",
  "status": "string",
  "notes": "string",
  "created_at": "ISO date string"
}
```

---

## 8. HR contract PDF data (عقد موظف)

**Endpoint:** `GET /hr/contracts/:id/pdf-data` or `GET /api/hr/contracts/:id/pdf-data`

**Frontend use:** When frontend builds HR contract PDF (same idea as contract fill or report): either the same fill-data shape as §1 or the unified report shape §6.

---

## 9. Weekly plan / platform distribution (خطة أسبوعية)

Data may come only from the frontend (e.g. `platformBreakdownTable`). If backend provides it:

**Endpoint (optional):** `GET /marketing/.../weekly-plan-data?marketing_project_id=`

**Response shape:**

```json
{
  "rows": [
    { "platform_ar": "string", "clicks": "number", "impressions": "number" }
  ],
  "total_clicks": "number",
  "total_impressions": "number"
}
```

Or `platform_distribution` map with optional `*_clicks` / `*_impressions` per platform. Frontend uses `generatePlatformDistributionPdf(distribution)`.
