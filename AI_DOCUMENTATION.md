# AI Documentation

This document explains the AI features used in the WMS website:

- Chatbot assistant architecture
- Olive oil price prediction architecture
- How the prediction model was integrated into the website

Reference files used:

- `warehouse-backend/src/assistant/`
- `warehouse-backend/src/ai/`
- `warehouse-backend/ai_inference_service/`
- `warehouse-backend/model_artifacts/MODEL_INTEGRATION_GUIDE.md`
- `warehouse-backend/model_artifacts/AI_code_pfe (1).ipynb`
- `warehouse-backend/model_artifacts/metadata.json`
- `warehouse-frontend/src/assistant/`
- `warehouse-frontend/src/components/PriceForecastWidget.tsx`
- `warehouse-frontend/src/components/PredictionDashboard.tsx`

## 1. Chatbot Assistant Architecture

The chatbot assistant is a role-aware warehouse assistant. It is designed to answer operational questions about stock, product availability, product location, low stock, warehouse capacity, inventory summaries, and order status.

It is not a fully open-ended generative chatbot. The main decision layer is deterministic and rule-based, with an optional LLM normalization step that can rewrite messy user questions into cleaner warehouse queries before intent detection.

### High-Level Flow

```text
Frontend Assistant Page
        |
        | POST /assistant/query
        v
NestJS AssistantController
        |
        v
AssistantService
        |
        +--> Optional GrokNormalizerService
        |
        +--> IntentEngine
        |
        +--> SynonymEngine
        |
        +--> Entity parsing
        |
        +--> ContextManager
        |
        +--> Prisma database queries
        |
        +--> MetricsService
        v
Structured assistant response
```

### Frontend Layer

The frontend assistant lives in:

- `warehouse-frontend/src/assistant/AssistantPage.tsx`
- `warehouse-frontend/src/assistant/assistant.api.ts`

The frontend sends the user message to:

```text
POST /assistant/query
```

The response is normalized into a frontend shape containing:

- `intent`
- `message`
- parsed query information
- optional `totalQuantity`
- optional product matches with warehouse and bloc locations

The frontend also supports assistant history through:

```text
GET /assistant/history
```

### Backend Controller Layer

The backend entry point is:

- `warehouse-backend/src/assistant/assistant.controller.ts`

The controller is protected by `JwtAuthGuard`, so the user must be authenticated. It exposes:

- `POST /assistant/query`
- `GET /assistant/history`
- `GET /assistant/metrics`
- `GET /assistant/metrics/performance`
- `GET /assistant/metrics/failed`

The controller extracts the user identity from the JWT and passes:

- user role
- user id
- message body

to `AssistantService`.

### Assistant Module Components

The assistant module is declared in:

- `warehouse-backend/src/assistant/assistant.module.ts`

It registers these providers:

- `AssistantService`
- `IntentEngine`
- `GrokNormalizerService`
- `SynonymEngine`
- `ContextManager`
- `MetricsService`

### Intent Detection

Intent detection is handled by:

- `warehouse-backend/src/assistant/intent.engine.ts`

The assistant recognizes these intents:

- `stock_quantity`
- `stock_check`
- `inventory_summary`
- `product_location`
- `low_stock`
- `order_status`
- `warehouse_capacity`
- `clarification`
- `unsupported`
- `forbidden`

Each intent has regex patterns and a priority. The engine normalizes the user text, checks patterns, sorts matches by priority and match count, then returns the most likely intent with a confidence score.

### Optional LLM Normalization

The optional LLM step is handled by:

- `warehouse-backend/src/assistant/grok-normalizer.service.ts`

It is enabled only when:

```text
GROK_ASSISTANT_ENABLED=true
GROK_API_KEY=...
```

The normalizer sends the query to the configured Grok-compatible chat completion endpoint. Its purpose is narrow: normalize the wording of the user query while preserving product names, order numbers, warehouse names, and bloc names.

If the LLM service is disabled, unavailable, or times out, the assistant continues using the original message. This keeps the assistant functional without the external LLM.

### Synonym Normalization

The `SynonymEngine` improves matching by mapping common terms to canonical warehouse terms. For example, it can normalize variations around oil, olive oil, quantity, stock, shipment, delivery, and warehouse wording.

This makes user questions more tolerant of natural phrasing.

### Context Management

Conversation context is handled by:

- `warehouse-backend/src/assistant/context.manager.ts`

The context manager stores per-user in-memory context:

- last query
- last intent
- last extracted product, warehouse, bloc, or order
- conversation history
- clarification state

This allows follow-up questions. For example, if the first question mentions a product and the second question only mentions a warehouse, the assistant can reuse the product from the previous context.

### Database Access

The assistant uses Prisma to query the WMS database. Depending on the intent, it reads:

- `product`
- `bloc`
- `warehouse`
- `order`
- `shipment`

Examples:

