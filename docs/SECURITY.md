# Security, Authorization & OWASP Controls

## Security Architecture

1. **Multi-Tenant IDOR/BOLA Protection**:
   - Every database query filters by `organization_id`.
   - `enforceTenantScope` middleware verifies `req.user.organization_id === target_resource.organization_id`.
   - Attempts to access another organization's records via URL parameters return `403 Forbidden`.

2. **Secret Isolation**:
   - `GEMINI_API_KEY`, `JWT_SECRET`, and `DB_PASSWORD` exist ONLY in backend environment variables (`backend/.env`).
   - The React frontend code never imports or exposes API keys.

3. **Authentication & Password Security**:
   - Passwords hashed with `bcryptjs` (salt rounds = 10).
   - Rate limiting on authentication endpoints (15 requests per 15 minutes).
   - Password reset endpoint returns generic message without leaking user existence.

4. **File Security**:
   - Uploaded files validated by MIME type (PDF, PNG, JPEG, TIFF). Prohibited extensions (`.exe`, `.sh`, `.bat`) rejected.
   - SHA256 checksum calculated and stored.
   - Malware scan simulation checks file integrity.
   - Storage keys generated randomly; path traversal attempts (`../`) strictly prevented.

5. **Idempotency & Concurrency**:
   - Write operations accept `X-Idempotency-Key` headers to prevent duplicate records on network retries.
   - Case edits enforce optimistic concurrency via `version` checking.
