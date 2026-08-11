from fastapi import APIRouter, HTTPException, status

from app.schemas.faculty_schema import (
    FacultyCreate,
    FacultyUpdate
)

from app.services.faculty_service import (
    create_faculty,
    get_faculties,
    get_faculty,
    update_faculty,
    delete_faculty
)

router = APIRouter(
    prefix="/faculty",
    tags=["Faculty"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create(data: FacultyCreate):

    try:

        faculty_id, default_password = create_faculty(data)

        return {

            "success": True,

            "message": "Faculty created successfully",

            "faculty_id": faculty_id,

            "default_password": default_password
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/")
def read_all():

    return {

        "success": True,

        "faculty": get_faculties()
    }


@router.get("/{faculty_id}")
def read_one(faculty_id: str):

    try:

        return {

            "success": True,

            "faculty": get_faculty(faculty_id)
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put("/{faculty_id}")
def update(faculty_id: str, data: FacultyUpdate):

    try:

        update_data = data.model_dump(
            exclude_unset=True
        )

        message = update_faculty(
            faculty_id,
            update_data
        )

        return {

            "success": True,

            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.delete("/{faculty_id}")
def delete(faculty_id: str):

    try:

        message = delete_faculty(faculty_id)

        return {

            "success": True,

            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )