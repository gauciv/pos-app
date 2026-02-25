from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import require_admin
from schemas.user import UserCreate, UserUpdate
from services import user_service, activation_service

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

    # Include activation code info
    code_data = activation_service.get_activation_code(user_id)
    result["activation_code"] = code_data

    return result


@router.post("")
async def create_user(body: UserCreate, admin: Annotated[dict, Depends(require_admin)]):
    try:
        result = user_service.create_user(
            nickname=body.nickname,
            branch_id=body.branch_id,
            tag=body.tag,
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
    try:
        result = user_service.update_user(user_id, body.model_dump(exclude_none=True))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{user_id}/activate")
async def toggle_active(
    user_id: str,
    is_active: bool,
    admin: Annotated[dict, Depends(require_admin)],
):
    try:
        result = user_service.toggle_active(user_id, is_active)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{user_id}/regenerate-code")
async def regenerate_code(
    user_id: str,
    admin: Annotated[dict, Depends(require_admin)],
):
    """Regenerate activation code for a collector."""
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["role"] != "collector":
        raise HTTPException(status_code=400, detail="Can only regenerate codes for collectors")

    try:
        code = activation_service.create_activation_code(user_id)
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/invalidate-code")
async def invalidate_code(
    user_id: str,
    admin: Annotated[dict, Depends(require_admin)],
):
    """Invalidate all unused activation codes for a user."""
    try:
        activation_service.invalidate_codes(user_id)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
