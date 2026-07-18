from app.config.database import students
from app.models.student import Student


def create_student(student):

    existing = students.find_one(
        {
            "student_id": student.student_id
        }
    )

    if existing:
        raise ValueError("Student already exists")

    new_student = Student(
        student.student_id,
        student.fullname,
        student.email,
        student.section,
        student.semester,
        student.address,
        student.user_id
    )

    result = students.insert_one(
        new_student.to_dict()
    )

    return str(result.inserted_id)

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