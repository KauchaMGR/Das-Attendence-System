from app.config.database import students, users
from app.models.student import Student
from app.models.user import User
from app.utils.password import hash_password


def create_student(student):

    existing = students.find_one(
        {
            "student_id": student.student_id
        }
    )

    if existing:
        raise ValueError("Student already exists")

    if users.find_one({"email": student.email}):
        raise ValueError("Email already exists")

    # Every new student gets a login account with a known default password,
    # so the admin has something to hand them immediately (no email/SMS flow).
    default_password = f"{student.student_id}@123"

    new_user = User(
        fullname=student.fullname,
        email=student.email,
        hashed_password=hash_password(default_password),
        role="student"
    )

    user_result = users.insert_one(new_user.to_dict())

    new_student = Student(
        student.student_id,
        student.fullname,
        student.email,
        student.section,
        student.semester,
        student.address,
        str(user_result.inserted_id)
    )

    result = students.insert_one(
        new_student.to_dict()
    )

    return str(result.inserted_id), default_password

#get all students
def get_students():

    student_list = []

    for student in students.find():

        student["_id"] = str(student["_id"])

        student_list.append(student)

    return student_list

#get one student
def get_student(student_id):

    student = students.find_one(
        {
            "student_id": student_id
        }
    )

    if not student:
        raise ValueError("Student not found")

    student["_id"] = str(student["_id"])

    return student

#update student
def update_student(student_id, data):

    result = students.update_one(

        {
            "student_id": student_id
        },

        {
            "$set": data
        }
    )

    if result.matched_count == 0:
        raise ValueError("Student not found")

    return "Student Updated Successfully"

#delete student
def delete_student(student_id):

    result = students.delete_one(
        {
            "student_id": student_id
        }
    )

    if result.deleted_count == 0:
        raise ValueError("Student not found")

    return "Student Deleted Successfully"