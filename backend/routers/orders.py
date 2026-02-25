from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, require_admin, require_collector
from schemas.order import OrderCreate, OrderStatusUpdate
from services import order_service

router = APIRouter()


@router.get("")
async def list_orders(
    user: Annotated[dict, Depends(get_current_user)],
    status: str | None = None,
    store_id: str | None = None,
    page: int = 1,
    page_size: int = 50,
):
    collector_id = None if user["role"] == "admin" else user["id"]
    return order_service.list_orders(
        collector_id=collector_id,
        store_id=store_id,
        status=status,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}")
async def get_order(order_id: str, user: Annotated[dict, Depends(get_current_user)]):
    result = order_service.get_order(order_id)
    if not result:
        raise HTTPException(status_code=404, detail="Order not found")
    if user["role"] != "admin" and result["collector_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return result


@router.post("")
async def create_order(body: OrderCreate, user: Annotated[dict, Depends(require_collector)]):
    try:
        store_id = body.store_id
        # Auto-resolve store from collector's branch if not provided
        if not store_id:
            store_id = order_service.resolve_store_from_branch(user.get("branch_id"))
        if not store_id:
            raise ValueError("No store assigned. Collector must belong to a branch.")
        items = [item.model_dump() for item in body.items]
        result = order_service.create_order(
            collector_id=user["id"],
            store_id=store_id,
            notes=body.notes,
            items=items,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{order_id}/status")
async def update_status(
    order_id: str,
    body: OrderStatusUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    return order_service.update_order_status(order_id, body.status)
