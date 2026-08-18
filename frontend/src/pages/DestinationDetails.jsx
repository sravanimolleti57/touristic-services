import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaStar, FaCalendarAlt, FaClock,
  FaHeart, FaRegHeart, FaShareAlt, FaPlay,
  FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaLightbulb, FaHotel, FaPlane, FaSuitcaseRolling,
  FaMapMarkerAlt, FaTag
} from "react-icons/fa";
import { getPlaceById } from "../data/destinations";
import { HOTELS_LIST } from "../data/hotels";
import SharedNavbar from "../components/SharedNavbar";
import "../styles/shared.css";

/* ─── Stars ────────────────────────────────────── */
function Stars({ rating, size = 13 }) {
  return (
    <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} size={size} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }} />
      ))}
    </span>
  );
}

/* ─── Sentiment Badge ───────────────────────────── */
function SentimentBadge({ label }) {
  const pct = parseInt(label) || 95;
  const color = pct >= 95 ? "#22c55e" : pct >= 90 ? "#2563EB" : "#f59e0b";
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color, background: color + "15",
      padding: "6px 16px", borderRadius: 24, border: `1px solid ${color}30`,
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      ✨ AI Sentiment: {label}
    </span>
  );
}

/* ─── Section Header ────────────────────────────── */
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10, color: "#111827" }}>
        <span style={{ fontSize: 22 }}>{icon}</span> {title}
      </h2>
      {subtitle && <p style={{ color: "#6B7280", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

/* ─── Gallery Lightbox ──────────────────────────── */
function GalleryLightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];

  if (!item) return null;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 2000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: "100%", position: "relative" }}>
        <button onClick={onClose} style={{
          position: "absolute", top: -44, right: 0, background: "rgba(255,255,255,0.15)",
          border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 18, cursor: "pointer", zIndex: 10,
        }}>✕</button>
        {items.length > 1 && (
          <>
            <button onClick={() => setIdx((idx - 1 + items.length) % items.length)} style={{
              position: "absolute", left: -52, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white", fontSize: 16,
            }}><FaChevronLeft /></button>
            <button onClick={() => setIdx((idx + 1) % items.length)} style={{
              position: "absolute", right: -52, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white", fontSize: 16,
            }}><FaChevronRight /></button>
          </>
        )}
        {item.type === "video" ? (
          <iframe src={item.src} title={item.caption} allow="autoplay; encrypted-media" allowFullScreen
            style={{ width: "100%", height: 500, border: "none", borderRadius: 16 }} />
        ) : (
          <img src={item.src} alt={item.caption} style={{
            width: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: 16,
          }} />
        )}
        <div style={{ textAlign: "center", color: "#E5E7EB", fontSize: 14, marginTop: 14 }}>
          {item.caption} &nbsp; {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}

/* ─── Light card style ──────────────────────────── */
const CARD_STYLE = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 20,
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const INNER_CARD = {
  background: "#F9FAFB",
  border: "1px solid #F3F4F6",
  borderRadius: 12,
  padding: "12px 14px",
};

