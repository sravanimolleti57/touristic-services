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
  { name: "Swiss Alps", rating: 4.9, price: "₹2,00,000", sentiment: "98% Positive", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&q=80" },
  { name: "New York, USA", rating: 4.5, price: "₹1,80,000", sentiment: "93% Positive", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=80" },
  { name: "Goa, India", rating: 4.4, price: "₹25,000", sentiment: "92% Positive", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&q=80" },
];

const FEATURED_HOTELS = [
  { name: "The Ritz Paris", price: "₹45,000", rating: 4.9, amenities: ["WiFi", "Pool", "Spa", "Restaurant"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80" },
  { name: "Burj Al Arab", price: "₹85,000", rating: 4.9, amenities: ["WiFi", "Pool", "Gym", "Helipad"], img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80" },
  { name: "Marina Bay Sands", price: "₹32,000", rating: 4.7, amenities: ["WiFi", "Pool", "Casino", "Restaurant"], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80" },
  { name: "Taj Lake Palace", price: "₹28,000", rating: 4.8, amenities: ["WiFi", "Spa", "Lake View", "Restaurant"], img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80" },
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
        <FaStar key={i} color={i < count ? "#f59e0b" : "#334155"} />
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactForm({ name: "", email: "", subject: "", message: "" });
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
          <li onClick={() => navigate("/dashboard")}>Reviews</li>
          <li onClick={() => scrollToSection("contact-section")}>Contact</li>
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
                    <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{user.name || user.email?.split("@")[0] || "Traveler"}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ background: "rgba(30,41,59,0.8)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>🏨 Hotels Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedHotelsCount}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>✈️ Flights Booked</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{bookedFlightsCount}</span>
                  </div>
                </div>
                <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: "none",
                  background: "rgba(239,68,68,0.12)", color: "#ef4444",
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
              Discover breathtaking destinations powered by <strong style={{ color: "#93c5fd" }}>AI emotion analysis</strong>,
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
          3. SMART SEARCH
          ═══════════════════════════════════════════════════════ */}
      <section className="smart-search-section">
        <div className="hp-container">
          <form className="smart-search-bar" onSubmit={handleSmartSearch}>
            <div className="search-field">
              <FaMapMarkerAlt className="search-field-icon" />
              <div className="search-field-group">
                <span className="search-field-label">Destination</span>
                <input type="text" placeholder="Where to?" value={searchDest} onChange={e => setSearchDest(e.target.value)} />
              </div>
            </div>
            <div className="search-field">
              <FaHotel className="search-field-icon" />
              <div className="search-field-group">
                <span className="search-field-label">Hotel</span>
                <input type="text" placeholder="Hotel name" value={searchHotel} onChange={e => setSearchHotel(e.target.value)} />
              </div>
            </div>
            <div className="search-field">
              <FaPlane className="search-field-icon" />
              <div className="search-field-group">
                <span className="search-field-label">Flight</span>
                <input type="text" placeholder="Flight route" readOnly onClick={() => goToTab("flights")} style={{ cursor: "pointer" }} />
              </div>
            </div>
            <div className="search-field">
              <FaCalendarAlt className="search-field-icon" />
              <div className="search-field-group">
                <span className="search-field-label">Travel Date</span>
                <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
              </div>
            </div>
            <div className="search-field" style={{ borderRight: "none" }}>
              <FaUsers className="search-field-icon" />
              <div className="search-field-group">
                <span className="search-field-label">Travelers</span>
                <select value={searchTravelers} onChange={e => setSearchTravelers(e.target.value)}>
                  <option value="1">1 Traveler</option>
                  <option value="2">2 Travelers</option>
                  <option value="3">3 Travelers</option>
                  <option value="4">4 Travelers</option>
                  <option value="5">5+ Travelers</option>
                </select>
              </div>
            </div>
            <button type="submit" className="search-submit">
              <FaSearch /> Search
            </button>
          </form>
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
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "8px 0 0" }}>
                  Real-time insights powered by our deep learning sentiment engine, analyzing 50K+ verified reviews.
                </p>
              </div>

              <div className="ticker-wrapper">
                <AIInsightTicker />

                <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { icon: <FaGlobe size={16} color="#3b82f6" />, value: "120+", label: "Destinations" },
                    { icon: <FaHotel size={16} color="#8b5cf6" />, value: "800+", label: "Hotels" },
                    { icon: <FaBrain size={16} color="#06b6d4" />, value: "50K+", label: "Reviews" },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: "rgba(15,23,42,0.7)", border: "1px solid rgba(148,163,184,0.1)",
                      borderRadius: 16, padding: "16px",
                    }}>
                      <div style={{ marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Rated Widget */}
                <div style={{ marginTop: 20, background: "rgba(15,23,42,0.5)", border: "1px solid rgba(148,163,184,0.06)", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>⭐ Top Rated</div>
                  {TOP_RATED.map((r) => (
                    <div key={r.name} onClick={() => goToTab(r.type === "Hotel" ? "hotels" : "places")} style={{
                      marginBottom: 8, cursor: "pointer", padding: "8px 10px", borderRadius: 8,
                      transition: "background 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(148,163,184,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{r.location} · {r.type} · <span style={{ color: "#22c55e" }}>😊 {r.sentiment}</span></div>
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
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "8px 0 0" }}>
                  Pick a date to search flights and hotels with AI-powered pricing insights.
                </p>
              </div>

              <CalendarWidget compact onDateSelect={(date) => setSelectedTravelDate(date)} />

              {selectedTravelDate && (
                <div style={{
                  marginTop: 16,
                  background: "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(8,15,30,0.99))",
                  border: "1px solid rgba(59,130,246,0.25)",
                  borderRadius: 16, padding: 18,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                }}>
                  <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>Selected Date</div>
                  <div style={{ fontSize: 16, fontWeight: 800, margin: "0 0 14px", color: "white" }}>
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
          5. AI RECOMMENDATIONS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll" id="ai-reco-section">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaBrain /> Powered Picks based on rating</div>
              <h2 className="hp-section-title">Rating Recommendations</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Handpicked destinations based on AI sentiment analysis of 50,000+ traveler reviews.
              </p>
            </div>
            <button className="hp-view-all" onClick={() => goToTab("places")}>
              View all <FaChevronRight size={11} />
            </button>
          </div>

          <div className="reco-grid">
            {TRENDING.map(({ name, country, emoji, tag, sentiment, rating, desc, img }) => (
              <div
                key={name}
                className="reco-card"
                onClick={() => navigate(`/search?q=${name}&tab=places`)}
              >
                <img src={img} alt={name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"; }} />
                <div className="reco-card-overlay" />
                <div className="reco-card-badge"><FaBrain size={10} /> AI Pick</div>
                <div className="reco-card-sentiment">😊 {sentiment}</div>
                <div className="reco-card-info">
                  <div className="reco-card-tag">{tag}</div>
                  <h3 className="reco-card-name">{emoji} {name}</h3>
                  <div className="reco-card-location">{country}</div>
                  <div className="reco-card-rating"><FaStar /> {rating}</div>
                  <p className="reco-card-desc">{desc}</p>
                  <button className="reco-card-btn">Explore <FaArrowRight size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      
      {/* ═══════════════════════════════════════════════════════
          7. EMOTION ANALYSIS DASHBOARD
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaChartPie /> Sentiment Engine</div>
              <h2 className="hp-section-title">Emotion Analysis Dashboard</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Real-time emotion breakdown from 50,000+ verified traveler reviews.
              </p>
            </div>
          </div>

          <div className="emotion-grid">
            {[
              { emoji: "😊", label: "Happy", value: EMOTION_DATA.happy, color: "#22c55e" },
              { emoji: "😐", label: "Neutral", value: EMOTION_DATA.neutral, color: "#3b82f6" },
              { emoji: "😢", label: "Sad", value: EMOTION_DATA.sad, color: "#f59e0b" },
              { emoji: "😠", label: "Angry", value: EMOTION_DATA.angry, color: "#ef4444" },
            ].map(e => (
              <div key={e.label} className="emotion-card">
                <div className="emotion-icon">{e.emoji}</div>
                <div className="emotion-label">{e.label}</div>
                <div className="emotion-value" style={{ color: e.color }}>{e.value}%</div>
              </div>
            ))}
          </div>

          <div className="emotion-charts-row">
            {/* Pie Chart */}
            <div className="glass-card" style={{ padding: 28, textAlign: "center" }}>
              <h4 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Sentiment Distribution</h4>
              <div className="emotion-pie" style={{
                background: `conic-gradient(
                  #22c55e 0% ${EMOTION_DATA.happy}%,
                  #3b82f6 ${EMOTION_DATA.happy}% ${EMOTION_DATA.happy + EMOTION_DATA.neutral}%,
                  #f59e0b ${EMOTION_DATA.happy + EMOTION_DATA.neutral}% ${EMOTION_DATA.happy + EMOTION_DATA.neutral + EMOTION_DATA.sad}%,
                  #ef4444 ${EMOTION_DATA.happy + EMOTION_DATA.neutral + EMOTION_DATA.sad}% 100%
                )`
              }}>
                <div className="emotion-pie-center">
                  <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{EMOTION_DATA.happy}%</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>POSITIVE</div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h4 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#e2e8f0", textAlign: "center" }}>Review Breakdown</h4>
              <div className="emotion-bar-chart">
                {[
                  { label: "Happy", value: EMOTION_DATA.happy, color: "#22c55e" },
                  { label: "Neutral", value: EMOTION_DATA.neutral, color: "#3b82f6" },
                  { label: "Sad", value: EMOTION_DATA.sad, color: "#f59e0b" },
                  { label: "Angry", value: EMOTION_DATA.angry, color: "#ef4444" },
                ].map(b => (
                  <div key={b.label} className="emotion-bar-wrapper">
                    <div style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.value}%</div>
                    <div className="emotion-bar" style={{ height: `${b.value * 1.5}px`, background: `linear-gradient(to top, ${b.color}, ${b.color}88)` }} />
                    <span className="emotion-bar-label">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta Stats */}
            <div style={{ display: "grid", gap: 16 }}>
              <div className="emotion-meta-card">
                <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#3b82f6" }}>{EMOTION_DATA.totalReviews}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>Total Reviews Analyzed</div>
              </div>
              <div className="emotion-meta-card">
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎯</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#22c55e" }}>{EMOTION_DATA.confidence}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>AI Confidence Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. POPULAR DESTINATIONS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaFire color="#f59e0b" /> Trending Now</div>
              <h2 className="hp-section-title">Popular Destinations</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Most loved destinations by travelers worldwide this season.
              </p>
            </div>
            <button className="hp-view-all" onClick={() => goToTab("places")}>
              View all <FaChevronRight size={11} />
            </button>
          </div>

          <div className="dest-grid">
            {POPULAR_DESTINATIONS.map(d => (
              <div key={d.name} className="dest-card" onClick={() => navigate(`/search?q=${d.name.split(",")[0]}&tab=places`)}>
                <div className="dest-card-img-wrap">
                  <img className="dest-card-img" src={d.img} alt={d.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"; }} />
                </div>
                <div className="dest-card-body">
                  <h3 className="dest-card-name">{d.name}</h3>
                  <div className="dest-card-meta">
                    <span className="dest-card-rating"><FaStar /> {d.rating}</span>
                    <span className="dest-card-price">{d.price}</span>
                  </div>
                  <div className="dest-card-sentiment">😊 {d.sentiment}</div>
                  <button className="btn-primary btn-sm" style={{ width: "100%" }} onClick={e => { e.stopPropagation(); navigate(`/search?q=${d.name.split(",")[0]}&tab=places`); }}>
                    Explore <FaArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          9. FEATURED HOTELS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaHotel /> Handpicked Stays</div>
              <h2 className="hp-section-title">Featured Hotels</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Luxurious stays curated by AI based on guest satisfaction scores.
              </p>
            </div>
            <button className="hp-view-all" onClick={() => goToTab("hotels")}>
              View all <FaChevronRight size={11} />
            </button>
          </div>

          <div className="hotel-grid">
            {FEATURED_HOTELS.map(h => (
              <div key={h.name} className="hotel-card">
                <div className="hotel-card-img-wrap">
                  <img className="hotel-card-img" src={h.img} alt={h.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80"; }} />
                </div>
                <div className="hotel-card-body">
                  <h3 className="hotel-card-name">{h.name}</h3>
                  <div className="hotel-card-price">{h.price} <span>/ night</span></div>
                  <div className="hotel-card-rating"><FaStar /> {h.rating}</div>
                  <div className="hotel-amenities">
                    {h.amenities.map(a => (
                      <span key={a} className="hotel-amenity">
                        {a === "WiFi" && <FaWifi size={10} />}
                        {a === "Pool" && <FaSwimmingPool size={10} />}
                        {a === "Gym" && <FaDumbbell size={10} />}
                        {a === "Restaurant" && <FaUtensils size={10} />}
                        {a === "Spa" && "🧖"}
                        {a === "Casino" && "🎰"}
                        {a === "Lake View" && "🌊"}
                        {a === "Helipad" && "🚁"}
                        {a}
                      </span>
                    ))}
                  </div>
                  <button className="btn-primary btn-sm" style={{ width: "100%" }} onClick={() => goToTab("hotels")}>
                    Book Now <FaArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          10. FLIGHT DEALS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaPlane /> Best Deals</div>
              <h2 className="hp-section-title">Flight Deals</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                AI-curated flight deals with the best prices this week.
              </p>
            </div>
            <button className="hp-view-all" onClick={() => goToTab("flights")}>
              View all <FaChevronRight size={11} />
            </button>
          </div>

          <div className="flight-grid">
            {FLIGHT_DEALS.map(f => (
              <div key={`${f.from}-${f.to}`} className="flight-card">
                <div className="flight-airline">
                  <span>{f.airlineIcon}</span> {f.airline}
                </div>
                <div className="flight-route">
                  <span className="flight-city">{f.from}</span>
                  <FaPlane className="flight-arrow" />
                  <span className="flight-city">{f.to}</span>
                </div>
                <div className="flight-price">{f.price}</div>
                <button className="btn-primary btn-sm" style={{ width: "100%" }} onClick={() => goToTab("flights")}>
                  Book Now <FaArrowRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          11. WEATHER WIDGET
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaSun /> Travel Weather</div>
              <h2 className="hp-section-title">Weather Intelligence</h2>
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-item">
              <div className="weather-item-icon">{WEATHER_DATA.icon}</div>
              <div className="weather-item-value">{WEATHER_DATA.temp}</div>
              <div className="weather-item-label">Temperature</div>
            </div>
            <div className="weather-item">
              <div className="weather-item-icon">💧</div>
              <div className="weather-item-value">{WEATHER_DATA.humidity}</div>
              <div className="weather-item-label">Humidity</div>
            </div>
            <div className="weather-item">
              <div className="weather-item-icon">🌬️</div>
              <div className="weather-item-value">{WEATHER_DATA.wind}</div>
              <div className="weather-item-label">Wind Speed</div>
            </div>
            <div className="weather-item">
              <div className="weather-item-icon">📅</div>
              <div className="weather-item-value" style={{ fontSize: 22 }}>{WEATHER_DATA.bestSeason}</div>
              <div className="weather-item-label">Best Season</div>
            </div>
            <div className="weather-item">
              <div className="weather-item-icon">🌡️</div>
              <div className="weather-item-value">Perfect</div>
              <div className="weather-item-label">Travel Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          12. CUSTOMER REVIEWS
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaComments /> Traveler Stories</div>
              <h2 className="hp-section-title">Customer Reviews</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Text, audio, and video reviews from verified travelers worldwide.
              </p>
            </div>
            <button className="hp-view-all" onClick={() => navigate("/dashboard")}>
              All reviews <FaChevronRight size={11} />
            </button>
          </div>

          <div className="reviews-grid">
            {CUSTOMER_REVIEWS.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="review-user">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{r.date}</div>
                    </div>
                  </div>
                  <Stars count={r.rating} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                  <FaQuoteLeft size={10} color="#3b82f6" />
                </div>
                <p className="review-text">{r.text}</p>

                <div>
                  <span className="review-type-badge" style={{
                    background: r.type === "text" ? "rgba(59,130,246,0.12)" : r.type === "audio" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                    color: r.type === "text" ? "#3b82f6" : r.type === "audio" ? "#22c55e" : "#f59e0b",
                    border: `1px solid ${r.type === "text" ? "rgba(59,130,246,0.25)" : r.type === "audio" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                  }}>
                    {r.type === "text" && <FaComments size={10} />}
                    {r.type === "audio" && <FaMicrophone size={10} />}
                    {r.type === "video" && <FaPlayCircle size={10} />}
                    {r.type} review
                  </span>
                  <span className="review-sentiment" style={{
                    background: "rgba(34,197,94,0.12)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}>
                    😊 {r.sentiment}
                  </span>
                </div>
              </div>
            ))}
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
          18. CONTACT SECTION
          ═══════════════════════════════════════════════════════ */}
      <section className="hp-section animate-on-scroll" id="contact-section">
        <div className="hp-container">
          <div className="hp-section-header">
            <div>
              <div className="hp-section-tag"><FaEnvelope /> Get in Touch</div>
              <h2 className="hp-section-title">Contact Us</h2>
              <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
                Have questions? Our team is here to help 24/7.
              </p>
            </div>
          </div>

          <div className="contact-grid">
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon"><FaEnvelope /></div>
                <div className="contact-info-text">
                  <h4>Email</h4>
                  <p>support@travelai.com</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon"><FaPhone /></div>
                <div className="contact-info-text">
                  <h4>Phone</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon"><FaLocationArrow /></div>
                <div className="contact-info-text">
                  <h4>Address</h4>
                  <p>123 AI Tower, Tech City, Bangalore 560001</p>
                </div>
              </div>
            </div>

            {contactSubmitted ? (
              <div className="glass-card" style={{ padding: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>Message Sent!</h3>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>We'll get back to you within 24 hours.</p>
                <button className="btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setContactSubmitted(false)}>Send another</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="contact-form-row">
                  <input type="text" placeholder="Your Name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
                  <input type="email" placeholder="Your Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                </div>
                <input type="text" placeholder="Subject" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} required />
                <textarea rows={5} placeholder="Your message..." value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required style={{ resize: "vertical" }} />
                <button type="submit" className="btn-primary" style={{ justifyContent: "center" }}>
                  <FaPaperPlane size={14} /> Send Message
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
                <li onClick={() => navigate("/dashboard")}>Reviews</li>
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
