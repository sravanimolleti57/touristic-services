import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";

export default function MyFlights() {
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:5000/my-flights/${email}`
      );

      setFlights(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load flight bookings.");
    } finally {
      setLoading(false);
    }
  };

  const cancelFlight = async (id) => {
    const ok = window.confirm(
      "Do you want to cancel this flight booking?"
    );

    if (!ok) return;

    try {
      await axios.delete(
        `http://127.0.0.1:5000/cancel-flight/${id}`
      );

      alert("Flight booking cancelled successfully.");
      fetchFlights();
    } catch (err) {
      console.error(err);
      alert("Unable to cancel booking.");
    }
  };

  return (
    <>
      <SharedNavbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "110px 40px 40px",
        }}
      >
        <h1 style={{ marginBottom: 30 }}>
          ✈️ My Flight Bookings
        </h1>

        {loading ? (
          <h2>Loading...</h2>
        ) : flights.length === 0 ? (
          <h2>No flight bookings found.</h2>
        ) : (
          flights.map((flight) => (
            <div
              key={flight._id}
              style={{
                background: "#1e293b",
                borderRadius: 15,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h2>{flight.airline}</h2>

              <p>
                <strong>From:</strong> {flight.from}
              </p>

              <p>
                <strong>To:</strong> {flight.to}
              </p>

              <p>
                <strong>Date:</strong> {flight.date}
              </p>

              <p>
                <strong>Passengers:</strong> {flight.passengers}
              </p>

              <button
                onClick={() => cancelFlight(flight._id)}
                style={{
                  marginTop: 15,
                  padding: "10px 18px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel Booking
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}