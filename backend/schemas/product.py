from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    sku: str | None = None
    category_id: str | None = None
    price: float
    stock_quantity: int = 0
    unit: str = "unit"
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sku: str | None = None
    category_id: str | None = None
    price: float | None = None
    stock_quantity: int | None = None
    unit: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str | None
    sku: str | None
    category_id: str | None
    price: float
    stock_quantity: int
    unit: str
    image_url: str | None
    is_active: bool
    created_at: str
    updated_at: str
