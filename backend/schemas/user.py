from pydantic import BaseModel


class UserCreate(BaseModel):
    nickname: str
    branch_id: str
    tag: str | None = None


class UserUpdate(BaseModel):
    nickname: str | None = None
    tag: str | None = None
    branch_id: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: str | None
    is_active: bool
    device_connected_at: str | None = None
    last_seen_at: str | None = None
    nickname: str | None = None
    display_id: str | None = None
    branch_id: str | None = None
    tag: str | None = None
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
