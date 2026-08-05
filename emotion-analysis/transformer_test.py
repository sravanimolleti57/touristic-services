from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest"
)

while True:
    review = input("\nEnter Review: ")

    if review.lower() == "exit":
        break

    result = classifier(review)

    print(result)