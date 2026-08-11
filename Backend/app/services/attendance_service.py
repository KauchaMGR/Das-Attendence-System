from datetime import datetime, timedelta, time
from uuid import uuid4

from app.config.database import attendance_records, capture_sessions, students, subjects
from app.models.attendance_record import AttendanceRecord
from app.models.capture_session import CaptureSession
from app.services.subject_service import get_subject
from app.services.settings_service import get_settings


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


# =============================================================================
# Reporting — real "last N days" data for the student/faculty/admin dashboards.
#
# Ground rule (see DOCUMENTATION.md §8): "last N days" means the N most recent
# CALENDAR days ending today. Saturday/Sunday inside that window never count
# as a school day — they're excluded from every held/attended/pct number
# below. `days` defaults to the admin-configurable `history_days` setting
# (see settings_service) wherever a caller doesn't pass one explicitly.
# =============================================================================

def _recent_dates(days):
    """Last `days` calendar dates ending today, oldest first, each tagged
    is_weekend (Python's Mon=0..Sun=6, so Sat=5/Sun=6)."""

    today = datetime.utcnow().date()

    return [
        {"date": today - timedelta(days=i), "is_weekend": (today - timedelta(days=i)).weekday() >= 5}
        for i in range(days - 1, -1, -1)
    ]


def _school_dates(days):
    """Same as _recent_dates, with Saturdays/Sundays filtered out."""

    return [d for d in _recent_dates(days) if not d["is_weekend"]]


def _day_bounds(d):
    start = datetime.combine(d, time.min)
    return start, start + timedelta(days=1)


def _window_or_filter(days):
    """Mongo filter matching `timestamp` against any school day in the last
    `days` — a $or of one range per school day, since a single continuous
    range would wrongly include weekends."""

    school_dates = _school_dates(days)

    if not school_dates:
        return {"timestamp": {"$in": []}}  # every day in range was a weekend

    ranges = []
    for entry in school_dates:
        start, end = _day_bounds(entry["date"])
        ranges.append({"timestamp": {"$gte": start, "$lt": end}})

    return {"$or": ranges}


def _default_threshold():
    return get_settings().get("min_attendance_pct", 75)


def get_subject_roster(subject_code, days=None):
    """
    Per-student held/attended/pct for one subject.

    `days=None` -> all-time (used by "My Students"). `days=<int>` -> restricted
    to that many recent school days (used by Reports/alerts, so the on-screen
    numbers and the CSV export come from the exact same call).

    Candidate students = students whose semester matches the subject's
    semester — the closest thing this data model has to a real enrollment
    link (there's no dedicated student<->subject collection; see
    DOCUMENTATION.md §8 for why).
    """

    subject = get_subject(subject_code)
    semester = subject.get("semester")
    candidates = list(students.find({"semester": semester}))

    base_query = {"subject_code": subject_code}
    if days is not None:
        base_query.update(_window_or_filter(days))

    held = capture_sessions.count_documents(base_query)

    roster = []
    for student in candidates:
        attended = attendance_records.count_documents({**base_query, "student_id": student["student_id"]})
        absent = max(held - attended, 0)
        pct = round((attended / held) * 100, 1) if held else 0.0

        roster.append({
            "student_id": student["student_id"],
            "fullname": student["fullname"],
            "email": student.get("email"),
            "section": student.get("section"),
            "semester": student.get("semester"),
            "held": held,
            "attended": attended,
            "absent": absent,
            "pct": pct,
        })

    roster.sort(key=lambda r: r["pct"])

    return {
        "subject_code": subject_code,
        "subject_name": subject["subject_name"],
        "held": held,
        "roster": roster,
    }


def get_low_attendance(subject_code, days, threshold_pct=None):
    """Students below `threshold_pct` (default: settings.min_attendance_pct)
    over the last `days` school days for one subject. Students with zero
    classes held in the window are skipped — "below threshold" is meaningless
    without at least one held class to measure against."""

    if threshold_pct is None:
        threshold_pct = _default_threshold()

    roster_data = get_subject_roster(subject_code, days)

    if roster_data["held"] == 0:
        return []

    return [
        {
            "student_id": r["student_id"],
            "fullname": r["fullname"],
            "held": r["held"],
            "attended": r["attended"],
            "pct": r["pct"],
        }
        for r in roster_data["roster"]
        if r["pct"] < threshold_pct
    ]


