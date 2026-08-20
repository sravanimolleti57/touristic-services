import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";
import ReviewAnalytics from "../components/review-dashboard/ReviewAnalytics";
import HotelDetailsPanel from "../components/review-dashboard/HotelDetailsPanel";
import { HOTELS_LIST, getHotelByName } from "../data/hotels";
import {
  FaStar, FaMapMarkerAlt, FaChartPie, FaChevronDown, FaChevronUp,
  FaInfoCircle, FaComments, FaHotel, FaFilter
} from "react-icons/fa";
import "../styles/shared.css";

// ── Helper: classify a raw review document ─────────────────────────────────
function getReviewType(r) {
  if (r.reviewType === "destination") return "destination";
  if (r.reviewType === "hotel") return "hotel";
  // Backward-compat: if it has a hotel name, treat as hotel review
  const hasHotel = !!(r.hotelName || r.hostelName);
  return hasHotel ? "hotel" : "destination";
}

// ── Sentiment Badge ─────────────────────────────────────────────────────────
function SentimentBadge({ sentiment }) {
  const s = (sentiment || "Neutral");
  const style =
    s === "Positive" ? { bg: "#DCFCE7", text: "#15803D", border: "#16A34A" } :
    s === "Negative" ? { bg: "#FEE2E2", text: "#B91C1C", border: "#DC2626" } :
                       { bg: "#FEF3C7", text: "#B45309", border: "#F59E0B" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
      background: style.bg, color: style.text, border: `1px solid ${style.border}`,
    }}>{s}</span>
  );
}

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title, count, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingBottom: 14, marginBottom: 16, borderBottom: "1px solid #E5E7EB",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `rgba(${color},0.1)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>
          {title} ({count})
        </h2>
      </div>
      <span style={{
        marginLeft: "auto", padding: "4px 12px", borderRadius: 20,
        background: `rgba(${color},0.1)`, fontSize: 11, fontWeight: 700,
        border: `1px solid rgba(${color},0.25)`,
        color: color === "37,99,235" ? "#2563EB" : "#059669",
      }}>
        {count} Entries
      </span>
    </div>
  );
}

// ── Review Row ──────────────────────────────────────────────────────────────
function ReviewRow({ r, showHotel, computeSentiment }) {
  const textContent = r.text || r.audioTranscript || "";
  const sentiment = r.sentiment || r.audioSentiment || computeSentiment(textContent, r.rating);
  const hasAudio = (r.type || "").includes("Audio") || r.audioTranscript || r.audioName;
  const hasVideo = (r.type || "").includes("Video") || r.videoName || r.facialExpression;
  const prefix = hasAudio ? "🎤" : hasVideo ? "🎥" : "📝";
  const label = hasAudio ? "Audio" : hasVideo ? "Video" : "Text";

  return (
    <tr
      style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#F0F7FF"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#111827", minWidth: 120 }}>
        {showHotel
          ? (r.hotelName || r.hostelName || "—")
          : (r.destinationName || "—")}
        {showHotel && r.destinationName && (
          <div style={{ fontSize: 10, color: "#6B7280", marginTop: 1 }}>
            📍 {r.destinationName}
          </div>
        )}
      </td>
      <td style={{ padding: "8px 10px" }}>
        <span style={{
          padding: "2px 8px", borderRadius: 14,
          background: "rgba(37,99,235,0.08)", color: "#2563EB",
          border: "1px solid rgba(37,99,235,0.2)", fontSize: 10, fontWeight: 700,
        }}>
          {r.type || "Text"}
        </span>
      </td>
      <td style={{ padding: "8px 10px", maxWidth: 240, color: "#374151" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#1E293B", lineHeight: 1.4 }}>
          {r.text ? `"${r.text}"` : r.audioTranscript ? `"${r.audioTranscript}"` : "Media Review"}
        </div>
        {r.audioTranscript && r.text !== r.audioTranscript && (
          <div style={{ fontSize: 10, color: "#2563EB", fontWeight: 700, marginTop: 2 }}>
            🎤 STT: "{r.audioTranscript}"
          </div>
        )}
      </td>
      <td style={{ padding: "8px 10px" }}>
        <SentimentBadge sentiment={sentiment} />
        <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: 2 }}>
          {prefix} {label}
        </div>
      </td>
      <td style={{ padding: "8px 10px" }}>
        <span style={{ color: "#F59E0B", fontWeight: 800, display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
          <FaStar style={{ fontSize: 9 }} /> {r.rating || "5"}
        </span>
      </td>
      <td style={{ padding: "8px 10px", color: "#9CA3AF", fontSize: 10 }}>
        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently"}
      </td>
    </tr>
  );
}

// ── Main Reviews Page ───────────────────────────────────────────────────────
export default function Reviews() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params (support both new and legacy formats)
  const paramType        = searchParams.get("type");          // "destination" | "hotel"
  const paramDestination = searchParams.get("destination");   // destination name
  const paramHotel       = searchParams.get("hotel");         // hotel name (legacy too)

  // Resolve initial reviewType
  const resolveInitialType = () => {
    if (paramType === "destination") return "destination";
    if (paramType === "hotel") return "hotel";
    // Legacy: ?hotel= param → hotel review
    if (paramHotel) return "hotel";
    return "destination";
  };

  // Resolve initial destination from param or from hotel lookup (legacy)
  const resolveInitialDestination = () => {
    if (paramDestination) return paramDestination;
    if (paramHotel) {
      const match = HOTELS_LIST.find(h => h.name.toLowerCase() === paramHotel.toLowerCase());
      return match?.destinationName || "";
    }
    return "";
  };

  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { user = {}; }
  const email = user?.email || "guest@user.com";

  const [allReviews, setAllReviews]               = useState([]);
  const [activeReviewType, setActiveReviewType]   = useState(resolveInitialType());
  const [selectedHotelName, setSelectedHotelName] = useState(paramHotel || "");
  const [showMobileAnalytics, setShowMobileAnalytics] = useState(false);
  const [showMobileDetails, setShowMobileDetails]     = useState(false);

  // Initial destination / hotel resolved from URL for UploadReview
  const [initDestination] = useState(resolveInitialDestination());
  const [initHotel]       = useState(paramHotel || "");

  const selectedHotelInfo = useMemo(() => {
    return getHotelByName(selectedHotelName) || HOTELS_LIST[0] || {};
  }, [selectedHotelName]);

  const computeTextSentiment = (reviewText, ratingVal) => {
    const text = (reviewText || "").toLowerCase().trim();
    if (!text) {
      return Number(ratingVal) >= 4 ? "Positive" : Number(ratingVal) === 3 ? "Neutral" : "Negative";
    }
    const negWords = ["terrible","bad","poor","worst","horrible","dirty","slow","disappointed","rude","hate","uncomfortable","smelly","broken","waste","expensive","cold","delay","bug","stain","disturbing","fail","failure","awful"];
    const posWords = ["great","amazing","good","love","excellent","clean","beautiful","friendly","delight","best","perfect","royal","superb","stunning","awesome","pleasant","cozy","luxurious","tasty","wonderful","enjoyed","top notch","highly","delicious","comfort","comfortable","nice","fantastic","happy","recommend"];
    const neuWords = ["okay","ok","average","fair","decent","fine","normal","standard","moderate","satisfactory","acceptable","so-so","mediocre","mixed"];
    let neg = 0, pos = 0, neu = 0;
    negWords.forEach(w => { if (text.includes(w)) neg++; });
    posWords.forEach(w => { if (text.includes(w)) pos++; });
    neuWords.forEach(w => { if (text.includes(w)) neu++; });
    if (neg > pos && neg > neu) return "Negative";
    if (pos > neg && pos > neu) return "Positive";
    if (neu > 0) return "Neutral";
    if (Number(ratingVal) === 3) return "Neutral";
    return Number(ratingVal) >= 4 ? "Positive" : "Negative";
  };

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    const local = JSON.parse(localStorage.getItem("local_reviews") || "[]");
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/reviews`);
      const apiReviews = Array.isArray(res.data) ? res.data : [];
      const seen = new Set();
      const combined = [];
      [...apiReviews, ...local].forEach(r => {
        const key = r._id || `${r.hostelName || r.hotelName}-${r.text || r.review}-${r.createdAt}`;
        if (!seen.has(key)) { seen.add(key); combined.push(r); }
      });
      setAllReviews(combined);
    } catch (err) {
      console.log("Backend reviews load note (using local cache):", err);
      setAllReviews(local);
    }
  };

  const handleNewReviewSubmitted = (targetName, rType) => {
    if (rType) setActiveReviewType(rType);
    if (rType === "hotel" && targetName) setSelectedHotelName(targetName);
    loadReviews();
  };

  // Separate reviews into destination vs hotel
  const destinationReviews = useMemo(() =>
    allReviews.filter(r => getReviewType(r) === "destination"),
  [allReviews]);

  const hotelReviews = useMemo(() =>
    allReviews.filter(r => getReviewType(r) === "hotel"),
  [allReviews]);

  // Analytics: use the review type that is currently active for the analytics panel
  const analyticsReviews = useMemo(() => {
    if (activeReviewType === "destination") return destinationReviews;
    return hotelReviews;
  }, [activeReviewType, destinationReviews, hotelReviews]);

  // Table column headers
  const destTableCols = ["Destination", "Type", "Review / Feedback", "AI Sentiment", "Rating", "Date"];
  const hotelTableCols = ["Hotel", "Type", "Review / Feedback", "AI Sentiment", "Rating", "Date"];

  /* ── shared card style ── */
  const panelCard = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
  };

  return (
    <>
      <SharedNavbar activeTab="reviews" />

      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        paddingTop: 76,
        paddingBottom: 40,
        paddingLeft: 16,
        paddingRight: 16,
        color: "#111827",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Header Banner ── */}
          <div style={{ ...panelCard, padding: "16px 22px", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 160, height: 160, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <span style={{
                padding: "3px 10px", borderRadius: 16,
                background: "rgba(37,99,235,0.08)", color: "#2563EB",
                border: "1px solid rgba(37,99,235,0.2)",
                fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px",
              }}>
                AI Reviews & Sentiment Hub
              </span>
              <h1 style={{ fontSize: 21, fontWeight: 900, color: "#111827", margin: "6px 0 2px", letterSpacing: "-0.01em" }}>
                Reviews &amp; Emotion Analytics
              </h1>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                Submit destination and hotel reviews with real-time AI sentiment analysis. Reviews are separated by type.
              </p>
            </div>
          </div>

          {/* ── Mobile Collapsible Toggles ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="lg-hidden-reviews">
            <button
              onClick={() => setShowMobileAnalytics(!showMobileAnalytics)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 16,
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                color: "#2563EB", fontWeight: 700, fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaChartPie />
                <span>AI Emotion Dashboard ({analyticsReviews.length} reviews)</span>
              </div>
              {showMobileAnalytics ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {showMobileAnalytics && (
              <div style={{ ...panelCard, padding: 16 }}>
                <ReviewAnalytics reviews={analyticsReviews} />
              </div>
            )}

            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 16,
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                color: "#7C3AED", fontWeight: 700, fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaInfoCircle />
                <span>Hotel Information ({selectedHotelInfo?.name || selectedHotelName || "—"})</span>
              </div>
              {showMobileDetails ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {showMobileDetails && (
              <div style={{ ...panelCard, padding: 16 }}>
                <HotelDetailsPanel hotel={selectedHotelInfo} />
              </div>
            )}
          </div>

          {/* ── 3-Column Layout ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px 220px", gap: 24, alignItems: "start" }}
            className="reviews-grid">

            {/* Column 1 — Form + Review Tables (left) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Review Form */}
              <UploadReview
                selectedHotelName={selectedHotelName}
                onHotelSelect={setSelectedHotelName}
                onAnalysisComplete={handleNewReviewSubmitted}
                initialReviewType={resolveInitialType()}
                initialDestination={initDestination}
                initialHotel={initHotel}
              />

              {/* ── DESTINATION REVIEWS TABLE ── */}
              <div style={{ ...panelCard, padding: "20px 24px" }}>
                <SectionHeader
                  icon={<FaMapMarkerAlt style={{ color: "#059669", fontSize: 16 }} />}
                  title="Destination Reviews"
                  count={destinationReviews.length}
                  color="5,150,105"
                />

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {destTableCols.map(col => (
                          <th key={col} style={{
                            padding: "10px 12px", textAlign: "left",
                            fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.5px", color: "#6B7280", fontSize: 11,
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {destinationReviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "32px 12px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                            No destination reviews yet. Select <strong>Destination Review</strong> above and submit the first one!
                          </td>
                        </tr>
                      ) : (
                        destinationReviews.map((r, i) => (
                          <ReviewRow key={r._id || i} r={r} showHotel={false} computeSentiment={computeTextSentiment} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── HOTEL REVIEWS TABLE ── */}
              <div style={{ ...panelCard, padding: "20px 24px" }}>
                <SectionHeader
                  icon={<FaHotel style={{ color: "#2563EB", fontSize: 16 }} />}
                  title="Hotel Reviews"
                  count={hotelReviews.length}
                  color="37,99,235"
                />

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {hotelTableCols.map(col => (
                          <th key={col} style={{
                            padding: "10px 12px", textAlign: "left",
                            fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.5px", color: "#6B7280", fontSize: 11,
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hotelReviews.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "32px 12px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                            No hotel reviews yet. Select <strong>Hotel Review</strong> above and submit the first one!
                          </td>
                        </tr>
                      ) : (
                        hotelReviews.map((r, i) => (
                          <ReviewRow key={r._id || i} r={r} showHotel={true} computeSentiment={computeTextSentiment} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Column 2 — Analytics Dashboard */}
            <div style={{ position: "sticky", top: 96, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
              className="reviews-col2">
              {/* Analytics type toggle */}
              <div style={{ ...panelCard, padding: "12px 14px", marginBottom: 12 }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <FaFilter style={{ marginRight: 5 }} />Analytics For
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  {["destination", "hotel"].map(t => (
                    <button key={t}
                      onClick={() => setActiveReviewType(t)}
                      style={{
                        flex: 1, padding: "7px 4px", borderRadius: 8,
                        border: activeReviewType === t
                          ? (t === "destination" ? "2px solid #059669" : "2px solid #2563EB")
                          : "1px solid #E5E7EB",
                        background: activeReviewType === t
                          ? (t === "destination" ? "rgba(5,150,105,0.08)" : "rgba(37,99,235,0.08)")
                          : "#F8FAFC",
                        color: activeReviewType === t
                          ? (t === "destination" ? "#059669" : "#2563EB")
                          : "#6B7280",
                        fontWeight: 700, fontSize: 11, cursor: "pointer",
                        fontFamily: "inherit", transition: "all 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}
                    >
                      {t === "destination" ? <FaMapMarkerAlt size={10} /> : <FaHotel size={10} />}
                      {t === "destination" ? "Destinations" : "Hotels"}
                    </button>
                  ))}
                </div>
              </div>
              <ReviewAnalytics reviews={analyticsReviews} />
            </div>

            {/* Column 3 — Hotel Details */}
            <div style={{ position: "sticky", top: 96, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
              className="reviews-col3">
              <HotelDetailsPanel hotel={selectedHotelInfo} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .lg-hidden-reviews { display: flex !important; }
          .reviews-col2, .reviews-col3 { display: none !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 1025px) {
          .lg-hidden-reviews { display: none !important; }
        }
      `}</style>
    </>
  );
}