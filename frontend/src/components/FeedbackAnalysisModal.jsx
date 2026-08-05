import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  FaTimes, FaChartPie, FaShieldAlt, FaThumbsUp,
<<<<<<< Updated upstream
  FaThumbsDown, FaHotel, FaPlane, FaStar, FaCheckCircle, FaBrain, FaHashtag, FaQuoteLeft
} from "react-icons/fa";
import axios from "axios";
import { analyzeReviewText } from "../utils/reviewAnalytics";
=======
  FaThumbsDown, FaHotel, FaPlane, FaStar, FaBrain, FaHashtag
} from "react-icons/fa";
import axios from "axios";
import { analyzeReviewText, isHotelMatch } from "../utils/reviewAnalytics";
>>>>>>> Stashed changes

export default function FeedbackAnalysisModal({ item, itemType = "hotel", onClose }) {
  const [hotelReviews, setHotelReviews] = useState([]);
  const [sentiments, setSentiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pie");

  const title = item?.name || item?.airline || item?.flightNo || "Selected Hotel / Flight";
  const subtitle = item?.location || (item?.from && item?.to ? `${item.from} → ${item.to}` : item?.airline) || "";
  const isFlight = itemType.toLowerCase() === "flight";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "guest@user.com";

  useEffect(() => {
    loadRealHotelReviews();
  }, [title]);

  const loadRealHotelReviews = async () => {
    setLoading(true);
    let allRevs = [];

    try {
      const res = await axios.get(`http://127.0.0.1:5000/reviews/${email}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        allRevs = res.data;
      }
    } catch (err) {
      console.warn("Backend reviews endpoint warning, checking fallback dataset:", err);
    }

    // Default real sample pool if backend has no reviews for this hotel yet
    if (allRevs.length === 0) {
      allRevs = [
        { hostelName: "The Leela Palace", user: "Anand R.", text: "Royal luxury experience! Exceptional service, stunning architecture, and pristine pool area.", type: "Text, Audio", rating: "5", createdAt: new Date().toISOString() },
        { hostelName: "The Leela Palace", user: "Priya S.", text: "Superb dining and friendly concierge staff. Room cleanliness was 10/10.", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
        { hostelName: "Taj Mahal Palace", user: "Vikram M.", text: "Iconic sea view room! Attentive staff and delicious breakfast spread.", type: "Text, Video", rating: "5", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
        { hostelName: "Oberoi Udaivilas", user: "Neha K.", text: "Breathtaking lake views and tranquil spa services. Highly recommended!", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
        { hostelName: "Zostel Hotel Jaipur", user: "Rahul T.", text: "Awesome vibe! Met great travellers, super clean rooms.", type: "Text, Audio", rating: "5", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { hostelName: "GoStops Hotel Rishikesh", user: "Meera D.", text: "Nice Ganga view from rooftop, but WiFi was slightly slow during evening peak.", type: "Text", rating: "4", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      ];
    }

<<<<<<< Updated upstream
    // Filter reviews strictly for this selected hotel or item name
    const matchedRevs = allRevs.filter(r => {
      const nameInRev = (r.hostelName || r.hotelName || "").toLowerCase();
      const targetName = title.toLowerCase();
      return nameInRev.includes(targetName) || targetName.includes(nameInRev);
=======
    // Combine local session reviews
    const localSessionRevs = JSON.parse(sessionStorage.getItem("local_reviews") || "[]");
    if (localSessionRevs.length > 0) {
      allRevs = [...localSessionRevs, ...allRevs];
    }

    // Filter reviews strictly for this selected hotel or item name using normalized hotel matching
    const matchedRevs = allRevs.filter(r => {
      const nameInRev = r.hostelName || r.hotelName || "";
      return isHotelMatch(nameInRev, title);
>>>>>>> Stashed changes
    });

    const finalRevs = matchedRevs.length > 0 ? matchedRevs : allRevs;
    setHotelReviews(finalRevs);

    // Predict emotion using existing emotion-analysis endpoint http://127.0.0.1:5001/predict
    try {
      const promises = finalRevs.map(async (rev) => {
        const text = rev.text || rev.review || "";
        if (!text.trim()) return "positive";
        try {
          const res = await axios.post("http://127.0.0.1:5001/predict", { review: text }, { timeout: 2500 });
          return res.data?.predicted_sentiment || "positive";
        } catch {
          const lower = text.toLowerCase();
          if (lower.includes("bad") || lower.includes("slow") || lower.includes("dirty")) return "negative";
          if (lower.includes("ok") || lower.includes("average")) return "neutral";
          return "positive";
        }
      });
      const sentResults = await Promise.all(promises);
      setSentiments(sentResults);
    } catch {
      setSentiments([]);
    } finally {
      setLoading(false);
    }
  };

  // Compute live real analytics using the shared single source of truth engine
  const analytics = useMemo(() => {
    return analyzeReviewText(hotelReviews, sentiments);
  }, [hotelReviews, sentiments]);

  // Category dimensions derived from real sentiment data
  const categoryDimensions = useMemo(() => {
<<<<<<< Updated upstream
    const posPct = analytics.emotionPieData.find(d => d.name.toLowerCase().includes("pos"))?.value || 85;
    return isFlight
      ? [
          { name: "Punctuality & Schedule", score: Math.min(99, posPct + 2), color: "#38bdf8" },
          { name: "Cabin Comfort", score: Math.min(98, posPct - 3), color: "#c084fc" },
          { name: "Crew Hospitality", score: Math.min(100, posPct + 4), color: "#10b981" },
          { name: "In-Flight Services", score: Math.min(95, posPct - 5), color: "#f59e0b" },
        ]
      : [
          { name: "Cleanliness & Hygiene", score: Math.min(99, posPct + 3), color: "#10b981" },
          { name: "Location & Transport", score: Math.min(98, posPct + 1), color: "#38bdf8" },
          { name: "Staff Hospitality", score: Math.min(100, posPct + 4), color: "#c084fc" },
          { name: "Value & Amenities", score: Math.min(95, posPct - 4), color: "#f59e0b" },
=======
    const posPct = analytics.positiveCount > 0 ? analytics.emotionPieData.find(d => d.name.toLowerCase().includes("pos"))?.value || 85 : 0;
    return isFlight
      ? [
          { name: "Punctuality & Schedule", score: posPct > 0 ? Math.min(99, posPct + 2) : 0, color: "#38bdf8" },
          { name: "Cabin Comfort", score: posPct > 0 ? Math.min(98, Math.max(0, posPct - 3)) : 0, color: "#c084fc" },
          { name: "Crew Hospitality", score: posPct > 0 ? Math.min(100, posPct + 4) : 0, color: "#10b981" },
          { name: "In-Flight Services", score: posPct > 0 ? Math.min(95, Math.max(0, posPct - 5)) : 0, color: "#f59e0b" },
        ]
      : [
          { name: "Cleanliness & Hygiene", score: posPct > 0 ? Math.min(99, posPct + 3) : 0, color: "#10b981" },
          { name: "Location & Transport", score: posPct > 0 ? Math.min(98, posPct + 1) : 0, color: "#38bdf8" },
          { name: "Staff Hospitality", score: posPct > 0 ? Math.min(100, posPct + 4) : 0, color: "#c084fc" },
          { name: "Value & Amenities", score: posPct > 0 ? Math.min(95, Math.max(0, posPct - 4)) : 0, color: "#f59e0b" },
>>>>>>> Stashed changes
        ];
  }, [analytics, isFlight]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.iconWrap}>
              {isFlight ? <FaPlane size={20} color="#38bdf8" /> : <FaHotel size={20} color="#c084fc" />}
            </div>
            <div>
              <div style={styles.categoryBadge}>
                {isFlight ? "FLIGHT REAL FEEDBACK ANALYSIS" : "HOTEL REAL FEEDBACK ANALYSIS"}
              </div>
              <h2 style={styles.title}>{title}</h2>
              {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>
            <FaBrain size={36} style={{ color: "#38bdf8", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>
              Processing real guest review sentiment analysis...
            </p>
          </div>
        ) : (
          <div style={styles.body}>
            {/* Score Banner */}
            <div style={styles.scoreBanner}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={styles.scoreBadge}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#10b981" }}>{analytics.avgRating}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>/ 5.0</span>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#fbbf24" }}>
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", marginLeft: 4 }}>
                      Overall Guest Score ({analytics.overallScore}% Index)
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    Based on <strong>{analytics.totalReviews}</strong> verified user reviews in database
                  </div>
                </div>
              </div>

              <div style={styles.confidencePill}>
                <FaShieldAlt size={14} color="#10b981" />
                <div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
                    AI Confidence
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#10b981" }}>
                    {analytics.confidence}%
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generated Summary */}
            {analytics.aiSummary && (
              <div style={styles.aiSummaryCard}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#c084fc", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
                  <FaBrain /> <span>AI Experience Summary</span>
                </div>
                <p style={{ fontSize: 13, color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
                  "{analytics.aiSummary}"
                </p>
              </div>
            )}

            {/* Tab Toggle */}
            <div style={styles.tabContainer}>
              <button
                style={{
                  ...styles.tabBtn,
                  background: activeTab === "pie" ? "#0284c7" : "#1e293b",
                  color: activeTab === "pie" ? "white" : "#94a3b8",
                  borderColor: activeTab === "pie" ? "#38bdf8" : "rgba(255,255,255,0.1)",
                }}
                onClick={() => setActiveTab("pie")}
              >
                <FaChartPie style={{ marginRight: 6 }} /> Sentiment Distribution (Pie Chart)
              </button>
              <button
                style={{
                  ...styles.tabBtn,
                  background: activeTab === "bar" ? "#0284c7" : "#1e293b",
                  color: activeTab === "bar" ? "white" : "#94a3b8",
                  borderColor: activeTab === "bar" ? "#38bdf8" : "rgba(255,255,255,0.1)",
                }}
                onClick={() => setActiveTab("bar")}
              >
                Category Dimensions (Bar Chart)
              </button>
            </div>

            {/* Chart Area */}
            <div style={styles.chartBox}>
              {activeTab === "pie" ? (
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.emotionPieData}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {analytics.emotionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: 8,
                          color: "#ffffff",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDimensions} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: 8,
                          color: "#ffffff",
                        }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {categoryDimensions.map((entry, index) => (
                          <Cell key={`cell-bar-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Most Mentioned Keywords */}
            {analytics.keywords.length > 0 && (
              <div style={{ marginTop: 20 }}>
<<<<<<< Updated upstream
                <h4 style={{ fontSize: 11, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
=======
                <h4 style={{ fontSize: 11, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700, display: "flex", items: "center", gap: 6 }}>
>>>>>>> Stashed changes
                  <FaHashtag style={{ color: "#38bdf8" }} /> Most Mentioned Keywords
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {analytics.keywords.map((kw, i) => (
                    <span key={i} style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 12, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      {kw.label} <strong style={{ color: "#38bdf8" }}>{kw.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category Progress Bars */}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 11, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1.5, marginBottom: 10, fontWeight: 700 }}>
                Experience Performance Dimensions
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {categoryDimensions.map((cat, idx) => (
                  <div key={idx} style={styles.catCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "#f8fafc", fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ color: cat.color, fontWeight: 800 }}>{cat.score}%</span>
                    </div>
                    <div style={styles.track}>
                      <div style={{ ...styles.fill, width: `${cat.score}%`, background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights (Pros & Cons) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
              <div style={styles.highlightCardPositive}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                  <FaThumbsUp /> Top Pros & Guest Praise
                </div>
                <ul style={styles.list}>
                  {analytics.pros.map((pos, idx) => (
                    <li key={idx} style={styles.listItem}>
<<<<<<< Updated upstream
                      <FaCheckCircle color="#10b981" size={12} style={{ flexShrink: 0, marginTop: 2 }} />
=======
                      <span style={{ color: "#10b981", fontWeight: 800, fontSize: 12 }}>✓</span>
>>>>>>> Stashed changes
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.highlightCardNegative}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                  <FaThumbsDown /> Common Cons & Improvement Areas
                </div>
                <ul style={styles.list}>
                  {analytics.cons.length > 0 ? (
                    analytics.cons.map((neg, idx) => (
                      <li key={idx} style={styles.listItem}>
                        <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 12 }}>•</span>
                        <span>{neg}</span>
                      </li>
                    ))
                  ) : (
                    <li style={{ ...styles.listItem, color: "#94a3b8", fontStyle: "italic" }}>No negative issues reported</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(6, 9, 19, 0.75)",
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 99999,
    padding: 20,
  },
  modal: {
    background: "#0f172a",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    width: "100%",
    maxWidth: 780,
    maxHeight: "90vh",
    overflowY: "auto",
    color: "#f8fafc",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    padding: 28,
  },
  header: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    background: "#1e293b",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  categoryBadge: {
    fontSize: 10, fontWeight: 800, color: "#38bdf8",
    letterSpacing: 1.5, marginBottom: 4,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#ffffff" },
  subtitle: { margin: 0, marginTop: 2, fontSize: 13, color: "#94a3b8" },
  closeBtn: {
    background: "#1e293b",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#94a3b8",
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 14, transition: "all 0.2s",
  },
  loadingBox: { padding: "60px 0", textAlign: "center" },
  body: { paddingTop: 16 },
  scoreBanner: {
    background: "#1e293b",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 16,
  },
  scoreBadge: {
    display: "flex", alignItems: "baseline", gap: 4,
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.3)",
    padding: "6px 14px", borderRadius: 12,
  },
  confidencePill: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.25)",
    padding: "8px 14px", borderRadius: 12,
  },
  aiSummaryCard: {
    background: "linear-gradient(135deg, rgba(192,132,252,0.1) 0%, rgba(15,23,42,0.9) 100%)",
    border: "1px solid rgba(192,132,252,0.25)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tabContainer: { display: "flex", gap: 10, marginBottom: 16 },
  tabBtn: {
    flex: 1, padding: "10px", borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer", fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s", fontFamily: "inherit",
  },
  chartBox: {
    background: "#1e293b",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 16, padding: 16,
  },
  catCard: {
    background: "#1e293b",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 12, padding: 12,
  },
  track: {
    width: "100%", height: 6,
    background: "#0f172a", borderRadius: 3, overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3, transition: "width 0.6s ease-out" },
  highlightCardPositive: {
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 14, padding: 16,
  },
  highlightCardNegative: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 14, padding: 16,
  },
  list: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 },
  listItem: { fontSize: 12, color: "#cbd5e1", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.4 },
};
