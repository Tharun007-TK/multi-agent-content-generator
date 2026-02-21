# Multi-Agent Model Diagrams

The following diagrams illustrate the architecture and data flow of the Multi-Agent Content Generator.

## 1. System Architecture (Flowchart)

This diagram shows the high-level components and how data moves from the user through the four specialized agents to the final output modules.

```mermaid
flowchart TD
    U[User / Frontend] -->|Context Input| API[FastAPI Backend]

    API --> A1[Agent 1 - Classification<br>OpenRouter LLM]

    A1 --> A2[Agent 2 - ICP Matching<br>HuggingFace Embeddings + Vector DB]

    A2 --> A3[Agent 3 - Platform Decision Engine<br>Weighted Scoring Logic]

    A3 --> A4[Agent 4 - Content Generation<br>OpenRouter LLM]

    A4 --> FMT[Channel Formatter Module]

    FMT --> OUT1[LinkedIn Module]
    FMT --> OUT2[Email Module]
    FMT --> OUT3[Call Script Module]

    OUT1 --> RESP[Final Structured Response]
    OUT2 --> RESP
    OUT3 --> RESP

    RESP --> LOG[Audit Logger + Prompt Logs]

    API --> DB[(Database<br>Users / ICP / Logs)]
    A2 --> VDB[(Vector DB)]
```

## 2. Agent Execution Sequence

This sequence diagram details the step-by-step logic and handoffs between the agents during a single campaign generation request.

```mermaid
sequenceDiagram
    participant User
    participant A1 as Agent 1 - Classification
    participant A2 as Agent 2 - ICP Module
    participant A3 as Agent 3 - Platform Decision
    participant A4 as Agent 4 - Content Generation
    participant Logger

    User->>A1: Context Input (Time, Location, Intent)
    A1->>A1: LLM Semantic Classification
    A1->>A2: Structured Task Output

    A2->>A2: Embedding Similarity Search
    A2->>A2: Weighted ICP Scoring
    A2->>A3: Prioritized ICP Profile

    A3->>A3: Channel Scoring Logic
    A3->>A4: Selected Platform + Strategy

    A4->>A4: Platform-Aware Prompt Engineering
    A4-->>User: Generated Content Draft

    A4->>Logger: Log Prompt + Output + Metadata
```

## 3. Security & Governance Layer

This diagram shows the cross-cutting concerns like Authentication and Logging that protect the API.

```mermaid
flowchart LR
    RBAC[Role-Based Access Control]
    ENC[Encrypted Storage]
    LOGS[Prompt Logging & Audit Trail]
    AUTH[JWT Authentication]

    RBAC --> API[FastAPI Backend]
    AUTH --> API
    API --> ENC
    API --> LOGS
```
