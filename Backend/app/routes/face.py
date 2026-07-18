from fastapi import APIRouter, HTTPException, status

from app.schemas.face_schema import (
    FaceEmbeddingCreate,
    FaceEmbeddingUpdate
)

from app.services.face_service import (
    register_face,
    get_all_faces,
    get_face,
    update_face,
    delete_face
)

router = APIRouter(
    prefix="/faces",
    tags=["Face Embeddings"]
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create(data: FaceEmbeddingCreate):

    try:

        face_id = register_face(data)

        return {
            "success": True,
            "message": "Face Registered",
            "face_id": face_id
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
        "faces": get_all_faces()
    }


@router.get("/{student_id}")
def read_one(student_id: str):

    try:

        return {
            "success": True,
            "face": get_face(student_id)
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put("/{student_id}")
def update(student_id: str, data: FaceEmbeddingUpdate):

    try:

        update_data = data.model_dump(exclude_unset=True)

        message = update_face(
            student_id,
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


@router.delete("/{student_id}")
def delete(student_id: str):

    try:

        message = delete_face(student_id)

        return {
            "success": True,
            "message": message
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )