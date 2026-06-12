"""
api.py — TNC Cinema: FastAPI ML Prediction Server

Endpoints:
  POST /predict   — dự đoán số vé bán cho 1 suất chiếu
  GET  /analytics — thống kê tổng quan từ DB
  GET  /health    — health check
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ML_PORT = int(os.getenv("ML_PORT", 8000))
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "feature_config.json")

app = FastAPI(
    title="TNC Cinema – ML Prediction API",
    description="Dự đoán lượng vé bán và phân tích dữ liệu rạp phim",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Model ──────────────────────────────────────────────────────────────

model = None
feature_config = None

def load_model():
    global model, feature_config
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            "Model chưa được train! Hãy chạy 'python train.py' trước."
        )
    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, "r") as f:
        feature_config = json.load(f)
    print(f"✅ Đã load model ({feature_config['model_type']} v{feature_config['version']})")

try:
    load_model()
except Exception as e:
    print(f"⚠️  {e}")


# ─── Schemas ─────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    start_time: str = Field(..., example="2026-06-15T19:00:00", description="Thời gian bắt đầu (ISO format)")
    base_price: float = Field(..., example=70000, description="Giá vé cơ bản (VND)")
    duration_min: int = Field(..., example=120, description="Thời lượng phim (phút)")
    genres: List[str] = Field(default=[], example=["Phim Hành Động", "Phim Gây Cấn"], description="Thể loại phim")
    avg_rating: float = Field(default=0.0, example=4.2, description="Rating trung bình phim (0-5)")
    review_count: int = Field(default=0, example=150, description="Số lượng reviews")

class PredictResponse(BaseModel):
    predicted_tickets: int
    confidence_range: List[int]
    features_used: dict
    advice: str

class AnalyticsResponse(BaseModel):
    top_hours: list
    top_genres: list
    avg_tickets_by_day: list
    avg_tickets_by_hour: list
    overall_stats: dict


# ─── Helper: build feature vector ────────────────────────────────────────────

def build_feature_vector(req: PredictRequest) -> pd.DataFrame:
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model chưa sẵn sàng. Chạy 'python train.py' trước."
        )

    dt = datetime.fromisoformat(req.start_time.replace("Z", ""))
    dow = dt.weekday()   # 0=Mon, 6=Sun
    hour = dt.hour
    month = dt.month

    row = {
        "day_of_week":  dow,
        "hour_of_day":  hour,
        "is_weekend":   1 if dow >= 5 else 0,
        "is_evening":   1 if hour >= 17 else 0,
        "is_morning":   1 if hour <= 11 else 0,
        "month":        month,
        "base_price":   req.base_price,
        "price_tier":   0 if req.base_price < 60000 else (1 if req.base_price < 80000 else (2 if req.base_price < 100000 else 3)),
        "duration_min": req.duration_min,
        "avg_rating":   req.avg_rating,
        "review_count": req.review_count,
    }

    # Genre features
    genre_values = feature_config.get("genre_values", [])
    for genre in genre_values:
        col = f"genre_{genre.lower().replace(' ', '_').replace('-', '_')}"
        row[col] = 1 if genre in req.genres else 0

    # Ensure column order matches training
    feature_cols = feature_config["feature_cols"]
    df = pd.DataFrame([row])
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_cols].fillna(0)

    return df, row


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_type": feature_config["model_type"] if feature_config else None,
        "version": feature_config["version"] if feature_config else None,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Dự đoán số vé bán cho một suất chiếu."""
    df, raw_row = build_feature_vector(req)

    predicted = float(model.predict(df)[0])
    predicted = max(0, predicted)
    predicted_int = round(predicted)

    # Confidence range ±15% (dựa trên std của cây trong forest)
    predictions_all = np.array([tree.predict(df)[0] for tree in model.estimators_])
    std = predictions_all.std()
    low  = max(0, round(predicted - std))
    high = round(predicted + std)

    # Advice
    if predicted_int >= 40:
        advice = "🔥 Suất chiếu dự kiến rất đông — nên mở phòng lớn hoặc thêm suất!"
    elif predicted_int >= 20:
        advice = "✅ Suất chiếu bình thường — phòng vừa phù hợp."
    elif predicted_int >= 10:
        advice = "⚠️ Lượng khách ít — có thể cân nhắc giảm giá hoặc gộp suất."
    else:
        advice = "❌ Suất chiếu dự kiến rất vắng — nên xem xét hủy hoặc thay thế phim."

    return {
        "predicted_tickets": predicted_int,
        "confidence_range": [low, high],
        "features_used": {
            "day_of_week": raw_row["day_of_week"],
            "hour_of_day": raw_row["hour_of_day"],
            "is_weekend": raw_row["is_weekend"],
            "is_evening": raw_row["is_evening"],
            "base_price": req.base_price,
            "duration_min": req.duration_min,
            "genres": req.genres,
            "avg_rating": req.avg_rating,
        },
        "advice": advice,
    }


