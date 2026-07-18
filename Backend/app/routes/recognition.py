from fastapi import APIRouter, Depends
from models.user import User
from services.face_service import register_face
from database import get_db

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("/face")
async def register_student(user: User, image: str, db=Depends(get_db)):
    try:
        user_id = await register_face(image, user, db)
        return {"status": "success", "user_id": user_id, "message": "Student registered successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}