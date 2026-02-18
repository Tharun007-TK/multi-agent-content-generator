"""
dashboard_service.py
Aggregates data from campaigns and audit_logs for the Dashboard page.
"""
from sqlmodel import Session, select, func
from app.database.models.campaigns import Campaign
from app.database.models.exports import Export
from app.database.models.base import AuditLog
from app.schemas.dashboard_schemas import (
    DashboardStats, ExportCountByChannel, RecentActivity,
    PipelineHistoryResponse, PipelineRun,
)


def get_dashboard_stats(db: Session) -> DashboardStats:
    total_campaigns = db.exec(select(func.count()).select_from(Campaign)).one()

    # Exports grouped by channel
    rows = db.exec(
        select(Export.channel, func.count().label("cnt")).group_by(Export.channel)
    ).all()
    exports_by_channel = [ExportCountByChannel(channel=r[0], count=r[1]) for r in rows]

    # Last 10 audit log entries
    recent = db.exec(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10)
    ).all()
    recent_activity = [
        RecentActivity(
            id=log.id,
            timestamp=log.timestamp,
            action=log.action,
            channel=log.channel,
            summary=log.input_text[:120],
        )
        for log in recent
    ]

    return DashboardStats(
        total_campaigns=total_campaigns,
        exports_by_channel=exports_by_channel,
        recent_activity=recent_activity,
    )


def get_pipeline_history(db: Session, limit: int = 50) -> PipelineHistoryResponse:
    campaigns = db.exec(
        select(Campaign).order_by(Campaign.created_at.desc()).limit(limit)
    ).all()

    runs = [
        PipelineRun(
            id=c.id,
            timestamp=c.created_at,
            intent=c.intent,
            icp_id=c.icp_id or "",
            channel=c.channel,
            platform=c.platform,
            priority_score=c.priority_score,
        )
        for c in campaigns
    ]
    return PipelineHistoryResponse(runs=runs, total=len(runs))
