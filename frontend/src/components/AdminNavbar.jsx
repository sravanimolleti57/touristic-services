import { useNavigate, useLocation } from "react-router-dom";
import { FaUserShield, FaChartBar, FaHotel, FaPlane, FaClipboardList, FaSignOutAlt } from "react-icons/fa";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = user.name || "System Admin";

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaChartBar /> },
    { label: "Hotels", path: "/admin/hotels", icon: <FaHotel /> },
    { label: "Flights", path: "/admin/flights", icon: <FaPlane /> },
    { label: "Bookings", path: "/admin/bookings", icon: <FaClipboardList /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(168, 85, 247, 0.2)",
      padding: "14px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    }}>
      {/* Admin Logo */}
      <div
        onClick={() => navigate("/admin/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#ffffff", fontSize: 18, boxShadow: "0 4px 12px rgba(168,85,247,0.3)"
        }}>
          <FaUserShield />
        </div>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 900,
            background: "linear-gradient(135deg, #c084fc, #38bdf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Tourism Admin
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px" }}>
            MANAGEMENT CONSOLE
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <ul style={{ display: "flex", alignItems: "center", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
        {NAV_ITEMS.map(({ label, path, icon }) => {
          const isActive = location.pathname === path;
          return (
            <li
              key={path}
              onClick={() => navigate(path)}
              style={{
                padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                color: isActive ? "#ffffff" : "#94a3b8",
                background: isActive ? "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(126,34,206,0.3) 100%)" : "transparent",
                border: isActive ? "1px solid rgba(168,85,247,0.4)" : "1px solid transparent",
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {icon} {label}
            </li>
          );
        })}
      </ul>

      {/* Right User & Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>{adminName}</div>
          <div style={{ fontSize: 11, color: "#a855f7" }}>Administrator</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px", borderRadius: 10,
            background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220, 38, 38, 0.3)",
            color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.12)"; }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}
