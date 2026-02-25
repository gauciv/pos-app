from database import supabase


def list_branches() -> list[dict]:
    result = supabase.table("branches").select("*").order("name").execute()
    branches = result.data

    for branch in branches:
        # Count collectors in this branch
        count_result = (
            supabase.table("profiles")
            .select("id", count="exact")
            .eq("branch_id", branch["id"])
            .eq("role", "collector")
            .execute()
        )
        branch["collector_count"] = count_result.count or 0

        # Get last order timestamp from collectors in this branch
        collectors = (
            supabase.table("profiles")
            .select("id")
            .eq("branch_id", branch["id"])
            .eq("role", "collector")
            .execute()
        )
        collector_ids = [c["id"] for c in (collectors.data or [])]

        if collector_ids:
            orders_result = (
                supabase.table("orders")
                .select("created_at")
                .in_("collector_id", collector_ids)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            branch["last_order_at"] = (
                orders_result.data[0]["created_at"] if orders_result.data else None
            )
        else:
            branch["last_order_at"] = None

    return branches


def create_branch(name: str, location: str | None) -> dict:
    data = {"name": name}
    if location:
        data["location"] = location

    result = supabase.table("branches").insert(data).execute()
    branch = result.data[0]
    branch["collector_count"] = 0
    branch["last_order_at"] = None
    return branch


def get_branch(branch_id: str) -> dict | None:
    result = (
        supabase.table("branches").select("*").eq("id", branch_id).single().execute()
    )
    return result.data


def update_branch(branch_id: str, data: dict) -> dict:
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return get_branch(branch_id)
    result = (
        supabase.table("branches")
        .update(update_data)
        .eq("id", branch_id)
        .single()
        .execute()
    )
    return result.data


def delete_branch(branch_id: str):
    """Delete a branch. Raises if it still has collectors."""
    count_result = (
        supabase.table("profiles")
        .select("id", count="exact")
        .eq("branch_id", branch_id)
        .eq("role", "collector")
        .execute()
    )
    if (count_result.count or 0) > 0:
        raise ValueError(
            f"Cannot delete branch with {count_result.count} collector(s). "
            "Remove all collectors from this branch first."
        )

    supabase.table("branches").delete().eq("id", branch_id).execute()
