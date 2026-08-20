import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import { useUser, DEFAULT_AVATAR } from "../context/UserContext";
import {
  FaUserCog, FaLock, FaBell, FaGlobe, FaShieldAlt,
  FaTrashAlt, FaCheckCircle, FaTimes, FaSync, FaSave,
  FaArrowLeft, FaKey, FaSignOutAlt, FaCamera, FaTrash
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, profileImage } = useUser();
  const localUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = localUser?.email || "";

  const [activeSection, setActiveSection] = useState("account"); // account | preferences | notifications | security | danger
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Account Form
  const [accountForm, setAccountForm] = useState({
    name: localUser?.name || "",
    email: userEmail,
    phone: localUser?.phone || "+91 98765 43210",
    avatar: profileImage || localUser?.avatar || localUser?.profileImage || ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    setAccountForm(prev => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
      avatar: profileImage || user?.avatar || prev.avatar
    }));
    setAvatarPreview(profileImage || user?.avatar || "");
  }, [user, profileImage]);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Preferences Form
  const [prefForm, setPrefForm] = useState({
    language: "English (US)",
    currency: "INR (₹)",
    travelStyle: "Explorer & Adventure",
    notificationBooking: true,
    notificationPayment: true,
    notificationReminders: true,
    notificationPromo: false
  });

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    fetchSettings();
  }, [userEmail]);

  const showToastMsg = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/settings/${userEmail}`);
      if (res.data) {
        const s = res.data;
        const n = s.notifications || {};
        setPrefForm({
          language: s.language || "English (US)",
          currency: s.currency || "INR (₹)",
          travelStyle: s.travelStyle || "Explorer & Adventure",
          notificationBooking: n.bookingConfirmation !== false,
          notificationPayment: n.paymentUpdates !== false,
          notificationReminders: n.tripReminders !== false,
          notificationPromo: n.promotionalOffers === true
        });
      }
    } catch (err) {
      console.error("Settings load error:", err);
    }
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalAvatar = accountForm.avatar;

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

      await axios.put(`${API_BASE}/api/user/profile`, {
        email: userEmail,
        name: accountForm.name,
        phone: accountForm.phone,
        avatar: finalAvatar,
        profileImage: finalAvatar
      });

      // Synchronize centralized user state across all components
      updateUser({
        ...localUser,
        name: accountForm.name,
        phone: accountForm.phone,
        avatar: finalAvatar,
        profileImage: finalAvatar
      });

      setAvatarFile(null);
      showToastMsg("Account details & profile image updated successfully! 🎉");
    } catch (err) {
      console.error("Save account error:", err);
      showToastMsg("Failed to update account details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/user/settings`, {
        email: userEmail,
        settings: {
          language: prefForm.language,
          currency: prefForm.currency,
          travelStyle: prefForm.travelStyle,
          notifications: {
            bookingConfirmation: prefForm.notificationBooking,
            paymentUpdates: prefForm.notificationPayment,
            tripReminders: prefForm.notificationReminders,
            promotionalOffers: prefForm.notificationPromo
          }
        }
      });
      showToastMsg("Preferences and notification settings saved! ⚙️");
    } catch (err) {
      console.error("Save preferences error:", err);
      showToastMsg("Failed to save preferences.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToastMsg("New passwords do not match!", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToastMsg("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/change-password`, {
        email: userEmail,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      showToastMsg("Password changed successfully! 🔐");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Change password error:", err);
      showToastMsg("Failed to change password. Please check your old password.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToastMsg("Please type DELETE to confirm.", "error");
      return;
    }

    setDeleting(true);
    try {
      await axios.post(`${API_BASE}/api/user/delete-account`, { email: userEmail });
      localStorage.clear();
      alert("Your account has been permanently deleted.");
      navigate("/login");
    } catch (err) {
      console.error("Delete account error:", err);
      showToastMsg("Failed to delete account.", "error");
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", paddingTop: 70, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SharedNavbar activeTab="settings" />

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

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
        
        {/* Page Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => navigate("/home")}
            style={{
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10,
              padding: "8px 14px", color: "#475569", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
            }}
          >
            <FaArrowLeft size={11} /> Back to Home
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>Account Settings &amp; Preferences</h1>
        </div>

        {/* 2-Column Settings Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
          
          {/* Navigation Sidebar */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: "16px", border: "1px solid #E2E8F0", height: "fit-content", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "account", label: "Account Info", icon: <FaUserCog /> },
              { id: "preferences", label: "Preferences & Notifications", icon: <FaGlobe /> },
              { id: "security", label: "Security & Password", icon: <FaLock /> },
              { id: "danger", label: "Danger Zone", icon: <FaTrashAlt /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12, border: "none",
                  background: activeSection === tab.id ? "#EFF6FF" : "transparent",
                  color: activeSection === tab.id ? "#2563EB" : tab.id === "danger" ? "#DC2626" : "#475569",
                  fontWeight: 800, fontSize: 13, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Settings Content Panels */}
          <div style={{ background: "#FFFFFF", borderRadius: 24, padding: "30px", border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            
            {/* 1. Account Info */}
            {activeSection === "account" && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Account Details</h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>Manage your basic profile identity and contact information.</p>

                <form onSubmit={handleSaveAccount} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Profile Avatar Control */}
                  <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "2px solid #2563EB", background: "#EFF6FF", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {avatarPreview || accountForm.avatar ? (
                          <img
                            src={avatarPreview || accountForm.avatar}
                            alt="Avatar"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                          />
                        ) : (
                          <span style={{ fontWeight: 800, color: "#2563EB", fontSize: 20 }}>
                            {(accountForm.name || userEmail || "T")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Profile Picture</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Synchronized across top navbar, dropdown, dashboard, and profile</div>
                        {(avatarPreview || accountForm.avatar) && (
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarFile(null);
                              setAvatarPreview("");
                              setAccountForm(prev => ({ ...prev, avatar: "" }));
                            }}
                            style={{
                              background: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5",
                              borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                              cursor: "pointer", marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4
                            }}
                          >
                            <FaTrash size={10} /> Remove Picture
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Avatar Image URL</label>
                        <input
                          type="text"
                          value={accountForm.avatar}
                          placeholder="https://images.unsplash.com/..."
                          onChange={e => {
                            setAccountForm(prev => ({ ...prev, avatar: e.target.value }));
                            setAvatarPreview(e.target.value);
                          }}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Upload File</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setAvatarFile(e.target.files[0]);
                              setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                            }
                          }}
                          style={{ fontSize: 12, paddingTop: 4 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={accountForm.name}
                      onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={accountForm.email}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F1F5F9", color: "#64748B", fontSize: 13, boxSizing: "border-box" }}
                    />
                    <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, display: "block" }}>Email address is tied to your account authentication and cannot be edited.</span>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Phone Number</label>
                    <input
                      type="text"
                      value={accountForm.phone}
                      onChange={e => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "10px 22px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                        fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      {loading ? <FaSync className="fa-spin" /> : <FaSave />}
                      <span>Save Account Info</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Preferences & Notifications */}
            {activeSection === "preferences" && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Preferences &amp; Notifications</h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>Customize language, currency, and email notifications.</p>

                <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Platform Language</label>
                      <select
                        value={prefForm.language}
                        onChange={e => setPrefForm(prev => ({ ...prev, language: e.target.value }))}
                        style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                      >
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Hindi (हिंदी)</option>
                        <option>French (Français)</option>
                        <option>Spanish (Español)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Display Currency</label>
                      <select
                        value={prefForm.currency}
                        onChange={e => setPrefForm(prev => ({ ...prev, currency: e.target.value }))}
                        style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13 }}
                      >
                        <option>INR (₹) - Indian Rupee</option>
                        <option>USD ($) - US Dollar</option>
                        <option>EUR (€) - Euro</option>
                        <option>AED (د.إ) - UAE Dirham</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "#F1F5F9", margin: "8px 0" }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Email &amp; Trip Notifications</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { key: "notificationBooking", label: "Booking Confirmations & E-Tickets", desc: "Receive immediate confirmation receipts and passes." },
                      { key: "notificationPayment", label: "Payment Status Updates", desc: "Get notifications when transaction finishes or refunds issue." },
                      { key: "notificationReminders", label: "Trip Reminders & Itinerary Alerts", desc: "24-hour departure and hotel check-in notifications." },
                      { key: "notificationPromo", label: "Exclusive AI Travel Deals & Offers", desc: "Personalized discounts matching your travel preferences." },
                    ].map(n => (
                      <label key={n.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={prefForm[n.key]}
                          onChange={e => setPrefForm(prev => ({ ...prev, [n.key]: e.target.checked }))}
                          style={{ marginTop: 3, width: 16, height: 16 }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{n.label}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{n.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "10px 22px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                        fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      {loading ? <FaSync className="fa-spin" /> : <FaSave />}
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. Security & Password */}
            {activeSection === "security" && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>Security &amp; Password</h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>Change your password and manage session credentials.</p>

                <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.oldPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>New Password (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 4 }}>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: "10px 22px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                        fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      {loading ? <FaSync className="fa-spin" /> : <FaKey />}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Danger Zone */}
            {activeSection === "danger" && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#DC2626", margin: "0 0 6px" }}>Danger Zone</h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 20px" }}>Irreversible actions regarding your account and saved history.</p>

                <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: "20px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#B91C1C", margin: "0 0 6px" }}>Delete Account Permanently</h3>
                  <p style={{ color: "#7F1D1D", fontSize: 12, margin: "0 0 16px", lineHeight: 1.5 }}>
                    Once you delete your account, all your saved wishlist items and travel profile will be permanently deleted. Confirmed e-tickets may be archived for tax compliance.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: "#DC2626", color: "#FFFFFF", fontWeight: 800, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowDeleteModal(false)}>
          <div style={{
            maxWidth: 480, width: "100%", background: "#FFFFFF", borderRadius: 24,
            padding: "28px", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            position: "relative", border: "1px solid #E2E8F0"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{ position: "absolute", top: 18, right: 18, background: "#F1F5F9", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <FaTimes />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#DC2626", margin: "0 0 8px" }}>Confirm Account Deletion</h3>
            <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
              This action cannot be undone. Please type <strong>DELETE</strong> below to confirm.
            </p>

            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 13, marginBottom: 16, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                style={{
                  padding: "8px 18px", borderRadius: 10, border: "none",
                  background: deleteConfirmText === "DELETE" ? "#DC2626" : "#FCA5A5",
                  color: "#FFFFFF", fontWeight: 800, fontSize: 12, cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed"
                }}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
