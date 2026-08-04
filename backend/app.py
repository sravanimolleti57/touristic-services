from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime

from config import (
    users,
    reviews,
    hotel_bookings,
    flight_bookings,
    contacts
)
import random
import joblib
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

app = Flask(__name__)
CORS(app)
model = joblib.load("models/model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    words = text.split()
    words = [w for w in words if w not in stop_words]
    words = [lemmatizer.lemmatize(w) for w in words]

    return " ".join(words)


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


# ---------------- BOOK FLIGHT ---------------- #

@app.route("/book-flight", methods=["POST"])
def book_flight():

    data = request.json

    booking = {
        "userEmail": data["userEmail"],
        "from": data["from"],
        "to": data["to"],
        "flightName": data["flightName"],
        "departureDate": data["departureDate"],
        "price": data["price"],
        "bookingDate": datetime.now()
    }

    result = flight_bookings.insert_one(booking)

    return jsonify({
        "message": "Flight booked successfully!",
        "bookingId": str(result.inserted_id)
    })


# ---------------- MY FLIGHTS ---------------- #

@app.route("/my-flights/<email>", methods=["GET"])
def my_flights(email):

    bookings = []

    for booking in flight_bookings.find({"userEmail": email}):
        booking["_id"] = str(booking["_id"])
        bookings.append(booking)

    return jsonify(bookings)


# ---------------- CANCEL FLIGHT ---------------- #

@app.route("/cancel-flight/<booking_id>", methods=["DELETE"])
def cancel_flight(booking_id):

    result = flight_bookings.delete_one({
        "_id": ObjectId(booking_id)
    })

    if result.deleted_count == 0:
        return jsonify({
            "message": "Flight booking not found."
        }), 404

    return jsonify({
        "message": "Flight booking cancelled successfully!"
    })
# ---------------- GET PROFILE ---------------- #

@app.route("/profile/<email>", methods=["GET"])
def get_profile(email):

    user = users.find_one(
        {"email": email},
        {"password": 0}
    )

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    user["_id"] = str(user["_id"])

    return jsonify(user)
# ---------------- UPDATE PROFILE ---------------- #

@app.route("/profile", methods=["PUT"])
def update_profile():

    data = request.json

    result = users.update_one(
        {"email": data["email"]},
        {
            "$set": {
                "name": data["name"]
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({
            "message": "User not found."
        }), 404

    return jsonify({
        "message": "Profile updated successfully!"
    })
# ---------------- CHANGE PASSWORD ---------------- #

@app.route("/change-password", methods=["POST"])
def change_password():

    data = request.json

    user = users.find_one({"email": data["email"]})

    if not user:
        return jsonify({
            "message": "User not found."
        }), 404

    if user["password"] != data["oldPassword"]:
        return jsonify({
            "message": "Old password is incorrect."
        }), 401

    users.update_one(
        {"email": data["email"]},
        {
            "$set": {
                "password": data["newPassword"]
            }
        }
    )

    return jsonify({
        "message": "Password changed successfully!"
    })
# ---------------- ANALYZE REVIEW ---------------- #

@app.route("/analyze-review", methods=["POST"])
def analyze_review():

    email = request.form.get("email")
    text = request.form.get("text", "")

    audio = request.files.get("audio")
    video = request.files.get("video")

    clean_text = preprocess(text)

    review_vector = vectorizer.transform([clean_text])

    prediction = model.predict(review_vector)[0]

    confidence = 98

    review = {
        "userEmail": email,
        "text": text,
        "audio": audio.filename if audio else "",
        "video": video.filename if video else "",
        "emotion": prediction,
        "confidence": confidence,
        "createdAt": datetime.now()
    }

    reviews.insert_one(review)

    return jsonify({
        "emotion": prediction,
        "confidence": confidence
    })
# ---------------- CONTACT ---------------- #

@app.route("/contact", methods=["POST"])
def contact():

    data = request.json

    contacts.insert_one({
        "name": data["name"],
        "email": data["email"],
        "subject": data["subject"],
        "message": data["message"],
        "createdAt": datetime.now()
    })

    return jsonify({
        "message": "Message stored successfully!"
    })
if __name__ == "__main__":
    app.run(debug=True)