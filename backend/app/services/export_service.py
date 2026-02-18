"""
export_service.py
Business logic for LinkedIn, Email, and Call exports.
No logic lives in the route handler — only here.
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

from sqlmodel import Session

from app.core.config import settings
from app.database.models.exports import Export, CallQueue
from app.database.models.base import AuditLog
from app.schemas.export_schemas import (
    LinkedInExportRequest, LinkedInExportResponse,
    EmailExportRequest, EmailExportResponse,
    CallExportRequest, CallExportResponse,
)

logger = logging.getLogger(__name__)


def _write_audit(db: Session, user_id: int, action: str, channel: str, summary: str):
    log = AuditLog(
        user_id=user_id,
        action=action,
        task_type="export",
        input_text=summary,
        output_text="",
        channel=channel,
        icp_id="",
        priority_score=0.0,
    )
    db.add(log)


# ── LinkedIn ───────────────────────────────────────────────────────────────────

async def export_to_linkedin(
    req: LinkedInExportRequest,
    db: Session,
    user_id: int = 1,
) -> LinkedInExportResponse:
    """
    MVP: logs payload as a simulated LinkedIn post via webhook/logging.
    Structure is ready for real LinkedIn API integration.
    """
    try:
        webhook_url = settings.LINKEDIN_WEBHOOK_URL
        payload_summary = f"[LinkedIn] {req.headline[:60]}"

        if webhook_url:
            # Future: POST to LinkedIn API or internal webhook router
            logger.info("LinkedIn webhook target: %s | payload: %s", webhook_url, payload_summary)
        else:
            logger.info("LinkedIn export (simulated — no webhook configured): %s", payload_summary)

        record = Export(
            user_id=user_id,
            campaign_id=req.campaign_id,
            channel="linkedin",
            status="success",
            destination=webhook_url or "simulated",
        )
        db.add(record)
        _write_audit(db, user_id, "export_linkedin", "linkedin", payload_summary)
        db.commit()
        db.refresh(record)

        return LinkedInExportResponse(
            success=True,
            export_id=record.id,
            message="LinkedIn post queued successfully.",
        )

    except Exception as exc:
        logger.exception("LinkedIn export failed")
        record = Export(
            user_id=user_id,
            campaign_id=req.campaign_id,
            channel="linkedin",
            status="failed",
            error_message=str(exc),
        )
        db.add(record)
        db.commit()
        return LinkedInExportResponse(
            success=False,
            export_id=record.id,
            message=f"Export failed: {str(exc)}",
        )


# ── Email ──────────────────────────────────────────────────────────────────────

async def export_via_email(
    req: EmailExportRequest,
    db: Session,
    user_id: int = 1,
) -> EmailExportResponse:
    status = "success"
    error_msg = None

    # Guard: refuse to attempt send if SMTP is not configured
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        status = "failed"
        error_msg = (
            "SMTP credentials are not configured. "
            "Set SMTP_USERNAME and SMTP_PASSWORD in your .env file. "
            "For Gmail, generate a 16-character App Password at "
            "https://myaccount.google.com/apppasswords"
        )
        logger.warning("Email export skipped — SMTP not configured")
    else:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = req.subject
            msg["From"] = settings.SMTP_USERNAME
            msg["To"] = req.recipient
            msg.attach(MIMEText(req.body, "plain"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.ehlo()
                if settings.SMTP_PORT == 587:
                    server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, [req.recipient], msg.as_string())

        except smtplib.SMTPAuthenticationError:
            logger.exception("Email export to %s failed — authentication error", req.recipient)
            status = "failed"
            error_msg = (
                "SMTP authentication failed. "
                "For Gmail, make sure you are using an App Password (not your account password). "
                "Generate one at https://myaccount.google.com/apppasswords"
            )
        except Exception as exc:
            logger.exception("Email export to %s failed", req.recipient)
            status = "failed"
            error_msg = str(exc)

    record = Export(
        user_id=user_id,
        campaign_id=req.campaign_id,
        channel="email",
        status=status,
        destination=req.recipient,
        error_message=error_msg,
    )
    db.add(record)
    _write_audit(db, user_id, "export_email", "email", f"To: {req.recipient} | {req.subject}")
    db.commit()
    db.refresh(record)

    return EmailExportResponse(
        success=(status == "success"),
        export_id=record.id,
        message="Email sent successfully." if status == "success" else f"Email failed: {error_msg}",
    )


# ── Call Queue ─────────────────────────────────────────────────────────────────

async def export_to_call_queue(
    req: CallExportRequest,
    db: Session,
    user_id: int = 1,
) -> CallExportResponse:
    try:
        entry = CallQueue(
            user_id=user_id,
            lead_name=req.lead_name,
            phone=req.phone,
            script=req.script,
            priority=req.priority,
            status="queued",
        )
        db.add(entry)
        _write_audit(
            db, user_id, "export_call", "call",
            f"Lead: {req.lead_name} | {req.phone} | priority={req.priority}",
        )
        db.commit()
        db.refresh(entry)

        return CallExportResponse(
            success=True,
            queue_id=entry.id,
            message=f"Added to call queue (ID={entry.id}).",
        )

    except Exception as exc:
        logger.exception("Call queue export failed")
        db.rollback()
        return CallExportResponse(
            success=False,
            queue_id=-1,
            message=f"Call queue failed: {str(exc)}",
        )
