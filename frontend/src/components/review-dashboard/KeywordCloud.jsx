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
      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <FaHashtag className="text-sky-400 text-xs" />
        <h4 className="text-sm uppercase tracking-wider font-semibold text-slate-400">
          Most Mentioned Keywords
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 shadow-sm"
          >
            <span>{kw.label}</span>
            <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {kw.count}
            </span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
