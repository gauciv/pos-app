from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "collector"
    phone: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: str | None = None
    phone: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: str | None
    is_active: bool
    created_at: str
    updated_at: str
