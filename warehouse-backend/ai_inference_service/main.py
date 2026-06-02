import os
import json
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib


APP = FastAPI(title="AI Inference Service")


class PredictRequest(BaseModel):
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    cost: float = Field(..., ge=0)
    revenue: float = Field(..., ge=0)
    stock: float = Field(..., ge=0)
    quantity_sold: float = Field(..., ge=0)


class PredictResponse(BaseModel):
    predictedPrice: float
    modelName: str
    modelVersion: str


def load_artifacts(artifacts_path: Path):
    model_file = artifacts_path / "price_model.joblib"
    cols_file = artifacts_path / "feature_columns.joblib"
    meta_file = artifacts_path / "metadata.json"

    if not model_file.exists() or not cols_file.exists() or not meta_file.exists():
        missing = [p.name for p in (model_file, cols_file, meta_file) if not p.exists()]
        raise RuntimeError(f"Missing artifact(s): {missing}")

    model = joblib.load(model_file)
    feature_columns = joblib.load(cols_file)
    with open(meta_file, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    if not isinstance(feature_columns, list):
        raise RuntimeError("feature_columns.joblib must contain a list of feature names")

    return model, feature_columns, metadata


ARTIFACTS_PATH = Path(os.environ.get("MODEL_ARTIFACTS_PATH", Path(__file__).resolve().parents[1] / "model_artifacts"))

try:
    MODEL, FEATURE_COLUMNS, METADATA = load_artifacts(ARTIFACTS_PATH)
    MODEL_LOADED = True
except Exception as e:
    MODEL = None
    FEATURE_COLUMNS = []
    METADATA = {}
    MODEL_LOADED = False
    LOAD_ERROR = str(e)


@APP.get("/health")
def health():
    return {
        "status": "ok" if MODEL_LOADED else "error",
        "modelLoaded": MODEL_LOADED,
        "error": LOAD_ERROR if not MODEL_LOADED else None,
        "version": METADATA.get("version") if METADATA else None,
    }


@APP.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded: " + LOAD_ERROR)

    # Build feature vector in the exact order from FEATURE_COLUMNS
    input_map = req.dict()
    try:
        vector = [float(input_map[col]) for col in FEATURE_COLUMNS]
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing required feature: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid feature values: {e}")

    try:
        pred = MODEL.predict([vector])
        predicted = float(pred[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return {
        "predictedPrice": predicted,
        "modelName": METADATA.get("model" , "unknown"),
        "modelVersion": METADATA.get("version", "unknown"),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:APP", host="0.0.0.0", port=8000, reload=False)
