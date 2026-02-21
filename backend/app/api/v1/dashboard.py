"""
dashboard.py  –  GET /api/v1/dashboard/*
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database.session import get_session
from app.schemas.dashboard_schemas import (
    DashboardStats, PipelineHistoryResponse, ActivityResponse,
    CallQueueResponse,
)
from app.services.dashboard_service import (
    get_dashboard_stats, get_pipeline_history,
    get_call_queue, update_call_status,
)
from app.services.activity_service import get_activity

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_session)):
    return get_dashboard_stats(db)


@router.get("/pipelines", response_model=PipelineHistoryResponse)
def pipeline_history(limit: int = 50, db: Session = Depends(get_session)):
    return get_pipeline_history(db, limit=limit)


@router.get("/activity", response_model=ActivityResponse)
def activity_log(channel: Optional[str] = None, limit: int = 100, db: Session = Depends(get_session)):
    return get_activity(db, channel=channel, limit=limit)



@router.get("/call-queue", response_model=CallQueueResponse)
def call_queue(db: Session = Depends(get_session)):
    return get_call_queue(db)


@router.patch("/call-queue/{call_id}")
def update_call(call_id: int, status: str, db: Session = Depends(get_session)):
    updated = update_call_status(db, call_id, status)
    if not updated:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Call not found")
    return updated
