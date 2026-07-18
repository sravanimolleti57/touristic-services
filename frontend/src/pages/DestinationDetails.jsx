import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt,
  FaHeart, FaRegHeart, FaShareAlt, FaPlay, FaHome, FaHotel,
  FaPlane, FaComments, FaUserCircle, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaLightbulb, FaSuitcase, FaUtensils, FaGlobeAmericas,
  FaRoute, FaMapSigns
} from "react-icons/fa";
import { getPlaceById } from "../data/destinations";

// ── Stars ────────────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  return (
    <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} size={size} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }} />
      ))}
    </span>
  );
}

// ── Sentiment Badge ──────────────────────────────────────────────────────────
function SentimentBadge({ label }) {
  const pct = parseInt(label);
  const color = pct >= 95 ? "#22c55e" : pct >= 90 ? "#3b82f6" : "#f59e0b";
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, color, background: color + "18",
      padding: "6px 16px", borderRadius: 24, border: `1px solid ${color}40`,
      display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      😊 {label}
    </span>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span> {title}
      </h2>
      {subtitle && <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

// ── Gallery Lightbox ─────────────────────────────────────────────────────────
function GalleryLightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const item = items[idx];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 2000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: "100%", position: "relative" }}>
        <button onClick={onClose} style={{
          position: "absolute", top: -40, right: 0, background: "none",
          border: "none", color: "white", fontSize: 28, cursor: "pointer", zIndex: 10,
        }}>✕</button>
        {items.length > 1 && (
          <>
            <button onClick={() => setIdx((idx - 1 + items.length) % items.length)} style={{
              position: "absolute", left: -50, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "white", fontSize: 16,
            }}><FaChevronLeft /></button>
            <button onClick={() => setIdx((idx + 1) % items.length)} style={{
              position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
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
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, marginTop: 14 }}>
          {item.caption} — {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}

// ── Card Wrapper ─────────────────────────────────────────────────────────────
const card = {
  background: "#1e293b", borderRadius: 20, padding: 28,
  border: "1px solid #334155", marginBottom: 24,
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DestinationDetails() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const place = getPlaceById(placeId);
  const [liked, setLiked] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [expandedVisit, setExpandedVisit] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Traveler", email: "user@example.com" };
  const userEmail = user.email || "user@example.com";

  const [bookedHotelsCount, setBookedHotelsCount] = useState(0);
  const [bookedFlightsCount, setBookedFlightsCount] = useState(0);

  useEffect(() => {
    const savedHotels = JSON.parse(localStorage.getItem(`bookedHotels_${userEmail}`)) || [];
    const savedFlights = JSON.parse(localStorage.getItem(`bookedFlights_${userEmail}`)) || [];
    setBookedHotelsCount(savedHotels.length);
    setBookedFlightsCount(savedFlights.length);
  }, [userEmail]);

  if (!place) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0f172a", color: "white",
        fontFamily: "'Segoe UI', sans-serif", flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>🗺️</div>
        <h2 style={{ fontWeight: 800, fontSize: 24 }}>Destination not found</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>The place you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/home")} style={{
          padding: "12px 28px", borderRadius: 10, border: "none",
          background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
          color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>Go Home</button>
      </div>
    );
  }

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div style={{
        width: 220, background: "#1e293b", padding: "28px 16px", flexShrink: 0,
        borderRight: "1px solid #334155", display: "flex", flexDirection: "column",
      }}>
        <h2 style={{
          marginBottom: 32, fontSize: 17, fontWeight: 800,
          background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Travel Dashboard 🌍
        </h2>
        {[
          { icon: <FaHome />, label: "Home", action: () => navigate("/home") },
          { icon: <FaComments />, label: "Reviews", action: () => navigate("/dashboard") },
          { icon: <FaMapMarkerAlt />, label: "Places", active: true, action: () => goToTab("places") },
          { icon: <FaHotel />, label: "Hotels", action: () => goToTab("hotels") },
          { icon: <FaPlane />, label: "Flights", action: () => goToTab("flights") },
        ].map(({ icon, label, active, action }) => (
          <div key={label} onClick={action} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderRadius: 10, cursor: "pointer",
            fontSize: 14, fontWeight: 500, marginBottom: 4,
            background: active ? "#1d4ed840" : "transparent",
            color: active ? "#3b82f6" : "#94a3b8",
            borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
          }}>
            {icon} {label}
          </div>
        ))}

        {/* Trip Summary Sidebar Widget */}
        <div style={{ marginTop: "auto", background: "#0f172a", borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            📋 Trip Summary
          </div>
          {[
            { label: "Duration", value: place.tripDuration || "—" },
            { label: "Budget", value: place.price },
            { label: "Best Time", value: place.bestTime },
            { label: "Places to Visit", value: `${place.visits.length} spots` },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "30px 36px", overflowY: "auto" }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <button onClick={() => navigate(-1)} style={{
            background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
            padding: "10px 18px", borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600,
          }}>
            <FaArrowLeft size={12} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setLiked(!liked)} style={{
              background: liked ? "#ef444418" : "#1e293b", border: `1px solid ${liked ? "#ef444440" : "#334155"}`, borderRadius: 10,
              width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              {liked ? <FaHeart color="#ef4444" size={16} /> : <FaRegHeart color="#94a3b8" size={16} />}
            </button>
            <button onClick={() => {
              if (navigator.share) navigator.share({ title: place.name, url: window.location.href });
            }} style={{
              background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
              width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <FaShareAlt color="#94a3b8" size={14} />
            </button>
            <div style={{ position: "relative" }}>
              <FaUserCircle size={42} style={{ cursor: "pointer", color: "#3b82f6" }} onClick={() => setShowProfile(!showProfile)} />
              {showProfile && (
                <div style={{
                  position: "absolute", top: 52, right: 0, background: "#1e293b", padding: 20,
                  borderRadius: 16, width: 220, boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  zIndex: 200, border: "1px solid #334155",
                }}>
                  <div style={{ fontWeight: 700 }}>{user.name || "Traveler"}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email}</div>
                  <hr style={{ border: "1px solid #334155", margin: "12px 0" }} />
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>🏨 Hotels Booked: {bookedHotelsCount}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>✈️ Flights Booked: {bookedFlightsCount}</div>
                  <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{
                    width: "100%", padding: 10, borderRadius: 8, border: "none",
                    background: "#ef444420", color: "#ef4444", cursor: "pointer", fontWeight: 600,
                    marginTop: 12,
                  }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════════════════ */}
        <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", marginBottom: 28, height: 380 }}>
          <img src={place.img} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 40%, transparent 70%)",
          }} />
          <div style={{ position: "absolute", bottom: 28, left: 32, right: 32 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase",
              letterSpacing: 2, display: "block", marginBottom: 8,
            }}>
              {place.category}
            </span>
            <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, marginBottom: 12 }}>{place.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Stars rating={place.rating} size={14} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{place.rating}</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>({place.reviews.toLocaleString()} reviews)</span>
              </div>
              <SentimentBadge label={place.sentiment} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd", fontSize: 13 }}>
                <FaCalendarAlt size={11} /> Best: {place.bestTime}
              </div>
            </div>
          </div>
          <div style={{
            position: "absolute", top: 20, right: 24,
            background: "rgba(15,23,42,0.7)", backdropFilter: "blur(10px)",
            padding: "12px 20px", borderRadius: 16, border: "1px solid rgba(148,163,184,0.2)",
          }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>From</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#3b82f6" }}>{place.price}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>per person</div>
          </div>
        </div>

        {/* Tags + Ideal For */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          {place.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 12, padding: "6px 16px", borderRadius: 24,
              background: "rgba(59,130,246,0.1)", color: "#93c5fd",
              border: "1px solid rgba(59,130,246,0.25)", fontWeight: 600,
            }}>{tag}</span>
          ))}
          {place.idealFor && (
            <>
              <span style={{ color: "#334155", margin: "0 4px" }}>|</span>
              {place.idealFor.map(item => (
                <span key={item} style={{
                  fontSize: 12, padding: "6px 14px", borderRadius: 24,
                  background: "rgba(139,92,246,0.1)", color: "#c4b5fd",
                  border: "1px solid rgba(139,92,246,0.25)", fontWeight: 600,
                }}>👤 {item}</span>
              ))}
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            TRAVEL ESSENTIALS BAR
        ═══════════════════════════════════════════════════════ */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24,
        }}>
          {[
            { icon: "⏱️", label: "Trip Duration", value: place.tripDuration },
            { icon: "🗣️", label: "Language", value: place.language },
            { icon: "💱", label: "Currency", value: place.currency },
            { icon: "🕐", label: "Timezone", value: place.timezone },
            { icon: "🛂", label: "Visa", value: place.visa },
            { icon: "🚗", label: "Transport", value: place.transportation },
          ].filter(i => i.value).map(item => (
            <div key={item.label} style={{
              background: "#1e293b", borderRadius: 14, padding: "14px 16px",
              border: "1px solid #334155",
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white", lineHeight: 1.4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            DETAILED OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        <div style={card}>
          <SectionHeader icon="✨" title="Trip Overview" subtitle="Everything you need to know about this destination" />
          <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.9, margin: 0 }}>
            {place.detailedOverview || place.overview}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TRIP HIGHLIGHTS
        ═══════════════════════════════════════════════════════ */}
        {place.highlights && (
          <div style={card}>
            <SectionHeader icon="🌟" title="Trip Highlights" subtitle="The best experiences this destination has to offer" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {place.highlights.map((h, i) => (
                <div key={i} style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
                  borderRadius: 16, padding: "20px 22px",
                  border: "1px solid rgba(59,130,246,0.15)",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{h.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 6 }}>{h.title}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            PLACES TO VISIT (Expanded)
        ═══════════════════════════════════════════════════════ */}
        <div style={card}>
          <SectionHeader
            icon="📍"
            title={`Places to Visit in ${place.name}`}
            subtitle={`${place.visits.length} must-see spots — click any card to read more`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {place.visits.map((v, i) => {
              const isExpanded = expandedVisit === i;
              return (
                <div key={i} onClick={() => setExpandedVisit(isExpanded ? null : i)} style={{
                  background: isExpanded ? "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))" : "#0f172a",
                  borderRadius: 16, padding: "20px 22px",
                  border: isExpanded ? "1px solid rgba(59,130,246,0.3)" : "1px solid #334155",
                  cursor: "pointer", transition: "all 0.25s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        {v.mustSee && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#f59e0b",
                            background: "rgba(245,158,11,0.12)", padding: "2px 8px",
                            borderRadius: 20, border: "1px solid rgba(245,158,11,0.25)",
                            textTransform: "uppercase", letterSpacing: 1,
                          }}>Must See</span>
                        )}
                        <span style={{
                          fontSize: 11, color: "#93c5fd", background: "rgba(59,130,246,0.12)",
                          padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(59,130,246,0.25)",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <FaClock size={9} /> {v.time}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 4 }}>
                        {v.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                        {v.highlight}
                      </div>
                    </div>
                    <div style={{
                      color: "#3b82f6", fontSize: 12, flexShrink: 0, marginLeft: 16,
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}>
                      <FaChevronRight />
                    </div>
                  </div>

                  {/* Expanded Description */}
                  {isExpanded && v.desc && (
                    <div style={{
                      marginTop: 16, paddingTop: 16, borderTop: "1px solid #334155",
                    }}>
                      <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                        {v.desc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SUGGESTED ITINERARY
        ═══════════════════════════════════════════════════════ */}
        {place.itinerary && (
          <div style={card}>
            <SectionHeader
              icon="🗓️"
              title="Suggested Itinerary"
              subtitle={`A ${place.itinerary.length}-day plan to make the most of your trip`}
            />
            <div style={{ position: "relative", paddingLeft: 28 }}>
              {/* Timeline line */}
              <div style={{
                position: "absolute", left: 11, top: 8, bottom: 8, width: 2,
                background: "linear-gradient(to bottom, #3b82f6, #8b5cf6)",
                borderRadius: 2,
              }} />

              {place.itinerary.map((day, i) => (
                <div key={i} style={{ position: "relative", marginBottom: i < place.itinerary.length - 1 ? 20 : 0 }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: "absolute", left: -23, top: 6, width: 18, height: 18,
                    borderRadius: "50%", background: "#0f172a",
                    border: "3px solid #3b82f6", display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 1,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#3b82f6" }}>{day.day}</span>
                  </div>

                  <div style={{
                    background: "#0f172a", borderRadius: 14, padding: "18px 20px",
                    border: "1px solid #334155",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#3b82f6",
                        background: "rgba(59,130,246,0.12)", padding: "3px 10px",
                        borderRadius: 20, border: "1px solid rgba(59,130,246,0.25)",
                      }}>Day {day.day}</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{day.title}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {day.activities.map((act, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <FaCheckCircle size={12} color="#22c55e" style={{ marginTop: 3, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LOCAL CUISINE + TRAVEL TIPS (two columns)
        ═══════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* Local Cuisine */}
          {place.localCuisine && (
            <div style={{ ...card, marginBottom: 0 }}>
              <SectionHeader icon="🍽️" title="Local Cuisine" subtitle="Must-try dishes and flavors" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {place.localCuisine.map((item, i) => (
                  <div key={i} style={{
                    background: "#0f172a", borderRadius: 14, padding: "14px 18px",
                    border: "1px solid #334155", display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white", marginBottom: 3 }}>{item.dish}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Travel Tips */}
          {place.travelTips && (
            <div style={{ ...card, marginBottom: 0 }}>
              <SectionHeader icon="💡" title="Travel Tips" subtitle="Insider advice from fellow travelers" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {place.travelTips.map((tip, i) => (
                  <div key={i} style={{
                    background: "#0f172a", borderRadius: 14, padding: "14px 18px",
                    border: "1px solid #334155", display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b" }}>{i + 1}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            WHAT TO PACK
        ═══════════════════════════════════════════════════════ */}
        {place.whatToPack && (
          <div style={card}>
            <SectionHeader icon="🎒" title="What to Pack" subtitle="Don't forget these essentials for your trip" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {place.whatToPack.map((item, i) => (
                <span key={i} style={{
                  fontSize: 13, padding: "8px 18px", borderRadius: 24,
                  background: "#0f172a", color: "#cbd5e1",
                  border: "1px solid #334155", display: "flex",
                  alignItems: "center", gap: 8, fontWeight: 500,
                }}>
                  <FaCheckCircle size={11} color="#22c55e" /> {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            GALLERY & MEDIA
        ═══════════════════════════════════════════════════════ */}
        <div style={card}>
          <SectionHeader icon="🖼️" title="Gallery & Media" subtitle={`${place.gallery.length} photos and videos from ${place.name}`} />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
          }}>
            {place.gallery.map((item, i) => (
              <div key={i} onClick={() => setLightboxIdx(i)} style={{
                position: "relative", borderRadius: 14, overflow: "hidden",
                cursor: "pointer", height: 160, border: "1px solid #334155",
                transition: "transform 0.2s, border-color 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = "#3b82f6"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "#334155"; }}
              >
                {item.type === "video" ? (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${item.src.split("/embed/")[1]}/hqdefault.jpg`}
                      alt={item.caption}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "rgba(59,130,246,0.85)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <FaPlay color="white" size={16} style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.src} alt={item.caption} style={{
                    width: "100%", height: "100%", objectFit: "cover", display: "block",
                  }} />
                )}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                  padding: "20px 12px 10px",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{item.caption}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TRAVELER REVIEWS
        ═══════════════════════════════════════════════════════ */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <SectionHeader icon="💬" title="Traveler Reviews" />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Stars rating={place.rating} size={14} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>{place.rating}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>({place.reviews.toLocaleString()})</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {place.reviewsData.map((rev, i) => (
              <div key={i} style={{
                background: "#0f172a", borderRadius: 16, padding: "18px 20px",
                border: "1px solid #334155",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 14, color: "white",
                    }}>
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{rev.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{rev.date}</div>
                    </div>
                  </div>
                  <Stars rating={rev.rating} size={11} />
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════════════════ */}
        <div style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
          borderRadius: 20, padding: "32px 36px", marginBottom: 28,
          border: "1px solid rgba(59,130,246,0.25)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0, marginBottom: 6 }}>
              Ready to explore {place.name}? ✈️
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              {place.tripDuration} trip starting from <span style={{ color: "#3b82f6", fontWeight: 700 }}>{place.price}</span> per person
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => goToTab("hotels")} style={{
              padding: "12px 24px", borderRadius: 12,
              border: "1px solid #334155", background: "rgba(15,23,42,0.5)",
              color: "#cbd5e1", fontWeight: 600, cursor: "pointer", fontSize: 14,
            }}>
              Find Hotels 🏨
            </button>
            <button onClick={() => goToTab("flights")} style={{
              padding: "12px 24px", borderRadius: 12, border: "none",
              background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
              color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
            }}>
              Book Flights ✈️
            </button>
          </div>
        </div>
      </div>

      {/* ── Lightbox ────────────────────────────────────────── */}
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
