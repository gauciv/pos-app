import secrets
from datetime import datetime, timezone

from database import supabase


def generate_branch_display_id(name: str) -> str:
    """Generate immutable branch display ID: <YYYYMMDD>-<NAME>-<random 3-digit>"""
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    name_part = name.strip().upper().replace(" ", "-")[:20]
    for _ in range(20):
        num = secrets.randbelow(900) + 100
        display_id = f"{date_part}-{name_part}-{num}"
        existing = (
            supabase.table("branches")
            .select("id")
            .eq("display_id", display_id)
            .execute()
        )
        if not existing.data:
            return display_id
    raise Exception("Failed to generate unique branch display ID")


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
    display_id = generate_branch_display_id(name)
    data = {"name": name, "display_id": display_id}
    if location:
        data["location"] = location

    result = supabase.table("branches").insert(data).execute()
    branch = result.data[0]
    branch["collector_count"] = 0
    branch["last_order_at"] = None
    return branch


def get_branch(branch_id: str) -> dict | None:
    result = (
        supabase.table("branches").select("*").eq("id", branch_id).execute()
    )
    return result.data[0] if result.data else None


def update_branch(branch_id: str, data: dict) -> dict:
    # Prevent updating the immutable display_id
    data.pop("display_id", None)
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return get_branch(branch_id)
    result = (
        supabase.table("branches")
        .update(update_data)
        .eq("id", branch_id)
        .execute()
    )
    if not result.data:
        raise ValueError("Branch not found")
    return result.data[0]


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


def get_branch_collectors(branch_id: str) -> list[dict]:
    """Get all collector profiles belonging to a branch."""
    result = (
        supabase.table("profiles")
        .select("*")
        .eq("branch_id", branch_id)
        .eq("role", "collector")
        .order("nickname")
        .execute()
    )
    return result.data or []
