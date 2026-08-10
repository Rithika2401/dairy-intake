# System Architecture & Technical Design

## Architecture Overview

The **Dairy Intelligent Document Intake & Decision Hub** is structured as an enterprise-grade full-stack web application with strict separation of concerns across presentation, business logic, storage abstraction, and pure MySQL persistence.

```
                  +-----------------------------------+
                  |   React 18 + Vite + Tailwind UI   |
                  |     (20 Connected SPA Pages)      |
                  +-----------------+-----------------+
                                    |
                            REST API (/api/v1)
                                    |
                  +-----------------v-----------------+
                  |     Node.js + Express Backend     |
                  |  (JWT Auth / RBAC / Idempotency)  |
                  +--------+----------------+---------+
                           |                |
           +---------------+                +----------------+
           |                                                 |
+----------v----------+                            +---------v---------+
|   Pure MySQL DB     |                            |  Google Gemini    |
| (mysql2/promise)    |                            |  API (@google/    |
| 47 InnoDB Tables    |                            |  genai Backend)   |
+---------------------+                            +-------------------+
```

## Key Architectural Principles

1. **Multi-Tenant Isolation**: Every database table representing tenant business entities contains `organization_id`. Authorization middleware enforces `req.user.organization_id === target.organization_id`. IDOR attempts return `403 Forbidden`.
2. **Human-in-the-Loop AI Decision Support**: AI performs structured extraction, OCR, confidence scoring, and grounded summaries. High-impact material decisions require human reviewer approval with mandatory auditing.
3. **Deterministic Validation Engine**: Quality rules (temperature checks, quantity reconciliation) execute independently of AI models to prevent model hallucinations from silently approving risky lots.
4. **Optimistic Concurrency**: Editable case entities track an integer `version` field. Stale update attempts trigger HTTP `409 Conflict` errors.
