from app.config.database import faculty
from app.models.faculty import Faculty


def create_faculty(data):

    existing = faculty.find_one(
        {
            "faculty_id": data.faculty_id
        }
    )

    if existing:
        raise ValueError("Faculty already exists")

    new_faculty = Faculty(
        data.faculty_id,
        data.fullname,
        data.email,
        data.user_id,
        data.subjects_assigned
    )

    result = faculty.insert_one(
        new_faculty.to_dict()
    )

    return str(result.inserted_id)


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