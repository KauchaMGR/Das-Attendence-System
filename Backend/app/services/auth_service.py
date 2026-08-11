from datetime import datetime

from app.config.database import users, students, faculty
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token


def register_user(user):

    existing_user = users.find_one(
        {
            "email": user.email
        }
    )

    if existing_user:
        raise ValueError("Email already exists")

    hashed = hash_password(user.password)

    new_user = User(
        fullname=user.fullname,
        email=user.email,
        hashed_password=hashed,
        role=user.role,
        created_at=datetime.utcnow()
    )

    result = users.insert_one(new_user.to_dict())

    return str(result.inserted_id)

#login
def login_user(login_data):

    user = users.find_one(
        {
            "email": login_data.email
        }
    )

    if not user:
        raise ValueError("User not found")

    if not verify_password(
        login_data.password,
        user["hashed_password"]
    ):
        raise ValueError("Incorrect Password")

    user_id = str(user["_id"])

    profile = {}

    if user["role"] == "student":

        student = students.find_one({"user_id": user_id})

        if student:
            profile["student_id"] = student["student_id"]

    elif user["role"] == "faculty":

        f = faculty.find_one({"user_id": user_id})

        if f:
            profile["faculty_id"] = f["faculty_id"]
            profile["subjects_assigned"] = f.get("subjects_assigned", [])

    token = create_access_token(
        {
            "user_id": user_id,
            "email": user["email"],
            "role": user["role"],
            **profile
        }
    )

    return {
        "access_token": token,
        "role": user["role"],
        "fullname": user["fullname"],
        **profile
    }