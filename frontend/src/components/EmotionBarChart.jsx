import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#facc15"];

export default function EmotionBarChart({ data }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 15,
      padding: 20,
      marginTop: 30,
      border: "1px solid #E5E7EB",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <h2 style={{ color: "#111827", marginBottom: 20, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        Emotion Analysis
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="emotion" stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#6B7280" }} />
          <Tooltip
            contentStyle={{ background: "#FFFFFF", borderColor: "#E5E7EB", borderRadius: 8, color: "#111827" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}