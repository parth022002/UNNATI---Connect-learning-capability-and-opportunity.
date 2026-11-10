"""add audit_events table and enable row level security

Revision ID: c3ef841d912b
Revises: b2df921c345a
Create Date: 2026-11-10 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c3ef841d912b'
down_revision: Union[str, None] = 'b2df921c345a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create audit_events table (DB-009)
    op.create_table(
        'audit_events',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('actor_ip', sa.String(length=45), nullable=True),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('payload_hash', sa.String(length=64), nullable=False),
        sa.Column('previous_hash', sa.String(length=64), nullable=False),
        sa.Column('current_hash', sa.String(length=64), nullable=False),
        sa.Column('signature', sa.String(length=256), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('current_hash')
    )
    op.create_index('ix_audit_events_event_type', 'audit_events', ['event_type'])
    op.create_index('ix_audit_events_user_id', 'audit_events', ['user_id'])
    op.create_index('ix_audit_events_created_at', 'audit_events', ['created_at'])

    # 2. Row-Level Security (RLS) Enablement (DB-003)
    # Enable RLS on sensitive candidate tables
    candidate_tables = [
        'user_profiles',
        'education_records',
        'experience_records',
        'candidate_documents',
        'candidate_skills',
        'career_roadmaps'
    ]
    for table in candidate_tables:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
        # Create default tenant isolation policy for session role
        op.execute(f"""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = '{table}' AND policyname = '{table}_tenant_isolation'
                ) THEN
                    CREATE POLICY {table}_tenant_isolation ON {table}
                        FOR ALL
                        USING (
                            current_setting('app.current_user_id', true) IS NULL
                            OR user_id::text = current_setting('app.current_user_id', true)
                        );
                END IF;
            END
            $$;
        """)

def downgrade() -> None:
    candidate_tables = [
        'user_profiles',
        'education_records',
        'experience_records',
        'candidate_documents',
        'candidate_skills',
        'career_roadmaps'
    ]
    for table in candidate_tables:
        op.execute(f"DROP POLICY IF EXISTS {table}_tenant_isolation ON {table};")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")

    op.drop_table('audit_events')

