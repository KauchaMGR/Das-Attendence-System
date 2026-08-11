from fastapi import APIRouter

from app.schemas.settings_schema import SettingsUpdate
from app.services.settings_service import get_settings, update_settings

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


@router.get("/")
def read_settings():

    return {
        "success": True,
        "settings": get_settings()
    }


@router.put("/")
def update(data: SettingsUpdate):

    update_data = data.model_dump(exclude_unset=True)

    return {
        "success": True,
        "settings": update_settings(update_data)
    }
