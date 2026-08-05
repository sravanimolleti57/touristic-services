import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";

export default function UserDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  const [hotelCount, setHotelCount] = useState(0);
  const [flightCount, setFlightCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const hotels = await axios.get(`http://127.0.0.1:5000/my-hotels/${email}`);
      const flights = await axios.get(`http://127.0.0.1:5000/my-flights/${email}`);
      setHotelCount(hotels.data.length);
      setFlightCount(flights.data.length);
    } catch (err) {
      console.log(err);
    }
  };

  const statCardStyle = {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    textAlign: "center",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "all 0.25s",
  };

  const quickBtnStyle = {
    padding: "18px 20px",
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    cursor: "pointer",
    background: "#FFFFFF",
    color: "#374151",
    fontWeight: 700,
    fontSize: 15,
    transition: "all 0.2s",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  return (
    <>
      <SharedNavbar activeTab="dashboard" />

      <div
        style={{
          minHeight: "100vh",
          background: "#F8FAFC",
          color: "#111827",
          padding: "100px 40px 60px",
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: "#111827" }}>
              Welcome back, {user?.name || "Traveler"} 👋
            </h1>
            <p style={{ color: "#6B7280", marginTop: 8, fontSize: 15 }}>
              Manage all your travel bookings in one place.
            </p>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 20,
              marginBottom: 40,
            }}
          >
            <div
              style={statCardStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏨</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#2563EB" }}>{hotelCount}</div>
              <div style={{ color: "#6B7280", fontSize: 13, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Hotel Bookings</div>
            </div>

            <div
              style={statCardStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>✈️</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#2563EB" }}>{flightCount}</div>
              <div style={{ color: "#6B7280", fontSize: 13, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Flight Bookings</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 16px" }}>
              Quick Actions
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
            }}
          >
            <button
              style={quickBtnStyle}
              onClick={() => navigate("/my-hotels")}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.background = "rgba(37,99,235,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#FFFFFF"; }}
            >
              🏨 My Hotels
            </button>

            <button
              style={quickBtnStyle}
              onClick={() => navigate("/my-flights")}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.background = "rgba(37,99,235,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#FFFFFF"; }}
            >
              ✈️ My Flights
            </button>

            <button
              style={quickBtnStyle}
              onClick={() => navigate("/reviews")}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.background = "rgba(37,99,235,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#FFFFFF"; }}
            >
              ⭐ Reviews
            </button>

            <button
              style={quickBtnStyle}
              onClick={() => navigate("/home")}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; e.currentTarget.style.background = "rgba(37,99,235,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "#FFFFFF"; }}
            >
              🌍 Explore Places
            </button>
          </div>
        </div>
      </div>
    </>
  );
}