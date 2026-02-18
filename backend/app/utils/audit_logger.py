from datetime import datetime
from sqlmodel import Session
from app.database.models.base import AuditLog

class AuditLogger:
    @staticmethod
    def log_generation(
        db: Session,
        user_id: int,
        task_type: str,
        input_text: str,
        output_text: str,
        channel: str,
        icp_id: str,
        priority_score: float,
        action: str = "generate",
    ):
        log = AuditLog(
            timestamp=datetime.utcnow(),
            user_id=user_id,
            action=action,
            task_type=task_type,
            input_text=input_text,
            output_text=output_text,
            channel=channel,
            icp_id=icp_id,
            priority_score=priority_score,
        )
        db.add(log)
        db.commit()
