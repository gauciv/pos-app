from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: str | None
    sort_order: int
    is_active: bool
    created_at: str
