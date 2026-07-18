from fastapi import APIRouter, HTTPException

from app.schemas.user_schema import UserCreate, UserLogin

from app.services.auth_service import register_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserCreate):

    try:

        user_id = register_user(user)

        return {
            "message": "User Registered Successfully",
            "user_id": user_id
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login")
def login(login_data: UserLogin):

    try:

        token = login_user(login_data)

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except ValueError as e:

        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


@router.get("/me")
def get_me():

    return {

        "message": "Protected Route"
    }