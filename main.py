import cv2
import ultralytics
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

print("OpenCV:", cv2.__version__)
print("Ultralytics Installed")
print("NumPy:", np.__version__)
app = FastAPI()
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