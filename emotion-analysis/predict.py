import joblib

# Load saved model and vectorizer
model = joblib.load("models/model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")

review = input("Enter Review: ")

# Convert review to TF-IDF features
review_vector = vectorizer.transform([review])

# Predict sentiment
prediction = model.predict(review_vector)

print("\nPredicted Sentiment:", prediction[0])