# ADR 0005: Private Candidate Document Storage via Cloudflare R2

## Status
Accepted

## Context
Candidates upload confidential resumes and academic transcripts. These files must be stored securely with zero public internet access, low latency, and zero egress fees, while supporting presigned upload and download URLs.

## Decision
We selected **Cloudflare R2** with standard S3 API compatibility (`boto3`):
1. **Zero Egress Fees:** Cloudflare R2 does not charge bandwidth or egress fees for retrieving uploaded resumes.
2. **Private S3-Compatible Bucket:** Bucket `unnati-private-documents` configured with `public_access = false`.
3. **Presigned URL Architecture:** Presigned PUT URLs (900s TTL) allow direct browser-to-bucket uploads, offloading file transport from the API server.
4. **Statutory Crypto-Shredding:** Supports programmatic, permanent object deletion for DPDP Act Section 12 compliance.

## Consequences
- Requires valid AWS/R2 S3 access keys in Render backend environment.
- Graceful fallback to local secure storage if S3 credentials are not configured.
