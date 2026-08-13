import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaStar, FaCalendarAlt, FaClock,
  FaHeart, FaRegHeart, FaShareAlt, FaPlay,
  FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaLightbulb,
} from "react-icons/fa";
import { getPlaceById } from "../data/destinations";
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
  const pct = parseInt(label);
  const color = pct >= 95 ? "#22c55e" : pct >= 90 ? "#2563EB" : "#f59e0b";
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color, background: color + "15",
      padding: "6px 16px", borderRadius: 24, border: `1px solid ${color}30`,
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {label}
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

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

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
        <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>The place you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/home")} style={{
          padding: "12px 28px", borderRadius: 10, border: "none",
          background: "linear-gradient(to right, #2563EB, #3B82F6)",
          color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="sr-page" style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <SharedNavbar activeTab="destinations" />

      <style>{`
        @keyframes dd-fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .dd-back-btn:hover { background:#EFF6FF !important; color:#2563EB !important; }
      `}</style>

      <div className="sr-main">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 36px 60px" }}>

          {/* Sub-header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
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
                style={{
                  background: "#FFFFFF", border: "1px solid #E5E7EB",
                  borderRadius: 10, width: 42, height: 42, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
              >
                <FaShareAlt color="#9CA3AF" size={14} />
              </button>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 20, height: 380 }}>
            <img src={place.img} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {/* gradient overlay for text legibility — kept on image */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 40%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: 28, left: 32, right: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: 2, display: "block", marginBottom: 8 }}>
                {place.category}
              </span>
              <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, marginBottom: 12, color: "white" }}>{place.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Stars rating={place.rating} size={14} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{place.rating}</span>
                  <span style={{ fontSize: 12, color: "#CBD5E1" }}>({place.reviews.toLocaleString()} reviews)</span>
                </div>
                <SentimentBadge label={place.sentiment} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 13 }}>
                  <FaCalendarAlt size={11} /> Best: {place.bestTime}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 13 }}>
                  <FaClock size={11} /> {place.tripDuration}
                </div>
              </div>
            </div>
          </div>

          {/* OVERVIEW */}
          <div style={{ ...CARD_STYLE, animation: "dd-fadeUp .5s ease" }}>
            <SectionHeader icon="ℹ️" title="Overview" subtitle={place.description} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {place.tags.map(tag => (
                <span key={tag} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)", color: "#2563EB", fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
              {[
                { label: "Budget", value: place.price, icon: "💰" },
                { label: "Best Time", value: place.bestTime, icon: "🌤" },
                { label: "Duration", value: place.tripDuration || "--", icon: "⏱" },
                { label: "Spots", value: `${place.visits.length} places`, icon: "📍" },
              ].map(item => (
                <div key={item.label} style={INNER_CARD}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* VISIT SPOTS */}
          <div style={CARD_STYLE}>
            <SectionHeader icon="⭐" title="Must-See Spots" subtitle={`${place.visits.length} must-see spots`} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {place.visits.map((v, i) => (
                <div key={i}
                  onClick={() => setExpandedVisit(expandedVisit === i ? null : i)}
                  style={{
                    background: "#F9FAFB",
                    border: `1px solid ${expandedVisit === i ? "rgba(37,99,235,0.3)" : "#E5E7EB"}`,
                    borderRadius: 14, padding: 14, cursor: "pointer",
                    transition: "border-color .2s, transform .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{v.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: 12, flexShrink: 0 }}>
                      <FaStar size={10} /> {v.rating}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
                    {expandedVisit === i ? v.description : `${v.description?.slice(0, 80) || ""}...`}
                  </p>
                  {v.entryFee && <div style={{ marginTop: 8, fontSize: 11, color: "#2563EB", fontWeight: 600 }}>Entry: {v.entryFee}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ITINERARY */}
          {place.itinerary && place.itinerary.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="📅" title="Day-by-Day Itinerary" />
              <div style={{ display: "grid", gap: 10 }}>
                {place.itinerary.map((day, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "12px 14px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12 }}>
                    <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{day.day}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{day.activities}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUISINE */}
          {place.cuisine && place.cuisine.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="🍜" title="Local Cuisine" subtitle="Must-try dishes and flavors" />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {place.cuisine.map((dish, i) => (
                  <span key={i} style={{ fontSize: 13, padding: "8px 16px", borderRadius: 20, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#D97706", fontWeight: 600 }}>
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TIPS */}
          {place.tips && place.tips.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="💡" title="Travel Tips" subtitle="Insider advice from fellow travelers" />
              <div style={{ display: "grid", gap: 10 }}>
                {place.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#FFFBEB", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12 }}>
                    <FaLightbulb size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PACKING */}
          {place.packingList && place.packingList.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="🧳" title="What to Pack" subtitle="Do not forget these essentials for your trip" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {place.packingList.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F0FDF4", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10 }}>
                    <FaCheckCircle size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY */}
          {place.gallery && place.gallery.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="📷" title="Gallery & Media" subtitle={`${place.gallery.length} photos and videos from ${place.name}`} />
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

          {/* REVIEWS */}
          {place.reviewsList && place.reviewsList.length > 0 && (
            <div style={CARD_STYLE}>
              <SectionHeader icon="💬" title="Traveler Reviews" />
              <div style={{ display: "grid", gap: 12 }}>
                {place.reviewsList.map((rev, i) => (
                  <div key={i} style={{ padding: "14px 16px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "white" }}>
                        {rev.user?.[0] || "T"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{rev.user}</div>
                        <Stars rating={rev.rating} size={11} />
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.06))",
            borderRadius: 20, padding: "32px 36px", marginBottom: 0,
            border: "1px solid rgba(37,99,235,0.15)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0, marginBottom: 6, color: "#111827" }}>
                Ready to explore {place.name}?
              </h3>
              <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>
                {place.tripDuration} trip starting from <span style={{ color: "#2563EB", fontWeight: 700 }}>{place.price}</span> per person
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => {
                  const locName = place.name || "";
                  const parts = locName.split(",").map(s => s.trim());
                  const country = parts.length > 1 ? parts[parts.length - 1] : locName;
                  const city = parts[0];
                  navigate(`/search?tab=hotels&location=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
                }}
                style={{
                  padding: "12px 24px", borderRadius: 12,
                  border: "1px solid #2563EB", background: "rgba(37,99,235,0.06)",
                  color: "#2563EB", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
              >
                🏨 Book Hotels in {place.name.split(",")[0]}
              </button>
              <button onClick={() => goToTab("flights")} style={{
                padding: "12px 24px", borderRadius: 12, border: "none",
                background: "linear-gradient(to right, #2563EB, #3B82F6)",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
              }}>
                ✈️ Book Flights
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
