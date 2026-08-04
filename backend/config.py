from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["tourism_ai"]

users = db["users"]
reviews = db["reviews"]
hotel_bookings = db["hotel_bookings"]
flight_bookings = db["flight_bookings"]
contacts = db["contacts"]