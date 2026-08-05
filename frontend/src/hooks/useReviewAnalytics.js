import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { analyzeReviewText } from "../utils/reviewAnalytics";

export function useReviewAnalytics(reviews = []) {
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSentiments = useCallback(async () => {
    if (!reviews || reviews.length === 0) {
      setSentiments([]);
      return;
    }

    setLoading(true);
    setError(null);

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
          let res;
          try {
            res = await axios.post("http://127.0.0.1:5000/predict", { review: text }, { timeout: 3000 });
          } catch {
            res = await axios.post("http://127.0.0.1:5001/predict", { review: text }, { timeout: 3000 });
          }
          return res.data?.predicted_sentiment || "positive";
        } catch (err) {
          // Fallback logic if ports are offline
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
  const analytics = useMemo(() => {
    return analyzeReviewText(reviews, sentiments);
  }, [reviews, sentiments]);

  return {
    analytics,
    loading,
    error,
    refresh: fetchSentiments
  };
}
