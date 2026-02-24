from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, require_admin
from schemas.product import ProductCreate, ProductUpdate
from services import product_service

router = APIRouter()


@router.get("")
async def list_products(
    user: Annotated[dict, Depends(get_current_user)],
    search: str | None = None,
    category_id: str | None = None,
    is_active: bool | None = True,
    page: int = 1,
    page_size: int = 50,
):
    return product_service.list_products(
        search=search,
        category_id=category_id,
        is_active=is_active,
        page=page,
        page_size=page_size,
    )


@router.get("/{product_id}")
async def get_product(product_id: str, user: Annotated[dict, Depends(get_current_user)]):
    result = product_service.get_product(product_id)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.post("")
async def create_product(body: ProductCreate, admin: Annotated[dict, Depends(require_admin)]):
    return product_service.create_product(body.model_dump())


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    body: ProductUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    return product_service.update_product(product_id, body.model_dump())


@router.delete("/{product_id}")
async def delete_product(product_id: str, admin: Annotated[dict, Depends(require_admin)]):
    return product_service.delete_product(product_id)
