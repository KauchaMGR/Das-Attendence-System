from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.students import router as student_router
from app.routes.faculty import router as faculty_router
from app.routes.subjects import router as subject_router
from app.routes.face import router as face_router
from app.routes.attendance import router as attendance_router
from app.routes.settings import router as settings_router
from app.routes.users import router as user_router

from app.services.recognition_service import load_models
from app.services.seed_service import seed_defaults


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up the YuNet + SFace models once at boot instead of on the
    # first /faces/enroll or /attendance/mark request.
    load_models()

    # Idempotent — only creates the default admin/faculty accounts if
    # they don't already exist, so this is safe on every restart.
    seed_defaults()

    yield


app = FastAPI(
    title="Smart Attendance System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(subject_router)
app.include_router(face_router)
app.include_router(attendance_router)
app.include_router(settings_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"message": "Smart Attendance Backend API is Running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
