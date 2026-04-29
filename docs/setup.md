# Setup Guide

## 1) Environment
Update `.env` if needed:
- `MONGO_URI` can be Atlas URI or local Mongo URI.
- `JWT_SECRET_KEY` and `SECRET_KEY` should be changed in production.

## 2) Run with Docker Compose
From `DBMS-bao-backend`:
```bash
docker-compose up --build
```

Services:
- API: `http://localhost:5000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- Celery worker and beat run in separate containers.

## 3) Run without Docker (optional)
```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

Run Celery:
```bash
celery -A workers.celery_app.celery_app worker -l info
celery -A workers.celery_app.celery_app beat -l info
```

