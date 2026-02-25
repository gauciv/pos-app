from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    full_name: str
    phone: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: str | None
    is_active: bool
    device_connected_at: str | None = None
    last_seen_at: str | None = None
    created_at: str
    updated_at: str


class ActivationCodeResponse(BaseModel):
    id: str
    code: str
    is_used: bool
    expires_at: str
    created_at: str


class UserDetailResponse(UserResponse):
    activation_code: ActivationCodeResponse | None = None


class ActivationRequest(BaseModel):
    code: str


class ActivationResponse(BaseModel):
    token_hash: str
    email: str
