from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from dependencies import require_admin
from schemas.branch import BranchCreate, BranchUpdate
from services import branch_service

router = APIRouter()


@router.get("")
async def list_branches(admin: Annotated[dict, Depends(require_admin)]):
    return branch_service.list_branches()


@router.post("")
async def create_branch(
    body: BranchCreate, admin: Annotated[dict, Depends(require_admin)]
):
    try:
        result = branch_service.create_branch(name=body.name, location=body.location)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{branch_id}")
async def get_branch(
    branch_id: str, admin: Annotated[dict, Depends(require_admin)]
):
    result = branch_service.get_branch(branch_id)
    if not result:
        raise HTTPException(status_code=404, detail="Branch not found")
    return result


@router.put("/{branch_id}")
async def update_branch(
    branch_id: str,
    body: BranchUpdate,
    admin: Annotated[dict, Depends(require_admin)],
):
    try:
        result = branch_service.update_branch(branch_id, body.model_dump(exclude_none=True))
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
