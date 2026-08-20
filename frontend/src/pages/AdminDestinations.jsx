import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaCompass, FaSearch, FaStar, FaMapMarkerAlt, FaPlus,
  FaEdit, FaTrash, FaEye, FaTimesCircle, FaCheckCircle,
  FaUpload, FaImage, FaTag, FaClock, FaCheck, FaExclamationTriangle,
  FaSyncAlt, FaExternalLinkAlt, FaGlobeAmericas
} from "react-icons/fa";
import axios from "axios";

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  // Modals State
  const [showModal, setShowModal] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [inspectDest, setInspectDest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form State
  const initialFormState = {
    name: "",
    country: "",
    location: "",
    category: "Beach & Tropical",
    price: 45000,
    rating: 4.8,
    reviews: 1200,
    tripDuration: "5–7 Days",
    bestTime: "April to October",
    status: "Active",
    featured: false,
    overview: "",
    detailedOverview: "",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    imagesStr: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    language: "English / Local",
    currency: "INR (₹)",
    timezone: "UTC +5:30",
    visa: "Visa on Arrival / eVisa",
    transportation: "Taxis, Metro, Trains, Rental Cars",
    idealForStr: "Couples, Families, Solo Travelers",
    tagsStr: "Beach, Temples, Culture",
    highlightsStr: "Iconic Landmarks, Ancient Heritage, Nature & Parks, Local Food & Markets"
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/destinations");
      setDestinations(res.data || []);
    } catch (err) {
      console.error("Error loading destinations:", err);
      // Fallback
      try {
        const fallbackRes = await axios.get("http://127.0.0.1:5000/api/destinations?status=all");
        setDestinations(fallbackRes.data || []);
      } catch (e2) {
        console.error("Fallback error:", e2);
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDest(null);
    setFormData(initialFormState);
    setShowModal(true);
    setNotification(null);
  };

  const openEditModal = (dest) => {
    setEditingDest(dest);
    
    // Parse price number
    let numericPrice = 45000;
    if (typeof dest.price === "number") {
      numericPrice = dest.price;
    } else if (dest.price) {
      const parsed = parseInt(String(dest.price).replace(/[^0-9]/g, ""), 10);
      if (!isNaN(parsed)) numericPrice = parsed;
    }

    const imagesArr = Array.isArray(dest.images) && dest.images.length > 0 
      ? dest.images 
      : (dest.img ? [dest.img] : []);

    const idealForArr = Array.isArray(dest.idealFor) ? dest.idealFor : [];
    const tagsArr = Array.isArray(dest.tags) ? dest.tags : [];
    const highlightsArr = Array.isArray(dest.highlights) 
      ? dest.highlights.map(h => typeof h === "object" ? `${h.title || h.name || ""}: ${h.desc || ""}` : String(h))
      : [];

    setFormData({
      name: dest.name || "",
      country: dest.country || "",
      location: dest.location || dest.name || "",
      category: dest.category || "General & Sightseeing",
      price: numericPrice,
      rating: dest.rating || 4.8,
      reviews: dest.reviews || 500,
      tripDuration: dest.tripDuration || "5–7 Days",
      bestTime: dest.bestTime || "Year-round",
      status: dest.status || "Active",
      featured: Boolean(dest.featured),
      overview: dest.overview || dest.description || "",
      detailedOverview: dest.detailedOverview || dest.overview || dest.description || "",
      img: dest.img || (imagesArr[0] || ""),
      imagesStr: imagesArr.join("\n"),
      language: dest.language || "English / Local",
      currency: dest.currency || "INR (₹)",
      timezone: dest.timezone || "UTC +5:30",
      visa: dest.visa || "Visa on Arrival / eVisa",
      transportation: dest.transportation || "Taxis, Metro, Trains, Rental Cars",
      idealForStr: idealForArr.join(", "),
      tagsStr: tagsArr.join(", "),
      highlightsStr: highlightsArr.join("\n")
    });

    setShowModal(true);
    setNotification(null);
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
        const newUrl = res.data.url;
        setFormData(prev => {
          const currentList = prev.imagesStr.split("\n").map(s => s.trim()).filter(Boolean);
          const updatedList = [newUrl, ...currentList.filter(u => u !== newUrl)];
          return {
            ...prev,
            img: newUrl,
            imagesStr: updatedList.join("\n")
          };
        });
        alert("Image uploaded and set successfully!");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. You can also paste an image URL directly.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please provide a destination name.");
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const imagesArray = formData.imagesStr
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const mainImage = formData.img.trim() || (imagesArray[0] || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80");
    if (imagesArray.length === 0 && mainImage) {
      imagesArray.push(mainImage);
    }

    const idealForArray = formData.idealForStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const tagsArray = formData.tagsStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const highlightsArray = formData.highlightsStr
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(":");
        if (parts.length > 1) {
          return { icon: "✨", title: parts[0].trim(), desc: parts.slice(1).join(":").trim() };
        }
        return { icon: "✨", title: line, desc: "Highlighted experience" };
      });

    const payload = {
      name: formData.name.trim(),
      country: formData.country.trim() || (formData.name.includes(",") ? formData.name.split(",").pop().trim() : "Global"),
      location: formData.location.trim() || formData.name.trim(),
      category: formData.category,
      price: `₹${Number(formData.price).toLocaleString("en-IN")}`,
      startingPrice: `₹${Number(formData.price).toLocaleString("en-IN")}`,
      rating: parseFloat(formData.rating) || 4.8,
      reviews: parseInt(formData.reviews, 10) || 500,
      tripDuration: formData.tripDuration,
      bestTime: formData.bestTime,
      status: formData.status,
      featured: Boolean(formData.featured),
      overview: formData.overview.trim(),
      description: formData.overview.trim(),
      detailedOverview: formData.detailedOverview.trim() || formData.overview.trim(),
      img: mainImage,
      images: imagesArray,
      language: formData.language,
      currency: formData.currency,
      timezone: formData.timezone,
      visa: formData.visa,
      transportation: formData.transportation,
      idealFor: idealForArray.length > 0 ? idealForArray : ["Couples", "Families"],
      tags: tagsArray.length > 0 ? tagsArray : [formData.category],
      highlights: highlightsArray
    };

    try {
      if (editingDest) {
        const destId = editingDest.id || editingDest._id;
        await axios.put(`http://127.0.0.1:5000/api/destinations/${destId}`, payload);
        setNotification({
          type: "success",
          message: `✓ Destination "${formData.name}" updated successfully! Changes are live on User pages.`
        });
      } else {
        await axios.post("http://127.0.0.1:5000/api/destinations", payload);
        setNotification({
          type: "success",
          message: `✓ New destination "${formData.name}" created successfully! Now visible on User pages.`
        });
      }

      setShowModal(false);
      fetchDestinations();
    } catch (err) {
      console.error("Save destination error:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to save destination. Please check the form."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dest) => {
    const destName = dest.name || "Destination";
    const destId = dest.id || dest._id;
    const ok = window.confirm(`Are you sure you want to permanently delete destination "${destName}"? This will remove it from the User Destinations catalog.`);
    if (!ok) return;

    setActionLoadingId(destId);
    try {
      await axios.delete(`http://127.0.0.1:5000/api/destinations/${destId}`);
      setNotification({
        type: "success",
        message: `✓ Destination "${destName}" deleted successfully.`
      });
      setDestinations(prev => prev.filter(d => (d.id || d._id) !== destId));
    } catch (err) {
      console.error("Delete destination error:", err);
      alert(err.response?.data?.message || "Failed to delete destination.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (dest) => {
    const destId = dest.id || dest._id;
    setActionLoadingId(destId);
    try {
      const res = await axios.put(`http://127.0.0.1:5000/api/destinations/${destId}/toggle-status`);
      const newStatus = res.data?.status || (dest.status === "Active" ? "Disabled" : "Active");
      setDestinations(prev => prev.map(d => (d.id || d._id) === destId ? { ...d, status: newStatus } : d));
      setNotification({
        type: "success",
        message: `✓ Status for "${dest.name}" set to ${newStatus}.`
      });
    } catch (err) {
      console.error("Toggle status error:", err);
      alert(err.response?.data?.message || "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const categoriesList = Array.from(new Set([
    "Beach & Tropical", "City & Art", "Beach & Luxury", "Heritage & Culture",
    "City & Technology", "Island & Romance", "Mountains & Snow", "Luxury & Desert",
    "Nature & Wildlife", "Adventure & Trekking", "Spiritual & Wellness"
  ]));

  const filtered = destinations.filter(d => {
    const matchSearch =
      (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.country || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.location || "").toLowerCase().includes(search.toLowerCase());

    const matchCategory = filterCategory === "all" || (d.category || "").toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = filterStatus === "all" || (d.status || "Active").toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchCategory && matchStatus;
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

          {/* Header Banner */}
          <div style={{
            marginBottom: 28, display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 16
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#9333EA", fontSize: 13, fontWeight: 800, marginBottom: 6
              }}>
                <FaCompass /> DESTINATION CONTENT MANAGEMENT (CRUD)
              </div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, color: "#0F172A" }}>
                Manage Travel Destinations
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.95rem", margin: "4px 0 0" }}>
                Create, edit, price, and publish destination trip packages. All updates sync instantly with the User Portal.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={fetchDestinations}
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
                id="add-destination-btn"
                onClick={openAddModal}
                style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                  color: "#FFFFFF", fontWeight: 800, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13.5,
                  boxShadow: "0 4px 14px rgba(147,51,234,0.3)"
                }}
              >
                <FaPlus /> Add New Destination
              </button>
            </div>
          </div>

          {/* Global Notification Banner */}
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

          {/* Filters and View Controls */}
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
                  localData={destinations}
                  searchFields={["name", "country", "location", "category", "city", "description"]}
                  placeholder="Search destination, country, category..."
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

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0",
                  background: "#F8FAFC", color: "#0F172A", fontSize: 13, fontWeight: 600, outline: "none", cursor: "pointer"
                }}
              >
                <option value="all">All Categories</option>
                {categoriesList.map(c => (
                  <option key={c} value={c}>{c}</option>
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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                Showing <strong>{filtered.length}</strong> of {destinations.length} destinations
              </span>
              <div style={{ display: "inline-flex", background: "#F1F5F9", padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  style={{
                    border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: viewMode === "table" ? "#FFFFFF" : "transparent",
                    color: viewMode === "table" ? "#0F172A" : "#64748B", cursor: "pointer",
                    boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  style={{
                    border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: viewMode === "grid" ? "#FFFFFF" : "transparent",
                    color: viewMode === "grid" ? "#0F172A" : "#64748B", cursor: "pointer",
                    boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Destinations Content */}
          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
              <FaSyncAlt className="spin-icon" size={24} style={{ marginBottom: 12, color: "#9333EA" }} />
              <div>Loading destinations from database...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#64748B", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>No destinations found</h3>
              <p style={{ margin: "0 0 16px", fontSize: 13 }}>Try clearing your filters or create a brand new destination.</p>
              <button
                onClick={openAddModal}
                style={{
                  padding: "10px 18px", borderRadius: 10, background: "#9333EA", color: "#FFFFFF",
                  fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer"
                }}
              >
                + Add First Destination
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* TABLE VIEW */
            <div style={{
              background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18,
              overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#64748B" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Destination</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Category</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Starting Price</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Rating</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700 }}>Bookings</th>
                      <th style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(dest => {
                      const destId = dest.id || dest._id;
                      const isActive = (dest.status || "Active").toLowerCase() === "active";
                      const imgUrl = dest.img || (Array.isArray(dest.images) && dest.images[0]) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80";

                      return (
                        <tr key={destId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                          {/* Destination info */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <img
                                src={imgUrl}
                                alt={dest.name}
                                style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: "1px solid #E2E8F0" }}
                                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"; }}
                              />
                              <div>
                                <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                  {dest.name}
                                  {dest.featured && (
                                    <span style={{ fontSize: 10, background: "#FEF3C7", color: "#B45309", padding: "2px 6px", borderRadius: 6, fontWeight: 800 }}>
                                      ⭐ Featured
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                  <FaMapMarkerAlt size={11} color="#9333EA" /> {dest.country || dest.location || "Global"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td style={{ padding: "14px 18px" }}>
                            <span style={{
                              padding: "4px 10px", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                              background: "#FAF5FF", color: "#9333EA", border: "1px solid #E9D5FF"
                            }}>
                              {dest.category || "General"}
                            </span>
                          </td>

                          {/* Starting Price */}
                          <td style={{ padding: "14px 18px", fontWeight: 800, color: "#16A34A", fontSize: 14 }}>
                            {dest.price || dest.startingPrice || "₹45,000"}
                          </td>

                          {/* Duration */}
                          <td style={{ padding: "14px 18px", color: "#475569", fontWeight: 600 }}>
                            {dest.tripDuration || "5–7 Days"}
                          </td>

                          {/* Rating */}
                          <td style={{ padding: "14px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#0F172A" }}>
                              <FaStar color="#F59E0B" size={12} /> {dest.rating || 4.8}
                              <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}>({dest.reviews || 0})</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "14px 18px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(dest)}
                              disabled={actionLoadingId === destId}
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

                          {/* Bookings */}
                          <td style={{ padding: "14px 18px", fontWeight: 700, color: "#2563EB" }}>
                            {dest.totalBookings || 0} trips
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 18px", textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => openEditModal(dest)}
                                style={{
                                  padding: "6px 10px", borderRadius: 8, background: "#EFF6FF",
                                  border: "1px solid #BFDBFE", color: "#2563EB", cursor: "pointer",
                                  fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                                }}
                                title="Edit destination"
                              >
                                <FaEdit size={12} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(dest)}
                                disabled={actionLoadingId === destId}
                                style={{
                                  padding: "6px 10px", borderRadius: 8, background: "#FEF2F2",
                                  border: "1px solid #FECACA", color: "#DC2626", cursor: "pointer",
                                  fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                                }}
                                title="Delete destination"
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
          ) : (
            /* CARDS GRID VIEW */
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20
            }}>
              {filtered.map(dest => {
                const destId = dest.id || dest._id;
                const isActive = (dest.status || "Active").toLowerCase() === "active";
                const imgUrl = dest.img || (Array.isArray(dest.images) && dest.images[0]) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80";

                return (
                  <div
                    key={destId}
                    style={{
                      background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 20,
                      overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      display: "flex", flexDirection: "column", transition: "all 0.2s"
                    }}
                  >
                    <div style={{ position: "relative", height: 180 }}>
                      <img
                        src={imgUrl}
                        alt={dest.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"; }}
                      />
                      <span style={{
                        position: "absolute", top: 12, left: 12,
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                        background: "rgba(15, 23, 42, 0.75)", color: "#FFFFFF", backdropFilter: "blur(4px)"
                      }}>
                        {dest.category || "General"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(dest)}
                        style={{
                          position: "absolute", top: 12, right: 12,
                          padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 800,
                          background: isActive ? "#DCFCE7" : "#FEE2E2",
                          color: isActive ? "#15803D" : "#DC2626",
                          border: "none", cursor: "pointer"
                        }}
                      >
                        {isActive ? "● Active" : "○ Disabled"}
                      </button>
                    </div>

                    <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                            {dest.name}
                          </h3>
                        </div>

                        <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                          <FaMapMarkerAlt color="#9333EA" /> {dest.country || dest.location} • {dest.tripDuration || "5–7 Days"}
                        </div>

                        <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {dest.overview || dest.description || "Scenic destination package."}
                        </p>
                      </div>

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid #F1F5F9", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Starting Price</div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#16A34A" }}>
                              {dest.price || dest.startingPrice || "₹45,000"}
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Rating</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 4 }}>
                              <FaStar color="#F59E0B" size={12} /> {dest.rating || 4.8}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(dest)}
                            style={{
                              padding: "8px", borderRadius: 10, background: "#EFF6FF",
                              border: "1px solid #BFDBFE", color: "#2563EB", fontWeight: 800,
                              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                            }}
                          >
                            <FaEdit /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(dest)}
                            style={{
                              padding: "8px", borderRadius: 10, background: "#FEF2F2",
                              border: "1px solid #FECACA", color: "#DC2626", fontWeight: 800,
                              fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                            }}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ───────────────── ADD / EDIT DESTINATION MODAL ───────────────── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)", zIndex: 2000, display: "flex",
          alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 24, width: "100%", maxWidth: 760,
            maxHeight: "90vh", overflowY: "auto", padding: "32px 36px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", boxSizing: "border-box", position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                  {editingDest ? "Edit Travel Destination" : "Create New Travel Destination"}
                </h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>
                  Fields saved here immediately update user search results, package pricing, and details.
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
                {/* Name */}
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Destination Name * <span style={{ color: "#94A3B8", fontWeight: 500 }}>(e.g. "Bali, Indonesia" or "Goa, India")</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kyoto, Japan"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Country */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Japan"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#FFFFFF"
                    }}
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Starting Price (₹) */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Starting Package Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="e.g. 45000"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box", fontWeight: 700, color: "#16A34A"
                    }}
                  />
                </div>

                {/* Trip Duration */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Trip Duration
                  </label>
                  <input
                    type="text"
                    value={formData.tripDuration}
                    onChange={e => setFormData({ ...formData, tripDuration: e.target.value })}
                    placeholder="e.g. 5–7 Days"
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Rating & Reviews */}
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={e => setFormData({ ...formData, reviews: parseInt(e.target.value, 10) })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Status and Featured checkboxes */}
              <div style={{ display: "flex", gap: 24, alignItems: "center", background: "#F8FAFC", padding: "12px 16px", borderRadius: 12, marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.status === "Active"}
                    onChange={e => setFormData({ ...formData, status: e.target.checked ? "Active" : "Disabled" })}
                    style={{ width: 16, height: 16, accentColor: "#9333EA" }}
                  />
                  <span>Active &amp; Published to Users</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#F59E0B" }}
                  />
                  <span>⭐ Featured on Home Page</span>
                </label>
              </div>

              {/* Image URL & Upload Section */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Main Image URL *
                </label>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <input
                    type="text"
                    required
                    value={formData.img}
                    onChange={e => setFormData({ ...formData, img: e.target.value })}
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
                    <FaUpload /> {uploadingImage ? "Uploading..." : "Upload File"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                {formData.img && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8FAFC", padding: 8, borderRadius: 10 }}>
                    <img
                      src={formData.img}
                      alt="Preview"
                      style={{ width: 60, height: 40, borderRadius: 6, objectFit: "cover" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <span style={{ fontSize: 11.5, color: "#64748B" }}>Image live preview</span>
                  </div>
                )}
              </div>

              {/* Additional Gallery Images */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Additional Gallery Image URLs <span style={{ color: "#94A3B8", fontWeight: 500 }}>(one per line)</span>
                </label>
                <textarea
                  rows="3"
                  value={formData.imagesStr}
                  onChange={e => setFormData({ ...formData, imagesStr: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 12.5, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Short Overview & Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Short Overview / Subtitle *
                </label>
                <textarea
                  rows="2"
                  required
                  value={formData.overview}
                  onChange={e => setFormData({ ...formData, overview: e.target.value })}
                  placeholder="A brief 1-2 sentence description shown on destination cards..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Detailed Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Detailed Overview
                </label>
                <textarea
                  rows="4"
                  value={formData.detailedOverview}
                  onChange={e => setFormData({ ...formData, detailedOverview: e.target.value })}
                  placeholder="Comprehensive travel guide overview for the destination details page..."
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 10,
                    border: "1px solid #CBD5E1", fontSize: 13, outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Submit Buttons */}
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
                    background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                    border: "none", color: "#FFFFFF", fontWeight: 800,
                    fontSize: 13.5, cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(147,51,234,0.3)"
                  }}
                >
                  {submitting ? "Saving..." : (editingDest ? "Save Changes" : "Create Destination")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
