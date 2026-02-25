import secrets
from datetime import datetime, timedelta, timezone

from database import supabase

# Safe charset: no ambiguous chars (0/O, 1/I/L, B/8)
CHARSET = "23456789ACDEFGHJKMNPQRSTUVWXYZ"
CODE_LENGTH = 6
CODE_EXPIRY_HOURS = 72


def generate_code() -> str:
    return "".join(secrets.choice(CHARSET) for _ in range(CODE_LENGTH))


def create_activation_code(user_id: str) -> str:
    # Invalidate any existing unused codes for this user
    supabase.table("activation_codes").update(
        {"is_used": True, "used_at": datetime.now(timezone.utc).isoformat()}
    ).eq("user_id", user_id).eq("is_used", False).execute()

    # Generate a unique code (retry on collision)
    for _ in range(10):
        code = generate_code()
        try:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=CODE_EXPIRY_HOURS)
            supabase.table("activation_codes").insert(
                {
                    "user_id": user_id,
                    "code": code,
                    "expires_at": expires_at.isoformat(),
                }
            ).execute()
            return code
        except Exception:
            continue

    raise Exception("Failed to generate unique activation code")


def validate_and_consume_code(code: str) -> str:
    """Validate and consume an activation code. Returns user_id if valid."""
    code = code.strip().upper()

    result = (
        supabase.table("activation_codes")
        .select("*")
        .eq("code", code)
        .eq("is_used", False)
        .single()
        .execute()
    )

    if not result.data:
        raise ValueError("Invalid activation code")

    activation = result.data

    # Check expiry
    expires_at = datetime.fromisoformat(activation["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise ValueError("Activation code has expired")

    # Mark as used
    supabase.table("activation_codes").update(
        {"is_used": True, "used_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", activation["id"]).execute()

    return activation["user_id"]


def get_activation_code(user_id: str) -> dict | None:
    """Get the current active (unused, unexpired) activation code for a user."""
    result = (
        supabase.table("activation_codes")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_used", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        return None

    activation = result.data[0]

    # Check if expired
    expires_at = datetime.fromisoformat(activation["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        return None

    return activation


def invalidate_codes(user_id: str):
    """Invalidate all unused activation codes for a user."""
    supabase.table("activation_codes").update(
        {"is_used": True, "used_at": datetime.now(timezone.utc).isoformat()}
    ).eq("user_id", user_id).eq("is_used", False).execute()
