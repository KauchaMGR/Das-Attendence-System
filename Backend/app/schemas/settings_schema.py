from pydantic import BaseModel
from typing import Optional


class SettingsUpdate(BaseModel):
    cosine_threshold: Optional[float] = None
    min_attendance_pct: Optional[int] = None
    session_timeout_minutes: Optional[int] = None
    email_alerts_enabled: Optional[bool] = None
    history_days: Optional[int] = None
