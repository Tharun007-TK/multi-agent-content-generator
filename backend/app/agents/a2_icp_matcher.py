import faiss
import numpy as np
import os
from typing import List, Dict
from app.agents.base import BaseAgent
from app.services.embedding_service import embedding_service
from app.schemas.agent_schemas import ClassificationOutput

class ICPMatcherAgent(BaseAgent):
    def __init__(self, index_path: str = "data/vector_db/icp.index"):
        self.index_path = index_path
        self.dimension = 384  # For all-MiniLM-L6-v2
        
        if os.path.exists(self.index_path):
            self.index = faiss.read_index(self.index_path)
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            
        # Realistic ICP database for Demo
        self.icp_db = {
            0: {
                "id": "icp_b2b_saas", 
                "name": "B2B SaaS Founders", 
                "score": 0.95,
                "industry": "SaaS",
                "preferences": {"LinkedIn": 0.9, "Email": 0.7, "Call": 0.1, "SMS": 0.05}
            },
            1: {
                "id": "icp_fintech_execs", 
                "name": "Enterprise Fintech Executives", 
                "score": 0.88,
                "industry": "Fintech",
                "preferences": {"Email": 0.9, "LinkedIn": 0.5, "Call": 0.3}
            },
            2: {
                "id": "icp_healthtech_ops", 
                "name": "HealthTech Operations Managers", 
                "score": 0.82,
                "industry": "HealthTech",
                "preferences": {"Email": 0.8, "Call": 0.6, "LinkedIn": 0.2}
            },
            3: {
                "id": "icp_ecommerce_marketing", 
                "name": "E-com Marketing Directors", 
                "score": 0.90,
                "industry": "Retail",
                "preferences": {"SMS": 0.8, "Email": 0.7, "LinkedIn": 0.6}
            },
            4: {
                "id": "icp_edutech_heads", 
                "name": "EduTech Innovation Leads", 
                "score": 0.75,
                "industry": "EduTech",
                "preferences": {"LinkedIn": 0.8, "Email": 0.8, "Call": 0.1}
            }
        }

    def run(self, classification: ClassificationOutput) -> Dict:
        # Create a query string from classification
        query_text = f"{classification.category} {classification.behavioral_segment} {classification.intent_summary}"
        query_embedding = np.array([embedding_service.get_embeddings(query_text)]).astype('float32')
        
        # Search in FAISS
        # For MVP, if index is empty, we use a simple fallback or mock search
        if self.index.ntotal == 0:
            # Fallback to first available for MVP demo if no data indexed
            return self.icp_db[0]
            
        D, I = self.index.search(query_embedding, 1)
        match_id = int(I[0][0])
        
        return self.icp_db.get(match_id, self.icp_db[0])
