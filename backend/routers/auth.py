from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from database import supabase
from dependencies import get_current_user
from schemas.auth import LoginRequest, ProfileUpdate
from schemas.user import ActivationRequest
from services import auth_service, activation_service

router = APIRouter()


@router.post("/login")
async def login(body: LoginRequest):
    try:
        result = auth_service.login(body.email, body.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/activate")
async def activate(body: ActivationRequest):
    """Public endpoint: validate activation code and return a magic link token."""
    try:
        user_id = activation_service.validate_and_consume_code(body.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Get user email
    profile = (
        supabase.table("profiles")
        .select("email, is_active")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=404, detail="User not found")

    if not profile.data["is_active"]:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    email = profile.data["email"]

    # Generate a magic link token via Supabase admin API
    try:
        link_response = supabase.auth.admin.generate_link(
            {
                "type": "magiclink",
                "email": email,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate activation link")

    # Extract hashed_token from the response
    hashed_token = link_response.properties.hashed_token

    # Mark device as connected
    supabase.table("profiles").update(
        {"device_connected_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", user_id).execute()

    return {"token_hash": hashed_token, "email": email}


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
