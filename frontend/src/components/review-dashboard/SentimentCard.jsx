import React from "react";
import { motion } from "framer-motion";
import { FaSmile, FaMeh, FaFrown, FaShieldAlt } from "react-icons/fa";

export default function SentimentCard({ score = 92, label = "Positive", confidence = 95 }) {
  const getIcon = () => {
    const l = label.toLowerCase();
    if (l.includes("neg")) return <FaFrown className="text-red-500 text-3xl" />;
    if (l.includes("neu")) return <FaMeh className="text-blue-400 text-3xl" />;
    return <FaSmile className="text-emerald-400 text-3xl" />;
  };

  const getGradient = () => {
    const l = label.toLowerCase();
    if (l.includes("neg")) return "from-red-500/20 to-orange-500/10 border-red-500/30";
    if (l.includes("neu")) return "from-blue-500/20 to-cyan-500/10 border-blue-500/30";
    return "from-emerald-500/20 to-teal-500/10 border-emerald-500/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-5 rounded-2xl bg-gradient-to-br ${getGradient()} border backdrop-blur-md shadow-lg relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Overall Sentiment
          </span>
          <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            {getIcon()}
            <span>{label} Experience</span>
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full text-xs text-slate-300 border border-slate-700">
          <FaShieldAlt className="text-emerald-400 text-xs" />
          <span>{confidence}% Confident</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-4">
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="text-4xl font-extrabold text-white tracking-tight"
        >
          {score}%
        </motion.span>
        <span className="text-sm text-slate-400 font-medium">positive score index</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
        />
      </div>
    </motion.div>
  );
}
