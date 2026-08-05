import React from "react";
import { motion } from "framer-motion";
import { FaBrain, FaQuoteLeft } from "react-icons/fa";

export default function AISummary({ summary = "" }) {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      style={{
        padding: 18, borderRadius: 14,
        background: "rgba(99,102,241,0.05)",
        border: "1px solid rgba(99,102,241,0.2)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <FaBrain style={{ color: "#6366F1", fontSize: 14 }} />
        <h4 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, color: "#6366F1" }}>
          AI Experience Summary
        </h4>
      </div>

      <div style={{ position: "relative", paddingLeft: 20 }}>
        <FaQuoteLeft style={{
          color: "rgba(99,102,241,0.15)", fontSize: 28,
          position: "absolute", top: -2, left: -2, pointerEvents: "none",
        }} />
        <p style={{ margin: 0, fontSize: 12, color: "#374151", lineHeight: 1.65 }}>
          {summary}
        </p>
      </div>
    </motion.div>
  );
}
