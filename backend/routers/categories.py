from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, require_admin
from database import supabase
from schemas.category import CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("")
async def list_categories(user: Annotated[dict, Depends(get_current_user)]):
    result = (
        supabase.table("categories")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data


@router.post("")
async def create_category(body: CategoryCreate, admin: Annotated[dict, Depends(require_admin)]):
    result = supabase.table("categories").insert(body.model_dump()).single().execute()
    return result.data


@router.put("/{category_id}")
async def update_category(
    category_id: str,
    body: CategoryUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    result = (
        supabase.table("categories")
        .update(update_data)
        .eq("id", category_id)
        .single()
        .execute()
    )
    return result.data


@router.delete("/{category_id}")
async def delete_category(category_id: str, admin: Annotated[dict, Depends(require_admin)]):
    result = (
        supabase.table("categories")
        .update({"is_active": False})
        .eq("id", category_id)
        .single()
        .execute()
    )
    return result.data
