from datetime import datetime

from pydantic import BaseModel


class CaptureSessionCreate(BaseModel):
    session_id: str
    subject_code: str
    triggered_by: str
    frames_captured: int
    total_recognized: int


class CaptureSessionUpdate(BaseModel):
    frames_captured: int | None = None
    total_recognized: int | None = None


class CaptureSessionResponse(BaseModel):
    id: str
    session_id: str
    subject_code: str
    triggered_by: str
    frames_captured: int
    total_recognized: int
    timestamp: datetime