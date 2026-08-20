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

# Load .env from candidate paths
potential_env_paths = [
    os.path.join(os.path.dirname(__file__), '..', '.env'),
    os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
    os.path.join(os.getcwd(), '.env'),
    os.path.join(os.getcwd(), 'backend', '.env')
]
for p in potential_env_paths:
    if os.path.exists(p):
        load_dotenv(p, override=True)
        break
else:
    load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/tourism_ai").strip()

# Configure PyMongo client with robust SSL/TLS certificates and timeout
client_kwargs = {
    "serverSelectionTimeoutMS": 8000,
    "connectTimeoutMS": 8000,
    "socketTimeoutMS": 8000
}

try:
    import certifi
    client_kwargs["tlsCAFile"] = certifi.where()
except ImportError:
    pass

try:
    client = MongoClient(MONGO_URI, **client_kwargs)
    # Validate connection immediately with a ping
    client.admin.command('ping')
    print("MongoDB connected successfully")
    print("Payment API ready")
    print("Razorpay Test Mode initialized")
except Exception as err:
    print(f"[ERROR] Failed to connect to MongoDB ({MONGO_URI.split('@')[-1] if '@' in MONGO_URI else 'localhost:27017'}): {err}")
    # If Atlas connection failed and local is not explicitly chosen, attempt local only as fallback
    if "mongodb+srv://" in MONGO_URI:
        print("[WARNING] Retrying with standard TLS settings...")
        try:
            client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=8000)
            client.admin.command('ping')
            print("MongoDB connected successfully (TLS fallback)")
            print("Payment API ready")
            print("Razorpay Test Mode initialized")
        except Exception as retry_err:
            print(f"[FATAL] MongoDB Atlas connection failed: {retry_err}")
            client = MongoClient(MONGO_URI, **client_kwargs)
    else:
        client = MongoClient(MONGO_URI, **client_kwargs)

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
destinations = db["destinations"]
activities = db["activities"]
travel_options = db["travel_options"]
wishlist = db["wishlist"]
user_activities = db["user_activities"]



