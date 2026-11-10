# Security and privacy baseline

- Keep secrets in environment variables or a managed secret store; never commit credentials.
- Validate upload MIME type, extension, file size and content; scan files before processing.
- Store uploaded files in private buckets and use short-lived signed URLs.
- Enforce authentication and role-based authorization on every protected API.
- Apply least privilege to database, storage and third-party credentials.
- Encrypt traffic in transit and use managed encryption at rest.
- Record consent, retention and deletion events.
- Minimise personal data in logs; never log document contents or secrets.
- Add rate limits, abuse protection, audit trails and backup/restore procedures.
- Complete a privacy and security review before handling real student or candidate data.
