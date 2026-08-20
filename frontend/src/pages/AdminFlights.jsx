import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaPlane, FaCheck, FaCheckCircle, FaSearch, FaEnvelope,
  FaPhone, FaUsers, FaClock, FaExchangeAlt, FaTimesCircle
} from "react-icons/fa";
import axios from "axios";

export default function AdminFlights() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmingId, setConfirmingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchFlightBookings();
  }, []);

  const fetchFlightBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/bookings/flights");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error loading admin flight bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (booking) => {
    const ok = window.confirm(`Confirm flight ticket for ${booking.customerName} (${booking.flightName})?`);
    if (!ok) return;

    setConfirmingId(booking._id);
    setNotification(null);

    try {
      const res = await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm-flight/${booking._id}`);
      
      if (res.data) {
        setNotification({
          type: "success",
          message: "✓ Flight booking confirmed and e-ticket pass generated for customer!"
        });

        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "Confirmed", confirmedAt: res.data.confirmedAt } : b));
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to confirm flight booking."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch =
      (b.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customerEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.flightName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.from || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.to || "").toLowerCase().includes(search.toLowerCase()) ||
      (b._id || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" ? true : (b.status || "Pending").toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchStatus;
  });

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#0F172A",
        padding: "100px 36px 60px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            marginBottom: 28, display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#0284C7", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaPlane /> AIRWAYS &amp; TRANSPORT RESERVATIONS
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                Flight Bookings &amp; Passes
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Review passenger flight reservations, approve airline e-tickets, and dispatch booking confirmations.
              </p>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", padding: "10px 18px",
                borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Total Flights</span>
                <strong style={{ fontSize: 18, color: "#0F172A", fontWeight: 900 }}>{bookings.length}</strong>
              </div>
              <div style={{
                background: "#FFFFFF", border: "1px solid #FCD34D", padding: "10px 18px",
                borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}>
                <span style={{ fontSize: 11, color: "#D97706", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Pending</span>
                <strong style={{ fontSize: 18, color: "#D97706", fontWeight: 900 }}>
                  {bookings.filter(b => (b.status || "Pending") === "Pending").length}
                </strong>
              </div>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <div style={{
              padding: "14px 20px", borderRadius: 12, marginBottom: 20,
              background: notification.type === "success" ? "#DCFCE7" : "#FEE2E2",
              border: notification.type === "success" ? "1px solid #86EFAC" : "1px solid #FCA5A5",
              color: notification.type === "success" ? "#15803D" : "#DC2626",
              fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10
            }}>
              {notification.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
              {notification.message}
            </div>
          )}

          {/* Filter / Search */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
            padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}>
            <div style={{ flex: "1 1 280px", maxWidth: 400 }}>
              <SearchAutocomplete
                value={search}
                onChange={setSearch}
                localData={bookings}
                searchFields={["passengerName", "contactName", "contactEmail", "airline", "route", "from", "to", "bookingId", "_id"]}
                placeholder="Search passenger, airline, route, ID..."
                onSelect={(item, title) => {
                  setSearch(title);
                }}
                inputStyle={{
                  padding: "10px 14px 10px 38px",
                  borderRadius: 10,
                  background: "#F8FAFC",
                  borderColor: "#E2E8F0",
                  fontSize: 13
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {["all", "pending", "confirmed"].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: filterStatus === st ? "#2563EB" : "#F1F5F9",
                    color: filterStatus === st ? "#FFFFFF" : "#64748B",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize",
                    transition: "all 0.2s"
                  }}
                >
                  {st === "all" ? "All Statuses" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
            overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>Loading flight reservations...</div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>No flight bookings found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Booking ID</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Passenger</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Airline / Flight</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Route</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Travel Date</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Seats</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const isPending = (b.status || "Pending") === "Pending";
                      const isConfirmed = b.status === "Confirmed";

                      return (
                        <tr key={b._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          <td style={{ padding: "16px 18px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>
                            #{String(b._id).slice(-8)}
                          </td>

                          <td style={{ padding: "16px 18px" }}>
                            <div style={{ fontWeight: 800, color: "#0F172A" }}>{b.customerName || b.userEmail}</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>{b.customerEmail || b.userEmail}</div>
                          </td>

                          <td style={{ padding: "16px 18px", fontWeight: 700, color: "#0F172A" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaPlane size={12} color="#0284C7" />
                              {b.flightName || b.flightNo || "Scheduled Flight"}
                            </div>
                          </td>

                          <td style={{ padding: "16px 18px", color: "#334155", fontWeight: 600 }}>
                            {b.from} &rarr; {b.to}
                          </td>

                          <td style={{ padding: "16px 18px", color: "#64748B" }}>
                            {b.departureDate || b.travelDate || "Scheduled"}
                          </td>

                          <td style={{ padding: "16px 18px", color: "#0F172A", fontWeight: 700 }}>
                            {b.passengers || b.guests || 1} Seat(s)
                          </td>

                          <td style={{ padding: "16px 18px", fontWeight: 900, color: "#16A34A" }}>
                            {b.price || "₹6,500"}
                          </td>

                          <td style={{ padding: "16px 18px" }}>
                            <span style={{
                              padding: "4px 12px", borderRadius: 16, fontSize: 11, fontWeight: 800,
                              background: isConfirmed ? "#DCFCE7" : "#FEF3C7",
                              color: isConfirmed ? "#15803D" : "#B45309",
                              border: isConfirmed ? "1px solid #86EFAC" : "1px solid #FCD34D",
                              display: "inline-flex", alignItems: "center", gap: 4
                            }}>
                              {isConfirmed ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                              {b.status || "Pending"}
                            </span>
                          </td>

                          <td style={{ padding: "16px 18px", textAlign: "center" }}>
                            {isPending ? (
                              <button
                                onClick={() => handleConfirmBooking(b)}
                                disabled={confirmingId === b._id}
                                style={{
                                  padding: "7px 14px", borderRadius: 8, border: "none",
                                  background: "linear-gradient(135deg, #10B981, #059669)",
                                  color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: "pointer",
                                  display: "inline-flex", alignItems: "center", gap: 5
                                }}
                              >
                                <FaCheck size={10} /> {confirmingId === b._id ? "Approving..." : "Confirm Flight"}
                              </button>
                            ) : (
                              <span style={{ color: "#15803D", fontWeight: 700, fontSize: 12 }}>
                                ✓ Approved
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
