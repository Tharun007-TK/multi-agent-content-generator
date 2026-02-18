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
        You are a Classification Agent in a Multi-Agent system. 
        Your task is to analyze user context and classify it into structured data.
        Return ONLY valid JSON.
        
        JSON Structure:
        {
            "task_type": "...",
            "urgency": "High/Medium/Low",
            "category": "...",
            "behavioral_segment": "...",
            "intent_summary": "..."
        }
        """

    def run(self, context: str) -> ClassificationOutput:
        response = self.client.chat.completions.create(
            model="amazon/nova-micro-v1", # Low cost, fast for classification
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": context}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return ClassificationOutput(**data)
