import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaPlane, FaHome, FaHotel,
  FaMapMarkerAlt, FaComments, FaEnvelope
} from "react-icons/fa";

/**
 * SharedNavbar — identical design to Home.jsx navbar.
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
    const savedHotels  = JSON.parse(localStorage.getItem(`bookedHotels_${userEmail}`))  || [];
    const savedFlights = JSON.parse(localStorage.getItem(`bookedFlights_${userEmail}`)) || [];
    setBookedHotelsCount(savedHotels.length);
    setBookedFlightsCount(savedFlights.length);
  }, [userEmail]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  const NAV_LINKS = [
    { label: "Home",         key: "home",         action: () => navigate("/home"),       icon: <FaHome size={11} /> },
    { label: "Destinations", key: "destinations",  action: () => goToTab("places"),      icon: <FaMapMarkerAlt size={11} /> },
    { label: "Hotels",       key: "hotels",        action: () => goToTab("hotels"),      icon: <FaHotel size={11} /> },
    { label: "Flights",      key: "flights",       action: () => goToTab("flights"),     icon: <FaPlane size={11} /> },
    { label: "Reviews",      key: "reviews",       action: () => navigate("/dashboard"), icon: <FaComments size={11} /> },
    { label: "Contact",      key: "contact",       action: () => {
      const el = document.getElementById("contact-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else navigate("/home");
    }, icon: <FaEnvelope size={11} /> },
  ];

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "10px 40px" : "16px 40px",
        background: scrolled ? "rgba(5,11,24,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(148,163,184,0.08)" : "none",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.4)" : "none",
        transition: "all 0.35s ease",
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate("/home")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
          }}>✈️</div>
          <div style={{
            fontSize: 18, fontWeight: 900,
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)",
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
                  padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                  fontSize: 14, fontWeight: 600,
                  color: isActive ? "#fff" : "#94a3b8",
                  background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}}
              >
                {label}
              </li>
            );
          })}
        </ul>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Bell */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "rgba(30,41,59,0.7)", border: "1px solid rgba(148,163,184,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#94a3b8", position: "relative", fontSize: 16,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; e.currentTarget.style.color = "#60a5fa"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(30,41,59,0.7)"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <FaBell />
            <span style={{
              position: "absolute", top: 8, right: 8, width: 8, height: 8,
              borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444",
            }} />
          </div>

          {/* Avatar / profile */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfile(p => !p)}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 17, fontWeight: 800, color: "white",
                boxShadow: "0 4px 16px rgba(59,130,246,0.3)", transition: "box-shadow 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.5)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.3)"}
            >
              {(userEmail || "T")[0].toUpperCase()}
            </div>

            {showProfile && (
              <div style={{
                position: "absolute", top: 54, right: 0,
                background: "rgba(15,23,42,0.97)", backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)", padding: 20, borderRadius: 20,
                width: 260, boxShadow: "0 24px 70px rgba(0,0,0,0.7)",
                border: "1px solid rgba(148,163,184,0.12)",
                animation: "sr-fadeInUp 0.25s ease", zIndex: 200,
              }}>
                {/* User info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800,
                  }}>
                    {(userEmail || "T")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>
                      {user.name || userEmail?.split("@")[0] || "Traveler"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{userEmail}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  background: "rgba(30,41,59,0.8)", borderRadius: 12,
                  padding: "12px 14px", marginBottom: 12,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>🏨 Hotels Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedHotelsCount}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>✈️ Flights Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedFlightsCount}</span>
                  </div>
                </div>

                {/* Sign out */}
                <button
                  onClick={() => { localStorage.removeItem("user"); navigate("/"); }}
                  style={{
                    width: "100%", padding: 10, borderRadius: 10, border: "none",
                    background: "rgba(239,68,68,0.12)", color: "#ef4444",
                    cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                  }}
                >Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Click outside to close profile */}
      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{ position: "fixed", inset: 0, zIndex: 999 }}
        />
      )}

      {/* Responsive nav-links hide on mobile */}
      <style>{`
        @media (max-width:900px) {
          .sr-nav-links { display:none !important; }
        }
      `}</style>
    </>
  );
}
