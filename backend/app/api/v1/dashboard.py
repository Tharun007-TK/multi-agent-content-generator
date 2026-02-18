"""
dashboard.py  –  GET /api/v1/dashboard/*
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database.session import get_session
from app.schemas.dashboard_schemas import DashboardStats, PipelineHistoryResponse, ActivityResponse
from app.services.dashboard_service import get_dashboard_stats, get_pipeline_history
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
