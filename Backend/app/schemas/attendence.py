from datetime import datetime

from pydantic import BaseModel


class AttendanceCreate(BaseModel):
    record_id: str
    student_id: str
    subject_code: str
    session_id: str
    is_present: bool
    marked_by: str


class AttendanceUpdate(BaseModel):
    is_present: bool | None = None
    marked_by: str | None = None


class AttendanceResponse(BaseModel):
    id: str
    record_id: str
    student_id: str
    subject_code: str
    session_id: str
    is_present: bool
    marked_by: str
    timestamp: datetime