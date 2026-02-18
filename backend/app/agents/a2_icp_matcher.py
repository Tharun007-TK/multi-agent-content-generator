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
            
        # Mock database for MVP demo
        self.icp_db = {
            0: {"id": "icp_tech_startup", "name": "B2B Tech Startups", "score": 0.95},
            1: {"id": "icp_enterprise_fintech", "name": "Enterprise Fintech", "score": 0.85},
            2: {"id": "icp_retail_ecommerce", "name": "Retail E-commerce", "score": 0.70}
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
