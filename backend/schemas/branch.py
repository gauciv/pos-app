from pydantic import BaseModel


class BranchCreate(BaseModel):
    name: str
    location: str | None = None


class BranchUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    is_active: bool | None = None
