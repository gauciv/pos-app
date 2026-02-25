import secrets

from database import supabase
from services import activation_service

ANIMALS = [
    "Fox", "Hawk", "Bear", "Wolf", "Lynx", "Orca", "Puma", "Elk",
    "Owl", "Crow", "Viper", "Falcon", "Tiger", "Eagle", "Shark",
    "Raven", "Cobra", "Bison", "Moose", "Drake",
]


def generate_display_id(branch_name: str) -> str:
    prefix = branch_name[:3].upper()
    for _ in range(20):
        animal = secrets.choice(ANIMALS)
        number = secrets.randbelow(900) + 100
        display_id = f"{prefix}-{animal}-{number}"
        existing = (
            supabase.table("profiles")
            .select("id")
            .eq("display_id", display_id)
            .execute()
        )
        if not existing.data:
            return display_id
    raise Exception("Failed to generate unique display ID")


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


def create_user(nickname: str, branch_id: str, tag: str | None = None) -> dict:
    # Verify branch exists
    branch = (
        supabase.table("branches")
        .select("name")
        .eq("id", branch_id)
        .single()
        .execute()
    )
    if not branch.data:
        raise ValueError("Branch not found")

    branch_name = branch.data["name"]
    display_id = generate_display_id(branch_name)

    # Generate synthetic email and random password (collectors use activation codes)
    email = f"{display_id.lower().replace('-', '.')}@collector.pos"
    random_password = secrets.token_urlsafe(32)

    result = supabase.auth.admin.create_user(
        {
            "email": email,
            "password": random_password,
            "email_confirm": True,
            "user_metadata": {"full_name": nickname, "role": "collector"},
        }
    )

    user_id = str(result.user.id)

    # Update profile with collector-specific fields
    supabase.table("profiles").update(
        {
            "nickname": nickname,
            "display_id": display_id,
            "branch_id": branch_id,
            "tag": tag,
        }
    ).eq("id", user_id).execute()

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
