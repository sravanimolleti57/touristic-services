import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaCompass, FaSearch, FaStar, FaMapMarkerAlt, FaPlus,
  FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock,
  FaUpload, FaImage, FaTag, FaSyncAlt, FaLayerGroup, FaCheck
} from "react-icons/fa";
import axios from "axios";

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDest, setFilterDest] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingAct, setEditingAct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const initialFormState = {
    name: "",
    destinationId: "1",
    destinationName: "Bali, Indonesia",
    price: 1500,
    duration: "Half Day (3-4 Hours)",
    time: "Morning",
    location: "Bali, Indonesia",
    description: "",
    highlight: "",
    mustSee: false,
    rating: 4.8,
    status: "Active",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80"
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchActivities();
    fetchDestinations();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/activities?status=all");
      setActivities(res.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/destinations?status=all");
      setDestinations(res.data || []);
    } catch (err) {
      console.error("Error fetching destinations for dropdown:", err);
    }
  };

  const openAddModal = () => {
    setEditingAct(null);
    const defaultDest = destinations[0] || { id: "1", name: "Bali, Indonesia" };
    setFormData({
      ...initialFormState,
      destinationId: String(defaultDest.id || defaultDest._id),
      destinationName: defaultDest.name
    });
    setShowModal(true);
    setNotification(null);
  };

  const openEditModal = (act) => {
    setEditingAct(act);
    setFormData({
      name: act.name || "",
      destinationId: String(act.destinationId || "1"),
      destinationName: act.destinationName || "Bali, Indonesia",
      price: act.price || 1500,
      duration: act.duration || "Half Day",
      time: act.time || "Morning",
      location: act.location || "",
      description: act.description || "",
      highlight: act.highlight || "",
      mustSee: Boolean(act.mustSee),
      rating: act.rating || 4.8,
      status: act.status || "Active",
      image: act.image || "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80"
    });
    setShowModal(true);
    setNotification(null);
  };

  const handleDestinationSelectChange = (e) => {
    const selectedId = e.target.value;
    const match = destinations.find(d => String(d.id || d._id) === selectedId);
    setFormData(prev => ({
      ...prev,
      destinationId: selectedId,
      destinationName: match ? match.name : prev.destinationName,
      location: match ? match.location || match.name : prev.location
    }));
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/upload/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, image: res.data.url }));
        alert("Activity image uploaded and set!");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please provide an activity name.");
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const payload = {
      name: formData.name.trim(),
      destinationId: String(formData.destinationId),
      destinationName: formData.destinationName,
      price: Number(formData.price),
      duration: formData.duration.trim(),
      time: formData.time.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      highlight: formData.highlight.trim() || formData.name.trim(),
      mustSee: Boolean(formData.mustSee),
      rating: parseFloat(formData.rating) || 4.8,
      status: formData.status,
      image: formData.image.trim()
    };

    try {
      if (editingAct) {
        const actId = editingAct.id || editingAct._id;
        await axios.put(`http://127.0.0.1:5000/api/activities/${actId}`, payload);
        setNotification({
          type: "success",
          message: `✓ Activity "${formData.name}" updated successfully! New price and details are live.`
        });
      } else {
        await axios.post("http://127.0.0.1:5000/api/activities", payload);
        setNotification({
          type: "success",
          message: `✓ New activity "${formData.name}" added successfully!`
        });
      }

      setShowModal(false);
      fetchActivities();
    } catch (err) {
      console.error("Save activity error:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to save activity."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (act) => {
    const actName = act.name || "Activity";
    const actId = act.id || act._id;
    const ok = window.confirm(`Permanently delete activity "${actName}"?`);
    if (!ok) return;

    setActionLoadingId(actId);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/activities/${actId}`);
      setNotification({
        type: "success",
        message: `✓ Activity "${actName}" deleted successfully.`
      });
      setActivities(prev => prev.filter(a => (a.id || a._id) !== actId));
    } catch (err) {
      console.error("Delete activity error:", err);
      alert(err.response?.data?.message || "Failed to delete activity.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (act) => {
    const actId = act.id || act._id;
    setActionLoadingId(actId);
    try {
      const res = await axios.put(`http://127.0.0.1:5000/api/activities/${actId}/toggle-status`);
      const newStatus = res.data?.status || (act.status === "Active" ? "Disabled" : "Active");
      setActivities(prev => prev.map(a => (a.id || a._id) === actId ? { ...a, status: newStatus } : a));
      setNotification({
        type: "success",
        message: `✓ Activity status for "${act.name}" updated to ${newStatus}.`
      });
    } catch (err) {
      console.error("Toggle activity status error:", err);
      alert(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = activities.filter(a => {
    const matchSearch =
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.destinationName || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.description || "").toLowerCase().includes(search.toLowerCase());

    const matchDest = filterDest === "all" || String(a.destinationId) === String(filterDest);
    const matchStatus = filterStatus === "all" || (a.status || "Active").toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchDest && matchStatus;
  });

  return (
    <>
      <AdminNavbar />
      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        color: "#0F172A",
        padding: "100px 36px 60px",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            marginBottom: 28, display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#D97706", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaCompass /> DESTINATION ACTIVITIES &amp; TOURS MANAGEMENT
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                Manage Activities &amp; Experiences
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Add, price, edit, and associate sightseeing experiences with destinations. Updates immediately apply to user trip planning.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={fetchActivities}
                disabled={loading}
                style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: "#FFFFFF", border: "1px solid #E2E8F0",
                  color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
                }}
              >
                <FaSyncAlt className={loading ? "spin-icon" : ""} /> Refresh
              </button>

              <button
                id="add-activity-btn"
                onClick={openAddModal}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                  color: "#FFFFFF", fontWeight: 800, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13.5,
                  boxShadow: "0 4px 14px rgba(217,119,6,0.3)"
                }}
              >
                <FaPlus /> Add New Experience
              </button>
            </div>
          </div>

          {/* Notifications */}
          {notification && (
            <div style={{
              padding: "14px 20px", borderRadius: 12, marginBottom: 24,
              background: notification.type === "success" ? "#DCFCE7" : "#FEE2E2",
              border: notification.type === "success" ? "1px solid #86EFAC" : "1px solid #FCA5A5",
              color: notification.type === "success" ? "#15803D" : "#DC2626",
              fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10
            }}>
              {notification.type === "success" ? <FaCheckCircle size={18} /> : <FaTimesCircle size={18} />}
              {notification.message}
            </div>
          )}

          {/* Filters Bar */}
          <div style={{
            background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16,
            padding: "16px 20px", marginBottom: 24, display: "flex",
            justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14,
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", flex: 1 }}>
              {/* Search */}
              <div style={{ minWidth: 260, flex: "1 1 260px" }}>
                <SearchAutocomplete
                  value={search}
                  onChange={setSearch}
                  localData={activities}
                  searchFields={["name", "activityName", "destinationName", "location", "category", "highlights", "description"]}
                  placeholder="Search activity name, location, destination..."
                  onSelect={(item, title) => {
                    setSearch(title);
                  }}
                  inputStyle={{
                    padding: "10px 14px 10px 38px",
                    borderRadius: 10,
                    background: "#F8FAFC",
                    borderColor: "#E2E8F0",
                    fontSize: 13
                  }}
                />
              </div>

              {/* Destination Filter */}
              <select
                value={filterDest}
                onChange={e => setFilterDest(e.target.value)}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0",
                  background: "#F8FAFC", color: "#0F172A", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer"
                }}
              >
                <option value="all">All Destinations</option>
                {destinations.map(d => (
                  <option key={d.id || d._id} value={String(d.id || d._id)}>{d.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0",
                  background: "#F8FAFC", color: "#0F172A", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer"
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>

            <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
              Showing <strong>{filtered.length}</strong> of {activities.length} activities
            </div>
          </div>

          {/* Activities Table */}
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
              <FaSyncAlt className="spin-icon" size={24} style={{ marginBottom: 12, color: "#D97706" }} />
              <div>Loading activities from database...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No activities found</h3>
              <p style={{ margin: "0 0 16px", fontSize: 13 }}>Create your first activity experience for user destination packages.</p>
              <button
                onClick={openAddModal}
                style={{
                  padding: "10px 18px", borderRadius: 10, background: "#D97706", color: "#FFFFFF",
                  fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer"
                }}
              >
                + Add First Experience
              </button>
            </div>
          ) : (
            <div style={{
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
              overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Activity / Tour</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Destination</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Price per Person</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Duration / Timing</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Rating</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(act => {
                      const actId = act.id || act._id;
                      const isActive = (act.status || "Active").toLowerCase() === "active";
                      const imgUrl = act.image || "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80";

                      return (
                        <tr key={actId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          {/* Activity info */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <img
                                src={imgUrl}
                                alt={act.name}
                                style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #E2E8F0" }}
                                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80"; }}
                              />
                              <div>
                                <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
                                  {act.name}
                                  {act.mustSee && (
                                    <span style={{ fontSize: 10, background: "#FEF3C7", color: "#B45309", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>
                                      ⭐ Must-See
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                  <FaMapMarkerAlt size={11} color="#D97706" /> {act.location || act.destinationName}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Destination */}
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                              background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE"
                            }}>
                              {act.destinationName || "General"}
                            </span>
                          </td>

                          {/* Price */}
                          <td style={{ padding: "14px 18px", fontWeight: 800, color: "#16A34A", fontSize: 14 }}>
                            {act.priceFormatted || `₹${Number(act.price || 0).toLocaleString("en-IN")}`}
                          </td>

                          {/* Duration / Timing */}
                          <td style={{ padding: "14px 18px", color: "#475569" }}>
                            <div style={{ fontWeight: 600 }}>{act.duration || "Half Day"}</div>
                            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{act.time || "Flexible"}</div>
                          </td>

                          {/* Rating */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#0F172A" }}>
                              <FaStar color="#F59E0B" size={12} /> {act.rating || 4.8}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "14px 18px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(act)}
                              disabled={actionLoadingId === actId}
                              title="Click to toggle Active / Disabled"
                              style={{
                                padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800,
                                background: isActive ? "#DCFCE7" : "#F1F5F9",
                                color: isActive ? "#15803D" : "#64748B",
                                border: isActive ? "1px solid #86EFAC" : "1px solid #CBD5E1",
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4
                              }}
                            >
                              {isActive ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                              {isActive ? "Active" : "Disabled"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 18px", textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => openEditModal(act)}
                                style={{
                                  padding: "6px 10px", borderRadius: 8, background: "#EFF6FF",
                                  border: "1px solid #BFDBFE", color: "#2563EB", cursor: "pointer",
                                  fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                                }}
                                title="Edit activity"
                              >
                                <FaEdit size={12} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(act)}
                                disabled={actionLoadingId === actId}
                                style={{
                                  padding: "6px 10px", borderRadius: 8, background: "#FEF2F2",
                                  border: "1px solid #FECACA", color: "#DC2626", cursor: "pointer",
                                  fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                                }}
                                title="Delete activity"
                              >
                                <FaTrash size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────── ADD / EDIT ACTIVITY MODAL ───────────────── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)", zIndex: 2000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 24, width: "100%", maxWidth: 680,
            maxHeight: "90vh", overflowY: "auto", padding: "32px 36px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  {editingAct ? "Edit Activity Experience" : "Add New Experience"}
                </h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
                  Associate sightseeing activities, tickets, or guided tours with destination trips.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "#F1F5F9", border: "none", borderRadius: "50%", width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B"
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {/* Activity Name */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Activity / Tour Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Scuba Diving at Banana Reef"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Destination Dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Associated Destination *
                  </label>
                  <select
                    value={formData.destinationId}
                    onChange={handleDestinationSelectChange}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#FFFFFF"
                    }}
                  >
                    {destinations.map(d => (
                      <option key={d.id || d._id} value={String(d.id || d._id)}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price (₹) */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Price per Person (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="e.g. 1800"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box", fontWeight: 700, color: "#16A34A"
                    }}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3-4 Hours or Full Day"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Time */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Ideal Time of Day
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. Morning, Sunset, Evening"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Location */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Specific Location / Meeting Point
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Ubud Monkey Forest Sanctuary, Bali"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Status and Must-See */}
              <div style={{ display: "flex", gap: 24, alignItems: "center", background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.status === "Active"}
                    onChange={e => setFormData({ ...formData, status: e.target.checked ? "Active" : "Disabled" })}
                    style={{ width: 16, height: 16, accentColor: "#D97706" }}
                  />
                  <span>Active &amp; Available for Booking</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.mustSee}
                    onChange={e => setFormData({ ...formData, mustSee: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#F59E0B" }}
                  />
                  <span>⭐ Must-See Recommendation Badge</span>
                </label>
              </div>

              {/* Image URL & Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Activity Image URL
                </label>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    style={{
                      flex: 1, padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none"
                    }}
                  />
                  <label style={{
                    padding: "10px 16px", borderRadius: 10, background: "#EFF6FF",
                    border: "1px solid #BFDBFE", color: "#2563EB", fontWeight: 700,
                    fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}>
                    <FaUpload /> {uploadingImage ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: "100%", height: 120, borderRadius: 10, objectFit: "cover" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Activity Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed highlights and what travelers will experience..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #F1F5F9", paddingTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px", borderRadius: 10, background: "#F1F5F9",
                    border: "1px solid #E2E8F0", color: "#475569", fontWeight: 700,
                    fontSize: 13, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 24px", borderRadius: 10,
                    background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                    border: "none", color: "#FFFFFF", fontWeight: 800,
                    fontSize: 13.5, cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(217,119,6,0.3)"
                  }}
                >
                  {submitting ? "Saving..." : (editingAct ? "Save Changes" : "Create Activity")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
