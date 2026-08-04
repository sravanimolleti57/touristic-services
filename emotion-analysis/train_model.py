import pandas as pd
import re
import joblib
import os

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# ===========================
# Read Dataset
# ===========================

df = pd.read_csv("dataset/reviews.csv")

print("Dataset Shape :", df.shape)

# ===========================
# Initialize
# ===========================

stop_words = set(stopwords.words("english"))


# Keep important sentiment words
stop_words.discard("very")
stop_words.discard("not")
stop_words.discard("no")
stop_words.discard("never")
lemmatizer = WordNetLemmatizer()

# ===========================
# Text Preprocessing
# ===========================

def preprocess(text):
    text = str(text).lower()

    text = re.sub(r'[^a-zA-Z\s]', '', text)

    words = text.split()

    words = [word for word in words if word not in stop_words]

    words = [lemmatizer.lemmatize(word) for word in words]

    return " ".join(words)

# ===========================
# Clean Reviews
# ===========================

df["Clean_Review"] = df["Review"].apply(preprocess)

# ===========================
# TF-IDF Vectorizer
# ===========================

vectorizer = TfidfVectorizer(
    lowercase=True,
    
    ngram_range=(1, 3),
    max_features=15000,
    min_df=1
)

X = vectorizer.fit_transform(df["Clean_Review"])

y = df["Sentiment"]

print("Feature Matrix Shape :", X.shape)

# ===========================
# Train Test Split
# ===========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

# ====================================================
# Logistic Regression
# ====================================================

lr_model = LogisticRegression(max_iter=1000)

lr_model.fit(X_train, y_train)

lr_pred = lr_model.predict(X_test)

lr_accuracy = accuracy_score(y_test, lr_pred)

print("\nLogistic Regression Accuracy :", round(lr_accuracy * 100, 2), "%")

# ====================================================
# Linear SVC
# ====================================================

svc_model = LinearSVC()

svc_model.fit(X_train, y_train)

svc_pred = svc_model.predict(X_test)

svc_accuracy = accuracy_score(y_test, svc_pred)

print("Linear SVC Accuracy :", round(svc_accuracy * 100, 2), "%")

# ====================================================
# Naive Bayes
# ====================================================

nb_model = MultinomialNB()

nb_model.fit(X_train, y_train)

nb_pred = nb_model.predict(X_test)

nb_accuracy = accuracy_score(y_test, nb_pred)

print("Naive Bayes Accuracy :", round(nb_accuracy * 100, 2), "%")

# ====================================================
# Select Best Model
# ====================================================

models = {
    "Logistic Regression": (lr_model, lr_accuracy),
    "Linear SVC": (svc_model, svc_accuracy),
    "Naive Bayes": (nb_model, nb_accuracy)
}

best_model_name = max(models, key=lambda x: models[x][1])

best_model = models[best_model_name][0]

best_accuracy = models[best_model_name][1]

print("\n====================================")
print("Best Model :", best_model_name)
print("Best Accuracy :", round(best_accuracy * 100, 2), "%")
print("====================================")

# ====================================================
# Classification Report
# ====================================================

best_pred = best_model.predict(X_test)

print("\nClassification Report\n")

print(classification_report(y_test, best_pred))

# ====================================================
# Confusion Matrix
# ====================================================

print("\nConfusion Matrix\n")

print(confusion_matrix(y_test, best_pred))

# ====================================================
# Save Model
# ====================================================

os.makedirs("models", exist_ok=True)

joblib.dump(best_model, "models/model.pkl")

joblib.dump(vectorizer, "models/vectorizer.pkl")

print("\nModel saved successfully!")

print("\nFiles Saved:")

print("models/model.pkl")

print("models/vectorizer.pkl")