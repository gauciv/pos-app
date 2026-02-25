import secrets

from database import supabase
from services import activation_service


def list_users(role: str | None = None, is_active: bool | None = None) -> list[dict]:
    query = supabase.table("profiles").select("*").order("created_at", desc=True)
    if role:
        query = query.eq("role", role)
    if is_active is not None:
        query = query.eq("is_active", is_active)
    result = query.execute()
    return result.data


def get_user(user_id: str) -> dict | None:
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return result.data


def create_user(email: str, full_name: str, phone: str | None) -> dict:
    # Generate a random password (collectors never use it directly)
    random_password = secrets.token_urlsafe(32)

    result = supabase.auth.admin.create_user(
        {
            "email": email,
            "password": random_password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name, "role": "collector"},
        }
    )

    user_id = str(result.user.id)

    if phone:
        supabase.table("profiles").update({"phone": phone}).eq("id", user_id).execute()

    # Auto-generate activation code
    code = activation_service.create_activation_code(user_id)

    profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()

    return {**profile.data, "activation_code": code}


def update_user(user_id: str, data: dict) -> dict:
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return get_user(user_id)
    result = (
        supabase.table("profiles")
        .update(update_data)
        .eq("id", user_id)
        .single()
        .execute()
    )
    return result.data


def toggle_active(user_id: str, is_active: bool) -> dict:
    result = (
        supabase.table("profiles")
        .update({"is_active": is_active})
        .eq("id", user_id)
        .single()
        .execute()
    )
    return result.data
