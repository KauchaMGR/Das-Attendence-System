from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import to load models at startup
#import models.face_model   # ← This line loads YOLO + InsightFace

#from routers import register, attendance

app = FastAPI(title="Smart Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(register.router)
# app.include_router(attendance.router)

@app.get("/")
async def root():
    return {"message": "Smart Attendance Backend is Running ✅"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

    #auth.py api router
    from fastapi import FastAPI

from app.routes.auth import router as auth_router

app = FastAPI(
    title="Face Recognition Attendance System"
)

app.include_router(auth_router)


@app.get("/")
def home():

    return {

        "message":"Attendance System API Running"
    }

from fastapi import FastAPI

from app.routes.auth import router as auth_router
from app.routes.students import router as student_router
from app.routes.faculty import router as faculty_router
from app.routes.subjects import router as subject_router
from app.routes.face import router as face_router


app = FastAPI(
    title="Face Recognition Attendance System"
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(faculty_router)
app.include_router(subject_router)
app.include_router(face_router)

@app.get("/")
def home():
    return {"message": "API Running"}