import json
from openai import OpenAI
from app.core.config import settings
from app.schemas import ClassificationResponse

class ClassificationService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )

    async def classify_intent(self, context: str) -> ClassificationResponse:
        prompt = f"""
        Analyze the following user context and classify it into a structured JSON format.
        
        Context: {context}
        
        Return ONLY valid JSON with these keys: 
        - task_type (e.g., outreach, support, inquiry)
        - urgency (High, Medium, Low)
        - category (e.g., tech, finance, health)
        - behavioral_segment (e.g., early_adopter, skeptic)
        - intent_summary (A brief summary of what the user wants)
        - confidence_score (A float between 0.0 and 1.0 representing your certainty)
        """
        
        try:
            response = self.client.chat.completions.create(
                model="amazon/nova-micro-v1",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                timeout=10.0
            )
            
            data = json.loads(response.choices[0].message.content)
            # Basic validation of confidence_score range
            data["confidence_score"] = max(0.0, min(1.0, float(data.get("confidence_score", 0.5))))
            
            return ClassificationResponse(**data)
            
        except Exception as e:
            # Graceful failure: Log error and return a fallback response
            print(f"Classification API Error: {str(e)}")
            return self._get_fallback_response(context)

    def _get_fallback_response(self, context: str) -> ClassificationResponse:
        """Simple rule-based fallback if LLM fails."""
        return ClassificationResponse(
            task_type="inquiry",
            urgency="Medium",
            category="general",
            behavioral_segment="unknown",
            intent_summary=f"Fallback classification for: {context[:50]}...",
            confidence_score=0.4
        )

def get_classification_service() -> ClassificationService:
    return ClassificationService()
