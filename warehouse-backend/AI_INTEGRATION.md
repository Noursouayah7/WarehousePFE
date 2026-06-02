# AI Integration Quick Start & Smoke Tests

Run the Python inference service and the Nest backend, then use these commands to verify integration.

1) Start inference service

```powershell
cd warehouse-backend\ai_inference_service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:APP --host 0.0.0.0 --port 8000
```

2) Start backend (in separate shell)

```powershell
cd warehouse-backend
# ensure DATABASE_URL is set if you want logging to work
npm run start:dev
```

3) Smoke: inference service

```powershell
curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d "{`"year`":2026,`"month`":7,`"cost`":13.2,`"revenue`":3520,`"stock`":410,`"quantity_sold`":220}"
curl http://localhost:8000/health
```

4) Smoke: backend endpoints (requires valid JWT)

```powershell
# replace <TOKEN> with a valid JWT for an ADMIN or MANAGER user
curl -X POST http://localhost:3001/ai/price/predict -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{`"year`":2026,`"month`":7,`"cost`":13.2,`"revenue`":3520,`"stock`":410,`"quantity_sold`":220}"
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3001/ai/price/widget
curl http://localhost:3001/ai/price/health
```

Notes:
- If you want logging to persist, set `DATABASE_URL` and run Prisma migrations after adding the `PricePredictionLog` model.
- The inference service expects artifacts in `warehouse-backend/model_artifacts/` by default. Override with `MODEL_ARTIFACTS_PATH`.
