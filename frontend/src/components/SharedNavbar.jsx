import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
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
export default function SharedNavbar({ activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [imgError, setImgError] = useState(false);

  const pathname = location.pathname;

  // Determine effective active tab:
  // - If user is on /help or activeTab is "help", NONE of the 5 main links are highlighted.
  // - Otherwise, if activeTab is explicitly provided, use it.
  // - If not provided, match exact pathname (/home, /contact, /reviews, etc.).
  let effectiveTab = "";
  if (pathname === "/help" || activeTab === "help") {
    effectiveTab = "";
  } else if (activeTab !== undefined && activeTab !== null && activeTab !== "") {
    effectiveTab = activeTab;
  } else {
    if (pathname === "/home" || pathname === "/") effectiveTab = "home";
    else if (pathname === "/contact") effectiveTab = "contact";
    else if (pathname === "/reviews") effectiveTab = "reviews";
    else if (pathname === "/destinations") effectiveTab = "destinations";
    else if (pathname === "/hotels") effectiveTab = "hotels";
  }

  const userEmail = user?.email || "";
  const currentAvatar = user?.avatar || user?.profileImage || "";

  useEffect(() => {
    setImgError(false);
  }, [currentAvatar]);

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
    { label: "Reviews", key: "reviews", action: () => navigate("/reviews"), icon: <FaComments size={11} /> },
    { label: "Contact", key: "contact", action: () => navigate("/contact"), icon: <FaEnvelope size={11} /> },
  ];

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: scrolled ? "8px 32px" : "12px 32px",
        background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #E5E7EB" : "1px solid rgba(229,231,235,0.6)",
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.05)" : "none",
        transition: "all 0.3s ease",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate("/home")}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#2563EB,#3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 3px 10px rgba(37,99,235,0.22)",
          }}>✈️</div>
          <div style={{
            fontSize: 17, fontWeight: 900,
            background: "linear-gradient(135deg,#2563EB,#0EA5E9,#6366F1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>TravelAI</div>
        </div>

        {/* Nav links */}
        <ul style={{ display: "flex", alignItems: "center", gap: 4, listStyle: "none", margin: 0, padding: 0 }}
          className="sr-nav-links">
          {NAV_LINKS.map(({ label, key, action }) => {
            const isActive = effectiveTab === key;
            return (
              <li
                key={key}
                onClick={action}
                style={{
                  padding: "6px 12px", borderRadius: 8, cursor: "pointer",
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Bell */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280", position: "relative", fontSize: 14,
            transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <FaBell />
            <span style={{
              position: "absolute", top: 7, right: 7, width: 6, height: 6,
              borderRadius: "50%", background: "#DC2626",
            }} />
          </div>

          {/* Avatar / profile */}
          {/* ── User Profile Dropdown ── */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setShowProfile(p => !p)}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 14, fontWeight: 800, color: "white",
                boxShadow: "0 2px 8px rgba(37,99,235,0.22)", transition: "all 0.2s",
                overflow: "hidden", border: "2px solid #FFFFFF"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 14px rgba(37,99,235,0.35)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.22)"}
            >
              {currentAvatar && !imgError ? (
                <img
                  src={currentAvatar}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              ) : (
                ((user?.name || userEmail || "T")[0].toUpperCase())
              )}
            </div>

            {showProfile && (
              <div style={{
                position: "absolute", top: 52, right: 0,
                background: "#FFFFFF",
                padding: "20px 18px", borderRadius: 20,
                width: 280, boxShadow: "0 14px 45px rgba(0,0,0,0.14)",
                border: "1px solid #E5E7EB",
                animation: "sr-fadeInUp 0.25s ease", zIndex: 200,
                fontFamily: "'Inter', system-ui, sans-serif"
              }}>
                {/* User Info Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 800, color: "white", overflow: "hidden", flexShrink: 0
                  }}>
                    {currentAvatar && !imgError ? (
                      <img
                        src={currentAvatar}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      ((user?.name || userEmail || "T")[0].toUpperCase())
                    )}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.name || userEmail?.split("@")[0] || "Traveler"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</div>
                  </div>
                </div>

                {/* Dropdown Menu Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/profile"); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", color: "#1E293B", textAlign: "left",
                      cursor: "pointer", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>👤</span> Profile
                  </button>

                  <button
                    onClick={() => { setShowProfile(false); navigate("/my-bookings"); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", color: "#1E293B", textAlign: "left",
                      cursor: "pointer", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>🎫</span> My Bookings
                  </button>

                  <button
                    onClick={() => { setShowProfile(false); navigate("/settings"); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", color: "#1E293B", textAlign: "left",
                      cursor: "pointer", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>⚙️</span> Settings
                  </button>

                  <button
                    onClick={() => { setShowProfile(false); navigate("/tickets"); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", color: "#1E293B", textAlign: "left",
                      cursor: "pointer", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>🎟️</span> My Tickets
                  </button>

                  <button
                    onClick={() => { setShowProfile(false); navigate("/help"); }}
                    style={{
                      width: "100%", padding: "9px 12px", borderRadius: 10, border: "none",
                      background: "transparent", color: "#1E293B", textAlign: "left",
                      cursor: "pointer", fontWeight: 700, fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 15 }}>❓</span> Help &amp; AI Support
                  </button>
                </div>

                <div style={{ height: 1, background: "#F1F5F9", margin: "10px 0 8px" }} />

                {/* Sign out */}
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.2)",
                    background: "#FEF2F2", color: "#DC2626",
                    cursor: "pointer", fontWeight: 800, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                >
                  <span>🚪</span> Sign Out
                </button>
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
              const isActive = effectiveTab === key;
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
