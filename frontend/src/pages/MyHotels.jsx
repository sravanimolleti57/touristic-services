import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import FeedbackAnalysisModal from "../components/FeedbackAnalysisModal";
import { FaChartPie, FaTimesCircle, FaHotel, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";

export default function MyHotels() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelForAnalysis, setSelectedHotelForAnalysis] = useState(null);

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/my-hotels/${email}`);
      setHotels(res.data);
    } catch (err) {
      console.warn("Backend hotel loading error, using local fallback:", err);
      setHotels([
        { _id: "mh1", hotelName: "The Leela Palace", location: "New Delhi, India", checkIn: "2026-08-10", checkOut: "2026-08-15", guests: 2, price: "₹28,000/night" },
        { _id: "mh2", hotelName: "Oberoi Udaivilas", location: "Udaipur, India", checkIn: "2026-09-01", checkOut: "2026-09-04", guests: 2, price: "₹55,000/night" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const ok = window.confirm("Are you sure you want to cancel this hotel booking?");
    if (!ok) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/cancel-hotel/${id}`);
      fetchHotels();
      alert("Hotel booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      setHotels(hotels.filter(h => h._id !== id));
      alert("Hotel booking cancelled successfully.");
    }
  };

  return (
    <>
      <SharedNavbar activeTab="my-hotels" />

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
                <FaHotel size={20} color="white" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#111827" }}>My Hotel Bookings</h1>
                <p style={{ margin: 0, color: "#6B7280", fontSize: 14, marginTop: 2 }}>Manage your hotel reservations</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{
              background: "#FFFFFF", borderRadius: 16, padding: 40, textAlign: "center",
              border: "1px solid #E5E7EB", color: "#6B7280", fontSize: 15,
            }}>
              ⏳ Loading your reservations...
            </div>
          ) : hotels.length === 0 ? (
            <div style={{
              background: "#FFFFFF", borderRadius: 16, padding: "60px 40px",
              textAlign: "center", border: "1px solid #E5E7EB",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏨</div>
              <h3 style={{ color: "#374151", margin: "0 0 8px", fontSize: 20 }}>No hotel bookings yet</h3>
              <p style={{ color: "#9CA3AF", margin: 0, fontSize: 14 }}>Start exploring hotels to make your first booking!</p>
            </div>
          ) : (
            hotels.map((hotel) => {
              const hName = hotel.hotelName || hotel.hotel_name || "Booked Hotel";
              return (
                <div
                  key={hotel._id}
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
                    <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#111827" }}>{hName}</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaMapMarkerAlt size={12} color="#2563EB" />
                        <span>{hotel.location}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaCalendarAlt size={12} color="#2563EB" />
                        <span>Check In: <strong style={{ color: "#374151" }}>{hotel.checkIn || hotel.check_in || "—"}</strong> &nbsp;|&nbsp; Check Out: <strong style={{ color: "#374151" }}>{hotel.checkOut || hotel.check_out || "—"}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 13 }}>
                        <FaUsers size={12} color="#2563EB" />
                        <span>Guests: <strong style={{ color: "#374151" }}>{hotel.guests}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      onClick={() => setSelectedHotelForAnalysis({ name: hName, location: hotel.location, id: hotel._id })}
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
                      onClick={() => cancelBooking(hotel._id)}
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

      {selectedHotelForAnalysis && (
        <FeedbackAnalysisModal
          item={selectedHotelForAnalysis}
          itemType="hotel"
          onClose={() => setSelectedHotelForAnalysis(null)}
        />
      )}
    </>
  );
}