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
        # Using a reliable model for structured output
        self.model = "amazon/nova-micro-v1" 

    def generate_content(
        self, 
        platform: str, 
        context: str, 
        temperature: float = 0.7,
        max_retries: int = 3
    ) -> Optional[ContentOutput]:
        """
        Generates structured content using OpenRouter with platform-aware prompts.
        Requirements:
        - Platform-aware prompt template
        - Structured output (headline, body, CTA)
        - Temperature control
        - Retry logic
        - Log prompt and output
        """
        prompt = self._get_platform_prompt(platform, context)
        
        for attempt in range(max_retries):
            try:
                logger.info(f"--- Content Generation Attempt {attempt + 1} ---")
                logger.info(f"Platform: {platform}")
                logger.info(f"Target Model: {self.model}")
                logger.info(f"Temperature: {temperature}")
                logger.info(f"Prompt Sent:\n{prompt}")
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are a professional content creator. Return ONLY valid JSON matching the requested structure."
                        },
                        {"role": "user", "content": prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                
                output_text = response.choices[0].message.content
                logger.info(f"Raw Output Received:\n{output_text}")
                
                data = json.loads(output_text)
                
                # Ensure all required fields are present
                return ContentOutput(
                    headline=data.get("headline", "N/A"),
                    body=data.get("body", "N/A"),
                    cta=data.get("cta", "N/A"),
                    platform=platform
                )
                
            except Exception as e:
                logger.error(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    sleep_time = 2 ** attempt
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                else:
                    logger.error("Max retries reached. Content generation failed.")
                    return None

    def _get_platform_prompt(self, platform: str, context: str) -> str:
        """
        Provides platform-aware prompts to guide the LLM.
        """
        base_instruction = "Based on the following context, generate content. Return JSON with keys: 'headline', 'body', 'cta'."
        
        templates = {
            "LinkedIn": f"{base_instruction} Focus on professional networking and industry insights. Context: {context}",
            "Email": f"{base_instruction} Focus on a professional yet personal tone with a clear subject line (headline). Context: {context}",
            "SMS": f"{base_instruction} Keep it extremely concise and urgent. Context: {context}",
            "Call": f"{base_instruction} Provide a script for a cold call or follow-up. Context: {context}"
        }
        
        return templates.get(platform, f"{base_instruction} Context: {context}")
