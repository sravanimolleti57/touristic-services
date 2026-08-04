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
      const hotels = await axios.get(
        `http://127.0.0.1:5000/my-hotels/${email}`
      );

      const flights = await axios.get(
        `http://127.0.0.1:5000/my-flights/${email}`
      );

      setHotelCount(hotels.data.length);
      setFlightCount(flights.data.length);
    } catch (err) {
      console.log(err);
    }
  };

  const cardStyle = {
    background: "#1e293b",
    borderRadius: 15,
    padding: 25,
    cursor: "pointer",
    transition: "0.3s",
    textAlign: "center",
  };

  return (
    <>
      <SharedNavbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "110px 40px",
        }}
      >
        <h1>Welcome {user?.name || "Traveler"} 👋</h1>

        <p style={{ color: "#94a3b8" }}>
          Manage all your travel bookings in one place.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 25,
            marginTop: 40,
          }}
        >
          <div style={cardStyle}>
            <h2>🏨 Hotels</h2>
            <h1>{hotelCount}</h1>
          </div>

          <div style={cardStyle}>
            <h2>✈️ Flights</h2>
            <h1>{flightCount}</h1>
          </div>
        </div>

        <h2 style={{ marginTop: 50 }}>Quick Actions</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
            marginTop: 20,
          }}
        >
          <button
            style={{
              padding: 18,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate("/my-hotels")}
          >
            🏨 My Hotels
          </button>

          <button
            style={{
              padding: 18,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate("/my-flights")}
          >
            ✈️ My Flights
          </button>

          <button
            style={{
              padding: 18,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate("/reviews")}
          >
            ⭐ Reviews
          </button>

          <button
            style={{
              padding: 18,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => navigate("/home")}
          >
            🌍 Explore Places
          </button>
        </div>
      </div>
    </>
  );
}