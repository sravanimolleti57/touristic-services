import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { FaClipboardList, FaHotel, FaPlane, FaSuitcaseRolling, FaCheck, FaCheckCircle, FaSearch, FaEnvelope, FaClock } from "react-icons/fa";
import axios from "axios";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmingId, setConfirmingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/bookings/all");
      if (res.data) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Error loading all admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (booking) => {
    const bType = booking.bookingType || (booking.destinationName ? "trip" : booking.hotelName ? "hotel" : "flight");
    const itemName = booking.destinationName || booking.hotelName || booking.flightName || "Reservation";
    const ok = window.confirm(`Confirm ${bType.toUpperCase()} booking for ${booking.customerName} (${itemName})? Confirmation email will be dispatched.`);
    if (!ok) return;

    setConfirmingId(booking._id);
    setNotification(null);

    try {
      const res = await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm/${bType}/${booking._id}`);
      if (res.data) {
        setNotification({
          type: "success",
          message: "✓ Booking is Confirmed and Ticket is Generated to User!"
        });

        setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "Confirmed", confirmedAt: res.data.confirmedAt } : b));
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to confirm booking."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch =
      (b.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customerEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.destinationName || b.hotelName || b.flightName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b._id || "").toLowerCase().includes(search.toLowerCase());

    const bType = b.bookingType || (b.destinationName ? "trip" : b.hotelName ? "hotel" : "flight");
    const matchType = filterType === "all" ? true : bType === filterType;
    const matchStatus = filterStatus === "all" ? true : (b.status || "Pending").toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchType && matchStatus;
  });

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #090d16 0%, #0f172a 100%)",
        color: "#ffffff",
        padding: "110px 40px 60px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#c084fc", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                <FaClipboardList /> Unified Master Bookings Log
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
                All Booking Requests
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Master administrative overview of destination trips, hotel stays, and flight reservations.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: "10px 16px 10px 40px", borderRadius: 12, width: 220,
                    background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff", fontSize: 13, outline: "none"
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  padding: "10px 16px", borderRadius: 12,
                  background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ffffff", fontSize: 13, outline: "none", cursor: "pointer"
                }}
              >
                <option value="all">All Types</option>
                <option value="trip">Trips Only</option>
                <option value="hotel">Hotels Only</option>
                <option value="flight">Flights Only</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: "10px 16px", borderRadius: 12,
                  background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#ffffff", fontSize: 13, outline: "none", cursor: "pointer"
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          {/* Notification banner */}
          {notification && (
            <div style={{
              padding: "14px 20px", borderRadius: 12, marginBottom: 24,
              background: notification.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: notification.type === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              color: notification.type === "success" ? "#34d399" : "#f87171",
              fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 10
            }}>
              <FaCheckCircle /> {notification.message}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", background: "rgba(30, 41, 59, 0.5)", borderRadius: 20 }}>
              Loading bookings log...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", background: "rgba(30, 41, 59, 0.5)", borderRadius: 20 }}>
              No matching booking records found.
            </div>
          ) : (
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", backdropFilter: "blur(12px)",
              borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "rgba(15, 23, 42, 0.8)", color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Type</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Booking ID</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Customer Name</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Customer Email</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Reservation Item</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Dates / Info</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Price</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "16px 20px", fontWeight: 700, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const isPending = (b.status || "Pending") === "Pending";
                    const bType = b.bookingType || (b.destinationName ? "trip" : b.hotelName ? "hotel" : "flight");
                    const isTrip = bType === "trip";
                    const isHotel = bType === "hotel";
                    const itemName = b.destinationName || b.hotelName || b.flightName || "Reservation";

                    return (
                      <tr
                        key={b._id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* Type */}
                        <td style={{ padding: "18px 20px" }}>
                          <span style={{
                            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                            background: isTrip ? "rgba(37, 99, 235, 0.2)" : isHotel ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
                            color: isTrip ? "#60a5fa" : isHotel ? "#38bdf8" : "#a855f7",
                            display: "inline-flex", alignItems: "center", gap: 5
                          }}>
                            {isTrip ? <FaSuitcaseRolling size={11} /> : isHotel ? <FaHotel size={11} /> : <FaPlane size={11} />}
                            {isTrip ? "TRIP" : isHotel ? "HOTEL" : "FLIGHT"}
                          </span>
                        </td>

                        {/* ID */}
                        <td style={{ padding: "18px 20px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                          #{String(b._id).slice(-8)}
                        </td>

                        {/* Customer */}
                        <td style={{ padding: "18px 20px", color: "#ffffff", fontWeight: 700 }}>
                          {b.customerName || b.userEmail}
                        </td>

                        {/* Email */}
                        <td style={{ padding: "18px 20px", color: "#cbd5e1" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <FaEnvelope size={11} color="#94a3b8" /> {b.customerEmail || b.userEmail}
                          </div>
                        </td>

                        {/* Item */}
                        <td style={{ padding: "18px 20px", color: "#ffffff", fontWeight: 700 }}>
                          {itemName}
                        </td>

                        {/* Dates */}
                        <td style={{ padding: "18px 20px", color: "#cbd5e1" }}>
                          {isTrip || isHotel ? (
                            <div>{b.checkIn} &rarr; {b.checkOut}</div>
                          ) : (
                            <div>{b.departureDate || b.travelDate} ({b.from} &rarr; {b.to})</div>
                          )}
                        </td>

                        {/* Price */}
                        <td style={{ padding: "18px 20px", color: "#10b981", fontWeight: 800, fontSize: 14 }}>
                          {b.price || `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`}
                        </td>

                        {/* Status */}
                        <td style={{ padding: "18px 20px" }}>
                          <span style={{
                            padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800,
                            background: isPending ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: isPending ? "#f59e0b" : "#10b981",
                            border: isPending ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                            display: "inline-flex", alignItems: "center", gap: 5
                          }}>
                            {isPending ? <FaClock size={10} /> : <FaCheck size={10} />}
                            {b.status || "Pending"}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ padding: "18px 20px", textAlign: "center" }}>
                          {isPending ? (
                            <button
                              onClick={() => handleConfirm(b)}
                              disabled={confirmingId === b._id}
                              style={{
                                padding: "8px 16px", borderRadius: 10,
                                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                                color: "#ffffff", fontWeight: 700, fontSize: 12, border: "none",
                                cursor: confirmingId === b._id ? "wait" : "pointer",
                                opacity: confirmingId === b._id ? 0.7 : 1,
                                display: "inline-flex", alignItems: "center", gap: 6
                              }}
                            >
                              <FaCheck size={10} /> {confirmingId === b._id ? "Confirming..." : "Approve"}
                            </button>
                          ) : (
                            <span style={{ color: "#34d399", fontSize: 12, fontWeight: 700 }}>
                              ✓ Confirmed
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
    </>
  );
}
