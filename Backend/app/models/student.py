from datetime import datetime


class Student:

    def __init__(
        self,
        student_id,
        fullname,
        email,
        section,
        semester,
        address,
        user_id=None
    ):

        self.student_id = student_id
        self.fullname = fullname
        self.email = email
        self.section = section
        self.semester = semester
        self.address = address
        self.user_id = user_id
        self.created_at = datetime.utcnow()

    def to_dict(self):

        return {

            "student_id": self.student_id,

            "fullname": self.fullname,

            "email": self.email,

            "section": self.section,

            "semester": self.semester,

            "address": self.address,

            "user_id": self.user_id,

            "created_at": self.created_at
        }