@app.get("/analytics", response_model=AnalyticsResponse)
def analytics():
    """Thống kê tổng quan từ dữ liệu thực tế trong DB."""
    db_url = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
    engine = create_engine(db_url, connect_args={"sslmode": "require"})

    query = """
        SELECT
            s."startTime"    AS start_time,
            s."basePrice"    AS base_price,
            s."bookedSeats"  AS booked_seats_json,
            m.genres         AS genres_json
        FROM showtimes s
        JOIN movies m ON s."movieId" = m.id
        WHERE s.status IN ('COMPLETED', 'ONGOING')
    """
    with engine.connect() as conn:
        df = pd.read_sql_query(text(query), conn)

    # Parse booked count
    def count_booked(seats):
        if seats is None:
            return 0
        seats = seats if isinstance(seats, list) else json.loads(seats)
        return len([s for s in seats if s.get("status") == "BOOKED"])

    def get_genres(g):
        if g is None: return []
        return g if isinstance(g, list) else json.loads(g)

    df["booked_count"] = df["booked_seats_json"].apply(count_booked)
    df["start_time"]   = pd.to_datetime(df["start_time"])
    df["hour"]         = df["start_time"].dt.hour
    df["dow"]          = df["start_time"].dt.dayofweek
    day_names          = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

    # Top giờ chiếu có nhiều vé nhất
    top_hours = (
        df.groupby("hour")["booked_count"]
        .mean()
        .sort_values(ascending=False)
        .head(5)
        .reset_index()
        .rename(columns={"hour": "hour", "booked_count": "avg_tickets"})
        .to_dict("records")
    )

    # Trung bình vé theo ngày
    avg_by_day = (
        df.groupby("dow")["booked_count"]
        .mean()
        .reset_index()
        .rename(columns={"dow": "day_index", "booked_count": "avg_tickets"})
    )
    avg_by_day["day_name"] = avg_by_day["day_index"].apply(lambda d: day_names[d])
    avg_by_day["avg_tickets"] = avg_by_day["avg_tickets"].round(1)

    # Trung bình vé theo giờ
    avg_by_hour = (
        df.groupby("hour")["booked_count"]
        .mean()
        .reset_index()
        .rename(columns={"hour": "hour", "booked_count": "avg_tickets"})
    )
    avg_by_hour["avg_tickets"] = avg_by_hour["avg_tickets"].round(1)

    # Genre phổ biến nhất (theo lượng vé bán)
    genre_rows = []
    for _, row in df.iterrows():
        for g in get_genres(row["genres_json"]):
            genre_rows.append({"genre": g, "booked": row["booked_count"]})
    if genre_rows:
        gdf = pd.DataFrame(genre_rows)
        top_genres = (
            gdf.groupby("genre")["booked"]
            .agg(["mean", "sum", "count"])
            .reset_index()
            .rename(columns={"mean": "avg_tickets", "sum": "total_tickets", "count": "showtime_count"})
            .sort_values("avg_tickets", ascending=False)
            .head(8)
            .round(1)
            .to_dict("records")
        )
    else:
        top_genres = []

    overall_stats = {
        "total_showtimes_analyzed": int(len(df)),
        "avg_tickets_per_showtime": round(float(df["booked_count"].mean()), 1),
        "max_tickets_in_showtime":  int(df["booked_count"].max()),
        "total_tickets_sold":       int(df["booked_count"].sum()),
        "peak_hour": int(df.groupby("hour")["booked_count"].mean().idxmax()),
        "peak_day":  day_names[int(df.groupby("dow")["booked_count"].mean().idxmax())],
    }

    return {
        "top_hours": [{"hour": int(r["hour"]), "avg_tickets": round(float(r["avg_tickets"]), 1)} for r in top_hours],
        "top_genres": top_genres,
        "avg_tickets_by_day": avg_by_day.to_dict("records"),
        "avg_tickets_by_hour": [{"hour": int(r["hour"]), "avg_tickets": float(r["avg_tickets"])} for r in avg_by_hour.to_dict("records")],
        "overall_stats": overall_stats,
    }


@app.get("/feature-importance")
def feature_importance():
    """Xem độ quan trọng của từng feature."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model chưa load")
    feature_cols = feature_config["feature_cols"]
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))
    sorted_imp = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    return {"feature_importances": sorted_imp}


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=ML_PORT, reload=True)
