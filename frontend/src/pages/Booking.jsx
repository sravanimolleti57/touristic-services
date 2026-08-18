import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";
import { FaHotel, FaPlane, FaSuitcaseRolling, FaArrowRight, FaTicketAlt } from "react-icons/fa";

export default function Booking() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <>
      <SharedNavbar activeTab="booking" />
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b132b 0%, #1c2541 100%)",
        color: "#ffffff",
        padding: "120px 40px 60px",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#38bdf8", marginBottom: 12 }}>
              Your Travel Bookings &amp; Reservations
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
              Manage your all-inclusive destination trips, luxury hotel stays, and flight bookings powered by AI.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {/* Destination Trip Bookings Card */}
            <div style={{
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: 20,
              padding: 32,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 36, color: "#38bdf8", marginBottom: 16 }}>
                  <FaSuitcaseRolling />
                </div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: 10 }}>Destination Trip Packages</h2>
                <p style={{ color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
                  View multi-step destination bookings with hotels, flight routes, and planned sightseeing activities.
                </p>
              </div>
              <button
                onClick={() => navigate("/my-bookings")}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}
              >
                View Trip Bookings <FaArrowRight />
              </button>
            </div>

            {/* Hotel Bookings Card */}
            <div style={{
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 32,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 36, color: "#0ea5e9", marginBottom: 16 }}>
                  <FaHotel />
                </div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: 10 }}>My Hotel Reservations</h2>
                <p style={{ color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
                  View current and upcoming stays, review hotel sentiment scores, or adjust accommodation details.
                </p>
              </div>
              <button
                onClick={() => navigate("/my-hotels")}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}
              >
                View Hotel Bookings <FaArrowRight />
              </button>
            </div>

            {/* Flight Bookings Card */}
            <div style={{
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 32,
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 36, color: "#a855f7", marginBottom: 16 }}>
                  <FaPlane />
                </div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 700, marginBottom: 10 }}>My Flight Bookings</h2>
                <p style={{ color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
                  Track active flight tickets, seat options, departure schedules, and sentiment analysis.
                </p>
              </div>
              <button
                onClick={() => navigate("/my-flights")}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10
                }}
              >
                View Flight Bookings <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
