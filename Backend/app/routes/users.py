from typing import Optional

from fastapi import APIRouter

from app.services.user_service import list_users

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def read_all(role: Optional[str] = None):

    users = list_users(role)

    return {
        "success": True,
        "count": len(users),
        "users": users
    }
