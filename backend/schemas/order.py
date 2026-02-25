from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int


class OrderCreate(BaseModel):
    store_id: str | None = None
    notes: str | None = None
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(BaseModel):
    id: str
    order_number: str
    collector_id: str
    store_id: str
    status: str
    subtotal: float
    tax_amount: float
    total_amount: float
    notes: str | None
    created_at: str
    updated_at: str
    items: list[dict] | None = None
    collector: dict | None = None
    store: dict | None = None
