import { useState } from "react";
import { addReview } from "../services/reviewService";

function ReviewForm() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!review.trim()) {
      alert("Please enter a review");
      return;
    }

    try {
      setLoading(true);

      const response = await addReview({ review });

      setResult(response.data.review);

      setReview("");
    } catch (error) {
      console.error(error);

      alert("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>Customer Review</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          rows="5"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review..."
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
          }}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <h3>Prediction Result</h3>

          <p>
            <strong>Review:</strong> {result.review}
          </p>

          <p>
            <strong>Sentiment:</strong> {result.sentiment}
          </p>
        </div>
      )}
    </div>
  );
}

export default ReviewForm;