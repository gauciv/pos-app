from pydantic import BaseModel


class InventoryAdjustment(BaseModel):
    change_amount: int
    reason: str
