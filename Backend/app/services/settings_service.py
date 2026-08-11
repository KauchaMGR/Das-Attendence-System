from app.config.database import system_settings
from app.models.settings import SystemSettings

# Singleton document — this collection only ever holds one row. Same pattern
# as everything else in this project (plain dict in, plain dict out), just
# with update_one(..., upsert=True) instead of insert_one() on save.


def get_settings():

    settings = system_settings.find_one({})

    if not settings:

        settings = SystemSettings().to_dict()
        result = system_settings.insert_one(settings)
        settings["_id"] = result.inserted_id

    settings["_id"] = str(settings["_id"])

    return settings


def update_settings(data):

    system_settings.update_one(
        {},
        {"$set": data},
        upsert=True
    )

    return get_settings()
