from datetime import datetime


class Faculty:

    def __init__(
        self,
        faculty_id,
        fullname,
        email,
        user_id=None,
        subjects_assigned=None
    ):

        self.faculty_id = faculty_id
        self.fullname = fullname
        self.email = email
        self.user_id = user_id
        self.subjects_assigned = subjects_assigned or []
        self.created_at = datetime.utcnow()

    def to_dict(self):

        return {

            "faculty_id": self.faculty_id,

            "fullname": self.fullname,

            "email": self.email,

            "user_id": self.user_id,

            "subjects_assigned": self.subjects_assigned,

            "created_at": self.created_at
        }