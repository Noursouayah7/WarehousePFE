# Price Model Integration Guide (Warehouse Backend)

This guide explains how to integrate the exported price prediction model into the WarehousePFE platform, with a dashboard widget for `ADMIN` and `MANAGER` users.

It is tailored to the current artifact contract found in this folder:
- `price_model.joblib`
- `feature_columns.joblib`
- `metadata.json`

Current metadata:
- model: `random_forest_price_model`
- version: `v1`
- target: `price`
- features: `year`, `month`, `cost`, `revenue`, `stock`, `quantity_sold`

---

## 1. Integration Goal

Expose model predictions in two product surfaces:

1. Dashboard Widget (primary)
- Show next-period prediction for managers/admins.
- Show model version and timestamp.
- Optional trend indicator compared to latest known price.

2. Predict Action (secondary)
- Button or modal where manager/admin inputs feature values.
- Returns predicted price immediately.

Recommended UX:
- Keep the dashboard widget always visible for passive insight.
- Add a "Predict" action for manual what-if simulation.

---

## 2. Architecture Decision

Because your model is in Python `joblib` format, Node/Nest cannot load it natively.

Use a two-service architecture:

1. NestJS backend (existing app)
- Auth, role checks, API gateway, logging, persistence.

2. Python inference service (new internal service)
- Loads `joblib` model + feature list.
- Runs predictions.
- Returns JSON response to Nest.

Why this is recommended:
- Uses your existing `joblib` artifacts directly.
- Keeps prediction runtime stable and language-appropriate.
- Easier retraining/deployment lifecycle.

Alternative options (not recommended for first release):
- Re-train model in Node ecosystem.
- Convert model to ONNX and run via Node runtime.

---

## 3. Folder and Artifact Contract

Current folder:
- `warehouse-backend/model_artifacts/`

Required files:
- `price_model.joblib`: sklearn model object.
- `feature_columns.joblib`: strict input feature order.
- `metadata.json`: model info used for traceability.

Important runtime rule:
- Inference payload must be mapped in exactly this order:
  - `year`
  - `month`
  - `cost`
  - `revenue`
  - `stock`
  - `quantity_sold`

If order is changed, predictions may become invalid.

---

## 4. Backend API Design (NestJS)

Create a dedicated AI module in `warehouse-backend/src/ai/`.

Recommended endpoints:

1. `POST /ai/price/predict`
- Purpose: Predict price from user-provided features.
- Roles: `ADMIN`, `MANAGER`.

Request body:
```json
{
  "year": 2026,
  "month": 7,
  "cost": 13.2,
  "revenue": 3520,
  "stock": 410,
  "quantity_sold": 220
}
```

Response:
```json
{
  "predictedPrice": 18.74,
  "currency": "TND",
  "model": {
    "name": "random_forest_price_model",
    "version": "v1"
  },
  "featuresUsed": {
    "year": 2026,
    "month": 7,
    "cost": 13.2,
    "revenue": 3520,
    "stock": 410,
    "quantity_sold": 220
  },
  "predictedAt": "2026-06-02T12:30:00.000Z"
}
```

2. `GET /ai/price/widget`
- Purpose: Dashboard-ready quick forecast payload.
- Roles: `ADMIN`, `MANAGER`.
- Backend can use latest operational metrics from DB or default strategy.

Response:
```json
{
  "title": "Next Price Forecast",
  "predictedPrice": 18.74,
  "previousPrice": 18.10,
  "delta": 0.64,
  "deltaPercent": 3.54,
  "trend": "up",
  "modelVersion": "v1",
  "predictedAt": "2026-06-02T12:30:00.000Z"
}
```

3. Optional: `GET /ai/price/health`
- Purpose: Health check for inference chain.

---

## 5. DTO and Validation Rules

Create `PredictPriceDto` with strict validation:
- `year`: integer, reasonable range (e.g. 2000-2100)
- `month`: integer, 1-12
- `cost`: float, >= 0
- `revenue`: float, >= 0
- `stock`: float, >= 0
- `quantity_sold`: float, >= 0

Validation behavior:
- Reject invalid inputs with 400.
- Return clear field-level messages.

---

## 6. Role-Based Access Control

Guard all AI endpoints with JWT + role guards.

Allowed roles:
- `ADMIN`
- `MANAGER`

Denied roles:
- `CUSTOMER`
- `TECHNICIEN`
- `PENDING`

Reason:
- Forecast impacts planning decisions and should remain in managerial scope.

---

## 7. Python Inference Service Specification

### 7.1 Service responsibilities
- Load model artifacts at startup.
- Validate input schema.
- Build feature vector in metadata order.
- Predict and return JSON.
- Expose health endpoint.

