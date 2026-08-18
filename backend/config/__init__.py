import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

# Ensure stdout handles UTF-8 safely on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

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
    print("[INFO] Initialized MongoDB Client for:", MONGO_URI.split("@")[-1] if "@" in MONGO_URI else MONGO_URI)
except Exception as err:
    print("[WARNING] PyMongo client init error, using local fallback:", str(err))
    client = MongoClient("mongodb://localhost:27017/tourism_ai", serverSelectionTimeoutMS=5000)

# Use default database from MONGO_URI or fallback to 'tourism_ai'
try:
    db = client.get_default_database("tourism_ai")
except Exception:
    db = client["tourism_ai"]

users = db["users"]
reviews = db["reviews"]
hotels = db["hotels"]
hotel_bookings = db["hotel_bookings"]
flight_bookings = db["flight_bookings"]
destination_bookings = db["destination_bookings"]
contacts = db["contacts"]

