import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaClipboardList, FaHotel, FaSuitcaseRolling, FaCheck,
  FaCheckCircle, FaSearch, FaEnvelope, FaClock, FaTimesCircle
} from "react-icons/fa";
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
    setLoading(true);
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
    const bType = booking.bookingType || (booking.destinationName ? "trip" : "hotel");
    const itemName = booking.destinationName || booking.hotelName || "Reservation";
    const ok = window.confirm(`Confirm ${bType.toUpperCase()} booking for ${booking.customerName} (${itemName})? Confirmation notice will be dispatched.`);
    if (!ok) return;

    setConfirmingId(booking._id);
    setNotification(null);

    try {
      if (bType === "hotel") {
        await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm-hotel/${booking._id}`);
      } else {
        await axios.post(`http://127.0.0.1:5000/api/admin/bookings/confirm/${bType}/${booking._id}`);
      }

      setNotification({
        type: "success",
        message: "✓ Reservation is confirmed and customer pass is officially generated!"
      });

      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: "Confirmed" } : b));
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
      (b.destinationName || b.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b._id || "").toLowerCase().includes(search.toLowerCase());

    const bType = b.bookingType || (b.destinationName ? "trip" : "hotel");
    const matchType = filterType === "all" ? true : bType === filterType;
    const matchStatus = filterStatus === "all" ? true : (b.status || "Pending").toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchType && matchStatus;
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
                color: "#2563EB", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaClipboardList /> MASTER SYSTEM RESERVATIONS LOG
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                All Booking Requests
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Master administrative overview of destination trips and hotel stays.
              </p>
            </div>

            {/* Filters Bar */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ width: 260 }}>
                <SearchAutocomplete
                  value={search}
                  onChange={setSearch}
                  localData={bookings}
                  searchFields={["customerName", "guestName", "name", "email", "hotelName", "destinationName", "placeName", "id", "_id"]}
                  placeholder="Search name, email, ID..."
                  onSelect={(item, title) => {
                    setSearch(title);
                  }}
                  inputStyle={{
                    padding: "10px 14px 10px 38px",
                    borderRadius: 10,
                    borderColor: "#E2E8F0",
                    fontSize: 13
                  }}
                />
              </div>

              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#FFFFFF", border: "1px solid #E2E8F0",
                  color: "#0F172A", fontSize: 13, outline: "none", cursor: "pointer", fontWeight: 600
                }}
              >
                <option value="all">All Booking Types</option>
                <option value="hotel">Hotels Only</option>
                <option value="trip">Trips Only</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "#FFFFFF", border: "1px solid #E2E8F0",
                  color: "#0F172A", fontSize: 13, outline: "none", cursor: "pointer", fontWeight: 600
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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

          {/* Table */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
            overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>Loading all reservation records...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>No matching bookings found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Type</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Booking ID</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Customer</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Reservation Item</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Schedule / Dates</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Amount</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Payment Status</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Booking Status</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Razorpay Reference</th>
                      <th style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b) => {
                      const isPending = (b.status || "Pending") === "Pending";
                      const isConfirmed = b.status === "Confirmed";
                      const isCancelled = b.status === "Cancelled";
                      const isPaid = (b.paymentStatus || "").toLowerCase() === "paid";
                      const bType = b.bookingType || (b.destinationName ? "trip" : "hotel");
                      const isTrip = bType === "trip";
                      const isHotel = bType === "hotel";
                      const itemName = b.destinationName || b.hotelName || "Reservation";

                      return (
                        <tr key={b._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          {/* Type */}
                          <td style={{ padding: "16px 18px" }}>
                            <span style={{
                              padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                              background: isTrip ? "#F0FDF4" : "#EFF6FF",
                              color: isTrip ? "#16A34A" : "#2563EB",
                              display: "inline-flex", alignItems: "center", gap: 5
                            }}>
                              {isTrip ? <FaSuitcaseRolling size={10} /> : <FaHotel size={10} />}
                              {bType.toUpperCase()}
                            </span>
                          </td>

                          {/* ID */}
                          <td style={{ padding: "16px 18px", fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>
                            #{String(b._id).slice(-8)}
                          </td>

                          {/* Customer */}
                          <td style={{ padding: "16px 18px" }}>
                            <div style={{ fontWeight: 800, color: "#0F172A" }}>{b.customerName || b.userEmail}</div>
                            <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                              <FaEnvelope size={10} color="#94A3B8" /> {b.customerEmail || b.userEmail}
                            </div>
                          </td>

                          {/* Item */}
                          <td style={{ padding: "16px 18px", fontWeight: 700, color: "#0F172A" }}>
                            <div>{itemName}</div>
                            {b.selectedHotel?.name && (
                              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Hotel: {b.selectedHotel.name}</div>
                            )}
                            {b.travelMode && (
                              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Travel: {b.travelMode.toUpperCase()}</div>
                            )}
                          </td>

                          {/* Dates */}
                          <td style={{ padding: "16px 18px", color: "#64748B", fontSize: 12 }}>
                            {isTrip || isHotel ? (
                              <div>{b.checkIn} &rarr; {b.checkOut}</div>
                            ) : (
                              <div>{b.departureDate || b.travelDate} ({b.from} &rarr; {b.to})</div>
                            )}
                          </td>

                          {/* Price */}
                          <td style={{ padding: "16px 18px", color: "#16A34A", fontWeight: 900, fontSize: 14 }}>
                            {b.price || `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`}
                          </td>

                          {/* Payment Status */}
                          <td style={{ padding: "16px 18px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800,
                              background: isPaid ? "#DCFCE7" : "#FEF3C7",
                              color: isPaid ? "#15803D" : "#B45309",
                              border: isPaid ? "1px solid #86EFAC" : "1px solid #FCD34D",
                              display: "inline-flex", alignItems: "center", gap: 5
                            }}>
                              {isPaid ? "✓ PAID" : "⏳ UNPAID"}
                            </span>
                          </td>

                          {/* Booking Status */}
                          <td style={{ padding: "16px 18px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 16, fontSize: 11, fontWeight: 800,
                              background: isConfirmed ? "#DCFCE7" : isPending ? "#FEF3C7" : "#FEE2E2",
                              color: isConfirmed ? "#15803D" : isPending ? "#B45309" : "#DC2626",
                              border: isConfirmed ? "1px solid #86EFAC" : isPending ? "1px solid #FCD34D" : "1px solid #FCA5A5",
                              display: "inline-flex", alignItems: "center", gap: 5
                            }}>
                              {isConfirmed ? <FaCheckCircle size={10} /> : isPending ? <FaClock size={10} /> : <FaTimesCircle size={10} />}
                              {b.status || "Pending"}
                            </span>
                          </td>

                          {/* Razorpay Reference */}
                          <td style={{ padding: "16px 18px", fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>
                            {b.paymentId ? (
                              <div>
                                <div style={{ color: "#2563EB", fontWeight: 700 }}>{b.paymentId}</div>
                                {b.orderId && <div style={{ color: "#94A3B8" }}>{b.orderId}</div>}
                              </div>
                            ) : (
                              <span>N/A</span>
                            )}
                          </td>

                          {/* Action */}
                          <td style={{ padding: "16px 18px", textAlign: "center" }}>
                            {isPending ? (
                              <button
                                onClick={() => handleConfirm(b)}
                                disabled={confirmingId === b._id}
                                style={{
                                  padding: "7px 14px", borderRadius: 8,
                                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                  color: "#FFFFFF", fontWeight: 800, fontSize: 12, border: "none",
                                  cursor: confirmingId === b._id ? "wait" : "pointer",
                                  display: "inline-flex", alignItems: "center", gap: 4
                                }}
                              >
                                <FaCheck size={9} /> {confirmingId === b._id ? "Approving..." : "Approve"}
                              </button>
                            ) : (
                              <span style={{ color: "#64748B", fontSize: 12 }}>—</span>
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
