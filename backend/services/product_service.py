from database import supabase


def list_products(
    search: str | None = None,
    category_id: str | None = None,
    is_active: bool | None = True,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    query = supabase.table("products").select("*, categories(name)", count="exact")

    if is_active is not None:
        query = query.eq("is_active", is_active)
    if category_id:
        query = query.eq("category_id", category_id)
    if search:
        query = query.ilike("name", f"%{search}%")

    offset = (page - 1) * page_size
    query = query.order("name").range(offset, offset + page_size - 1)

    result = query.execute()
    return {"data": result.data, "total": result.count, "page": page, "page_size": page_size}


def get_product(product_id: str) -> dict | None:
    result = (
        supabase.table("products")
        .select("*, categories(name)")
        .eq("id", product_id)
        .execute()
    )
    return result.data[0] if result.data else None


def create_product(data: dict) -> dict:
    result = supabase.table("products").insert(data).execute()
    return result.data[0]


def update_product(product_id: str, data: dict) -> dict:
    update_data = {k: v for k, v in data.items() if v is not None}
    result = (
        supabase.table("products")
        .update(update_data)
        .eq("id", product_id)
        .execute()
    )
    if not result.data:
        raise ValueError("Product not found")
    return result.data[0]


def delete_product(product_id: str) -> dict:
    result = (
        supabase.table("products")
        .update({"is_active": False})
        .eq("id", product_id)
        .execute()
    )
    if not result.data:
        raise ValueError("Product not found")
    return result.data[0]
