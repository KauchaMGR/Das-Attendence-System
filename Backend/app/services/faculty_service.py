from app.config.database import faculty, users
from app.models.faculty import Faculty
from app.models.user import User
from app.utils.password import hash_password


def create_faculty(data):

    existing = faculty.find_one(
        {
            "faculty_id": data.faculty_id
        }
    )

    if existing:
        raise ValueError("Faculty already exists")

    if users.find_one({"email": data.email}):
        raise ValueError("Email already exists")

    # Same pattern as students: a login account with a known default
    # password is created alongside the faculty profile.
    default_password = f"{data.faculty_id}@123"

    new_user = User(
        fullname=data.fullname,
        email=data.email,
        hashed_password=hash_password(default_password),
        role="faculty"
    )

    user_result = users.insert_one(new_user.to_dict())

    new_faculty = Faculty(
        data.faculty_id,
        data.fullname,
        data.email,
        str(user_result.inserted_id),
        data.subjects_assigned
    )

    result = faculty.insert_one(
        new_faculty.to_dict()
    )

    return str(result.inserted_id), default_password


def get_faculties():

    faculties = []

    for f in faculty.find():

        f["_id"] = str(f["_id"])

        faculties.append(f)

    return faculties


def get_faculty(faculty_id):

    f = faculty.find_one(
        {
            "faculty_id": faculty_id
        }
    )

    if not f:
        raise ValueError("Faculty not found")

    f["_id"] = str(f["_id"])

    return f


def update_faculty(faculty_id, update_data):

    result = faculty.update_one(

        {
            "faculty_id": faculty_id
        },

        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:

        raise ValueError("Faculty not found")

    return "Faculty updated successfully"


def delete_faculty(faculty_id):

    result = faculty.delete_one(
        {
            "faculty_id": faculty_id
        }
    )

    if result.deleted_count == 0:

        raise ValueError("Faculty not found")

    return "Faculty deleted successfully"