from pydantic import BaseModel, EmailStr
from typing import List, Optional


class FacultyCreate(BaseModel):

    faculty_id: str
    fullname: str
    email: EmailStr
    user_id: Optional[str] = None
    subjects_assigned: List[str] = []


class FacultyUpdate(BaseModel):

    fullname: Optional[str] = None
    email: Optional[EmailStr] = None
    subjects_assigned: Optional[List[str]] = None


class FacultyResponse(BaseModel):

    faculty_id: str
    fullname: str
    email: EmailStr
    user_id: Optional[str]
    subjects_assigned: List[str]