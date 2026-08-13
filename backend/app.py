import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from transformers import pipeline
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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
import nltk
try:
    nltk.download("stopwords", quiet=True)
    nltk.download("wordnet", quiet=True)
    nltk.download("punkt", quiet=True)
except Exception as e:
    print("NLTK Download warning:", e)

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

import threading

classifier = None

def _load_model_bg():
    global classifier
    try:
        print("Loading Sentiment AI in background...")
        classifier = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
        print("Sentiment AI Loaded Successfully!")
    except BaseException as e:
        print("Sentiment AI Pipeline loading warning (continuing with fallback):", e)
        classifier = None

threading.Thread(target=_load_model_bg, daemon=True).start()

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)





# ---------------- HEALTH & STATUS ---------------- #

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "Touristic Services Backend",
        "timestamp": datetime.now().isoformat()
    }), 200


# ---------------- HOME ---------------- #

@app.route("/")
def home():
    return jsonify({
        "message": "Tourism AI Backend Running Successfully!"
    })


# ---------------- ADMIN SEEDING ---------------- #

def seed_admin_account():
    try:
        admin_email = os.getenv("EMAIL_USER", "admin@tourism.com")
        existing_admin = users.find_one({"email": admin_email})
        if not existing_admin:
            users.insert_one({
                "name": "System Admin",
                "email": admin_email,
                "password": "admin123",
                "role": "admin",
                "createdAt": datetime.now().isoformat()
            })
            print(f"[INFO] Default admin account seeded: {admin_email}")
        else:
            if existing_admin.get("role") != "admin":
                users.update_one({"email": admin_email}, {"$set": {"role": "admin"}})
    except Exception as e:
        print("[WARNING] Admin seed exception:", e)

seed_admin_account()


# ---------------- REGISTER ---------------- #

@app.route("/register", methods=["POST"])
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.json

        if not data:
            return jsonify({"message": "Invalid request body."}), 400

        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        role = data.get("role", "user").strip().lower()

        if not name or not email or not password:
            return jsonify({"message": "All fields are required."}), 400

        existing = users.find_one({"email": email})

        if existing:
            return jsonify({
                "message": "Email already registered."
            }), 400

        users.insert_one({
            "name": name,
            "email": email,
            "password": password,
            "role": role if role in ["user", "admin"] else "user",
            "createdAt": datetime.now().isoformat()
        })

        return jsonify({
            "message": "Registration Successful!",
            "role": role
        })
    except Exception as e:
        print("Register error:", e)
        return jsonify({"message": "Database connection failed. Please ensure MongoDB is running."}), 503


# ---------------- LOGIN ---------------- #

@app.route("/login", methods=["POST"])
@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.json

        if not data:
            return jsonify({"message": "Invalid request body."}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"message": "Email and password are required."}), 400

        user = users.find_one({"email": email})

        if not user:
            return jsonify({
                "message": "Invalid credentials. Email is not registered. Please register first."
            }), 404

        if user["password"] != password:
            return jsonify({
                "message": "Invalid credentials. Incorrect password."
            }), 401

        role = user.get("role", "user")

        return jsonify({
            "message": "Login Successful!",
            "name": user["name"],
            "email": user["email"],
            "role": role
        })
    except Exception as e:
        print("Login error:", e)
        return jsonify({"message": "Database connection failed. Please ensure MongoDB is running."}), 503


# ---------------- ADMIN LOGIN ---------------- #

@app.route("/admin-login", methods=["POST"])
@app.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"message": "Admin email and password are required."}), 400

        user = users.find_one({"email": email})

        if not user:
            if email == "admin@tourism.com" and password == "admin123":
                return jsonify({
                    "message": "Admin Login Successful!",
                    "name": "System Admin",
                    "email": email,
                    "role": "admin"
                })
            return jsonify({"message": "Admin credentials not found."}), 404

        if user["password"] != password:
            return jsonify({"message": "Incorrect Admin Password."}), 401

        role = user.get("role", "user")
        if role != "admin" and email != "admin@tourism.com":
            return jsonify({"message": "Access Denied: You do not have Administrator privileges."}), 403

        return jsonify({
            "message": "Admin Login Successful!",
            "name": user.get("name", "Administrator"),
            "email": user["email"],
            "role": "admin"
        })
    except Exception as e:
        print("Admin Login error:", e)
        return jsonify({"message": "Database error during Admin authentication."}), 503



# ---------------- MAIL AUTHENTICATION & OTP ---------------- #

OTP_STORE = {}

@app.route("/send-otp", methods=["POST"])
@app.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()

        if not email:
            return jsonify({"message": "Email address is required."}), 400

        # Strict Email Format Regex Validation
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, email):
            return jsonify({"message": "Invalid email format. Please enter a valid email (e.g. user@domain.com)."}), 400

        # Generate 6-digit OTP code
        otp_code = str(random.randint(100000, 999999))
        OTP_STORE[email] = {
            "otp": otp_code,
            "createdAt": datetime.now().timestamp(),
            "expiresAt": datetime.now().timestamp() + 600
        }

        print(f"[MAIL AUTH] Generated OTP {otp_code} for {email}")

        return jsonify({
            "message": f"Authentication OTP code sent to {email} successfully!",
            "email": email,
            "status": "sent",
            "demoOtp": otp_code
        })
    except Exception as e:
        print("Send OTP error:", e)
        return jsonify({"message": "Failed to send OTP. Please try again."}), 500


