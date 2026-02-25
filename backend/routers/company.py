from typing import Annotated

from fastapi import APIRouter, Depends

from dependencies import get_current_user, require_admin
from schemas.company import CompanyProfileUpdate
from services import company_service

router = APIRouter()


@router.get("")
async def get_company_profile(user: Annotated[dict, Depends(get_current_user)]):
    """Get the company profile. Any authenticated user can read."""
    profile = company_service.get_profile()
    if not profile:
        return {
            "id": "",
            "company_name": None,
            "address": None,
            "contact_phone": None,
            "contact_email": None,
            "receipt_footer": None,
            "updated_at": None,
        }
    return profile


@router.put("")
async def update_company_profile(
    body: CompanyProfileUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    """Update company profile. Admin only."""
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        profile = company_service.get_profile()
        return profile or {}
    return company_service.upsert_profile(data)
