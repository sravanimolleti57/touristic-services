import React from "react";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

export default function DestinationCard({ destination, onClick }) {
  if (!destination) return null;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#1e293b",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
    >
      <img
        src={destination.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
        alt={destination.title || destination.name}
        style={{ width: "100%", height: 200, objectFit: "cover" }}
      />
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: 6 }}>
          {destination.title || destination.name}
        </h3>
        <p style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem", marginBottom: 12 }}>
          <FaMapMarkerAlt style={{ color: "#ef4444" }} /> {destination.location || destination.category}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            <FaStar /> {destination.rating || 4.8}
          </span>
          <span style={{ color: "#38bdf8", fontWeight: 700 }}>
            {destination.price || "Explore"}
          </span>
        </div>
      </div>
    </div>
  );
}
