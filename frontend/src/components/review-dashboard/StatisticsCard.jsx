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
      icon: <FaComments className="text-blue-400 text-lg" />,
      color: "border-blue-500/20 bg-blue-500/5"
    },
    {
      title: "Avg Rating",
      value: `${stats.avgRating || 0} ★`,
      sub: "Out of 5.0 stars",
      icon: <FaStar className="text-amber-400 text-lg" />,
      color: "border-amber-500/20 bg-amber-500/5"
    },
    {
      title: "Positive Sentiment",
      value: `${stats.positiveCount || 0}`,
      sub: `${stats.negativeCount || 0} neg / ${stats.neutralCount || 0} neu`,
      icon: <FaThumbsUp className="text-emerald-400 text-lg" />,
      color: "border-emerald-500/20 bg-emerald-500/5"
    },
    {
      title: "Avg Length",
      value: `${stats.avgLength || 0}`,
      sub: "words per review",
      icon: <FaAlignLeft className="text-purple-400 text-lg" />,
      color: "border-purple-500/20 bg-purple-500/5"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className={`p-3.5 rounded-xl border backdrop-blur-md ${card.color}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
            {card.icon}
          </div>
          <div className="text-xl font-bold text-white mt-1">{card.value}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
