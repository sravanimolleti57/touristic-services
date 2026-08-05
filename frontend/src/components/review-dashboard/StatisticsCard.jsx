import React from "react";
import { motion } from "framer-motion";
import { FaComments, FaStar, FaThumbsUp, FaAlignLeft } from "react-icons/fa";

export default function StatisticsCard({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Reviews",
      value: stats.totalReviews || 0,
      sub: `From ${stats.oldestDate || "N/A"}`,
      icon: <FaComments style={{ color: "#2563EB", fontSize: 16 }} />,
      accent: "#2563EB",
      bg: "rgba(37,99,235,0.07)",
      border: "rgba(37,99,235,0.18)",
    },
    {
      title: "Avg Rating",
      value: `${stats.avgRating || 0} ★`,
      sub: "Out of 5.0 stars",
      icon: <FaStar style={{ color: "#D97706", fontSize: 16 }} />,
      accent: "#D97706",
      bg: "rgba(217,119,6,0.07)",
      border: "rgba(217,119,6,0.18)",
    },
    {
      title: "Positive Sentiment",
      value: `${stats.positiveCount || 0}`,
      sub: `${stats.negativeCount || 0} neg / ${stats.neutralCount || 0} neu`,
      icon: <FaThumbsUp style={{ color: "#059669", fontSize: 16 }} />,
      accent: "#059669",
      bg: "rgba(5,150,105,0.07)",
      border: "rgba(5,150,105,0.18)",
    },
    {
      title: "Avg Length",
      value: `${stats.avgLength || 0}`,
      sub: "words per review",
      icon: <FaAlignLeft style={{ color: "#7C3AED", fontSize: 16 }} />,
      accent: "#7C3AED",
      bg: "rgba(124,58,237,0.07)",
      border: "rgba(124,58,237,0.18)",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          style={{
            padding: 12, borderRadius: 12,
            background: card.bg,
            border: `1px solid ${card.border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {card.title}
            </span>
            {card.icon}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginTop: 4 }}>{card.value}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
