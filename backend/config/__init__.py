import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from backend directory or parent directories
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/tourism_ai")

# Configure PyMongo client with robust SSL/TLS certificates and timeout
client_kwargs = {
    "serverSelectionTimeoutMS": 5000
}

try:
    import certifi
    client_kwargs["tlsCAFile"] = certifi.where()
except ImportError:
    pass

try:
    client = MongoClient(MONGO_URI, **client_kwargs)
except Exception as err:
    print("Warning initializing PyMongo client:", err)
    client = MongoClient("mongodb://localhost:27017/tourism_ai", serverSelectionTimeoutMS=5000)

# Use default database from MONGO_URI or fallback to 'tourism_ai'
try:
    db = client.get_default_database("tourism_ai")
except Exception:
    db = client["tourism_ai"]

users = db["users"]
reviews = db["reviews"]
hotel_bookings = db["hotel_bookings"]
flight_bookings = db["flight_bookings"]
contacts = db["contacts"]
