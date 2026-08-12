import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaHotel, FaPlane, FaComments,
  FaMapMarkerAlt, FaFire, FaChevronRight, FaBrain,
  FaRocket, FaGlobe, FaStar, FaBell,
  FaEnvelope, FaPhone, FaLocationArrow, FaPaperPlane,
  FaLightbulb, FaQuoteLeft, FaSun,
  FaCalendarAlt, FaUsers, FaChartBar, FaChartPie,
  FaMicrophone, FaPlayCircle,
  FaWifi, FaSwimmingPool, FaDumbbell, FaUtensils,
  FaArrowRight, FaFacebook, FaTwitter, FaInstagram, FaLinkedin
} from "react-icons/fa";
import CalendarWidget from "../components/CalendarWidget";
import "../styles/Home.css";

/* ═══════════════════════════════════════════════════════════════
   DATA — Preserved from original + new sections
   ═══════════════════════════════════════════════════════════════ */

const AI_INSIGHTS_TICKER = [
  "🧠 AI detected 94% positive sentiment for Bali this month",
  "📈 Maldives bookings up 32% — book early for best rates",
  "✨ Paris rated top romantic destination by 12,400 travellers",
  "🔥 Rajasthan hotels fully booked for peak season — act fast",
  "🤖 Sentiment engine analysed 50,000+ verified reviews today",
];

