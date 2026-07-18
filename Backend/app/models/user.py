from datetime import datetime


class User:
    def __init__(
        self,
        fullname: str,
        email: str,
        hashed_password: str,
        role: str,
        created_at: datetime | None = None,
    ):
        self.fullname = fullname
        self.email = email
        self.hashed_password = hashed_password
        self.role = role
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            "fullname": self.fullname,
            "email": self.email,
            "hashed_password": self.hashed_password,
            "role": self.role,
            "created_at": self.created_at,
        }