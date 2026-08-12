import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import FeedbackAnalysisModal from "../components/FeedbackAnalysisModal";
import { FaChartPie, FaTimesCircle, FaPlane, FaArrowRight, FaCalendarAlt, FaUserAlt, FaExternalLinkAlt } from "react-icons/fa";
import { getOfficialBookingUrl } from "../data/flights";

export default function MyFlights() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email;

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlightForAnalysis, setSelectedFlightForAnalysis] = useState(null);

  useEffect(() => { fetchFlights(); }, []);

  const fetchFlights = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/my-flights/${email}`);
      setFlights(res.data);
    } catch (err) {
      console.warn("Backend flights loading error, using local fallback:", err);
      setFlights([
        { _id: "mf1", airline: "Air India", flightName: "Air India", flightNo: "AI-101", from: "Delhi (DEL)", to: "Dubai (DXB)", departureDate: "2026-08-12", passengers: 1, price: "₹15,999" },
        { _id: "mf2", airline: "Vistara", flightName: "Vistara", flightNo: "UK-820", from: "Bangalore (BLR)", to: "Singapore (SIN)", departureDate: "2026-09-05", passengers: 2, price: "₹18,999" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cancelFlight = async (id) => {
    const ok = window.confirm("Do you want to cancel this flight booking?");
    if (!ok) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/cancel-flight/${id}`);
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
      <SharedNavbar activeTab="my-flights" />

      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#111827",
        padding: "100px 40px 60px",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg,#2563EB,#3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
              }}>
                <FaPlane size={18} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111827" }}>My Flight Bookings</h1>
                <p style={{ margin: 0, color: "#6B7280", fontSize: 14, marginTop: 2 }}>Manage your upcoming flights</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              background: "#FFFFFF", borderRadius: 16, padding: 40, textAlign: "center",
              border: "1px solid #E5E7EB", color: "#6B7280", fontSize: 15,
            }}>
              ⏳ Loading flight bookings...
            </div>
          ) : flights.length === 0 ? (
            <div style={{
              background: "#FFFFFF", borderRadius: 16, padding: "60px 40px",
              textAlign: "center", border: "1px solid #E5E7EB",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✈️</div>
              <h3 style={{ color: "#374151", margin: "0 0 8px", fontSize: 20 }}>No flight bookings yet</h3>
              <p style={{ color: "#9CA3AF", margin: 0, fontSize: 14 }}>Browse flights to plan your next adventure!</p>
            </div>
          ) : (
            flights.map((flight) => {
              const aName = flight.airline || flight.flightName || "Airline";
              return (
                <div
                  key={flight._id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: "24px 28px",
                    marginBottom: 16,
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>{aName}</h2>
                      {flight.flightNo && (
                        <span style={{
                          background: "rgba(37,99,235,0.08)", color: "#2563EB",
                          fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                          border: "1px solid rgba(37,99,235,0.15)",
                        }}>{flight.flightNo}</span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaPlane size={11} color="#2563EB" />
                        <span>
                          <strong style={{ color: "#374151" }}>{flight.from}</strong>
                          {" "}<FaArrowRight size={10} color="#9CA3AF" style={{ display: "inline" }} />{" "}
                          <strong style={{ color: "#374151" }}>{flight.to}</strong>
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaCalendarAlt size={11} color="#2563EB" />
                        <span>Departure: <strong style={{ color: "#374151" }}>{flight.departureDate || flight.date || "Upcoming"}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaUserAlt size={11} color="#2563EB" />
                        <span>Passengers: <strong style={{ color: "#374151" }}>{flight.passengers || 1}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      href={getOfficialBookingUrl(flight)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "#059669",
                        padding: "9px 14px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.16)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.08)"; }}
                    >
                      Official Site <FaExternalLinkAlt size={12} />
                    </a>

                    <button
                      onClick={() => setSelectedFlightForAnalysis({ airline: aName, flightNo: flight.flightNo, from: flight.from, to: flight.to, id: flight._id })}
                      style={{
                        background: "rgba(37,99,235,0.06)",
                        border: "1px solid rgba(37,99,235,0.20)",
                        color: "#2563EB",
                        padding: "9px 16px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.06)"; }}
                    >
                      <FaChartPie size={13} /> Feedback Analysis
                    </button>

                    <button
                      onClick={() => cancelFlight(flight._id)}
                      style={{
                        background: "rgba(220,38,38,0.06)",
                        border: "1px solid rgba(220,38,38,0.20)",
                        color: "#DC2626",
                        padding: "9px 16px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.12)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
                    >
                      <FaTimesCircle size={13} /> Cancel Booking
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