import os
import logging
from typing import Optional
import pandas as pd
import joblib
import numpy as np
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.db.air_quality_sites import AirQualitySiteDB
from tensorflow.keras.models import load_model as load_keras_model
import matplotlib.pyplot as plt

# Setting up a simple logger
logger = logging.getLogger(__name__)
logging.basicConfig(
    filename="invalid_data.log",
    filemode="a",
    format="%(asctime)s - %(message)s",
    level=logging.INFO
)

def load_model(model_path: str):
    if model_path.endswith(".h5"):
        return load_keras_model(model_path, compile=False)
    return joblib.load(model_path)

async def fetch_latest_data(session: AsyncSession, limit: int = 10):
    result = await session.execute(
        select(AirQualitySiteDB).order_by(AirQualitySiteDB.Date.desc()).limit(limit)
    )
    records = result.scalars().all()
    return pd.DataFrame([{
        "cf1": r.cf1,
        "RH": r.RH,
        "TempC": r.TempC,
        "FM": r.FM
    } for r in records])

async def predict_with_model(model_path: str, db, from_date: Optional[datetime], to_date: Optional[datetime]):
    query = select(AirQualitySiteDB)

    if from_date and to_date:
        query = query.where(
            and_(
                AirQualitySiteDB.Date >= from_date,
                AirQualitySiteDB.Date <= to_date
            )
        )

    result = await db.execute(query)
    records = result.scalars().all()

    if not records:
        return []

    # Convert to DataFrame
    df = pd.DataFrame([{
        "Date": row.Date,
        "cf1": row.cf1,
        "RH": row.RH,
        "TempC": row.TempC,
        "FM": row.FM
    } for row in records])

    features = df[["cf1", "RH", "TempC"]]

    model = load_model(model_path)

    if hasattr(model, "predict"):
        predictions = model.predict(features)
    else:
        raise Exception("Invalid model or prediction method")
    
    df["calibrated"] = predictions

    json_response = df.to_dict(orient="records")

    return json_response


async def predict_and_generate_histograms(model_path: str, db, from_date: Optional[datetime], to_date: Optional[datetime]):
    query = select(AirQualitySiteDB)

    if from_date and to_date:
        query = query.where(
            and_(
                AirQualitySiteDB.Date >= from_date,
                AirQualitySiteDB.Date <= to_date
            )
        )

    result = await db.execute(query)
    records = result.scalars().all()

    if not records:
        return {}

    # Create DataFrame
    df = pd.DataFrame([{
        "cf1": r.cf1,
        "RH": r.RH,
        "TempC": r.TempC,
        "FM": r.FM
    } for r in records])

    # Load model
    model = load_model(model_path)
    if not hasattr(model, "predict"):
        raise Exception("Invalid model or missing predict method")

    # Predict calibrated values
    df["calibrated"] = model.predict(df[["cf1", "RH", "TempC"]])

    # Save the histogram image
    model_code = os.path.splitext(os.path.basename(model_path))[0].split('_')[0]  # Extract model code like "GB"
    image_path = save_histogram_plot(df, model_code) 
    logging.info(f"image path: {image_path}")

    # Generate histograms
    histogram_data = {}
    for col in ["cf1", "RH", "FM", "calibrated"]:
        hist = pd.cut(df[col], bins=10).value_counts().sort_index()
        histogram_data[col] = {
            str(interval): int(count)
            for interval, count in hist.items()
        }

    # return transpose_histogram_data(histogram_data)

    return {
        # "histogram_data": transpose_histogram_data(histogram_data),
        "image_url": f"/static/histograms/{model_code}_histogram.png"
    }

def transpose_histogram_data(histograms: dict) -> list:
    FEATURE_RENAME_MAP = {
        "cf1": "Original PA",
        "FM": "Original FM",
        "calibrated": "Calibrated FM",
        "RH": "RH"
    }

    # Get all unique bins across all features
    all_bins = set()
    for bins in histograms.values():
        all_bins.update(bins.keys())
    sorted_bins = sorted(all_bins)

    transposed = []
    for bin_label in sorted_bins:
        row = {"bin": bin_label}
        for original_feature, bins in histograms.items():
            renamed_key = FEATURE_RENAME_MAP.get(original_feature, original_feature)
            row[renamed_key] = bins.get(bin_label, 0)
        transposed.append(row)

    return transposed

#Save histogram image
def save_histogram_plot(df: pd.DataFrame, model_code: str) -> str:
    plt.figure(figsize=(14, 8), dpi=300)
    plt.hist(df['FM'], bins=30, alpha=0.5, label='Original FM', color='#00008B')
    plt.hist(df['calibrated'], bins=30, alpha=0.5, label='Calibrated FM', color='#8B0000')
    plt.hist(df['cf1'], bins=30, alpha=0.5, label='Original PA', color='#006400')
    plt.xlabel('PM$_{2.5}$', fontsize=18)
    plt.ylabel('Frequency', fontsize=18)
    plt.title(f'Histogram of FM, Calibrated FM, and PA values for {model_code}', fontsize=20)
    plt.legend(fontsize=14)
    plt.xticks(fontsize=12)
    plt.yticks(fontsize=12)
    plt.tight_layout()

    # Save to static directory
    output_dir = "static/histograms"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{model_code}_histogram.png")
    plt.savefig(output_path)
    plt.close()

    return output_path