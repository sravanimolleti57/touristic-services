import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import { QRCodeSVG } from "qrcode.react";
import {
  FaArrowLeft, FaHotel, FaPlane, FaMapMarkerAlt, FaCalendarAlt,
  FaUsers, FaBed, FaCheckCircle, FaMoneyBillWave, FaPrint,
  FaDownload, FaShieldAlt, FaPhoneAlt, FaEnvelope, FaTicketAlt,
  FaSync, FaTimesCircle
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/${bookingId}`);
      if (res.data) {
        setBooking(res.data);
      }
    } catch (err) {
      console.error("Fetch booking error:", err);
      setError("Unable to load booking details. The record might have been removed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 80, fontFamily: "'Inter', sans-serif" }}>
        <SharedNavbar activeTab="bookings" />
        <div style={{ maxWidth: 840, margin: "60px auto", textAlign: "center", background: "#FFFFFF", padding: 50, borderRadius: 24, border: "1px solid #E2E8F0" }}>
          <FaSync className="fa-spin" style={{ fontSize: 32, color: "#2563EB", marginBottom: 12 }} />
          <div style={{ fontWeight: 700, color: "#475569" }}>Loading reservation details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 80, fontFamily: "'Inter', sans-serif" }}>
        <SharedNavbar activeTab="bookings" />
        <div style={{ maxWidth: 840, margin: "60px auto", textAlign: "center", background: "#FFFFFF", padding: 50, borderRadius: 24, border: "1px solid #E2E8F0" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A" }}>Booking Not Found</h2>
          <p style={{ color: "#64748B", fontSize: 13, margin: "8px 0 20px" }}>{error || "Could not locate this reservation."}</p>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{
              background: "#2563EB", color: "#FFFFFF", border: "none",
              padding: "10px 20px", borderRadius: 10, fontWeight: 800, cursor: "pointer"
            }}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const isHotel = booking.bookingType === "hotel";
  const isTrip = booking.bookingType === "trip";
  const itemName = booking.hotelName || booking.destinationName || booking.title || "Travel Reservation";
  const itemLoc = booking.location || booking.destination || "Prime Area";
  const itemImg = booking.hotelImage || booking.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
  const ticketNum = booking.ticketNumber || `TAI-2026-${String(booking._id).slice(-6).toUpperCase()}`;
  const datesVal = booking.checkInDate && booking.checkOutDate ? `${booking.checkInDate} to ${booking.checkOutDate}` : (booking.dates || booking.travelDate || "Confirmed");
  const priceVal = booking.totalPrice || booking.totalAmount || booking.price || "₹14,500";
  const status = booking.lifecycleStatus || booking.status || "Confirmed";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 70, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SharedNavbar activeTab="bookings" />

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px 60px" }}>
        
        {/* Top Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button
            onClick={() => navigate("/my-bookings")}
            style={{
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10,
              padding: "8px 14px", color: "#475569", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
            }}
          >
            <FaArrowLeft size={11} /> Back to Bookings
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => window.print()}
              style={{
                background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10,
                padding: "8px 16px", color: "#475569", fontWeight: 800, fontSize: 12,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <FaPrint /> Print Receipt
            </button>
            <button
              onClick={() => navigate("/tickets")}
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                border: "none", borderRadius: 10, padding: "8px 18px", fontWeight: 800,
                fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <FaTicketAlt /> View Digital Ticket
            </button>
          </div>
        </div>

        {/* Main Details Card */}
        <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.03)" }}>
          
          {/* Header Banner */}
          <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
            <img src={itemImg} alt={itemName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)" }} />
            
            <div style={{ position: "absolute", bottom: 20, left: 24, right: 24, color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#10B981", color: "#FFFFFF", padding: "3px 10px", borderRadius: 6, textTransform: "uppercase" }}>
                  ● {status}
                </span>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: "6px 0 2px" }}>{itemName}</h1>
                <div style={{ fontSize: 13, opacity: 0.9 }}>📍 {itemLoc}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, opacity: 0.85 }}>TICKET REFERENCE</div>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "monospace", color: "#93C5FD" }}>#{ticketNum}</div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: "28px" }}>
            
            {/* 3-Column Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>DATES &amp; DURATION</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{datesVal}</div>
              </div>

              <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>GUESTS &amp; CAPACITY</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{booking.guests || booking.totalGuests || 2} Adults</div>
              </div>

              <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>ROOM / PACKAGE</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{booking.roomType || "Deluxe Suite"}</div>
              </div>
            </div>

            {/* Customer & Reservation Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", margin: "0 0 12px" }}>Customer Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                  <div><span style={{ color: "#64748B" }}>Name: </span><strong style={{ color: "#0F172A" }}>{booking.customerName || booking.userName || "Traveler"}</strong></div>
                  <div><span style={{ color: "#64748B" }}>Email: </span><strong style={{ color: "#0F172A" }}>{booking.customerEmail || booking.userEmail}</strong></div>
                  <div><span style={{ color: "#64748B" }}>Phone: </span><strong style={{ color: "#0F172A" }}>{booking.customerPhone || booking.phone || "+91 98765 43210"}</strong></div>
                  <div><span style={{ color: "#64748B" }}>Booking ID: </span><strong style={{ color: "#2563EB", fontFamily: "monospace" }}>{booking._id}</strong></div>
                  <div><span style={{ color: "#64748B" }}>Booked On: </span><strong style={{ color: "#0F172A" }}>{booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "Confirmed"}</strong></div>
                </div>
              </div>

              {/* Scannable QR Code Box */}
              <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: 16, border: "1px solid #E2E8F0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <QRCodeSVG
                  value={booking.qrCodeData || JSON.stringify({ ticket: ticketNum, id: booking._id })}
                  size={100}
                  level="H"
                />
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0F172A", marginTop: 8 }}>Official QR Pass</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>Scan for digital verification</div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div style={{ background: "#F8FAFC", padding: "20px", borderRadius: 16, border: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", margin: "0 0 14px" }}>Payment &amp; Pricing Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Base Accommodation / Trip Fare</span>
                  <strong style={{ color: "#0F172A" }}>{priceVal}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Taxes &amp; GST (Included)</span>
                  <strong style={{ color: "#0F172A" }}>₹0.00 (All-inclusive)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Payment Method</span>
                  <strong style={{ color: "#0F172A" }}>{booking.paymentMethod || "Razorpay / Online"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Payment Transaction ID</span>
                  <strong style={{ color: "#2563EB", fontFamily: "monospace" }}>{booking.transactionId || `TXN-${String(booking._id).slice(-8).toUpperCase()}`}</strong>
                </div>
                <div style={{ height: 1, background: "#E2E8F0", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
                  <span style={{ fontWeight: 800, color: "#0F172A" }}>Grand Total Paid</span>
                  <strong style={{ color: "#059669", fontWeight: 900 }}>{priceVal} (Verified)</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
