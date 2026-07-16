import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch, FaHome, FaHotel, FaPlane, FaMapMarkerAlt,
  FaStar, FaUserCircle, FaArrowLeft,
  FaHeart, FaRegHeart, FaWifi, FaSwimmingPool, FaDumbbell,
  FaCar, FaUtensils, FaSnowflake,
  FaCalendarAlt, FaUsers, FaTimes, FaComments
} from "react-icons/fa";
import { PLACES } from "../data/destinations";

const HOTELS = [
  { id: 7, type: "hotel", name: "The Leela Palace", location: "New Delhi, India", rating: 4.9, reviews: 1234, price: "₹28,000/night", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "restaurant", "ac"], sentiment: "98% Positive" },
  { id: 8, type: "hotel", name: "Taj Mahal Palace", location: "Mumbai, India", rating: 4.8, reviews: 3456, price: "₹35,000/night", img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant", "ac"], sentiment: "96% Positive" },
  { id: 9, type: "hotel", name: "ITC Grand Chola", location: "Chennai, India", rating: 4.7, reviews: 987, price: "₹22,000/night", img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=80", amenities: ["wifi", "pool", "gym", "parking", "ac"], sentiment: "94% Positive" },
  { id: 10, type: "hotel", name: "Oberoi Udaivilas", location: "Udaipur, India", rating: 4.9, reviews: 2105, price: "₹55,000/night", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80", amenities: ["wifi", "pool", "restaurant", "ac"], sentiment: "99% Positive" },
  { id: 11, type: "hotel", name: "Six Senses Vana", location: "Dehradun, India", rating: 4.8, reviews: 765, price: "₹42,000/night", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80", amenities: ["wifi", "pool", "gym", "restaurant"], sentiment: "97% Positive" },
  { id: 12, type: "hotel", name: "Amanbagh Resort", location: "Alwar, Rajasthan", rating: 4.7, reviews: 543, price: "₹38,000/night", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", amenities: ["wifi", "pool", "parking", "restaurant", "ac"], sentiment: "95% Positive" },
];

const FLIGHTS = [
  { id: 13, type: "flight", airline: "Air India", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "06:00", arrival: "08:10", duration: "2h 10m", stops: "Non-stop", price: "₹4,299", class: "Economy" },
  { id: 14, type: "flight", airline: "IndiGo", from: "Bangalore (BLR)", to: "Hyderabad (HYD)", departure: "09:30", arrival: "10:45", duration: "1h 15m", stops: "Non-stop", price: "₹2,899", class: "Economy" },
  { id: 15, type: "flight", airline: "Vistara", from: "Mumbai (BOM)", to: "Goa (GOI)", departure: "11:15", arrival: "12:30", duration: "1h 15m", stops: "Non-stop", price: "₹5,499", class: "Business" },
  { id: 16, type: "flight", airline: "SpiceJet", from: "Chennai (MAA)", to: "Kolkata (CCU)", departure: "14:00", arrival: "16:30", duration: "2h 30m", stops: "1 Stop", price: "₹3,199", class: "Economy" },
  { id: 17, type: "flight", airline: "Air India", from: "Delhi (DEL)", to: "Bangalore (BLR)", departure: "07:45", arrival: "10:15", duration: "2h 30m", stops: "Non-stop", price: "₹6,799", class: "Business" },
  { id: 18, type: "flight", airline: "IndiGo", from: "Hyderabad (HYD)", to: "Delhi (DEL)", departure: "18:20", arrival: "20:50", duration: "2h 30m", stops: "Non-stop", price: "₹5,099", class: "Economy" },
];

const AMENITY_ICONS = { wifi: <FaWifi />, pool: <FaSwimmingPool />, gym: <FaDumbbell />, parking: <FaCar />, restaurant: <FaUtensils />, ac: <FaSnowflake /> };
const AMENITY_LABELS = { wifi: "WiFi", pool: "Pool", gym: "Gym", parking: "Parking", restaurant: "Restaurant", ac: "AC" };

// ── Sub-components ────────────────────────────────────────────────────────────

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
      😊 {label}
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

function HotelCard({ item, wishlist, toggleWishlist }) {
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
          <button style={S.actionBtn}>Book Now →</button>
        </div>
      </div>
    </div>
  );
}

function FlightCard({ item }) {
  return (
    <div style={S.card}>
      <div style={S.cardBody}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaPlane color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{item.airline}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.class}</div>
            </div>
          </div>
          <div style={S.price}>{item.price}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{item.departure}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.from}</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", padding: "0 14px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{item.duration}</div>
            <div style={{ height: 1, background: "linear-gradient(to right, #3b82f6, #8b5cf6)", position: "relative" }}>
              <span style={{ position: "absolute", right: -1, top: -4, width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", display: "block" }} />
            </div>
            <div style={{ fontSize: 10, color: item.stops === "Non-stop" ? "#22c55e" : "#f59e0b", marginTop: 4 }}>{item.stops}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>{item.arrival}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{item.to}</div>
          </div>
        </div>
        <button style={{ ...S.actionBtn, width: "100%", marginTop: 16, textAlign: "center", display: "block" }}>
          Select Flight →
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [query, setQuery] = useState(params.get("q") || "");
  const [activeTab, setActiveTab] = useState(params.get("tab") || "places");
  const [sortBy, setSortBy] = useState("rating");
  const [wishlist, setWishlist] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [flightFrom, setFlightFrom] = useState("");
  const [flightTo, setFlightTo] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  const user = JSON.parse(localStorage.getItem("user")) || { name: "Traveler", email: "user@example.com" };

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

  const places = filterAndSort(PLACES);
  const hotels = filterAndSort(HOTELS);
  const flights = FLIGHTS.filter(f =>
    (!flightFrom || f.from.toLowerCase().includes(flightFrom.toLowerCase())) &&
    (!flightTo || f.to.toLowerCase().includes(flightTo.toLowerCase()))
  );

  const counts = { places: places.length, hotels: hotels.length, flights: flights.length };
  const currentCount = counts[activeTab];

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#1e293b", padding: "28px 16px", flexShrink: 0, borderRight: "1px solid #334155", display: "flex", flexDirection: "column" }}>
        <h2 style={{ marginBottom: 32, fontSize: 17, fontWeight: 800, background: "linear-gradient(to right, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Travel Dashboard 🌍
        </h2>
        {[
          { icon: <FaHome />, label: "Home", action: () => navigate("/home") },
          { icon: <FaComments />, label: "Reviews", action: () => navigate("/dashboard") },
          { icon: <FaMapMarkerAlt />, label: "Places", action: () => setActiveTab("places") },
          { icon: <FaHotel />, label: "Hotels", action: () => setActiveTab("hotels") },
          { icon: <FaPlane />, label: "Flights", action: () => setActiveTab("flights") },
        ].map(({ icon, label, action }) => (
          <div key={label} onClick={action} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderRadius: 10, cursor: "pointer",
            fontSize: 14, fontWeight: 500, marginBottom: 4,
            background: activeTab === label.toLowerCase() ? "#1d4ed840" : "transparent",
            color: activeTab === label.toLowerCase() ? "#3b82f6" : "#94a3b8",
            borderLeft: activeTab === label.toLowerCase() ? "3px solid #3b82f6" : "3px solid transparent",
          }}>
            {icon} {label}
          </div>
        ))}

        {/* Wishlist widget */}
        {wishlist.length > 0 && (
          <div style={{ marginTop: 20, padding: "12px 14px", background: "#0f172a", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Wishlist</div>
            <div style={{ fontSize: 13, color: "#f59e0b" }}>❤️ {wishlist.length} saved</div>
          </div>
        )}

        {/* Filters */}
        <div style={{ marginTop: 20, padding: "14px", background: "#0f172a", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Filters</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Min Rating</div>
            {[0, 4, 4.5, 4.8].map(r => (
              <label key={r} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: minRating === r ? "#3b82f6" : "#94a3b8", cursor: "pointer", marginBottom: 6 }}>
                <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} style={{ accentColor: "#3b82f6" }} />
                {r === 0 ? "All" : `${r}+ ⭐`}
              </label>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Sort By</div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "100%", background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: 8, padding: "7px 8px", fontSize: 12 }}>
              <option value="rating">Top Rated</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px 36px", overflowY: "auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <button onClick={() => navigate("/home")} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "10px 14px", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <FaArrowLeft size={11} /> Back
          </button>
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", alignItems: "center", background: "#1e293b", borderRadius: 12, padding: "12px 16px", border: "1px solid #334155", gap: 10 }}>
            <FaSearch style={{ color: "#3b82f6" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${activeTab}...`} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14 }} />
            {query && <FaTimes style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setQuery("")} />}
          </form>
          <div style={{ position: "relative" }}>
            <FaUserCircle size={42} style={{ cursor: "pointer", color: "#3b82f6" }} onClick={() => setShowProfile(!showProfile)} />
            {showProfile && (
              <div style={{ position: "absolute", top: 52, right: 0, background: "#1e293b", padding: 20, borderRadius: 16, width: 220, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", zIndex: 200, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{user.email}</div>
                <hr style={{ border: "1px solid #334155", margin: "12px 0" }} />
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Wishlist: {wishlist.length} items</div>
                <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} style={{ width: "100%", marginTop: 12, padding: 10, borderRadius: 8, border: "none", background: "#ef444420", color: "#ef4444", cursor: "pointer", fontWeight: 600 }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["places", "hotels", "flights"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
              background: activeTab === tab ? "linear-gradient(to right, #3b82f6, #8b5cf6)" : "#1e293b",
              color: activeTab === tab ? "white" : "#94a3b8",
            }}>
              {tab === "places" ? "🗺️" : tab === "hotels" ? "🏨" : "✈️"} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8, background: "rgba(255,255,255,0.15)", padding: "1px 7px", borderRadius: 10 }}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Flight search form */}
        {activeTab === "flights" && (
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 24, border: "1px solid #334155" }}>
            <h3 style={{ marginBottom: 14, fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>Search Flights</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[{ label: "From", value: flightFrom, set: setFlightFrom, ph: "Delhi, Mumbai..." }, { label: "To", value: flightTo, set: setFlightTo, ph: "Goa, Bangalore..." }].map(({ label, value, set, ph }) => (
                <div key={label} style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                  <div style={{ display: "flex", alignItems: "center", background: "#0f172a", borderRadius: 8, padding: "8px 10px", border: "1px solid #334155" }}>
                    <FaMapMarkerAlt size={11} color="#3b82f6" style={{ marginRight: 7 }} />
                    <input value={value} onChange={e => set(e.target.value)} placeholder={ph} style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%" }} />
                  </div>
                </div>
              ))}
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Date</div>
                <div style={{ display: "flex", alignItems: "center", background: "#0f172a", borderRadius: 8, padding: "8px 10px", border: "1px solid #334155" }}>
                  <FaCalendarAlt size={11} color="#3b82f6" style={{ marginRight: 7 }} />
                  <input type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%", colorScheme: "dark" }} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 110 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Passengers</div>
                <div style={{ display: "flex", alignItems: "center", background: "#0f172a", borderRadius: 8, padding: "8px 10px", border: "1px solid #334155" }}>
                  <FaUsers size={11} color="#3b82f6" style={{ marginRight: 7 }} />
                  <input type="number" min={1} max={9} value={passengers} onChange={e => setPassengers(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 13, width: "100%" }} />
                </div>
              </div>
              <button onClick={handleSearch} style={{ alignSelf: "flex-end", padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(to right,#3b82f6,#8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                Search
              </button>
            </div>
          </div>
        )}

        {/* Results header */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            {activeTab === "places" ? "🗺️ Touristic Places" : activeTab === "hotels" ? "🏨 Hotels" : "✈️ Flights"}
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            {loading ? "Searching..." : `${currentCount} result${currentCount !== 1 ? "s" : ""} found`}
            {query && ` for "${query}"`}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 320, background: "#1e293b", borderRadius: 16, opacity: 0.5 }} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>
            {activeTab === "places" && places.map(item => <PlaceCard key={item.id} item={item} wishlist={wishlist} toggleWishlist={toggleWishlist} onExplore={(id) => navigate(`/explore/${id}`)} />)}
            {activeTab === "hotels" && hotels.map(item => <HotelCard key={item.id} item={item} wishlist={wishlist} toggleWishlist={toggleWishlist} />)}
            {activeTab === "flights" && flights.map(item => <FlightCard key={item.id} item={item} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentCount === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: "#94a3b8", marginBottom: 8 }}>No results found</h3>
            <p style={{ fontSize: 14 }}>Try a different search term or clear your filters.</p>
            <button onClick={() => { setQuery(""); setMinRating(0); }} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "none", background: "#3b82f6", color: "white", cursor: "pointer", fontWeight: 600 }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const S = {
  card: { background: "#1e293b", borderRadius: 16, overflow: "hidden", border: "1px solid #334155" },
  cardImg: { width: "100%", height: 180, objectFit: "cover", display: "block" },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: "white", margin: 0 },
  ratingText: { fontSize: 11, color: "#94a3b8" },
  price: { fontSize: 16, fontWeight: 800, color: "#3b82f6" },
  priceLabel: { fontSize: 10, color: "#64748b" },
  tag: { fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" },
  amenity: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", background: "#0f172a", padding: "3px 8px", borderRadius: 20, border: "1px solid #334155" },
  heartBtn: { position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  catBadge: { position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 10, padding: "3px 8px", borderRadius: 20 },
  actionBtn: { background: "transparent", border: "1px solid #3b82f6", color: "#3b82f6", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 },
};
