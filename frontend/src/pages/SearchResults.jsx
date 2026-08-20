import axios from "axios";
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
  FaMapMarkedAlt, FaShieldAlt, FaSmile, FaSuitcaseRolling, FaChartPie,
  FaExternalLinkAlt, FaBus, FaTrain
} from "react-icons/fa";

import { PLACES } from "../data/destinations";
import { FLIGHTS, BUSES, TRAINS, AIRLINE_META, getOfficialBookingUrl, fetchLiveFlights, searchFlights, getFlightStatus } from "../data/flights";
import CalendarWidget from "../components/CalendarWidget";
import SharedNavbar from "../components/SharedNavbar";
import FeedbackAnalysisModal from "../components/FeedbackAnalysisModal";
import HotelSentimentDonut from "../components/HotelSentimentDonut";
import SearchAutocomplete from "../components/SearchAutocomplete";
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
  const fullOffsets = type === "hotels" ? [2, 5, 9, 14, 18, 22, 26] : [1, 4, 8, 13, 17, 21, 25];
  const holidayOffsets = type === "hotels" ? [6, 12, 20, 28] : [3, 10, 16, 24];

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
  { id: 7, type: "hotel", name: "The Leela Palace", location: "New Delhi, India", country: "India", rating: 4.9, reviews: 1234, price: "₹28,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 8, type: "hotel", name: "Taj Mahal Palace", location: "Mumbai, India", country: "India", rating: 4.8, reviews: 3456, price: "₹35,000/night", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "96% Positive" },
  { id: 9, type: "hotel", name: "ITC Grand Chola", location: "Chennai, India", country: "India", rating: 4.7, reviews: 987, price: "₹22,000/night", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "ac"], sentiment: "94% Positive" },
  { id: 10, type: "hotel", name: "Oberoi Udaivilas", location: "Udaipur, Rajasthan, India", country: "India", rating: 4.9, reviews: 2105, price: "₹55,000/night", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80", amenities: ["wifi", "pool", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 11, type: "hotel", name: "Six Senses Vana", location: "Dehradun, India", country: "India", rating: 4.8, reviews: 765, price: "₹42,000/night", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant"], sentiment: "97% Positive" },
  { id: 12, type: "hotel", name: "Amanbagh Resort", location: "Alwar, Rajasthan, India", country: "India", rating: 4.7, reviews: 543, price: "₹38,000/night", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", amenities: ["wifi", "pool", "parking", "restaurant", "ac"], sentiment: "95% Positive" },
  { id: 13, type: "hotel", name: "Burj Al Arab Jumeirah", location: "Dubai, UAE", country: "UAE", rating: 4.9, reviews: 4120, price: "₹1,20,000/night", img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 14, type: "hotel", name: "Marina Bay Sands Hotel", location: "Singapore", country: "Singapore", rating: 4.8, reviews: 3890, price: "₹68,000/night", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 15, type: "hotel", name: "The Plaza Hotel", location: "New York City, USA", country: "USA", rating: 4.9, reviews: 2950, price: "₹95,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", amenities: ["wifi", "gym", "restaurant", "ac"], sentiment: "97% Positive" },
  { id: 16, type: "hotel", name: "Kumarakom Lake Resort", location: "Kerala, India", country: "India", rating: 4.8, reviews: 1840, price: "₹32,000/night", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80", amenities: ["wifi", "pool", "restaurant", "ac"], sentiment: "96% Positive" },
  { id: 17, type: "hotel", name: "Grand Hotel Tremezzo", location: "Lake Como, Italy", country: "Italy", rating: 4.9, reviews: 1420, price: "₹85,000/night", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 18, type: "hotel", name: "The Oberoi Amarvilas", location: "Agra, India", country: "India", rating: 4.9, reviews: 2510, price: "₹48,000/night", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 19, type: "hotel", name: "Four Seasons Resort Bali at Sayan", location: "Ubud, Bali, Indonesia", country: "Indonesia", rating: 4.9, reviews: 1890, price: "₹62,000/night", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 20, type: "hotel", name: "The St. Regis Bali Resort", location: "Nusa Dua, Bali, Indonesia", country: "Indonesia", rating: 4.8, reviews: 1430, price: "₹58,000/night", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "97% Positive" },
  { id: 21, type: "hotel", name: "Hotel Ritz Paris", location: "Paris, France", country: "France", rating: 4.9, reviews: 2100, price: "₹1,15,000/night", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 22, type: "hotel", name: "Four Seasons Hotel George V", location: "Paris, France", country: "France", rating: 4.9, reviews: 1750, price: "₹1,30,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 23, type: "hotel", name: "Park Hyatt Tokyo", location: "Tokyo, Japan", country: "Japan", rating: 4.9, reviews: 2340, price: "₹72,000/night", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 24, type: "hotel", name: "Badrutt's Palace Hotel", location: "St. Moritz, Switzerland", country: "Switzerland", rating: 4.9, reviews: 1450, price: "₹92,000/night", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 25, type: "hotel", name: "Hotel Eden Rome", location: "Rome, Italy", country: "Italy", rating: 4.8, reviews: 1120, price: "₹65,000/night", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", amenities: ["wifi", "restaurant", "ac"], sentiment: "97% Positive" },
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

function PlaceCard({ item, wishlist, toggleWishlist, onExplore, onFeedbackAnalysis }) {
  const destId = item.id || item._id;

  return (
    <div style={S.card}>
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={() => onExplore(destId)}
      >
        <img
          src={item.img}
          alt={item.name}
          style={S.cardImg}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"; }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(destId); }}
          style={S.heartBtn}
          title="Save to Wishlist"
        >
          {wishlist.includes(destId) ? <FaHeart color="#ef4444" /> : <FaRegHeart color="white" />}
        </button>
        <span style={S.catBadge}>{item.category}</span>
      </div>
      <div style={S.cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3
              style={{ ...S.cardTitle, cursor: "pointer" }}
              onClick={() => onExplore(destId)}
            >
              {item.name}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Stars rating={item.rating} />
              <span style={S.ratingText}>{item.rating} ({(item.reviews || 200).toLocaleString()} reviews)</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.price}>{item.price}</div>
            <div style={S.priceLabel}>per person</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {(item.tags || []).map(t => <span key={t} style={S.tag}>{t}</span>)}
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFeedbackAnalysis) onFeedbackAnalysis(item);
            }}
            style={{
              flex: 1, padding: "9px 6px", borderRadius: 10,
              border: "1px solid rgba(37,99,235,0.25)",
              background: "rgba(37,99,235,0.07)", color: "#2563EB",
              cursor: "pointer", fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(37,99,235,0.14)";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(37,99,235,0.07)";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.25)";
            }}
            title={`View feedback analysis for ${item.name}`}
          >
            <FaChartPie size={12} color="#3b82f6" /> Feedback Analysis
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExplore(destId);
            }}
            style={{ ...S.actionBtn, flex: 1, textAlign: "center", padding: "9px 6px", fontSize: 12 }}
            title={`Explore ${item.name}`}
          >
            Explore →
          </button>
        </div>
      </div>
    </div>
  );
}

