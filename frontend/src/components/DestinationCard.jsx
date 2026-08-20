import React from "react";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";

export default function DestinationCard({ destination, onExplore, onClick }) {
  if (!destination) return null;

  const handleClick = (e) => {
    if (onExplore) {
      onExplore(destination.id || destination._id || destination.placeId || destination.name);
    } else if (onClick) {
      onClick(destination);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: "#FFFFFF",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid #E8EDF5",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(15,23,42,.08)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 20px 48px rgba(15,23,42,.14)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,23,42,.08)";
      }}
    >
      <img
        src={destination.image || destination.img || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}
        alt={destination.title || destination.name}
        style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
      />
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1F2937", marginBottom: 6, margin: "0 0 6px" }}>
          {destination.title || destination.name}
        </h3>
        <p style={{ color: "#64748B", display: "flex", alignItems: "center", gap: 6, fontSize: "0.88rem", marginBottom: 12, margin: "0 0 12px" }}>
          <FaMapMarkerAlt style={{ color: "#ef4444", flexShrink: 0 }} />
          {destination.location || destination.category}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#F59E0B", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: "0.9rem" }}>
            <FaStar /> {destination.rating || 4.8}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
            style={{
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              border: "none",
              color: "white",
              padding: "6px 14px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Explore →
          </button>
        </div>
      </div>
    </div>
  );
}
