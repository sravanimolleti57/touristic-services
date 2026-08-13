import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaPlane, FaHome, FaHotel,
  FaMapMarkerAlt, FaComments, FaEnvelope,
  FaSuitcase, FaRobot, FaBars, FaTimes
} from "react-icons/fa";

/**
 * SharedNavbar — Light Theme
 * Props:
 *   activeTab: "home" | "destinations" | "hotels" | "flights" | "reviews" | "contact"
 */
export default function SharedNavbar({ activeTab = "" }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || { name: "Traveler", email: "user@example.com" };
  const userEmail = user.email || "user@example.com";

  const [bookedHotelsCount, setBookedHotelsCount] = useState(0);
  const [bookedFlightsCount, setBookedFlightsCount] = useState(0);

  useEffect(() => {
    fetchBookingCounts();
  }, [userEmail]);

  const fetchBookingCounts = async () => {
    try {
      const hotelResponse = await axios.get(`http://127.0.0.1:5000/my-hotels/${userEmail}`);
      const flightResponse = await axios.get(`http://127.0.0.1:5000/my-flights/${userEmail}`);
      setBookedHotelsCount(hotelResponse.data.length);
      setBookedFlightsCount(flightResponse.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: "Home", key: "home", action: () => navigate("/home"), icon: <FaHome size={11} /> },
    { label: "Destinations", key: "destinations", action: () => goToTab("places"), icon: <FaMapMarkerAlt size={11} /> },
    { label: "Hotels", key: "hotels", action: () => goToTab("hotels"), icon: <FaHotel size={11} /> },
    { label: "Transport & Travel", key: "flights", action: () => goToTab("flights"), icon: <FaPlane size={11} /> },
    { label: "Reviews", key: "reviews", action: () => navigate("/reviews"), icon: <FaComments size={11} /> },
    { label: "Contact", key: "contact", action: () => navigate("/contact"), icon: <FaEnvelope size={11} /> },
    { label: "My Bookings", key: "my-bookings", action: () => navigate("/my-bookings"), icon: <FaSuitcase size={11} /> },
  ];

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "10px 40px" : "16px 40px",
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #E5E7EB" : "1px solid rgba(229,231,235,0.6)",
        boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.35s ease",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate("/home")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#2563EB,#3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
          }}>✈️</div>
          <div style={{
            fontSize: 18, fontWeight: 900,
            background: "linear-gradient(135deg,#2563EB,#0EA5E9,#6366F1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>TravelAI</div>
        </div>

        {/* Nav links */}
        <ul style={{ display: "flex", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}
          className="sr-nav-links">
          {NAV_LINKS.map(({ label, key, action }) => {
            const isActive = activeTab === key;
            return (
              <li
                key={key}
                onClick={action}
                style={{
                  padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  color: isActive ? "#2563EB" : "#6B7280",
                  background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#2563EB";
                    e.currentTarget.style.background = "rgba(37,99,235,0.06)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#6B7280";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Quick My Bookings Link next to Profile Icon */}
          <div
            onClick={() => navigate("/my-bookings")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 12, cursor: "pointer",
              background: activeTab === "my-bookings" ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.06)",
              border: activeTab === "my-bookings" ? "1px solid #2563EB" : "1px solid rgba(37,99,235,0.2)",
              color: "#2563EB", fontWeight: 700, fontSize: 13, transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
            onMouseLeave={e => { if (activeTab !== "my-bookings") e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
          >
            <FaSuitcase size={12} />
            <span>My Bookings</span>
            {(bookedHotelsCount + bookedFlightsCount) > 0 && (
              <span style={{
                background: "#2563EB", color: "#FFFFFF", fontSize: 10, fontWeight: 800,
                padding: "2px 7px", borderRadius: 10, marginLeft: 2
              }}>
                {bookedHotelsCount + bookedFlightsCount}
              </span>
            )}
          </div>

          {/* Bell */}
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280", position: "relative", fontSize: 15,
            transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <FaBell />
            <span style={{
              position: "absolute", top: 8, right: 8, width: 7, height: 7,
              borderRadius: "50%", background: "#DC2626",
            }} />
          </div>

          {/* Avatar / profile */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfile(p => !p)}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, fontWeight: 800, color: "white",
                boxShadow: "0 2px 10px rgba(37,99,235,0.25)", transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(37,99,235,0.40)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(37,99,235,0.25)"}
            >
              {(userEmail || "T")[0].toUpperCase()}
            </div>

            {showProfile && (
              <div style={{
                position: "absolute", top: 52, right: 0,
                background: "#FFFFFF",
                padding: 20, borderRadius: 20,
                width: 260, boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                border: "1px solid #E5E7EB",
                animation: "sr-fadeInUp 0.25s ease", zIndex: 200,
              }}>
                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 800, color: "white",
                  }}>
                    {(userEmail || "T")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                      {user.name || userEmail?.split("@")[0] || "Traveler"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{userEmail}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  background: "#F9FAFB", borderRadius: 12,
                  padding: "12px 14px", marginBottom: 12,
                  border: "1px solid #F3F4F6",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>🏨 Hotels Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{bookedHotelsCount}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>✈️ Flights Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{bookedFlightsCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setShowProfile(false); navigate("/my-bookings"); }}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF", marginBottom: 8,
                    cursor: "pointer", fontWeight: 800, fontSize: 13, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                  }}
                >
                  <FaSuitcase /> My Bookings &amp; Tickets
                </button>

                {/* Sign out */}
                <button
                  onClick={() => { localStorage.removeItem("user"); localStorage.removeItem("role"); navigate("/"); }}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.15)",
                    background: "rgba(220,38,38,0.05)", color: "#DC2626",
                    cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.10)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.05)"; }}
                >Sign Out</button>
              </div>
            )}
          </div>
          {/* Mobile hamburger menu toggle */}
          <div
            className="sr-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(m => !m)}
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#FFFFFF", border: "1px solid #E5E7EB",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", fontSize: 16,
              transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", top: 70, left: 0, right: 0,
          background: "#FFFFFF", borderBottom: "1px solid #E5E7EB",
          padding: "16px 24px", zIndex: 999, boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
          animation: "sr-fadeInUp 0.2s ease",
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {NAV_LINKS.map(({ label, key, action }) => {
              const isActive = activeTab === key;
              return (
                <li
                  key={key}
                  onClick={() => { action(); setMobileMenuOpen(false); }}
                  style={{
                    padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                    fontSize: 14, fontWeight: 700,
                    color: isActive ? "#2563EB" : "#374151",
                    background: isActive ? "rgba(37,99,235,0.08)" : "#F9FAFB",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Click outside to close profile */}
      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{ position: "fixed", inset: 0, zIndex: 999 }}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        .sr-mobile-menu-btn { display: none !important; }
        @media (max-width:900px) {
          .sr-nav-links { display:none !important; }
          .sr-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
