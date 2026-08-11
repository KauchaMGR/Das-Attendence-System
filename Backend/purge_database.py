"""
Purge every document from every collection this app uses.

This project runs on MongoDB (via pymongo), not a SQL database — there is
no .sql file that could apply here. This script is the Mongo-equivalent of
that request: it deletes every document from every collection, but leaves
the database and collection names themselves in place.

Run manually from Backend/:
    python purge_database.py            (asks for a typed "yes" first)
    python purge_database.py --yes      (skips the prompt)

Deliberately NOT wired into app startup — this is destructive and must
stay a manual, on-purpose action. See app/services/seed_service.py for
what DOES run automatically on startup (only ever creates missing default
accounts, never deletes anything).
"""
import sys

from app.config.database import (
    db,
    users,
    students,
    faculty,
    subjects,
    face_embeddings,
    capture_sessions,
    attendance_records,
)

COLLECTIONS = {
    "users": users,
    "students": students,
    "faculty": faculty,
    "subjects": subjects,
    "face_embeddings": face_embeddings,
    "capture_sessions": capture_sessions,
    "attendance_records": attendance_records,
}


def purge():

    print(f"About to permanently delete ALL documents from database '{db.name}':")

    for name, collection in COLLECTIONS.items():
        print(f"  - {name}: {collection.count_documents({})} document(s)")

    if "--yes" not in sys.argv and "-y" not in sys.argv:

        confirmation = input("\nType 'yes' to continue: ")

        if confirmation.strip().lower() != "yes":
            print("Aborted — nothing was deleted.")
            return

    print()

    for name, collection in COLLECTIONS.items():
        result = collection.delete_many({})
        print(f"  {name}: deleted {result.deleted_count}")

    print("\nPurge complete.")


if __name__ == "__main__":
    purge()
