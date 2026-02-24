from database import supabase


def adjust_stock(product_id: str, change_amount: int, reason: str, performed_by: str) -> dict:
    supabase.table("products").update(
        {"stock_quantity": supabase.table("products").select("stock_quantity").eq("id", product_id).single().execute().data["stock_quantity"] + change_amount}
    ).eq("id", product_id).execute()

    supabase.table("inventory_logs").insert(
        {
            "product_id": product_id,
            "change_amount": change_amount,
            "reason": reason,
            "performed_by": performed_by,
        }
    ).execute()

    return supabase.table("products").select("*").eq("id", product_id).single().execute().data


def get_logs(product_id: str, page: int = 1, page_size: int = 50) -> dict:
    offset = (page - 1) * page_size
    result = (
        supabase.table("inventory_logs")
        .select("*, profiles!inventory_logs_performed_by_fkey(full_name)", count="exact")
        .eq("product_id", product_id)
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    return {"data": result.data, "total": result.count, "page": page, "page_size": page_size}
