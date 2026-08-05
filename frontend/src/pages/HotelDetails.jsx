import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";
import { FaStar, FaMapMarkerAlt, FaBed, FaWifi, FaCoffee, FaConciergeBell, FaArrowLeft } from "react-icons/fa";

export default function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const hotel = {
    id: hotelId || "h1",
    name: "Zostel Jaipur",
    location: "Jaipur, Rajasthan, India",
    rating: 4.8,
    reviewsCount: 340,
    price: "₹1,800/night",
    description: "Experience vibrant culture, beautiful heritage design, and high-speed Wi-Fi in the heart of Jaipur.",
    amenities: ["Free High-Speed Wi-Fi", "Complementary Breakfast", "24/7 Concierge", "Rooftop Lounge", "Air Conditioning"]
  };

  return (
    <>
      <SharedNavbar activeTab="search" />
      <div style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "100px 40px 60px",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20
            }}
          >
            <FaArrowLeft /> Back
          </button>

          <div style={{
            background: "#1e293b",
            borderRadius: 16,
            padding: 32,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>{hotel.name}</h1>
            <p style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <FaMapMarkerAlt style={{ color: "#ef4444" }} /> {hotel.location}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "#f59e0b", color: "#fff", padding: "4px 12px", borderRadius: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <FaStar /> {hotel.rating}
              </div>
              <span style={{ color: "#cbd5e1" }}>{hotel.reviewsCount} Traveler Reviews</span>
              <span style={{ marginLeft: "auto", fontSize: "1.25rem", fontWeight: 700, color: "#38bdf8" }}>{hotel.price}</span>
            </div>

            <p style={{ lineHeight: 1.6, color: "#cbd5e1", marginBottom: 30 }}>{hotel.description}</p>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 16 }}>Amenities</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 30 }}>
              {hotel.amenities.map((item, idx) => (
                <span key={idx} style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "8px 16px", borderRadius: 20, fontSize: "0.9rem" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
