from datetime import datetime


class AttendanceRecord:
    def __init__(
        self,
        record_id: str,
        student_id: str,
        subject_code: str,
        session_id: str,
        is_present: bool,
        marked_by: str,
        confidence: float | None = None,
        timestamp: datetime | None = None,
    ):
        self.record_id = record_id
        self.student_id = student_id
        self.subject_code = subject_code
        self.session_id = session_id
        self.is_present = is_present
        self.marked_by = marked_by
        self.confidence = confidence
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "record_id": self.record_id,
            "student_id": self.student_id,
            "subject_code": self.subject_code,
            "session_id": self.session_id,
            "is_present": self.is_present,
            "marked_by": self.marked_by,
            "confidence": self.confidence,
            "timestamp": self.timestamp,
        }