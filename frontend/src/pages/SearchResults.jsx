import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch, FaPlane, FaMapMarkerAlt,
  FaStar, FaArrowLeft,
  FaHeart, FaRegHeart, FaWifi, FaSwimmingPool, FaDumbbell,
  FaCar, FaUtensils, FaSnowflake,
  FaCalendarAlt, FaUsers, FaTimes,
  FaCheckCircle, FaBed, FaPhone, FaEnvelope, FaUser,
  FaCreditCard, FaLock, FaSuitcase, FaChair,
  FaInfoCircle, FaTicketAlt, FaSatelliteDish, FaSlidersH,
  FaMapMarkedAlt, FaShieldAlt, FaSmile, FaSuitcaseRolling
} from "react-icons/fa";

import { PLACES } from "../data/destinations";
import { FLIGHTS, AIRLINE_META, fetchLiveFlights } from "../data/flights";
import CalendarWidget from "../components/CalendarWidget";
import SharedNavbar from "../components/SharedNavbar";
import "../styles/shared.css";

/**
 * Generates mock availability data for the current + next month.
 * type "hotels" → marks dates where 1-2 hotels are full (red) or a holiday deal (green).
 * type "flights" → marks dates where flights are fully booked (red) or holiday (green).
 * Returns Record<"YYYY-MM-DD", "full" | "holiday">
 */
function generateAvailabilityData(type) {
  const data = {};
  const now = new Date();

  // Deterministic "full" day offsets differ per type so calendars look distinct
  const fullOffsets   = type === "hotels" ? [2, 5, 9, 14, 18, 22, 26] : [1, 4, 8, 13, 17, 21, 25];
  const holidayOffsets = type === "hotels" ? [6, 12, 20, 28]           : [3, 10, 16, 24];

  [-1, 0, 1, 2].forEach((monthDelta) => {
    const base = new Date(now.getFullYear(), now.getMonth() + monthDelta, 1);
    const daysInMonth = new Date(base.getFullYear(), now.getMonth() + 1, 0).getDate();

    fullOffsets.forEach((d) => {
      if (d <= daysInMonth) {
        const key = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        data[key] = "full";
      }
    });

    holidayOffsets.forEach((d) => {
      if (d <= daysInMonth) {
        const key = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        // Don't overwrite a "full" marker
        if (!data[key]) data[key] = "holiday";
      }
    });
  });

  return data;
}

const HOTEL_AVAILABILITY = generateAvailabilityData("hotels");
const FLIGHT_AVAILABILITY = generateAvailabilityData("flights");

const HOTELS = [
  { id: 7, type: "hotel", name: "The Leela Palace", location: "New Delhi, India", rating: 4.9, reviews: 1234, price: "₹28,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 8, type: "hotel", name: "Taj Mahal Palace", location: "Mumbai, India", rating: 4.8, reviews: 3456, price: "₹35,000/night", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "96% Positive" },
  { id: 9, type: "hotel", name: "ITC Grand Chola", location: "Chennai, India", rating: 4.7, reviews: 987, price: "₹22,000/night", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "ac"], sentiment: "94% Positive" },
  { id: 10, type: "hotel", name: "Oberoi Udaivilas", location: "Udaipur, India", rating: 4.9, reviews: 2105, price: "₹55,000/night", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80", amenities: ["wifi", "pool", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 11, type: "hotel", name: "Six Senses Vana", location: "Dehradun, India", rating: 4.8, reviews: 765, price: "₹42,000/night", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant"], sentiment: "97% Positive" },
  { id: 12, type: "hotel", name: "Amanbagh Resort", location: "Alwar, Rajasthan", rating: 4.7, reviews: 543, price: "₹38,000/night", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", amenities: ["wifi", "pool", "parking", "restaurant", "ac"], sentiment: "95% Positive" },
];

const AMENITY_ICONS = { wifi: <FaWifi />, pool: <FaSwimmingPool />, gym: <FaDumbbell />, parking: <FaCar />, restaurant: <FaUtensils />, ac: <FaSnowflake /> };
const AMENITY_LABELS = { wifi: "WiFi", pool: "Pool", gym: "Gym", parking: "Parking", restaurant: "Restaurant", ac: "AC" };

// ── Sub-components ──────────────────────────────────────────────────────────

function Stars({ rating }) {
  return (
    <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <FaStar key={i} size={11} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }} />
      ))}
    </span>
  );
}

function SentimentBadge({ label }) {
  const pct = parseInt(label);
  const color = pct >= 95 ? "#22c55e" : pct >= 90 ? "#3b82f6" : "#f59e0b";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, background: color + "18", padding: "2px 8px", borderRadius: 20, border: `1px solid ${color}40` }}>
      <FaSmile style={{ marginRight: 4 }} /> {label}
    </span>
  );
}

