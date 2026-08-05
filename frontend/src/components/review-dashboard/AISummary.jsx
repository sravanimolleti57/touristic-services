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
      className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 backdrop-blur-md shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-2">
        <FaBrain className="text-indigo-400 text-base animate-pulse" />
        <h4 className="text-sm uppercase tracking-wider font-bold text-indigo-300">
          AI Experience Summary
        </h4>
      </div>

      <div className="relative pt-1">
        <FaQuoteLeft className="text-indigo-500/20 text-3xl absolute -top-2 -left-1 pointer-events-none" />
        <p className="text-xs text-slate-300 leading-relaxed pl-5 font-normal">
          {summary}
        </p>
      </div>
    </motion.div>
  );
}
