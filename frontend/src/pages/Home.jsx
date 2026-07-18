import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaHome, FaHotel, FaPlane, FaComments,
  FaMapMarkerAlt, FaFire, FaChevronRight, FaBrain,
  FaRocket, FaGlobe
} from "react-icons/fa";
import CalendarWidget from "../components/CalendarWidget";

const QUICK_LINKS = [
  { label: "Touristic Places", icon: "🗺️", tab: "places", desc: "Explore top destinations", color: "#3b82f6", glow: "rgba(59,130,246,0.25)" },
  { label: "Hotels", icon: "🏨", tab: "hotels", desc: "Find your perfect stay", color: "#8b5cf6", glow: "rgba(139,92,246,0.25)" },
  { label: "Flights", icon: "✈️", tab: "flights", desc: "Book cheap flights", color: "#06b6d4", glow: "rgba(6,182,212,0.25)" },
];

const TRENDING = [
  { name: "Bali", country: "Indonesia", emoji: "🌴", tag: "Tropical Paradise", sentiment: "98%", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80" },
  { name: "Maldives", country: "Indian Ocean", emoji: "🏝️", tag: "Luxury Escape", sentiment: "99%", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80" },
  { name: "Paris", country: "France", emoji: "🗼", tag: "City of Light", sentiment: "97%", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { name: "Rajasthan", country: "India", emoji: "🏰", tag: "Royal Heritage", sentiment: "96%", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80" },
];

const TOP_RATED = [
  { name: "Oberoi Udaivilas", type: "Hotel", location: "Udaipur", rating: 4.9, sentiment: "99%" },
  { name: "Maldives Getaway", type: "Place", location: "Maldives", rating: 4.9, sentiment: "99%" },
  { name: "The Leela Palace", type: "Hotel", location: "New Delhi", rating: 4.9, sentiment: "98%" },
];

const AI_INSIGHTS = [
  "🧠 AI detected 94% positive sentiment for Bali this month",
  "📈 Maldives bookings up 32% — book early for best rates",
  "✨ Paris rated top romantic destination by 12,400 travellers",
  "🔥 Rajasthan hotels fully booked for peak season — act fast",
  "🤖 Sentiment engine analysed 50,000+ verified reviews today",
];

function AIInsightTicker() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % AI_INSIGHTS.length);
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 12, padding: "10px 18px",
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: 20, overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <FaBrain size={13} color="#3b82f6" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1 }}>AI Live</span>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
      </div>
      <div style={{ width: 1, height: 18, background: "rgba(148,163,184,0.2)", flexShrink: 0 }} />
      <div style={{
        fontSize: 13, color: "#cbd5e1", fontWeight: 500,
        opacity: fade ? 1 : 0, transition: "opacity 0.4s ease",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {AI_INSIGHTS[index]}
      </div>
    </div>
  );
}

function TrendingCard({ name, country, emoji, tag, sentiment, img, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 18, overflow: "hidden",
        cursor: "pointer", height: 200,
        transform: hovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s",
        boxShadow: hovered ? "0 24px 60px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
        transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.5s ease" }}
        onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"; }} />
      <div style={{ position: "absolute", inset: 0, background: hovered
        ? "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
        : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)" ,
        transition: "background 0.35s" }} />
      {hovered && (
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(34,197,94,0.9)", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "white" }}>
          😊 {sentiment}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px 14px" }}>
        <div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(6px)", transition: "all 0.3s" }}>{tag}</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{emoji} {name}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{country}</div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTravelDate, setSelectedTravelDate] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=places`);
  };

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  return (
    <div style={{ display: "flex", background: "#080f1e", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Ambient background blobs */}
      <div style={{ position: "fixed", top: -200, left: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "40%", right: "25%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: "1px solid rgba(148,163,184,0.08)",
        display: "flex", flexDirection: "column", position: "relative", zIndex: 1,
        background: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(8,15,30,0.98) 100%)",
        backdropFilter: "blur(20px)", padding: "28px 14px",
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>AI Platform</div>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Travel Dashboard 🌍
          </h2>
        </div>

        {[
          { icon: <FaHome />, label: "Home", active: true, action: () => {} },
          { icon: <FaComments />, label: "Reviews", action: () => navigate("/dashboard") },
          { icon: <FaMapMarkerAlt />, label: "Places", action: () => goToTab("places") },
          { icon: <FaHotel />, label: "Hotels", action: () => goToTab("hotels") },
          { icon: <FaPlane />, label: "Flights", action: () => goToTab("flights") },
        ].map(({ icon, label, active, action }) => (
          <div key={label} onClick={action} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 14px", borderRadius: 12, cursor: "pointer",
            fontSize: 13, fontWeight: 600, marginBottom: 3,
            background: active ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.12))" : "transparent",
            color: active ? "#93c5fd" : "#64748b",
            border: active ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(148,163,184,0.06)"; e.currentTarget.style.color = "#94a3b8"; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
          >
            {icon} {label}
          </div>
        ))}

        {/* AI Badge */}
        <div style={{ marginTop: 16, background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <FaBrain size={12} color="#3b82f6" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1 }}>AI Engine</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          </div>
          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>Sentiment analysis powered by deep learning. 50K+ reviews processed.</div>
        </div>

        {/* Top Rated Sidebar Widget */}
        <div style={{ marginTop: "auto", borderRadius: 12, padding: "14px 12px", background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.06)" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>⭐ Top Rated</div>
          {TOP_RATED.map((r) => (
            <div key={r.name} onClick={() => goToTab(r.type === "Hotel" ? "hotels" : "places")} style={{ marginBottom: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(148,163,184,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{r.name}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{r.location} · {r.type}</div>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>😊 {r.sentiment} Positive</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "24px 36px 40px", overflowY: "auto", position: "relative", zIndex: 1 }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <form onSubmit={handleSearch} style={{
            flex: 1, display: "flex", alignItems: "center",
            background: searchFocused ? "rgba(30,41,59,0.95)" : "rgba(30,41,59,0.7)",
            padding: "12px 18px", borderRadius: 14, maxWidth: 580,
            border: searchFocused ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(148,163,184,0.12)",
            gap: 10, boxShadow: searchFocused ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
            transition: "all 0.25s", backdropFilter: "blur(10px)",
          }}>
            <FaSearch style={{ color: "#3b82f6", flexShrink: 0, fontSize: 14 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search destinations, hotels, flights..."
              autoComplete="off"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14 }}
            />
            <button type="submit" style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none",
              color: "white", padding: "7px 18px", borderRadius: 8,
              cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>Search</button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 16 }}>
            {/* Greeting chip */}
            <div style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#94a3b8", backdropFilter: "blur(10px)" }}>
              👋 {user.email ? user.email.split("@")[0] : "Traveler"}
            </div>

            <div style={{ position: "relative" }}>
              <div onClick={() => setShowProfile(!showProfile)} style={{
                width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                fontSize: 18, fontWeight: 800, color: "white",
              }}>
                {(user.email || "T")[0].toUpperCase()}
              </div>
              {showProfile && (
                <div style={{
                  position: "absolute", top: 56, right: 0,
                  background: "rgba(15,23,42,0.97)", backdropFilter: "blur(20px)",
                  padding: 20, borderRadius: 18, width: 250,
                  boxShadow: "0 24px 70px rgba(0,0,0,0.7)", zIndex: 200,
                  border: "1px solid rgba(148,163,184,0.12)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                      {(user.email || "T")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{user.name || user.email?.split("@")[0] || "Traveler"}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(30,41,59,0.8)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>🏨 Hotels Booked</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedHotelsCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>✈️ Flights Booked</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedFlightsCount}</span>
                    </div>
                  </div>
                  <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{
                    width: "100%", padding: "10px", borderRadius: 10, border: "none",
                    background: "rgba(239,68,68,0.12)", color: "#ef4444",
                    cursor: "pointer", fontWeight: 700, fontSize: 13,
                  }}>Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Ticker */}
        <AIInsightTicker />

        {/* Hero Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, alignItems: "start", marginBottom: 24 }}>
          {/* Left Hero */}
          <div style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(8,15,30,0.95) 100%)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 28, padding: "36px 36px 32px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative corner glow */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: 20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, padding: "5px 14px", marginBottom: 16 }}>
              <FaBrain size={11} color="#3b82f6" />
              <span style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>AI-Powered Tourism Platform</span>
            </div>

            <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 14, lineHeight: 1.12, margin: "0 0 14px" }}>
              Explore The{" "}
              <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                World ✈️
              </span>
            </h1>

            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 480 }}>
              Discover destinations using <span style={{ color: "#93c5fd" }}>AI emotion analysis</span>, real traveler sentiment scores, and intelligent recommendations tailored just for you.
            </p>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
              {[
                { value: "120+", label: "Destinations", icon: <FaGlobe size={14} color="#3b82f6" /> },
                { value: "800+", label: "Hotels", icon: <FaHotel size={14} color="#8b5cf6" /> },
                { value: "50K+", label: "Reviews", icon: <FaBrain size={14} color="#06b6d4" /> },
              ].map(item => (
                <div key={item.label} style={{
                  background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.1)",
                  borderRadius: 16, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => goToTab("places")} style={{
                padding: "13px 28px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
                boxShadow: "0 8px 24px rgba(59,130,246,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 32px rgba(59,130,246,0.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.35)"; }}
              >
                <FaRocket size={13} style={{ marginRight: 6 }} />
                Start Exploring →
              </button>
              <button onClick={() => goToTab("hotels")} style={{
                padding: "13px 24px", borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.15)",
                background: "rgba(15,23,42,0.5)", color: "#cbd5e1",
                fontWeight: 600, cursor: "pointer", fontSize: 14,
                backdropFilter: "blur(8px)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)"; e.currentTarget.style.color = "#cbd5e1"; }}
              >
                Browse Hotels
              </button>
            </div>
          </div>

          {/* Right — Calendar */}
          <div style={{ position: "sticky", top: 24, alignSelf: "start", maxWidth: 360, width: "100%" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>🗓 Trip Planner</div>
              <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "white" }}>Plan Your Travel Date</h2>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                Pick a date to search flights and hotels.
              </p>
            </div>
            <CalendarWidget compact onDateSelect={(date) => setSelectedTravelDate(date)} />

            {selectedTravelDate && (
              <div style={{
                marginTop: 12,
                background: "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(8,15,30,0.99))",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 16, padding: 16,
                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
              }}>
                <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Selected Date</div>
                <div style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px", color: "white" }}>
                  📅 {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(selectedTravelDate)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => navigate(`/search?tab=flights&date=${selectedTravelDate.toISOString().split("T")[0]}`)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    ✈️ Flights
                  </button>
                  <button onClick={() => navigate(`/search?tab=hotels&checkIn=${selectedTravelDate.toISOString().split("T")[0]}`)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.15)", background: "rgba(15,23,42,0.6)", color: "#cbd5e1", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    🏨 Hotels
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {QUICK_LINKS.map(({ label, icon, tab, desc, color, glow }) => (
            <div key={tab} onClick={() => goToTab(tab)}
              style={{
                background: "rgba(15,23,42,0.7)", backdropFilter: "blur(12px)",
                borderRadius: 18, padding: "22px 22px 18px",
                cursor: "pointer", border: `1px solid rgba(148,163,184,0.1)`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 20px 50px ${glow}`;
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.background = "rgba(20,30,55,0.85)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
                e.currentTarget.style.background = "rgba(15,23,42,0.7)";
              }}
            >
              <div>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{desc}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FaChevronRight size={12} color={color} />
              </div>
            </div>
          ))}
        </div>

        {/* Trending Destinations */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaFire size={13} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Trending Destinations</h2>
              <span style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1 }}>Hot</span>
            </div>
            <span onClick={() => goToTab("places")} style={{ fontSize: 12, color: "#3b82f6", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              View all <FaChevronRight size={10} />
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {TRENDING.map(({ name, country, emoji, tag, sentiment, img }) => (
              <TrendingCard
                key={name}
                name={name} country={country} emoji={emoji} tag={tag} sentiment={sentiment} img={img}
                onClick={() => navigate(`/search?q=${name}&tab=places`)}
              />
            ))}
          </div>
        </div>

        {/* Bottom AI Stats Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(8,15,30,0.95))",
          border: "1px solid rgba(59,130,246,0.12)", borderRadius: 22, padding: "26px 32px",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
          {[
            { label: "Destinations", value: "120+", icon: "🗺️", sub: "Worldwide", color: "#3b82f6", borderRight: true },
            { label: "Hotels Listed", value: "800+", icon: "🏨", sub: "Verified properties", color: "#8b5cf6", borderRight: true },
            { label: "Reviews Analysed", value: "50K+", icon: "🧠", sub: "By AI sentiment engine", color: "#06b6d4", borderRight: false },
          ].map(({ label, value, icon, sub, color, borderRight }) => (
            <div key={label} style={{ padding: "0 28px", borderRight: borderRight ? "1px solid rgba(148,163,184,0.08)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color, marginBottom: 2 }}>{value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{sub}</div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

export default Home;
