from app.config.database import subjects
from app.models.subject import Subject


def create_subject(data):

    existing = subjects.find_one(
        {
            "subject_code": data.subject_code
        }
    )

    if existing:
        raise ValueError("Subject already exists")

    subject = Subject(
        data.subject_code,
        data.subject_name,
        data.credit_hour,
        data.semester,
        data.faculty_id
    )

    result = subjects.insert_one(
        subject.to_dict()
    )

    return str(result.inserted_id)


def get_subjects():

    subject_list = []

    for subject in subjects.find():

        subject["_id"] = str(subject["_id"])

        subject_list.append(subject)

    return subject_list


def get_subject(subject_code):

    subject = subjects.find_one(
        {
            "subject_code": subject_code
        }
    )

    if not subject:
        raise ValueError("Subject not found")

    subject["_id"] = str(subject["_id"])

    return subject


def update_subject(subject_code, update_data):

    result = subjects.update_one(

        {
            "subject_code": subject_code
        },

        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        raise ValueError("Subject not found")

    return "Subject updated successfully"


def delete_subject(subject_code):

    result = subjects.delete_one(
        {
            "subject_code": subject_code
        }
    )

    if result.deleted_count == 0:
        raise ValueError("Subject not found")

    return "Subject deleted successfully"