def get_session_records(subject_code, days=14):
    """One row per capture session held for this subject in the last `days`
    school days — present/absent/avg confidence. `absent` is measured against
    the subject's all-time roster size (how many students are in this class),
    not the windowed one, since a single day's absentee count needs the full
    class size as its denominator."""

    roster_size = len(get_subject_roster(subject_code)["roster"])
    school_dates = _school_dates(days)

    if not school_dates:
        return []

    ranges = [{"timestamp": {"$gte": s, "$lt": e}} for s, e in (_day_bounds(entry["date"]) for entry in school_dates)]

    sessions = capture_sessions.find({"subject_code": subject_code, "$or": ranges}).sort("timestamp", -1)

    records = []
    for session in sessions:
        start, end = _day_bounds(session["timestamp"].date())

        session_records = list(attendance_records.find({
            "subject_code": subject_code,
            "timestamp": {"$gte": start, "$lt": end},
        }))

        present = len(session_records)
        absent = max(roster_size - present, 0)
        confidences = [r["confidence"] for r in session_records if r.get("confidence") is not None]
        avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else None

        records.append({
            "date": session["timestamp"].date().isoformat(),
            "subject_code": subject_code,
            "present": present,
            "absent": absent,
            "avg_confidence": avg_confidence,
        })

    return records


def get_daily_trend(subject_code=None, days=14):
    """
    Daily % present over the last `days` school days, one bar per day a class
    was actually held (days with zero held classes are skipped, not shown as
    0% — there's nothing real to plot). `subject_code=None` aggregates across
    every subject that held a class that day (campus-wide, for Admin);
    otherwise scoped to one subject (for Faculty).
    """

    subject_codes = [subject_code] if subject_code else [
        s["subject_code"] for s in subjects.find({}, {"subject_code": 1})
    ]

    roster_size_by_subject = {}
    for code in subject_codes:
        try:
            roster_size_by_subject[code] = len(get_subject_roster(code)["roster"])
        except ValueError:
            roster_size_by_subject[code] = 0

    trend = []

    for entry in _school_dates(days):
        start, end = _day_bounds(entry["date"])

        held_codes = capture_sessions.find(
            {"timestamp": {"$gte": start, "$lt": end}, "subject_code": {"$in": subject_codes}},
            {"subject_code": 1}
        ).distinct("subject_code")

        if not held_codes:
            continue

        total_roster = sum(roster_size_by_subject.get(c, 0) for c in held_codes)

        if total_roster == 0:
            continue

        present = attendance_records.count_documents({
            "timestamp": {"$gte": start, "$lt": end},
            "subject_code": {"$in": held_codes},
        })

        trend.append({
            "date": entry["date"].isoformat(),
            "day_label": entry["date"].strftime("%a"),
            "held": len(held_codes),
            "present": present,
            "pct": round((present / total_roster) * 100, 1),
        })

    return trend


def get_admin_overview(days=14):
    """Everything the Admin Overview/Reports pages need, computed for real
    over the last `days` school days."""

    enrolled_students = students.count_documents({})

    today_start, today_end = _day_bounds(datetime.utcnow().date())
    scans_today = attendance_records.count_documents({"timestamp": {"$gte": today_start, "$lt": today_end}})

    school_dates = _school_dates(days)
    window_start = _day_bounds(school_dates[0]["date"])[0] if school_dates else today_start
    window_confidences = [
        r["confidence"] for r in attendance_records.find(
            {"timestamp": {"$gte": window_start}}, {"confidence": 1}
        ) if r.get("confidence") is not None
    ]
    avg_confidence = round(sum(window_confidences) / len(window_confidences), 1) if window_confidences else 0.0

    threshold_pct = _default_threshold()
    subject_averages = []
    low_attendance_ids = set()

    for subject in subjects.find():
        code = subject["subject_code"]
        roster_data = get_subject_roster(code, days)
        roster = roster_data["roster"]
        avg = round(sum(r["pct"] for r in roster) / len(roster), 1) if roster else 0.0
        subject_averages.append({"subject": subject["subject_name"], "avg": avg})

        if roster_data["held"]:
            for r in roster:
                if r["pct"] < threshold_pct:
                    low_attendance_ids.add(r["student_id"])

    return {
        "enrolled_students": enrolled_students,
        "scans_today": scans_today,
        "avg_confidence": avg_confidence,
        "daily_trend": get_daily_trend(None, days),
        "subject_averages": subject_averages,
        "low_attendance_count": len(low_attendance_ids),
    }
