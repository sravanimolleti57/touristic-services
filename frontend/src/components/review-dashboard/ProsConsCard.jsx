import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ProsConsCard({ pros = [], cons = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
    >
      {/* Pros Card */}
      <div style={{
        padding: 14, borderRadius: 12,
        background: "rgba(5,150,105,0.06)",
        border: "1px solid rgba(5,150,105,0.2)",
      }}>
        <h5 style={{
          margin: "0 0 10px", fontSize: 10, textTransform: "uppercase",
          letterSpacing: "0.5px", fontWeight: 800, color: "#059669",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <FaCheckCircle style={{ fontSize: 13 }} />
          <span>Pros &amp; Highlights</span>
        </h5>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {pros.map((pro, i) => (
            <li key={i} style={{ fontSize: 12, color: "#374151", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5 }}>
              <span style={{ color: "#059669", fontWeight: 800, flexShrink: 0 }}>✓</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Card */}
      <div style={{
        padding: 14, borderRadius: 12,
        background: "rgba(220,38,38,0.05)",
        border: "1px solid rgba(220,38,38,0.15)",
      }}>
        <h5 style={{
          margin: "0 0 10px", fontSize: 10, textTransform: "uppercase",
          letterSpacing: "0.5px", fontWeight: 800, color: "#DC2626",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <FaTimesCircle style={{ fontSize: 13 }} />
          <span>Areas to Improve</span>
        </h5>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {cons.length > 0 ? (
            cons.map((con, i) => (
              <li key={i} style={{ fontSize: 12, color: "#374151", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5 }}>
                <span style={{ color: "#DC2626", fontWeight: 800, flexShrink: 0 }}>✗</span>
                <span>{con}</span>
              </li>
            ))
          ) : (
            <li style={{ fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>No significant complaints reported</li>
          )}
        </ul>
      </div>
    </motion.div>
  );
}
