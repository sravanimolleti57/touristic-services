import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaHotel, FaPlane, FaStar, FaUser, FaEnvelope } from "react-icons/fa";

export default function Sidebar({ activeItem = "home" }) {
  const menuItems = [
    { key: "home",       label: "Home",       icon: <FaHome />,    path: "/home" },
    { key: "my-hotels",  label: "My Hotels",  icon: <FaHotel />,   path: "/my-hotels" },
    { key: "my-flights", label: "My Flights", icon: <FaPlane />,   path: "/my-flights" },
    { key: "reviews",    label: "Reviews",    icon: <FaStar />,    path: "/reviews" },
    { key: "profile",    label: "Profile",    icon: <FaUser />,    path: "/profile" },
    { key: "contact",    label: "Contact",    icon: <FaEnvelope />,path: "/contact" },
  ];

  return (
    <aside style={{
      width: 240,
      background: "#FFFFFF",
      borderRight: "1px solid #E5E7EB",
      padding: "24px 16px",
      minHeight: "100vh",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <div style={{
          fontSize: "1.1rem", fontWeight: 800,
          background: "linear-gradient(135deg,#2563EB,#3B82F6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          ✈️ TravelAI
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {menuItems.map(item => {
          const isActive = activeItem === item.key;
          return (
            <Link
              key={item.key}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                color: isActive ? "#2563EB" : "#6B7280",
                background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                textDecoration: "none",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                transition: "all 0.2s",
                border: isActive ? "1px solid rgba(37,99,235,0.15)" : "1px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.color = "#374151";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6B7280";
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
