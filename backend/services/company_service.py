from database import supabase


def get_profile() -> dict | None:
    """Get the singleton company profile row."""
    try:
        result = supabase.table("company_profile").select("*").execute()
        if result.data:
            return result.data[0]
    except Exception:
        pass
    return None


def upsert_profile(data: dict) -> dict:
    """Create or update the singleton company profile."""
    existing = get_profile()
    if existing:
        result = (
            supabase.table("company_profile")
            .update(data)
            .eq("id", existing["id"])
            .execute()
        )
        return result.data[0]
    else:
        result = supabase.table("company_profile").insert(data).execute()
        return result.data[0]
