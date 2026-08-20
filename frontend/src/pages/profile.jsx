import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import { useUser, DEFAULT_AVATAR } from "../context/UserContext";
import {
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars,
  FaGlobe, FaCity, FaLanguage, FaPhoneAlt, FaCompass,
  FaHotel, FaMoneyBillWave, FaHiking, FaUtensils, FaCheckCircle,
  FaShieldAlt, FaClock, FaEdit, FaCamera, FaSync, FaTimes,
  FaArrowLeft, FaSuitcase, FaHeart, FaTicketAlt, FaTrash
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, profileImage } = useUser();
  const localUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    avatar: "",
    bio: "",
    dob: "",
    gender: "Male",
    country: "India",
    city: "Bangalore",
    preferredLanguage: "English",
    emergencyContact: "",
    preferredDestinations: "Tropical Beaches, Mountain Retreats",
    preferredHotelType: "5-Star Luxury & Heritage Resorts",
    budget: "Moderate (₹25,000 - ₹75,000)",
    travelInterests: "Adventure, Culture, Photography, Relaxation",
    preferredActivities: "Scuba Diving, Heritage Tours, Spa & Wellness",
    foodPreference: "Continental & Local Specialties"
  });

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [userEmail]);

  const showToastMsg = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/user/profile-full/${userEmail}`);
      if (res.data) {
        setProfile(res.data);
        const u = res.data;
        const p = u.preferences || {};
        const activeAvatar = profileImage || user?.avatar || u.avatar || u.profileImage || "";
        setEditForm({
          name: u.name || localUser.name || "",
          phone: u.phone || "+91 98765 43210",
          avatar: activeAvatar,
          bio: u.bio || "Passionate traveler exploring cultures, beach retreats, and mountain trails.",
          dob: u.dob || "1995-08-15",
          gender: u.gender || "Male",
          country: u.country || "India",
          city: u.city || "Bangalore",
          preferredLanguage: u.preferredLanguage || "English",
          emergencyContact: u.emergencyContact || "+91 98765 00000 (Family)",
          preferredDestinations: p.preferredDestinations || "Tropical Beaches, Mountain Retreats",
          preferredHotelType: p.preferredHotelType || "5-Star Luxury & Heritage Resorts",
          budget: p.budget || "Moderate (₹25,000 - ₹75,000)",
          travelInterests: p.travelInterests || "Adventure, Culture, Photography, Relaxation",
          preferredActivities: Array.isArray(p.preferredActivities) ? p.preferredActivities.join(", ") : (p.preferredActivities || "Scuba Diving, Heritage Tours"),
          foodPreference: p.foodPreference || "Continental & Local Specialties"
        });
        setAvatarPreview(activeAvatar);
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Unable to load profile. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatar = editForm.avatar;

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
          finalAvatar = returnedUrl;
        }
      }

      const payload = {
        email: userEmail,
        name: editForm.name,
        phone: editForm.phone,
        avatar: finalAvatar,
        profileImage: finalAvatar,
        bio: editForm.bio,
        dob: editForm.dob,
        gender: editForm.gender,
        country: editForm.country,
        city: editForm.city,
        preferredLanguage: editForm.preferredLanguage,
        emergencyContact: editForm.emergencyContact,
        preferences: {
          preferredDestinations: editForm.preferredDestinations,
          preferredHotelType: editForm.preferredHotelType,
          budget: editForm.budget,
          travelInterests: editForm.travelInterests,
          preferredActivities: typeof editForm.preferredActivities === "string"
            ? editForm.preferredActivities.split(",").map(s => s.trim()).filter(Boolean)
            : editForm.preferredActivities,
          foodPreference: editForm.foodPreference
        }
      };

      await axios.put(`${API_BASE}/api/user/profile-full`, payload);

      // Central synchronized user update across the portal
      updateUser({
        ...localUser,
        name: editForm.name,
        phone: editForm.phone,
        avatar: finalAvatar,
        profileImage: finalAvatar
      });

      showToastMsg("Profile details and travel preferences updated successfully! 🎉");
      setShowEditModal(false);
      setAvatarFile(null);
      fetchProfile();
    } catch (err) {
      console.error("Save profile error:", err);
      showToastMsg("Failed to save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const u = profile || localUser || {};
  const p = u.preferences || {};
  const stats = u.stats || { hotelsBooked: 0, flightsBooked: 0, totalTrips: 0 };
  const currentAvatar = profileImage || user?.avatar || u.avatar || u.profileImage || DEFAULT_AVATAR;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 70, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SharedNavbar activeTab="profile" />

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
        
        {/* Header Breadcrumb & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/home")}
              style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12,
                padding: "8px 14px", cursor: "pointer", color: "#475569", fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13
              }}
            >
              <FaArrowLeft size={11} /> Back to Home
            </button>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>My Profile &amp; Account</h1>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
              border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 800,
              fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)"
            }}
          >
            <FaEdit /> Edit Profile
          </button>
        </div>

        {/* Loading State */}
        {loading && !profile && (
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "50px", textAlign: "center", border: "1px solid #E2E8F0", margin: "20px 0" }}>
            <FaSync className="fa-spin" style={{ fontSize: 32, color: "#2563EB", marginBottom: 12 }} />
            <div style={{ fontWeight: 700, color: "#475569" }}>Loading profile details...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: "16px 20px", color: "#B91C1C", fontWeight: 600, margin: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchProfile} style={{ background: "#B91C1C", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {profile && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            
            {/* Left Column: Avatar & Quick Summary Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Profile Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "28px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", textAlign: "center" }}>
                <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 16px" }}>
                  <img
                    src={currentAvatar}
                    alt={u.name || "Avatar"}
                    style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #EFF6FF", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"; }}
                  />
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{
                      position: "absolute", bottom: 0, right: 0, width: 32, height: 32,
                      borderRadius: "50%", background: "#2563EB", color: "#FFFFFF",
                      border: "2px solid #FFFFFF", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 12
                    }}
                  >
                    <FaCamera />
                  </button>
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>{u.name || "Traveler"}</h2>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{u.email}</div>
                <span style={{ fontSize: 11, fontWeight: 700, background: "#ECFDF5", color: "#059669", padding: "4px 12px", borderRadius: 20 }}>
                  ✓ {u.accountStatus || "Active & Verified"}
                </span>

                <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.5, margin: "16px 0 0", textAlign: "center" }}>
                  "{u.bio || "Passionate globetrotter discovering cultural treasures and scenic destinations worldwide."}"
                </p>

                <div style={{ height: 1, background: "#F1F5F9", margin: "20px 0" }} />

                {/* Account Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
                  <div style={{ background: "#F8FAFC", padding: "10px 6px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#2563EB" }}>{stats.hotelsBooked || 0}</div>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginTop: 2 }}>🏨 Hotels</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: "10px 6px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0284C7" }}>{stats.flightsBooked || 0}</div>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginTop: 2 }}>✈️ Flights</div>
                  </div>
                  <div style={{ background: "#F8FAFC", padding: "10px 6px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#059669" }}>{stats.totalTrips || 0}</div>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, marginTop: 2 }}>🌍 Trips</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
                  <button
                    onClick={() => navigate("/my-bookings")}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 12, border: "1px solid #BFDBFE",
                      background: "#EFF6FF", color: "#2563EB", fontWeight: 800, fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    <FaSuitcase /> View My Bookings
                  </button>
                  <button
                    onClick={() => navigate("/tickets")}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 12, border: "1px solid #E2E8F0",
                      background: "#FFFFFF", color: "#0F172A", fontWeight: 800, fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                    }}
                  >
                    <FaTicketAlt /> View Digital Tickets
                  </button>
                </div>
              </div>

              {/* Section C: Account Information Card */}
              <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 900, color: "#0F172A", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <FaShieldAlt color="#2563EB" /> Account Information
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Member Since</span>
                    <strong style={{ color: "#0F172A" }}>{u.memberSince || "May 2024"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Account Created</span>
                    <strong style={{ color: "#0F172A" }}>{u.accountCreatedFormatted || "15 May 2024"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Last Active</span>
                    <strong style={{ color: "#0F172A" }}>{u.lastLoginFormatted || "Today"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Account Status</span>
                    <strong style={{ color: "#16A34A" }}>Active &amp; Verified</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Profile Overview & Travel Preferences */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Section A: Profile Overview */}
              <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "28px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <FaUser color="#2563EB" /> Profile Overview
                  </h3>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <FaEdit /> Edit Details
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>FULL NAME</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.name || "Not set"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>EMAIL ADDRESS</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.email}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>PHONE NUMBER</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.phone || "+91 98765 43210"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.dob || "15 Aug 1995"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>GENDER</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.gender || "Male"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>LOCATION</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.city || "Bangalore"}, {u.country || "India"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>PREFERRED LANGUAGE</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.preferredLanguage || "English"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>EMERGENCY CONTACT</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{u.emergencyContact || "+91 98765 00000"}</div>
                  </div>
                </div>
              </div>

              {/* Section B: Travel Preferences */}
              <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "28px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <FaCompass color="#2563EB" /> Travel Preferences
                  </h3>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{ background: "none", border: "none", color: "#2563EB", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <FaEdit /> Edit Preferences
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>PREFERRED DESTINATIONS</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{p.preferredDestinations || "Tropical Beaches, Mountain Retreats"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>HOTEL PREFERENCE</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{p.preferredHotelType || "5-Star Luxury & Heritage Resorts"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>BUDGET RANGE</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>{p.budget || "Moderate (₹25,000 - ₹75,000)"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>TRAVEL INTERESTS</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{p.travelInterests || "Adventure, Culture, Photography"}</div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>PREFERRED ACTIVITIES</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>
                      {Array.isArray(p.preferredActivities) ? p.preferredActivities.join(", ") : (p.preferredActivities || "Scuba Diving, Heritage Tours")}
                    </div>
                  </div>

                  <div style={{ background: "#F8FAFC", padding: "14px 16px", borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 4 }}>FOOD PREFERENCE</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{p.foodPreference || "Continental & Local Specialties"}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            maxWidth: 680, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "32px", maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)", position: "relative", border: "1px solid #E2E8F0"
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
              Edit My Profile &amp; Travel Preferences
            </h2>
            <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>
              Update your personal traveler details and AI trip recommendation preferences.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Bio / Traveler Description</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={e => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Country</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={e => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Preferred Language</label>
                  <input
                    type="text"
                    value={editForm.preferredLanguage}
                    onChange={e => setEditForm(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Emergency Contact</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact}
                    onChange={e => setEditForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
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
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Upload New Avatar Image File</label>
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

              <div style={{ height: 1, background: "#F1F5F9", margin: "6px 0" }} />
              <div style={{ fontSize: 13, fontWeight: 900, color: "#1E293B" }}>Travel Preferences</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Preferred Destinations</label>
                  <input
                    type="text"
                    value={editForm.preferredDestinations}
                    onChange={e => setEditForm(prev => ({ ...prev, preferredDestinations: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Hotel Preference</label>
                  <input
                    type="text"
                    value={editForm.preferredHotelType}
                    onChange={e => setEditForm(prev => ({ ...prev, preferredHotelType: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Budget Preference</label>
                  <input
                    type="text"
                    value={editForm.budget}
                    onChange={e => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Food Preference</label>
                  <input
                    type="text"
                    value={editForm.foodPreference}
                    onChange={e => setEditForm(prev => ({ ...prev, foodPreference: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                    fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  {saving ? <FaSync className="fa-spin" /> : <FaCheckCircle />}
                  <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
