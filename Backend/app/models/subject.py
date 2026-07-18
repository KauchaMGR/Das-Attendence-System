from datetime import datetime


class Subject:

    def __init__(
        self,
        subject_code,
        subject_name,
        credit_hour,
        semester,
        faculty_id=None
    ):
        self.subject_code = subject_code
        self.subject_name = subject_name
        self.credit_hour = credit_hour
        self.semester = semester
        self.faculty_id = faculty_id
        self.created_at = datetime.utcnow()

    def to_dict(self):

        return {
            "subject_code": self.subject_code,
            "subject_name": self.subject_name,
            "credit_hour": self.credit_hour,
            "semester": self.semester,
            "faculty_id": self.faculty_id,
            "created_at": self.created_at
        }