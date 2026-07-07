from src.database.mongodb import MongoDB


class RegistrationService:

    def __init__(self):

        self.database = MongoDB()

    def register(
        self,
        student_id,
        name,
        department,
        semester,
        email,
        embedding
    ):

        return self.database.register_student(
            student_id,
            name,
            department,
            semester,
            email,
            embedding
        )