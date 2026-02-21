from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database.session import get_session
from app.database.models.campaigns import Campaign
from app.database.models.exports import CallQueue
from app.agents.a1_classification import ClassificationAgent
from app.agents.a2_icp_matcher import ICPMatcherAgent
from app.agents.a3_platform_decision import PlatformDecisionAgent
from app.agents.a4_content_generator import ContentGeneratorAgent
from app.schemas.content_schemas import ContentOutput
from app.utils.audit_logger import AuditLogger
from pydantic import BaseModel

router = APIRouter()

class GenerateRequest(BaseModel):
    context: str

# Instantiate agents
a1 = ClassificationAgent()
a2 = ICPMatcherAgent()
a3 = PlatformDecisionAgent()
a4 = ContentGeneratorAgent()

@router.post("/generate", response_model=ContentOutput)
def generate_content(request: GenerateRequest, db: Session = Depends(get_session)):
    try:
        # Step 1: Classification
        classification = a1.run(request.context)
        
        # Step 2: ICP Matching
        icp_match = a2.run(classification)
        
        # Step 3: Platform Decision
        platform = a3.run(classification, icp_match)
        
        # Step 4: Content Generation
        content = a4.run(classification, icp_match, platform)
        
        # Step 5: Persist as a Campaign for History
        campaign = Campaign(
            user_id=1,  # Default for MVP
            intent=classification.intent_summary,
            audience="General",  # Audience could be parsed from context in future
            urgency=classification.urgency,
            channel=platform,
            headline=content.headline,
            body=content.body,
            cta=content.cta,
            platform=platform,
            icp_id=icp_match.get('id', ""),
            priority_score=icp_match.get('score', 0.0)
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        
        # Step 5.1: If channel is 'call', add to CallQueue
        if platform.lower() == "call":
            call_entry = CallQueue(
                user_id=1,
                lead_name="John Doe",  # Placeholder, should ideally come from context
                phone="+1-555-0199",   # Placeholder
                script=content.body,
                priority=5,
                status="queued"
            )
            db.add(call_entry)
            db.commit()
        
        # Step 6: Log to AuditLog table
        AuditLogger.log_generation(
            db=db,
            user_id=1,
            task_type=classification.task_type,
            input_text=request.context,
            output_text=content.body,
            channel=platform,
            icp_id=icp_match.get('id', ""),
            priority_score=icp_match.get('score', 0.0)
        )
        
        content.campaign_id = campaign.id
        return content
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