- Stock questions query products and sum quantities.
- Location questions query products with bloc and warehouse relations.
- Low-stock questions query products under a threshold.
- Order status questions query orders and latest shipment status.

### Role Awareness

The assistant is role-aware:

- `PENDING` users are blocked.
- `CUSTOMER` users can ask about product availability.
- `CUSTOMER` users are restricted from warehouse, bloc, capacity, and low-stock operational details.
- Staff roles can access richer operational answers.

### Metrics

Assistant metrics are stored in memory by:

- `warehouse-backend/src/assistant/metrics.service.ts`

Metrics include:

- query count
- intent distribution
- role distribution
- success rate
- response time
- common product, warehouse, and bloc entities
- failed or unsupported queries

These metrics are useful for evaluating assistant quality and finding common user needs.

## 2. AI Prediction Architecture

The AI prediction feature forecasts olive oil price in TND per 1L bottle. It is used by admin and manager users for planning, scenario testing, and dashboard insights.

The model itself is a Python scikit-learn model exported from the training notebook as joblib artifacts. Because the main backend is NestJS and cannot directly run the joblib model safely, the project uses a two-service architecture.

### High-Level Flow

```text
Prediction Dashboard / Widget
        |
        | GET /ai/price/widget
        | POST /ai/price/predict
        v
NestJS AiController
        |
        v
NestJS AiService
        |
        | HTTP POST /predict
        v
FastAPI Inference Service
        |
        v
joblib RandomForestRegressor
        |
        v
Prediction response
```

### Model Training Summary

The model was trained in:

- `warehouse-backend/model_artifacts/AI_code_pfe (1).ipynb`

The notebook loads `Master_olive.csv`, cleans the data, selects modeling columns, trains regression models, evaluates them, and exports the selected model.

The cleaned modeling columns are:

- `year`
- `month`
- `price`
- `cost`
- `revenue`
- `stock`
- `quantity_sold`

The target variable is:

- `price`

The feature columns are:

- `year`
- `month`
- `cost`
- `revenue`
- `stock`
- `quantity_sold`

The notebook compares:

- Linear Regression with `StandardScaler`
- `RandomForestRegressor`

The exported model is the Random Forest model. The notebook indicates that Random Forest performed better than Linear Regression on MAE, RMSE, and R2.

### Exported Artifacts

The model artifacts are stored in:

- `warehouse-backend/model_artifacts/`

The required files are:

- `price_model.joblib`
- `feature_columns.joblib`
- `metadata.json`

Current metadata:

```json
{
  "model_name": "random_forest_price_model",
  "version": "v1",
  "target": "price",
  "features": [
    "year",
    "month",
    "cost",
    "revenue",
    "stock",
    "quantity_sold"
  ],
  "train_rows": 8651,
  "test_rows": 2163
}
```

The feature order is critical. The inference service must build the feature vector in exactly this order:

```text
year, month, cost, revenue, stock, quantity_sold
```

If the feature order changes, predictions can become invalid.

### Python Inference Service

The inference service is located in:

- `warehouse-backend/ai_inference_service/main.py`

It uses:

- FastAPI
- Pydantic
- joblib
- scikit-learn

It exposes:

```text
GET /health
POST /predict
```

At startup, it loads:

- `price_model.joblib`
- `feature_columns.joblib`
- `metadata.json`

The artifacts path defaults to:

```text
warehouse-backend/model_artifacts/
```

It can also be overridden with:

```text
MODEL_ARTIFACTS_PATH
```

The `/predict` endpoint validates:

- `year`: 2000 to 2100
- `month`: 1 to 12
- `cost`: greater than or equal to 0
- `revenue`: greater than or equal to 0
- `stock`: greater than or equal to 0
- `quantity_sold`: greater than or equal to 0

Then it builds a numeric vector in the saved feature order and calls:

```python
MODEL.predict([vector])
```

The response contains:

- `predictedPrice`
- `modelName`
- `modelVersion`

Implementation note: the metadata file uses the key `model_name`. The current inference service reads `METADATA.get("model", "unknown")`, so `modelName` may return `unknown` until that key lookup is aligned with `model_name`.

### NestJS AI Module

The NestJS AI module is located in:

- `warehouse-backend/src/ai/`

Main files:

- `ai.module.ts`
- `ai.controller.ts`
- `ai.service.ts`
- `dto/predict-price.dto.ts`

The module imports `PrismaModule` so predictions can be logged in the database.

The public backend endpoints are:

```text
POST /ai/price/predict
GET /ai/price/widget
GET /ai/price/health
```

Access control:

- `POST /ai/price/predict`: `ADMIN`, `MANAGER`
- `GET /ai/price/widget`: `ADMIN`, `MANAGER`
- `GET /ai/price/health`: public health-style endpoint

The Nest DTO validates the same six model inputs:

- `year`
- `month`
- `cost`
- `revenue`
- `stock`
- `quantity_sold`

