from database import supabase


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


def create_user(email: str, password: str, full_name: str, role: str, phone: str | None) -> dict:
    result = supabase.auth.admin.create_user(
        {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name, "role": role},
        }
    )
    if phone:
        supabase.table("profiles").update({"phone": phone}).eq("id", result.user.id).execute()
    profile = supabase.table("profiles").select("*").eq("id", result.user.id).single().execute()
    return profile.data


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
