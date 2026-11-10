from celery_app import celery_app

@celery_app.task(name="unnati.ping")
def ping():
    return {"status": "ok", "task": "unnati.ping"}