### Prediction Logging

Predictions are logged through Prisma in:

- `PricePredictionLog`

The log stores:

- user id
- role
- input JSON
- predicted price
- model version
- timestamp

The logging is best-effort. If logging fails, the prediction response still returns to the user.

## 3. How The AI Prediction Was Integrated

The prediction model was integrated through a layered chain: model training, artifact export, Python inference, NestJS API, and frontend dashboard.

### Step 1: Train The Model In The Notebook

The Colab notebook:

- loads `Master_olive.csv`
- standardizes column names
- keeps the useful modeling columns
- converts values to numeric
- removes duplicates
- drops rows with missing modeling values
- splits the data chronologically into 80 percent train and 20 percent test
- trains Linear Regression and Random Forest models
- evaluates regression metrics
- exports the Random Forest model

The export cell writes:

- `price_model.joblib`
- `feature_columns.joblib`
- `metadata.json`

### Step 2: Place Artifacts In The Backend

The exported artifacts were placed in:

```text
warehouse-backend/model_artifacts/
```

This gives the inference service a stable artifact contract.

### Step 3: Run The Python Inference Service

The Python service is run separately from NestJS.

Typical local command:

```bash
cd warehouse-backend/ai_inference_service
uvicorn main:APP --host 0.0.0.0 --port 8000
```

The service loads the model once at startup and then serves predictions through `/predict`.

### Step 4: Configure NestJS To Call The Inference Service

NestJS reads:

```text
AI_INFERENCE_URL
AI_INFERENCE_TIMEOUT_MS
```

Defaults:

```text
AI_INFERENCE_URL=http://localhost:8000
AI_INFERENCE_TIMEOUT_MS=1500
```

`AiService.predict()` sends the validated DTO to:

```text
{AI_INFERENCE_URL}/predict
```

If the inference service fails or times out, NestJS returns:

```text
503 Service Unavailable
```

with the message:

```text
Inference service error
```

### Step 5: Expose Manager/Admin Prediction Endpoints

The frontend does not call the Python model directly. It calls the NestJS backend:

```text
GET /ai/price/widget
POST /ai/price/predict
```

This keeps:

- authentication centralized
- role checks centralized
- prediction logging centralized
- Python service internal

### Step 6: Add Frontend Prediction Surfaces

Prediction is visible in:

- `warehouse-frontend/src/components/PriceForecastWidget.tsx`
- `warehouse-frontend/src/components/PredictionDashboard.tsx`
- `warehouse-frontend/app/admin/pred-dashboard/page.tsx`
- `warehouse-frontend/app/manager/pred-dashboard/page.tsx`

The frontend provides:

- dashboard forecast card
- previous price comparison
- delta and percentage change
- trend label: up, down, or flat
- model version
- prediction timestamp
- scenario form
- chart and trend visualization

The user-facing unit is standardized as:

```text
TND per 1L olive oil bottle
```

### Step 7: Scenario Input Handling

The model v1 still expects six features, including `cost` and `revenue`.

However, those values are not human-friendly scenario inputs because the user is trying to predict price. So the frontend currently asks only for:

- year
- month
- stock
- quantity sold

Then it estimates:

- `cost`
- `revenue`

before sending the payload to the backend.

Current frontend logic:

- estimated cost = reference bottle price x `0.63`
- estimated revenue = reference bottle price x `quantity_sold`

This keeps the model contract intact while making the interface easier for managers and admins.

### Step 8: Widget Forecast Strategy

`GET /ai/price/widget` builds a quick dashboard forecast.

It:

- uses the latest product price as `previousPrice`
- creates a current-period prediction payload
- calls the same prediction path
- computes:
  - `delta`
  - `deltaPercent`
  - `trend`
  - `modelVersion`
  - `predictedAt`

This endpoint is designed for dashboard display rather than deep model experimentation.

## Operational Notes

### Strengths

- The Python model remains in its native scikit-learn/joblib format.
- NestJS keeps authentication, authorization, logging, and API consistency.
- The inference service is isolated and can be restarted or upgraded independently.
- The frontend does not need to know how the model is loaded.
- Prediction logs provide auditability.

### Limitations

- Model v1 depends on `cost` and `revenue`, which are estimated in the UI for scenario runs.
- The model predicts a price value only, not a confidence interval.
- The Python inference service must be running for prediction endpoints to work.
- Assistant context and assistant metrics are stored in memory, so they reset on backend restart.
- The optional Grok normalizer depends on external configuration and should not be treated as required for core assistant behavior.

### Suggested Future Improvements

- Add confidence intervals or prediction bands.
- Add model drift monitoring using actual future prices.
- Store assistant metrics persistently instead of in memory.
- Add versioned model folders such as `v1`, `v2`, and an active model pointer.
- Improve the widget feature strategy with real operational stock and sales aggregates instead of zero-default widget inputs.
- Add an inference service deployment health check to the admin dashboard.
