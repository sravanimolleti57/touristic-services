from flask import Flask, request, jsonify
from flask_cors import CORS
from config import reviews

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "message": "Tourism AI Backend Running Successfully!"
    }

@app.route("/review/text", methods=["POST"])
def add_text_review():
    data = request.json

    review = {
        "hotelId": data["hotelId"],
        "user": data["user"],
        "rating": data["rating"],
        "review": data["review"],
        "reviewType": "text"
    }

    result = reviews.insert_one(review)

    return jsonify({
        "message": "Review saved successfully!",
        "id": str(result.inserted_id)
    })

if __name__ == "__main__":
    app.run(debug=True)