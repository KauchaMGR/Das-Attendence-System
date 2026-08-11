"""
Seed realistic demo data — students, faculty, subjects, capture sessions,
and attendance records — so the dashboards have something real to show on
a fresh database instead of being empty.

This project runs on MongoDB (via pymongo), not a SQL database — there is
no .sql file that could apply here (see DOCUMENTATION.md §1.1, and the same
note in purge_database.py). This script is the Mongo-equivalent of a seed
.sql script: every document it inserts matches the same models/collections
the real app writes to (app/models/*.py, app/config/database.py), and it
tags every one of them `"demo": True` so they can be found and removed
again cleanly with --delete, without touching any real data.

Generates ~3 school-weeks (Mon-Fri only — no weekend sessions, matching the
DOCUMENTATION.md §8 rule the dashboards already assume) of capture sessions
and attendance records across 3 subjects, so every "last N days" widget
(Student heatmap, Faculty alerts/records/reports, Admin overview/reports)
has real, non-trivial data to render — including a couple of deliberately
low-attendance students so the low-attendance alerts aren't empty either.

Run manually from Backend/:
    python seed_demo_data.py            # insert demo data (safe to re-run — skips what already exists)
    python seed_demo_data.py --delete   # remove ONLY the demo-tagged documents (asks for a typed "yes" first)
    python seed_demo_data.py --delete --yes   # skips the confirmation prompt
"""
import random
import sys
from datetime import datetime, timedelta, time
from uuid import uuid4

from app.config.database import (
    users,
    students,
    faculty,
    subjects,
    capture_sessions,
    attendance_records,
)
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.subject import Subject
from app.models.attendance_record import AttendanceRecord
from app.models.capture_session import CaptureSession
from app.utils.password import hash_password

DEMO_FLAG = {"demo": True}

# 3 school-weeks of calendar days ending today — with weekends skipped
# (see _school_days below), this yields ~15 school days, comfortably
# covering the default 14-day dashboard window plus a bit of history.
WINDOW_DAYS = 21

# One faculty per subject, one subject per faculty — matches the
# one-faculty-one-subject rule the admin UI enforces (DOCUMENTATION.md §8).
SUBJECTS = [
    {"subject_code": "CS101", "subject_name": "Data Structures & Algorithms", "credit_hour": 3, "semester": 3, "faculty_id": "FACDEMO1"},
    {"subject_code": "CS102", "subject_name": "Operating Systems", "credit_hour": 3, "semester": 5, "faculty_id": "FACDEMO2"},
    {"subject_code": "CS103", "subject_name": "Database Systems", "credit_hour": 3, "semester": 5, "faculty_id": "FACDEMO3"},
]

FACULTY = [
    {"faculty_id": "FACDEMO1", "fullname": "Prof. Anita Sharma", "email": "anita.demo@example.com", "subjects_assigned": ["CS101"]},
    {"faculty_id": "FACDEMO2", "fullname": "Prof. Bikash Thapa", "email": "bikash.demo@example.com", "subjects_assigned": ["CS102"]},
    {"faculty_id": "FACDEMO3", "fullname": "Prof. Champa Gurung", "email": "champa.demo@example.com", "subjects_assigned": ["CS103"]},
]

