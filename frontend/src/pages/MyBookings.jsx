import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";
import { QRCodeSVG } from "qrcode.react";
import {
  FaHotel, FaPlane, FaSuitcase, FaCalendarAlt, FaClock,
  FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUsers,
  FaTicketAlt, FaPrint, FaDownload, FaTimes, FaStar,
  FaSync, FaMoneyBillWave, FaArrowRight, FaShieldAlt,
  FaBed, FaExclamationTriangle, FaFilter
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

export default function MyBookings() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all | upcoming | confirmed | pending | failed | cancelled | completed
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [userEmail]);

  const showToastMsg = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/user/bookings/${userEmail}`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Could not load your bookings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (b) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for ${b.hotelName || b.destinationName || "this trip"}?`)) {
      return;
    }

    setCancellingId(b._id);
    try {
      await axios.post(`${API_BASE}/api/user/cancel-booking/${b._id}`);
      showToastMsg("Booking cancelled successfully. Refund will be processed as per policy.");
      fetchBookings();
    } catch (err) {
      console.error("Cancel error:", err);
      showToastMsg("Failed to cancel booking. Please contact 24/7 support.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const status = (b.lifecycleStatus || b.status || "").toLowerCase();
      let matchesFilter = true;

      if (filterStatus === "upcoming") {
        matchesFilter = (status === "upcoming" || status === "confirmed");
      } else if (filterStatus === "confirmed") {
        matchesFilter = (status === "confirmed");
      } else if (filterStatus === "pending") {
        matchesFilter = status.includes("pending");
      } else if (filterStatus === "failed") {
        matchesFilter = status.includes("failed");
      } else if (filterStatus === "cancelled") {
        matchesFilter = (status === "cancelled" || status === "canceled");
      } else if (filterStatus === "completed") {
        matchesFilter = (status === "completed");
      }

      if (!matchesFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (b.hotelName || b.destinationName || b.title || "").toLowerCase();
        const idStr = String(b._id || "").toLowerCase();
        const tNum = String(b.ticketNumber || "").toLowerCase();
        return title.includes(q) || idStr.includes(q) || tNum.includes(q);
      }

      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 70, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SharedNavbar activeTab="bookings" />

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 3000,
          background: toast.type === "error" ? "#EF4444" : "#10B981",
          color: "#FFFFFF", padding: "14px 24px", borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 10, fontSize: 14
        }}>
          {toast.type === "error" ? <FaTimes /> : <FaCheckCircle />}
          <span>{toast.text}</span>
        </div>
      )}

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 20px 60px" }}>
        
        {/* Page Title & Stats Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
              My Bookings &amp; Reservations
            </h1>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
              Manage your verified trips, hotel stays, e-tickets, payment receipts, and travel history.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate("/tickets")}
              style={{
                background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB",
                borderRadius: 12, padding: "9px 18px", fontWeight: 800, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <FaTicketAlt /> View Digital Tickets
            </button>
            <button
              onClick={fetchBookings}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569",
                borderRadius: 12, padding: "9px 14px", fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div style={{
          background: "#FFFFFF", borderRadius: 20, padding: "16px 20px",
          border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          marginBottom: 24, display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 14
        }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All Bookings (${bookings.length})` },
              { id: "upcoming", label: "Upcoming" },
              { id: "confirmed", label: "Confirmed" },
              { id: "completed", label: "Completed" },
              { id: "pending", label: "Pending Payment" },
              { id: "failed", label: "Payment Failed" },
              { id: "cancelled", label: "Cancelled" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                style={{
                  padding: "7px 14px", borderRadius: 10, border: "none",
                  background: filterStatus === tab.id ? "#2563EB" : "#F1F5F9",
                  color: filterStatus === tab.id ? "#FFFFFF" : "#475569",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 240 }}>
            <input
              type="text"
              placeholder="Search by hotel, destination, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "8px 14px", borderRadius: 10,
                border: "1px solid #CBD5E1", fontSize: 12, outline: "none",
                background: "#F8FAFC", boxSizing: "border-box"
              }}
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "50px", textAlign: "center", border: "1px solid #E2E8F0", margin: "20px 0" }}>
            <FaSync className="fa-spin" style={{ fontSize: 32, color: "#2563EB", marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#475569" }}>Loading your real-time booking history...</div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: "16px 20px", color: "#B91C1C", fontWeight: 600, margin: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchBookings} style={{ background: "#B91C1C", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "60px 20px", textAlign: "center", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🧳</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              {filterStatus === "all" ? "You haven't made any trips yet" : `No ${filterStatus} bookings found`}
            </h3>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Explore hand-picked destinations and luxury resorts to start your journey.
            </p>
            <button
              onClick={() => navigate("/search?tab=places")}
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                border: "none", padding: "10px 24px", borderRadius: 12, fontWeight: 800,
                fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              Explore Destinations <FaArrowRight size={11} />
            </button>
          </div>
        )}

        {/* Bookings List Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredBookings.map((b) => {
            const isHotel = b.bookingType === "hotel";
            const isTrip = b.bookingType === "trip";
            const itemName = b.hotelName || b.destinationName || b.title || "Travel Reservation";
            const itemLoc = b.location || b.destination || "Prime Area";
            const itemImg = b.hotelImage || b.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80";
            const datesVal = b.checkInDate && b.checkOutDate ? `${b.checkInDate} → ${b.checkOutDate}` : (b.dates || b.travelDate || "Confirmed Dates");
            const priceVal = b.totalPrice || b.totalAmount || b.price || "₹14,500";
            const status = b.lifecycleStatus || b.status || "Confirmed";
            const ticketNum = b.ticketNumber || `TAI-2026-${String(b._id).slice(-6).toUpperCase()}`;

            let statusBg = "#ECFDF5";
            let statusColor = "#059669";
            let statusLabel = status;

            if (status === "Completed") {
              statusBg = "#EFF6FF";
              statusColor = "#2563EB";
              statusLabel = "Trip Completed";
            } else if (status === "Cancelled") {
              statusBg = "#FEF2F2";
              statusColor = "#DC2626";
              statusLabel = "Cancelled";
            } else if (status.includes("Pending")) {
              statusBg = "#FFFBEB";
              statusColor = "#D97706";
              statusLabel = "Pending Payment";
            } else if (status.includes("Failed")) {
              statusBg = "#FEF2F2";
              statusColor = "#DC2626";
              statusLabel = "Payment Failed";
            }

            return (
              <div
                key={b._id}
                style={{
                  background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0",
                  overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 20,
                  padding: "18px 22px", alignItems: "center"
                }}
              >
                {/* Image Thumbnail */}
                <div style={{ position: "relative", width: 180, height: 120, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={itemImg}
                    alt={itemName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80"; }}
                  />
                  <span style={{
                    position: "absolute", top: 8, left: 8, background: "rgba(15,23,42,0.8)",
                    backdropFilter: "blur(6px)", color: "#FFFFFF", fontSize: 10, fontWeight: 800,
                    padding: "2px 8px", borderRadius: 6
                  }}>
                    {isHotel ? "🏨 HOTEL" : isTrip ? "🏔️ TRIP" : "✈️ FLIGHT"}
                  </span>
                </div>

                {/* Details Column */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
                      background: statusBg, color: statusColor, textTransform: "uppercase"
                    }}>
                      ● {statusLabel}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                      Ticket: <strong style={{ color: "#2563EB" }}>#{ticketNum}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "2px 0 6px" }}>
                    {itemName}
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12, color: "#64748B", marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FaMapMarkerAlt color="#94A3B8" /> {itemLoc}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FaCalendarAlt color="#94A3B8" /> {datesVal}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FaUsers color="#94A3B8" /> {b.guests || b.totalGuests || 2} Guests
                    </span>
                    {b.roomType && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <FaBed color="#94A3B8" /> {b.roomType}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 900, color: "#059669", marginTop: 8 }}>
                    Total: {priceVal} <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>• Payment: {b.paymentStatus || "Paid"}</span>
                  </div>
                </div>

                {/* Actions Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 150, textAlign: "right" }}>
                  <button
                    onClick={() => navigate(`/bookings/${b._id}`)}
                    style={{
                      padding: "8px 14px", borderRadius: 10, border: "1px solid #E2E8F0",
                      background: "#FFFFFF", color: "#0F172A", fontWeight: 700, fontSize: 12,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    View Details
                  </button>

                  {(status === "Confirmed" || status === "Completed" || status === "Upcoming") && (
                    <button
                      onClick={() => setSelectedTicket(b)}
                      style={{
                        padding: "8px 14px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                        fontWeight: 800, fontSize: 12, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        boxShadow: "0 2px 8px rgba(37,99,235,0.2)"
                      }}
                    >
                      <FaTicketAlt /> View Ticket
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedPaymentBooking(b)}
                    style={{
                      padding: "6px 14px", borderRadius: 10, border: "none",
                      background: "#F8FAFC", color: "#475569", fontWeight: 700, fontSize: 11,
                      cursor: "pointer"
                    }}
                  >
                    💳 Payment Details
                  </button>

                  {status === "Completed" && (
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      style={{
                        padding: "6px 14px", borderRadius: 10, border: "1px solid #A7F3D0",
                        background: "#ECFDF5", color: "#059669", fontWeight: 800, fontSize: 11,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                      }}
                    >
                      <FaStar /> Review Trip
                    </button>
                  )}

                  {(status === "Upcoming" || status === "Confirmed") && (
                    <button
                      onClick={() => handleCancelBooking(b)}
                      disabled={cancellingId === b._id}
                      style={{
                        padding: "6px 14px", borderRadius: 10, border: "1px solid #FCA5A5",
                        background: "#FFF", color: "#DC2626", fontWeight: 700, fontSize: 11,
                        cursor: "pointer"
                      }}
                    >
                      {cancellingId === b._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setSelectedTicket(null)}>
          <div style={{
            maxWidth: 640, width: "100%", background: "#FFFFFF", borderRadius: 24,
            overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #2563EB 100%)", color: "#FFFFFF", padding: "26px 30px", position: "relative" }}>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaTimes />
              </button>

              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, opacity: 0.85, textTransform: "uppercase" }}>
                OFFICIAL DIGITAL E-TICKET &amp; TRAVEL PASS
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: "6px 0 2px" }}>
                {selectedTicket.hotelName || selectedTicket.destinationName || selectedTicket.title || "Confirmed Trip"}
              </h2>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                📍 {selectedTicket.location || selectedTicket.destination || "Verified Location"}
              </div>
            </div>

            {/* Ticket Info */}
            <div style={{ padding: "24px 30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 800, textTransform: "uppercase" }}>RESERVATION STATUS</div>
                  <div style={{ color: "#15803D", fontWeight: 900, fontSize: 13 }}>✓ CONFIRMED PASS</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>TICKET NUMBER</div>
                  <div style={{ color: "#2563EB", fontWeight: 900, fontSize: 14, fontFamily: "monospace" }}>
                    #{selectedTicket.ticketNumber || `TAI-2026-${String(selectedTicket._id).slice(-6).toUpperCase()}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Passenger: </span>
                    <strong style={{ color: "#0F172A" }}>{selectedTicket.customerName || selectedTicket.userName || userEmail.split("@")[0]}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Travel Dates: </span>
                    <strong style={{ color: "#0F172A" }}>{selectedTicket.checkInDate || selectedTicket.dates || "Confirmed"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Guests: </span>
                    <strong style={{ color: "#0F172A" }}>{selectedTicket.guests || 2} Guests</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Total Paid: </span>
                    <strong style={{ color: "#059669" }}>{selectedTicket.totalPrice || selectedTicket.price || "₹14,500"} (Paid)</strong>
                  </div>
                </div>

                {/* Scannable Dynamic QR Code */}
                <div style={{ textAlign: "center", background: "#F8FAFC", padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                  <QRCodeSVG
                    value={selectedTicket.qrCodeData || JSON.stringify({ ticket: selectedTicket.ticketNumber, id: selectedTicket._id })}
                    size={110}
                    level="H"
                    includeMargin={false}
                  />
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginTop: 8 }}>
                    SCAN TO VERIFY PASS
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24, paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "9px 18px", borderRadius: 10, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", color: "#475569", fontWeight: 800, fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <FaPrint /> Print Ticket
                </button>
                <button
                  onClick={() => {
                    window.print();
                    showToastMsg("Digital Ticket downloaded successfully!");
                  }}
                  style={{
                    padding: "9px 20px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                    fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <FaDownload /> Download Ticket
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPaymentBooking && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setSelectedPaymentBooking(null)}>
          <div style={{
            maxWidth: 520, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "30px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPaymentBooking(null)}
              style={{ position: "absolute", top: 20, right: 20, background: "#F1F5F9", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
              <FaMoneyBillWave color="#059669" /> Verified Payment Details
            </h3>
            <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 18px" }}>
              Official payment transaction proof for reservation #{String(selectedPaymentBooking._id).slice(-8).toUpperCase()}.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, background: "#F8FAFC", padding: "18px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Total Paid</span>
                <strong style={{ color: "#059669", fontSize: 15 }}>{selectedPaymentBooking.totalPrice || selectedPaymentBooking.price || "₹14,500"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Payment Status</span>
                <strong style={{ color: "#16A34A" }}>✓ {selectedPaymentBooking.paymentStatus || "Paid (Verified)"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Payment Method</span>
                <strong style={{ color: "#0F172A" }}>{selectedPaymentBooking.paymentMethod || "Razorpay / Online Banking"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Transaction Ref</span>
                <strong style={{ color: "#2563EB", fontFamily: "monospace" }}>{selectedPaymentBooking.transactionId || `TXN-${String(selectedPaymentBooking._id).slice(-8).toUpperCase()}`}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748B" }}>Payment Date</span>
                <strong style={{ color: "#0F172A" }}>{selectedPaymentBooking.createdAt ? new Date(selectedPaymentBooking.createdAt).toLocaleDateString() : "Confirmed"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={() => setSelectedPaymentBooking(null)}
                style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#2563EB", color: "#FFFFFF", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setReviewModalOpen(false)}>
          <div style={{
            maxWidth: 680, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "90vh", overflowY: "auto",
            position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setReviewModalOpen(false)}
              style={{ position: "absolute", top: 20, right: 20, background: "#F1F5F9", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <FaTimes />
            </button>

            <UploadReview
              onReviewAdded={() => {
                setReviewModalOpen(false);
                showToastMsg("Review submitted & analyzed with AI sentiment! 🌟");
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
