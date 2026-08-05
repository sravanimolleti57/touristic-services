import joblib
import os
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "models", "model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "models", "vectorizer.pkl"))

stop_words = set(stopwords.words("english"))
# Keep important sentiment words
stop_words.discard("very")
stop_words.discard("not")
stop_words.discard("no")
stop_words.discard("never")
lemmatizer = WordNetLemmatizer()

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)

    words = text.split()
    words = [w for w in words if w not in stop_words]
    words = [lemmatizer.lemmatize(w) for w in words]

    return " ".join(words)

while True:
    review = input("\nEnter Review : ")

    if review.lower() == "exit":
        break

    clean = preprocess(review)
    print("Cleaned Review:", clean)

    vector = vectorizer.transform([clean])

    prediction = model.predict(vector)[0]

    print("Prediction :", prediction)