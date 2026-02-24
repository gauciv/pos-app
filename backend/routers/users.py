from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import require_admin
from schemas.user import UserCreate, UserUpdate
from services import user_service

router = APIRouter()


@router.get("")
async def list_users(
    admin: Annotated[dict, Depends(require_admin)],
    role: str | None = None,
    is_active: bool | None = None,
):
    return user_service.list_users(role=role, is_active=is_active)


@router.get("/{user_id}")
async def get_user(user_id: str, admin: Annotated[dict, Depends(require_admin)]):
    result = user_service.get_user(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.post("")
async def create_user(body: UserCreate, admin: Annotated[dict, Depends(require_admin)]):
    try:
        result = user_service.create_user(
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            role=body.role,
            phone=body.phone,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    body: UserUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    result = user_service.update_user(user_id, body.model_dump())
    return result


@router.patch("/{user_id}/activate")
async def toggle_active(
    user_id: str,
    is_active: bool,
    admin: Annotated[dict, Depends(require_admin)],
):
    result = user_service.toggle_active(user_id, is_active)
    return result
