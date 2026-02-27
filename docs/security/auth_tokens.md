# Authentication Token Design

This document collects design decisions and invariants for access/refresh tokens.

* **Access tokens** are JWTs with a 15‑minute expiry, stored in HttpOnly cookies.
  - `jti` claim added during Unit‑1 to enable revocation.
  - `settings.ENABLE_ACCESS_TOKEN_BLACKLIST` controls blacklist behavior (default true).
  - Logout/refresh handlers now revoke the current access token by inserting a
    record in `revoked_tokens` table.
  - `get_current_user` dependency checks revocation and raises `401` if revoked.

* **Refresh tokens** remain long‑lived and persisted in the database. Rotation is
  already implemented: each refresh call revokes the previous token.

* **Cookie settings**
  - `SameSite=strict` (strong CSRF protection)
  - `HttpOnly` always
  - `Secure` only in production environment

See `src/backend/app/api/v1/endpoints/auth.py` and
`src/backend/app/services/token_service.py` for implementation details.
