# Background worker

Use Celery for long-running or asynchronous tasks:
- PDF/DOCX ingestion and parsing
- OCR and table extraction
- Embedding generation
- Knowledge graph updates
- Roadmap generation
- Batch assessment and analytics jobs

Keep tasks idempotent, observable and retry-safe. Do not process untrusted documents without file validation, size limits and malware scanning.
