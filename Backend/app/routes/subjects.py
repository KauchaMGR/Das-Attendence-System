from fastapi import APIRouter, HTTPException, status

from app.schemas.subject_schema import (
    SubjectCreate,
    SubjectUpdate
)

from app.services.subject_service import (
    create_subject,
    get_subjects,
    get_subject,
    update_subject,
    delete_subject
)

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create(data: SubjectCreate):

    try:

        subject_id = create_subject(data)

        return {
            "success": True,
            "message": "Subject created successfully",
            "subject_id": subject_id
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
        "subjects": get_subjects()
    }


@router.get("/{subject_code}")
def read_one(subject_code: str):

    try:

        return {
            "success": True,
            "subject": get_subject(subject_code)
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put("/{subject_code}")
def update(subject_code: str, data: SubjectUpdate):

    try:

        update_data = data.model_dump(exclude_unset=True)

        message = update_subject(
            subject_code,
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


@router.delete("/{subject_code}")
def delete(subject_code: str):

    try:

        message = delete_subject(subject_code)

        return {
            "success": True,
            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )