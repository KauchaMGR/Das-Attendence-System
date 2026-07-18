from datetime import datetime


class CaptureSession:
    def __init__(
        self,
        session_id: str,
        subject_code: str,
        triggered_by: str,
        frames_captured: int,
        total_recognized: int,
        timestamp: datetime | None = None,
    ):
        self.session_id = session_id
        self.subject_code = subject_code
        self.triggered_by = triggered_by
        self.frames_captured = frames_captured
        self.total_recognized = total_recognized
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "subject_code": self.subject_code,
            "triggered_by": self.triggered_by,
            "frames_captured": self.frames_captured,
            "total_recognized": self.total_recognized,
            "timestamp": self.timestamp,
        }