import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load saved model and vectorizer
model = joblib.load(os.path.join(BASE_DIR, "models", "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "models", "vectorizer.pkl"))

review = input("Enter Review: ")

# Convert review to TF-IDF features
review_vector = vectorizer.transform([review])

# Predict sentiment
prediction = model.predict(review_vector)

print("\nPredicted Sentiment:", prediction[0])