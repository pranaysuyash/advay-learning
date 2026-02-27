from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware:
    """Middleware that adds common security headers to every response."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        async def send_wrapper(message):
            if message.get("type") == "http.response.start":
                headers = message.setdefault("headers", [])
                # X-Frame-Options
                headers.append((b"x-frame-options", b"DENY"))
                # X-Content-Type-Options
                headers.append((b"x-content-type-options", b"nosniff"))
                # Referrer-Policy
                headers.append((b"referrer-policy", b"no-referrer"))
                # Permissions-Policy (formerly Feature-Policy)
                headers.append((b"permissions-policy", b"geolocation=()"))
                # Strict-Transport-Security (set only in production)
                # Note: HTTPS enforcement is assumed at reverse proxy level.
                headers.append((b"strict-transport-security", b"max-age=63072000; includeSubDomains; preload"))
            await send(message)

        await self.app(scope, receive, send_wrapper)
