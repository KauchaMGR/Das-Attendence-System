from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.services.recognition_service import (
    extract_all_embeddings,
    find_best_match
)

from app.services.face_service import get_all_faces

from app.services.attendance_service import (
    mark_attendance,
    log_session,
    get_records,
    get_student_summary
)

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@router.post("/mark")
async def mark(
    subject_code: str = Form(...),
    session_id: str = Form(...),
    marked_by: str = Form(...),
    image: UploadFile = File(...)
):

    try:

        image_bytes = await image.read()
        embeddings = extract_all_embeddings(image_bytes)

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    stored_faces = get_all_faces()
    matches = []

    for embedding in embeddings:

        match = find_best_match(embedding, stored_faces)

        if match:

            student_id, score = match

            mark_attendance(
                student_id,
                subject_code,
                session_id,
                marked_by,
                confidence=round(float(score), 4)
            )

            matches.append(
                {
                    "student_id": student_id,
                    "score": round(float(score), 4)
                }
            )

    log_session(session_id, subject_code, marked_by, len(matches))

    return {
        "success": True,
        "detected": len(embeddings),
        "matched": len(matches),
        "matches": matches
    }


@router.get("/student/{student_id}/summary")
def read_student_summary(student_id: str):

    return {
        "success": True,
        **get_student_summary(student_id)
    }


@router.get("/{session_id}")
def read_records(session_id: str):

    return {
        "success": True,
        "records": get_records(session_id)
    }
