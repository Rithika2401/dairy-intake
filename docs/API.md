# Dairy Intelligent Document Intake & Decision Hub - API Documentation

Version: `v1.0.0` | Base Path: `/api/v1` | Protocol: `HTTPS/JSON`

---

## Authentication & Multi-Tenant Authorization

Every request to protected endpoints requires a Bearer JWT Token in the HTTP Authorization header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Tenant boundaries are enforced server-side. Query parameters or request body fields containing `organization_id` must match `req.user.organization_id`. Any cross-tenant access attempt returns `403 Forbidden`.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Rate Limit**: 15 requests per 15 minutes
- **Request Body**:
  ```json
  {
    "email": "reviewer@dairycoop.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "8h",
      "user": {
        "id": "usr-rev-001",
        "email": "reviewer@dairycoop.com",
        "firstName": "Priya",
        "lastName": "Sharma",
        "organizationId": "org-001",
        "roles": ["REVIEWER"],
        "permissions": ["cases.read", "cases.update", "cases.approve", "ai.review"]
      }
    },
    "message": "Login successful."
  }
  ```

---

## 2. Case Management Endpoints (`/api/v1/cases`)

### `GET /api/v1/cases`
- **Permission**: `cases.read`
- **Query Parameters**: `status`, `priority`, `risk_level`, `search`, `page`, `limit`
- **Response (200 OK)**: Returns paginated list of tenant cases.

### `POST /api/v1/cases/:id/decision`
- **Permission**: `cases.approve`
- **Header**: `X-Idempotency-Key` (Optional)
- **Request Body**:
  ```json
  {
    "action": "APPROVE",
    "reason": "All QA temperature parameters and fat percentages verified within threshold."
  }
  ```
- **Response (200 OK)**: Returns recorded decision ID and updated case status.

---

## 3. Document Intake Endpoints (`/api/v1/documents`)

### `POST /api/v1/documents/upload`
- **Permission**: `documents.upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `file` (Binary), `case_id` (String), `document_type` (Enum)
- **Response (201 Created)**: Returns generated document ID, SHA256 checksum, and security malware scan status (`PASSED`).

---

## 4. AI Pipeline Endpoints (`/api/v1/ai`)

### `POST /api/v1/ai/process`
- **Permission**: `ai.run`
- **Request Body**: `{ "case_id": "case-001", "document_id": "doc-001" }`
- **Response (200 OK)**: Returns Gemini model OCR extraction and confidence matrix.

### `GET /api/v1/ai/grounded-summary/:caseId`
- **Permission**: `ai.review`
- **Response (200 OK)**: Returns grounded executive summary with evidence citations.

---

## 5. Validation Engine Endpoints (`/api/v1/validations`)

### `POST /api/v1/validations/run/:caseId`
- **Permission**: `cases.update`
- **Response (200 OK)**: Returns deterministic rule results and cross-doc quantity reconciliation.
