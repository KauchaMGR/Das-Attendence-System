from pymongo import MongoClient  # to establish connection betn python and mongodb
from datetime import datetime


class MongoDB:
    """Handles connection to MongoDB and provides access to project collections."""

    def __init__(self):

        # Create a connection to the local MongoDB server
        self.client = MongoClient("mongodb://localhost:27017/")

        # Create (or connect to) the database
        self.database = self.client["smart_attendance"]

        # Create (or connect to) the collections ie like table
        self.students = self.database["students"]
        self.attendance = self.database["attendance"]

        print("MongoDB connected successfully.")
        
    def get_all_students(self):
     return list(self.students.find())    

    def register_student(
        self, 
        student_id,
        name,
        department,
        semester,
        email,
        embeddings
    ):

        # Prevent duplicate student IDs
        existing = self.students.find_one({"student_id": student_id})

        if existing:
            print("Student already exists.")
            return False

        student = {
            "student_id": student_id,
            "name": name,
            "department": department,
            "semester": semester,
            "email": email,
            "embeddings": embeddings,
            "registered_at": datetime.now(),
        }

        self.students.insert_one(student) # saves the info of the student

        print("Student registered successfully.")

        return True
