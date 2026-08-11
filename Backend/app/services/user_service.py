from app.config.database import users


def list_users(role=None):

    query = {"role": role} if role else {}

    result = []

    for u in users.find(query):

        result.append(
            {
                "id": str(u["_id"]),
                "fullname": u["fullname"],
                "email": u["email"],
                "role": u["role"],
                "created_at": u.get("created_at")
            }
        )

    return result
