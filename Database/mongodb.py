from pymongo import MongoClient


class MongoDB:
    """
    Handles connection to MongoDB and
    provides access to project collections.
    """

    def __init__(self):

        # Create a connection to the local MongoDB server
        self.client = MongoClient("mongodb://localhost:27017/")

        # Create (or connect to) the database
        self.database = self.client["smart_attendance"]

        # Create (or connect to) the collections
        self.students = self.database["students"]
        self.attendance = self.database["attendance"]

        print("MongoDB connected successfully.")