import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FaStar, FaSmile, FaMeh, FaFrown } from "react-icons/fa";

export default function EmotionChart({ data = [], avgRating = 4.8, totalReviews = 0 }) {
  if (!data || data.length === 0) return null;

  const posData = data.find(d => d.name.toLowerCase().includes("pos")) || { value: 0, count: 0 };
  const neuData = data.find(d => d.name.toLowerCase().includes("neu")) || { value: 0, count: 0 };
  const negData = data.find(d => d.name.toLowerCase().includes("neg")) || { value: 0, count: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 20, borderRadius: 16,
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", gap: 16,
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: 12, borderBottom: "1px solid #E5E7EB",
      }}>
        <h4 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, color: "#374151" }}>
          Sentiment Pie Chart
        </h4>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: "rgba(37,99,235,0.08)", color: "#2563EB",
          border: "1px solid rgba(37,99,235,0.2)",
          padding: "2px 10px", borderRadius: 20,
        }}>
          Live AI Analysis
        </span>
      </div>

      {/* Pie Chart */}
      <div style={{ height: 220, width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={50} outerRadius={75}
              paddingAngle={6}
              dataKey="value"
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name.toLowerCase().includes("pos") ? "#10b981" :
                    entry.name.toLowerCase().includes("neu") ? "#eab308" :
                    "#ef4444"
                  }
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
                borderRadius: 10,
                color: "#111827",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              formatter={(val, name, payload) => [
                `${val}% (${payload.payload.count || 0} reviews)`,
                payload.payload.name
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              formatter={(value) => (
                <span style={{ color: "#374151", fontSize: 12, fontWeight: 600 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div style={{ paddingTop: 12, borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Overall Rating</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", display: "flex", alignItems: "center", gap: 4 }}>
            <FaStar /> {avgRating}/5.0
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center", fontSize: 12 }}>
          <div style={{
            padding: 8, borderRadius: 10,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#059669",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}><FaSmile /></div>
            <div style={{ fontWeight: 800 }}>{posData.value}%</div>
            <div style={{ fontSize: 10, color: "#6B7280" }}>Positive</div>
          </div>

          <div style={{
            padding: 8, borderRadius: 10,
            background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", color: "#D97706",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}><FaMeh /></div>
            <div style={{ fontWeight: 800 }}>{neuData.value}%</div>
            <div style={{ fontSize: 10, color: "#6B7280" }}>Neutral</div>
          </div>

          <div style={{
            padding: 8, borderRadius: 10,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 2 }}><FaFrown /></div>
            <div style={{ fontWeight: 800 }}>{negData.value}%</div>
            <div style={{ fontSize: 10, color: "#6B7280" }}>Negative</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
