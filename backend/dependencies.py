from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import supabase

security = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    token = credentials.credentials
    try:
        # Validate token via Supabase Auth API (no JWT secret needed)
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        user_id = str(response.user.id)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Fetch profile using service role client (bypasses RLS)
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Reject deactivated accounts
    if not result.data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Update last_seen_at for online status tracking
    try:
        supabase.table("profiles").update(
            {"last_seen_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", user_id).execute()
    except Exception:
        pass  # Non-critical, don't fail the request

    return result.data


def require_admin(
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


def require_collector(
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    if user.get("role") != "collector":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Collector access required",
        )
    return user
