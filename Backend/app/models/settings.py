class SystemSettings:

    def __init__(
        self,
        cosine_threshold=0.6,
        min_attendance_pct=75,
        session_timeout_minutes=60,
        email_alerts_enabled=True,
        history_days=14
    ):
        self.cosine_threshold = cosine_threshold
        self.min_attendance_pct = min_attendance_pct
        self.session_timeout_minutes = session_timeout_minutes
        self.email_alerts_enabled = email_alerts_enabled
        self.history_days = history_days

    def to_dict(self):

        return {
            "cosine_threshold": self.cosine_threshold,
            "min_attendance_pct": self.min_attendance_pct,
            "session_timeout_minutes": self.session_timeout_minutes,
            "email_alerts_enabled": self.email_alerts_enabled,
            "history_days": self.history_days
        }
