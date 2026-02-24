from database import supabase


def create_order(collector_id: str, store_id: str, notes: str | None, items: list[dict]) -> dict:
    items_jsonb = [{"product_id": item["product_id"], "quantity": item["quantity"]} for item in items]
    result = supabase.rpc(
        "create_order",
        {
            "p_collector_id": collector_id,
            "p_store_id": store_id,
            "p_notes": notes,
            "p_items": items_jsonb,
        },
    ).execute()
    return result.data


def list_orders(
    collector_id: str | None = None,
    store_id: str | None = None,
    status: str | None = None,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    query = supabase.table("orders").select(
        "*, profiles!orders_collector_id_fkey(full_name, email), stores(name)",
        count="exact",
    )

    if collector_id:
        query = query.eq("collector_id", collector_id)
    if store_id:
        query = query.eq("store_id", store_id)
    if status:
        query = query.eq("status", status)

    offset = (page - 1) * page_size
    query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)

    result = query.execute()
    return {"data": result.data, "total": result.count, "page": page, "page_size": page_size}


def get_order(order_id: str) -> dict | None:
    result = (
        supabase.table("orders")
        .select(
            "*, order_items(*), profiles!orders_collector_id_fkey(full_name, email), stores(name, address)"
        )
        .eq("id", order_id)
        .single()
        .execute()
    )
    return result.data


def update_order_status(order_id: str, status: str) -> dict:
    result = (
        supabase.table("orders")
        .update({"status": status})
        .eq("id", order_id)
        .single()
        .execute()
    )
    return result.data
