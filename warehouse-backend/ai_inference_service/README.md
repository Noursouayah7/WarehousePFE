# AI Inference Service

Simple FastAPI-based inference service to load `joblib` artifacts from the repository and expose `/predict` and `/health` endpoints.

Usage:

1. Install deps:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Run locally:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

By default the service expects artifacts in `../model_artifacts/` relative to this folder. You can override with `MODEL_ARTIFACTS_PATH` env var.
