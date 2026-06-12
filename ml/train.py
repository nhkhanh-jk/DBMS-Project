"""
train.py — TNC Cinema: Train mô hình dự đoán lượng vé bán

Quy trình:
  1. Kết nối Neon PostgreSQL, lấy data showtimes + movies + reviews
  2. Feature engineering
  3. Train Random Forest Regressor
  4. Đánh giá model (MAE, RMSE, R²)
  5. Lưu model ra model.pkl
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "feature_config.json")


# ─── 1. LOAD DATA FROM POSTGRESQL ────────────────────────────────────────────

def load_data():
    """Kéo data từ Neon PostgreSQL."""
    print("📦 Đang kết nối Neon PostgreSQL...")
    # Chuyển postgres:// → postgresql+psycopg:// cho SQLAlchemy + psycopg3
    db_url = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")
    engine = create_engine(db_url, connect_args={"sslmode": "require"})

    query = """
        SELECT
            s.id                AS showtime_id,
            s."startTime"       AS start_time,
            s."basePrice"       AS base_price,
            s."bookedSeats"     AS booked_seats_json,
            s.status            AS showtime_status,
            m."durationMin"     AS duration_min,
            m.genres            AS genres_json,
            COALESCE(r.avg_rating, 0)   AS avg_rating,
            COALESCE(r.review_count, 0) AS review_count,
            COALESCE(b.ticket_count, 0) AS actual_ticket_count
        FROM showtimes s
        JOIN movies m ON s."movieId" = m.id
        LEFT JOIN (
            SELECT "movieId",
                   AVG(rating)  AS avg_rating,
                   COUNT(*)     AS review_count
            FROM reviews
            GROUP BY "movieId"
        ) r ON r."movieId" = m.id
        LEFT JOIN (
            SELECT "showtimeId",
                   SUM(jsonb_array_length(tickets)) AS ticket_count
            FROM bookings
            GROUP BY "showtimeId"
        ) b ON b."showtimeId" = s.id
        ORDER BY s."startTime"
    """

    with engine.connect() as conn:
        df = pd.read_sql_query(text(query), conn)
    print(f"✅ Đã load {len(df)} suất chiếu")
    return df


# ─── 2. FEATURE ENGINEERING ──────────────────────────────────────────────────

def parse_booked_count(booked_seats_json):
    """Đếm số ghế đã đặt từ JSONB array."""
    if booked_seats_json is None:
        return 0
    try:
        seats = booked_seats_json if isinstance(booked_seats_json, list) else json.loads(booked_seats_json)
        return len([s for s in seats if s.get("status") == "BOOKED"])
    except Exception:
        return 0


def parse_genres(genres_json):
    """Lấy danh sách thể loại từ JSONB."""
    if genres_json is None:
        return []
    try:
        genres = genres_json if isinstance(genres_json, list) else json.loads(genres_json)
        return genres
    except Exception:
        return []


def engineer_features(df):
    """Tạo features từ raw data."""
    print("⚙️  Đang tạo features...")

    # Target: số vé thực tế bán được (từ bảng bookings)
    df["booked_count"] = df["actual_ticket_count"].fillna(0).astype(int)
    # Fallback: nếu không có booking, dùng bookedSeats trong showtime
    mask_zero = df["booked_count"] == 0
    df.loc[mask_zero, "booked_count"] = df.loc[mask_zero, "booked_seats_json"].apply(parse_booked_count)

    # Time features
    df["start_time"] = pd.to_datetime(df["start_time"])
    df["day_of_week"] = df["start_time"].dt.dayofweek   # 0=Mon, 6=Sun
    df["hour_of_day"] = df["start_time"].dt.hour
    df["is_weekend"]  = (df["day_of_week"] >= 5).astype(int)
    df["is_evening"]  = (df["hour_of_day"] >= 17).astype(int)
    df["is_morning"]  = (df["hour_of_day"] <= 11).astype(int)
    df["month"]       = df["start_time"].dt.month

    # Price features
    df["base_price"] = df["base_price"].fillna(70000).astype(float)
    df["price_tier"] = pd.cut(
        df["base_price"],
        bins=[0, 60000, 80000, 100000, float("inf")],
        labels=[0, 1, 2, 3]
    ).astype(int)

    # Movie features
    df["duration_min"] = df["duration_min"].fillna(100).astype(float)
    df["avg_rating"]   = df["avg_rating"].fillna(0).astype(float)
    df["review_count"] = df["review_count"].fillna(0).astype(float)

    # Genre one-hot encoding
    all_genres_raw = df["genres_json"].apply(parse_genres).tolist()
    all_genre_values = sorted(set(g for genres in all_genres_raw for g in genres))
    print(f"   Genres tìm thấy: {all_genre_values}")

    for genre in all_genre_values:
        col = f"genre_{genre.lower().replace(' ', '_').replace('-', '_')}"
        df[col] = df["genres_json"].apply(
            lambda g: 1 if genre in parse_genres(g) else 0
        )

    genre_cols = [c for c in df.columns if c.startswith("genre_")]

    feature_cols = [
        "day_of_week", "hour_of_day", "is_weekend", "is_evening",
        "is_morning", "month", "base_price", "price_tier",
        "duration_min", "avg_rating", "review_count",
    ] + genre_cols

    print(f"✅ Tổng {len(feature_cols)} features: {feature_cols}")
    return df, feature_cols, all_genre_values


# ─── 3. TRAIN MODEL ──────────────────────────────────────────────────────────

def train(df, feature_cols):
    """Train Random Forest model."""
    print("\n🤖 Đang train model...")

    X = df[feature_cols].fillna(0)
    y = df["booked_count"]

    print(f"   Dataset: {len(X)} samples | Target range: {y.min():.0f} – {y.max():.0f} vé")
    print(f"   Trung bình vé/suất: {y.mean():.1f} | Std: {y.std():.1f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)

    print(f"\n📊 KẾT QUẢ ĐÁNH GIÁ MODEL:")
    print(f"   MAE  (sai số trung bình): {mae:.2f} vé")
    print(f"   RMSE (root mean sq err):  {rmse:.2f} vé")
    print(f"   R²   (độ giải thích):     {r2:.4f}  ({r2*100:.1f}%)")

    # Feature importance
    importances = pd.Series(model.feature_importances_, index=feature_cols)
    importances = importances.sort_values(ascending=False)
    print(f"\n🔑 TOP 10 FEATURES QUAN TRỌNG NHẤT:")
    for feat, imp in importances.head(10).items():
        bar = "█" * int(imp * 50)
        print(f"   {feat:<30} {bar} {imp:.4f}")

    return model


# ─── 4. SAVE MODEL ───────────────────────────────────────────────────────────

def save_model(model, feature_cols, genre_values):
    """Lưu model và config ra file."""
    joblib.dump(model, MODEL_PATH)
    print(f"\n💾 Đã lưu model → {MODEL_PATH}")

    config = {
        "feature_cols": feature_cols,
        "genre_values": genre_values,
        "model_type": "RandomForestRegressor",
        "version": "1.0"
    }
    with open(FEATURES_PATH, "w") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    print(f"💾 Đã lưu feature config → {FEATURES_PATH}")


# ─── MAIN ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  TNC Cinema – ML Model Training")
    print("  Dự đoán số vé bán theo suất chiếu")
    print("=" * 60)

    df = load_data()
    df, feature_cols, genre_values = engineer_features(df)
    model = train(df, feature_cols)
    save_model(model, feature_cols, genre_values)

    print("\n✅ Training hoàn tất! Chạy 'python api.py' để khởi động server.")
