import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import { QRCodeSVG } from "qrcode.react";
import {
  FaTicketAlt, FaPrint, FaDownload, FaHotel, FaPlane,
  FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaCheckCircle,
  FaArrowLeft, FaSync, FaShieldAlt, FaPhoneAlt, FaEnvelope
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

export default function MyTickets() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    fetchTickets();
  }, [userEmail]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/user/tickets/${userEmail}`);
      setTickets(res.data || []);
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setError("Unable to load digital tickets. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 70, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SharedNavbar activeTab="tickets" />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 60px" }}>
        
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Digital E-Tickets &amp; Passes ({tickets.length})
            </h1>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handlePrint}
              style={{
                background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 10,
                padding: "8px 16px", color: "#475569", fontWeight: 800, fontSize: 12,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <FaPrint /> Print Tickets
            </button>
            <button
              onClick={fetchTickets}
              style={{
                background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10,
                padding: "8px 14px", color: "#2563EB", fontWeight: 700, fontSize: 12,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "50px", textAlign: "center", border: "1px solid #E2E8F0", margin: "20px 0" }}>
            <FaSync className="fa-spin" style={{ fontSize: 32, color: "#2563EB", marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#475569" }}>Loading your verified digital passes...</div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: "16px 20px", color: "#B91C1C", fontWeight: 600, margin: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchTickets} style={{ background: "#B91C1C", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && tickets.length === 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "60px 20px", textAlign: "center", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎟️</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              No tickets available yet
            </h3>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Confirm a destination trip or luxury hotel reservation to generate your official verified ticket and QR pass.
            </p>
            <button
              onClick={() => navigate("/search?tab=places")}
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                border: "none", padding: "10px 24px", borderRadius: 12, fontWeight: 800,
                fontSize: 13, cursor: "pointer"
              }}
            >
              Explore Experiences
            </button>
          </div>
        )}

        {/* Tickets Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {tickets.map((t) => (
            <div
              key={t.ticketId || t.bookingId}
              style={{
                background: "#FFFFFF", borderRadius: 24, border: "1px solid #E2E8F0",
                overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
                display: "grid", gridTemplateColumns: "1fr 220px"
              }}
            >
              {/* Left Passenger & Trip Details */}
              <div style={{ padding: "28px" }}>
                
                {/* Branding & Status Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563EB", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      ✈️
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: "#0F172A", letterSpacing: "-0.3px" }}>TravelAI Tourism</div>
                      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Official Digital Boarding Pass</div>
                    </div>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 20, background: "#ECFDF5", color: "#059669" }}>
                    ✓ CONFIRMED PASS
                  </span>
                </div>

                {/* Destination / Hotel Title */}
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                  {t.title}
                </h2>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>
                  📍 {t.hotelAddress || t.destination}
                </div>

                {/* 2x2 Metadata Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#F8FAFC", padding: "16px", borderRadius: 16, border: "1px solid #E2E8F0", fontSize: 12 }}>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>PASSENGER</div>
                    <strong style={{ color: "#0F172A" }}>{t.passengerName}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>TRAVEL DATES</div>
                    <strong style={{ color: "#0F172A" }}>{t.checkInDate}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>ACCOMMODATION / ROOM</div>
                    <strong style={{ color: "#0F172A" }}>{t.roomType || "Standard Suite"}</strong>
                  </div>
                  <div>
                    <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>GUESTS</div>
                    <strong style={{ color: "#0F172A" }}>{t.guests} Adults</strong>
                  </div>
                </div>

                {/* Important Instructions Footer */}
                <div style={{ marginTop: 14, fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>
                  ⚠️ Please present this digital pass and a valid government ID upon arrival. 24/7 Support: support@travelai.com
                </div>
              </div>

              {/* Right QR Stub */}
              <div style={{
                background: "#F8FAFC", borderLeft: "2px dashed #CBD5E1",
                padding: "24px 20px", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "space-between", textAlign: "center"
              }}>
                <div style={{ width: "100%" }}>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>
                    TICKET NUMBER
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#2563EB", fontFamily: "monospace", margin: "2px 0 14px" }}>
                    #{t.ticketId}
                  </div>
                </div>

                {/* Dynamic Unique QR Code */}
                <div style={{ background: "#FFFFFF", padding: "10px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <QRCodeSVG
                    value={t.qrCodeData || JSON.stringify({ ticketId: t.ticketId, bookingId: t.bookingId })}
                    size={110}
                    level="H"
                  />
                </div>

                <div style={{ width: "100%", marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#059669" }}>
                    {t.totalAmount} (PAID)
                  </div>
                  <button
                    onClick={handlePrint}
                    style={{
                      width: "100%", marginTop: 8, padding: "7px 0", borderRadius: 8,
                      border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569",
                      fontWeight: 800, fontSize: 11, cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: 4
                    }}
                  >
                    <FaPrint /> Print Pass
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