function PlaceCard({ item, wishlist, toggleWishlist, onExplore }) {
  return (
    <div style={S.card}>
      <div style={{ position: "relative" }}>
        <img src={item.img} alt={item.name} style={S.cardImg} onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"; }} />
        <button onClick={() => toggleWishlist(item.id)} style={S.heartBtn}>
          {wishlist.includes(item.id) ? <FaHeart color="#ef4444" /> : <FaRegHeart color="white" />}
        </button>
        <span style={S.catBadge}>{item.category}</span>
      </div>
      <div style={S.cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={S.cardTitle}>{item.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Stars rating={item.rating} />
              <span style={S.ratingText}>{item.rating} ({item.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.price}>{item.price}</div>
            <div style={S.priceLabel}>per person</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {item.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}
        </div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SentimentBadge label={item.sentiment} />
          <button onClick={() => onExplore(item.id)} style={S.actionBtn}>Explore →</button>
        </div>
      </div>
    </div>
  );
}

function HotelCard({ item, wishlist, toggleWishlist, onBook }) {
  return (
    <div style={S.card}>
      <div style={{ position: "relative" }}>
        <img src={item.img} alt={item.name} style={S.cardImg} onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"; }} />
        <button onClick={() => toggleWishlist(item.id)} style={S.heartBtn}>
          {wishlist.includes(item.id) ? <FaHeart color="#ef4444" /> : <FaRegHeart color="white" />}
        </button>
      </div>
      <div style={S.cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={S.cardTitle}>{item.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
              <FaMapMarkerAlt size={10} /> {item.location}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Stars rating={item.rating} />
              <span style={S.ratingText}>{item.rating} ({item.reviews.toLocaleString()})</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.price}>{item.price}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
          {item.amenities.map(a => (
            <span key={a} title={AMENITY_LABELS[a]} style={S.amenity}>{AMENITY_ICONS[a]} {AMENITY_LABELS[a]}</span>
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SentimentBadge label={item.sentiment} />
          <button onClick={() => onBook(item)} style={S.actionBtn}>Book Now →</button>
        </div>
      </div>
    </div>
  );
}

// ── Hotel Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({ hotel, onClose }) {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "",
    checkIn: "", checkOut: "",
    guests: 1, rooms: 1, roomType: "Deluxe",
    specialRequests: "",
    paymentMethod: "card",
    cardNumber: "", cardExpiry: "", cardCvv: "", cardName: "",
    upiId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const update = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === "checkIn" && prev.checkOut && value > prev.checkOut) {
        next.checkOut = "";
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userObj = JSON.parse(localStorage.getItem("user")) || { email: "user@example.com" };
    const userEmail = userObj.email || "user@example.com";
    const storageKey = `bookedHotels_${userEmail}`;
    const savedHotels = JSON.parse(localStorage.getItem(storageKey)) || [];
    const newBooking = {
      id: Date.now(),
      hotelName: hotel.name,
      location: hotel.location,
      price: hotel.price,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      rooms: formData.rooms,
      roomType: formData.roomType,
      guestName: formData.fullName,
    };
    localStorage.setItem(storageKey, JSON.stringify([...savedHotels, newBooking]));
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };
  const labelStyle = { fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600 };
  const iconWrap = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3b82f6", fontSize: 13 };

  if (submitted) {
    return (
      <div style={MS.overlay} onClick={onClose}>
        <div style={MS.modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FaCheckCircle size={56} color="#22c55e" />
            <h2 style={{ color: "white", marginTop: 18, fontSize: 24, fontWeight: 800 }}>Booking Confirmed!</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8, lineHeight: 1.7 }}>
              Your reservation at <strong style={{ color: "#3b82f6" }}>{hotel.name}</strong> has been submitted successfully.
            </p>
            <div style={{ background: "#0f172a", borderRadius: 14, padding: 20, marginTop: 20, textAlign: "left", border: "1px solid #334155" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Guest</div><div style={{ color: "white", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{formData.fullName}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Room Type</div><div style={{ color: "white", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{formData.roomType}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Check-in</div><div style={{ color: "white", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{formData.checkIn || "—"}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Check-out</div><div style={{ color: "white", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{formData.checkOut || "—"}</div></div>
              </div>
            </div>
            <button onClick={onClose} style={{ marginTop: 24, padding: "12px 36px", borderRadius: 10, border: "none", background: "linear-gradient(to right, #3b82f6, #8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={MS.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Hotel Booking</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>{hotel.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#94a3b8", fontSize: 13 }}>
              <FaMapMarkerAlt size={11} /> {hotel.location}
              <span style={{ margin: "0 4px", color: "#334155" }}>·</span>
              <span style={{ color: "#3b82f6", fontWeight: 700 }}>{hotel.price}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#334155", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Personal Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ position: "relative" }}>
                <FaUser style={{ ...iconWrap }} />
                <input required value={formData.fullName} onChange={e => update("fullName", e.target.value)} placeholder="John Doe" style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <div style={{ position: "relative" }}>
                <FaEnvelope style={{ ...iconWrap }} />
                <input required type="email" value={formData.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Phone Number *</label>
              <div style={{ position: "relative" }}>
                <FaPhone style={{ ...iconWrap }} />
                <input required type="tel" value={formData.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 9876543210" style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Stay Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Check-in Date *</label>
              <input required type="date" min={today} value={formData.checkIn} onChange={e => update("checkIn", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={labelStyle}>Check-out Date *</label>
              <input required type="date" min={formData.checkIn || today} value={formData.checkOut} onChange={e => update("checkOut", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={labelStyle}>Guests</label>
              <div style={{ position: "relative" }}>
                <FaUsers style={{ ...iconWrap }} />
                <input type="number" min={1} max={10} value={formData.guests} onChange={e => update("guests", e.target.value)} style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Rooms</label>
              <div style={{ position: "relative" }}>
                <FaBed style={{ ...iconWrap }} />
                <input type="number" min={1} max={5} value={formData.rooms} onChange={e => update("rooms", e.target.value)} style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Room Type</label>
              <select value={formData.roomType} onChange={e => update("roomType", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Payment Details</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {[{ key: "card", label: "Card / Debit Card" }, { key: "upi", label: "UPI" }].map(m => (

              <button key={m.key} type="button" onClick={() => update("paymentMethod", m.key)} style={{
                flex: 1, padding: "12px 10px", borderRadius: 10, border: formData.paymentMethod === m.key ? "2px solid #3b82f6" : "1px solid #334155",
                background: formData.paymentMethod === m.key ? "rgba(59,130,246,0.12)" : "#0f172a",
                color: formData.paymentMethod === m.key ? "#93c5fd" : "#94a3b8",
                fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              }}>{m.label}</button>
            ))}
          </div>

          {formData.paymentMethod === "card" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Card Number *</label>
                <div style={{ position: "relative" }}>
                  <FaCreditCard style={{ ...iconWrap }} />
                  <input required maxLength={19} value={formData.cardNumber} onChange={e => {
                    let v = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                    v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                    update("cardNumber", v);
                  }} placeholder="1234 5678 9012 3456" style={{ ...inputStyle, paddingLeft: 38, letterSpacing: 2 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Expiry Date *</label>
                <input required maxLength={5} value={formData.cardExpiry} onChange={e => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                  update("cardExpiry", v);
                }} placeholder="MM/YY" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CVV *</label>
                <div style={{ position: "relative" }}>
                  <FaLock style={{ ...iconWrap }} />
                  <input required maxLength={4} type="password" value={formData.cardCvv} onChange={e => {
                    const v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    update("cardCvv", v);
                  }} placeholder="****" style={{ ...inputStyle, paddingLeft: 38 }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>UPI ID *</label>
              <div style={{ position: "relative" }}>
                <span style={{ ...iconWrap, fontSize: 11, fontWeight: 800, color: "#3b82f6" }}>@</span>
                <input required value={formData.upiId} onChange={e => update("upiId", e.target.value)} placeholder="yourname@upi" style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
          )}

          <div style={{ background: "#0f172a", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase" }}>Total Amount</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#22c55e", marginTop: 2 }}>{hotel.price}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 11 }}>
              <FaLock size={10} /> Secure Payment
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ accentColor: "#3b82f6", marginTop: 3, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
              <span>
                I agree to the{" "}
                <span onClick={e => { e.preventDefault(); setShowTerms(!showTerms); }} style={{ color: "#3b82f6", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                  Terms & Conditions
                </span>
                {" "}of this hotel booking.
              </span>
            </label>
            {showTerms && (
              <div style={{ marginTop: 12, background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: 18, maxHeight: 180, overflowY: "auto", fontSize: 12, color: "#94a3b8", lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: "#93c5fd", marginBottom: 10, fontSize: 13 }}>Hotel Booking Terms & Conditions</div>
                <ol style={{ paddingLeft: 18, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#cbd5e1" }}>Booking Confirmation:</strong> All bookings are subject to availability. A confirmation email will be sent upon successful booking.</li>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#cbd5e1" }}>Check-in / Check-out:</strong> Standard check-in 2:00 PM, check-out 12:00 PM.</li>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#cbd5e1" }}>Cancellation:</strong> Free cancellation up to 48 hours before check-in. Late cancellations incur one night's charge.</li>
                  <li><strong style={{ color: "#cbd5e1" }}>Payment:</strong> Full payment required at booking. Refunds processed within 5-7 business days.</li>
                </ol>
              </div>
            )}
          </div>

          <button type="submit" disabled={!termsAccepted} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: termsAccepted ? "linear-gradient(to right, #3b82f6, #8b5cf6)" : "#334155", color: termsAccepted ? "white" : "#64748b", fontWeight: 700, fontSize: 15, cursor: termsAccepted ? "pointer" : "not-allowed", transition: "all 0.3s" }}>
            Pay & Confirm Booking →
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------- Enhanced Flight Card -----------------------------------------

function FlightCard({ item, onViewDetails, onBook }) {
  const meta = AIRLINE_META[item.airline] || { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "plane" };

  return (
    <div style={{ ...S.card, transition: "border-color 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={S.cardBody}>
        {/* Header: Airline + Price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${meta.color}30` }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{item.airline}</div>
              <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{item.flightNo}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#334155", display: "inline-block" }} />
                <span>{item.aircraft}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#3b82f6" }}>₹{item.price.toLocaleString()}</div>

            <div style={{ fontSize: 10, color: "#64748b" }}>per person</div>
          </div>
        </div>

        {/* Route visual */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{item.departure}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.from}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Terminal {item.terminal.dep}</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", padding: "0 14px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{item.duration}</div>
            <div style={{ height: 2, background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`, position: "relative", borderRadius: 2 }}>
              <span style={{ position: "absolute", left: -1, top: -3, width: 8, height: 8, borderRadius: "50%", background: meta.color, display: "block" }} />
              {item.stops !== "Non-stop" && (
                <span style={{ position: "absolute", left: "50%", top: -3, width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "block", transform: "translateX(-50%)" }} />
              )}
              <span style={{ position: "absolute", right: -1, top: -3, width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", display: "block" }} />
            </div>
            <div style={{ fontSize: 10, color: item.stops === "Non-stop" ? "#22c55e" : "#f59e0b", marginTop: 4, fontWeight: 600 }}>{item.stops}</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{item.arrival}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.to}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>Terminal {item.terminal.arr}</div>
          </div>
        </div>

        {/* Quick info badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={S.flightBadge}>
            <FaChair size={9} /> {item.class}
          </span>
          <span style={S.flightBadge}>
            <FaSuitcase size={9} /> {item.baggage.checkin}
          </span>
          <span style={S.flightBadge}>
            <FaUtensils size={9} /> {item.meal.split(" ")[0]}
          </span>
          {item.wifi && <span style={{ ...S.flightBadge, color: "#22c55e", borderColor: "#22c55e40" }}><FaWifi size={9} /> WiFi</span>}
          {item.refundable && <span style={{ ...S.flightBadge, color: "#22c55e", borderColor: "#22c55e40" }}><FaCheckCircle size={9} /> Refundable</span>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onViewDetails(item)} style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #334155",
            background: "#0f172a", color: "#94a3b8", cursor: "pointer", fontSize: 12,
            fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.color = "#3b82f6"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <FaInfoCircle size={11} /> View Details
          </button>
          <button onClick={() => onBook(item)} style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none",
            background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`,
            color: "white", cursor: "pointer", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <FaTicketAlt size={11} /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Flight Details Modal -----------------------------------------

function FlightDetailsModal({ flight, onClose, onBook }) {
  const meta = AIRLINE_META[flight.airline] || { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "✈️" };
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    setLiveLoading(true);
    const depIata = flight.from.match(/\((\w+)\)/)?.[1];
    const arrIata = flight.to.match(/\((\w+)\)/)?.[1];
    fetchLiveFlights({ dep_iata: depIata, arr_iata: arrIata }).then(data => {
      const match = data.find(d => d.flightNo === flight.flightNo);
      setLiveData(match || data[0] || null);
      setLiveLoading(false);
    }).catch(() => setLiveLoading(false));
  }, [flight]);

  const detailRow = (icon, label, value, highlight) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1e293b" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 13 }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight || "white" }}>{value}</span>
    </div>
  );

  const statusColors = { scheduled: "#3b82f6", active: "#22c55e", landed: "#8b5cf6", delayed: "#ef4444", unknown: "#64748b" };

  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={{ ...MS.modal, maxWidth: 620 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: meta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Flight Details</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>{flight.airline} · {flight.flightNo}</h2>

            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{flight.aircraft}</div>
          </div>
          <button onClick={onClose} style={{ background: "#334155", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        {/* Route Card */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white" }}>{flight.departure}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>{flight.from}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, background: "#1e293b", padding: "3px 10px", borderRadius: 8, display: "inline-block" }}>Terminal {flight.terminal.dep}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "0 20px" }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>{flight.duration}</div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`, position: "relative", borderRadius: 3 }}>
                <span style={{ position: "absolute", left: -2, top: -4, width: 10, height: 10, borderRadius: "50%", background: meta.color, display: "block", border: "2px solid #0f172a" }} />
                {flight.layover && <span style={{ position: "absolute", left: "50%", top: -4, width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "block", border: "2px solid #0f172a", transform: "translateX(-50%)" }} />}
                <span style={{ position: "absolute", right: -2, top: -4, width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", display: "block", border: "2px solid #0f172a" }} />
              </div>
              <div style={{ fontSize: 11, color: flight.stops === "Non-stop" ? "#22c55e" : "#f59e0b", marginTop: 6, fontWeight: 600 }}>
                {flight.stops}
              </div>
              {flight.layover && (
                <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>
                  Layover at {flight.layover.airport} ({flight.layover.duration})
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "white" }}>{flight.arrival}</div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>{flight.to}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, background: "#1e293b", padding: "3px 10px", borderRadius: 8, display: "inline-block" }}>Terminal {flight.terminal.arr}</div>
            </div>
          </div>
        </div>

        {/* Live Tracking Status */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <FaSatelliteDish size={12} color="#22c55e" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: 1 }}>Live Tracking</span>
            {liveLoading && <span style={{ fontSize: 11, color: "#64748b" }}>Fetching...</span>}
          </div>
          {liveData ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ background: "#1e293b", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: statusColors[liveData.status] || "#64748b",
                  textTransform: "capitalize",
                }}>
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: statusColors[liveData.status] || "#64748b",
                    marginRight: 6, animation: liveData.status === "active" ? "pulse 1.5s infinite" : "none",
                  }} />
                  {liveData.status}
                </div>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Gate</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{liveData.departure.gate}</div>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Delay</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: liveData.departure.delay > 0 ? "#ef4444" : "#22c55e" }}>
                  {liveData.departure.delay > 0 ? `+${liveData.departure.delay} min` : "On Time"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: 10 }}>
              {liveLoading ? "Loading live data..." : "Live data unavailable for this flight"}
            </div>
          )}
        </div>

        {/* Flight Details */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: "6px 20px", marginBottom: 20, border: "1px solid #334155" }}>
          {detailRow(<FaChair size={12} color="#3b82f6" />, "Class", flight.class)}
          {detailRow(<FaChair size={12} color="#3b82f6" />, "Seat Pitch", flight.seatPitch)}
          {detailRow(<FaSuitcase size={12} color="#3b82f6" />, "Cabin Baggage", flight.baggage.cabin)}
          {detailRow(<FaSuitcase size={12} color="#3b82f6" />, "Check-in Baggage", flight.baggage.checkin)}
          {detailRow(<FaUtensils size={12} color="#3b82f6" />, "Meal", flight.meal)}
          {detailRow(<FaWifi size={12} color="#3b82f6" />, "WiFi", flight.wifi ? "Available" : "Not available", flight.wifi ? "#22c55e" : "#ef4444")}
          {detailRow(<FaInfoCircle size={12} color="#3b82f6" />, "USB Charging", flight.usb ? "Available" : "Not available", flight.usb ? "#22c55e" : "#ef4444")}
          {detailRow(<FaTicketAlt size={12} color="#3b82f6" />, "Entertainment", flight.entertainment)}
        </div>

        {/* Cancellation & Policies */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: "6px 20px", marginBottom: 24, border: "1px solid #334155" }}>
          {detailRow(<FaTicketAlt size={12} color="#3b82f6" />, "Cancellation Fee", flight.cancellationFee, flight.refundable ? "#22c55e" : "#f59e0b")}
          {detailRow(<FaCheckCircle size={12} color="#3b82f6" />, "Reschedule Fee", flight.reschedule, flight.reschedule === "Free" ? "#22c55e" : "#f59e0b")}
          {detailRow(<FaCheckCircle size={12} color="#3b82f6" />, "Refundable", flight.refundable ? "Yes" : "No", flight.refundable ? "#22c55e" : "#ef4444")}
        </div>

        {/* Price + Book CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Price</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#3b82f6" }}>₹{flight.price.toLocaleString()}</div>

            <div style={{ fontSize: 11, color: "#64748b" }}>per person · taxes included</div>

          </div>
          <button onClick={() => { onClose(); onBook(flight); }} style={{
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`,
            color: "white", fontWeight: 700, cursor: "pointer", fontSize: 15,
          }}>
            Book This Flight <FaPlane size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Flight Booking Modal -----------------------------------------

function FlightBookingModal({ flight, passengers: passengerCount, onClose }) {
  const meta = AIRLINE_META[flight.airline] || { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" };
  const totalPrice = flight.price * (passengerCount || 1);

  const [formData, setFormData] = useState({
    passengers: Array.from({ length: passengerCount || 1 }, () => ({ name: "", age: "", gender: "Male" })),
    contactEmail: "", contactPhone: "",
    seatPref: "Window",
    mealPref: "Veg",
    addBaggage: false,
    travelInsurance: false,
    paymentMethod: "card",
    cardNumber: "", cardExpiry: "", cardCvv: "",
    upiId: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const updatePassenger = (idx, field, value) => {
    setFormData(prev => {
      const p = [...prev.passengers];
      p[idx] = { ...p[idx], [field]: value };
      return { ...prev, passengers: p };
    });
  };

  const handleFlightSubmit = (e) => {
    e.preventDefault();
    const userObj = JSON.parse(localStorage.getItem("user")) || { email: "user@example.com" };
    const userEmail = userObj.email || "user@example.com";
    const storageKey = `bookedFlights_${userEmail}`;
    const savedFlights = JSON.parse(localStorage.getItem(storageKey)) || [];
    const newBooking = {
      id: Date.now(),
      airline: flight.airline,
      flightNo: flight.flightNo,
      departure: flight.departure,
      arrival: flight.arrival,
      price: flight.price,
      passengersCount: formData.passengers.length,
      seatPref: formData.seatPref,
      mealPref: formData.mealPref,
    };
    localStorage.setItem(storageKey, JSON.stringify([...savedFlights, newBooking]));
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#0f172a", border: "1px solid #334155",
    borderRadius: 10, padding: "11px 14px", color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600 };

  const addons = [];
  if (formData.addBaggage) addons.push({ label: "Extra Baggage (10 kg)", price: 1200 * formData.passengers.length });
  if (formData.travelInsurance) addons.push({ label: "Travel Insurance", price: 499 * formData.passengers.length });
  const addonTotal = addons.reduce((s, a) => s + a.price, 0);
  const grandTotal = totalPrice + addonTotal;

  if (submitted) {
    return (
      <div style={MS.overlay} onClick={onClose}>
        <div style={{ ...MS.modal, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FaCheckCircle size={56} color="#22c55e" />
            <h2 style={{ color: "white", marginTop: 18, fontSize: 24, fontWeight: 800 }}>Flight Booked! <FaCheckCircle /></h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8, lineHeight: 1.7 }}>
              Your booking for <strong style={{ color: meta.color }}>{flight.airline} {flight.flightNo}</strong> has been confirmed.
            </p>
            <div style={{ background: "#0f172a", borderRadius: 14, padding: 20, marginTop: 20, textAlign: "left", border: "1px solid #334155" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Route</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.from.split(" (")[0]} → {flight.to.split(" (")[0]}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Date</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Departure</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.departure} · T{flight.terminal.dep}</div></div>

                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Arrival</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.arrival} · T{flight.terminal.arr}</div></div>

                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Passengers</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formData.passengers.map(p => p.name || "Passenger").join(", ")}</div></div>
                <div><div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Class</div><div style={{ color: "white", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.class}</div></div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #334155", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Total Paid</div>
                  <div style={{ color: "#22c55e", fontSize: 20, fontWeight: 900, marginTop: 2 }}>₹{grandTotal.toLocaleString()}</div>

                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 14, background: "rgba(59,130,246,0.08)", borderRadius: 12, border: "1px solid rgba(59,130,246,0.2)", fontSize: 12, color: "#93c5fd", lineHeight: 1.6 }}>
              <FaEnvelope size={11} style={{ marginRight: 6 }} /> A confirmation e-ticket has been sent to <strong>{formData.contactEmail || "your email"}</strong>. Please carry a valid photo ID for check-in.

            </div>
            <button onClick={onClose} style={{ marginTop: 24, padding: "12px 36px", borderRadius: 10, border: "none", background: "linear-gradient(to right, #3b82f6, #8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={MS.overlay} onClick={onClose}>
      <div style={{ ...MS.modal, maxWidth: 620 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: meta.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Flight Booking</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>{flight.airline} · {flight.flightNo}</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#94a3b8", fontSize: 13 }}>
              {flight.from.split(" (")[0]} → {flight.to.split(" (")[0]}

              <span style={{ margin: "0 4px", color: "#334155" }}>·</span>

              <span style={{ color: "#3b82f6", fontWeight: 700 }}>{flight.departure} - {flight.arrival}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#334155", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#94a3b8", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        {/* Route Summary Strip */}
        <div style={{ background: "#0f172a", borderRadius: 14, padding: "14px 20px", marginBottom: 20, border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{flight.departure}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 2, background: meta.color, borderRadius: 2 }} />
              <FaPlane size={12} color={meta.color} />
              <div style={{ width: 30, height: 2, background: "#8b5cf6", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{flight.arrival}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={S.flightBadge}>{flight.class}</span>
            <span style={S.flightBadge}>{flight.duration}</span>
          </div>
        </div>

        <form onSubmit={handleFlightSubmit}>

          {/* Passenger Details */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            Passenger Details ({formData.passengers.length})
          </div>
          {formData.passengers.map((p, idx) => (
            <div key={idx} style={{
              background: "#0f172a", borderRadius: 14, padding: "16px 18px", marginBottom: 14,
              border: "1px solid #334155",
            }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Passenger {idx + 1}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input required value={p.name} onChange={e => updatePassenger(idx, "name", e.target.value)} placeholder="As on ID proof" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Age *</label>
                  <input required type="number" min={1} max={120} value={p.age} onChange={e => updatePassenger(idx, "age", e.target.value)} placeholder="Age" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select value={p.gender} onChange={e => updatePassenger(idx, "gender", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Contact Info */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Contact Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input required type="email" value={formData.contactEmail} onChange={e => update("contactEmail", e.target.value)} placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input required type="tel" value={formData.contactPhone} onChange={e => update("contactPhone", e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
            </div>
          </div>

          {/* Preferences */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Preferences</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Seat Preference</label>
              <select value={formData.seatPref} onChange={e => update("seatPref", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>Window</option>
                <option>Aisle</option>
                <option>Middle</option>
                <option>No Preference</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Meal Preference</label>
              <select value={formData.mealPref} onChange={e => update("mealPref", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>Veg</option>
                <option>Non-Veg</option>
                <option>Vegan</option>
                <option>Jain</option>
                <option>No Meal</option>
              </select>
            </div>
          </div>

          {/* Add-ons */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Add-ons</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[
              { key: "addBaggage", label: <span><FaSuitcaseRolling style={{ marginRight: 6 }} />Extra 10 kg Baggage</span>, price: `₹1,200/person`, checked: formData.addBaggage },
              { key: "travelInsurance", label: <span><FaShieldAlt style={{ marginRight: 6 }} />Travel Insurance</span>, price: `₹499/person`, checked: formData.travelInsurance },
            ].map(addon => (
              <label key={addon.key} style={{
                flex: 1, background: addon.checked ? "rgba(59,130,246,0.08)" : "#0f172a",
                border: addon.checked ? "2px solid #3b82f6" : "1px solid #334155",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" checked={addon.checked} onChange={e => update(addon.key, e.target.checked)} style={{ accentColor: "#3b82f6", marginTop: 3, width: 16, height: 16 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{addon.label}</div>
                    <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 3, fontWeight: 600 }}>{addon.price}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Payment Method */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Payment</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {[{ key: "card", label: "Credit / Debit Card" }, { key: "upi", label: "UPI" }].map(m => (

              <button key={m.key} type="button" onClick={() => update("paymentMethod", m.key)} style={{
                flex: 1, padding: "12px 10px", borderRadius: 10,
                border: formData.paymentMethod === m.key ? "2px solid #3b82f6" : "1px solid #334155",
                background: formData.paymentMethod === m.key ? "rgba(59,130,246,0.12)" : "#0f172a",
                color: formData.paymentMethod === m.key ? "#93c5fd" : "#94a3b8",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>{m.label}</button>
            ))}
          </div>

          {formData.paymentMethod === "card" ? (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Card Number *</label>
                <input required maxLength={19} value={formData.cardNumber} onChange={e => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 16);
                  v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                  update("cardNumber", v);
                }} placeholder="1234 5678 9012 3456" style={{ ...inputStyle, letterSpacing: 2 }} />
              </div>
              <div>
                <label style={labelStyle}>Expiry *</label>
                <input required maxLength={5} value={formData.cardExpiry} onChange={e => {
                  let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                  update("cardExpiry", v);
                }} placeholder="MM/YY" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CVV *</label>
                <input required maxLength={4} type="password" value={formData.cardCvv} onChange={e => update("cardCvv", e.target.value.replace(/[^\d]/g, "").slice(0, 4))} placeholder="****" style={inputStyle} />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>UPI ID *</label>
              <input required value={formData.upiId} onChange={e => update("upiId", e.target.value)} placeholder="yourname@upi" style={inputStyle} />
            </div>
          )}

          {/* Price Breakdown */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: 18, marginBottom: 20, border: "1px solid #334155" }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Price Breakdown</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>
              <span>Base Fare ({formData.passengers.length} x ₹{flight.price.toLocaleString()})</span>

              <span style={{ color: "white", fontWeight: 600 }}>₹{totalPrice.toLocaleString()}</span>

            </div>
            {addons.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#94a3b8" }}>
                <span>{a.label}</span>
                <span style={{ color: "white", fontWeight: 600 }}>₹{a.price.toLocaleString()}</span>

              </div>
            ))}
            <div style={{ borderTop: "1px solid #334155", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Grand Total</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#22c55e" }}>₹{grandTotal.toLocaleString()}</span>

            </div>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ accentColor: "#3b82f6", marginTop: 3, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
              <span>I accept the cancellation policy ({flight.cancellationFee} cancellation fee) and agree to the booking terms.</span>
            </label>
          </div>

          <button type="submit" disabled={!termsAccepted} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: termsAccepted ? `linear-gradient(to right, ${meta.color}, #8b5cf6)` : "#334155",
            color: termsAccepted ? "white" : "#64748b", fontWeight: 700, fontSize: 15,
            cursor: termsAccepted ? "pointer" : "not-allowed", transition: "all 0.3s",
          }}>
            Pay ₹{grandTotal.toLocaleString()} & Confirm Booking ✈️
          </button>
        </form>
      </div>
    </div>
  );
}

const MS = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 20,
  },
  modal: {
    background: "#1e293b", borderRadius: 24, padding: 32,
    width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
    border: "1px solid #334155", boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
  },
};

// ---------------- Main Page -----------------------------------------

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [query, setQuery] = useState(params.get("q") || "");
  const [activeTab, setActiveTab] = useState(params.get("tab") || "places");
  const [sortBy, setSortBy] = useState("rating");
  const [wishlist, setWishlist] = useState([]);

  const [minRating, setMinRating] = useState(0);

  const [loading, setLoading] = useState(false);
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState(params.get("date") || "");
  const [passengers, setPassengers] = useState(1);
  const [flightClass, setFlightClass] = useState("All");
  const [flightSort, setFlightSort] = useState("price");
  const [bookingHotel, setBookingHotel] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookingFlight, setBookingFlight] = useState(null);
  const [liveTracker, setLiveTracker] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [selectedHotelForCalendar, setSelectedHotelForCalendar] = useState(null);








  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const tab = params.get("tab") || "places";
    const date = params.get("date") || "";
    setQuery(q);
    setActiveTab(tab);
    if (date) {
      setFlightDate(date);
    }
  }, [location.search]);

  const toggleWishlist = (id) =>
    setWishlist(w => w.includes(id) ? w.filter(i => i !== id) : [...w, id]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const filterAndSort = (items) => {
    let filtered = items.filter(i =>
      !query || JSON.stringify(i).toLowerCase().includes(query.toLowerCase())
    );
    if (minRating > 0) filtered = filtered.filter(i => (i.rating || 0) >= minRating);
    filtered.sort((a, b) => sortBy === "rating" ? (b.rating || 0) - (a.rating || 0) : 0);
    return filtered;
  };

  // Flight filtering & sorting
  const filterFlights = () => {
    let f = FLIGHTS.filter(fl =>
      (!flightFrom || fl.from.toLowerCase().includes(flightFrom.toLowerCase())) &&
      (!flightTo || fl.to.toLowerCase().includes(flightTo.toLowerCase())) &&
      (flightClass === "All" || fl.class === flightClass)
    );
    if (query) {
      f = f.filter(fl => JSON.stringify(fl).toLowerCase().includes(query.toLowerCase()));
    }
    if (flightSort === "price") f.sort((a, b) => a.price - b.price);
    else if (flightSort === "duration") f.sort((a, b) => a.duration.localeCompare(b.duration));
    else if (flightSort === "departure") f.sort((a, b) => a.departure.localeCompare(b.departure));
    return f;
  };

  // Live tracker
  const loadLiveTracker = async () => {
    setTrackerLoading(true);
    setShowTracker(true);
    const data = await fetchLiveFlights({});
    setLiveTracker(data.slice(0, 10));
    setTrackerLoading(false);
  };

  const places = filterAndSort(PLACES);
  const hotels = filterAndSort(HOTELS);
  const flights = filterFlights();

  const counts = { places: places.length, hotels: hotels.length, flights: flights.length };
  const currentCount = counts[activeTab];

  const statusColors = { scheduled: "#3b82f6", active: "#22c55e", landed: "#8b5cf6", delayed: "#ef4444", unknown: "#64748b" };

  const flightCalendarReady = flightFrom.trim() && flightTo.trim() && flightDate;

  return (
    <div className="sr-page" style={{ fontFamily:"'Inter','Segoe UI',system-ui,sans-serif" }}>
      <SharedNavbar activeTab={activeTab === "places" ? "destinations" : activeTab} />

      <style>{`
        @keyframes sr-calendarSlide {
          from { opacity:0; transform:translateY(-12px) scaleY(.96); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }
        .sr-card-item {
          background: rgba(15,23,42,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(148,163,184,0.10);
          border-radius: 20px;
          overflow: hidden;
          transition: transform .3s cubic-bezier(.34,1.56,.64,1), border-color .3s, box-shadow .3s;
        }
        .sr-card-item:hover {
          transform: translateY(-6px);
          border-color: rgba(59,130,246,0.30);
          box-shadow: 0 16px 50px rgba(0,0,0,0.45);
        }
        .sr-card-item:hover img {
          transform: scale(1.05);
        }
        .sr-card-item img {
          transition: transform .4s ease;
        }
        .sr-live-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div className="sr-main">
        <div style={{ maxWidth:1360, margin:"0 auto", padding:"24px 36px 60px" }}>

          {/* Top bar: back + search */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
            <button
              onClick={() => navigate("/home")}
              className="sr-btn-ghost sr-btn-sm"
              style={{ whiteSpace:"nowrap", flexShrink:0 }}
            >
              <FaArrowLeft size={11} /> Back
            </button>
            <div className="sr-search-wrap">
              <FaSearch style={{ color:"#3b82f6", flexShrink:0 }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
              />
              {query && <FaTimes style={{ cursor:"pointer", color:"#64748b", flexShrink:0 }} onClick={() => setQuery("")} />}
            </div>
          </div>

          {/* Tabs */}
          <div className="sr-tabs" style={{ marginBottom:20 }}>
            {["places", "hotels", "flights"].map(tab => (
              <button key={tab} className={`sr-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "places" ? <FaMapMarkerAlt size={13} /> : tab === "hotels" ? <FaBed size={13} /> : <FaPlane size={13} />}
                {" "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="sr-tab-count">{counts[tab]}</span>
              </button>
            ))}
          </div>

          {/* Inline filter bar */}
          <div className="sr-filter-bar">
            <FaSlidersH size={13} color="#3b82f6" />
            <span style={{ fontSize:12, color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginRight:4 }}>Filters</span>
            <div style={{ width:1, height:20, background:"rgba(148,163,184,0.12)", margin:"0 4px" }} />

            {activeTab === "flights" ? (
              <>
                {["All","Economy","Premium Economy","Business"].map(c => (
                  <button key={c} className={`sr-filter-pill${flightClass===c?" active":""}`}
                    onClick={() => setFlightClass(c)}>{c}
                  </button>
                ))}
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>Sort:</span>
                  <select value={flightSort} onChange={e => setFlightSort(e.target.value)} className="sr-filter-select">
                    <option value="price">Lowest Price</option>
                    <option value="departure">Earliest Dep.</option>
                    <option value="duration">Shortest</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                {[{ v:0, l:"All" },{ v:4, l:"4+ Stars" },{ v:4.5, l:"4.5+ Stars" },{ v:4.8, l:"4.8+ Stars" }].map(({ v, l }) => (
                  <button key={v} className={`sr-filter-pill${minRating===v?" active":""}`}
                    onClick={() => setMinRating(v)}>{l}
                  </button>
                ))}
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sr-filter-select">
                    <option value="rating">Top Rated</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Flight search form */}
          {activeTab === "flights" && (
            <>
              <div style={{
                background:"rgba(15,23,42,0.72)", backdropFilter:"blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                border:"1px solid rgba(148,163,184,0.10)",
                borderRadius:20, padding:"24px 28px", marginBottom:20,
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                  <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:"white", display:"flex", alignItems:"center", gap:10 }}>
                    <FaPlane size={18} /> Search Flights
                  </h3>
                  <button onClick={loadLiveTracker} style={{
                    padding:"8px 16px", borderRadius:10, border:"1px solid rgba(34,197,94,0.3)",
                    background:"rgba(34,197,94,0.08)", color:"#22c55e",
                    cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
                    display:"flex", alignItems:"center", gap:6,
                  }}>
                    <FaSatelliteDish size={10} /> Live Tracker
                  </button>
                </div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {[{ label:"From", value:flightFrom, set:setFlightFrom, ph:"Delhi, Mumbai..." },
                    { label:"To",   value:flightTo,   set:setFlightTo,   ph:"Goa, Bangalore..." }].map(({ label, value, set, ph }) => (
                    <div key={label} style={{ flex:1, minWidth:130 }}>
                      <div style={{ fontSize:10, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
                      <div style={{ display:"flex", alignItems:"center", background:"rgba(5,11,24,0.7)", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(148,163,184,0.12)" }}>
                        <FaMapMarkerAlt size={11} color="#3b82f6" style={{ marginRight:8, flexShrink:0 }} />
                        <input value={value} onChange={e => set(e.target.value)} placeholder={ph}
                          style={{ background:"transparent", border:"none", outline:"none", color:"white", fontSize:13, width:"100%", fontFamily:"inherit" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ flex:1, minWidth:130 }}>
                    <div style={{ fontSize:10, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>Date</div>
                    <div style={{ display:"flex", alignItems:"center", background:"rgba(5,11,24,0.7)", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(148,163,184,0.12)" }}>
                      <FaCalendarAlt size={11} color="#3b82f6" style={{ marginRight:8, flexShrink:0 }} />
                      <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)}
                        style={{ background:"transparent", border:"none", outline:"none", color:"white", fontSize:13, width:"100%", fontFamily:"inherit", colorScheme:"dark" }} />
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth:110 }}>
                    <div style={{ fontSize:10, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:1 }}>Passengers</div>
                    <div style={{ display:"flex", alignItems:"center", background:"rgba(5,11,24,0.7)", borderRadius:10, padding:"10px 14px", border:"1px solid rgba(148,163,184,0.12)" }}>
                      <FaUsers size={11} color="#3b82f6" style={{ marginRight:8, flexShrink:0 }} />
                      <input type="number" min={1} max={9} value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                        style={{ background:"transparent", border:"none", outline:"none", color:"white", fontSize:13, width:"100%", fontFamily:"inherit" }} />
                    </div>
                  </div>
                  <button onClick={handleSearch} className="sr-btn" style={{ alignSelf:"flex-end" }}>
                    Search Flights
                  </button>
                </div>
              </div>

              {/* Live Tracker Panel */}
              {showTracker && (
                <div style={{
                  background:"rgba(15,23,42,0.72)", backdropFilter:"blur(20px)",
                  WebkitBackdropFilter:"blur(20px)",
                  border:"1px solid rgba(34,197,94,0.25)",
                  borderRadius:20, padding:"20px 24px", marginBottom:20,
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <FaSatelliteDish size={13} color="#22c55e" />
                      <span style={{ fontSize:14, fontWeight:700, color:"#22c55e" }}>Live Flight Tracker</span>
                      <span style={{ fontSize:11, color:"#64748b" }}>via AviationStack API</span>
                    </div>
                    <button onClick={() => setShowTracker(false)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:16 }}><FaTimes /></button>
                  </div>
                  {trackerLoading ? (
                    <div style={{ textAlign:"center", padding:20, color:"#64748b", fontSize:13 }}>
                      <div style={{ fontSize:28, marginBottom:8 }}><FaPlane size={28} /></div>Loading live flight data...
                    </div>
                  ) : (
                    <div style={{ overflowX:"auto" }}>
                      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                        <thead>
                          <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.1)" }}>
                            {["Flight","Airline","Route","Scheduled","Gate","Status","Delay"].map(h => (
                              <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:"#64748b", fontWeight:600, textTransform:"uppercase", fontSize:10, letterSpacing:1 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {liveTracker.map((fl, i) => (
                            <tr key={i} className="sr-live-row" style={{ borderBottom:"1px solid rgba(148,163,184,0.05)" }}>
                              <td style={{ padding:"10px", fontWeight:700, color:"white" }}>{fl.flightNo}</td>
                              <td style={{ padding:"10px", color:"#94a3b8" }}>{fl.airline}</td>
                              <td style={{ padding:"10px", color:"#94a3b8" }}>{fl.departure.iata} → {fl.arrival.iata}</td>
                              <td style={{ padding:"10px", color:"white", fontWeight:600 }}>{fl.departure.scheduled}</td>
                              <td style={{ padding:"10px", color:"#93c5fd", fontWeight:600 }}>{fl.departure.gate}</td>
                              <td style={{ padding:"10px" }}>
                                <span style={{
                                  fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:20,
                                  color: statusColors[fl.status]||"#64748b",
                                  background:(statusColors[fl.status]||"#64748b")+"18",
                                  border:`1px solid ${(statusColors[fl.status]||"#64748b")}40`,
                                  textTransform:"capitalize",
                                }}>{fl.status}</span>
                              </td>
                              <td style={{ padding:"10px", color:fl.departure.delay>0?"#ef4444":"#22c55e", fontWeight:600 }}>
                                {fl.departure.delay>0?`+${fl.departure.delay}m`:"On Time"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Hotel Availability Calendar */}
          {activeTab === "hotels" && (
            selectedHotelForCalendar ? (
              <div className="sr-calendar-panel">
                <div style={{
                  background:"linear-gradient(135deg,rgba(139,92,246,0.10),rgba(15,23,42,0.80))",
                  border:"1px solid rgba(139,92,246,0.20)",
                  borderRadius:20, padding:"20px 24px",
                  display:"flex", alignItems:"flex-start", gap:24, flexWrap:"wrap",
                }}>
                  <div style={{ flex:"0 0 auto", maxWidth:240 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:20, padding:"4px 14px", marginBottom:12 }}>
                      <FaBed size={14} />
                      <span style={{ fontSize:11, fontWeight:700, color:"#c4b5fd", textTransform:"uppercase", letterSpacing:1 }}>Room Availability</span>
                    </div>
                    <h3 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:"white" }}>{selectedHotelForCalendar.name}</h3>
                    <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b", lineHeight:1.6 }}>Check available dates before confirming your booking.</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[{ c:"#ef4444", label:"Fully Booked", sub:"No rooms available" }, { c:"#22c55e", label:"Holiday / Open", sub:"Great availability" }].map(({ c, label, sub }) => (
                        <div key={label} style={{ display:"flex", alignItems:"center", gap:10, background:`${c}08`, border:`1px solid ${c}20`, borderRadius:10, padding:"8px 12px" }}>
                          <span style={{ width:10, height:10, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}99`, flexShrink:0 }} />
                          <div><div style={{ fontSize:11, fontWeight:700, color:`${c}dd` }}>{label}</div><div style={{ fontSize:10, color:"#64748b" }}>{sub}</div></div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setSelectedHotelForCalendar(null)} style={{ marginTop:14, fontSize:12, color:"#64748b", background:"none", border:"none", cursor:"pointer", padding:0, fontFamily:"inherit" }}>
                      <FaTimes size={11} style={{ marginRight: 4 }} /> Hide calendar
                    </button>
                  </div>
                  <div style={{ flex:1, minWidth:280 }}>
                    <CalendarWidget compact availabilityData={HOTEL_AVAILABILITY}
                      onDateSelect={date => setFlightDate(date.toISOString().split("T")[0])} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="sr-calendar-placeholder">
                <div className="ph-icon"><FaBed size={36} /></div>
                <div className="ph-title">Select a hotel to view room availability</div>
                <div className="ph-sub">Click "Book Now" on any hotel below to see the availability calendar</div>
              </div>
            )
          )}

          {/* Flight Availability Calendar */}
          {activeTab === "flights" && (
            flightCalendarReady ? (
              <div className="sr-calendar-panel">
                <div style={{
                  background:"linear-gradient(135deg,rgba(6,182,212,0.08),rgba(15,23,42,0.80))",
                  border:"1px solid rgba(6,182,212,0.20)",
                  borderRadius:20, padding:"20px 24px",
                  display:"flex", alignItems:"flex-start", gap:24, flexWrap:"wrap",
                }}>
                  <div style={{ flex:"0 0 auto", maxWidth:240 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.3)", borderRadius:20, padding:"4px 14px", marginBottom:12 }}>
                      <FaPlane size={14} />
                      <span style={{ fontSize:11, fontWeight:700, color:"#67e8f9", textTransform:"uppercase", letterSpacing:1 }}>Seat Availability</span>
                    </div>
                    <h3 style={{ margin:"0 0 6px", fontSize:16, fontWeight:800, color:"white" }}>Flight Calendar</h3>
                    <p style={{ margin:"0 0 6px", fontSize:12, color:"#64748b" }}>{flightFrom} → {flightTo}</p>
                    <p style={{ margin:"0 0 16px", fontSize:12, color:"#64748b", lineHeight:1.6 }}>Pick a date to prefill your search.</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[{ c:"#ef4444", label:"Fully Booked", sub:"All seats taken" }, { c:"#22c55e", label:"Holiday / Open", sub:"Extra flights available" }].map(({ c, label, sub }) => (
                        <div key={label} style={{ display:"flex", alignItems:"center", gap:10, background:`${c}08`, border:`1px solid ${c}20`, borderRadius:10, padding:"8px 12px" }}>
                          <span style={{ width:10, height:10, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}99`, flexShrink:0 }} />
                          <div><div style={{ fontSize:11, fontWeight:700, color:`${c}dd` }}>{label}</div><div style={{ fontSize:10, color:"#64748b" }}>{sub}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth:280 }}>
                    <CalendarWidget compact availabilityData={FLIGHT_AVAILABILITY}
                      onDateSelect={date => setFlightDate(date.toISOString().split("T")[0])} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="sr-calendar-placeholder">
                <div className="ph-icon"><FaPlane size={36} /></div>
                <div className="ph-title">Search flights to view seat availability</div>
                <div className="ph-sub">Enter From, To, and Date above to see the availability calendar</div>
              </div>
            )
          )}

          {/* Results header */}
          <div style={{ marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:22, fontWeight:800, margin:0, color:"white" }}>
                {activeTab==="places" ? <><FaMapMarkerAlt size={18} style={{ marginRight: 8 }}/>Destinations</> : activeTab==="hotels" ? <><FaBed size={18} style={{ marginRight: 8 }}/>Hotels</> : <><FaPlane size={18} style={{ marginRight: 8 }}/>Flights</>}
              </h2>
              <p style={{ color:"#64748b", fontSize:13, marginTop:4 }}>
                {loading ? "Searching..." : `${currentCount} result${currentCount!==1?"s":""} found`}
                {query && ` for "${query}"`}
              </p>
            </div>
            {!loading && currentCount > 0 && (
              <button
                onClick={() => { setQuery(""); setMinRating(0); setFlightFrom(""); setFlightTo(""); setFlightClass("All"); }}
                style={{ fontSize:12, color:"#64748b", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Card grid / skeleton / empty */}
          {loading ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="sr-skeleton" style={{ height:320 }} />
              ))}
            </div>
          ) : currentCount === 0 ? (
            <div className="sr-empty">
                <div className="sr-empty-icon"><FaSearch size={48} /></div>
              <h3>No results found</h3>
              <p>Try a different search term or clear your filters.</p>
              <button className="sr-btn" onClick={() => { setQuery(""); setMinRating(0); setFlightFrom(""); setFlightTo(""); setFlightClass("All"); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
              {activeTab==="places" && places.map(item => (
                <PlaceCard key={item.id} item={item} wishlist={wishlist} toggleWishlist={toggleWishlist}
                  onExplore={id => navigate(`/explore/${id}`)} />
              ))}
              {activeTab==="hotels" && hotels.map(item => (
                <HotelCard key={item.id} item={item} wishlist={wishlist} toggleWishlist={toggleWishlist}
                  onBook={hotel => { setBookingHotel(hotel); setSelectedHotelForCalendar(hotel); }} />
              ))}
              {activeTab==="flights" && flights.map(item => (
                <FlightCard key={item.id} item={item}
                  onViewDetails={setSelectedFlight}
                  onBook={setBookingFlight} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Modals Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {bookingHotel   && <BookingModal hotel={bookingHotel} onClose={() => setBookingHotel(null)} />}
      {selectedFlight && <FlightDetailsModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} onBook={f => { setSelectedFlight(null); setBookingFlight(f); }} />}
      {bookingFlight  && <FlightBookingModal flight={bookingFlight} passengers={passengers} onClose={() => setBookingFlight(null)} />}
    </div>
  );
}

const S = {
  card: { background:"rgba(15,23,42,0.72)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderRadius:20, overflow:"hidden", border:"1px solid rgba(148,163,184,0.10)", transition:"transform .3s cubic-bezier(.34,1.56,.64,1), border-color .3s, box-shadow .3s", className:"sr-card-item" },
  cardImg: { width:"100%", height:190, objectFit:"cover", display:"block" },
  cardBody: { padding:"16px 18px" },
  cardTitle: { fontSize:16, fontWeight:700, color:"white", margin:0 },
  ratingText: { fontSize:11, color:"#94a3b8" },
  price: { fontSize:17, fontWeight:800, color:"#3b82f6" },
  priceLabel: { fontSize:10, color:"#64748b" },
  tag: { fontSize:11, padding:"3px 10px", borderRadius:20, background:"rgba(15,23,42,0.8)", color:"#94a3b8", border:"1px solid rgba(148,163,184,0.10)" },
  amenity: { display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#94a3b8", background:"rgba(15,23,42,0.8)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(148,163,184,0.10)" },
  heartBtn: { position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.50)", backdropFilter:"blur(8px)", border:"none", borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  catBadge: { position:"absolute", bottom:10, left:10, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(8px)", color:"white", fontSize:10, padding:"4px 10px", borderRadius:20 },
  actionBtn: { background:"linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))", border:"1px solid rgba(59,130,246,0.30)", color:"#60a5fa", padding:"8px 16px", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:700, transition:"all .2s", fontFamily:"inherit" },
  flightBadge: { fontSize:11, color:"#94a3b8", background:"rgba(15,23,42,0.8)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(148,163,184,0.10)", display:"inline-flex", alignItems:"center", gap:4 },
};