const TRENDING = [
  { name: "Bali", country: "Indonesia", emoji: "🌴", tag: "Tropical Paradise", sentiment: "98%", rating: 4.8, desc: "Stunning beaches, temples, and vibrant culture await.", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80" },
  { name: "Maldives", country: "Indian Ocean", emoji: "🏝️", tag: "Luxury Escape", sentiment: "99%", rating: 4.9, desc: "Crystal-clear waters and overwater villas for the ultimate escape.", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80" },
  { name: "Paris", country: "France", emoji: "🗼", tag: "City of Light", sentiment: "97%", rating: 4.7, desc: "Art, café culture, and iconic landmarks in every corner.", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { name: "Rajasthan", country: "India", emoji: "🏰", tag: "Royal Heritage", sentiment: "96%", rating: 4.6, desc: "Majestic forts, desert safaris, and royal hospitality.", img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80" },
];

const TOP_RATED = [
  { name: "Oberoi Udaivilas", type: "Hotel", location: "Udaipur", rating: 4.9, sentiment: "99%" },
  { name: "Maldives Getaway", type: "Place", location: "Maldives", rating: 4.9, sentiment: "99%" },
  { name: "The Leela Palace", type: "Hotel", location: "New Delhi", rating: 4.9, sentiment: "98%" },
];

const POPULAR_DESTINATIONS = [
  { name: "Santorini, Greece", rating: 4.8, price: "₹1,50,000", sentiment: "96% Positive", img: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=500&q=80" },
  { name: "Tokyo, Japan", rating: 4.7, price: "₹1,20,000", sentiment: "95% Positive", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80" },
  { name: "Dubai, UAE", rating: 4.6, price: "₹85,000", sentiment: "94% Positive", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80" },
  { name: "Swiss Alps, Switzerland", rating: 4.9, price: "₹2,00,000", sentiment: "98% Positive", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80" },
  { name: "Kerala, India", rating: 4.8, price: "₹24,000", sentiment: "96% Positive", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&q=80" },
  { name: "Singapore", rating: 4.8, price: "₹75,000", sentiment: "98% Positive", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&q=80" },
  { name: "Rome, Italy", rating: 4.7, price: "₹1,15,000", sentiment: "95% Positive", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&q=80" },
  { name: "New York, USA", rating: 4.5, price: "₹1,80,000", sentiment: "93% Positive", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=80" },
];

const FEATURED_HOTELS = [
  { name: "The Ritz Paris", price: "₹45,000", rating: 4.9, amenities: ["WiFi", "Pool", "Spa", "Restaurant"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80" },
  { name: "Burj Al Arab Jumeirah", price: "₹1,20,000", rating: 4.9, amenities: ["WiFi", "Pool", "Gym", "Helipad"], img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80" },
  { name: "Marina Bay Sands", price: "₹68,000", rating: 4.8, amenities: ["WiFi", "Pool", "Casino", "Restaurant"], img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&q=80" },
  { name: "Taj Mahal Palace", price: "₹35,000", rating: 4.8, amenities: ["WiFi", "Pool", "Spa", "Restaurant"], img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80" },
  { name: "Oberoi Udaivilas", price: "₹55,000", rating: 4.9, amenities: ["WiFi", "Pool", "Lake View", "Restaurant"], img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80" },
  { name: "Kumarakom Lake Resort", price: "₹32,000", rating: 4.8, amenities: ["WiFi", "Pool", "Spa", "Backwaters"], img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&q=80" },
];

const FLIGHT_DEALS = [
  { airline: "Air India", airlineIcon: "✈️", from: "Delhi", to: "Dubai", price: "₹15,999" },
  { airline: "IndiGo", airlineIcon: "🛫", from: "Mumbai", to: "Bangkok", price: "₹12,499" },
  { airline: "Vistara", airlineIcon: "🌟", from: "Bangalore", to: "Singapore", price: "₹18,999" },
  { airline: "SpiceJet", airlineIcon: "🔥", from: "Delhi", to: "Goa", price: "₹3,899" },
];

const WEATHER_DATA = {
  temp: "28°C", icon: "☀️", humidity: "62%", wind: "14 km/h", bestSeason: "Oct — Mar"
};

const CUSTOMER_REVIEWS = [
  { name: "Aarav Sharma", rating: 5, type: "text", sentiment: "Positive", text: "The AI recommendations were spot on! Found the perfect Bali resort that matched my preferences perfectly.", date: "2 days ago" },
  { name: "Sophie Chen", rating: 4, type: "audio", sentiment: "Positive", text: "Recorded a voice note about my amazing Paris experience. The Eiffel Tower at sunset was breathtaking!", date: "5 days ago" },
  { name: "James Wilson", rating: 5, type: "video", sentiment: "Positive", text: "Captured stunning drone footage of the Maldives. Crystal clear waters and incredible marine life!", date: "1 week ago" },
];

const DASHBOARD_STATS = [
  { label: "Destinations", value: "120+", icon: "🗺️", color: "#3b82f6" },
  { label: "Hotels", value: "800+", icon: "🏨", color: "#8b5cf6" },
  { label: "Flights", value: "350+", icon: "✈️", color: "#06b6d4" },
  { label: "Reviews", value: "50K+", icon: "⭐", color: "#f59e0b" },
  { label: "AI Predictions", value: "10K+", icon: "🧠", color: "#22c55e" },
  { label: "Satisfaction", value: "96%", icon: "😊", color: "#ec4899" },
];

const AI_INSIGHTS_CARDS = [
  { icon: "🔥", label: "Trending Destination", value: "Bali, Indonesia" },
  { icon: "🏆", label: "Best-Rated Hotel", value: "Oberoi Udaivilas" },
  { icon: "🔍", label: "Most Searched City", value: "Dubai, UAE" },
  { icon: "😊", label: "Highest Satisfaction", value: "98.5% — Maldives" },
  { icon: "🤖", label: "Recs Generated Today", value: "2,847" },
];

const MAP_DESTINATIONS = [
  { name: "New York", left: "24%", top: "34%" },
  { name: "Paris", left: "47%", top: "26%" },
  { name: "Dubai", left: "60%", top: "42%" },
  { name: "Bali", left: "75%", top: "62%" },
  { name: "Tokyo", left: "82%", top: "34%" },
  { name: "Sydney", left: "85%", top: "76%" },
  { name: "Maldives", left: "65%", top: "56%" },
  { name: "London", left: "46%", top: "22%" },
  { name: "Rio de Janeiro", left: "32%", top: "68%" },
  { name: "Cape Town", left: "52%", top: "78%" },
];

const TRAVEL_TIPS = [
  { icon: "💡", title: "Book in Advance", text: "AI analysis shows booking 45 days ahead saves you up to 30% on flights and hotels." },
  { icon: "🎒", title: "Pack Smart", text: "Our data recommends packing layers for European trips — weather varies widely across cities." },
  { icon: "📱", title: "Go Digital", text: "Download offline maps and keep digital copies of all travel documents for stress-free trips." },
  { icon: "🌍", title: "Travel Off-Peak", text: "Mid-week departures are 22% cheaper on average. AI detected best rates on Tuesdays." },
];

const EMOTION_DATA = {
  happy: 62, neutral: 23, sad: 10, angry: 5,
  totalReviews: "50,247",
  confidence: "96.8%"
};

/* ═══════════════════════════════════════════════════════════════
   AI INSIGHT TICKER — Preserved from original
   ═══════════════════════════════════════════════════════════════ */
function AIInsightTicker() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % AI_INSIGHTS_TICKER.length);
        setFade(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))",
      border: "1px solid rgba(59,130,246,0.25)",
      borderRadius: 12, padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 12,
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <FaBrain size={13} color="#3b82f6" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 1 }}>AI Live</span>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
      </div>
      <div style={{ width: 1, height: 18, background: "rgba(148,163,184,0.2)", flexShrink: 0 }} />
      <div style={{
        fontSize: 13, color: "#cbd5e1", fontWeight: 500,
        opacity: fade ? 1 : 0, transition: "opacity 0.4s ease",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {AI_INSIGHTS_TICKER[index]}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL ANIMATION HOOK
   ═══════════════════════════════════════════════════════════════ */
function useScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════════════════════
   STAR RENDERER
   ═══════════════════════════════════════════════════════════════ */
function Stars({ count }) {
  return (
    <span className="review-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar key={i} color={i < count ? "#f59e0b" : "#E5E7EB"} />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function Home() {
  const navigate = useNavigate();

  /* ── Preserved state ──────────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [selectedTravelDate, setSelectedTravelDate] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Traveler", email: "user@example.com" };
  const userEmail = user.email || "user@example.com";
  const [bookedHotelsCount, setBookedHotelsCount] = useState(0);
  const [bookedFlightsCount, setBookedFlightsCount] = useState(0);

  useEffect(() => {
    const savedHotels = JSON.parse(localStorage.getItem(`bookedHotels_${userEmail}`)) || [];
    const savedFlights = JSON.parse(localStorage.getItem(`bookedFlights_${userEmail}`)) || [];
    setBookedHotelsCount(savedHotels.length);
    setBookedFlightsCount(savedFlights.length);
  }, [userEmail]);

  /* ── New state ────────────────────────────────────────────── */
  const [navScrolled, setNavScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [hoveredMapDot, setHoveredMapDot] = useState(null);

  /* Smart search fields */
  const [searchDest, setSearchDest] = useState("");
  const [searchHotel, setSearchHotel] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchTravelers, setSearchTravelers] = useState("2");

  /* ── Scroll-triggered animations ──────────────────────────── */
  useScrollAnimations();

  /* ── Navbar scroll effect ─────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Preserved navigation functions ───────────────────────── */
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&tab=places`);
  };

  const goToTab = (tab) => navigate(`/search?tab=${tab}`);

  const handleSmartSearch = (e) => {
    e.preventDefault();
    const q = searchDest || searchHotel || "places";
    navigate(`/search?q=${encodeURIComponent(q)}&tab=places`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) { setNewsletterSubmitted(true); setNewsletterEmail(""); }
  };

  const handleContactSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post("http://127.0.0.1:5000/contact", {
      name: contactForm.name,
      email: contactForm.email,
      subject: contactForm.subject,
      message: contactForm.message,
    });

    setContactSubmitted(true);

    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    alert("Message sent successfully!");

  } catch (error) {
    console.log(error);
    alert("Failed to send message.");
  }
};

  /* ── Scroll to section helper ─────────────────────────────── */
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page">

      {/* ═══════════════════════════════════════════════════════
          1. NAVBAR
          ═══════════════════════════════════════════════════════ */}
      <nav className={`home-navbar${navScrolled ? " scrolled" : ""}`}>
        <div className="nav-brand" onClick={() => navigate("/home")}>
          <div className="nav-brand-icon">✈️</div>
          <div className="nav-brand-text">Travel on Your Own choices</div>
        </div>

        <ul className="nav-links">
          <li className="active" onClick={() => navigate("/home")}>Home</li>
          <li onClick={() => goToTab("places")}>Destinations</li>
          <li onClick={() => goToTab("hotels")}>Hotels</li>
          <li onClick={() => goToTab("flights")}>Flights</li>
          <li onClick={() => navigate("/reviews")}>
            <FaComments /> Reviews
          </li>
          <li onClick={() => navigate("/contact")}>Contact</li>
        </ul>

        <div className="nav-right">
          <div className="nav-icon-btn" title="Notifications">
            <FaBell />
            <span className="nav-notif-dot" />
          </div>

          <div style={{ position: "relative" }}>
            <div className="nav-avatar" onClick={() => setShowProfile(!showProfile)}>
              {(user.email || "T")[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="nav-profile-dropdown">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
                    {(user.email || "T")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{user.name || user.email?.split("@")[0] || "Traveler"}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{user.email}</div>
                  </div>
                </div>
                
                <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.15)",
                  background: "rgba(220,38,38,0.05)", color: "#DC2626",
                  cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          2. HERO SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="hero-section">
        <div className="hero-bg-gradient" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hp-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaBrain size={12} color="#3b82f6" />
              <span> Touristic Services Platform</span>
            </div>

            <h1 className="hero-title">
              Explore the{" "}
              <span className="gradient-text">World with this Platform</span>{" "}✈️
            </h1>

            <p className="hero-subtitle">
              Discover breathtaking destinations powered by <strong style={{ color: "#2563EB" }}>AI emotion analysis</strong>,
              real traveler sentiment scores, and intelligent recommendations tailored just for you.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => goToTab("places")}>
                <FaSearch size={14} /> Search Destinations
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection("ai-reco-section")}>
                <FaRocket size={14} /> Explore Now
              </button>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="hero-stat-value">120+</div>
                <div className="hero-stat-label">Destinations</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">800+</div>
                <div className="hero-stat-label">Hotels Listed</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">50K+</div>
                <div className="hero-stat-label">Reviews Analyzed</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">96%</div>
                <div className="hero-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════
          4 + 5. AI TRACKER + TRIP PLANNER CALENDAR
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="ai-calendar-row">

            {/* AI Travel Intelligence */}
            <div className="ai-tracker-card">
              <div style={{ marginBottom: 20 }}>
                <div className="hp-section-tag"><FaBrain /> Live Intelligence</div>
                <h2 className="hp-section-title" style={{ fontSize: 28 }}>AI Travel Intelligence</h2>
                <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, margin: "8px 0 0" }}>
                  Real-time insights powered by our deep learning sentiment engine, analyzing 50K+ verified reviews.
                </p>
              </div>

              <div className="ticker-wrapper">
                <AIInsightTicker />

                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { icon: <FaGlobe size={16} color="#2563EB" />, value: "120+", label: "Destinations" },
                    { icon: <FaHotel size={16} color="#7C3AED" />, value: "800+", label: "Hotels" },
                    { icon: <FaBrain size={16} color="#0EA5E9" />, value: "50K+", label: "Reviews" },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: "#F9FAFB", border: "1px solid #E5E7EB",
                      borderRadius: 16, padding: "16px",
                    }}>
                      <div style={{ marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#111827" }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Rated Widget */}
                <div style={{ marginTop: 20, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>⭐ Top Rated</div>
                  {TOP_RATED.map((r) => (
                    <div key={r.name} onClick={() => goToTab(r.type === "Hotel" ? "hotels" : "places")} style={{
                      marginBottom: 8, cursor: "pointer", padding: "8px 10px", borderRadius: 8,
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "#F3F4F6"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#6B7280" }}>{r.location} · {r.type} · <span style={{ color: "#16A34A" }}>😊 {r.sentiment}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Planner Calendar — Existing CalendarWidget PRESERVED */}
            <div className="calendar-card">
              <div style={{ marginBottom: 14 }}>
                <div className="hp-section-tag">🗓 Trip Planner</div>
                <h2 className="hp-section-title" style={{ fontSize: 28 }}>Plan Your Travel Date</h2>
                <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.7, margin: "8px 0 0" }}>
                  Pick a date to search flights and hotels with AI-powered pricing insights.
                </p>
              </div>

              <CalendarWidget compact onDateSelect={(date) => setSelectedTravelDate(date)} />

              {selectedTravelDate && (
                <div style={{
                  marginTop: 16,
                  background: "#F0F7FF",
                  border: "1px solid rgba(37,99,235,0.2)",
                  borderRadius: 16, padding: 18,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ fontSize: 10, color: "#2563EB", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Selected Date</div>
                  <div style={{ fontSize: 16, fontWeight: 800, margin: "0 0 14px", color: "#111827" }}>
                    📅 {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(selectedTravelDate)}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => navigate(`/search?tab=flights&date=${selectedTravelDate.toISOString().split("T")[0]}`)} className="btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      ✈️ Search Flights
                    </button>
                    <button onClick={() => navigate(`/search?tab=hotels&checkIn=${selectedTravelDate.toISOString().split("T")[0]}`)} className="btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                      🏨 Search Hotels
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      

     

      {/* ═══════════════════════════════════════════════════════
          13. DASHBOARD STATISTICS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaChartBar /> Platform Stats</div>
              <h2 className="hp-section-title">Dashboard Statistics</h2>
            </div>
          </div>

          <div className="stats-grid">
            {DASHBOARD_STATS.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          14. AI INSIGHTS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaBrain /> Intelligence Feed</div>
              <h2 className="hp-section-title">AI Insights</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Live data from our AI engine processing traveler patterns.
              </p>
            </div>
          </div>

          <div className="insights-grid">
            {AI_INSIGHTS_CARDS.map(ins => (
              <div key={ins.label} className="insight-card">
                <div className="insight-icon">{ins.icon}</div>
                <div className="insight-label">{ins.label}</div>
                <div className="insight-value">{ins.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          15. INTERACTIVE WORLD MAP
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaGlobe /> Global Coverage</div>
              <h2 className="hp-section-title">Interactive World Map</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Click on a destination to explore — our AI covers the globe.
              </p>
            </div>
          </div>

          <div className="map-container">
            {/* Grid lines for visual effect */}
            <svg className="map-grid-lines" width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="none">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 57} x2="1000" y2={i * 57} stroke="white" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <line key={`v${i}`} x1={i * 91} y1="0" x2={i * 91} y2="400" stroke="white" strokeWidth="0.5" />
              ))}
            </svg>

            <div className="map-bg">
              {MAP_DESTINATIONS.map(d => (
                <div
                  key={d.name}
                  className="map-dot"
                  style={{ left: d.left, top: d.top }}
                  onClick={() => navigate(`/search?q=${d.name}&tab=places`)}
                  onMouseEnter={() => setHoveredMapDot(d.name)}
                  onMouseLeave={() => setHoveredMapDot(null)}
                >
                  <div className="map-tooltip">{d.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          16. TRAVEL TIPS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaLightbulb color="#f59e0b" /> Daily AI Tips</div>
              <h2 className="hp-section-title">Travel Tips</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                AI-generated travel tips based on analysis of millions of trips.
              </p>
            </div>
          </div>

          <div className="tips-grid">
            {TRAVEL_TIPS.map(t => (
              <div key={t.title} className="tip-card">
                <div className="tip-icon">{t.icon}</div>
                <h3 className="tip-title">{t.title}</h3>
                <p className="tip-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          17. NEWSLETTER
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section newsletter-section animate-on-scroll">
        <div className="hp-container">
          <div className="newsletter-content">
            <div className="hp-section-tag" style={{ justifyContent: "center" }}><FaPaperPlane /> Stay Updated</div>
            <h2 className="hp-section-title" style={{ textAlign: "center" }}>Subscribe to Travel Insights</h2>
            <p className="hp-section-subtitle" style={{ margin: "0 auto", textAlign: "center" }}>
              Get weekly AI-curated travel deals, destination guides, and exclusive offers.
            </p>

            {newsletterSubmitted ? (
              <div style={{
                marginTop: 24, padding: "20px 24px", borderRadius: 16,
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e", fontWeight: 700, fontSize: 15, textAlign: "center",
              }}>
                ✅ Thank you for subscribing! You'll receive our next issue soon.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">
                  <FaPaperPlane size={14} /> Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════
          19. FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="home-footer">
        <div className="hp-container">
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div className="nav-brand-icon" style={{ width: 36, height: 36, fontSize: 18 }}>✈️</div>
                <div className="nav-brand-text" style={{ fontSize: 16 }}>TravelAI</div>
              </div>
              <p className="footer-brand-text">
                AI-powered tourism platform analyzing 50,000+ reviews to help you discover the perfect destinations, hotels, and flights worldwide.
              </p>
              <div className="footer-social">
                <div className="footer-social-icon"><FaFacebook /></div>
                <div className="footer-social-icon"><FaTwitter /></div>
                <div className="footer-social-icon"><FaInstagram /></div>
                <div className="footer-social-icon"><FaLinkedin /></div>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-links">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li>FAQ</li>
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Explore</h4>
              <ul className="footer-links">
                <li onClick={() => goToTab("places")}>Destinations</li>
                <li onClick={() => goToTab("hotels")}>Hotels</li>
                <li onClick={() => goToTab("flights")}>Flights</li>
                <li onClick={() => navigate("/reviews")}>Reviews</li>
                <li onClick={() => navigate("/contact")}>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 TravelAI. All rights reserved. Powered by AI Sentiment Analysis Engine.
          </div>
        </div>
      </footer>

      {/* Keyframe for pulse used in inline styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

export default Home;
