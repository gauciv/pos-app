from pydantic import BaseModel


class StoreCreate(BaseModel):
    name: str
    address: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None


class StoreUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    contact_name: str | None = None
    contact_phone: str | None = None
    is_active: bool | None = None


class StoreResponse(BaseModel):
    id: str
    name: str
    address: str | None
    contact_name: str | None
    contact_phone: str | None
    is_active: bool
    created_at: str
    updated_at: str
