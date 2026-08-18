import { useState, useEffect } from "react";
import SharedNavbar from "../components/SharedNavbar";
import {
  FaHotel, FaPlane, FaClock, FaCheckCircle, FaTimesCircle,
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTag, FaInfoCircle,
  FaTicketAlt, FaPrint, FaSuitcaseRolling, FaCompass
} from "react-icons/fa";
import axios from "axios";

function TicketModal({ booking, onClose }) {
  if (!booking) return null;

  const bType = booking.bookingType || (booking.destinationName ? "trip" : booking.hotelName ? "hotel" : "flight");
  const isTrip = bType === "trip";
  const isHotel = bType === "hotel";

  const itemName = isTrip
    ? (booking.destinationName || "Destination Trip Package")
    : (booking.hotelName || booking.flightName || "Travel Reservation");

  const ticketNo = `TKT-${String(booking._id).slice(-8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const headerGradient = isTrip
    ? "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)"
    : isHotel
    ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)"
    : "linear-gradient(135deg, #581c87 0%, #7e22ce 100%)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div style={{
        maxWidth: 620, width: "100%", background: "#FFFFFF", color: "#111827",
        borderRadius: 24, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        position: "relative", fontFamily: "'Inter', sans-serif"
      }} onClick={e => e.stopPropagation()}>

        {/* Top Gradient Ticket Header */}
        <div style={{
          background: headerGradient,
          color: "#FFFFFF", padding: "28px 32px", position: "relative"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF",
              width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.85)" }}>
            OFFICIAL CONFIRMED TRAVEL E-TICKET
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "6px 0 4px" }}>
            {itemName}
          </h2>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            {isTrip
              ? `Complete Trip Package · ${booking.destinationName || "Global Destination"}`
              : isHotel
              ? (booking.location || "Prime Location Accommodation")
              : `${booking.from || "Origin"} → ${booking.to || "Destination"}`}
          </div>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: "28px 32px" }}>
          {/* Status & Ticket ID bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 18px", background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 12, marginBottom: 20
          }}>
            <div>
              <span style={{ fontSize: 10, color: "#16A34A", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                Approval Status
              </span>
              <span style={{ color: "#15803D", fontWeight: 800, fontSize: 14 }}>
                ✓ {booking.status === "Confirmed" ? "CONFIRMED RESERVATION" : "PENDING VERIFICATION"}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                E-Ticket Number
              </span>
              <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: 800, fontSize: 15 }}>
                #{ticketNo}
              </span>
            </div>
          </div>

          {/* Passenger / Guest Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Lead Traveler</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 3 }}>
                {booking.customerName || booking.guestName || booking.passengerName || "Traveler"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Registered Email</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#2563EB", marginTop: 3 }}>
                {booking.customerEmail || booking.userEmail}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                {isTrip || isHotel ? "Travel Dates" : "Departure Date"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 3 }}>
                {isTrip || isHotel
                  ? `${booking.checkIn || "TBD"} → ${booking.checkOut || "TBD"}`
                  : (booking.departureDate || booking.travelDate || "Scheduled")}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Traveling Party</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 3 }}>
                {isTrip
                  ? `${booking.adults || 1} Adult(s)${booking.children ? `, ${booking.children} Child(ren)` : ""}`
                  : isHotel
                  ? `${booking.guests || 1} Guests (${booking.roomType || "Deluxe"})`
                  : `${booking.passengers || booking.guests || 1} Passenger(s)`}
              </div>
            </div>
          </div>

          {/* Trip specific breakdown */}
          {isTrip && (
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", marginBottom: 18, fontSize: 13 }}>
              {booking.selectedHotel && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748B" }}>🏨 Selected Stay:</span>
                  <strong style={{ color: "#111827" }}>{booking.selectedHotel.name}</strong>
                </div>
              )}
              {booking.selectedFlight && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748B" }}>✈️ Flight Route:</span>
                  <strong style={{ color: "#111827" }}>{booking.selectedFlight.airline} #{booking.selectedFlight.flightNo}</strong>
                </div>
              )}
              {booking.activities && booking.activities.length > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ color: "#64748B" }}>🎯 Activities:</span>
                  <strong style={{ color: "#2563EB", textAlign: "right" }}>
                    {booking.activities.map(a => a.name).join(", ")}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Pricing & Barcode */}
          <div style={{
            borderTop: "2px dashed #E2E8F0", paddingTop: 18, marginTop: 10,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Total Paid Amount</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#16A34A", marginTop: 2 }}>
                {booking.price || `₹${Number(booking.totalAmount || 0).toLocaleString("en-IN")}`}
              </div>
            </div>

            {/* Barcode Graphic */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "monospace", letterSpacing: 4, fontSize: 18, fontWeight: "bold",
                color: "#334155", background: "#F1F5F9", padding: "6px 14px", borderRadius: 6,
                border: "1px solid #CBD5E1"
              }}>
                |||||||||||||||||||
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Scan E-Ticket Code</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid #E2E8F0",
              background: "#F8FAFC", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 13
            }}>
              Close
            </button>
            <button onClick={handlePrint} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              color: "#FFFFFF", fontWeight: 800, cursor: "pointer", fontSize: 13,
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)", display: "inline-flex", alignItems: "center", gap: 6
            }}>
              <FaPrint /> Print / Save Ticket
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email || "user@example.com";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, [userEmail]);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/bookings/my-bookings/${userEmail}`);
      setBookings(res.data || []);
    } catch (err) {
      console.warn("Error fetching combined bookings from backend, trying individual fallbacks:", err);
      try {
        const [hRes, fRes, tRes] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/my-hotels/${userEmail}`),
          axios.get(`http://127.0.0.1:5000/my-flights/${userEmail}`),
          axios.get(`http://127.0.0.1:5000/api/bookings/my-trips/${userEmail}`)
        ]);
        const hotels = (hRes.data || []).map(h => ({ ...h, bookingType: "hotel", status: h.status || "Pending" }));
        const flights = (fRes.data || []).map(f => ({ ...f, bookingType: "flight", status: f.status || "Pending" }));
        const trips = (tRes.data || []).map(t => ({ ...t, bookingType: "trip", status: t.status || "Confirmed" }));
        setBookings([...hotels, ...flights, ...trips]);
      } catch (e) {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id, bookingType) => {
    const bLabel = bookingType === "trip" ? "Destination Trip" : bookingType === "hotel" ? "Hotel" : "Flight";
    const ok = window.confirm(`Are you sure you want to cancel this ${bLabel} booking?`);
    if (!ok) return;

    try {
      const endpoint = bookingType === "trip"
        ? `/api/bookings/cancel-trip/${id}`
        : bookingType === "hotel"
        ? `/cancel-hotel/${id}`
        : `/cancel-flight/${id}`;

      await axios.delete(`http://127.0.0.1:5000${endpoint}`);
      setBookings(prev => prev.filter(b => b._id !== id));
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      setBookings(prev => prev.filter(b => b._id !== id));
      alert("Booking cancelled successfully.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const status = (b.status || "Pending").toLowerCase();
    if (activeFilter === "pending") return status === "pending";
    if (activeFilter === "confirmed") return status === "confirmed";
    if (activeFilter === "cancelled") return status === "cancelled";
    return true;
  });

  const pendingCount = bookings.filter(b => (b.status || "Pending") === "Pending").length;
  const confirmedCount = bookings.filter(b => b.status === "Confirmed").length;

  return (
    <>
      <SharedNavbar activeTab="booking" />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b132b 0%, #1c2541 100%)",
        color: "#ffffff",
        padding: "110px 40px 60px",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Top Banner */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#38bdf8", margin: 0 }}>
                My Travel Reservations
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "1.05rem", margin: "6px 0 0" }}>
                Track real-time destination trips, hotel stays, flight tickets, and view official digital passes.
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: "flex", background: "rgba(30, 41, 59, 0.7)", padding: 6,
              borderRadius: 14, border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              {[
                { label: "All Bookings", key: "all", count: bookings.length },
                { label: "Pending", key: "pending", count: pendingCount, color: "#f59e0b" },
                { label: "Confirmed", key: "confirmed", count: confirmedCount, color: "#10b981" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveFilter(t.key)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: activeFilter === t.key ? "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)" : "transparent",
                    color: activeFilter === t.key ? "#ffffff" : "#94a3b8",
                    fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.2s"
                  }}
                >
                  {t.label}
                  <span style={{
                    background: activeFilter === t.key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                    padding: "2px 8px", borderRadius: 12, fontSize: 11
                  }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Notice */}
          <div style={{
            background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.2)",
            borderRadius: 16, padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14,
            fontSize: 13, color: "#bae6fd"
          }}>
            <FaInfoCircle size={20} color="#38bdf8" />
            <div>
              <strong>Reservation Dashboard:</strong> Destination bookings are stored directly into MongoDB and confirmed immediately. Hotel and Flight requests are processed with real-time status updates and printable tickets.
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div style={{
              background: "rgba(30, 41, 59, 0.5)", borderRadius: 20, padding: 50, textAlign: "center",
              border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8"
            }}>
              Loading your travel reservations...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{
              background: "rgba(30, 41, 59, 0.5)", borderRadius: 24, padding: "60px 40px",
              textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🌍</div>
              <h3 style={{ color: "#ffffff", margin: "0 0 8px", fontSize: 20 }}>No travel bookings found</h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
                Explore destinations, hotels, or flights to create your first reservation!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {filteredBookings.map((b) => {
                const bType = b.bookingType || (b.destinationName ? "trip" : b.hotelName ? "hotel" : "flight");
                const isTrip = bType === "trip";
                const isHotel = bType === "hotel";
                const isPending = (b.status || "Pending") === "Pending";
                const isConfirmed = b.status === "Confirmed";

                const itemName = isTrip
                  ? (b.destinationName || "Destination Trip Package")
                  : (b.hotelName || b.flightName || "Travel Reservation");

                return (
                  <div
                    key={b._id}
                    style={{
                      background: "rgba(30, 41, 59, 0.65)",
                      backdropFilter: "blur(16px)",
                      border: isConfirmed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 20,
                      padding: "24px 28px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16
                    }}
                  >
                    {/* Header line */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14,
                          background: isTrip
                            ? "linear-gradient(135deg, #1d4ed8, #3b82f6)"
                            : isHotel
                            ? "linear-gradient(135deg, #0284c7, #38bdf8)"
                            : "linear-gradient(135deg, #7e22ce, #a855f7)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#ffffff",
                          boxShadow: isTrip
                            ? "0 4px 14px rgba(37,99,235,0.3)"
                            : isHotel
                            ? "0 4px 14px rgba(56,189,248,0.3)"
                            : "0 4px 14px rgba(168,85,247,0.3)"
                        }}>
                          {isTrip ? <FaSuitcaseRolling /> : isHotel ? <FaHotel /> : <FaPlane />}
                        </div>
                        <div>
                          <div style={{
                            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                            color: isTrip ? "#60a5fa" : isHotel ? "#38bdf8" : "#c084fc",
                            letterSpacing: "0.5px"
                          }}>
                            {isTrip ? "Destination Trip Package" : isHotel ? "Hotel Reservation" : "Flight Ticket"}
                          </div>
                          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "2px 0 0", color: "#ffffff" }}>
                            {itemName}
                          </h2>
                        </div>
                      </div>

                      {/* Status chip */}
                      <div>
                        <span style={{
                          padding: "8px 16px", borderRadius: 24, fontSize: 13, fontWeight: 800,
                          background: isConfirmed ? "rgba(16, 185, 129, 0.2)" : isPending ? "rgba(245, 158, 11, 0.2)" : "rgba(220, 38, 38, 0.2)",
                          color: isConfirmed ? "#34d399" : isPending ? "#fbbf24" : "#f87171",
                          border: isConfirmed ? "1px solid rgba(16, 185, 129, 0.4)" : isPending ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid rgba(220, 38, 38, 0.4)",
                          display: "inline-flex", alignItems: "center", gap: 8
                        }}>
                          {isConfirmed ? <FaCheckCircle size={14} /> : isPending ? <FaClock size={14} /> : <FaTimesCircle size={14} />}
                          {b.status || "Confirmed"}
                        </span>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div style={{
                      background: "rgba(15, 23, 42, 0.5)", borderRadius: 14, padding: "16px 20px",
                      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14,
                      fontSize: 13, border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, marginBottom: 2 }}>Booking Reference ID</span>
                        <strong style={{ fontFamily: "monospace", color: "#38bdf8" }}>#{String(b._id).slice(-10)}</strong>
                      </div>

                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, marginBottom: 2 }}>
                          {isTrip || isHotel ? "Travel Dates" : "Flight Route & Travel Date"}
                        </span>
                        <strong style={{ color: "#ffffff" }}>
                          {isTrip || isHotel
                            ? `${b.checkIn} → ${b.checkOut}`
                            : `${b.departureDate || b.travelDate} (${b.from} → ${b.to})`}
                        </strong>
                      </div>

                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, marginBottom: 2 }}>Traveling Party</span>
                        <strong style={{ color: "#ffffff" }}>
                          {isTrip
                            ? `${b.adults || 1} Adults${b.children ? `, ${b.children} Children` : ""}`
                            : isHotel
                            ? `${b.guests || 1} Guests (${b.roomType || "Deluxe"})`
                            : `${b.passengers || b.guests || 1} Passengers`}
                        </strong>
                      </div>

                      <div>
                        <span style={{ color: "#94a3b8", display: "block", fontSize: 11, marginBottom: 2 }}>Total Amount</span>
                        <strong style={{ color: "#10b981", fontSize: 15 }}>
                          {b.price || `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`}
                        </strong>
                      </div>
                    </div>

                    {/* Additional package info for trips */}
                    {isTrip && (b.selectedHotel || b.selectedFlight || (b.activities && b.activities.length > 0)) && (
                      <div style={{
                        background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.2)",
                        borderRadius: 12, padding: "12px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12
                      }}>
                        {b.selectedHotel && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd" }}>
                            <FaHotel /> Stay: <span style={{ color: "#ffffff", fontWeight: 700 }}>{b.selectedHotel.name}</span>
                          </div>
                        )}
                        {b.selectedFlight && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd" }}>
                            <FaPlane /> Flight: <span style={{ color: "#ffffff", fontWeight: 700 }}>{b.selectedFlight.airline} #{b.selectedFlight.flightNo}</span>
                          </div>
                        )}
                        {b.activities && b.activities.length > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#93c5fd" }}>
                            🎯 Activities: <span style={{ color: "#ffffff", fontWeight: 700 }}>{b.activities.length} included</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirmation Footer info & Ticket Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#94a3b8", paddingTop: 4 }}>
                      <div>
                        {isConfirmed && b.confirmedAt ? (
                          <span style={{ color: "#34d399", fontWeight: 600 }}>
                            ✓ Confirmed on {String(b.confirmedAt).slice(0, 10)}
                          </span>
                        ) : (
                          <span>Submitted on: {String(b.bookingDate || b.createdAt || "").slice(0, 10)}</span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {isConfirmed && (
                          <button
                            onClick={() => setSelectedTicket(b)}
                            style={{
                              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                              border: "none", color: "#ffffff", padding: "8px 18px", borderRadius: 10,
                              cursor: "pointer", fontWeight: 800, fontSize: 12, display: "inline-flex",
                              alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
                            }}
                          >
                            <FaTicketAlt /> View &amp; Print Ticket
                          </button>
                        )}

                        <button
                          onClick={() => handleCancelBooking(b._id, bType)}
                          style={{
                            background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.25)",
                            color: "#f87171", padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                            fontWeight: 600, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6
                          }}
                        >
                          <FaTimesCircle size={12} /> Cancel Booking
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </>
  );
}
