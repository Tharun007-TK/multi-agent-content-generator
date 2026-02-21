from pydantic import BaseModel
from typing import List
from datetime import datetime


# ── Dashboard ──────────────────────────────────────────────────────────────────
class ExportCountByChannel(BaseModel):
    channel: str
    count: int


class RecentActivity(BaseModel):
    id: int
    timestamp: datetime
    action: str
    channel: str
    summary: str


class DashboardStats(BaseModel):
    total_campaigns: int
    exports_by_channel: List[ExportCountByChannel]
    recent_activity: List[RecentActivity]


# ── Pipeline History ───────────────────────────────────────────────────────────
class PipelineRun(BaseModel):
    id: int
    timestamp: datetime
    intent: str
    icp_id: str
    channel: str
    platform: str
    priority_score: float


class PipelineHistoryResponse(BaseModel):
    runs: List[PipelineRun]
    total: int


# ── Activity (export logs) ─────────────────────────────────────────────────────
class ActivityEntry(BaseModel):
    id: int
    timestamp: datetime
    channel: str       # linkedin | email | call
    status: str
    destination: str


class ActivityResponse(BaseModel):
    entries: List[ActivityEntry]
    total: int

# ── Call Queue ────────────────────────────────────────────────────────────────
class CallQueueItem(BaseModel):
    id: int
    created_at: datetime
    lead_name: str
    phone: str
    script: str
    priority: int
    status: str


class CallQueueResponse(BaseModel):
    calls: List[CallQueueItem]
    total: int