# `rate` = the odds this student is marked present on any given school day
# (used only by seed_attendance below) — mostly high, with a couple of
# deliberately low outliers per class so low-attendance alerts have data.
STUDENTS = [
    # semester 3 -> CS101
    {"student_id": "STUDEMO01", "fullname": "Aarav Koirala", "email": "aarav.demo@example.com", "section": "A", "semester": 3, "address": "Kathmandu", "rate": 0.93},
    {"student_id": "STUDEMO02", "fullname": "Bishal Rana", "email": "bishal.demo@example.com", "section": "A", "semester": 3, "address": "Lalitpur", "rate": 0.88},
    {"student_id": "STUDEMO03", "fullname": "Cynthia Maharjan", "email": "cynthia.demo@example.com", "section": "A", "semester": 3, "address": "Bhaktapur", "rate": 0.91},
    {"student_id": "STUDEMO04", "fullname": "Deepak Shrestha", "email": "deepak.demo@example.com", "section": "A", "semester": 3, "address": "Kathmandu", "rate": 0.62},
    {"student_id": "STUDEMO05", "fullname": "Esha Tamang", "email": "esha.demo@example.com", "section": "B", "semester": 3, "address": "Bhaktapur", "rate": 0.95},
    {"student_id": "STUDEMO06", "fullname": "Farhan Ansari", "email": "farhan.demo@example.com", "section": "B", "semester": 3, "address": "Lalitpur", "rate": 0.48},

    # semester 5 -> CS102 and CS103
    {"student_id": "STUDEMO07", "fullname": "Gita Adhikari", "email": "gita.demo@example.com", "section": "A", "semester": 5, "address": "Kathmandu", "rate": 0.90},
    {"student_id": "STUDEMO08", "fullname": "Hari Bahadur Khadka", "email": "hari.demo@example.com", "section": "A", "semester": 5, "address": "Bhaktapur", "rate": 0.86},
    {"student_id": "STUDEMO09", "fullname": "Ishwori Basnet", "email": "ishwori.demo@example.com", "section": "A", "semester": 5, "address": "Kathmandu", "rate": 0.97},
    {"student_id": "STUDEMO10", "fullname": "Jeevan Lama", "email": "jeevan.demo@example.com", "section": "B", "semester": 5, "address": "Lalitpur", "rate": 0.55},
    {"student_id": "STUDEMO11", "fullname": "Kabita Rai", "email": "kabita.demo@example.com", "section": "B", "semester": 5, "address": "Bhaktapur", "rate": 0.89},
    {"student_id": "STUDEMO12", "fullname": "Lokesh Pradhan", "email": "lokesh.demo@example.com", "section": "B", "semester": 5, "address": "Kathmandu", "rate": 0.92},
    {"student_id": "STUDEMO13", "fullname": "Mina Gurung", "email": "mina.demo@example.com", "section": "B", "semester": 5, "address": "Lalitpur", "rate": 0.65},
    {"student_id": "STUDEMO14", "fullname": "Nabin Chettri", "email": "nabin.demo@example.com", "section": "A", "semester": 5, "address": "Bhaktapur", "rate": 0.94},
]

# Fixed class start time per subject, so every session for a subject lands
# at a consistent, plausible hour.
CLASS_HOUR = {"CS101": (9, 15), "CS102": (11, 0), "CS103": (13, 30)}


def seed_subjects():
    for s in SUBJECTS:
        if subjects.find_one({"subject_code": s["subject_code"]}):
            print(f"[skip] subject {s['subject_code']} already exists")
            continue

        doc = Subject(s["subject_code"], s["subject_name"], s["credit_hour"], s["semester"], s["faculty_id"]).to_dict()
        doc.update(DEMO_FLAG)
        subjects.insert_one(doc)
        print(f"[seed] subject {s['subject_code']} — {s['subject_name']}")


def seed_faculty():
    for f in FACULTY:
        if faculty.find_one({"faculty_id": f["faculty_id"]}):
            print(f"[skip] faculty {f['faculty_id']} already exists")
            continue

        password = f"{f['faculty_id']}@123"
        user_doc = User(fullname=f["fullname"], email=f["email"], hashed_password=hash_password(password), role="faculty").to_dict()
        user_doc.update(DEMO_FLAG)
        user_id = str(users.insert_one(user_doc).inserted_id)

        faculty_doc = Faculty(f["faculty_id"], f["fullname"], f["email"], user_id, f["subjects_assigned"]).to_dict()
        faculty_doc.update(DEMO_FLAG)
        faculty.insert_one(faculty_doc)
        print(f"[seed] faculty {f['faculty_id']} — {f['email']} / {password}")