### 7.2 Internal API contract

`POST /predict`
```json
{
  "year": 2026,
  "month": 7,
  "cost": 13.2,
  "revenue": 3520,
  "stock": 410,
  "quantity_sold": 220
}
```

Response:
```json
{
  "predictedPrice": 18.74,
  "modelName": "random_forest_price_model",
  "modelVersion": "v1"
}
```

`GET /health`
```json
{
  "status": "ok",
  "modelLoaded": true,
  "version": "v1"
}
```

### 7.3 Startup checks
On startup, fail fast if any artifact is missing or invalid:
- missing `price_model.joblib`
- missing `feature_columns.joblib`
- missing `metadata.json`
- feature count mismatch

---

## 8. NestJS Service Flow

Inside Nest `AiService`:

1. Receive validated DTO from controller.
2. Optional sanitation and normalization.
3. Forward payload to Python `/predict`.
4. Handle timeout/retry policy.
5. Return standardized response to frontend.
6. Log request/response metadata.

Timeout recommendation:
- 1000-2000 ms per inference request.

Retry recommendation:
- 1 retry max for transient errors.

Failure fallback:
- Return `503 Service Unavailable` with user-friendly message.

---

## 9. Dashboard Widget Integration (Frontend)

Place widget in Manager/Admin dashboard sections.

Widget fields:
- Predicted price
- Delta vs previous observed price
- Trend (up/down/flat)
- Model version
- Last updated time

UX details:
- Add "Refresh" action.
- Add "Run Simulation" button opening predict modal.
- Show loading and error states.

Predict modal fields:
- year
- month
- cost
- revenue
- stock
- quantity_sold

Submission:
- call `POST /ai/price/predict`.
- show result card in modal.

---

## 10. Logging and Auditability

Persist prediction events in DB (recommended table `PricePredictionLog`):
- id
- userId
- role
- input JSON
- predictedPrice
- modelVersion
- createdAt

Benefits:
- Audit trail
- Model quality monitoring
- Easy report generation for project documentation

---

## 11. Monitoring and Quality Controls

Track operational metrics:
- request count
- success/failure rate
- latency p50/p95/p99
- inference service availability

Track model quality metrics:
- compare predictions vs actual price when actual data arrives
- rolling MAE and RMSE over recent periods
- detect drift if error rises above threshold

Suggested alert thresholds:
- inference error rate > 3%
- p95 latency > 1500 ms
- rolling MAE increase > 30% vs baseline

---

## 12. Security and Hardening

- Keep inference service internal (not public internet).
- Allow only backend-to-inference communication.
- Enforce input validation in both Nest and Python layers.
- Do not allow arbitrary feature keys.
- Do not expose raw artifact paths in API responses.

---

## 13. Deployment Strategy

Recommended deployment:
- Run NestJS + Python inference as two containers.
- Mount `model_artifacts` read-only in inference container.
- Use environment variable for inference URL in Nest.

Example env values:
- `AI_INFERENCE_URL=http://ai-inference:8000`
- `AI_INFERENCE_TIMEOUT_MS=1500`

Release steps:
1. Deploy inference service with artifacts.
2. Verify `/health`.
3. Deploy Nest with AI module enabled.
4. Enable frontend widget for admin/manager.
5. Monitor logs and metrics.

---

## 14. Model Update Workflow

When a new model is trained:

1. Export new artifacts from Colab.
2. Update `metadata.json` version (e.g. `v2`).
3. Replace artifacts in `model_artifacts` folder.
4. Restart inference service.
5. Run smoke test requests.
6. Announce version update in release notes.

Optional improvement:
- keep versioned artifacts side by side (`v1`, `v2`) and add active-model pointer.

---

## 15. Definition of Done (Integration)

Integration is complete when all checks pass:

- [ ] `POST /ai/price/predict` returns valid prediction for valid payload.
- [ ] `GET /ai/price/widget` renders correctly in Admin and Manager dashboards.
- [ ] Forbidden roles cannot access AI endpoints.
- [ ] Prediction logs are persisted.
- [ ] Inference health endpoint is monitored.
- [ ] Documentation and API contract are shared with frontend team.

---

## 16. Quick Implementation Plan

Phase 1 (MVP):
- Add Python inference service.
- Add Nest AI module + 2 endpoints.
- Add dashboard widget + predict modal.

Phase 2 (Stability):
- Add logs + monitoring.
- Add retry/timeout tuning.
- Add drift tracking.

Phase 3 (Maturity):
- Versioned model routing.
- Confidence intervals.
- Automated retraining pipeline.
