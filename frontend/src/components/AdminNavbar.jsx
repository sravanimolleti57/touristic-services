import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  FaUserShield, FaChartBar, FaHotel,
  FaClipboardList, FaSignOutAlt, FaUsers, FaCompass, FaBars, FaTimes,
  FaSuitcaseRolling
} from "react-icons/fa";
import { useState } from "react";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const localUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = localUser?.name || "System Admin";

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaChartBar /> },
    { label: "Destinations", path: "/admin/destinations", icon: <FaCompass /> },
    { label: "Hotels", path: "/admin/hotels", icon: <FaHotel /> },
    { label: "Activities", path: "/admin/activities", icon: <FaSuitcaseRolling /> },
    { label: "Bookings", path: "/admin/bookings", icon: <FaClipboardList /> },
    { label: "Users", path: "/admin/users", icon: <FaUsers /> },
  ];

  const handleLogout = () => {
    const ok = window.confirm("Are you sure you want to log out of the Admin Console?");
    if (!ok) return;
    logout();
    navigate("/admin/login");
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 6px 16px rgba(0,0,0,0.02)",
      padding: "12px 36px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      {/* Admin Logo */}
      <div
        onClick={() => navigate("/admin/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#FFFFFF", fontSize: 18, boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
        }}>
          <FaUserShield />
        </div>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 900, color: "#0F172A",
            display: "flex", alignItems: "center", gap: 6
          }}>
            TravelAI <span style={{ color: "#2563EB", fontWeight: 800 }}>Admin</span>
          </div>
          <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, letterSpacing: "0.5px" }}>
            MANAGEMENT CONTROL HUB
          </div>
        </div>
      </div>

      {/* Nav Links - Desktop */}
      <ul style={{
        display: "flex", alignItems: "center", gap: 6, listStyle: "none", margin: 0, padding: 0
      }} className="admin-nav-desktop">
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path || (path === "/admin/dashboard" && location.pathname === "/admin");
          return (
            <li
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                color: isActive ? "#2563EB" : "#64748B",
                background: isActive ? "#EFF6FF" : "transparent",
                border: isActive ? "1px solid #BFDBFE" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: 7,
                transition: "all 0.15s ease"
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "#0F172A";
                  e.currentTarget.style.background = "#F8FAFC";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "#64748B";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: 14, color: isActive ? "#2563EB" : "#94A3B8" }}>{icon}</span>
              {label}
            </li>
          );
        })}
      </ul>

      {/* Right Profile & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{adminName}</div>
          <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>Super Admin</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px", borderRadius: 10,
            background: "#FEF2F2", border: "1px solid #FCA5A5",
            color: "#DC2626", fontSize: 12, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}
