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
        if (rev.sentiment || rev.audioSentiment) {
          return (rev.sentiment || rev.audioSentiment).toLowerCase();
        }

        const text = rev.text || rev.review || "";
        if (!text.trim()) {
          const rating = parseInt(rev.rating || "5", 10);
          return rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";
        }

        // Fast local evaluation fallback
        const lower = text.toLowerCase();
        const ratingNum = parseInt(rev.rating || "5", 10);
        if (lower.includes("bad") || lower.includes("terrible") || lower.includes("worst") || lower.includes("dirty") || lower.includes("poor") || lower.includes("disappointed")) return "negative";
        if (lower.includes("ok") || lower.includes("okay") || lower.includes("average") || lower.includes("fair") || lower.includes("decent") || lower.includes("fine") || lower.includes("normal") || lower.includes("standard") || ratingNum === 3) return "neutral";
        if (ratingNum <= 2) return "negative";
        return "positive";
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
