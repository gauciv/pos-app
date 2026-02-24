from typing import Annotated

from fastapi import APIRouter, Depends

from dependencies import require_admin
from schemas.inventory import InventoryAdjustment
from services import inventory_service

router = APIRouter()


@router.post("/{product_id}/adjust")
async def adjust_stock(
    product_id: str,
    body: InventoryAdjustment,
    admin: Annotated[dict, Depends(require_admin)],
):
    return inventory_service.adjust_stock(
        product_id=product_id,
        change_amount=body.change_amount,
        reason=body.reason,
        performed_by=admin["id"],
    )


@router.get("/{product_id}/logs")
async def get_logs(
    product_id: str,
    admin: Annotated[dict, Depends(require_admin)],
    page: int = 1,
    page_size: int = 50,
):
    return inventory_service.get_logs(product_id=product_id, page=page, page_size=page_size)
