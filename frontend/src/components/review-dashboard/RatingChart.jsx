import React from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function RatingChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg"
    >
      <h4 className="text-sm uppercase tracking-wider font-semibold text-slate-400 mb-3">
        Rating Distribution
      </h4>

      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="w-12 font-bold text-amber-400 flex items-center gap-1">
              {item.stars}
            </span>
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="h-full bg-amber-400 rounded-full"
              />
            </div>
            <span className="w-10 text-right text-slate-400 font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
