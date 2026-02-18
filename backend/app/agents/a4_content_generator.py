from app.agents.base import BaseAgent
from app.schemas.content_schemas import ContentOutput
from app.schemas.agent_schemas import ClassificationOutput
from app.services.content_service import ContentService

class ContentGeneratorAgent(BaseAgent):
    def __init__(self):
        self.content_service = ContentService()

    def run(self, classification: ClassificationOutput, icp_match: dict, platform: str) -> ContentOutput:
        # Context building for ContentService
        context = f"Audience: {icp_match['name']}, Intent: {classification.intent_summary}, Urgency: {classification.urgency}"
        
        # Call the service
        generated = self.content_service.generate_content(
            platform=platform,
            context=context,
            temperature=0.8
        )
        
        if not generated:
            # Fallback in case of failure
            return ContentOutput(
                headline="Follow-up Inquiry",
                body=f"Hello {icp_match['name']}, I wanted to follow up on your recent interest regarding {classification.category}.",
                cta="Let's connect",
                platform=platform
            )
        
        return ContentOutput(
            headline=generated.headline,
            body=generated.body,
            cta=generated.cta,
            platform=platform
        )
