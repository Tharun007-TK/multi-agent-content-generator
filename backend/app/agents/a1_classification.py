import json
from openai import OpenAI
from app.agents.base import BaseAgent
from app.core.config import settings
from app.schemas.agent_schemas import ClassificationOutput

class ClassificationAgent(BaseAgent):
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
        self.system_prompt = """
        You are a highly sophisticated Classification Agent in a Multi-Agent Outreach System. 
        Your task is to analyze user context and classify it into structured data for downstream agents.
        
        Analyze the intent, audience, and urgency to provide precise categories.
        
        Fields:
        - task_type: The primary action (e.g., 'Initial Outreach', 'Follow-up', 'Nudge', 'Announcement', 'Support')
        - urgency: High, Medium, or Low based on the timeline and tone.
        - category: Industry or product vertical (e.g., 'SaaS', 'Fintech', 'LegalTech', 'DevTools', 'HRTech')
        - behavioral_segment: Persona traits or stage (e.g., 'Decision Maker', 'Technical Evaluator', 'Early Adopter')
        - intent_summary: A 1-sentence summary of the core value proposition or request.

        Return ONLY valid JSON.
        """

    def run(self, context: str) -> ClassificationOutput:
        response = self.client.chat.completions.create(
            model=settings.DEFAULT_LLM_MODEL, # Dynamically set from settings
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": context}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return ClassificationOutput(**data)
