import React from "react";
import { motion } from "framer-motion";
import { useReviewAnalytics } from "../../hooks/useReviewAnalytics";
import EmotionChart from "./EmotionChart";
import StatisticsCard from "./StatisticsCard";
import KeywordCloud from "./KeywordCloud";
import ProsConsCard from "./ProsConsCard";
import AISummary from "./AISummary";
import { FaChartPie, FaSpinner, FaExclamationCircle } from "react-icons/fa";

export default function ReviewAnalytics({ reviews = [] }) {
  const { analytics, loading } = useReviewAnalytics(reviews);

  if (loading) {
    return (
      <div style={{
        padding: 24, borderRadius: 16, minHeight: 280,
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <FaSpinner style={{ fontSize: 28, color: "#2563EB", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Computing Emotion Pie Chart...</span>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div style={{
        padding: 24, borderRadius: 16, textAlign: "center",
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <FaExclamationCircle style={{ fontSize: 22, color: "#D1D5DB", marginBottom: 4 }} />
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#374151" }}>No Review Analytics Available</h4>
        <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
          Submit a hotel review to generate the Emotion Pie Chart and statistics.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 16,
      color: "#111827", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      {/* Dashboard Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4 }}>
        <FaChartPie style={{ color: "#2563EB", fontSize: 15 }} />
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.01em" }}>
          Analytics Dashboard
        </h3>
      </div>

      <EmotionChart data={analytics.emotionPieData} avgRating={analytics.avgRating} totalReviews={analytics.totalReviews} />
      <AISummary summary={analytics.aiSummary} />
      <StatisticsCard stats={analytics} />
      <KeywordCloud keywords={analytics.keywords} />
      <ProsConsCard pros={analytics.pros} cons={analytics.cons} />
    </div>
  );
}
