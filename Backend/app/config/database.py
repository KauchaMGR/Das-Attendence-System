from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("mongodb://127.0.0.1:27017/attendance_db")
DATABASE_NAME = os.getenv("face_attendance_system")

client = MongoClient("mongodb://127.0.0.1:27017/attendance_db")

db = client["face_attendance_system"]

users = db["users"]
students = db["students"]
faculty = db["faculty"]
subjects = db["subjects"]
face_embeddings = db["face_embeddings"]
capture_sessions = db["capture_sessions"]
attendance_records = db["attendance_records"]