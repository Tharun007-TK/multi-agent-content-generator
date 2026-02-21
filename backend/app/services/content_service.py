import json
import logging
import time
from typing import Optional
from openai import OpenAI
from app.core.config import settings
from app.schemas.content_schemas import ContentOutput

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
        # Using the selected model from settings
        self.model = settings.DEFAULT_LLM_MODEL

    def generate_content(
        self, 
        platform: str, 
        context: str, 
        temperature: Optional[float] = None,
        max_retries: int = 3
    ) -> Optional[ContentOutput]:
        """
        Generates structured content using OpenAI/OpenRouter with platform-aware prompts.
        """
        prompt = self._get_platform_prompt(platform, context)
        
        # Dynamic temperature based on platform if not provided
        if temperature is None:
            temp_map = {
                "LinkedIn": 0.85,  # More creative
                "Email": 0.7,      # Balanced
                "SMS": 0.4,        # Direct/Precise
                "Call": 0.5        # Narrative/Scripted
            }
            temperature = temp_map.get(platform, 0.7)

        for attempt in range(max_retries):
            try:
                logger.info(f"--- Content Generation Attempt {attempt + 1} ---")
                logger.info(f"Platform: {platform} | Target Model: {self.model} | Temp: {temperature}")
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are a world-class copywriter and sales strategist. Your goal is to produce high-conversion content. Return ONLY valid JSON matching the requested structure."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                
                output_text = response.choices[0].message.content
                data = json.loads(output_text)
                
                return ContentOutput(
                    headline=data.get("headline", "N/A"),
                    body=data.get("body", "N/A"),
                    cta=data.get("cta", "N/A"),
                    platform=platform
                )
                
            except Exception as e:
                logger.error(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    return None

    def _get_platform_prompt(self, platform: str, context: str) -> str:
        """
        Provides platform-aware prompts to guide the LLM.
        """
        base_instruction = "Generate highly engaging outreach content based on the following context. Return JSON with keys: 'headline', 'body', 'cta'."
        
        templates = {
            "LinkedIn": f"""
                {base_instruction}
                Style: Professional yet social. Use a hook in the headline. 
                The body should be readable with bullet points if necessary. 
                CTA should be conversational (e.g., 'Worth a quick chat?').
                Context: {context}
            """,
            "Email": f"""
                {base_instruction}
                Style: Direct, personalized, and value-driven. 
                Headline = Subject Line. 
                Body = Professional email structure with clear benefit-led sentences. 
                CTA = Specific request for time.
                Context: {context}
            """,
            "SMS": f"""
                {base_instruction}
                Style: Extremely concise, urgent, and informal. 
                Headline = Short intro. 
                Body = 1-2 sentences max. 
                CTA = Quick reply action.
                Context: {context}
            """,
            "Call": f"""
                {base_instruction}
                Style: This is a PHONE SCRIPT. 
                Headline = The opening hook. 
                Body = The main pitch script including how to handle a common objection. 
                CTA = The specific ask at the end of the call.
                Context: {context}
            """
        }
        
        return templates.get(platform, f"{base_instruction} Context: {context}").strip()
