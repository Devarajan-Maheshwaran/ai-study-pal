"""JWT authentication middleware for StudyForge."""
import os
import functools
from flask import request, jsonify, g

try:
    import jwt as pyjwt
    _JWT_AVAILABLE = True
except ImportError:
    _JWT_AVAILABLE = False
    print("[auth] PyJWT not installed — AUTH_ENABLED will be forced off")

_JWT_SECRET   = os.environ.get("JWT_SECRET", "")
_AUTH_ENABLED = os.environ.get("AUTH_ENABLED", "false").lower() == "true"


def _decode_token(token: str) -> dict:
    """Decode and verify a Supabase JWT. Returns the payload."""
    if not _JWT_AVAILABLE:
        raise RuntimeError("PyJWT not installed")
    return pyjwt.decode(
        token,
        _JWT_SECRET,
        algorithms=["HS256"],
        options={"verify_exp": True},
    )


def require_auth(fn):
    """Route decorator. Verifies Bearer JWT; sets g.user_id for the request."""
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        if not _AUTH_ENABLED:
            g.user_id = "dev"
            return fn(*args, **kwargs)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header[len("Bearer "):].strip()
        try:
            payload  = _decode_token(token)
            g.user_id = payload.get("sub") or payload.get("user_id")
            if not g.user_id:
                raise ValueError("No user ID in token")
        except Exception as e:
            return jsonify({"error": f"Unauthorized: {e}"}), 401
        return fn(*args, **kwargs)
    return wrapper


def current_user_id() -> str:
    """Returns the authenticated user's UUID from the request context."""
    return getattr(g, "user_id", "dev")
