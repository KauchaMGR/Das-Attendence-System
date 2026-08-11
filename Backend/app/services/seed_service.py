from app.config.database import users
from app.schemas.user_schema import UserCreate
from app.schemas.faculty_schema import FacultyCreate
from app.services.auth_service import register_user
from app.services.faculty_service import create_faculty

# Known credentials, printed to the console the first time they're created.
# Change the password after first login if this ever runs against anything
# other than a local/dev database.
DEFAULT_ADMIN = {
    "fullname": "System Admin",
    "email": "admin@example.com",
    "password": "Admin@123",
}

DEFAULT_FACULTY = [
    {"faculty_id": "FAC001", "fullname": "Prof. R. Karki", "email": "r.karki@example.com", "subjects_assigned": ["CS101"]},
    {"faculty_id": "FAC002", "fullname": "Prof. S. Gurung", "email": "s.gurung@example.com", "subjects_assigned": ["CS102"]},
]


def seed_admin():
    """Creates one default admin account — only if no admin exists yet."""

    if users.find_one({"role": "admin"}):
        return

    register_user(
        UserCreate(
            fullname=DEFAULT_ADMIN["fullname"],
            email=DEFAULT_ADMIN["email"],
            password=DEFAULT_ADMIN["password"],
            role="admin"
        )
    )

    print(f"[seed] created default admin — {DEFAULT_ADMIN['email']} / {DEFAULT_ADMIN['password']}")


def seed_faculty():
    """Creates the default faculty accounts, skipping any that already exist."""

    for entry in DEFAULT_FACULTY:

        try:

            _, default_password = create_faculty(
                FacultyCreate(
                    faculty_id=entry["faculty_id"],
                    fullname=entry["fullname"],
                    email=entry["email"],
                    subjects_assigned=[]
                )
            )

            print(f"[seed] created faculty {entry['faculty_id']} — {entry['email']} / {default_password}")

        except ValueError:
            # faculty_id or email already taken — already seeded (or created
            # manually since) — nothing to do.
            continue


def seed_defaults():
    """Called once on FastAPI startup (see main.py's lifespan). Idempotent —
    safe to run on every restart, only ever creates what's missing."""

    seed_admin()
    seed_faculty()
