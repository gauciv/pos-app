from database import supabase


def list_stores(is_active: bool | None = True) -> list[dict]:
    query = supabase.table("stores").select("*").order("name")
    if is_active is not None:
        query = query.eq("is_active", is_active)
    result = query.execute()
    return result.data


def get_store(store_id: str) -> dict | None:
    result = supabase.table("stores").select("*").eq("id", store_id).single().execute()
    return result.data


def create_store(data: dict) -> dict:
    result = supabase.table("stores").insert(data).single().execute()
    return result.data


def update_store(store_id: str, data: dict) -> dict:
    update_data = {k: v for k, v in data.items() if v is not None}
    result = (
        supabase.table("stores")
        .update(update_data)
        .eq("id", store_id)
        .single()
        .execute()
    )
    return result.data


def delete_store(store_id: str) -> dict:
    result = (
        supabase.table("stores")
        .update({"is_active": False})
        .eq("id", store_id)
        .single()
        .execute()
    )
    return result.data
