import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ProsConsCard({ pros = [], cons = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {/* Pros Card */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-md">
        <h5 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
          <FaCheckCircle className="text-emerald-400 text-sm" />
          <span>Pros & Highlights</span>
        </h5>
        <ul className="space-y-2">
          {pros.map((pro, i) => (
            <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons Card */}
      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 backdrop-blur-md">
        <h5 className="text-xs uppercase tracking-wider font-bold text-red-400 mb-2.5 flex items-center gap-1.5">
          <FaTimesCircle className="text-red-400 text-sm" />
          <span>Areas to Improve</span>
        </h5>
        <ul className="space-y-2">
          {cons.length > 0 ? (
            cons.map((con, i) => (
              <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                <span className="text-red-400 font-bold">✗</span>
                <span>{con}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-400 italic">No significant complaints reported</li>
          )}
        </ul>
      </div>
    </motion.div>
  );
}
