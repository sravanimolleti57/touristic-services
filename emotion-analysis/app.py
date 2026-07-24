from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load trained model and vectorizer
model = joblib.load("models/model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

# Initialize preprocessing tools
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

# Text preprocessing function
def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    words = text.split()
    words = [word for word in words if word not in stop_words]
    words = [lemmatizer.lemmatize(word) for word in words]

    return " ".join(words)


# Home route
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Tourism Sentiment Analysis API is Running!"
    })


# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data or "review" not in data:
            return jsonify({
                "error": "Please provide a review."
            }), 400

        review = data["review"]

        # Preprocess review
        clean_review = preprocess(review)

        # Convert to TF-IDF
        review_vector = vectorizer.transform([clean_review])

        # Predict sentiment
        prediction = model.predict(review_vector)[0]

        return jsonify({
            "review": review,
            "clean_review": clean_review,
            "predicted_sentiment": prediction
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# Run Flask server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)