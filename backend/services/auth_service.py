from database import supabase


def login(email: str, password: str) -> dict:
    result = supabase.auth.sign_in_with_password({"email": email, "password": password})
    profile = (
        supabase.table("profiles")
        .select("*")
        .eq("id", result.user.id)
        .single()
        .execute()
    )
    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "user": profile.data,
    }


def get_profile(user_id: str) -> dict:
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    return result.data


def update_profile(user_id: str, data: dict) -> dict:
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return get_profile(user_id)
    result = (
        supabase.table("profiles")
        .update(update_data)
        .eq("id", user_id)
        .single()
        .execute()
    )
    return result.data
