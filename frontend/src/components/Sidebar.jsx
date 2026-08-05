import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaHotel, FaPlane, FaStar, FaUser, FaEnvelope } from "react-icons/fa";

export default function Sidebar({ activeItem = "home" }) {
  const menuItems = [
    { key: "home", label: "Home", icon: <FaHome />, path: "/home" },
    { key: "my-hotels", label: "My Hotels", icon: <FaHotel />, path: "/my-hotels" },
    { key: "my-flights", label: "My Flights", icon: <FaPlane />, path: "/my-flights" },
    { key: "reviews", label: "Reviews", icon: <FaStar />, path: "/reviews" },
    { key: "profile", label: "Profile", icon: <FaUser />, path: "/profile" },
    { key: "contact", label: "Contact", icon: <FaEnvelope />, path: "/contact" },
  ];

  return (
    <aside style={{
      width: 240,
      background: "#0f172a",
      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "24px 16px",
      minHeight: "100vh"
    }}>
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <h2 style={{ color: "#38bdf8", fontSize: "1.25rem", fontWeight: 700 }}>Tourism AI</h2>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {menuItems.map(item => (
          <Link
            key={item.key}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 10,
              color: activeItem === item.key ? "#38bdf8" : "#94a3b8",
              background: activeItem === item.key ? "rgba(56, 189, 248, 0.12)" : "transparent",
              textDecoration: "none",
              fontWeight: 500
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