function HotelCard({ item, wishlist, toggleWishlist, onBook, onFeedbackAnalysis, onExplore }) {
  const isDeactivated = (item.status || "Active").toLowerCase() === "deactivated";
  return (
    <div style={{ ...S.card, opacity: isDeactivated ? 0.75 : 1 }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onExplore(item._id || item.id)}>
        <img src={item.img || (item.images && item.images[0])} alt={item.name} style={S.cardImg} onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"; }} />
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item.id || item._id); }} style={S.heartBtn}>
          {wishlist.includes(item.id || item._id) ? <FaHeart color="#ef4444" /> : <FaRegHeart color="white" />}
        </button>
        <span style={{ ...S.catBadge, background: "rgba(37,99,235,0.9)", color: "white" }}>
          📍 {item.country || (item.location ? item.location.split(",").pop().trim() : "India")}
        </span>
      </div>
      <div style={S.cardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ ...S.cardTitle, cursor: "pointer" }} onClick={() => onExplore(item._id || item.id)}>{item.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748B", fontSize: 12, marginTop: 3 }}>
              <FaMapMarkerAlt size={10} color="#EF4444" /> {item.location}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.price}>{item.price || `₹${Number(item.pricePerNight || 5000).toLocaleString("en-IN")}/night`}</div>
          </div>
        </div>

        {/* AI Sentiment Analysis Donut (Replaces simple star rating) */}
        <HotelSentimentDonut
          hotel={item}
          onOpenAnalysis={onFeedbackAnalysis}
        />

        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {(item.amenities || ["wifi", "pool", "restaurant", "ac"]).slice(0, 4).map((a, idx) => (
            <span key={idx} style={S.amenity}>
              {AMENITY_ICONS[a.toLowerCase()] || "✓"} {AMENITY_LABELS[a.toLowerCase()] || a}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => onFeedbackAnalysis(item)}
            style={{
              flex: 1, padding: "9px 6px", borderRadius: 10, border: "1px solid rgba(37,99,235,0.25)",
              background: "rgba(37,99,235,0.07)", color: "#2563EB", cursor: "pointer",
              fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              transition: "all 0.2s", fontFamily: "inherit"
            }}
          >
            <FaChartPie size={12} color="#3b82f6" /> AI Feedback
          </button>
          <button onClick={() => onExplore(item._id || item.id)} style={{ ...S.actionBtn, flex: 1, textAlign: "center", padding: "9px 6px", fontSize: 12 }}>
            View &amp; Book →
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Hotel Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({ hotel, onClose }) {
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    fullName: loggedUser.name || "",
    email: loggedUser.email || "",
    phone: "",
    checkIn: "", checkOut: "",
    guests: 1, rooms: 1, roomType: "Deluxe",
    specialRequests: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await axios.post("http://127.0.0.1:5000/book-hotel", {
        userEmail: formData.email || user?.email,
        customerEmail: formData.email || user?.email,
        customerName: formData.fullName || user?.name || "Guest Traveler",
        phone: formData.phone || "N/A",
        hotelName: hotel.name,
        location: hotel.location,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        rooms: formData.rooms,
        roomType: formData.roomType,
        guestName: formData.fullName || user?.name || "Guest",
        price: hotel.price,
      });

      setSubmitted(true);

    } catch (err) {
      console.error(err);
      alert("Hotel booking failed.");
    }
  };

  const inputStyle = {
    width: "100%", background: "#FFFFFF", border: "1px solid #DCE5F2",
    borderRadius: 10, padding: "11px 14px", color: "#111827", fontSize: 14,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 12, color: "#6B7280", marginBottom: 6, display: "block", fontWeight: 600 };
  const iconWrap = { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3b82f6", fontSize: 13 };

  if (submitted) {
    return (
      <div style={MS.overlay} onClick={onClose}>
        <div style={MS.modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "36px 24px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.12)", border: "2px solid #F59E0B",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, color: "#D97706", marginBottom: 16
            }}>
              ⏳
            </div>
            <h2 style={{ color: "#111827", marginTop: 6, fontSize: 22, fontWeight: 900 }}>
              Booking Request Submitted!
            </h2>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#B45309", padding: "6px 18px", borderRadius: 20,
              fontSize: 13, fontWeight: 800, margin: "12px 0 16px"
            }}>
              Status: Pending Approval (Waiting for Admin Response)
            </div>
            <p style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.6, margin: "0 auto 20px", maxWidth: 420 }}>
              Your reservation request at <strong style={{ color: "#2563EB" }}>{hotel.name}</strong> has been submitted. Our administrator will review your customer details and dispatch a confirmation email to <strong style={{ color: "#111827" }}>{formData.email || loggedUser.email}</strong> upon approval.
            </p>
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 20, textAlign: "left", border: "1px solid #E5E7EB", marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Customer Name</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{formData.fullName}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Customer Email</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{formData.email}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Check-in</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{formData.checkIn || "—"}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Check-out</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{formData.checkOut || "—"}</div></div>
              </div>
            </div>
            <button onClick={onClose} style={{ padding: "12px 36px", borderRadius: 12, border: "none", background: "linear-gradient(to right, #2563EB, #3B82F6)", color: "white", fontWeight: 800, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 14px rgba(37,99,235,0.25)" }}>
              Close &amp; View Status
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
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Hotel Booking</div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{hotel.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#6B7280", fontSize: 13 }}>
              <FaMapMarkerAlt size={11} /> {hotel.location}
              <span style={{ margin: "0 4px", color: "#D1D5DB" }}>·</span>
              <span style={{ color: "#2563EB", fontWeight: 700 }}>{hotel.price}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Customer Details</div>
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

          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Stay Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Check-in Date *</label>
              <input required type="date" min={today} value={formData.checkIn} onChange={e => update("checkIn", e.target.value)} style={{ ...inputStyle, colorScheme: "light" }} />
            </div>
            <div>
              <label style={labelStyle}>Check-out Date *</label>
              <input required type="date" min={formData.checkIn || today} value={formData.checkOut} onChange={e => update("checkOut", e.target.value)} style={{ ...inputStyle, colorScheme: "light" }} />
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

          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "#9CA3AF", textTransform: "uppercase" }}>Estimated Price</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#059669", marginTop: 2 }}>{hotel.price}</div>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, background: "#E0F2FE", padding: "6px 12px", borderRadius: 20 }}>
              Pay at Hotel upon Check-in
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
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
              <div style={{ marginTop: 12, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18, maxHeight: 180, overflowY: "auto", fontSize: 12, color: "#6B7280", lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, color: "#2563EB", marginBottom: 10, fontSize: 13 }}>Hotel Booking Terms & Conditions</div>
                <ol style={{ paddingLeft: 18, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#374151" }}>Booking Confirmation:</strong> All bookings are subject to availability. A confirmation email will be sent upon successful booking.</li>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#374151" }}>Check-in / Check-out:</strong> Standard check-in 2:00 PM, check-out 12:00 PM.</li>
                  <li style={{ marginBottom: 8 }}><strong style={{ color: "#374151" }}>Cancellation:</strong> Free cancellation up to 48 hours before check-in. Late cancellations incur one night's charge.</li>
                  <li><strong style={{ color: "#374151" }}>Payment:</strong> Pay directly at the hotel upon check-in. No advance payment required.</li>
                </ol>
              </div>
            )}
          </div>

          <button type="submit" disabled={!termsAccepted} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: termsAccepted ? "linear-gradient(to right, #2563EB, #7C3AED)" : "#E5E7EB", color: termsAccepted ? "white" : "#9CA3AF", fontWeight: 700, fontSize: 15, cursor: termsAccepted ? "pointer" : "not-allowed", transition: "all 0.3s" }}>
            Confirm Booking →
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------- Enhanced Flight Card -----------------------------------------

