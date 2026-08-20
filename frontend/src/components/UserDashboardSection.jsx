import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadReview from "./UploadReview";
import SearchAutocomplete from "./SearchAutocomplete";
import { useUser, DEFAULT_AVATAR } from "../context/UserContext";
import {
  FaPlane, FaHotel, FaMapMarkerAlt, FaComments, FaSuitcase,
  FaHeart, FaSearch, FaStar, FaRegStar, FaTimes,
  FaCheckCircle, FaEdit, FaCamera, FaTrash, FaExternalLinkAlt,
  FaCalendarAlt, FaUser, FaPhone, FaCompass, FaSync, FaChartLine,
  FaSmile, FaMeh, FaFrown, FaAngry, FaTicketAlt, FaShieldAlt,
  FaTrain, FaBus, FaHiking, FaGem, FaArrowRight, FaClock
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";

export default function UserDashboardSection() {
  const navigate = useNavigate();
  const { user, updateUser, profileImage } = useUser();

  // Auth State
  const localUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";

  // Main Dashboard State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Search Bar State
  const [searchTab, setSearchTab] = useState("destinations"); // destinations | hotels | travel | packages | activities
  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showUploadReviewModal, setShowUploadReviewModal] = useState(false);

  // Profile Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    avatar: "",
    bio: "",
    travelStyle: "Explorer & Adventure",
    preferredDestination: "Tropical & Coastal",
    budget: "Moderate (₹15,000 - ₹50,000)"
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Bookings Tab inside Bookings Modal
  const [bookingsTab, setBookingsTab] = useState("all"); // all | trips | hotels | flights
  const [userBookings, setUserBookings] = useState([]);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([]);
  const [removingWishlistId, setRemovingWishlistId] = useState(null);

  // Activities Full List
  const [allActivities, setAllActivities] = useState([]);

  // Load Dashboard Data
  useEffect(() => {
    if (userEmail) {
      fetchDashboardData();
    }
  }, [userEmail]);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/user/dashboard-summary/${userEmail}`);
      if (res.data) {
        setDashboardData(res.data);
        setWishlistItems(res.data.wishlist || []);
        
        // Initialize Edit Form
        const u = res.data.user || {};
        const prefs = u.preferences || {};
        const activeAvatar = profileImage || user?.avatar || u.avatar || u.profileImage || "";
        setEditForm({
          name: u.name || localUser.name || "",
          phone: u.phone || "+91 98765 43210",
          avatar: activeAvatar,
          bio: u.bio || "Passionate globetrotter exploring cultures, beach retreats, and mountain trails.",
          travelStyle: prefs.travelStyle || "Explorer & Adventure",
          preferredDestination: prefs.preferredDestination || "Tropical & Coastal",
          budget: prefs.budget || "Moderate (₹15,000 - ₹50,000)"
        });
        setAvatarPreview(activeAvatar);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load your profile dashboard. Please check the connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/bookings/${userEmail}`);
      setUserBookings(res.data || []);
    } catch (err) {
      console.error("Bookings fetch error:", err);
    }
  };

  const fetchAllActivities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/activities/${userEmail}`);
      setAllActivities(res.data || []);
    } catch (err) {
      console.error("Activities fetch error:", err);
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      let finalAvatarUrl = editForm.avatar;

      // Upload file if new avatar selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("email", userEmail);
        formData.append("avatar", avatarFile);
        formData.append("file", avatarFile);
        formData.append("profileImage", avatarFile);
        const uploadRes = await axios.post(`${API_BASE}/api/user/profile-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const returnedUrl = uploadRes.data?.avatarUrl || uploadRes.data?.avatar || uploadRes.data?.url || uploadRes.data?.profileImage;
        if (returnedUrl) {
          finalAvatarUrl = returnedUrl;
        }
      }

      const updatePayload = {
        email: userEmail,
        name: editForm.name,
        phone: editForm.phone,
        avatar: finalAvatarUrl,
        profileImage: finalAvatarUrl,
        bio: editForm.bio,
        preferences: {
          travelStyle: editForm.travelStyle,
          preferredDestination: editForm.preferredDestination,
          budget: editForm.budget
        }
      };

      await axios.put(`${API_BASE}/api/user/profile`, updatePayload);

      // Central synchronized user update across the portal
      updateUser({
        ...localUser,
        name: editForm.name,
        phone: editForm.phone,
        avatar: finalAvatarUrl,
        profileImage: finalAvatarUrl
      });

      showToast("Profile & Preferences updated successfully! 🎉");
      setShowEditModal(false);
      setAvatarFile(null);
      fetchDashboardData();
    } catch (err) {
      console.error("Save profile error:", err);
      showToast("Failed to save profile changes. Please try again.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Cancel a Booking
  const handleCancelBooking = async (bookingId, bookingType) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingBookingId(bookingId);

    try {
      let cancelUrl = "";
      if (bookingType === "Hotel Stay") {
        cancelUrl = `${API_BASE}/api/admin/bookings/hotel/${bookingId}`;
      } else if (bookingType === "Destination Trip") {
        cancelUrl = `${API_BASE}/api/admin/bookings/trip/${bookingId}`;
      } else {
        cancelUrl = `${API_BASE}/api/admin/bookings/flight/${bookingId}`;
      }

      await axios.delete(cancelUrl);
      showToast("Booking cancelled successfully.");
      fetchAllBookings();
      fetchDashboardData();
    } catch (err) {
      console.error("Cancel error:", err);
      showToast("Failed to cancel booking. Please contact support.", "error");
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Remove from Wishlist
  const handleRemoveWishlist = async (itemId) => {
    setRemovingWishlistId(itemId);
    try {
      await axios.delete(`${API_BASE}/api/user/wishlist/${userEmail}/${itemId}`);
      setWishlistItems(prev => prev.filter(item => (item.itemId !== itemId && item._id !== itemId)));
      showToast("Item removed from wishlist.");
    } catch (err) {
      console.error("Wishlist remove error:", err);
      showToast("Could not remove item from wishlist.", "error");
    } finally {
      setRemovingWishlistId(null);
    }
  };

  // Execute Search from Top Tabs
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (searchTab === "destinations") {
      navigate(`/search?tab=places&q=${encodeURIComponent(query)}`);
    } else if (searchTab === "hotels") {
      navigate(`/search?tab=hotels&q=${encodeURIComponent(query)}`);
    } else if (searchTab === "travel") {
      navigate(`/search?tab=travel&q=${encodeURIComponent(query)}`);
    } else if (searchTab === "packages") {
      navigate(`/search?tab=places&category=package&q=${encodeURIComponent(query)}`);
    } else if (searchTab === "activities") {
      navigate(`/search?tab=activities&q=${encodeURIComponent(query)}`);
    }
  };

  // Filtered Bookings for Modal
  const filteredBookings = useMemo(() => {
    if (bookingsTab === "all") return userBookings;
    if (bookingsTab === "trips") return userBookings.filter(b => b.type === "Destination Trip");
    if (bookingsTab === "hotels") return userBookings.filter(b => b.type === "Hotel Stay");
    if (bookingsTab === "flights") return userBookings.filter(b => b.type === "Flight Travel");
    return userBookings;
  }, [userBookings, bookingsTab]);

  // Derived Data for Display
  const userData = dashboardData?.user || localUser || {};
  const statsData = dashboardData?.stats || {
    memberSince: "May 2024",
    totalTrips: 0,
    reviewsGiven: 0,
    satisfactionScore: "5.0/5",
    tripsCompleted: 0,
    averageSatisfaction: 5.0,
    positiveSentiment: 100
  };
  const satisfactionTrend = dashboardData?.satisfactionTrend || [
    { month: "Jan", score: 4.8 },
    { month: "Feb", score: 4.9 },
    { month: "Mar", score: 5.0 }
  ];
  const emotionOverview = dashboardData?.emotionOverview || {
    happy: 85,
    neutral: 10,
    sad: 5,
    angry: 0,
    totalCount: 1
  };
  const recentActivity = dashboardData?.recentActivity || [];

  // Pie Chart Colors for Emotion Donut
  const EMOTION_PIE_DATA = [
    { name: "Happy", value: emotionOverview.happy || 0, color: "#10B981" },
    { name: "Neutral", value: emotionOverview.neutral || 0, color: "#F59E0B" },
    { name: "Sad", value: emotionOverview.sad || 0, color: "#6366F1" },
    { name: "Angry", value: emotionOverview.angry || 0, color: "#EF4444" }
  ].filter(d => d.value > 0);

  const defaultPieData = [{ name: "Happy", value: 100, color: "#10B981" }];
  const displayPieData = EMOTION_PIE_DATA.length > 0 ? EMOTION_PIE_DATA : defaultPieData;

  const currentAvatar = profileImage || user?.avatar || userData.avatar || DEFAULT_AVATAR;

  return (
    <div style={{
      width: "100%",
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: "#0F172A",
    }}>

      {/* ── Toast Notification ────────────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 3000,
          background: toastMessage.type === "error" ? "#EF4444" : "#10B981",
          color: "#FFFFFF", padding: "14px 24px", borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 10, fontSize: 14,
          animation: "slideUp 0.3s ease"
        }}>
          {toastMessage.type === "error" ? <FaTimes /> : <FaCheckCircle />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Main Content Container ────────────────────────────── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px" }}>

        {/* Loading Spinner */}
        {loading && !dashboardData && (
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "40px",
            textAlign: "center", border: "1px solid #E2E8F0", margin: "20px 0"
          }}>
            <FaSync className="fa-spin" style={{ fontSize: 28, color: "#4F46E5", marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#475569" }}>Loading your travel dashboard &amp; live analytics...</div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16,
            padding: "16px 20px", color: "#B91C1C", fontWeight: 600, margin: "20px 0",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={fetchDashboardData}
              style={{
                background: "#B91C1C", color: "#FFFFFF", border: "none",
                borderRadius: 8, padding: "6px 14px", fontWeight: 700, cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ══════════════════ 1. TOP WELCOME & METRICS BANNER ══════════════════ */}
        <div style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
          borderRadius: 28,
          padding: "36px 40px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(49, 46, 129, 0.18)",
          margin: "24px 0 28px"
        }}>
          {/* Subtle Vector Background Graphics */}
          <div style={{
            position: "absolute", right: -20, bottom: -20, opacity: 0.12,
            pointerEvents: "none", fontSize: 240, color: "#FFFFFF", lineHeight: 1
          }}>
            ✈️
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
            {/* Left User Bio & Greeting */}
            <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              {/* Avatar with Camera/Edit Button */}
              <div style={{ position: "relative" }}>
                <img
                  src={currentAvatar}
                  alt={userData.name || "User Avatar"}
                  style={{
                    width: 90, height: 90, borderRadius: "50%",
                    objectFit: "cover", border: "4px solid rgba(255,255,255,0.3)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                  }}
                />
                <button
                  onClick={() => setShowEditModal(true)}
                  title="Edit Profile"
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "#4F46E5", border: "2px solid #FFFFFF",
                    color: "#FFFFFF", display: "flex", alignItems: "center",
                    justifyContent: "center", cursor: "pointer", fontSize: 13,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)", transition: "transform 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <FaCamera />
                </button>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
                    Hello, {userData.name || localUser.name || userEmail.split("@")[0]}! 👋
                  </h1>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                      borderRadius: 20, padding: "4px 12px", color: "#FFFFFF", fontSize: 11,
                      fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5
                    }}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>

                <p style={{
                  color: "#C7D2FE", fontSize: 13, margin: "6px 0 0", maxWidth: 520, lineHeight: 1.5
                }}>
                  {userData.bio || "Explore the world with smart recommendations driven by customer satisfaction & emotion analysis."}
                </p>

                {/* Preference Badges */}
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                    background: "rgba(255,255,255,0.12)", color: "#E0E7FF"
                  }}>
                    🧭 {userData.preferences?.travelStyle || "Explorer & Adventure"}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                    background: "rgba(255,255,255,0.12)", color: "#E0E7FF"
                  }}>
                    🏝️ {userData.preferences?.preferredDestination || "Tropical & Coastal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Stat Pills */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, minWidth: 260 }}>
              <div style={{
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 11, color: "#C7D2FE", fontWeight: 600 }}>Member Since</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
                  📅 {statsData.memberSince || "May 2024"}
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 11, color: "#C7D2FE", fontWeight: 600 }}>Total Trips</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#38BDF8", marginTop: 2 }}>
                  🧳 {statsData.totalTrips || 0} Trips
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 11, color: "#C7D2FE", fontWeight: 600 }}>Reviews Given</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#FCD34D", marginTop: 2 }}>
                  ⭐ {statsData.reviewsGiven || 0} Reviews
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 11, color: "#C7D2FE", fontWeight: 600 }}>Satisfaction Score</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#34D399", marginTop: 2 }}>
                  🎯 {statsData.satisfactionScore || "5.0/5"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ 2. FIND EXPERIENCE + QUICK ACTIONS ══════════════════ */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20, marginBottom: 28
        }}>
          {/* Search Box with Tabs */}
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "26px 28px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 14px" }}>
              Find Your Perfect Experience
            </h3>

            {/* Category Tabs: Destinations | Hotels | Travel | Packages | Activities */}
            <div style={{
              display: "flex", gap: 8, borderBottom: "1px solid #E2E8F0",
              paddingBottom: 12, marginBottom: 18, overflowX: "auto"
            }}>
              {[
                { id: "destinations", label: "Destinations", icon: "📍" },
                { id: "hotels", label: "Hotels", icon: "🏨" },
                { id: "travel", label: "Travel", icon: "🚆" },
                { id: "packages", label: "Packages", icon: "💼" },
                { id: "activities", label: "Activities", icon: "🏄" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSearchTab(tab.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, padding: "6px 12px",
                    color: searchTab === tab.id ? "#4F46E5" : "#64748B",
                    borderBottom: searchTab === tab.id ? "2px solid #4F46E5" : "2px solid transparent",
                    marginBottom: -13, display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.15s ease", whiteSpace: "nowrap"
                  }}
                >
                  <span style={{ fontSize: 13 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar Input & Button */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <SearchAutocomplete
                value={searchQuery}
                onChange={setSearchQuery}
                type={searchTab}
                placeholder={
                  searchTab === "destinations" ? "Where do you want to go? (e.g. Bali, Paris, Goa)" :
                  searchTab === "hotels" ? "Search luxury hotels & resorts..." :
                  searchTab === "travel" ? "Search buses, trains & travel routes..." :
                  searchTab === "packages" ? "Search curated vacation packages..." :
                  "Search adventure & cultural activities..."
                }
                onSelect={(item, title) => {
                  setSearchQuery(title);
                  if (item.url) {
                    navigate(item.url);
                  } else {
                    handleSearch();
                  }
                }}
                onSubmit={() => handleSearch()}
                style={{ flex: 1 }}
                inputStyle={{ background: "#F8FAFC" }}
              />
              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                  border: "none", color: "#FFFFFF", padding: "12px 28px", borderRadius: 14,
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.28)", transition: "all 0.2s"
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Actions (3 Action Tiles) */}
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "26px 28px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 18px" }}>
              Quick Actions
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {/* Upload Review */}
              <div
                onClick={() => setShowUploadReviewModal(true)}
                style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16,
                  padding: "18px 12px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 10
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#818CF8"; e.currentTarget.style.background = "#EEF2FF"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <FaComments />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>Upload Review</div>
              </div>

              {/* My Bookings */}
              <div
                onClick={() => { setShowBookingsModal(true); fetchAllBookings(); }}
                style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16,
                  padding: "18px 12px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 10
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#34D399"; e.currentTarget.style.background = "#ECFDF5"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <FaCalendarAlt />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>My Bookings</div>
              </div>

              {/* Wishlist */}
              <div
                onClick={() => setShowWishlistModal(true)}
                style={{
                  background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16,
                  padding: "18px 12px", textAlign: "center", cursor: "pointer",
                  transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 10
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "#F472B6"; e.currentTarget.style.background = "#FDF2F8"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FDF2F8", color: "#DB2777", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <FaHeart />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>Wishlist ({wishlistItems.length})</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ 3. TRAVEL & FEEDBACK SUMMARY ══════════════════ */}
        <div style={{
          background: "#FFFFFF", borderRadius: 24, padding: "26px 28px",
          border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: "0 0 18px" }}>
            Your Travel &amp; Feedback Summary
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {/* Trips Completed */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Trips Completed</span>
                <span style={{ fontSize: 18 }}>🏔️</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>
                {statsData.tripsCompleted || statsData.totalTrips || 0}
              </div>
              <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginTop: 4 }}>
                Active bookings verified
              </div>
            </div>

            {/* Reviews Given */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Reviews Given</span>
                <span style={{ fontSize: 18 }}>⭐</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>
                {statsData.reviewsGiven || 0}
              </div>
              <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 700, marginTop: 4 }}>
                All sentiment analyzed
              </div>
            </div>

            {/* Average Satisfaction */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Average Satisfaction</span>
                <span style={{ fontSize: 18 }}>😊</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>
                {statsData.averageSatisfaction || 5.0} / 5
              </div>
              <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginTop: 4 }}>
                Top 5% traveler rating
              </div>
            </div>

            {/* Positive Sentiment */}
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Positive Sentiment</span>
                <span style={{ fontSize: 18 }}>📈</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#10B981" }}>
                {statsData.positiveSentiment || 100}%
              </div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 4 }}>
                Based on emotion AI
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════ 4. CHARTS & RECENT ACTIVITY ══════════════════ */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", gap: 20, marginBottom: 28
        }}>
          {/* Satisfaction Trend (Recharts Line) */}
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "24px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Satisfaction Trend
                </h4>
                <div style={{ fontSize: 11, color: "#64748B" }}>Monthly Score Progression</div>
              </div>
              <FaChartLine color="#4F46E5" />
            </div>

            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis domain={[0, 5]} stroke="#94A3B8" fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{ background: "#0F172A", color: "#FFFFFF", borderRadius: 10, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ fill: "#4F46E5", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotion Analysis Overview (Donut Chart) */}
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "24px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Emotion Analysis Overview
                </h4>
                <div style={{ fontSize: 11, color: "#64748B" }}>Analyzed from reviews &amp; facial AI</div>
              </div>
              <span style={{ fontSize: 16 }}>🧠</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 180 }}>
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {displayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, paddingLeft: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>🟢 Happy</span>
                  <strong style={{ color: "#0F172A" }}>{emotionOverview.happy || 0}%</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>🟡 Neutral</span>
                  <strong style={{ color: "#0F172A" }}>{emotionOverview.neutral || 0}%</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6366F1", fontWeight: 700 }}>🔵 Sad</span>
                  <strong style={{ color: "#0F172A" }}>{emotionOverview.sad || 0}%</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>🔴 Angry</span>
                  <strong style={{ color: "#0F172A" }}>{emotionOverview.angry || 0}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div style={{
            background: "#FFFFFF", borderRadius: 24, padding: "24px",
            border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  Recent Activity
                </h4>
                <div style={{ fontSize: 11, color: "#64748B" }}>Your latest reviews &amp; interactions</div>
              </div>
              <FaClock color="#94A3B8" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 180, overflowY: "auto" }}>
              {recentActivity.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, padding: "30px 0" }}>
                  No activity recorded yet. Explore destinations or upload a review!
                </div>
              ) : (
                recentActivity.slice(0, 3).map((act, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: "#F1F5F9",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0
                    }}>
                      {act.type === "review" ? "📝" : act.type === "booking" ? "🎫" : "🤍"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {act.title}
                      </div>
                      <div style={{ color: "#64748B", fontSize: 11 }}>{act.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {recentActivity.length > 3 && (
              <button
                onClick={() => { setShowActivityModal(true); fetchAllActivities(); }}
                style={{
                  background: "none", border: "none", color: "#4F46E5",
                  fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "8px 0 0",
                  display: "inline-flex", alignItems: "center", gap: 4
                }}
              >
                View all activity →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ══════════════════ MODALS SUITE ══════════════════ */}

      {/* 1. EDIT PROFILE MODAL */}
      {showEditModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            maxWidth: 540, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowEditModal(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#F1F5F9",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              Edit Profile &amp; Travel Preferences
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Update your account info and tailored AI trip recommendations.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Traveler Bio</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "2px solid #2563EB", background: "#EFF6FF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {avatarPreview || editForm.avatar ? (
                      <img
                        src={avatarPreview || editForm.avatar}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                      />
                    ) : (
                      <span style={{ fontWeight: 800, color: "#2563EB", fontSize: 18 }}>
                        {(editForm.name || userEmail || "T")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Profile Picture Preview</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Synchronized across navigation bar, dropdown, and portal</div>
                    {(avatarPreview || editForm.avatar) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview("");
                          setEditForm(prev => ({ ...prev, avatar: "" }));
                        }}
                        style={{
                          background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5",
                          borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                          cursor: "pointer", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4
                        }}
                      >
                        <FaTrash size={10} /> Remove Picture
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Avatar Image URL (or upload below)</label>
                  <input
                    type="text"
                    value={editForm.avatar}
                    placeholder="https://images.unsplash.com/..."
                    onChange={e => {
                      setEditForm(prev => ({ ...prev, avatar: e.target.value }));
                      setAvatarPreview(e.target.value);
                    }}
                    style={{
                      width: "100%", padding: "8px 12px", borderRadius: 8,
                      border: "1px solid #CBD5E1", fontSize: 12, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Upload Avatar File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarFile(e.target.files[0]);
                        setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Travel Style</label>
                  <select
                    value={editForm.travelStyle}
                    onChange={e => setEditForm(prev => ({ ...prev, travelStyle: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                  >
                    <option>Explorer &amp; Adventure</option>
                    <option>Luxury &amp; Relaxation</option>
                    <option>Cultural &amp; Historical</option>
                    <option>Solo &amp; Budget</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Preferred Destination</label>
                  <select
                    value={editForm.preferredDestination}
                    onChange={e => setEditForm(prev => ({ ...prev, preferredDestination: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                  >
                    <option>Tropical &amp; Coastal</option>
                    <option>Mountain &amp; Nature</option>
                    <option>Metropolitan &amp; Urban</option>
                    <option>Heritage &amp; Palaces</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "10px 18px", borderRadius: 12, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    padding: "10px 22px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "#FFFFFF",
                    fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  {savingProfile ? <FaSync className="fa-spin" /> : <FaCheckCircle />}
                  <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MY BOOKINGS MODAL */}
      {showBookingsModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowBookingsModal(false)}>
          <div style={{
            maxWidth: 760, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowBookingsModal(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#F1F5F9",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              My Bookings &amp; Reservations ({userBookings.length})
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 16px" }}>
              Live e-tickets and verified travel itinerary for {userEmail}.
            </p>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["all", "trips", "hotels", "flights"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setBookingsTab(tab)}
                  style={{
                    padding: "6px 14px", borderRadius: 10, border: "none",
                    background: bookingsTab === tab ? "#4F46E5" : "#F1F5F9",
                    color: bookingsTab === tab ? "#FFFFFF" : "#64748B",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize"
                  }}
                >
                  {tab === "all" ? "All Bookings" : tab}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎫</div>
                <div style={{ fontWeight: 800, color: "#1E293B" }}>No bookings found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>You don't have any reservations in this category yet.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredBookings.map((b) => (
                  <div
                    key={b._id || b.id}
                    style={{
                      background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16,
                      padding: "16px 20px", display: "flex", alignItems: "center",
                      justifyContent: "space-between", flexWrap: "wrap", gap: 14
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: "#EEF2FF",
                        color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                      }}>
                        {b.type === "Hotel Stay" ? <FaHotel /> : b.type === "Flight Travel" ? <FaPlane /> : <FaTicketAlt />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                          {b.title || b.hotelName || b.destination || "Confirmed Booking"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                          📅 {b.dates || b.travelDate || "Confirmed"} · 👥 {b.guests || 2} Guests · 💳 {b.totalPrice || b.price || "₹14,500"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                        background: "#ECFDF5", color: "#059669"
                      }}>
                        Confirmed
                      </span>

                      <button
                        onClick={() => handleCancelBooking(b._id || b.id, b.type)}
                        disabled={cancellingBookingId === (b._id || b.id)}
                        style={{
                          background: "none", border: "1px solid #FCA5A5", color: "#DC2626",
                          padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        {cancellingBookingId === (b._id || b.id) ? "Cancelling..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. WISHLIST MODAL */}
      {showWishlistModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowWishlistModal(false)}>
          <div style={{
            maxWidth: 680, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "85vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowWishlistModal(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#F1F5F9",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              Saved Wishlist Items ({wishlistItems.length})
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Destinations &amp; hotels you saved for future travel.
            </p>

            {wishlistItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748B" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤍</div>
                <div style={{ fontWeight: 800, color: "#1E293B" }}>Your wishlist is empty</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Click the heart icon on any destination or hotel to save it here.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {wishlistItems.map((item) => (
                  <div
                    key={item.itemId || item._id}
                    style={{
                      background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16,
                      overflow: "hidden", display: "flex", flexDirection: "column"
                    }}
                  >
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"}
                      alt={item.title}
                      style={{ width: "100%", height: 110, objectFit: "cover" }}
                    />
                    <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{item.location}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>{item.price || "₹12,000"}</span>
                          <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>⭐ {item.rating || 4.8}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => {
                            setShowWishlistModal(false);
                            if (item.itemType === "hotel") {
                              navigate(`/hotel/${item.itemId}`);
                            } else {
                              navigate(`/destinations/${item.itemId}`);
                            }
                          }}
                          style={{
                            flex: 1, padding: "7px 10px", borderRadius: 8, border: "none",
                            background: "#4F46E5", color: "#FFFFFF", fontWeight: 700, fontSize: 11, cursor: "pointer"
                          }}
                        >
                          View &amp; Book
                        </button>
                        <button
                          onClick={() => handleRemoveWishlist(item.itemId || item._id)}
                          disabled={removingWishlistId === (item.itemId || item._id)}
                          style={{
                            padding: "7px 10px", borderRadius: 8, border: "1px solid #E2E8F0",
                            background: "#FFFFFF", color: "#DC2626", cursor: "pointer", fontSize: 11
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. UPLOAD REVIEW MODAL */}
      {showUploadReviewModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowUploadReviewModal(false)}>
          <div style={{
            maxWidth: 700, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowUploadReviewModal(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#F1F5F9",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
              }}
            >
              <FaTimes />
            </button>

            <UploadReview
              onReviewAdded={() => {
                setShowUploadReviewModal(false);
                showToast("Review submitted and analyzed by AI successfully! 🌟");
                fetchDashboardData();
              }}
            />
          </div>
        </div>
      )}

      {/* 5. ALL ACTIVITIES MODAL */}
      {showActivityModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1200,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowActivityModal(false)}>
          <div style={{
            maxWidth: 600, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowActivityModal(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "#F1F5F9",
                border: "none", borderRadius: "50%", width: 32, height: 32,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B"
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
              All Activity Timeline
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Chronological log of your reviews, trips, stays, and interactions.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {allActivities.map((act, idx) => (
                <div key={idx} style={{
                  padding: "12px 16px", borderRadius: 14, background: "#F8FAFC",
                  border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: "#EEF2FF",
                    color: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                  }}>
                    {act.type === "review" ? "📝" : act.type === "booking" ? "🎫" : "🤍"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>{act.title}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
