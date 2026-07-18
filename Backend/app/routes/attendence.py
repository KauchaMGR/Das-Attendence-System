from fastapi import APIRouter, Depends
from services.face_service import recognize_face
from database import get_db

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/mark")
async def mark_attendance(image: str, class_id: str, db=Depends(get_db)):
    result = await recognize_face(image, db, class_id)
    return result