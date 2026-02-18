# Backend Architecture – MVP

## Overview

The backend orchestrates a Multi-Agent System (MAS) for:

1. Task Classification
2. ICP Matching
3. Platform Decision
4. Content Generation
5. Governance & Logging

Built using FastAPI with modular service architecture.

---

## Architecture Overview

User Input
    ↓
A1 – Classification Agent (OpenRouter LLM)
    ↓
A2 – ICP Matching (HuggingFace Embeddings + Vector DB)
    ↓
A3 – Platform Decision Engine (Rule + Weighted Scoring)
    ↓
A4 – Content Generation Agent (OpenRouter LLM)
    ↓
Channel Formatter (LinkedIn / Email / Call)
    ↓
Response + Logging

---

## Core Modules

### 1. classification_service.py
- Calls OpenRouter
- Returns structured JSON
- Enforces schema validation

### 2. embedding_service.py
- Calls Hugging Face embedding model
- Computes vector similarity
- Returns ICP ranking

### 3. icp_service.py
- Matches classified task with ICP dataset
- Applies weighted scoring
- Outputs prioritized ICP

### 4. decision_engine.py
- Weighted channel selection
- Inputs:
  - urgency
  - ICP preference
  - business objective
  - historical engagement

### 5. content_service.py
- Generates structured content
- Platform-aware prompts
- Returns structured drafts

### 6. audit_logger.py
- Logs prompts
- Logs outputs
- Stores timestamps
- Stores selected channel

---

## Security

- JWT authentication
- Role-Based Access Control (RBAC)
- Encrypted ICP dataset
- Prompt audit logging

---

## Database Schema (MVP)

Tables:

users
icp_profiles
engagement_history
prompt_logs

---

## API Endpoints

POST /generate
POST /login
GET /logs
GET /icp

---

## Scalability Plan

- Convert services into microservices
- Add Redis caching for embeddings
- Add async job queue for heavy generation
