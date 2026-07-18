from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    role: Literal["student", "faculty", "admin"]


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    fullname: str | None = None
    email: EmailStr | None = None


class UserResponse(BaseModel):
    id: str
    fullname: str
    email: EmailStr
    role: str
    created_at: datetime