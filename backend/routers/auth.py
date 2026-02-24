from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from schemas.auth import LoginRequest, ProfileUpdate
from services import auth_service

router = APIRouter()


@router.post("/login")
async def login(body: LoginRequest):
    try:
        result = auth_service.login(body.email, body.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
async def logout(user: Annotated[dict, Depends(get_current_user)]):
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(user: Annotated[dict, Depends(get_current_user)]):
    return user


@router.put("/me")
async def update_me(
    body: ProfileUpdate,
    user: Annotated[dict, Depends(get_current_user)],
):
    result = auth_service.update_profile(user["id"], body.model_dump())
    return result
