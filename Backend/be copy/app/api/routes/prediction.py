import os
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal, Optional
from datetime import datetime
from app.db.base import get_db
from app.services.prediction import predict_with_model, predict_and_generate_histograms


# Security setup
security = HTTPBearer()

# Setting up a simple logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    filename="invalid_data.log",
    filemode="a",
    format="%(asctime)s - %(message)s",
    level=logging.INFO
)

router = APIRouter()

MODEL_MAP = {
    "GB": "GB_model_for_website.joblib",
    "KNN": "KNN_model_for_website.joblib",
    "LR": "LR_model_for_website.joblib",
    "NN": "NN_model_for_website.h5",
    "RF": "RF_model_for_website.joblib"
}

@router.get("/predict")
async def predict(
    code: Literal["GB", "KNN", "LR", "NN", "RF"] = Query(..., description="Model code"),
    from_date: Optional[datetime] = Query(None, description="From date (YYYY-MM-DD)"),
    to_date: Optional[datetime] = Query(None, description="To date (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    # if code == "NN":
    #     raise HTTPException(status_code=501, detail="NN model temporarily unavailable.")

    # Validate date range
    if from_date and to_date:
        if from_date > to_date:
            raise HTTPException(status_code=400, detail="from_date must be before to_date")

    model_filename = MODEL_MAP.get(code.upper())
    if not os.path.exists(f"models/{model_filename}"):
        raise HTTPException(status_code=500, detail="Model file not found")

    try:
        result = await predict_with_model(f"models/{model_filename}", db, from_date, to_date)
        return {
            "model": code,
            "date_range": {
                "from": from_date.isoformat() if from_date else None,
                "to": to_date.isoformat() if to_date else None
            },
            # "count": len(predictions),
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/histogram")
async def get_histogram_data(
    code: Literal["GB", "KNN", "LR", "NN", "RF"] = Query(..., description="Model code"),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=400, detail="from_date must be before to_date")

    model_filename = MODEL_MAP.get(code.upper())
    if not model_filename or not os.path.exists(f"models/{model_filename}"):
        raise HTTPException(status_code=500, detail="Model file not found")

    try:
        image_path = await predict_and_generate_histograms(f"models/{model_filename}", db, from_date, to_date)

        if not image_path:
            raise HTTPException(status_code=404, detail="No data found for the given range")

        return {
            "model": code,
            "date_range": {
                "from": from_date.isoformat() if from_date else None,
                "to": to_date.isoformat() if to_date else None
            },
            "image_path": image_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

