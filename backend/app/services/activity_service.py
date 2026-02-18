"""
activity_service.py
Reads export log entries, with optional channel filter.
"""
from typing import Optional
from sqlmodel import Session, select
from app.database.models.exports import Export
from app.schemas.dashboard_schemas import ActivityEntry, ActivityResponse


def get_activity(
    db: Session,
    channel: Optional[str] = None,
    limit: int = 100,
) -> ActivityResponse:
    query = select(Export).order_by(Export.created_at.desc()).limit(limit)
    if channel:
        query = select(Export).where(Export.channel == channel).order_by(Export.created_at.desc()).limit(limit)

    rows = db.exec(query).all()
    entries = [
        ActivityEntry(
            id=r.id,
            timestamp=r.created_at,
            channel=r.channel,
            status=r.status,
            destination=r.destination or "",
        )
        for r in rows
    ]
    return ActivityResponse(entries=entries, total=len(entries))
