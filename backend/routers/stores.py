from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, require_admin
from schemas.store import StoreCreate, StoreUpdate
from services import store_service

router = APIRouter()


@router.get("")
async def list_stores(
    user: Annotated[dict, Depends(get_current_user)],
    is_active: bool | None = True,
):
    return store_service.list_stores(is_active=is_active)


@router.get("/{store_id}")
async def get_store(store_id: str, user: Annotated[dict, Depends(get_current_user)]):
    result = store_service.get_store(store_id)
    if not result:
        raise HTTPException(status_code=404, detail="Store not found")
    return result


@router.post("")
async def create_store(body: StoreCreate, admin: Annotated[dict, Depends(require_admin)]):
    return store_service.create_store(body.model_dump())


@router.put("/{store_id}")
async def update_store(
    store_id: str,
    body: StoreUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    return store_service.update_store(store_id, body.model_dump())


@router.delete("/{store_id}")
async def delete_store(store_id: str, admin: Annotated[dict, Depends(require_admin)]):
    return store_service.delete_store(store_id)
