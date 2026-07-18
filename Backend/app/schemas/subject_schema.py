from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    subject_code: str
    subject_name: str
    credit_hour: int
    semester: int
    faculty_id: Optional[str] = None


class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = None
    credit_hour: Optional[int] = None
    semester: Optional[int] = None
    faculty_id: Optional[str] = None


class SubjectResponse(BaseModel):
    subject_code: str
    subject_name: str
    credit_hour: int
    semester: int
    faculty_id: Optional[str]