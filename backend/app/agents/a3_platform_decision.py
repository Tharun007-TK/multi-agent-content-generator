from typing import Dict
from app.agents.base import BaseAgent
from app.schemas.agent_schemas import ClassificationOutput
from app.services.decision_engine import DecisionEngine

class PlatformDecisionAgent(BaseAgent):
    def __init__(self):
        self.engine = DecisionEngine()

    def run(self, classification: ClassificationOutput, icp_match: Dict) -> str:
        # Extract features for DecisionEngine
        # In a real system, these would come from database or prior agent context
        icp_preference = icp_match.get("preferences", {"LinkedIn": 0.8, "Email": 0.6})
        business_objective = classification.task_type # Use task_type as objective
        historical_engagement = {"LinkedIn": 0.5, "Email": 0.7, "Call": 0.2}

        selected_channel, reasoning = self.engine.score_channels(
            urgency=classification.urgency,
            icp_preference=icp_preference,
            business_objective=business_objective,
            historical_engagement=historical_engagement
        )
        
        # Log reasoning can be done here or in main flow
        return selected_channel
