# ADR 0001: Selection of Neon Serverless PostgreSQL with pgvector

## Status
Accepted

## Context
UNNATI requires a high-performance relational database capable of storing user profiles, academic records, and canonical skill taxonomies, alongside high-dimensional vector embeddings for semantic skill matching and RAG career companion queries. We evaluated standalone PostgreSQL, Supabase, Neon, and external vector databases (Pinecone/Milvus).

## Decision
We chose **Neon Serverless PostgreSQL** with the `pgvector` and `pgcrypto` extensions enabled:
1. **Serverless Scaling:** Instant scale-to-zero compute with automated branching (`main`, `staging`, `dev-*`) for safe schema migration testing.
2. **Built-in Connection Pooling:** Integrated PgBouncer pooler on port 6543 handles high-concurrency serverless traffic without exhausting connections.
3. **Integrated pgvector:** Allows storing 768-dimensional Google Gemini embeddings in native `vector(768)` columns with HNSW indexing, eliminating the operational complexity and network latency of an external vector store.

## Consequences
- Requires dual connection strings: `DATABASE_URL` (pooled, port 6543) for runtime API queries, and `DATABASE_DIRECT_URL` (direct, port 5432) for Alembic DDL migrations.
- High availability and automated PITR point-in-time recovery are handled natively by Neon AWS infrastructure.

