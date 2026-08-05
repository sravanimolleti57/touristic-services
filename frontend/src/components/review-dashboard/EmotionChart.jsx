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
      className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl space-y-4"
    >
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
          Sentiment Pie Chart
        </h4>
        <span className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
          Live AI Analysis
        </span>
      </div>

      {/* Large Centerpiece Pie Chart */}
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
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
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "12px",
                color: "#f8fafc",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
              }}
              formatter={(val, name, payload) => [
                `${val}% (${payload.payload.count || 0} reviews)`,
                payload.payload.name
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              formatter={(value) => <span className="text-slate-300 text-xs font-semibold">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Under-Chart Summary Statistics */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Overall Rating</span>
          <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
            <FaStar /> {avgRating}/5.0
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-xs">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <div className="flex justify-center mb-0.5"><FaSmile /></div>
            <div className="font-extrabold">{posData.value}%</div>
            <div className="text-[10px] text-slate-400">Positive</div>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <div className="flex justify-center mb-0.5"><FaMeh /></div>
            <div className="font-extrabold">{neuData.value}%</div>
            <div className="text-[10px] text-slate-400">Neutral</div>
          </div>

          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <div className="flex justify-center mb-0.5"><FaFrown /></div>
            <div className="font-extrabold">{negData.value}%</div>
            <div className="text-[10px] text-slate-400">Negative</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
