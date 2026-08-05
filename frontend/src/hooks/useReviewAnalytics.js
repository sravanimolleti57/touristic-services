<<<<<<< Updated upstream
import { useState, useEffect, useMemo, useCallback } from "react";
=======
import { useState, useEffect, useMemo } from "react";
>>>>>>> Stashed changes
import axios from "axios";
import { analyzeReviewText } from "../utils/reviewAnalytics";

export function useReviewAnalytics(reviews = []) {
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

<<<<<<< Updated upstream
  const fetchSentiments = useCallback(async () => {
    if (!reviews || reviews.length === 0) {
      setSentiments([]);
=======
  useEffect(() => {
    let isCancelled = false;

    if (!reviews || reviews.length === 0) {
      setSentiments([]);
      setLoading(false);
>>>>>>> Stashed changes
      return;
    }

    setLoading(true);
    setError(null);

<<<<<<< Updated upstream
    try {
      // Call emotion analysis endpoint http://127.0.0.1:5001/predict for each text review
      const promises = reviews.map(async (rev) => {
        const text = rev.text || rev.review || "";
        if (!text.trim()) {
          // Fallback based on star rating
          const rating = parseInt(rev.rating || "5", 10);
          return rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
        }

        try {
          const res = await axios.post("http://127.0.0.1:5001/predict", {
            review: text
          }, { timeout: 3000 });
          return res.data?.predicted_sentiment || "positive";
        } catch (err) {
          // Fallback logic if port 5001 is offline
          const lower = text.toLowerCase();
          if (lower.includes("bad") || lower.includes("worst") || lower.includes("dirty")) return "negative";
          if (lower.includes("ok") || lower.includes("average")) return "neutral";
          return "positive";
        }
      });

      const results = await Promise.all(promises);
      setSentiments(results);
    } catch (err) {
      console.warn("Emotion analysis hook fallback:", err);
      setError("Used rating fallback for emotion analysis");
    } finally {
      setLoading(false);
    }
  }, [reviews]);

  useEffect(() => {
    fetchSentiments();
  }, [fetchSentiments]);

  // Memoize expensive calculations
=======
    const fetchSentiments = async () => {
      try {
        const promises = reviews.map(async (rev) => {
          const text = (rev.text || rev.review || "").trim();
          if (!text) {
            const rating = parseInt(rev.rating || "5", 10);
            return rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
          }

          try {
            const res = await axios.post(
              "http://127.0.0.1:5001/predict",
              { review: text },
              { timeout: 2500 }
            );
            return res.data?.predicted_sentiment || "positive";
          } catch {
            // Intelligent local fallback if model port 5001 is offline
            const lower = text.toLowerCase();
            const rating = parseInt(rev.rating || "5", 10);
            if (lower.includes("bad") || lower.includes("worst") || lower.includes("dirty") || rating <= 2) return "negative";
            if (lower.includes("ok") || lower.includes("average") || rating === 3) return "neutral";
            return "positive";
          }
        });

        const results = await Promise.all(promises);

        if (!isCancelled) {
          setSentiments(results);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Emotion analysis hook warning:", err);
          setError("Used fallback for emotion analysis");
          setLoading(false);
        }
      }
    };

    fetchSentiments();

    return () => {
      isCancelled = true;
    };
  }, [reviews]);

  // Memoize expensive calculations strictly based on active reviews and sentiments
>>>>>>> Stashed changes
  const analytics = useMemo(() => {
    return analyzeReviewText(reviews, sentiments);
  }, [reviews, sentiments]);

  return {
    analytics,
    loading,
<<<<<<< Updated upstream
    error,
    refresh: fetchSentiments
=======
    error
>>>>>>> Stashed changes
  };
}
