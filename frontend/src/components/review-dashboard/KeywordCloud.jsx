import React from "react";
import { motion } from "framer-motion";
import { FaHashtag } from "react-icons/fa";

export default function KeywordCloud({ keywords = [] }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        padding: 20, borderRadius: 16,
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <FaHashtag style={{ color: "#2563EB", fontSize: 12 }} />
        <h4 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700, color: "#6B7280" }}>
          Most Mentioned Keywords
        </h4>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {keywords.map((kw, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "5px 12px", borderRadius: 20,
              background: "#F3F4F6", color: "#374151",
              border: "1px solid #E5E7EB",
              fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
              cursor: "default",
            }}
          >
            <span>{kw.label}</span>
            <span style={{
              background: "rgba(37,99,235,0.10)", color: "#2563EB",
              padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 800,
            }}>
              {kw.count}
            </span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
