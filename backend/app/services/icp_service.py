from typing import List, Dict
from sqlmodel import Session, select
from app.database.models.icp import ICPProfile
from app.services.embedding_service import embedding_service
from app.schemas import ClassificationResponse, ICPResponse, ICPMatch

class ICPService:
    async def match_icp(self, db: Session, classification: ClassificationResponse) -> ICPResponse:
        # Load all ICPs from database
        statement = select(ICPProfile)
        icp_profiles = db.exec(statement).all()
        
        # If no profiles, return empty/mock for MVP
        if not icp_profiles:
            return self._get_empty_response()

        # Query text for embedding
        query_text = f"{classification.category} {classification.behavioral_segment} {classification.intent_summary}"
        query_embedding = embedding_service.get_embeddings(query_text)
        
        matches = []
        for profile in icp_profiles:
            # For MVP, if profile has no embedding_id, we use its description
            # In a prod system, embeddings would be pre-calculated
            profile_text = f"{profile.industry} {profile.size} {profile.description} {profile.pain_points}"
            profile_embedding = embedding_service.get_embeddings(profile_text)
            
            similarity = embedding_service.compute_similarity(query_embedding, profile_embedding)
            
            # Weighted scoring logic (as per flow.md concept)
            # We combine semantic similarity with urgency/category weights
            weighted_score = self._apply_weighted_scoring(similarity, classification, profile)
            
            likelihood = "High" if weighted_score > 0.8 else "Medium" if weighted_score > 0.5 else "Low"
            
            matches.append(ICPMatch(
                icp_id=profile.id,
                name=profile.name,
                score=round(weighted_score, 4),
                likelihood=likelihood
            ))

        # Sort and take top 3
        matches.sort(key=lambda x: x.score, reverse=True)
        top_matches = matches[:3]
        
        return ICPResponse(
            matches=top_matches,
            primary_match=top_matches[0]
        )

    def _apply_weighted_scoring(self, similarity: float, classification: ClassificationResponse, profile: ICPProfile) -> float:
        # Simplified weighted scoring for MVP
        score = similarity * 0.7  # 70% semantic similarity
        
        # 30% heuristic weights
        bonus = 0.0
        if classification.category.lower() in profile.industry.lower():
            bonus += 0.2
        if classification.urgency == "High":
            bonus += 0.1
            
        return min(1.0, score + bonus)

    def _get_empty_response(self) -> ICPResponse:
        # Fallback for empty database
        fallback = ICPMatch(
            icp_id="default_icp",
            name="General Business",
            score=0.5,
            likelihood="Medium"
        )
        return ICPResponse(matches=[fallback], primary_match=fallback)

def get_icp_service() -> ICPService:
    return ICPService()
