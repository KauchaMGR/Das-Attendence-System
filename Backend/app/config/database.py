from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DB_NAME", "face_attendance_system")

client = MongoClient(MONGODB_URL)

db = client[DATABASE_NAME]

users = db["users"]
students = db["students"]
faculty = db["faculty"]
subjects = db["subjects"]
face_embeddings = db["face_embeddings"]
capture_sessions = db["capture_sessions"]
attendance_records = db["attendance_records"]
system_settings = db["system_settings"]