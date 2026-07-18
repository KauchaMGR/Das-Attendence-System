from pydantic import BaseModel, EmailStr
from typing import Optional


class StudentCreate(BaseModel):
    student_id: str
    fullname: str
    email: EmailStr
    section: str
    semester: int
    address: str
    user_id: Optional[str] = None


class StudentUpdate(BaseModel):
    fullname: Optional[str] = None
    email: Optional[EmailStr] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    address: Optional[str] = None


class StudentResponse(BaseModel):
    student_id: str
    fullname: str
    email: EmailStr
    section: str
    semester: int
    address: str