/* ─── Main Page ─────────────────────────────────── */
export default function DestinationDetails() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const place = getPlaceById(placeId);
  const [liked, setLiked] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null);

  const cityName = place?.name ? place.name.split(",")[0].trim() : "";

  // Matching hotels for this destination
  const matchedHotels = HOTELS_LIST.filter(h =>
    h.location.toLowerCase().includes(cityName.toLowerCase()) ||
    (place?.name && h.location.toLowerCase().includes(place.name.toLowerCase()))
  ).slice(0, 3);

  const displayHotels = matchedHotels.length > 0 ? matchedHotels : HOTELS_LIST.slice(0, 3);

  const handleStartBooking = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate(`/login?redirect=${encodeURIComponent(`/book-trip/${place?.id || placeId}`)}`);
    } else {
      navigate(`/book-trip/${place?.id || placeId}`);
    }
  };

  /* ── Not found ── */
  if (!place) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#F8FAFC", color: "#111827",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>🗺️</div>
        <h2 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>Destination not found</h2>
        <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>The destination you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/search?tab=places")} style={{
          padding: "12px 28px", borderRadius: 10, border: "none",
          background: "linear-gradient(to right, #2563EB, #3B82F6)",
          color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>Explore All Destinations</button>
      </div>
    );
  }

  const reviewsToDisplay = place.reviewsData || place.reviewsList || [];

  return (
    <div className="sr-page" style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <SharedNavbar activeTab="destinations" />

      <style>{`
        @keyframes dd-fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dd-back-btn:hover { background:#EFF6FF !important; color:#2563EB !important; }
        .dd-book-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
      `}</style>

      <div className="sr-main">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 36px 60px" }}>

          {/* Sub-header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button
              onClick={() => navigate(-1)}
              className="dd-back-btn"
              style={{
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                color: "#6B7280", padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", transition: "all .2s",
              }}
            >
              <FaArrowLeft size={12} /> Back
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setLiked(!liked)}
                title="Save to wishlist"
                style={{
                  background: liked ? "rgba(239,68,68,0.08)" : "#FFFFFF",
                  border: `1px solid ${liked ? "rgba(239,68,68,0.25)" : "#E5E7EB"}`,
                  borderRadius: 10, width: 42, height: 42, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >
                {liked ? <FaHeart color="#ef4444" size={16} /> : <FaRegHeart color="#9CA3AF" size={16} />}
              </button>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: place.name, url: window.location.href }); }}
                title="Share destination"
                style={{
                  background: "#FFFFFF", border: "1px solid #E5E7EB",
                  borderRadius: 10, width: 42, height: 42, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >
                <FaShareAlt color="#9CA3AF" size={14} />
              </button>
              <button
                onClick={handleStartBooking}
                className="dd-book-btn"
                style={{
                  padding: "10px 22px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 14px rgba(37,99,235,0.25)", transition: "all .2s",
                }}
              >
                <FaSuitcaseRolling /> Book This Trip
              </button>
            </div>
          </div>

          {/* HERO IMAGE BANNER */}
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 20, height: 400 }}>
            <img
              src={place.img}
              alt={place.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"; }}
            />
            {/* Gradient overlay for readability */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)" }} />
            
            <div style={{ position: "absolute", bottom: 28, left: 32, right: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#93c5fd", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 6 }}>
                  {place.category}
                </span>
                <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, marginBottom: 10, color: "white" }}>
                  {place.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Stars rating={place.rating} size={14} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{place.rating}</span>
                    <span style={{ fontSize: 12, color: "#CBD5E1" }}>({(place.reviews || 1200).toLocaleString()} reviews)</span>
                  </div>
                  <SentimentBadge label={place.sentiment || "96% Positive"} />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>
                    <FaCalendarAlt size={11} /> Best: {place.bestTime}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 13, fontWeight: 600 }}>
                    <FaClock size={11} /> {place.tripDuration}
                  </div>
                </div>
              </div>

              {/* Price & Direct Book Action */}
              <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 16, padding: "16px 22px", textAlign: "right" }}>
                <div style={{ color: "#CBD5E1", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>Starting from</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#FFFFFF" }}>{place.price}</div>
                <div style={{ fontSize: 11, color: "#93c5fd", marginBottom: 10 }}>per person · All-inclusive packages</div>
                <button
                  onClick={handleStartBooking}
                  className="dd-book-btn"
                  style={{
                    width: "100%", padding: "11px 22px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                  }}
                >
                  ⚡ Book Now
                </button>
              </div>
            </div>
          </div>

          {/* OVERVIEW & HIGHLIGHTS */}
          <div style={{ ...CARD_STYLE, animation: "dd-fadeUp .5s ease" }}>
            <SectionHeader icon="ℹ️" title="Destination Overview" subtitle={place.overview || place.description} />
            {place.detailedOverview && (
              <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.8, margin: "12px 0 16px" }}>
                {place.detailedOverview}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {(place.tags || []).map(tag => (
                <span key={tag} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)", color: "#2563EB", fontWeight: 600 }}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* Key Quick Facts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 20 }}>
              {[
                { label: "Estimated Budget", value: place.price, icon: "💰" },
                { label: "Best Time", value: place.bestTime, icon: "🌤" },
                { label: "Ideal Duration", value: place.tripDuration || "5–7 Days", icon: "⏱" },
                { label: "Attractions", value: `${(place.visits || []).length} top spots`, icon: "📍" },
                { label: "Language", value: place.language || "Local & English", icon: "🗣️" },
                { label: "Currency", value: place.currency || "Local Currency", icon: "💳" },
              ].map(item => (
                <div key={item.label} style={INNER_CARD}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HIGHLIGHTS */}
          {place.highlights && place.highlights.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="✨" title="Top Highlights & Experiences" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {place.highlights.map((hl, i) => (
                  <div key={i} style={{ ...INNER_CARD, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{hl.icon || "🌟"}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#111827", marginBottom: 4 }}>{hl.title}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>{hl.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISIT SPOTS / ATTRACTIONS */}
          {place.visits && place.visits.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="📍" title="Must-See Attractions & Spots" subtitle={`${place.visits.length} curated highlights with visiting tips`} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {place.visits.map((v, i) => (
                  <div key={i}
                    onClick={() => setExpandedVisit(expandedVisit === i ? null : i)}
                    style={{
                      background: "#F9FAFB",
                      border: `1px solid ${expandedVisit === i ? "rgba(37,99,235,0.3)" : "#E5E7EB"}`,
                      borderRadius: 14, padding: 16, cursor: "pointer",
                      transition: "border-color .2s, transform .2s, box-shadow .2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827" }}>{v.name}</h3>
                      {v.mustSee && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: 10, border: "1px solid #BFDBFE" }}>
                          Must See
                        </span>
                      )}
                    </div>
                    {v.highlight && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", marginBottom: 6 }}>
                        ✨ {v.highlight}
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                      {expandedVisit === i ? (v.desc || v.description) : `${(v.desc || v.description || "").slice(0, 95)}...`}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, fontSize: 11, color: "#9CA3AF" }}>
                      <span>⏱ Best: {v.time || "Morning"}</span>
                      {v.entryFee && <span style={{ color: "#16A34A", fontWeight: 700 }}>Entry: {v.entryFee}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVAILABLE HOTELS PREVIEW */}
          <div style={CARD_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10, color: "#111827" }}>
                  <FaHotel color="#2563EB" /> Available Hotels in {cityName}
                </h2>
                <p style={{ color: "#6B7280", fontSize: 13, margin: "4px 0 0" }}>
                  Hand-picked accommodations ready to select in your destination trip booking
                </p>
              </div>
              <button
                onClick={handleStartBooking}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "1px solid #2563EB",
                  background: "rgba(37,99,235,0.06)", color: "#2563EB", fontWeight: 700,
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Book with Hotel →
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {displayHotels.map(h => (
                <div key={h.id} style={{ ...INNER_CARD, padding: 12 }}>
                  <img
                    src={h.img}
                    alt={h.name}
                    style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"; }}
                  />
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <FaMapMarkerAlt size={10} color="#ef4444" /> {h.location}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <FaStar size={11} color="#f59e0b" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{h.rating}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>{h.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ITINERARY */}
          {place.itinerary && place.itinerary.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="📅" title="Suggested Day-by-Day Itinerary" subtitle={`A perfect ${place.tripDuration || "multi-day"} plan designed by travel experts`} />
              <div style={{ display: "grid", gap: 10 }}>
                {place.itinerary.map((day, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12 }}>
                    <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>
                      D{day.day || i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#111827", fontSize: 14, marginBottom: 4 }}>
                        {day.title || `Day ${i + 1}`}
                      </div>
                      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
                        {Array.isArray(day.activities) ? day.activities.join(" • ") : day.activities}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOCAL CUISINE & TRAVEL TIPS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* CUISINE */}
            {place.localCuisine && (
              <div style={{ ...CARD_STYLE, marginBottom: 0 }}>
                <SectionHeader icon="🍲" title="Must-Try Local Cuisine" />
                <div style={{ display: "grid", gap: 10 }}>
                  {place.localCuisine.map((dish, i) => (
                    <div key={i} style={{ ...INNER_CARD, display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>{dish.icon || "🍛"}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{dish.dish || dish}</div>
                        {dish.desc && <div style={{ fontSize: 11, color: "#6B7280" }}>{dish.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIPS */}
            {place.travelTips && (
              <div style={{ ...CARD_STYLE, marginBottom: 0 }}>
                <SectionHeader icon="💡" title="Insider Travel Tips" />
                <div style={{ display: "grid", gap: 8 }}>
                  {place.travelTips.map((tip, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#FFFBEB", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10 }}>
                      <FaLightbulb size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PACKING ESSENTIALS */}
          {place.whatToPack && place.whatToPack.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="🧳" title="What to Pack" subtitle="Don't forget these recommended essentials for this trip" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {place.whatToPack.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10 }}>
                    <FaCheckCircle size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA GALLERY */}
          {place.gallery && place.gallery.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="📷" title="Photos & Media Gallery" subtitle={`Click to preview photos & videos from ${place.name}`} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {place.gallery.map((item, i) => (
                  <div key={i}
                    onClick={() => setLightboxIdx(i)}
                    style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "pointer", height: 160, transition: "transform .2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    {item.type === "video" ? (
                      <div style={{ width: "100%", height: "100%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #DBEAFE" }}>
                        <FaPlay size={28} color="#2563EB" />
                      </div>
                    ) : (
                      <img src={item.src} alt={item.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", fontSize: 11, color: "white" }}>
                      {item.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAVELER REVIEWS */}
          {reviewsToDisplay.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="💬" title="Verified Traveler Reviews" subtitle={`Based on AI sentiment & traveler experiences`} />
              <div style={{ display: "grid", gap: 12 }}>
                {reviewsToDisplay.map((rev, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "white" }}>
                          {(rev.name || rev.user || "T")[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>{rev.name || rev.user}</div>
                          <Stars rating={rev.rating || 5} size={11} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{rev.date || "Verified Traveler"}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM CALL TO ACTION */}
          <div style={{
            background: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)",
            borderRadius: 20, padding: "32px 36px",
            border: "1px solid rgba(37,99,235,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16, boxShadow: "0 4px 20px rgba(37,99,235,0.08)"
          }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 900, margin: 0, marginBottom: 6, color: "#111827" }}>
                Ready to explore {place.name}?
              </h3>
              <p style={{ color: "#4B5563", fontSize: 14, margin: 0 }}>
                {place.tripDuration} package starting from <strong style={{ color: "#2563EB" }}>{place.price}</strong> per traveler. Includes customizable hotels, flights &amp; activities.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleStartBooking}
                className="dd-book-btn"
                style={{
                  padding: "14px 32px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "white", fontWeight: 800, cursor: "pointer", fontSize: 15, fontFamily: "inherit",
                  boxShadow: "0 6px 18px rgba(37,99,235,0.35)", display: "flex", alignItems: "center", gap: 8
                }}
              >
                <FaSuitcaseRolling /> Book This Destination Now
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <GalleryLightbox
          items={place.gallery}
          startIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </div>
  );
}
