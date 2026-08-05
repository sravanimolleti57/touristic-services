import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from the backend folder (one level up from config/)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)

# Use the database name from Atlas (tourismDB matches the .env URI)
db = client["tourism_ai"]

users = db["users"]
reviews = db["reviews"]
hotel_bookings = db["hotel_bookings"]
flight_bookings = db["flight_bookings"]
contacts = db["contacts"]
