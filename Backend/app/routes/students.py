from fastapi import APIRouter, HTTPException, status

from app.schemas.student_schema import (
    StudentCreate,
    StudentUpdate
)

from app.services.student_service import (
    create_student,
    get_students,
    get_student,
    update_student,
    delete_student
)

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# -----------------------------
# Create Student
# -----------------------------
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create(student: StudentCreate):

    try:

        student_id, default_password = create_student(student)

        return {
            "success": True,
            "message": "Student created successfully",
            "student_id": student_id,
            "default_password": default_password
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# -----------------------------
# Get All Students
# -----------------------------
@router.get("/")
def read_all():

    try:

        students = get_students()

        return {
            "success": True,
            "count": len(students),
            "students": students
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# -----------------------------
# Get One Student
# -----------------------------
@router.get("/{student_id}")
def read_one(student_id: str):

    try:

        student = get_student(student_id)

        return {
            "success": True,
            "student": student
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# -----------------------------
# Update Student
# -----------------------------
@router.put("/{student_id}")
def update(student_id: str, student: StudentUpdate):

    try:

        update_data = student.model_dump(
            exclude_unset=True
        )

        message = update_student(
            student_id,
            update_data
        )

        return {
            "success": True,
            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


# -----------------------------
# Delete Student
# -----------------------------
@router.delete("/{student_id}")
def delete(student_id: str):

    try:

        message = delete_student(student_id)

        return {
            "success": True,
            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )