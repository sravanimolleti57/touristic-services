import React from "react";
import { motion } from "framer-motion";
import { FaChartLine, FaArrowUp, FaCalendarAlt } from "react-icons/fa";

export default function RecentTrend({ trends = { last7Days: 100, last30Days: 100 } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <FaChartLine className="text-emerald-400 text-xs" />
        <h4 className="text-sm uppercase tracking-wider font-semibold text-slate-400">
          Recent Sentiment Trend
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FaCalendarAlt className="text-sky-400 text-[10px]" />
            <span>Last 7 Days</span>
          </div>
          <div className="text-base font-bold text-emerald-400 flex items-center gap-1">
            <FaArrowUp className="text-xs" />
            <span>+{trends.last7Days}% Activity</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <FaCalendarAlt className="text-purple-400 text-[10px]" />
            <span>Last 30 Days</span>
          </div>
          <div className="text-base font-bold text-sky-400 flex items-center gap-1">
            <FaArrowUp className="text-xs" />
            <span>+{trends.last30Days}% Total</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
