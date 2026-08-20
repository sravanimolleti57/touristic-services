import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SharedNavbar from "../components/SharedNavbar";
import {
  FaStar, FaMapMarkerAlt, FaBed, FaWifi, FaCoffee, FaConciergeBell,
  FaArrowLeft, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUsers,
  FaInfoCircle, FaShieldAlt, FaPhone, FaEnvelope, FaUser, FaTag,
  FaSwimmingPool, FaDumbbell, FaCar, FaUtensils, FaSnowflake, FaClock,
  FaChevronRight, FaTicketAlt, FaSuitcase, FaBrain, FaThumbsUp, FaThumbsDown
} from "react-icons/fa";
import axios from "axios";
import { analyzeReviewText } from "../utils/reviewAnalytics";

const AMENITY_ICONS = {
  wifi: <FaWifi />, pool: <FaSwimmingPool />, gym: <FaDumbbell />,
  parking: <FaCar />, restaurant: <FaUtensils />, ac: <FaSnowflake />
};

export default function HotelDetails() {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState("");

  // AI Sentiment Analysis State
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [sentimentError, setSentimentError] = useState(null);

  // Dates & Occupancy
  const getTomorrowStr = (d = new Date()) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split("T")[0];
  };
  const getDayAfterTomorrowStr = (d = new Date()) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 2);
    return next.toISOString().split("T")[0];
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(getTomorrowStr());
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrowStr());
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  // Availability state
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [availResult, setAvailResult] = useState(null);
  const [availError, setAvailError] = useState(null);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [guestForm, setGuestForm] = useState({
    fullName: loggedUser.name || "",
    email: loggedUser.email || "",
    phone: "",
    specialRequests: ""
  });

  useEffect(() => {
    setSentimentData(null);
    fetchHotelData();
  }, [hotelId]);

  const fetchHotelData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/hotels/${hotelId}`);
      if (res.data) {
        setHotel(res.data);
        const mainImg = res.data.img || (res.data.images && res.data.images[0]) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";
        setSelectedImg(mainImg);
        if (res.data.roomTypes && res.data.roomTypes.length > 0) {
          setSelectedRoomType(res.data.roomTypes[0]);
        }
        // Fetch AI Sentiment Analysis strictly for this hotel
        fetchSentimentAnalysis(res.data.name, res.data.destinationName || res.data.location);
      }
    } catch (err) {
      console.warn("Error loading hotel from API, trying fallback:", err);
      setError("Unable to load live hotel details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentimentAnalysis = async (hIdent, dIdent) => {
    setSentimentLoading(true);
    setSentimentError(null);
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/hotel-sentiment-analysis`, {
        params: {
          hotelName: hIdent,
          destinationName: dIdent
        },
        timeout: 4000
      });
      if (res.data) {
        setSentimentData(res.data);
      }
    } catch (err) {
      console.warn("Backend hotel sentiment analysis fallback:", err);
      // Client-side fallback using actual database reviews
      try {
        const revRes = await axios.get(`http://127.0.0.1:5000/api/reviews`, {
          params: { hotelName: hIdent },
          timeout: 3000
        });
        const matched = Array.isArray(revRes.data) ? revRes.data.filter(r => {
          const hName = (r.hotelName || r.hostelName || "").toLowerCase();
          const target = (hIdent || "").toLowerCase();
          return hName.includes(target) || target.includes(hName);
        }) : [];

        if (matched.length > 0) {
          const clientAnalysis = analyzeReviewText(matched);
          setSentimentData({
            hotelName: hIdent,
            totalReviews: clientAnalysis.totalReviews,
            avgRating: clientAnalysis.avgRating,
            positivePercentage: clientAnalysis.emotionPieData.find(e => e.name === "Positive")?.value || 0,
            neutralPercentage: clientAnalysis.emotionPieData.find(e => e.name === "Neutral")?.value || 0,
            negativePercentage: clientAnalysis.emotionPieData.find(e => e.name === "Negative")?.value || 0,
            overallSentiment: clientAnalysis.overallSentimentLabel === "Positive" ? "Very Positive" : clientAnalysis.overallSentimentLabel,
            summary: clientAnalysis.aiSummary,
            positiveHighlights: clientAnalysis.pros,
            commonConcerns: clientAnalysis.cons,
            recentReviews: matched.slice(0, 8).map(r => ({
              _id: r._id,
              user: r.user || r.userName || "Verified Guest",
              rating: r.rating || "5",
              text: r.text || r.review || "",
              sentiment: r.sentiment || "Positive",
              createdAt: r.createdAt || new Date().toISOString()
            })),
            isReliable: matched.length >= 2
          });
        } else {
          setSentimentData({
            hotelName: hIdent,
            totalReviews: 0,
            avgRating: 4.8,
            positivePercentage: 0,
            neutralPercentage: 0,
            negativePercentage: 0,
            overallSentiment: "No Reviews",
            summary: "No guest reviews available yet.",
            positiveHighlights: [],
            commonConcerns: [],
            recentReviews: [],
            isReliable: false
          });
        }
      } catch (clientErr) {
        setSentimentError("AI review analysis is temporarily unavailable.");
      }
    } finally {
      setSentimentLoading(false);
    }
  };

  // Check Availability
  const handleCheckAvailability = async () => {
    if (!hotel) return;
    if (!checkIn || !checkOut) {
      setAvailError("Please select both Check-in and Check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setAvailError("Check-out date must be strictly after Check-in date.");
      return;
    }

    setCheckingAvail(true);
    setAvailError(null);
    setAvailResult(null);

    try {
      const hId = hotel._id || hotel.id || hotelId;
      const res = await axios.get(
        `http://127.0.0.1:5000/api/hotels/${hId}/availability?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`
      );
      setAvailResult(res.data);

      // If room types returned with live availability, update selected room type if unavailable
      if (res.data.roomTypes && res.data.roomTypes.length > 0) {
        const currentId = selectedRoomType?.id;
        const matching = res.data.roomTypes.find(rt => rt.id === currentId);
        if (matching) {
          setSelectedRoomType(matching);
        } else {
          setSelectedRoomType(res.data.roomTypes[0]);
        }
      }
    } catch (err) {
      console.error("Availability check failed:", err);
      setAvailError(err.response?.data?.message || "Failed to check availability.");
    } finally {
      setCheckingAvail(false);
    }
  };

  // Run initial availability check once hotel is loaded
  useEffect(() => {
    if (hotel) {
      handleCheckAvailability();
    }
  }, [hotel, checkIn, checkOut, rooms]);

  // Calculations
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    const diff = Math.ceil((dOut - dIn) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const pricePerNight = selectedRoomType ? Number(selectedRoomType.pricePerNight) : Number(hotel?.pricePerNight || 5000);
  const subtotal = pricePerNight * nights * rooms;
  const taxes = Math.round(subtotal * 0.12);
  const grandTotal = subtotal + taxes;

  const isRoomAvailable = () => {
    if (!availResult) return true;
    if (selectedRoomType && selectedRoomType.availableRooms !== undefined) {
      return selectedRoomType.availableRooms >= rooms;
    }
    return availResult.isAvailable && availResult.availableRooms >= rooms;
  };

  const getAvailableRoomsCount = () => {
    if (selectedRoomType && selectedRoomType.availableRooms !== undefined) {
      return selectedRoomType.availableRooms;
    }
    if (availResult && availResult.availableRooms !== undefined) {
      return availResult.availableRooms;
    }
    return hotel?.availableRooms ?? hotel?.totalRooms ?? 20;
  };

  const availableCount = getAvailableRoomsCount();

  // Booking Submission
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!guestForm.fullName.trim() || !guestForm.email.trim()) {
      alert("Please provide customer name and email address.");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        hotelId: hotel._id || hotel.id || hotelId,
        hotelName: hotel.name,
        destinationId: hotel.destinationId || "",
        destinationName: hotel.destinationName || "",
        location: hotel.location,
        customerName: guestForm.fullName.trim(),
        userEmail: guestForm.email.trim().toLowerCase(),
        customerEmail: guestForm.email.trim().toLowerCase(),
        phone: guestForm.phone.trim() || "N/A",
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        rooms: Number(rooms),
        guests: Number(guests),
        roomTypeId: selectedRoomType?.id || "rt-standard",
        roomType: selectedRoomType?.name || "Standard Deluxe Room",
        pricePerNight: pricePerNight,
        subtotal: subtotal,
        taxes: taxes,
        totalAmount: grandTotal,
        specialRequests: guestForm.specialRequests,
        status: "Confirmed"
      };

      const res = await axios.post("http://127.0.0.1:5000/book-hotel", payload);

      setBookingSuccess({
        bookingId: res.data.bookingId,
        hotelName: hotel.name,
        roomType: selectedRoomType?.name || "Standard Deluxe Room",
        checkIn,
        checkOut,
        nights,
        rooms,
        guests,
        totalAmount: grandTotal,
        customerName: guestForm.fullName
      });

      // Refresh hotel data & availability
      fetchHotelData();
      handleCheckAvailability();
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.message || "Booking submission failed. Please check availability.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SharedNavbar activeTab="hotels" />
        <div style={{
          minHeight: "100vh", background: "#F8FAFC", paddingTop: 120,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            width: 48, height: 48, border: "4px solid #E2E8F0", borderTop: "4px solid #2563EB",
            borderRadius: "50%", animation: "spin 1s linear infinite"
          }} />
          <p style={{ marginTop: 16, color: "#64748B", fontWeight: 600 }}>Loading hotel reservation details...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  if (error || !hotel) {
    return (
      <>
        <SharedNavbar activeTab="hotels" />
        <div style={{
          minHeight: "100vh", background: "#F8FAFC", paddingTop: 140,
          display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px"
        }}>
          <div style={{
            background: "#FFFFFF", padding: "40px 32px", borderRadius: 20,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0",
            maxWidth: 500, textAlign: "center"
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏨</div>
            <h2 style={{ color: "#1E293B", fontWeight: 800, margin: "0 0 8px" }}>Hotel Not Found</h2>
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              {error || "The hotel you requested could not be located in our active database."}
            </p>
            <button
              onClick={() => navigate("/search?tab=hotels")}
              style={{
                background: "#2563EB", color: "#FFFFFF", border: "none",
                padding: "12px 24px", borderRadius: 12, fontWeight: 700,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
              }}
            >
              <FaArrowLeft /> Browse All Hotels
            </button>
          </div>
        </div>
      </>
    );
  }

  const galleryImages = hotel.images && hotel.images.length > 0
    ? hotel.images
    : [hotel.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"];

  const roomTypesList = (availResult && availResult.roomTypes) || hotel.roomTypes || [
    {
      id: "rt-standard",
      name: "Standard Deluxe Room",
      pricePerNight: hotel.pricePerNight || 5000,
      totalRooms: hotel.totalRooms || 20,
      availableRooms: hotel.availableRooms || 20,
      maxGuests: 2,
      amenities: ["Free Wi-Fi", "Air Conditioning", "King Bed", "City View"]
    }
  ];

  return (
    <>
      <SharedNavbar activeTab="hotels" />
      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#1E293B",
        padding: "76px 24px 44px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>

          {/* Navigation Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button
              onClick={() => navigate("/search?tab=hotels")}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                color: "#475569",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                fontSize: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#2563EB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.color = "#475569"; }}
            >
              <FaArrowLeft size={11} /> Back to Hotels
            </button>
            <span style={{ color: "#94A3B8" }}>/</span>
            <span style={{ color: "#64748B", fontSize: 12 }}>{hotel.location}</span>
            <span style={{ color: "#94A3B8" }}>/</span>
            <span style={{ color: "#2563EB", fontWeight: 700, fontSize: 12 }}>{hotel.name}</span>
          </div>

          {/* Hotel Title & Header Summary */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: "18px 22px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 14
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{
                  background: hotel.status === "Deactivated" ? "#FEF2F2" : "#EFF6FF",
                  color: hotel.status === "Deactivated" ? "#DC2626" : "#2563EB",
                  fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                  border: hotel.status === "Deactivated" ? "1px solid #FCA5A5" : "1px solid #BFDBFE"
                }}>
                  {hotel.status || "Active"}
                </span>
                <span style={{
                  background: "#FEF3C7", color: "#B45309", fontSize: 12, fontWeight: 800,
                  padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4
                }}>
                  <FaStar /> {hotel.rating || 4.8} ({hotel.reviewsCount || 240}+ reviews)
                </span>
                <span style={{ color: "#64748B", fontSize: 12 }}>
                  📍 {hotel.country || "India"}
                </span>
              </div>

              <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#0F172A", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
                {hotel.name}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 14 }}>
                <FaMapMarkerAlt color="#EF4444" />
                <span>{hotel.location}</span>
              </div>
            </div>

            {/* Price Tag */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                Starting From
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#2563EB" }}>
                ₹{Number(hotel.pricePerNight || 5000).toLocaleString("en-IN")}
                <span style={{ fontSize: "0.95rem", color: "#64748B", fontWeight: 500 }}> /night</span>
              </div>
              <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginTop: 2 }}>
                ✓ Best Rate Guarantee
              </div>
            </div>
          </div>

          {/* Main Grid: Gallery & Details on Left, Booking Box on Right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }} className="hotel-details-grid">

            {/* LEFT COLUMN: Gallery, Description, Room Types, Amenities */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

              {/* Photo Gallery */}
              <div style={{
                background: "#FFFFFF", borderRadius: 20, overflow: "hidden",
                border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}>
                <div style={{ position: "relative", height: 420, background: "#E2E8F0", overflow: "hidden" }}>
                  <img
                    src={selectedImg || galleryImages[0]}
                    alt={hotel.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s ease" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 16, right: 16,
                    background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)",
                    color: "#FFFFFF", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700
                  }}>
                    📷 {galleryImages.length} Photos Available
                  </div>
                </div>

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div style={{ display: "flex", gap: 10, padding: 16, overflowX: "auto" }}>
                    {galleryImages.map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        onClick={() => setSelectedImg(imgUrl)}
                        style={{
                          width: 80, height: 60, objectFit: "cover", borderRadius: 10, cursor: "pointer",
                          border: selectedImg === imgUrl ? "2px solid #2563EB" : "2px solid transparent",
                          opacity: selectedImg === imgUrl ? 1 : 0.7,
                          transition: "all 0.2s"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Description & Key Info */}
              <div style={{
                background: "#FFFFFF", borderRadius: 20, padding: 32,
                border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
              }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 14px", color: "#0F172A" }}>
                  About the Property
                </h3>
                <p style={{ color: "#475569", lineHeight: 1.7, fontSize: 14, margin: "0 0 24px" }}>
                  {hotel.description || "Experience palatial luxury, bespoke hospitality, and modern amenities."}
                </p>

                {/* Timings & Policies */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
                  padding: "16px 20px", background: "#F8FAFC", borderRadius: 14, border: "1px solid #E2E8F0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaClock />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Check-in Time</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>{hotel.checkInTime || "14:00"} onwards</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaClock />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Check-out Time</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>Before {hotel.checkOutTime || "11:00"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Grid */}
              <div style={{
                background: "#FFFFFF", borderRadius: 16, padding: "22px 26px",
                border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
              }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 14px", color: "#0F172A" }}>
                  Popular Amenities &amp; Services
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                  {(hotel.amenities || ["Free High-Speed Wi-Fi", "Air Conditioning", "Swimming Pool", "Restaurant", "24/7 Front Desk"]).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 10, background: "#F8FAFC",
                        border: "1px solid #E2E8F0", color: "#334155", fontSize: 12, fontWeight: 600
                      }}
                    >
                      <span style={{ color: "#2563EB", fontWeight: 800 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── AI HOTEL SENTIMENT ANALYSIS & REVIEW SUMMARY ── */}
              <div style={{
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "22px 26px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                position: "relative",
                overflow: "hidden"
              }}>
                {/* Subtle decorative glow */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 160, height: 160, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
                  pointerEvents: "none"
                }} />

                {/* Header Badge & Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{
                        background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.1))",
                        color: "#2563EB",
                        border: "1px solid rgba(37,99,235,0.2)",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        letterSpacing: "0.5px"
                      }}>
                        <FaBrain /> AI HOTEL SENTIMENT ANALYSIS
                      </span>
                      {sentimentData && sentimentData.overallSentiment !== "No Reviews" && (
                        <span style={{
                          background: sentimentData.positivePercentage >= 70 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                          color: sentimentData.positivePercentage >= 70 ? "#059669" : "#D97706",
                          border: sentimentData.positivePercentage >= 70 ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(245,158,11,0.25)",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800
                        }}>
                          Overall: {sentimentData.overallSentiment}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0F172A", margin: "2px 0 2px" }}>
                      Guest Emotion &amp; Sentiment Insights
                    </h3>
                    <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>
                      Synthesized review intelligence specific to {hotel.name} in {hotel.location}.
                    </p>
                  </div>

                  {sentimentData && sentimentData.totalReviews > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F8FAFC", padding: "5px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                      <span style={{ color: "#F59E0B", display: "flex", alignItems: "center", gap: 2 }}>
                        <FaStar size={11} />
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
                        {sentimentData.avgRating} / 5.0
                      </span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>
                        ({sentimentData.totalReviews} verified review{sentimentData.totalReviews > 1 ? "s" : ""})
                      </span>
                    </div>
                  )}
                </div>

                {sentimentLoading ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748B", fontSize: 12 }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #E2E8F0", borderTop: "3px solid #2563EB", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
                    Analyzing verified guest reviews for {hotel.name}...
                  </div>
                ) : sentimentError ? (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 12, fontWeight: 600 }}>
                    {sentimentError} You can still continue your reservation below.
                  </div>
                ) : sentimentData && sentimentData.totalReviews === 0 ? (
                  <div style={{ background: "#F8FAFC", border: "1px dashed #CBD5E1", borderRadius: 12, padding: "18px", textAlign: "center", color: "#64748B", fontSize: 12 }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>📝</div>
                    <strong style={{ color: "#0F172A" }}>No guest reviews available yet</strong>
                    <p style={{ margin: "3px 0 0", fontSize: 11 }}>Be the first guest to share feedback and review your stay at {hotel.name}!</p>
                  </div>
                ) : (
                  <div>
                    {/* Visual Sentiment Breakdown Bars */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 11 }}>
                        <span style={{ fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sentiment Breakdown</span>
                        <span style={{ color: "#64748B" }}>Based on {sentimentData?.totalReviews} verified review{sentimentData?.totalReviews > 1 ? "s" : ""}</span>
                      </div>

                      {/* Multi-segment progress bar */}
                      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "#F1F5F9", marginBottom: 8 }}>
                        {sentimentData?.positivePercentage > 0 && (
                          <div style={{ width: `${sentimentData.positivePercentage}%`, background: "#10B981", transition: "width 0.5s ease" }} title={`Positive: ${sentimentData.positivePercentage}%`} />
                        )}
                        {sentimentData?.neutralPercentage > 0 && (
                          <div style={{ width: `${sentimentData.neutralPercentage}%`, background: "#3B82F6", transition: "width 0.5s ease" }} title={`Neutral: ${sentimentData.neutralPercentage}%`} />
                        )}
                        {sentimentData?.negativePercentage > 0 && (
                          <div style={{ width: `${sentimentData.negativePercentage}%`, background: "#EF4444", transition: "width 0.5s ease" }} title={`Negative: ${sentimentData.negativePercentage}%`} />
                        )}
                      </div>

                      {/* Legend pills */}
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                          <span style={{ color: "#374151", fontWeight: 700 }}>Positive</span>
                          <span style={{ color: "#059669", fontWeight: 900 }}>{sentimentData?.positivePercentage}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B82F6" }} />
                          <span style={{ color: "#374151", fontWeight: 700 }}>Neutral</span>
                          <span style={{ color: "#2563EB", fontWeight: 900 }}>{sentimentData?.neutralPercentage}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                          <span style={{ color: "#374151", fontWeight: 700 }}>Negative</span>
                          <span style={{ color: "#DC2626", fontWeight: 900 }}>{sentimentData?.negativePercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Review Summary Block */}
                    <div style={{
                      background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(14,165,233,0.04))",
                      border: "1px solid rgba(37,99,235,0.12)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginBottom: 14
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#2563EB", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
                        <FaBrain /> AI Review Summary
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "#1E293B", lineHeight: 1.5 }}>
                        "{sentimentData?.summary}"
                      </p>
                    </div>

                    {/* Highlights & Concerns Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {/* Most Praised */}
                      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#15803D", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                          <FaThumbsUp size={10} /> Most Praised Aspects
                        </div>
                        {sentimentData?.positiveHighlights?.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11, color: "#166534", display: "flex", flexDirection: "column", gap: 3 }}>
                            {sentimentData.positiveHighlights.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ fontSize: 11, color: "#166534", fontStyle: "italic" }}>No specific praise items recorded</div>
                        )}
                      </div>

                      {/* Common Concerns */}
                      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#991B1B", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                          <FaThumbsDown size={10} /> Common Concerns &amp; Notes
                        </div>
                        {sentimentData?.commonConcerns?.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 11, color: "#991B1B", display: "flex", flexDirection: "column", gap: 3 }}>
                            {sentimentData.commonConcerns.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ fontSize: 11, color: "#065F46", fontStyle: "normal", fontWeight: 600 }}>
                            ✓ No major concerns reported by guests
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RECENT VERIFIED GUEST REVIEWS ── */}
              {sentimentData && sentimentData.recentReviews && sentimentData.recentReviews.length > 0 && (
                <div style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "20px 24px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                        Recent Guest Reviews
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748B" }}>
                        Verified traveler feedback for {hotel.name}.
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>
                      {sentimentData.recentReviews.length} Reviews
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sentimentData.recentReviews.map((rev) => (
                      <div
                        key={rev._id}
                        style={{
                          padding: "10px 12px",
                          background: "#F8FAFC",
                          borderRadius: 8,
                          border: "1px solid #E2E8F0"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%",
                              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                              color: "#FFFFFF", fontSize: 10, fontWeight: 800,
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                              {(rev.user || "G").charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 12, color: "#1E293B" }}>
                              {rev.user}
                            </span>
                            <span style={{ color: "#F59E0B", fontSize: 10, display: "flex", gap: 1 }}>
                              {[...Array(Number(rev.rating || 5))].map((_, i) => (
                                <FaStar key={i} size={9} />
                              ))}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              padding: "2px 6px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                              background: rev.sentiment === "Positive" ? "#DCFCE7" : rev.sentiment === "Negative" ? "#FEE2E2" : "#EFF6FF",
                              color: rev.sentiment === "Positive" ? "#15803D" : rev.sentiment === "Negative" ? "#B91C1C" : "#1D4ED8"
                            }}>
                              {rev.sentiment}
                            </span>
                            <span style={{ fontSize: 10, color: "#94A3B8" }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recently"}
                            </span>
                          </div>
                        </div>

                        <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Types Selection */}
              <div style={{
                background: "#FFFFFF", borderRadius: 16, padding: "22px 26px",
                border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                      Available Room Categories
                    </h3>
                    <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
                      Choose your preferred room type based on occupancy and amenities.
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 700 }}>
                    {roomTypesList.length} Options
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {roomTypesList.map((rt) => {
                    const isSelected = selectedRoomType?.id === rt.id || selectedRoomType?.name === rt.name;
                    const rtAvailable = rt.availableRooms !== undefined ? rt.availableRooms : (hotel.availableRooms || 10);
                    const isAvail = rtAvailable >= rooms;

                    return (
                      <div
                        key={rt.id || rt.name}
                        onClick={() => setSelectedRoomType(rt)}
                        style={{
                          borderRadius: 16,
                          padding: "20px 24px",
                          border: isSelected ? "2px solid #2563EB" : "1px solid #E2E8F0",
                          background: isSelected ? "#F0F7FF" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 4px 16px rgba(37,99,235,0.08)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0F172A" }}>
                                {rt.name}
                              </h4>
                              {isSelected && (
                                <span style={{ background: "#2563EB", color: "#FFFFFF", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12 }}>
                                  Selected
                                </span>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, fontSize: 13, color: "#64748B" }}>
                              <span><FaBed color="#2563EB" /> 1 King / Twin Beds</span>
                              <span><FaUsers color="#2563EB" /> Max {rt.maxGuests || 2} Guests</span>
                              {rtAvailable <= 5 && rtAvailable > 0 && (
                                <span style={{ color: "#DC2626", fontWeight: 700 }}>
                                  ⚡ Only {rtAvailable} left!
                                </span>
                              )}
                              {rtAvailable <= 0 && (
                                <span style={{ color: "#DC2626", fontWeight: 700 }}>
                                  ✕ Sold Out for Selected Dates
                                </span>
                              )}
                            </div>

                            {/* Room Specific Amenities */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                              {(rt.amenities || ["Free Wi-Fi", "Air Conditioning"]).map((a, i) => (
                                <span key={i} style={{ background: "#F1F5F9", color: "#475569", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6 }}>
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Price & Select */}
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#2563EB" }}>
                              ₹{Number(rt.pricePerNight || 5000).toLocaleString("en-IN")}
                              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>/night</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedRoomType(rt); }}
                              style={{
                                marginTop: 8,
                                padding: "6px 16px",
                                borderRadius: 10,
                                border: isSelected ? "none" : "1px solid #2563EB",
                                background: isSelected ? "#2563EB" : "transparent",
                                color: isSelected ? "#FFFFFF" : "#2563EB",
                                fontSize: 12, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              {isSelected ? "✓ Active Choice" : "Select This Room"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Date & Availability Booking Widget */}
            <div style={{ position: "sticky", top: 90 }}>
              <div style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "28px 24px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>Rate Summary</span>
                    <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#0F172A" }}>
                      ₹{pricePerNight.toLocaleString("en-IN")}
                      <span style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 500 }}> /night</span>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div>
                    {isRoomAvailable() ? (
                      <span style={{
                        background: "#DCFCE7", color: "#15803D", padding: "4px 10px",
                        borderRadius: 12, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4
                      }}>
                        <FaCheckCircle /> Available
                      </span>
                    ) : (
                      <span style={{
                        background: "#FEE2E2", color: "#DC2626", padding: "4px 10px",
                        borderRadius: 12, fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4
                      }}>
                        <FaTimesCircle /> Fully Booked
                      </span>
                    )}
                  </div>
                </div>

                {/* Dates & Room Selection Form */}
                <div style={{ background: "#F8FAFC", borderRadius: 16, padding: "16px 14px", border: "1px solid #E2E8F0", marginBottom: 20 }}>
                  
                  {/* Date pickers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        min={todayStr}
                        onChange={e => {
                          setCheckIn(e.target.value);
                          if (checkOut <= e.target.value) {
                            setCheckOut(getTomorrowStr(new Date(e.target.value)));
                          }
                        }}
                        style={{
                          width: "100%", padding: "8px 10px", borderRadius: 8,
                          border: "1px solid #CBD5E1", background: "#FFFFFF",
                          fontSize: 13, color: "#0F172A", fontWeight: 600, outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        min={getTomorrowStr(new Date(checkIn || todayStr))}
                        onChange={e => setCheckOut(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 10px", borderRadius: 8,
                          border: "1px solid #CBD5E1", background: "#FFFFFF",
                          fontSize: 13, color: "#0F172A", fontWeight: 600, outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  {/* Rooms & Guests */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Rooms
                      </label>
                      <select
                        value={rooms}
                        onChange={e => setRooms(Number(e.target.value))}
                        style={{
                          width: "100%", padding: "9px 10px", borderRadius: 8,
                          border: "1px solid #CBD5E1", background: "#FFFFFF",
                          fontSize: 13, color: "#0F172A", fontWeight: 600, outline: "none", cursor: "pointer"
                        }}
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} Room{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                        Guests
                      </label>
                      <select
                        value={guests}
                        onChange={e => setGuests(Number(e.target.value))}
                        style={{
                          width: "100%", padding: "9px 10px", borderRadius: 8,
                          border: "1px solid #CBD5E1", background: "#FFFFFF",
                          fontSize: 13, color: "#0F172A", fontWeight: 600, outline: "none", cursor: "pointer"
                        }}
                      >
                        {[1, 2, 3, 4, 6, 8, 10].map(n => (
                          <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Check Availability CTA */}
                  <button
                    onClick={handleCheckAvailability}
                    disabled={checkingAvail}
                    style={{
                      width: "100%", marginTop: 14, padding: "10px", borderRadius: 10,
                      background: "#FFFFFF", border: "1px solid #2563EB", color: "#2563EB",
                      fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    {checkingAvail ? "Checking..." : "🔄 Refresh Date Availability"}
                  </button>
                </div>

                {/* Availability Notice */}
                {availError && (
                  <div style={{ background: "#FEF2F2", color: "#DC2626", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                    ✕ {availError}
                  </div>
                )}

                {availableCount <= 5 && availableCount > 0 && (
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    ⚡ High demand: Only {availableCount} room(s) left for this period!
                  </div>
                )}

                {/* Price Breakdown Calculation */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B", marginBottom: 8 }}>
                    <span>₹{pricePerNight.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""} × {rooms} room{rooms > 1 ? "s" : ""}</span>
                    <span style={{ fontWeight: 600, color: "#1E293B" }}>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B", marginBottom: 12 }}>
                    <span>Taxes & GST (12%)</span>
                    <span style={{ fontWeight: 600, color: "#1E293B" }}>₹{taxes.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: "#0F172A", borderTop: "1px dashed #CBD5E1", paddingTop: 10 }}>
                    <span>Total Amount</span>
                    <span style={{ color: "#2563EB" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  disabled={!isRoomAvailable()}
                  onClick={() => setShowBookingModal(true)}
                  style={{
                    width: "100%", padding: "14px", borderRadius: 14, border: "none",
                    background: isRoomAvailable()
                      ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)"
                      : "#94A3B8",
                    color: "#FFFFFF", fontWeight: 800, fontSize: 15, cursor: isRoomAvailable() ? "pointer" : "not-allowed",
                    boxShadow: isRoomAvailable() ? "0 6px 20px rgba(37,99,235,0.3)" : "none",
                    transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                  }}
                >
                  {isRoomAvailable() ? "Reserve / Book Now →" : "Fully Booked for Dates"}
                </button>

                <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#94A3B8" }}>
                  🔒 Safe & Instant Reservation · Zero Booking Fees
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Confirmation Modal ── */}
      {showBookingModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1050,
            background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={() => !bookingLoading && setShowBookingModal(false)}
        >
          <div
            style={{
              background: "#FFFFFF", borderRadius: 24, maxWidth: 580, width: "100%",
              overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0", animation: "popIn 0.2s ease"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              color: "#FFFFFF", padding: "24px 28px", position: "relative"
            }}>
              <button
                disabled={bookingLoading}
                onClick={() => setShowBookingModal(false)}
                style={{
                  position: "absolute", top: 18, right: 18,
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF",
                  width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                }}
              >
                ✕
              </button>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.9 }}>
                COMPLETE YOUR RESERVATION
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 900, margin: "4px 0 0" }}>
                {hotel.name}
              </h2>
              <div style={{ fontSize: 13, opacity: 0.95 }}>
                {selectedRoomType?.name || "Standard Deluxe Room"}
              </div>
            </div>

            {/* Modal Content */}
            {bookingSuccess ? (
              <div style={{ padding: "36px 28px", textAlign: "center" }}>
                <div style={{
                  width: 68, height: 68, borderRadius: "50%", background: "#DCFCE7",
                  color: "#16A34A", display: "inline-flex", alignItems: "center",
                  justifyContent: "center", fontSize: 32, marginBottom: 16
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                  Booking Confirmed!
                </h3>
                <p style={{ color: "#64748B", fontSize: 14, margin: "0 0 20px" }}>
                  Your hotel reservation has been confirmed and saved to your account.
                </p>

                {/* Summary Card */}
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: "18px 20px", textAlign: "left", marginBottom: 24, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#64748B" }}>Booking ID:</span>
                    <strong style={{ fontFamily: "monospace", color: "#2563EB" }}>#{String(bookingSuccess.bookingId).slice(-8)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#64748B" }}>Dates:</span>
                    <strong style={{ color: "#0F172A" }}>{bookingSuccess.checkIn} → {bookingSuccess.checkOut} ({bookingSuccess.nights} Nights)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#64748B" }}>Occupancy:</span>
                    <strong style={{ color: "#0F172A" }}>{bookingSuccess.rooms} Room(s), {bookingSuccess.guests} Guest(s)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #CBD5E1", paddingTop: 8 }}>
                    <span style={{ color: "#64748B", fontWeight: 700 }}>Total Paid:</span>
                    <strong style={{ color: "#16A34A", fontSize: 15 }}>₹{bookingSuccess.totalAmount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => { setShowBookingModal(false); navigate("/my-bookings"); }}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12, border: "none",
                      background: "#2563EB", color: "#FFFFFF", fontWeight: 800,
                      cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    <FaSuitcase /> View in My Bookings
                  </button>
                  <button
                    onClick={() => { setShowBookingModal(false); setBookingSuccess(null); }}
                    style={{
                      padding: "12px 20px", borderRadius: 12, border: "1px solid #CBD5E1",
                      background: "#FFFFFF", color: "#475569", fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ padding: "24px 28px" }}>
                {/* Stay summary bar */}
                <div style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14,
                  padding: "12px 16px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12
                }}>
                  <div>
                    <span style={{ color: "#64748B", display: "block" }}>Check-in</span>
                    <strong style={{ color: "#0F172A" }}>{checkIn}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B", display: "block" }}>Check-out</span>
                    <strong style={{ color: "#0F172A" }}>{checkOut} ({nights}n)</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B", display: "block" }}>Rooms / Guests</span>
                    <strong style={{ color: "#0F172A" }}>{rooms} R / {guests} G</strong>
                  </div>
                </div>

                {/* Guest details form */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                      Lead Guest Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={guestForm.fullName}
                      onChange={e => setGuestForm({ ...guestForm, fullName: e.target.value })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        border: "1px solid #CBD5E1", fontSize: 13, outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={guestForm.email}
                        onChange={e => setGuestForm({ ...guestForm, email: e.target.value })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10,
                          border: "1px solid #CBD5E1", fontSize: 13, outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={guestForm.phone}
                        onChange={e => setGuestForm({ ...guestForm, phone: e.target.value })}
                        style={{
                          width: "100%", padding: "10px 14px", borderRadius: 10,
                          border: "1px solid #CBD5E1", fontSize: 13, outline: "none"
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                      Special Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="High floor, quiet room, late check-in..."
                      value={guestForm.specialRequests}
                      onChange={e => setGuestForm({ ...guestForm, specialRequests: e.target.value })}
                      style={{
                        width: "100%", padding: "10px 14px", borderRadius: 10,
                        border: "1px solid #CBD5E1", fontSize: 13, outline: "none", resize: "none"
                      }}
                    />
                  </div>
                </div>

                {/* Total & Submit */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase" }}>Total Payable</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#2563EB" }}>
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    style={{
                      padding: "12px 28px", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "#FFFFFF", fontWeight: 800, fontSize: 14, cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                    }}
                  >
                    {bookingLoading ? "Processing..." : "Confirm & Book Now ✓"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CSS Animations & Responsive Helpers */}
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          .hotel-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
