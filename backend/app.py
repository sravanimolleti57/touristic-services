from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime

from config import (
    users,
    reviews,
    hotel_bookings,
    flight_bookings
)

app = Flask(__name__)
CORS(app)


# ---------------- HOME ---------------- #

@app.route("/")
def home():
    return jsonify({
        "message": "Tourism AI Backend Running Successfully!"
    })


# ---------------- REGISTER ---------------- #

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data["name"]
    email = data["email"]
    password = data["password"]

    existing = users.find_one({"email": email})

    if existing:
        return jsonify({
            "message": "Email already registered."
        }), 400

    users.insert_one({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({
        "message": "Registration Successful!"
    })


# ---------------- LOGIN ---------------- #

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data["email"]
    password = data["password"]

    user = users.find_one({"email": email})

    if not user:
        return jsonify({
            "message": "Please register first."
        }), 404

    if user["password"] != password:
        return jsonify({
            "message": "Incorrect Password."
        }), 401

    return jsonify({
        "message": "Login Successful!",
        "name": user["name"],
        "email": user["email"]
    })


# ---------------- TEXT REVIEW ---------------- #

@app.route("/review/text", methods=["POST"])
def add_text_review():

    data = request.json

    review = {
        "hotelId": data["hotelId"],
        "user": data["user"],
        "rating": data["rating"],
        "review": data["review"],
        "reviewType": "text",
        "createdAt": datetime.now()
    }

    result = reviews.insert_one(review)

    return jsonify({
        "message": "Review saved successfully!",
        "id": str(result.inserted_id)
    })


# ---------------- BOOK HOTEL ---------------- #

@app.route("/book-hotel", methods=["POST"])
def book_hotel():

    data = request.json

    booking = {
        "userEmail": data["userEmail"],
        "hotelName": data["hotelName"],
        "location": data["location"],
        "price": data["price"],
        "checkIn": data["checkIn"],
        "checkOut": data["checkOut"],
        "guests": data["guests"],
        "bookingDate": datetime.now()
    }

    result = hotel_bookings.insert_one(booking)

    return jsonify({
        "message": "Hotel booked successfully!",
        "bookingId": str(result.inserted_id)
    })


# ---------------- MY HOTELS ---------------- #

@app.route("/my-hotels/<email>", methods=["GET"])
def my_hotels(email):

    bookings = []

    for booking in hotel_bookings.find({"userEmail": email}):

        booking["_id"] = str(booking["_id"])
        bookings.append(booking)

    return jsonify(bookings)


# ---------------- CANCEL HOTEL ---------------- #

@app.route("/cancel-hotel/<booking_id>", methods=["DELETE"])
def cancel_hotel(booking_id):

    result = hotel_bookings.delete_one({
        "_id": ObjectId(booking_id)
    })

    if result.deleted_count == 0:
        return jsonify({
            "message": "Booking not found."
        }), 404

    return jsonify({
        "message": "Hotel booking cancelled successfully!"
    })


if __name__ == "__main__":
    app.run(debug=True)