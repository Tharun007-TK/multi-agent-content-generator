"""
export.py  –  POST /api/v1/export/{linkedin|email|call}
All business logic delegated to export_service.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.database.session import get_session
from app.schemas.export_schemas import (
    LinkedInExportRequest, LinkedInExportResponse,
    EmailExportRequest, EmailExportResponse,
    CallExportRequest, CallExportResponse,
)
from app.services.export_service import (
    export_to_linkedin,
    export_via_email,
    export_to_call_queue,
)

router = APIRouter(prefix="/export", tags=["export"])

# MVP user_id default = 1 (no auth middleware yet; JWT wiring is straightforward to add)
MVP_USER_ID = 1


@router.post("/linkedin", response_model=LinkedInExportResponse)
async def linkedin_export(
    req: LinkedInExportRequest,
    db: Session = Depends(get_session),
):
    result = await export_to_linkedin(req, db, user_id=MVP_USER_ID)
    if not result.success:
        raise HTTPException(status_code=500, detail=result.message)
    return result


@router.post("/email", response_model=EmailExportResponse)
async def email_export(
    req: EmailExportRequest,
    db: Session = Depends(get_session),
):
    result = await export_via_email(req, db, user_id=MVP_USER_ID)
    # Email failures are returned as 200 with success=False so the FE can show the message
    return result


@router.post("/call", response_model=CallExportResponse)
async def call_export(
    req: CallExportRequest,
    db: Session = Depends(get_session),
):
    result = await export_to_call_queue(req, db, user_id=MVP_USER_ID)
    if not result.success:
        raise HTTPException(status_code=500, detail=result.message)
    return result
