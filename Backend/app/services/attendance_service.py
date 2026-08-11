from uuid import uuid4

from app.config.database import attendance_records, capture_sessions
from app.models.attendance_record import AttendanceRecord
from app.models.capture_session import CaptureSession


def mark_attendance(student_id, subject_code, session_id, marked_by, confidence=None):
    """
    Insert one attendance row for this student in this session, unless
    they're already marked present (capture can be run more than once
    per class without creating duplicate rows).
    """

    existing = attendance_records.find_one(
        {
            "student_id": student_id,
            "session_id": session_id
        }
    )

    if existing:
        return str(existing["_id"])

    record = AttendanceRecord(
        record_id=str(uuid4()),
        student_id=student_id,
        subject_code=subject_code,
        session_id=session_id,
        is_present=True,
        marked_by=marked_by,
        confidence=confidence
    )

    result = attendance_records.insert_one(
        record.to_dict()
    )

    return str(result.inserted_id)


def log_session(session_id, subject_code, triggered_by, recognized_count):
    """
    One `capture_sessions` document per distinct session_id — this is what
    lets "how many classes were held for this subject" be counted later
    (used by get_student_summary's `held` figure), since attendance_records
    only ever stores *present* rows.
    """

    existing = capture_sessions.find_one({"session_id": session_id})

    if existing:
        capture_sessions.update_one(
            {"session_id": session_id},
            {
                "$inc": {
                    "frames_captured": 1,
                    "total_recognized": recognized_count
                }
            }
        )
        return

    session = CaptureSession(
        session_id=session_id,
        subject_code=subject_code,
        triggered_by=triggered_by,
        frames_captured=1,
        total_recognized=recognized_count
    )

    capture_sessions.insert_one(session.to_dict())


def get_records(session_id):

    records = []

    for record in attendance_records.find({"session_id": session_id}):

        record["_id"] = str(record["_id"])

        records.append(record)

    return records


def get_student_summary(student_id):
    """
    Everything a student's dashboard needs in one call: per-subject
    held/attended/percentage, present/absent totals, and the raw record
    list (for a history table). "held" comes from capture_sessions (every
    /attendance/mark call for a subject logs one), "attended" from this
    student's own attendance_records rows.

    Known limitation: a subject only appears in `subjects` below if this
    student has at least one attendance row for it — a subject where the
    student has zero matches (fully absent every time) won't show up here.
    """

    records = list(attendance_records.find({"student_id": student_id}))

    for record in records:
        record["_id"] = str(record["_id"])

    records.sort(key=lambda r: r["timestamp"], reverse=True)

    subject_codes = {record["subject_code"] for record in records}

    subjects_summary = []
    present_total = 0
    absent_total = 0

    for code in subject_codes:

        held = capture_sessions.count_documents({"subject_code": code})
        attended = sum(1 for r in records if r["subject_code"] == code)
        absent = max(held - attended, 0)
        pct = round((attended / held) * 100, 1) if held else 0.0

        subjects_summary.append(
            {
                "subject_code": code,
                "held": held,
                "attended": attended,
                "pct": pct
            }
        )

        present_total += attended
        absent_total += absent

    return {
        "subjects": subjects_summary,
        "present_total": present_total,
        "absent_total": absent_total,
        "records": records
    }
