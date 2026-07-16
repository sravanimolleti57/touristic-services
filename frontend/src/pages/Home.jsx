import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaHome, FaHotel, FaPlane, FaUserCircle, FaComments,
  FaMapMarkerAlt, FaFire, FaChevronRight
} from "react-icons/fa";
import CalendarWidget from "../components/CalendarWidget";

const QUICK_LINKS = [
  { label: "Touristic Places", icon: "🗺️", tab: "places", desc: "Explore top destinations" },
  { label: "Hotels", icon: "🏨", tab: "hotels", desc: "Find your perfect stay" },
  { label: "Flights", icon: "✈️", tab: "flights", desc: "Book cheap flights" },
];

const TRENDING = [
  { name: "Bali", country: "Indonesia", emoji: "🌴", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80" },
  { name: "Maldives", country: "Indian Ocean", emoji: "🏝️", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80" },
  { name: "Paris", country: "France", emoji: "🗼", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80" },
  { name: "Rajasthan", country: "India", emoji: "🏰", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&q=80" },
];

const TOP_RATED = [
  { name: "Oberoi Udaivilas", type: "Hotel", location: "Udaipur", rating: 4.9, sentiment: "99%" },
  { name: "Maldives Getaway", type: "Place", location: "Maldives", rating: 4.9, sentiment: "99%" },
  { name: "The Leela Palace", type: "Hotel", location: "New Delhi", rating: 4.9, sentiment: "98%" },
];

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Traveler", email: "user@example.com" };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=places`);
  };

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#1e293b", padding: "28px 16px", flexShrink: 0, borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <h2 style={{ marginBottom: 32, fontSize: 17, fontWeight: 800, background: "linear-gradient(to right, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Travel Dashboard 🌍
        </h2>
        {[
          { icon: <FaHome />, label: "Home", active: true, action: () => {} },
          { icon: <FaComments />, label: "Reviews", action: () => navigate("/dashboard") },
          { icon: <FaMapMarkerAlt />, label: "Places", action: () => goToTab("places") },
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

        {/* Top Rated Sidebar Widget */}
        <div style={{ marginTop: "auto", background: "#0f172a", borderRadius: 12, padding: "14px 12px" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>⭐ Top Rated</div>
          {TOP_RATED.map((r) => (
            <div key={r.name} onClick={() => goToTab(r.type === "Hotel" ? "hotels" : "places")} style={{ marginBottom: 10, cursor: "pointer" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{r.name}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{r.location} · {r.type}</div>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>😊 {r.sentiment} Positive</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", alignItems: "center", background: "#1e293b", padding: "13px 18px", borderRadius: 14, maxWidth: 580, border: "1px solid #334155", gap: 10 }}>
            <FaSearch style={{ color: "#3b82f6", flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search places, hotels, flights..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 15 }}
            />
            <button type="submit" style={{ background: "linear-gradient(to right,#3b82f6,#8b5cf6)", border: "none", color: "white", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              Search
            </button>
          </form>

          <div style={{ position: "relative", marginLeft: 20 }}>
            <FaUserCircle size={44} style={{ cursor: "pointer", color: "#3b82f6" }} onClick={() => setShowProfile(!showProfile)} />
            {showProfile && (
              <div style={{ position: "absolute", top: 54, right: 0, background: "#1e293b", padding: 20, borderRadius: 16, width: 230, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 100, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "white" }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{user.email}</div>
                <hr style={{ border: "1px solid #334155", margin: "12px 0" }} />
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Trips: 0</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Bookings: 0</div>
                <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{ width: "100%", marginTop: 14, padding: 10, borderRadius: 8, border: "none", background: "#ef444420", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.22fr) minmax(300px, 0.78fr)", gap: 24, alignItems: "start", marginBottom: 40 }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))",
              border: "1px solid rgba(148,163,184,0.16)",
              borderRadius: 28,
              padding: 32,
              boxShadow: "0 24px 70px rgba(2,6,23,0.28)",
            }}
          >
            <div style={{ fontSize: 13, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>AI-Powered Tourism Platform</div>
            <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, lineHeight: 1.15 }}>
              Explore The World ✈️
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 15, maxWidth: 520, lineHeight: 1.7 }}>
              Discover destinations using customer satisfaction scores, AI emotion analysis of real traveler reviews, and a smooth planning experience that keeps your next trip just a click away.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, margin: "26px 0" }}>
              {[
                { value: "120+", label: "Destinations" },
                { value: "800+", label: "Hotels" },
                { value: "50K+", label: "Reviews" },
              ].map((item) => (
                <div key={item.label} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#93c5fd" }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => goToTab("places")} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(to right,#3b82f6,#8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                Start Exploring →
              </button>
              <button onClick={() => goToTab("hotels")} style={{ padding: "12px 24px", borderRadius: 12, border: "1px solid #334155", background: "rgba(15,23,42,0.5)", color: "#cbd5e1", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Browse Hotels
              </button>
            </div>
          </div>

          <div style={{ position: "sticky", top: 24, alignSelf: "start" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Trip planner</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>Choose your travel date</h2>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                Keep this calendar on the right side for a cleaner dashboard-style layout.
              </p>
            </div>
            <CalendarWidget compact onDateSelect={() => {}} />
          </div>
        </div>

        {/* Quick Access Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {QUICK_LINKS.map(({ label, icon, tab, desc }) => (
            <div key={tab} onClick={() => goToTab(tab)}
              style={{ background: "#1e293b", borderRadius: 16, padding: "20px 22px", cursor: "pointer", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
            >
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{desc}</div>
              </div>
              <FaChevronRight color="#3b82f6" />
            </div>
          ))}
        </div>

        {/* Trending Destinations */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaFire color="#f59e0b" />
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Trending Destinations</h2>
            </div>
            <span onClick={() => goToTab("places")} style={{ fontSize: 13, color: "#3b82f6", cursor: "pointer" }}>View all →</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {TRENDING.map(({ name, country, emoji, img }) => (
              <div key={name} onClick={() => navigate(`/search?q=${name}&tab=places`)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", cursor: "pointer", height: 180 }}>
                <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"; }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 12, left: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{emoji} {name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Destinations", value: "120+", icon: "🗺️", sub: "Worldwide" },
            { label: "Hotels Listed", value: "800+", icon: "🏨", sub: "Verified properties" },
            { label: "Reviews Analysed", value: "50K+", icon: "🧠", sub: "By AI sentiment engine" },
          ].map(({ label, value, icon, sub }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 14, padding: "20px 22px", border: "1px solid #334155" }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#3b82f6" }}>{value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
