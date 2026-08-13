import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { FaHotel, FaCheck, FaCheckCircle, FaSearch, FaEnvelope, FaPhone, FaCalendarAlt, FaUsers, FaTag, FaClock } from "react-icons/fa";
import axios from "axios";

export default function AdminHotels() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirmingId, setConfirmingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmedEmailModal, setConfirmedEmailModal] = useState(null);

  useEffect(() => {
    fetchHotelBookings();
  }, []);

  const fetchHotelBookings = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/bookings/hotels");
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error loading admin hotel bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (booking) => {
    const ok = window.confirm(`Confirm hotel reservation for ${booking.customerName} at ${booking.hotelName}?`);
    if (!ok) return;

    setConfirmingId(booking._id);
    setNotification(null);

    try {
      const res = await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm-hotel/${booking._id}`);
      
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
        message: err.response?.data?.message || "Failed to confirm booking. Please try again."
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchSearch =
      (b.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.customerEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
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
        background: "linear-gradient(135deg, #090d16 0%, #0f172a 100%)",
        color: "#ffffff",
        padding: "110px 40px 60px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#38bdf8", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                <FaHotel /> Admin Management & Approvals
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0 }}>
                Hotel Booking Requests
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Review customer hotel stay applications and approve reservations.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search name, email, hotel, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    padding: "10px 16px 10px 40px", borderRadius: 12, width: 260,
                    background: "rgba(30, 41, 59, 0.7)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffffff", fontSize: 13, outline: "none"
                  }}
                />
              </div>

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
                <option value="pending">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div style={{
              background: notification.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(220, 38, 38, 0.2)",
              border: notification.type === "success" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(220, 38, 38, 0.4)",
              color: notification.type === "success" ? "#34d399" : "#f87171",
              padding: "14px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600,
              marginBottom: 24, display: "flex", alignItems: "center", gap: 10
            }}>
              <FaCheckCircle /> {notification.message}
            </div>
          )}

          {/* Table Container */}
          <div style={{
            background: "rgba(30, 41, 59, 0.5)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 24,
            overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
          }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>Loading hotel requests...</div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏨</div>
                <h3 style={{ color: "#ffffff", margin: "0 0 6px" }}>No hotel bookings found</h3>
                <p style={{ margin: 0, fontSize: 14 }}>There are no hotel reservation requests matching your criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(15, 23, 42, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Booking ID</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Customer Name</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Contact Info</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Hotel Name</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Check In / Out</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Guests</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Price</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700, textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const isPending = (b.status || "Pending") === "Pending";
                      const isConfirming = confirmingId === b._id;

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
                          {/* ID */}
                          <td style={{ padding: "18px 20px", fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>
                            #{String(b._id).slice(-8)}
                          </td>

                          {/* Customer */}
                          <td style={{ padding: "18px 20px", color: "#ffffff", fontWeight: 700 }}>
                            {b.customerName || b.guestName || "Customer"}
                          </td>

                          {/* Contact */}
                          <td style={{ padding: "18px 20px", color: "#cbd5e1" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <FaEnvelope size={11} color="#94a3b8" /> {b.customerEmail || b.userEmail}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", marginTop: 2 }}>
                              <FaPhone size={10} color="#64748b" /> {b.phone || "N/A"}
                            </div>
                          </td>

                          {/* Hotel Name */}
                          <td style={{ padding: "18px 20px", color: "#ffffff", fontWeight: 700 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <FaHotel color="#3b82f6" /> {b.hotelName}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{b.location || "Luxury Hotel"}</div>
                          </td>

                          {/* Dates */}
                          <td style={{ padding: "18px 20px", color: "#cbd5e1" }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{b.checkIn} &rarr; {b.checkOut}</div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Booked: {String(b.bookingDate || b.createdAt || "").slice(0, 10)}</div>
                          </td>

                          {/* Guests */}
                          <td style={{ padding: "18px 20px", color: "#cbd5e1" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 8 }}>
                              <FaUsers size={12} color="#38bdf8" /> {b.guests}
                            </span>
                          </td>

                          {/* Price */}
                          <td style={{ padding: "18px 20px", color: "#10b981", fontWeight: 800, fontSize: 14 }}>
                            {b.price}
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

                          {/* Action Button */}
                          <td style={{ padding: "18px 20px", textAlign: "center" }}>
                            {isPending ? (
                              <button
                                onClick={() => handleConfirmBooking(b)}
                                disabled={isConfirming}
                                style={{
                                  padding: "9px 18px", borderRadius: 12,
                                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                                  color: "#ffffff", fontWeight: 700, fontSize: 12, border: "none",
                                  cursor: isConfirming ? "wait" : "pointer",
                                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  transition: "all 0.2s"
                                }}
                              >
                                <FaCheck /> {isConfirming ? "Confirming..." : "Confirm Booking"}
                              </button>
                            ) : (
                              <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <FaCheckCircle /> Confirmed
                              </div>
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
