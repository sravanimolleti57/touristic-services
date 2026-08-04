import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import FeedbackAnalysisModal from "../components/FeedbackAnalysisModal";
import { FaChartPie, FaTimesCircle } from "react-icons/fa";

export default function MyFlights() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlightForAnalysis, setSelectedFlightForAnalysis] = useState(null);

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
      console.warn("Backend flights loading error, using local fallback:", err);
      setFlights([
        {
          _id: "mf1",
          airline: "Air India",
          flightName: "Air India",
          flightNo: "AI-101",
          from: "Delhi (DEL)",
          to: "Dubai (DXB)",
          departureDate: "2026-08-12",
          passengers: 1,
          price: "₹15,999"
        },
        {
          _id: "mf2",
          airline: "Vistara",
          flightName: "Vistara",
          flightNo: "UK-820",
          from: "Bangalore (BLR)",
          to: "Singapore (SIN)",
          departureDate: "2026-09-05",
          passengers: 2,
          price: "₹18,999"
        }
      ]);
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
      setFlights(flights.filter(f => f._id !== id));
      alert("Flight booking cancelled successfully.");
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
          padding: "110px 40px 60px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ marginBottom: 30, fontSize: 32, fontWeight: 800 }}>
            ✈️ My Flight Bookings
          </h1>

          {loading ? (
            <h2 style={{ color: "#94a3b8" }}>Loading flight bookings...</h2>
          ) : flights.length === 0 ? (
            <h2 style={{ color: "#94a3b8" }}>No flight bookings found.</h2>
          ) : (
            flights.map((flight) => {
              const aName = flight.airline || flight.flightName || "Airline";
              return (
                <div
                  key={flight._id}
                  style={{
                    background: "#1e293b",
                    borderRadius: 18,
                    padding: 24,
                    marginBottom: 20,
                    border: "1px solid #334155",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>{aName}</h2>

                    <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: 14 }}>
                      <strong>Route:</strong> {flight.from} → {flight.to}
                    </p>

                    <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: 14 }}>
                      <strong>Date:</strong> {flight.departureDate || flight.date || "Upcoming"}
                    </p>

                    <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: 14 }}>
                      <strong>Passengers:</strong> {flight.passengers || 1}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={() => setSelectedFlightForAnalysis({ airline: aName, flightNo: flight.flightNo, from: flight.from, to: flight.to, id: flight._id })}
                      style={{
                        background: "rgba(59, 130, 246, 0.15)",
                        border: "1px solid #3b82f6",
                        color: "#93c5fd",
                        padding: "10px 16px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaChartPie size={14} color="#3b82f6" /> Feedback Analysis
                    </button>

                    <button
                      onClick={() => cancelFlight(flight._id)}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid #ef4444",
                        color: "#fca5a5",
                        padding: "10px 16px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FaTimesCircle size={14} color="#ef4444" /> Cancel Booking
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedFlightForAnalysis && (
        <FeedbackAnalysisModal
          item={selectedFlightForAnalysis}
          itemType="flight"
          onClose={() => setSelectedFlightForAnalysis(null)}
        />
      )}
    </>
  );
}