function FlightCard({ item, onViewDetails, onBook, onFeedbackAnalysis }) {
  const meta = AIRLINE_META[item.airline] || { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "plane" };

  return (
    <div style={{ ...S.card, transition: "border-color 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8EDF5"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={S.cardBody}>
        {/* Header: Airline + Price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${meta.color}30` }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#1F2937" }}>{item.airline || item.operator || item.trainName}</div>
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
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1F2937" }}>{item.departure}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.from}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{item.terminal?.dep ? `Terminal ${item.terminal.dep}` : "Dep Stop"}</div>
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
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1F2937" }}>{item.arrival}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.to}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{item.terminal?.arr ? `Terminal ${item.terminal.arr}` : "Arr Stop"}</div>
          </div>
        </div>

        {/* Quick info badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={S.flightBadge}>
            <FaChair size={9} /> {item.class}
          </span>
          <span style={S.flightBadge}>
            <FaSuitcase size={9} /> {item.baggage?.checkin || "Hand Luggage"}
          </span>
          {item.meal && (
            <span style={S.flightBadge}>
              <FaUtensils size={9} /> {item.meal.split(" ")[0]}
            </span>
          )}
          {item.wifi && <span style={{ ...S.flightBadge, color: "#22c55e", borderColor: "#22c55e40" }}><FaWifi size={9} /> WiFi</span>}
          {item.refundable && <span style={{ ...S.flightBadge, color: "#22c55e", borderColor: "#22c55e40" }}><FaCheckCircle size={9} /> Refundable</span>}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => onFeedbackAnalysis(item)}
            style={{
              flex: 1, padding: "9px 6px", borderRadius: 10, border: "1px solid #3b82f6",
              background: "rgba(37,99,235,0.07)", color: "#2563EB", cursor: "pointer",
              fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              transition: "all 0.2s", fontFamily: "inherit"
            }}
          >
            <FaChartPie size={12} color="#3b82f6" /> Feedback Analysis
          </button>
          <button onClick={() => onViewDetails(item)} style={{
            padding: "9px 10px", borderRadius: 10, border: "1px solid #E5E7EB",
            background: "#F9FAFB", color: "#374151", cursor: "pointer", fontSize: 11,
            fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            transition: "all 0.2s", fontFamily: "inherit"
          }}>
            <FaInfoCircle size={11} /> Details
          </button>
          <button onClick={() => onBook(item)} style={{
            flex: 1, padding: "9px 6px", borderRadius: 10, border: "none",
            background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`,
            color: "white", cursor: "pointer", fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "inherit"
          }}>
            <FaTicketAlt size={11} /> Book Official <FaExternalLinkAlt size={10} style={{ marginLeft: 2 }} />
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
    getFlightStatus(flight.flightNo)
      .then(({ data }) => {
        setLiveData(data || null);
        setLiveLoading(false);
      })
      .catch(() => setLiveLoading(false));
  }, [flight]);

  const detailRow = (icon, label, value, highlight) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #E5E7EB" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280", fontSize: 13 }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: highlight || "#111827" }}>{value}</span>
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
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{flight.airline} · {flight.flightNo}</h2>

            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{flight.aircraft}</div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        {/* Route Card */}
        <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 24, marginBottom: 20, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#1F2937" }}>{flight.departure}</div>
              <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{flight.from}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4, background: "#F3F4F6", padding: "3px 10px", borderRadius: 8, display: "inline-block", border: "1px solid #E5E7EB" }}>Terminal {flight.terminal.dep}</div>
            </div>
            <div style={{ flex: 1, textAlign: "center", padding: "0 20px" }}>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 600 }}>{flight.duration}</div>
              <div style={{ height: 3, background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`, position: "relative", borderRadius: 3 }}>
                <span style={{ position: "absolute", left: -2, top: -4, width: 10, height: 10, borderRadius: "50%", background: meta.color, display: "block", border: "2px solid #FFFFFF" }} />
                {flight.layover && <span style={{ position: "absolute", left: "50%", top: -4, width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", display: "block", border: "2px solid #FFFFFF", transform: "translateX(-50%)" }} />}
                <span style={{ position: "absolute", right: -2, top: -4, width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6", display: "block", border: "2px solid #FFFFFF" }} />
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
              <div style={{ fontSize: 32, fontWeight: 900, color: "#1F2937" }}>{flight.arrival}</div>
              <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{flight.to}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4, background: "#F3F4F6", padding: "3px 10px", borderRadius: 8, display: "inline-block", border: "1px solid #E5E7EB" }}>Terminal {flight.terminal.arr}</div>
            </div>
          </div>
        </div>

        {/* Live Tracking Status */}
        <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, marginBottom: 20, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <FaSatelliteDish size={12} color="#22c55e" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: 1 }}>Live Tracking</span>
            {liveLoading && <span style={{ fontSize: 11, color: "#9CA3AF" }}>Fetching...</span>}
          </div>
          {liveData ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: statusColors[liveData.status] || "#9CA3AF", textTransform: "capitalize" }}>
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: statusColors[liveData.status] || "#9CA3AF",
                    marginRight: 6,
                  }} />
                  {liveData.status}
                </div>
              </div>
              <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Dep. Gate</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {(liveData.gate?.dep) || (liveData.departure?.gate) || "—"}
                </div>
              </div>
              <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid #E5E7EB" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Delay</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: (liveData.delay ?? liveData.departure?.delay ?? 0) > 0 ? "#ef4444" : "#22c55e" }}>
                  {(liveData.delay ?? liveData.departure?.delay ?? 0) > 0
                    ? `+${liveData.delay ?? liveData.departure?.delay} min`
                    : "On Time"}
                </div>
              </div>
              {/* Estimated departure if different from scheduled */}
              {liveData.estimatedDep && liveData.estimatedDep !== liveData.scheduledDep && liveData.estimatedDep !== "—" && (
                <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 10, padding: 12, textAlign: "center", border: "1px solid rgba(239,68,68,0.2)", gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Estimated Departure</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>{liveData.estimatedDep?.slice(11, 16) || liveData.estimatedDep}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "#9CA3AF", fontSize: 12, textAlign: "center", padding: 10 }}>
              {liveLoading ? "Loading live data..." : "Live data unavailable for this flight"}
            </div>
          )}
        </div>

        {/* Flight Details */}
        <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "6px 20px", marginBottom: 20, border: "1px solid #E5E7EB" }}>
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
        <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "6px 20px", marginBottom: 24, border: "1px solid #E5E7EB" }}>
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
          <button onClick={() => {
            onClose();
            onBook(flight);
          }} style={{
            padding: "14px 28px", borderRadius: 12, border: "none",
            background: `linear-gradient(to right, ${meta.color}, #8b5cf6)`,
            color: "white", fontWeight: 700, cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit"
          }}>
            Book Official ({flight.airline}) <FaExternalLinkAlt size={13} />
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

  const addons = [];
  if (formData.addBaggage) addons.push({ label: 'Extra Baggage (10 kg)', price: 1200 * formData.passengers.length });
  if (formData.travelInsurance) addons.push({ label: 'Travel Insurance', price: 499 * formData.passengers.length });
  const addonTotal = addons.reduce((s, a) => s + a.price, 0);
  const grandTotal = totalPrice + addonTotal;

  const handleFlightSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const firstPax = (formData.passengers || [])[0] || {};
      const paxName = `${firstPax.firstName || ""} ${firstPax.lastName || ""}`.trim() || user?.name || "Passenger";

      await axios.post("http://127.0.0.1:5000/book-flight", {
        userEmail: user?.email || "guest@example.com",
        customerEmail: user?.email || "guest@example.com",
        customerName: paxName,
        phone: firstPax.phone || "N/A",
        flightName: flight.airline,
        flightNo: flight.flightNo,
        from: flight.from,
        to: flight.to,
        departureDate: flightDate || new Date().toISOString().split("T")[0],
        departure: flight.departure,
        arrival: flight.arrival,
        passengers: formData.passengers ? formData.passengers.length : 1,
        seatPref: formData.seatPref,
        mealPref: formData.mealPref,
        price: grandTotal ? `₹${grandTotal}` : flight.price,
      });

      // Direct user to the official airline booking page
      const officialUrl = getOfficialBookingUrl(flight);
      window.open(officialUrl, "_blank", "noopener,noreferrer");

      setSubmitted(true);

    } catch (err) {
      console.error(err);
      alert("Flight booking failed.");
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #DCE5F2",
    borderRadius: 10,
    padding: "11px 14px",
    color: "#111827",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    display: "block",
    fontWeight: 600,
  };





  if (submitted) {
    return (
      <div style={MS.overlay} onClick={onClose}>
        <div style={{ ...MS.modal, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <FaCheckCircle size={56} color="#22c55e" />
            <h2 style={{ color: "#111827", marginTop: 18, fontSize: 24, fontWeight: 800 }}>Flight Booked! <FaCheckCircle /></h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginTop: 8, lineHeight: 1.7 }}>
              Your booking for <strong style={{ color: meta.color }}>{flight.airline} {flight.flightNo}</strong> has been confirmed.
            </p>
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 20, marginTop: 20, textAlign: "left", border: "1px solid #E5E7EB" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Route</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.from.split(" (")[0]} → {flight.to.split(" (")[0]}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Date</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Departure</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.departure} · T{flight.terminal.dep}</div></div>

                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Arrival</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.arrival} · T{flight.terminal.arr}</div></div>

                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Passengers</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{formData.passengers.map(p => p.name || "Passenger").join(", ")}</div></div>
                <div><div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Class</div><div style={{ color: "#111827", fontSize: 13, fontWeight: 600, marginTop: 2 }}>{flight.class}</div></div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase" }}>Total Paid</div>
                  <div style={{ color: "#059669", fontSize: 20, fontWeight: 900, marginTop: 2 }}>₹{grandTotal.toLocaleString()}</div>

                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 14, background: "rgba(37,99,235,0.06)", borderRadius: 12, border: "1px solid rgba(37,99,235,0.15)", fontSize: 12, color: "#2563EB", lineHeight: 1.6 }}>
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
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>{flight.airline} · {flight.flightNo}</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#6B7280", fontSize: 13 }}>
              {flight.from.split(" (")[0]} → {flight.to.split(" (")[0]}

              <span style={{ margin: "0 4px", color: "#334155" }}>·</span>

              <span style={{ color: "#3b82f6", fontWeight: 700 }}>{flight.departure} - {flight.arrival}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", fontSize: 16, flexShrink: 0 }}>
            <FaTimes />
          </button>
        </div>

        {/* Official Airline Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))",
          border: `1px solid ${meta.color}40`,
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: meta.color, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🌐 Direct Official {flight.airline} Portal</span>
            </div>
            <div style={{ fontSize: 11, color: "#4B5563", marginTop: 3 }}>
              Official Site: <strong>{getOfficialBookingUrl(flight).replace("https://www.", "")}</strong>
            </div>
          </div>
          <a
            href={getOfficialBookingUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: meta.color,
              color: "white",
              padding: "8px 14px",
              borderRadius: 9,
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          >
            Open Official Site <FaExternalLinkAlt size={11} />
          </a>
        </div>

        {/* Route Summary Strip */}
        <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "14px 20px", marginBottom: 20, border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#1F2937" }}>{flight.departure}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 2, background: meta.color, borderRadius: 2 }} />
              <FaPlane size={12} color={meta.color} />
              <div style={{ width: 30, height: 2, background: "#8b5cf6", borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#1F2937" }}>{flight.arrival}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={S.flightBadge}>{flight.class}</span>
            <span style={S.flightBadge}>{flight.duration}</span>
          </div>
        </div>

        <form onSubmit={handleFlightSubmit}>

          {/* Passenger Details */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
            Passenger Details ({formData.passengers.length})
          </div>
          {formData.passengers.map((p, idx) => (
            <div key={idx} style={{
              background: "#F9FAFB", borderRadius: 14, padding: "16px 18px", marginBottom: 14,
              border: "1px solid #E5E7EB",
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Contact Information</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Preferences</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Add-ons</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {[
              { key: "addBaggage", label: <span><FaSuitcaseRolling style={{ marginRight: 6 }} />Extra 10 kg Baggage</span>, price: `₹1,200/person`, checked: formData.addBaggage },
              { key: "travelInsurance", label: <span><FaShieldAlt style={{ marginRight: 6 }} />Travel Insurance</span>, price: `₹499/person`, checked: formData.travelInsurance },
            ].map(addon => (
              <label key={addon.key} style={{
                flex: 1, background: addon.checked ? "rgba(37,99,235,0.07)" : "#F9FAFB",
                border: addon.checked ? "2px solid #2563EB" : "1px solid #E5E7EB",
                borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input type="checkbox" checked={addon.checked} onChange={e => update(addon.key, e.target.checked)} style={{ accentColor: "#3b82f6", marginTop: 3, width: 16, height: 16 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{addon.label}</div>
                    <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 3, fontWeight: 600 }}>{addon.price}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Payment Method */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Payment</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {[{ key: "card", label: "Credit / Debit Card" }, { key: "upi", label: "UPI" }].map(m => (

              <button key={m.key} type="button" onClick={() => update("paymentMethod", m.key)} style={{
                flex: 1, padding: "12px 10px", borderRadius: 10,
                border: formData.paymentMethod === m.key ? "2px solid #2563EB" : "1px solid #E5E7EB",
                background: formData.paymentMethod === m.key ? "rgba(37,99,235,0.08)" : "#F9FAFB",
                color: formData.paymentMethod === m.key ? "#2563EB" : "#6B7280",
                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
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
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 18, marginBottom: 20, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Price Breakdown</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B7280" }}>
              <span>Base Fare ({formData.passengers.length} x ₹{flight.price.toLocaleString()})</span>

              <span style={{ color: "#111827", fontWeight: 600 }}>₹{totalPrice.toLocaleString()}</span>

            </div>
            {addons.map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#6B7280" }}>
                <span>{a.label}</span>
                <span style={{ color: "#111827", fontWeight: 600 }}>₹{a.price.toLocaleString()}</span>

              </div>
            ))}
            <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Grand Total</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#059669" }}>₹{grandTotal.toLocaleString()}</span>

            </div>
          </div>

          {/* Terms */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} style={{ accentColor: "#3b82f6", marginTop: 3, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
              <span>I accept the cancellation policy ({flight.cancellationFee} cancellation fee) and agree to the booking terms.</span>
            </label>
          </div>

          <button type="submit" disabled={!termsAccepted} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: termsAccepted ? `linear-gradient(to right, ${meta.color}, #7C3AED)` : "#E5E7EB",
            color: termsAccepted ? "white" : "#9CA3AF", fontWeight: 700, fontSize: 15,
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
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 20,
  },
  modal: {
    background: "#FFFFFF", borderRadius: 24, padding: 32,
    width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
    border: "1px solid #E5E7EB", boxShadow: "0 25px 60px rgba(15,23,42,0.20)",
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
  const [selectedAnalysisItem, setSelectedAnalysisItem] = useState(null);
  const [analysisItemType, setAnalysisItemType] = useState("hotel");
  const [liveTracker, setLiveTracker] = useState([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [liveFlightResults, setLiveFlightResults] = useState(null);
  const [flightSource, setFlightSource] = useState("static");
  const [flightSearchLoading, setFlightSearchLoading] = useState(false);
  const [selectedHotelForCalendar, setSelectedHotelForCalendar] = useState(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("All");
  const [locationParam, setLocationParam] = useState("");
  const [transportCategoryFilter, setTransportCategoryFilter] = useState("all");
  const [liveHotelsList, setLiveHotelsList] = useState(HOTELS);
  const [liveDestinationsList, setLiveDestinationsList] = useState(PLACES);

  useEffect(() => {
    fetchBackendHotels();
    fetchBackendDestinations();
  }, []);

  const fetchBackendDestinations = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/destinations");
      if (res.data && res.data.length > 0) {
        setLiveDestinationsList(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch live destinations from backend, using fallback:", err);
    }
  };

  const fetchBackendHotels = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/hotels?status=Active");
      if (res.data && res.data.length > 0) {
        setLiveHotelsList(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch live hotels from backend, using fallback:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    const tab = params.get("tab") || "places";
    const date = params.get("date") || "";
    const loc = params.get("location") || "";
    const country = params.get("country") || "";

    setQuery(q);
    setActiveTab(tab);
    if (date) {
      setFlightDate(date);
    }
    if (country) {
      setSelectedCountryFilter(country);
    }
    if (loc) {
      setLocationParam(loc);
    }
  }, [location.search]);

  const toggleWishlist = (id) =>
    setWishlist(w => w.includes(id) ? w.filter(i => i !== id) : [...w, id]);

  const handleDirectFlightBooking = async (flight) => {
    const url = getOfficialBookingUrl(flight);
    window.open(url, "_blank", "noopener,noreferrer");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post("http://127.0.0.1:5000/book-flight", {
        userEmail: user?.email || "guest@example.com",
        flightName: flight.airline,
        flightNo: flight.flightNo,
        from: flight.from,
        to: flight.to,
        departureDate: flightDate || new Date().toISOString().split("T")[0],
        departure: flight.departure,
        arrival: flight.arrival,
        passengers: passengers || 1,
        price: flight.price,
      });
    } catch (err) {
      console.warn("Could not record flight booking:", err);
    }

    alert(`Redirecting to official ${flight.airline} website to complete your booking. Official e-tickets are generated directly by the airline.`);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setFlightSearchLoading(true);
    setLiveFlightResults(null);
    try {
      const { results, source } = await searchFlights({
        from: flightFrom,
        to: flightTo,
        date: flightDate,
        limit: 20,
      });
      setLiveFlightResults(results);
      setFlightSource(source);
    } catch (err) {
      console.error("Flight search error:", err);
      setFlightSource("static");
    } finally {
      setFlightSearchLoading(false);
    }
  };

  const filterAndSort = (items) => {
    let filtered = items.filter(i =>
      !query || JSON.stringify(i).toLowerCase().includes(query.toLowerCase())
    );
    if (minRating > 0) filtered = filtered.filter(i => (i.rating || 0) >= minRating);
    filtered.sort((a, b) => sortBy === "rating" ? (b.rating || 0) - (a.rating || 0) : 0);
    return filtered;
  };

  const filterHotels = (items) => {
    let result = items.filter(h => {
      if (minRating > 0 && h.rating < minRating) return false;

      if (query.trim()) {
        const qLower = query.toLowerCase();
        const matchName = (h.name || "").toLowerCase().includes(qLower);
        const matchLoc = (h.location || "").toLowerCase().includes(qLower);
        const matchCountry = (h.country || "").toLowerCase().includes(qLower);
        if (!matchName && !matchLoc && !matchCountry) return false;
      }

      if (locationParam.trim()) {
        const locLower = locationParam.toLowerCase();
        const matchLoc = (h.location || "").toLowerCase().includes(locLower);
        const matchCountry = (h.country || "").toLowerCase().includes(locLower);
        const matchName = (h.name || "").toLowerCase().includes(locLower);
        if (!matchLoc && !matchCountry && !matchName) return false;
      }

      if (selectedCountryFilter !== "All") {
        const countryLower = selectedCountryFilter.toLowerCase();
        const hCountry = (h.country || "").toLowerCase();
        const hLoc = (h.location || "").toLowerCase();

        const matchCountry = hCountry.includes(countryLower) || hLoc.includes(countryLower) || countryLower.includes(hCountry);
        if (!matchCountry) return false;
      }

      return true;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "price") {
      result.sort((a, b) => {
        const pA = typeof a.pricePerNight === "number" ? a.pricePerNight : (parseInt(String(a.price).replace(/[^0-9]/g, "")) || 0);
        const pB = typeof b.pricePerNight === "number" ? b.pricePerNight : (parseInt(String(b.price).replace(/[^0-9]/g, "")) || 0);
        return pA - pB;
      });
    }

    return result;
  };

  const places = filterAndSort(liveDestinationsList);
  const hotels = filterHotels(liveHotelsList);

  // Flight filtering & sorting — uses live results when available, falls back to static
  const filterFlights = () => {
    let pool = liveFlightResults !== null ? liveFlightResults : [...FLIGHTS, ...BUSES, ...TRAINS];

    if (transportCategoryFilter === "flights") {
      pool = pool.filter(i => (i.type || "flight") === "flight" || i.airline);
    } else if (transportCategoryFilter === "buses") {
      pool = pool.filter(i => (i.type || i.category) === "bus");
    } else if (transportCategoryFilter === "trains") {
      pool = pool.filter(i => (i.type || i.category) === "train");
    }

    let f = pool.filter(fl =>
      (flightClass === "All" || (fl.class || "").toLowerCase().includes(flightClass.toLowerCase()))
    );

    if (query) {
      f = f.filter(fl => JSON.stringify(fl).toLowerCase().includes(query.toLowerCase()));
    }

    if (liveFlightResults === null) {
      f = f.filter(fl =>
        (!flightFrom || fl.from.toLowerCase().includes(flightFrom.toLowerCase())) &&
        (!flightTo || fl.to.toLowerCase().includes(flightTo.toLowerCase()))
      );
    }
    if (flightSort === "price") f.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (flightSort === "duration") f.sort((a, b) => (a.duration || "").localeCompare(b.duration || ""));
    else if (flightSort === "departure") f.sort((a, b) => (a.departure || "").localeCompare(b.departure || ""));
    return f;
  };

  // Live tracker — tries Flask proxy first, falls back to legacy fetchLiveFlights
  const loadLiveTracker = async () => {
    setTrackerLoading(true);
    setShowTracker(true);
    try {
      const resp = await fetch("http://127.0.0.1:5000/api/flights/live?limit=15", {
        signal: AbortSignal.timeout(8000),
      });
      if (resp.ok) {
        const body = await resp.json();
        if (body.success && body.data && body.data.length > 0) {
          setLiveTracker(body.data.slice(0, 10));
          setTrackerLoading(false);
          return;
        }
      }
    } catch (_) {}
    // Fallback to legacy fetchLiveFlights
    const data = await fetchLiveFlights({});
    setLiveTracker(data.slice(0, 10));
    setTrackerLoading(false);
  };

  const flights = filterFlights();

  const counts = { places: places.length, hotels: hotels.length, flights: flights.length };
  const currentCount = counts[activeTab];

  const statusColors = { scheduled: "#3b82f6", active: "#22c55e", landed: "#8b5cf6", delayed: "#ef4444", unknown: "#64748b" };

  const flightCalendarReady = flightFrom.trim() && flightTo.trim() && flightDate;

  return (
    <div className="sr-page" style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <SharedNavbar activeTab={activeTab === "places" ? "destinations" : activeTab} />

      <style>{`
        @keyframes sr-calendarSlide {
          from { opacity:0; transform:translateY(-12px) scaleY(.96); }
          to   { opacity:1; transform:translateY(0) scaleY(1); }
        }
        .sr-live-row:hover { background: rgba(37,99,235,0.03) !important; }
      `}</style>

      <div className="sr-main">
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "16px 24px 48px" }}>

          {/* Top bar: back + search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <button
              onClick={() => navigate("/home")}
              className="sr-btn-ghost sr-btn-sm"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <FaArrowLeft size={11} /> Back
            </button>
            <SearchAutocomplete
              value={query}
              onChange={setQuery}
              type={activeTab === "places" ? "destinations" : activeTab === "hotels" ? "hotels" : activeTab === "flights" ? "travel" : "all"}
              placeholder={
                activeTab === "places" ? "Search destinations, cities, countries..." :
                activeTab === "hotels" ? "Search hotels, resorts, locations..." :
                activeTab === "flights" ? "Search flight routes, airlines, buses, trains..." :
                "Search experiences, destinations, hotels..."
              }
              onSelect={(item, title) => {
                setQuery(title);
              }}
              onSubmit={(val) => {
                setQuery(val);
              }}
              style={{ flex: 1 }}
              inputStyle={{
                background: "#FFFFFF",
                color: "#0F172A",
                borderColor: "#E2E8F0",
                fontSize: 14,
                borderRadius: 12
              }}
            />
          </div>

          {/* Inline filter bar */}
          <div className="sr-filter-bar">
            <FaSlidersH size={12} color="#3b82f6" />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginRight: 2 }}>Filters</span>
            <div style={{ width: 1, height: 16, background: "rgba(148,163,184,0.15)", margin: "0 2px" }} />

            {[{ v: 0, l: "All" }, { v: 4, l: "4+ Stars" }, { v: 4.5, l: "4.5+ Stars" }, { v: 4.8, l: "4.8+ Stars" }].map(({ v, l }) => (
              <button key={v} className={`sr-filter-pill${minRating === v ? " active" : ""}`}
                onClick={() => setMinRating(v)}>{l}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sr-filter-select">
                <option value="rating">Top Rated</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          {/* Results header */}
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#1F2937" }}>
                <FaMapMarkerAlt size={16} style={{ marginRight: 6 }} />Destinations
              </h2>
              <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                {loading ? "Searching..." : `${currentCount} result${currentCount !== 1 ? "s" : ""} found`}
                {query && ` for "${query}"`}
              </p>
            </div>
            {!loading && currentCount > 0 && (
              <button
                onClick={() => { setQuery(""); setMinRating(0); setFlightFrom(""); setFlightTo(""); setFlightClass("All"); }}
                style={{ fontSize: 11, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Card grid / skeleton / empty */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="sr-skeleton" style={{ height: 270 }} />
              ))}
            </div>
          ) : currentCount === 0 ? (
            <div className="sr-empty">
              <div className="sr-empty-icon"><FaSearch size={36} /></div>
              <h3>No results found</h3>
              <p>Try a different search term or clear your filters.</p>
              <button className="sr-btn" onClick={() => { setQuery(""); setMinRating(0); setFlightFrom(""); setFlightTo(""); setFlightClass("All"); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {places.map(item => (
                <PlaceCard key={item.id} item={item} wishlist={wishlist} toggleWishlist={toggleWishlist}
                  onExplore={id => navigate(`/explore/${id}`)}
                  onFeedbackAnalysis={(dest) => {
                    setSelectedAnalysisItem(dest);
                    setAnalysisItemType("destination");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {bookingHotel && <BookingModal hotel={bookingHotel} onClose={() => setBookingHotel(null)} />}
      {selectedFlight && <FlightDetailsModal flight={selectedFlight} onClose={() => setSelectedFlight(null)} onBook={handleDirectFlightBooking} />}
      {bookingFlight && <FlightBookingModal flight={bookingFlight} passengers={passengers} onClose={() => setBookingFlight(null)} />}
      {selectedAnalysisItem && <FeedbackAnalysisModal item={selectedAnalysisItem} itemType={analysisItemType} onClose={() => setSelectedAnalysisItem(null)} />}
    </div>
  );
}

const S = {
  card: { background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #E8EDF5", boxShadow: "0 4px 16px rgba(15,23,42,.06)", transition: "transform .25s cubic-bezier(.34,1.56,.64,1), border-color .25s, box-shadow .25s" },
  cardImg: { width: "100%", height: 155, objectFit: "cover", display: "block" },
  cardBody: { padding: "12px 14px" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#1F2937", margin: 0 },
  ratingText: { fontSize: 11, color: "#64748B" },
  price: { fontSize: 15, fontWeight: 800, color: "#2563EB" },
  priceLabel: { fontSize: 10, color: "#9CA3AF" },
  tag: { fontSize: 10, padding: "2px 8px", borderRadius: 16, background: "#EEF4FF", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.20)" },
  amenity: { display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#2563EB", background: "#EEF4FF", padding: "2px 8px", borderRadius: 16, border: "1px solid rgba(59,130,246,0.15)" },
  heartBtn: { position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  catBadge: { position: "absolute", bottom: 8, left: 8, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)", color: "#374151", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 16, border: "1px solid rgba(0,0,0,0.08)" },
  actionBtn: { background: "linear-gradient(135deg,#2563EB,#3B82F6)", border: "none", color: "white", padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, transition: "all .2s", fontFamily: "inherit", boxShadow: "0 3px 10px rgba(37,99,235,0.22)" },
  flightBadge: { fontSize: 10, color: "#2563EB", background: "#EEF4FF", padding: "2px 8px", borderRadius: 16, border: "1px solid rgba(59,130,246,0.20)", display: "inline-flex", alignItems: "center", gap: 3 },
};