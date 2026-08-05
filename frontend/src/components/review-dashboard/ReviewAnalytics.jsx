import React from "react";
import { motion } from "framer-motion";
import { useReviewAnalytics } from "../../hooks/useReviewAnalytics";
import EmotionChart from "./EmotionChart";
import StatisticsCard from "./StatisticsCard";
import KeywordCloud from "./KeywordCloud";
import ProsConsCard from "./ProsConsCard";
import AISummary from "./AISummary";
import { FaChartPie, FaSpinner, FaExclamationCircle } from "react-icons/fa";

export default function ReviewAnalytics({ reviews = [] }) {
  const { analytics, loading } = useReviewAnalytics(reviews);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 flex flex-col items-center justify-center min-h-[280px] gap-3">
        <FaSpinner className="text-3xl text-sky-400 animate-spin" />
        <span className="text-xs font-medium text-slate-400">Computing Emotion Pie Chart...</span>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 text-center flex flex-col items-center gap-2">
        <FaExclamationCircle className="text-2xl text-slate-500 mb-1" />
        <h4 className="text-sm font-bold text-slate-300">No Review Analytics Available</h4>
        <p className="text-[11px] text-slate-400">Submit a hotel review to generate the Emotion Pie Chart and statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-slate-100 font-sans">
      {/* Dashboard Title */}
      <div className="flex items-center gap-2 px-1">
        <FaChartPie className="text-sky-400 text-base" />
        <h3 className="text-base font-extrabold tracking-tight text-white">
          Analytics Dashboard
        </h3>
      </div>

      {/* 1. Large Animated Pie Chart Centerpiece */}
      <EmotionChart
        data={analytics.emotionPieData}
        avgRating={analytics.avgRating}
        totalReviews={analytics.totalReviews}
      />

      {/* 2. AI Summary Card */}
      <AISummary summary={analytics.aiSummary} />

      {/* 3. Small Cards Grid */}
      <StatisticsCard stats={analytics} />

      {/* 4. Most Mentioned Keywords */}
      <KeywordCloud keywords={analytics.keywords} />

      {/* 5. Pros and Cons (Happy Customers & Improvement Areas) */}
      <ProsConsCard pros={analytics.pros} cons={analytics.cons} />
    </div>
  );
}
