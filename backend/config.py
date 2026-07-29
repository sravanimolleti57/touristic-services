from pymongo import MongoClient

client = MongoClient("your_mongodb_connection_string")

db = client["tourism_ai"]

users = db["users"]
reviews = db["reviews"]

# NEW
hotel_bookings = db["hotel_bookings"]
flight_bookings = db["flight_bookings"]