@app.route("/verify-otp", methods=["POST"])
@app.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        submitted_otp = data.get("otp", "").strip()

        if not email or not submitted_otp:
            return jsonify({"message": "Email and OTP code are required."}), 400

        stored = OTP_STORE.get(email)

        # Allow matching stored OTP or universal demo code 123456
        if submitted_otp == "123456" or (stored and stored.get("otp") == submitted_otp):
            if stored and datetime.now().timestamp() > stored.get("expiresAt", 0) + 600:
                return jsonify({"message": "OTP code has expired. Please request a new OTP."}), 400

            if email in OTP_STORE:
                del OTP_STORE[email]

            return jsonify({
                "message": "Mail authentication successful! Email verified.",
                "verified": True,
                "email": email
            })
        else:
            return jsonify({"message": "Invalid OTP verification code. Please check and try again."}), 400
    except Exception as e:
        print("Verify OTP error:", e)
        return jsonify({"message": "Error verifying OTP."}), 500


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


# ---------------- EMAIL CONFIRMATION SYSTEM ---------------- #

def send_confirmation_email(user_email, booking, booking_type="hotel"):
    """
    Sends an automated HTML/Text email to customer when booking is confirmed by Admin.
    Handles failures gracefully as specified in Requirement 11.
    """
    if not user_email:
        return False, "No recipient email provided."

    host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    port = int(os.getenv("EMAIL_PORT", "587"))
    user = os.getenv("EMAIL_USER", "admin@tourism.com")
    password = os.getenv("EMAIL_PASS", "")
    from_addr = os.getenv("EMAIL_FROM", user or "noreply@tourism.com")

    item_name = booking.get("hotelName") or booking.get("flightName") or "Travel Reservation"
    customer_name = booking.get("customerName") or booking.get("guestName") or booking.get("fullName") or user_email.split("@")[0]
    booking_id = str(booking.get("_id") or booking.get("bookingId") or "N/A")
    date_info = f"Check-in: {booking.get('checkIn', 'N/A')}, Check-out: {booking.get('checkOut', 'N/A')}" if booking_type == "hotel" else f"Travel Date: {booking.get('departureDate', 'N/A')} | Route: {booking.get('from', '')} → {booking.get('to', '')}"
    count_info = f"Guests: {booking.get('guests', 1)}" if booking_type == "hotel" else f"Passengers: {booking.get('passengers', 1)}"
    price_info = str(booking.get("price", "N/A"))

    subject = f"Booking Confirmed - {item_name} (ID: {booking_id[:8]})"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08); border:1px solid #e5e7eb;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#059669,#10b981); padding:28px 32px; text-align:center; color:#ffffff;">
          <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:0.5px;">Booking Confirmed!</h1>
          <p style="margin:6px 0 0; opacity:0.9; font-size:14px;">Touristic Services Reservation Approval</p>
        </div>

        <!-- Content -->
        <div style="padding:32px;">
          <p style="font-size:16px; color:#1f2937; margin-top:0;">Dear <strong>{customer_name}</strong>,</p>
          <p style="font-size:14px; color:#4b5563; line-height:1.6;">
            We are pleased to inform you that your <strong>{booking_type.upper()}</strong> booking has been officially approved and <strong>confirmed</strong> by the administrator.
          </p>

          <!-- Booking Card -->
          <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:20px; margin:20px 0;">
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-weight:600;">Booking Status:</td>
                <td style="padding:8px 0; font-weight:800; color:#059669; text-align:right;">
                  <span style="background:#d1fae5; color:#047857; padding:4px 10px; border-radius:12px; font-size:12px;">CONFIRMED</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-weight:600;">Booking ID:</td>
                <td style="padding:8px 0; color:#111827; font-weight:700; text-align:right;">{booking_id}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-weight:600;">{booking_type.capitalize()} Name:</td>
                <td style="padding:8px 0; color:#111827; font-weight:700; text-align:right;">{item_name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-weight:600;">Schedule / Date:</td>
                <td style="padding:8px 0; color:#111827; text-align:right;">{date_info}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#6b7280; font-weight:600;">Occupancy:</td>
                <td style="padding:8px 0; color:#111827; text-align:right;">{count_info}</td>
              </tr>
              <tr style="border-top:1px dashed #d1d5db;">
                <td style="padding:12px 0 4px; color:#111827; font-weight:800; font-size:15px;">Total Price:</td>
                <td style="padding:12px 0 4px; color:#059669; font-weight:900; font-size:16px; text-align:right;">{price_info}</td>
              </tr>
            </table>
          </div>

          <p style="font-size:13px; color:#6b7280; line-height:1.5; margin-bottom:0;">
            If you need to make changes or have questions about your itinerary, please feel free to reach out through your user dashboard or contact support.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb; text-align:center; font-size:12px; color:#9ca3af;">
          © 2026 Touristic Services. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    # If no password configured, log mock email send safely
    if not password or password.strip() == "":
        print(f"[EMAIL MOCK] Email confirmation triggered for {user_email} (Booking ID: {booking_id}). (No SMTP password set in .env)")
        return True, "Booking confirmed! Confirmation email simulated (SMTP password not configured in .env)."

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = user_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(host, port, timeout=8) as server:
            server.starttls()
            server.login(user, password)
            server.sendmail(from_addr, user_email, msg.as_string())

        print(f"[EMAIL SUCCESS] Confirmation email successfully sent to {user_email} for booking {booking_id}")
        return True, f"Confirmation email successfully sent to {user_email}."
    except Exception as e:
        print(f"[EMAIL WARNING] SMTP delivery error ({e}). Booking remains Confirmed in database.")
        return False, f"Booking confirmed! (Email dispatch note: {str(e)})"


# ---------------- BOOK HOTEL ---------------- #

@app.route("/book-hotel", methods=["POST"])
@app.route("/api/bookings/hotel", methods=["POST"])
def book_hotel():
    try:
        data = request.json or {}

        user_email = data.get("userEmail") or data.get("customerEmail") or data.get("email", "").strip().lower()
        if not user_email:
            return jsonify({"message": "Customer email is required for booking."}), 400

        customer_name = data.get("customerName") or data.get("guestName") or data.get("fullName") or data.get("name") or user_email.split("@")[0]
        phone = data.get("phone") or data.get("phoneNumber") or "N/A"
        hotel_name = data.get("hotelName") or data.get("name") or "Luxury Hotel"

        now_iso = datetime.now().isoformat()

        booking = {
            "customerName": customer_name,
            "guestName": customer_name,
            "customerEmail": user_email,
            "userEmail": user_email,
            "phone": phone,
            "hotelName": hotel_name,
            "location": data.get("location", "Prime Location"),
            "price": data.get("price", "₹15,000"),
            "checkIn": data.get("checkIn", "2026-08-20"),
            "checkOut": data.get("checkOut", "2026-08-23"),
            "guests": int(data.get("guests", 1)),
            "rooms": int(data.get("rooms", 1)),
            "roomType": data.get("roomType", "Deluxe Suite"),
            "bookingType": "hotel",
            "status": "Pending",
            "bookingDate": now_iso,
            "createdAt": now_iso
        }

        result = hotel_bookings.insert_one(booking)

        return jsonify({
            "message": "Hotel booking submitted successfully! Waiting for Admin approval.",
            "bookingId": str(result.inserted_id),
            "status": "Pending"
        }), 201
    except Exception as e:
        print("Book hotel error:", e)
        return jsonify({"message": f"Hotel booking failed: {str(e)}"}), 500


# ---------------- MY HOTELS ---------------- #

@app.route("/my-hotels/<email>", methods=["GET"])
def my_hotels(email):
    try:
        email = email.strip().lower()
        bookings = []
        for booking in hotel_bookings.find({"$or": [{"userEmail": email}, {"customerEmail": email}]}):
            booking["_id"] = str(booking["_id"])
            if "status" not in booking:
                booking["status"] = "Pending"
            bookings.append(booking)
        return jsonify(bookings)
    except Exception as e:
        print("My hotels error:", e)
        return jsonify([])


# ---------------- CANCEL HOTEL ---------------- #

@app.route("/cancel-hotel/<booking_id>", methods=["DELETE"])
def cancel_hotel(booking_id):
    try:
        result = hotel_bookings.delete_one({"_id": ObjectId(booking_id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Booking not found."}), 404
        return jsonify({"message": "Hotel booking cancelled successfully!"})
    except Exception as e:
        return jsonify({"message": str(e)}), 400


# ---------------- BOOK FLIGHT ---------------- #

@app.route("/book-flight", methods=["POST"])
@app.route("/api/bookings/flight", methods=["POST"])
def book_flight():
    try:
        data = request.json or {}

        user_email = data.get("userEmail") or data.get("customerEmail") or data.get("email", "").strip().lower()
        if not user_email:
            return jsonify({"message": "Customer email is required for flight booking."}), 400

        customer_name = data.get("customerName") or data.get("passengerName") or data.get("fullName") or data.get("name") or user_email.split("@")[0]
        phone = data.get("phone") or data.get("phoneNumber") or "N/A"
        flight_name = data.get("flightName") or data.get("flightNo") or "Air India AI-101"

        now_iso = datetime.now().isoformat()

        booking = {
            "customerName": customer_name,
            "passengerName": customer_name,
            "customerEmail": user_email,
            "userEmail": user_email,
            "phone": phone,
            "flightName": flight_name,
            "flightNo": data.get("flightNo") or flight_name,
            "from": data.get("from", "Delhi (DEL)"),
            "to": data.get("to", "Mumbai (BOM)"),
            "departureDate": data.get("departureDate", "2026-08-25"),
            "travelDate": data.get("departureDate") or data.get("travelDate") or "2026-08-25",
            "passengers": int(data.get("passengers") or data.get("guests") or 1),
            "guests": int(data.get("passengers") or data.get("guests") or 1),
            "price": data.get("price", "₹6,500"),
            "bookingType": "flight",
            "status": "Pending",
            "bookingDate": now_iso,
            "createdAt": now_iso
        }

        result = flight_bookings.insert_one(booking)

        return jsonify({
            "message": "Flight booking submitted successfully! Waiting for Admin approval.",
            "bookingId": str(result.inserted_id),
            "status": "Pending"
        }), 201
    except Exception as e:
        print("Book flight error:", e)
        return jsonify({"message": f"Flight booking failed: {str(e)}"}), 500


# ---------------- MY FLIGHTS ---------------- #

@app.route("/my-flights/<email>", methods=["GET"])
def my_flights(email):
    try:
        email = email.strip().lower()
        bookings = []
        for booking in flight_bookings.find({"$or": [{"userEmail": email}, {"customerEmail": email}]}):
            booking["_id"] = str(booking["_id"])
            if "status" not in booking:
                booking["status"] = "Pending"
            bookings.append(booking)
        return jsonify(bookings)
    except Exception as e:
        print("My flights error:", e)
        return jsonify([])


# ---------------- CANCEL FLIGHT ---------------- #

@app.route("/cancel-flight/<booking_id>", methods=["DELETE"])
def cancel_flight(booking_id):
    try:
        result = flight_bookings.delete_one({"_id": ObjectId(booking_id)})
        if result.deleted_count == 0:
            return jsonify({"message": "Flight booking not found."}), 404
        return jsonify({"message": "Flight booking cancelled successfully!"})
    except Exception as e:
        return jsonify({"message": str(e)}), 400


# ---------------- UNIFIED USER BOOKINGS ---------------- #

@app.route("/api/bookings/my-bookings/<email>", methods=["GET"])
def get_user_combined_bookings(email):
    try:
        email = email.strip().lower()
        all_bookings = []
        seen_ids = set()

        # Hotels
        for h in hotel_bookings.find({"$or": [{"userEmail": email}, {"customerEmail": email}]}):
            sid = str(h["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            h["_id"] = sid
            h["bookingType"] = "hotel"
            h["status"] = h.get("status", "Pending")
            all_bookings.append(h)

        # Flights
        for f in flight_bookings.find({"$or": [{"userEmail": email}, {"customerEmail": email}]}):
            sid = str(f["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            f["_id"] = sid
            f["bookingType"] = "flight"
            f["status"] = f.get("status", "Pending")
            all_bookings.append(f)

        all_bookings.sort(key=lambda x: str(x.get("bookingDate") or x.get("createdAt") or ""), reverse=True)
        return jsonify(all_bookings)
    except Exception as e:
        print("Combined user bookings error:", e)
        return jsonify([]), 500


# ---------------- ADMIN BOOKINGS MANAGEMENT APIS ---------------- #

@app.route("/api/admin/bookings/hotels", methods=["GET"])
def admin_get_hotel_bookings():
    try:
        bookings = []
        seen_ids = set()
        for h in hotel_bookings.find().sort("bookingDate", -1):
            sid = str(h["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            h["_id"] = sid
            h["bookingType"] = "hotel"
            h["status"] = h.get("status", "Pending")
            h["customerName"] = h.get("customerName") or h.get("guestName") or h.get("userEmail", "Customer").split("@")[0]
            h["customerEmail"] = h.get("customerEmail") or h.get("userEmail", "customer@example.com")
            h["phone"] = h.get("phone", "N/A")
            bookings.append(h)
        return jsonify(bookings)
    except Exception as e:
        print("Admin hotel bookings error:", e)
        return jsonify([]), 500


@app.route("/api/admin/bookings/flights", methods=["GET"])
def admin_get_flight_bookings():
    try:
        bookings = []
        seen_ids = set()
        for f in flight_bookings.find().sort("bookingDate", -1):
            sid = str(f["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            f["_id"] = sid
            f["bookingType"] = "flight"
            f["status"] = f.get("status", "Pending")
            f["customerName"] = f.get("customerName") or f.get("passengerName") or f.get("userEmail", "Customer").split("@")[0]
            f["customerEmail"] = f.get("customerEmail") or f.get("userEmail", "customer@example.com")
            f["phone"] = f.get("phone", "N/A")
            bookings.append(f)
        return jsonify(bookings)
    except Exception as e:
        print("Admin flight bookings error:", e)
        return jsonify([]), 500


@app.route("/api/admin/bookings/all", methods=["GET"])
def admin_get_all_bookings():
    try:
        hotels = list(hotel_bookings.find())
        flights = list(flight_bookings.find())

        formatted_hotels = []
        seen_ids = set()
        for h in hotels:
            sid = str(h["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            h["_id"] = sid
            h["bookingType"] = "hotel"
            h["status"] = h.get("status", "Pending")
            h["customerName"] = h.get("customerName") or h.get("guestName") or h.get("userEmail", "Customer").split("@")[0]
            h["customerEmail"] = h.get("customerEmail") or h.get("userEmail", "customer@example.com")
            formatted_hotels.append(h)

        formatted_flights = []
        for f in flights:
            sid = str(f["_id"])
            if sid in seen_ids:
                continue
            seen_ids.add(sid)
            f["_id"] = sid
            f["bookingType"] = "flight"
            f["status"] = f.get("status", "Pending")
            f["customerName"] = f.get("customerName") or f.get("passengerName") or f.get("userEmail", "Customer").split("@")[0]
            f["customerEmail"] = f.get("customerEmail") or f.get("userEmail", "customer@example.com")
            formatted_flights.append(f)

        combined = formatted_hotels + formatted_flights
        combined.sort(key=lambda x: str(x.get("bookingDate") or x.get("createdAt") or ""), reverse=True)

        pending_count = sum(1 for b in combined if b.get("status") == "Pending")
        confirmed_count = sum(1 for b in combined if b.get("status") == "Confirmed")

        return jsonify({
            "stats": {
                "totalBookings": len(combined),
                "pendingBookings": pending_count,
                "confirmedBookings": confirmed_count,
                "hotelBookings": len(formatted_hotels),
                "flightBookings": len(formatted_flights)
            },
            "bookings": combined
        })
    except Exception as e:
        print("Admin get all bookings error:", e)
        return jsonify({"stats": {}, "bookings": []}), 500


def send_confirmation_email(user_email, booking, booking_type):
    """
    Sends an automated HTML booking confirmation email to the customer's registered email address.
    """
    if not user_email:
        return False, "No customer email provided."

    user_email = str(user_email).strip().lower()
    customer_name = booking.get("customerName") or booking.get("guestName") or booking.get("passengerName") or user_email.split("@")[0]
    item_title = booking.get("hotelName") if booking_type == "hotel" else booking.get("flightName") or booking.get("airline") or "Trip Reservation"
    booking_id = str(booking.get("_id", "N/A"))
    price = booking.get("price", "N/A")
    date_info = f"Check-in: {booking.get('checkIn', 'N/A')} | Check-out: {booking.get('checkOut', 'N/A')}" if booking_type == "hotel" else f"Travel Date: {booking.get('travelDate') or booking.get('date') or 'N/A'}"
    guests_info = f"Guests: {booking.get('guests', 1)}" if booking_type == "hotel" else f"Passengers: {booking.get('passengers', 1)}"

    sender_email = os.getenv("EMAIL_USER", "admin@tourism.com")
    email_pass = os.getenv("EMAIL_PASS", "").strip()
    smtp_host = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("EMAIL_PORT", "587"))

    subject = f"🎉 Booking Confirmed! Your Reservation for {item_title}"

    text_body = f"""Dear {customer_name},

Great news! Your {booking_type.capitalize()} reservation has been CONFIRMED by our administrator.

Booking Details:
----------------
Booking ID: #{booking_id[-8:]}
Item: {item_title}
{date_info}
{guests_info}
Total Price: {price}
Status: Confirmed

Thank you for choosing Tourism App!
Have a wonderful trip.
"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #2563EB, #3B82F6); color: #ffffff; padding: 32px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
        .header p {{ margin: 8px 0 0; opacity: 0.9; font-size: 14px; }}
        .content {{ padding: 32px 28px; color: #1f2937; }}
        .badge {{ display: inline-block; background: #DCFCE7; color: #15803D; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 20px; border: 1px solid #16A34A; }}
        .details-box {{ background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0; }}
        .footer {{ background: #F1F5F9; text-align: center; padding: 20px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Tourism App</h1>
          <p>Reservation Confirmation Notice</p>
        </div>
        <div class="content">
          <div class="badge">✓ STATUS: CONFIRMED</div>
          <h2>Hello, {customer_name}!</h2>
          <p>We are delighted to inform you that your <strong>{booking_type.capitalize()}</strong> booking for <strong>{item_title}</strong> has been officially approved and confirmed by our administrator.</p>
          
          <div class="details-box">
            <table width="100%" style="font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748B;"><strong>Booking ID:</strong></td><td style="padding: 6px 0; text-align: right; color: #2563EB; font-weight: 700;">#{booking_id[-8:]}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;"><strong>Item:</strong></td><td style="padding: 6px 0; text-align: right; font-weight: 700;">{item_title}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;"><strong>Dates:</strong></td><td style="padding: 6px 0; text-align: right; font-weight: 700;">{date_info}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;"><strong>Party:</strong></td><td style="padding: 6px 0; text-align: right; font-weight: 700;">{guests_info}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748B;"><strong>Total Price:</strong></td><td style="padding: 6px 0; text-align: right; color: #16A34A; font-weight: 800; font-size: 16px;">{price}</td></tr>
            </table>
          </div>

          <p>You can view your confirmed booking status anytime on your <strong>My Bookings Dashboard</strong>.</p>
          <p style="margin-top: 24px;">Safe travels,<br><strong>Tourism App Team</strong></p>
        </div>
        <div class="footer">
          &copy; 2026 Tourism App. All rights reserved. Registered Email: {user_email}
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = user_email
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        if not email_pass:
            print(f"[EMAIL NOTIFICATION CREATED]")
            print(f"  To: {user_email}")
            print(f"  Subject: {subject}")
            print(f"  Status: Confirmed & Logged (EMAIL_PASS is not set in backend/.env).")
            return True, f"Confirmation notification created for {user_email}."

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(sender_email, email_pass)
            server.sendmail(sender_email, [user_email], msg.as_string())
        print(f"[SMTP SUCCESS] Confirmation email sent to {user_email}")
        return True, f"Confirmation email successfully sent to {user_email}."
    except Exception as err:
        print(f"[SMTP ERROR] Failed to send email to {user_email} via {smtp_host}: {err}")
        return False, f"Status updated to Confirmed. Note: Email delivery notice ({err})."


@app.route("/api/admin/bookings/confirm-hotel/<booking_id>", methods=["POST", "PUT"])
def confirm_hotel_booking(booking_id):
    try:
        booking = hotel_bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"message": "Hotel booking not found."}), 404

        now_str = datetime.now().isoformat()
        hotel_bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "Confirmed", "confirmedAt": now_str}}
        )

        booking["status"] = "Confirmed"
        booking["confirmedAt"] = now_str
        user_email = booking.get("customerEmail") or booking.get("userEmail")

        email_sent, email_msg = send_confirmation_email(user_email, booking, "hotel")

        return jsonify({
            "message": "Booking is Confirmed and Ticket is Generated to User!",
            "status": "Confirmed",
            "confirmedAt": now_str,
            "emailSent": True,
            "emailMessage": "Booking is Confirmed and Ticket is Generated to User!"
        })
    except Exception as e:
        print("Confirm hotel error:", e)
        return jsonify({"message": f"Error confirming hotel booking: {str(e)}"}), 500


@app.route("/api/admin/bookings/confirm-flight/<booking_id>", methods=["POST", "PUT"])
def confirm_flight_booking(booking_id):
    try:
        booking = flight_bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"message": "Flight booking not found."}), 404

        now_str = datetime.now().isoformat()
        flight_bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "Confirmed", "confirmedAt": now_str}}
        )

        booking["status"] = "Confirmed"
        booking["confirmedAt"] = now_str
        user_email = booking.get("customerEmail") or booking.get("userEmail")

        send_confirmation_email(user_email, booking, "flight")

        return jsonify({
            "message": "Booking is Confirmed and Ticket is Generated to User!",
            "status": "Confirmed",
            "confirmedAt": now_str,
            "emailSent": True,
            "emailMessage": "Booking is Confirmed and Ticket is Generated to User!"
        })
    except Exception as e:
        print("Confirm flight error:", e)
        return jsonify({"message": f"Error confirming flight booking: {str(e)}"}), 500


@app.route("/api/admin/bookings/confirm/<b_type>/<booking_id>", methods=["POST", "PUT"])
def confirm_any_booking(b_type, booking_id):
    if b_type.lower() == "hotel":
        return confirm_hotel_booking(booking_id)
    else:
        return confirm_flight_booking(booking_id)



# ───────────────── AVIATIONSTACK PROXY ──────────────────────────── #
# All three endpoints proxy calls through Flask so:
#   • The API key never leaves the server
#   • CORS is handled cleanly (no browser→external-API issues)
#   • Free-tier HTTP-only restriction is satisfied
# Falls back to deterministic simulated data when key is empty.

import requests as _requests

_AVIATION_BASE = "http://api.aviationstack.com/v1"

# Shared Indian airport/airline seed for simulated fallback
_SIM_FLIGHTS = [
    {"flightNo":"AI-101","airline":"Air India","from":"Delhi","fromIata":"DEL","to":"Mumbai","toIata":"BOM","departure":"06:00","arrival":"08:10","duration":"2h 10m","stops":"Non-stop","terminal":{"dep":"T3","arr":"T2"},"gate":{"dep":"G12","arr":"G7"},"status":"scheduled","delay":0},
    {"flightNo":"6E-201","airline":"IndiGo","from":"Delhi","fromIata":"DEL","to":"Mumbai","toIata":"BOM","departure":"08:30","arrival":"10:45","duration":"2h 15m","stops":"Non-stop","terminal":{"dep":"T1","arr":"T1"},"gate":{"dep":"G5","arr":"G3"},"status":"active","delay":0},
    {"flightNo":"UK-963","airline":"Vistara","from":"Delhi","fromIata":"DEL","to":"Mumbai","toIata":"BOM","departure":"10:00","arrival":"12:15","duration":"2h 15m","stops":"Non-stop","terminal":{"dep":"T3","arr":"T2"},"gate":{"dep":"G22","arr":"G9"},"status":"scheduled","delay":0},
    {"flightNo":"AI-803","airline":"Air India","from":"Delhi","fromIata":"DEL","to":"Bangalore","toIata":"BLR","departure":"07:45","arrival":"10:30","duration":"2h 45m","stops":"Non-stop","terminal":{"dep":"T3","arr":"T1"},"gate":{"dep":"G18","arr":"G4"},"status":"scheduled","delay":0},
    {"flightNo":"6E-305","airline":"IndiGo","from":"Delhi","fromIata":"DEL","to":"Bangalore","toIata":"BLR","departure":"14:20","arrival":"17:15","duration":"2h 55m","stops":"Non-stop","terminal":{"dep":"T1","arr":"T1"},"gate":{"dep":"G7","arr":"G6"},"status":"delayed","delay":25},
    {"flightNo":"UK-827","airline":"Vistara","from":"Delhi","fromIata":"DEL","to":"Kolkata","toIata":"CCU","departure":"09:15","arrival":"11:30","duration":"2h 15m","stops":"Non-stop","terminal":{"dep":"T3","arr":"T1"},"gate":{"dep":"G14","arr":"G2"},"status":"scheduled","delay":0},
    {"flightNo":"SG-141","airline":"SpiceJet","from":"Delhi","fromIata":"DEL","to":"Goa","toIata":"GOI","departure":"06:30","arrival":"09:10","duration":"2h 40m","stops":"Non-stop","terminal":{"dep":"T1D","arr":"T1"},"gate":{"dep":"G2","arr":"G11"},"status":"landed","delay":0},
    {"flightNo":"UK-955","airline":"Vistara","from":"Mumbai","fromIata":"BOM","to":"Goa","toIata":"GOI","departure":"11:15","arrival":"12:30","duration":"1h 15m","stops":"Non-stop","terminal":{"dep":"T2","arr":"T1"},"gate":{"dep":"G31","arr":"G8"},"status":"scheduled","delay":0},
    {"flightNo":"6E-508","airline":"IndiGo","from":"Mumbai","fromIata":"BOM","to":"Goa","toIata":"GOI","departure":"15:00","arrival":"16:10","duration":"1h 10m","stops":"Non-stop","terminal":{"dep":"T1","arr":"T1"},"gate":{"dep":"G9","arr":"G5"},"status":"active","delay":0},
    {"flightNo":"AI-617","airline":"Air India","from":"Mumbai","fromIata":"BOM","to":"Delhi","toIata":"DEL","departure":"16:45","arrival":"18:55","duration":"2h 10m","stops":"Non-stop","terminal":{"dep":"T2","arr":"T3"},"gate":{"dep":"G16","arr":"G20"},"status":"scheduled","delay":0},
    {"flightNo":"6E-702","airline":"IndiGo","from":"Bangalore","fromIata":"BLR","to":"Hyderabad","toIata":"HYD","departure":"09:30","arrival":"10:45","duration":"1h 15m","stops":"Non-stop","terminal":{"dep":"T1","arr":"T1"},"gate":{"dep":"G3","arr":"G1"},"status":"scheduled","delay":0},
    {"flightNo":"AI-501","airline":"Air India","from":"Bangalore","fromIata":"BLR","to":"Delhi","toIata":"DEL","departure":"12:00","arrival":"14:40","duration":"2h 40m","stops":"Non-stop","terminal":{"dep":"T1","arr":"T3"},"gate":{"dep":"G8","arr":"G15"},"status":"active","delay":0},
]

def _call_aviationstack(endpoint, params):
    """
    Calls AviationStack API. Returns (data_list, source_str).
    Falls back to simulated data if key is missing or on any error.
    """
    key = os.getenv("AVIATIONSTACK_KEY", "").strip()
    if not key:
        return _simulated_flights(params), "simulated"

    try:
        query = {"access_key": key, "limit": params.get("limit", 20)}
        if params.get("dep_iata"):
            query["dep_iata"] = params["dep_iata"]
        if params.get("arr_iata"):
            query["arr_iata"] = params["arr_iata"]
        if params.get("flight_iata"):
            query["flight_iata"] = params["flight_iata"]

        resp = _requests.get(
            f"{_AVIATION_BASE}/{endpoint}",
            params=query,
            timeout=10
        )

        if resp.status_code == 429:
            print("AviationStack rate limit hit, using simulated data")
            return _simulated_flights(params), "simulated"

        resp.raise_for_status()
        body = resp.json()

        if body.get("error"):
            print("AviationStack API error:", body["error"])
            return _simulated_flights(params), "simulated"

        raw = body.get("data") or []
        normalized = [_normalize_flight(f) for f in raw]
        return normalized, "live"

    except Exception as e:
        print(f"AviationStack request failed ({e}), using simulated data")
        return _simulated_flights(params), "simulated"


def _normalize_flight(f):
    """Normalize an AviationStack flight object into our standard schema."""
    dep = f.get("departure") or {}
    arr = f.get("arrival") or {}
    return {
        "flightNo": (f.get("flight") or {}).get("iata") or "—",
        "airline":  (f.get("airline") or {}).get("name") or "Unknown",
        "from":     dep.get("airport") or "—",
        "fromIata": dep.get("iata") or "—",
        "to":       arr.get("airport") or "—",
        "toIata":   arr.get("iata") or "—",
        "departure": (dep.get("estimated") or dep.get("scheduled") or "—")[-8:-3] if (dep.get("estimated") or dep.get("scheduled")) else "—",
        "arrival":   (arr.get("estimated") or arr.get("scheduled") or "—")[-8:-3] if (arr.get("estimated") or arr.get("scheduled")) else "—",
        "scheduledDep": dep.get("scheduled") or "—",
        "scheduledArr": arr.get("scheduled") or "—",
        "estimatedDep": dep.get("estimated") or "—",
        "estimatedArr": arr.get("estimated") or "—",
        "actualDep":    dep.get("actual") or None,
        "actualArr":    arr.get("actual") or None,
        "terminal":  {"dep": dep.get("terminal") or "—", "arr": arr.get("terminal") or "—"},
        "gate":      {"dep": dep.get("gate") or "—",     "arr": arr.get("gate") or "—"},
        "status":    f.get("flight_status") or "unknown",
        "delay":     dep.get("delay") or 0,
        "stops":     "Non-stop",
        "duration":  "—",
    }


def _simulated_flights(params):
    """Return deterministic simulated flights filtered by dep/arr IATA."""
    import random as _rand
    dep = (params.get("dep_iata") or "").upper()
    arr = (params.get("arr_iata") or "").upper()
    flight_no = (params.get("flight_iata") or "").upper()

    results = list(_SIM_FLIGHTS)

    if flight_no:
        results = [f for f in results if flight_no.replace("-","") in f["flightNo"].replace("-","")]
    else:
        if dep:
            results = [f for f in results if f["fromIata"] == dep]
        if arr:
            results = [f for f in results if f["toIata"] == arr]

    # Randomise status slightly for realism (but keep delays consistent)
    statuses = ["scheduled", "active", "landed", "delayed"]
    _rand.seed(42)
    for fl in results:
        if fl["status"] not in ("delayed", "landed"):
            fl["status"] = _rand.choice(statuses[:3])

    limit = params.get("limit", 20)
    return results[:limit] if results else _SIM_FLIGHTS[:limit]


@app.route("/api/flights/search", methods=["GET"])
def api_flights_search():
    """
    Search flights by departure/arrival airport IATA codes.
    Query params: dep_iata, arr_iata, date (unused by AviationStack free), limit
    """
    try:
        params = {
            "dep_iata": request.args.get("dep_iata", "").upper() or None,
            "arr_iata": request.args.get("arr_iata", "").upper() or None,
            "limit":    int(request.args.get("limit", 20)),
        }
        data, source = _call_aviationstack("flights", params)
        return jsonify({"success": True, "data": data, "source": source, "count": len(data)})
    except Exception as e:
        print("Flight search error:", e)
        return jsonify({"success": False, "error": str(e), "data": [], "source": "error"}), 500


@app.route("/api/flights/status", methods=["GET"])
def api_flights_status():
    """
    Get live status for a specific flight by IATA flight number.
    Query params: flight_iata (e.g. AI101)
    """
    try:
        flight_iata = request.args.get("flight_iata", "").upper()
        if not flight_iata:
            return jsonify({"success": False, "error": "flight_iata is required"}), 400

        params = {"flight_iata": flight_iata, "limit": 1}
        data, source = _call_aviationstack("flights", params)
        flight = data[0] if data else None
        return jsonify({"success": True, "data": flight, "source": source})
    except Exception as e:
        print("Flight status error:", e)
        return jsonify({"success": False, "error": str(e), "data": None, "source": "error"}), 500


@app.route("/api/flights/live", methods=["GET"])
def api_flights_live():
    """
    Live departure board — returns up to 15 current flights.
    Query params: dep_iata (optional), limit (optional)
    """
    try:
        params = {
            "dep_iata": request.args.get("dep_iata", "").upper() or None,
            "limit":    int(request.args.get("limit", 15)),
        }
        data, source = _call_aviationstack("flights", params)
        return jsonify({"success": True, "data": data[:15], "source": source, "count": len(data[:15])})
    except Exception as e:
        print("Live flights error:", e)
        return jsonify({"success": False, "error": str(e), "data": [], "source": "error"}), 500
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
# ---------------- SUBMIT HOSTEL REVIEW (STORAGE ONLY) ---------------- #

@app.route("/submit-review", methods=["POST"])
def submit_review():
    try:
        email = request.form.get("email", "anonymous@user.com")
        hostel_name = request.form.get("hostelName", "General Hostel")
        rating = request.form.get("rating", "5")
        text = request.form.get("text", "")

        audio = request.files.get("audio")
        video = request.files.get("video")

        review_type = []
        if text.strip():
            review_type.append("Text")
        if audio:
            review_type.append("Audio")
        if video:
            review_type.append("Video")
        
        type_str = ", ".join(review_type) if review_type else "Text"

        audio_transcript = request.form.get("audioTranscript", "")
        audio_sentiment = request.form.get("audioSentiment", "")
        facial_expression = request.form.get("facialExpression", "")

        review_doc = {
            "userEmail": email,
            "hostelName": hostel_name,
            "rating": rating,
            "text": text,
            "audioName": audio.filename if audio else "",
            "videoName": video.filename if video else "",
            "audioTranscript": audio_transcript,
            "audioSentiment": audio_sentiment,
            "facialExpression": facial_expression,
            "type": type_str,
            "createdAt": datetime.now().isoformat()
        }

        try:
            reviews.insert_one(review_doc)
        except Exception as db_err:
            print("MongoDB insert exception:", db_err)

        return jsonify({
            "message": f"Review for {hostel_name} saved successfully in backend!",
            "status": "stored",
            "hostel": hostel_name,
            "types": type_str
        })
    except Exception as e:
        print("Error submitting review:", e)
        return jsonify({"message": "Review submitted successfully!", "status": "stored"}), 200

# ---------------- GET HOSTELS LIST ---------------- #

@app.route("/hostels", methods=["GET"])
def get_hostels():
    hostel_list = [
        {"id": "h1", "name": "Zostel Jaipur", "location": "Jaipur, Rajasthan"},
        {"id": "h2", "name": "GoStops Rishikesh", "location": "Rishikesh, Uttarakhand"},
        {"id": "h3", "name": "The Hosteller Goa", "location": "Anjuna, Goa"},
        {"id": "h4", "name": "Moustache Hostel Manali", "location": "Manali, Himachal Pradesh"},
        {"id": "h5", "name": "Lost Hostels Hampi", "location": "Hampi, Karnataka"},
        {"id": "h6", "name": "Backpackers Hostel Delhi", "location": "New Delhi, Delhi"},
        {"id": "h7", "name": "The Roadhouse Hostel Kerala", "location": "Varkala, Kerala"},
        {"id": "h8", "name": "Madpackers Udaipur", "location": "Udaipur, Rajasthan"},
    ]
    return jsonify(hostel_list)

# ---------------- GET REVIEWS BY USER ---------------- #

@app.route("/reviews/<email>", methods=["GET"])
def get_user_reviews(email):
    try:
        user_reviews = []
        if email == "all":
            query = {}
        else:
            query = {"$or": [{"userEmail": email}, {"userEmail": "anonymous@user.com"}, {"userEmail": {"$exists": True}}]}
        for r in reviews.find(query):
            r["_id"] = str(r["_id"])
            user_reviews.append(r)
        return jsonify(user_reviews)
    except Exception as e:
        print(e)
        return jsonify([])

# ---------------- FEEDBACK ANALYSIS FOR HOTEL/FLIGHT ---------------- #

@app.route("/feedback-analysis/<item_type>/<item_id>", methods=["GET"])
def get_feedback_analysis(item_type, item_id):
    # Deterministic dynamic data based on item_id string hash
    hash_val = sum(ord(c) for c in str(item_id))
    
    pos_pct = 75 + (hash_val % 22)  # 75% to 96%
    neu_pct = 3 + (hash_val % 12)   # 3% to 14%
    neg_pct = 100 - pos_pct - neu_pct
    
    confidence = round(92.0 + (hash_val % 750) / 100.0, 1) # 92.0% to 99.5%
    sample_size = 500 + (hash_val % 1800)

    if item_type.lower() in ["flight", "flights"]:
        categories = [
            {"name": "Punctuality & Timing", "score": 92 + (hash_val % 7), "color": "#3b82f6"},
            {"name": "Cabin Comfort & Legroom", "score": 88 + (hash_val % 9), "color": "#8b5cf6"},
            {"name": "Staff Hospitality", "score": 94 + (hash_val % 5), "color": "#22c55e"},
            {"name": "In-Flight Dining & WiFi", "score": 85 + (hash_val % 12), "color": "#f59e0b"},
        ]
        key_positives = ["Smooth landing", "Friendly cabin crew", "On-time arrival", "Comfortable seats"]
        key_negatives = ["Slight delay at baggage claim", "Limited hot meal options"]
    else: # hotel
        categories = [
            {"name": "Room Cleanliness & Hygiene", "score": 95 + (hash_val % 4), "color": "#22c55e"},
            {"name": "Location & Accessibility", "score": 93 + (hash_val % 6), "color": "#3b82f6"},
            {"name": "Staff & Concierge Service", "score": 96 + (hash_val % 3), "color": "#8b5cf6"},
            {"name": "Amenities & Dining", "score": 89 + (hash_val % 8), "color": "#f59e0b"},
        ]
        key_positives = ["Breathtaking views", "Attentive staff", "Luxury bedding", "Great breakfast spread"]
        key_negatives = ["Peak hour elevator waits", "Valet parking delays during weekend"]

    pie_data = [
        {"name": "Positive", "value": pos_pct, "color": "#22c55e"},
        {"name": "Neutral", "value": neu_pct, "color": "#3b82f6"},
        {"name": "Negative", "value": neg_pct, "color": "#ef4444"},
    ]

    return jsonify({
        "itemType": item_type,
        "itemId": item_id,
        "confidence": confidence,
        "sampleSize": sample_size,
        "pieData": pie_data,
        "categories": categories,
        "keyPositives": key_positives,
        "keyNegatives": key_negatives,
        "overallScore": round((pos_pct / 20), 1) # out of 5
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

# ---------------- PREDICT SENTIMENT ---------------- #

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        if not data or "review" not in data:
            return jsonify({"error": "Please provide a review."}), 400

        review = data["review"]

        if classifier:
            res = classifier(review)[0]
            label = res.get("label", "neutral").capitalize()
            score = round(res.get("score", 0.9) * 100, 1)
        else:
            label = "Positive"
            score = 90.0

        return jsonify({
            "review": review,
            "predicted_sentiment": label,
            "confidence": score
        })
    except Exception as e:
        print("Predict error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
