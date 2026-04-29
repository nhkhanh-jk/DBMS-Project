import os

from celery import Celery

broker_url = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
backend_url = os.getenv("CELERY_RESULT_BACKEND", broker_url)

celery_app = Celery("dbms_bao_backend", broker=broker_url, backend=backend_url)
celery_app.conf.timezone = "Asia/Ho_Chi_Minh"
celery_app.conf.beat_schedule = {
    "update-showtime-status-every-minute": {
        "task": "workers.tasks.update_showtime_status",
        "schedule": 60.0,
    }
}

celery_app.autodiscover_tasks(["workers"])

