from typing import Dict, Tuple

class DecisionEngine:
    """
    Weighted scoring engine for channel selection.
    Factors: Urgency, ICP Preference, Business Objective, Historical Engagement.
    """
    
    # Weights for each factor
    WEIGHTS = {
        "urgency": 0.40,
        "icp_preference": 0.25,
        "business_objective": 0.20,
        "historical_engagement": 0.15
    }

    CHANNELS = ["LinkedIn", "Email", "Call", "SMS"]

    def score_channels(
        self,
        urgency: str,
        icp_preference: Dict[str, float],
        business_objective: str,
        historical_engagement: Dict[str, float]
    ) -> Tuple[str, str]:
        """
        Calculates weights and returns the best channel with reasoning.
        """
        scores = {channel: 0.0 for channel in self.CHANNELS}
        reasoning_parts = []

        # 1. Urgency Scoring (0.40)
        u_scores = self._get_urgency_scores(urgency)
        for ch, val in u_scores.items():
            scores[ch] += val * self.WEIGHTS["urgency"]
        reasoning_parts.append(f"Urgency ({urgency}) tilted towards {max(u_scores, key=u_scores.get)}.")

        # 2. ICP Preference Scoring (0.25)
        for ch, val in icp_preference.items():
            if ch in scores:
                scores[ch] += val * self.WEIGHTS["icp_preference"]
        reasoning_parts.append(f"ICP shows preference for {max(icp_preference, key=icp_preference.get) if icp_preference else 'None'}.")

        # 3. Business Objective Scoring (0.20)
        obj_scores = self._get_objective_scores(business_objective)
        for ch, val in obj_scores.items():
            scores[ch] += val * self.WEIGHTS["business_objective"]
        reasoning_parts.append(f"Objective ({business_objective}) favors {max(obj_scores, key=obj_scores.get)}.")

        # 4. Historical Engagement Scoring (0.15)
        for ch, val in historical_engagement.items():
            if ch in scores:
                scores[ch] += val * self.WEIGHTS["historical_engagement"]
        reasoning_parts.append(f"Historical data supports {max(historical_engagement, key=historical_engagement.get) if historical_engagement else 'None'}.")

        selected_channel = max(scores, key=scores.get)
        reasoning = " | ".join(reasoning_parts)
        
        return selected_channel, reasoning

    def _get_urgency_scores(self, urgency: str) -> Dict[str, float]:
        if urgency == "High":
            return {"Call": 1.0, "SMS": 0.8, "Email": 0.4, "LinkedIn": 0.2}
        if urgency == "Medium":
            return {"Email": 1.0, "LinkedIn": 0.8, "SMS": 0.5, "Call": 0.3}
        return {"LinkedIn": 1.0, "Email": 0.7, "SMS": 0.2, "Call": 0.1}

    def _get_objective_scores(self, objective: str) -> Dict[str, float]:
        obj = objective.lower()
        if "outreach" in obj or "sales" in obj:
            return {"LinkedIn": 1.0, "Email": 0.8, "Call": 0.4, "SMS": 0.3}
        if "support" in obj or "service" in obj:
            return {"Email": 1.0, "Call": 0.7, "SMS": 0.6, "LinkedIn": 0.3}
        return {"Email": 0.9, "LinkedIn": 0.9, "Call": 0.5, "SMS": 0.5}