def seed_students():
    for s in STUDENTS:
        if students.find_one({"student_id": s["student_id"]}):
            print(f"[skip] student {s['student_id']} already exists")
            continue

        password = f"{s['student_id']}@123"
        user_doc = User(fullname=s["fullname"], email=s["email"], hashed_password=hash_password(password), role="student").to_dict()
        user_doc.update(DEMO_FLAG)
        user_id = str(users.insert_one(user_doc).inserted_id)

        student_doc = Student(s["student_id"], s["fullname"], s["email"], s["section"], s["semester"], s["address"], user_id).to_dict()
        student_doc.update(DEMO_FLAG)
        students.insert_one(student_doc)
        print(f"[seed] student {s['student_id']} — {s['email']} / {password}")


def _school_days(window_days):
    """Last `window_days` calendar days ending today, Saturdays/Sundays
    excluded — same rule the dashboards apply (DOCUMENTATION.md §8)."""

    today = datetime.utcnow().date()
    return [
        d for d in (today - timedelta(days=i) for i in range(window_days - 1, -1, -1))
        if d.weekday() < 5
    ]


def seed_attendance():
    random.seed(20260811)  # fixed seed -> same demo numbers on every run

    for subject in SUBJECTS:
        code = subject["subject_code"]
        roster = [s for s in STUDENTS if s["semester"] == subject["semester"]]
        hour, minute = CLASS_HOUR[code]
        sessions_created = 0

        for day in _school_days(WINDOW_DAYS):
            session_id = f"{code}_{day.isoformat()}"

            if capture_sessions.find_one({"session_id": session_id}):
                continue  # already seeded this exact session — safe to re-run

            class_time = datetime.combine(day, time(hour, minute))
            present = [s for s in roster if random.random() < s["rate"]]

            for s in present:
                record = AttendanceRecord(
                    record_id=str(uuid4()),
                    student_id=s["student_id"],
                    subject_code=code,
                    session_id=session_id,
                    is_present=True,
                    marked_by=subject["faculty_id"],
                    confidence=round(random.uniform(0.82, 0.99), 4),
                    timestamp=class_time,
                ).to_dict()
                record.update(DEMO_FLAG)
                attendance_records.insert_one(record)

            session_doc = CaptureSession(
                session_id=session_id,
                subject_code=code,
                triggered_by=subject["faculty_id"],
                frames_captured=1,
                total_recognized=len(present),
                timestamp=class_time,
            ).to_dict()
            session_doc.update(DEMO_FLAG)
            capture_sessions.insert_one(session_doc)
            sessions_created += 1

        print(f"[seed] attendance for {code}: {sessions_created} session(s) created")


def delete_demo_data():
    collections = {
        "users": users,
        "students": students,
        "faculty": faculty,
        "subjects": subjects,
        "capture_sessions": capture_sessions,
        "attendance_records": attendance_records,
    }

    print("About to permanently delete every demo-tagged document:")
    for name, collection in collections.items():
        print(f"  - {name}: {collection.count_documents(DEMO_FLAG)} document(s)")

    if "--yes" not in sys.argv and "-y" not in sys.argv:
        confirmation = input("\nType 'yes' to continue: ")
        if confirmation.strip().lower() != "yes":
            print("Aborted — nothing was deleted.")
            return

    print()
    for name, collection in collections.items():
        result = collection.delete_many(DEMO_FLAG)
        print(f"  {name}: deleted {result.deleted_count}")

    print("\nDemo data removed. Real data (documents without the demo tag) was left untouched.")


def main():
    if "--delete" in sys.argv:
        delete_demo_data()
        return

    seed_subjects()
    seed_faculty()
    seed_students()
    seed_attendance()

    print(
        "\nDemo data ready. Log in with any demo email above and its printed "
        "password (login is by email, not ID) — e.g. anita.demo@example.com / FACDEMO1@123."
    )


if __name__ == "__main__":
    main()
