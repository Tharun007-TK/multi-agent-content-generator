# System Flow – MVP

## End-to-End Workflow

Step 1 – User Input
User submits:
- Time
- Location
- Business behavior
- Intent

↓

Step 2 – Classification Agent (A1)
LLM processes context.
Outputs:
- task_type
- urgency
- category
- behavioral_segment

↓

Step 3 – ICP Module (A2)
Embedding similarity search.
Weighted scoring applied.
Outputs:
- icp_id
- priority_score
- likelihood

↓

Step 4 – Platform Decision Agent (A3)
Scoring logic determines:
- LinkedIn
- Email
- Call

↓

Step 5 – Content Generation Agent (A4)
LLM generates:
- Headline
- Body
- CTA
Platform optimized.

↓

Step 6 – Channel Formatting
Structured formatting per channel.

↓

Step 7 – Logging
Store:
- Input
- Selected ICP
- Channel
- Generated output

---

## Error Handling Flow

If classification confidence < threshold:
    → Request clarification

If no ICP match:
    → Default fallback ICP

If LLM fails:
    → Retry with backup model
