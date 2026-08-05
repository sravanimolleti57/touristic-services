import React from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaStar, FaWifi, FaSwimmingPool, FaUtensils, FaParking, FaCheckCircle, FaBed } from "react-icons/fa";

export default function HotelDetailsPanel({ hotel }) {
  if (!hotel) return null;

  const amenities = [
    { icon: <FaWifi  style={{ color: "#2563EB" }} />,  label: "Free Wi-Fi" },
    { icon: <FaSwimmingPool style={{ color: "#0EA5E9" }} />, label: "Pool" },
    { icon: <FaUtensils style={{ color: "#D97706" }} />,    label: "Dining" },
    { icon: <FaParking  style={{ color: "#059669" }} />,    label: "Parking" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 20, borderRadius: 16,
        background: "#FFFFFF", border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", gap: 16,
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid #E5E7EB" }}>
        <FaBed style={{ color: "#2563EB", fontSize: 14 }} />
        <h3 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 800, color: "#374151" }}>
          Hotel Information
        </h3>
      </div>

      {/* Hotel Image */}
      <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", border: "1px solid #E5E7EB" }}>
        <img
          src={hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"}
          alt={hotel.name}
          style={{ width: "100%", height: 144, objectFit: "cover", display: "block", transition: "transform 0.3s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(4px)",
          color: "#D97706", fontSize: 11, fontWeight: 800,
          padding: "4px 10px", borderRadius: 20,
          display: "flex", alignItems: "center", gap: 4,
          border: "1px solid #E5E7EB",
        }}>
          <FaStar /> {hotel.rating || 4.8}
        </div>
      </div>

      {/* Title & Price */}
      <div>
        <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>{hotel.name}</h4>
        <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
          <FaMapMarkerAlt style={{ color: "#DC2626", fontSize: 11 }} />
          <span>{hotel.location}</span>
        </p>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>
          {hotel.price || "₹28,000/night"}
        </div>
      </div>

      {/* Amenities */}
      <div style={{ paddingTop: 12, borderTop: "1px solid #E5E7EB" }}>
        <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.5px" }}>Amenities</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {amenities.map((item, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 10px", borderRadius: 8,
              background: "#F9FAFB", border: "1px solid #E5E7EB",
              fontSize: 11, color: "#374151", fontWeight: 500,
            }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified badge */}
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)",
        fontSize: 11, color: "#059669",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <FaCheckCircle style={{ color: "#059669", fontSize: 13, flexShrink: 0 }} />
        <span>Verified AI Sentiment Tracked Hotel</span>
      </div>
    </motion.div>
  );
}
