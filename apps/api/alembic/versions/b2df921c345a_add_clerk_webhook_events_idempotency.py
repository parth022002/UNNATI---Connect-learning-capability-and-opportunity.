"""add clerk_webhook_events for idempotency

Revision ID: b2df921c345a
Revises: a1cf919bc246
Create Date: 2026-11-10 17:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b2df921c345a'
down_revision: Union[str, None] = 'a1cf919bc246'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'clerk_webhook_events',
        sa.Column('event_id', sa.String(length=255), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('event_id')
    )

def downgrade() -> None:
    op.drop_table('clerk_webhook_events')

