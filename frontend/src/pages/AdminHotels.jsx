import { useState, useEffect, useMemo } from "react";
import AdminNavbar from "../components/AdminNavbar";
import SearchAutocomplete from "../components/SearchAutocomplete";
import {
  FaHotel, FaCheck, FaCheckCircle, FaSearch, FaEnvelope, FaPhone,
  FaCalendarAlt, FaUsers, FaTag, FaClock, FaPlus, FaEdit, FaTrash,
  FaEye, FaTimesCircle, FaBed, FaLayerGroup, FaSync, FaExclamationTriangle,
  FaSlidersH, FaShieldAlt, FaMapMarkerAlt, FaUpload, FaStar, FaImage,
  FaToggleOn, FaToggleOff, FaTimes, FaCamera, FaSpinner
} from "react-icons/fa";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "13px",
  color: "#0F172A",
  background: "#FFFFFF",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  color: "#475569",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

export default function AdminHotels() {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "bookings"

  // Hotels State
  const [hotelsList, setHotelsList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [hotelsError, setHotelsError] = useState(null);
  const [bookingsError, setBookingsError] = useState(null);
  const [hotelStats, setHotelStats] = useState({
    totalHotels: 0, totalRooms: 0, availableRooms: 0, bookedRooms: 0,
    occupiedRooms: 0, pendingBookings: 0, confirmedBookings: 0, totalBookings: 0
  });

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [searchBooking, setSearchBooking] = useState("");
  const [filterBookingStatus, setFilterBookingStatus] = useState("all");

  // Search & Filter Hotels
  const [searchHotel, setSearchHotel] = useState("");
  const [filterHotelStatus, setFilterHotelStatus] = useState("all");
  const [filterDestination, setFilterDestination] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [inspectHotel, setInspectHotel] = useState(null);
  const [availCheckDates, setAvailCheckDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    rooms: 1
  });
  const [availInspectionResult, setAvailInspectionResult] = useState(null);
  const [inspectingAvail, setInspectingAvail] = useState(false);

  // Actions & Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // Initial Hotel Form Structure
  const initialHotelForm = {
    name: "",
    destinationId: "",
    destinationName: "",
    location: "",
    country: "India",
    description: "",
    pricePerNight: 5000,
    rating: 4.8,
    totalRooms: 20,
    status: "Active",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    imagesStr: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    amenitiesList: ["Free High-Speed Wi-Fi", "Swimming Pool", "Air Conditioning", "Restaurant", "Valet Parking", "24/7 Front Desk"],
    newAmenity: "",
    roomTypes: [
      { id: "rt-standard", name: "Standard Deluxe Room", pricePerNight: 5000, totalRooms: 12, maxGuests: 2, amenities: "Free Wi-Fi, AC, King Bed" },
      { id: "rt-suite", name: "Executive Luxury Suite", pricePerNight: 8500, totalRooms: 8, maxGuests: 4, amenities: "Private Balcony, Bathtub, Lounge Access" }
    ]
  };

  const [hotelForm, setHotelForm] = useState(initialHotelForm);

  useEffect(() => {
    fetchHotelsAndStats();
    fetchDestinations();
    fetchHotelBookings();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/destinations?status=all`);
      if (res.data && Array.isArray(res.data)) {
        setDestinationsList(res.data);
      }
    } catch (err) {
      console.warn("Could not load dynamic destinations:", err);
    }
  };

  const fetchHotelsAndStats = async () => {
    setHotelsLoading(true);
    setHotelsError(null);
    try {
      // Primary: use stats endpoint (returns hotels + aggregated stats)
      const statsRes = await axios.get(`${API_BASE}/api/admin/hotel-stats`);
      const data = statsRes.data || {};
      if (data.overview) setHotelStats(data.overview);
      // Accept the hotels list whether status is 200 or the fallback 200
      const hotelArray = data.hotels || [];
      setHotelsList(hotelArray);

      // If stats endpoint returned empty list, try direct hotels endpoint as safety net
      if (hotelArray.length === 0) {
        try {
          const hRes = await axios.get(`${API_BASE}/api/hotels?status=all`);
          if (hRes.data && hRes.data.length > 0) setHotelsList(hRes.data);
        } catch (_) { /* ignore secondary fallback errors */ }
      }
    } catch (err) {
      console.error("Admin hotel stats fetch failed:", err.response?.status, err.message);
      // Fallback: try the plain hotels endpoint
      try {
        const hRes = await axios.get(`${API_BASE}/api/hotels?status=all`);
        const fallbackList = hRes.data || [];
        setHotelsList(fallbackList);
        if (fallbackList.length === 0) {
          setHotelsError("Unable to load hotels from server. Please check that the backend is running and retry.");
        }
      } catch (e2) {
        console.error("Hotels fallback fetch also failed:", e2.message);
        setHotelsError(
          `Unable to connect to backend (${API_BASE}). Please ensure the Flask server is running on port 5000 and retry.`
        );
      }
    } finally {
      setHotelsLoading(false);
    }
  };

  const fetchHotelBookings = async () => {
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/bookings/hotels`);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Error loading admin hotel bookings:", err.response?.status, err.message);
      setBookingsError("Unable to load reservations. Please retry.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const uploadedUrl = res.data.url;
      const currentList = hotelForm.imagesStr.split("\n").map(s => s.trim()).filter(Boolean);
      const updatedList = [uploadedUrl, ...currentList.filter(u => u !== uploadedUrl)];

      setHotelForm(prev => ({
        ...prev,
        img: uploadedUrl,
        imagesStr: updatedList.join("\n")
      }));
      showToast("success", "Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      showToast("error", "Image upload failed. Please verify file format.");
    } finally {
      setImageUploading(false);
    }
  };

  // Add Hotel Handler
  const handleCreateHotel = async (e) => {
    e.preventDefault();
    if (!hotelForm.name.trim()) {
      showToast("error", "Hotel name cannot be empty.");
      return;
    }
    if (!hotelForm.destinationId && !hotelForm.destinationName) {
      showToast("error", "Destination is required.");
      return;
    }
    if (Number(hotelForm.pricePerNight) <= 0) {
      showToast("error", "Price must be greater than 0.");
      return;
    }

    const imagesArray = hotelForm.imagesStr
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const formattedRoomTypes = (hotelForm.roomTypes || []).map((rt, idx) => ({
      id: rt.id || `rt-${idx + 1}`,
      name: rt.name,
      pricePerNight: Number(rt.pricePerNight),
      totalRooms: Number(rt.totalRooms),
      availableRooms: Number(rt.totalRooms),
      maxGuests: Number(rt.maxGuests || 2),
      amenities: typeof rt.amenities === "string" ? rt.amenities.split(",").map(s => s.trim()) : rt.amenities
    }));

    const payload = {
      name: hotelForm.name.trim(),
      destinationId: String(hotelForm.destinationId || "").trim(),
      destinationName: String(hotelForm.destinationName || "").trim(),
      location: hotelForm.location.trim() || hotelForm.destinationName,
      country: hotelForm.country.trim() || "India",
      description: hotelForm.description.trim(),
      pricePerNight: Number(hotelForm.pricePerNight),
      price: `₹${Number(hotelForm.pricePerNight).toLocaleString("en-IN")}/night`,
      rating: Number(hotelForm.rating),
      totalRooms: Number(hotelForm.totalRooms),
      status: hotelForm.status,
      checkInTime: hotelForm.checkInTime,
      checkOutTime: hotelForm.checkOutTime,
      img: hotelForm.img || imagesArray[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      images: imagesArray.length > 0 ? imagesArray : [hotelForm.img || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
      amenities: hotelForm.amenitiesList,
      roomTypes: formattedRoomTypes
    };

    setActionLoadingId("create-hotel");
    try {
      await axios.post(`${API_BASE}/api/hotels`, payload);
      showToast("success", `✓ Hotel added successfully: '${payload.name}'`);
      setShowAddModal(false);
      setHotelForm(initialHotelForm);
      fetchHotelsAndStats();
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to add hotel.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (h) => {
    setEditingHotel(h);
    const existingImages = (h.images && h.images.length > 0 ? h.images : [h.img]).filter(Boolean);

    setHotelForm({
      name: h.name || "",
      destinationId: h.destinationId || "",
      destinationName: h.destinationName || "",
      location: h.location || "",
      country: h.country || "India",
      description: h.description || "",
      pricePerNight: h.pricePerNight || 5000,
      rating: h.rating || 4.8,
      totalRooms: h.totalRooms || 20,
      status: h.status || "Active",
      checkInTime: h.checkInTime || "14:00",
      checkOutTime: h.checkOutTime || "11:00",
      img: h.img || (existingImages[0] || ""),
      imagesStr: existingImages.join("\n"),
      amenitiesList: h.amenities && h.amenities.length > 0 ? h.amenities : ["Free High-Speed Wi-Fi", "Air Conditioning", "Swimming Pool"],
      newAmenity: "",
      roomTypes: (h.roomTypes || []).map(rt => ({
        ...rt,
        amenities: Array.isArray(rt.amenities) ? rt.amenities.join(", ") : rt.amenities
      }))
    });
    setShowEditModal(true);
  };

  // Submit Edit Hotel
  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    if (!editingHotel) return;

    if (!hotelForm.name.trim()) {
      showToast("error", "Hotel name cannot be empty.");
      return;
    }
    if (!hotelForm.destinationId && !hotelForm.destinationName) {
      showToast("error", "Destination is required.");
      return;
    }
    if (Number(hotelForm.pricePerNight) <= 0) {
      showToast("error", "Price must be greater than 0.");
      return;
    }

    const imagesArray = hotelForm.imagesStr
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    const formattedRoomTypes = (hotelForm.roomTypes || []).map((rt, idx) => ({
      id: rt.id || `rt-${idx + 1}`,
      name: rt.name,
      pricePerNight: Number(rt.pricePerNight),
      totalRooms: Number(rt.totalRooms),
      availableRooms: Number(rt.totalRooms),
      maxGuests: Number(rt.maxGuests || 2),
      amenities: typeof rt.amenities === "string" ? rt.amenities.split(",").map(s => s.trim()) : rt.amenities
    }));

    const payload = {
      name: hotelForm.name.trim(),
      destinationId: String(hotelForm.destinationId || "").trim(),
      destinationName: String(hotelForm.destinationName || "").trim(),
      location: hotelForm.location.trim() || hotelForm.destinationName,
      country: hotelForm.country.trim(),
      description: hotelForm.description.trim(),
      pricePerNight: Number(hotelForm.pricePerNight),
      price: `₹${Number(hotelForm.pricePerNight).toLocaleString("en-IN")}/night`,
      rating: Number(hotelForm.rating),
      totalRooms: Number(hotelForm.totalRooms),
      status: hotelForm.status,
      checkInTime: hotelForm.checkInTime,
      checkOutTime: hotelForm.checkOutTime,
      img: hotelForm.img || imagesArray[0],
      images: imagesArray,
      amenities: hotelForm.amenitiesList,
      roomTypes: formattedRoomTypes
    };

    setActionLoadingId("update-hotel");
    try {
      const hId = editingHotel._id || editingHotel.id;
      await axios.put(`${API_BASE}/api/hotels/${hId}`, payload);
      showToast("success", `✓ Hotel updated successfully: '${payload.name}'`);
      setShowEditModal(false);
      fetchHotelsAndStats();
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Failed to update hotel.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Hotel Status
  const handleToggleHotelStatus = async (h) => {
    const hId = h._id || h.id;
    setActionLoadingId(`toggle-${hId}`);
    try {
      const res = await axios.put(`${API_BASE}/api/hotels/${hId}/toggle-status`);
      showToast("success", `✓ Hotel status updated to ${res.data.status}!`);
      fetchHotelsAndStats();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update hotel status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Safe Delete Hotel
  const handleDeleteHotel = async (h) => {
    const ok = window.confirm(
      `Are you sure you want to delete this hotel '${h.name}'?\n\nIf the hotel has existing bookings, its status will be safely set to Inactive to protect booking records.`
    );
    if (!ok) return;

    const hId = h._id || h.id;
    setActionLoadingId(`delete-${hId}`);
    try {
      const res = await axios.delete(`${API_BASE}/api/hotels/${hId}`);
      showToast("success", res.data?.message || `✓ Hotel '${h.name}' deleted successfully!`);
      fetchHotelsAndStats();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Failed to delete hotel.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Availability Inspector
  const handleInspectAvailability = async (h) => {
    setInspectHotel(h);
    setShowAvailModal(true);
    runAvailabilityInspection(h, availCheckDates.checkIn, availCheckDates.checkOut, availCheckDates.rooms);
  };

  const runAvailabilityInspection = async (h, cIn, cOut, numRooms) => {
    setInspectingAvail(true);
    setAvailInspectionResult(null);
    try {
      const hId = h._id || h.id;
      const res = await axios.get(
        `${API_BASE}/api/hotels/${hId}/availability?checkIn=${cIn}&checkOut=${cOut}&rooms=${numRooms}`
      );
      setAvailInspectionResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setInspectingAvail(false);
    }
  };

  // Filtered Hotels
  const filteredHotels = useMemo(() => {
    return hotelsList.filter(h => {
      const matchSearch =
        (h.name || "").toLowerCase().includes(searchHotel.toLowerCase()) ||
        (h.location || "").toLowerCase().includes(searchHotel.toLowerCase()) ||
        (h.destinationName || "").toLowerCase().includes(searchHotel.toLowerCase());

      const statusLower = (h.status || "Active").toLowerCase();
      let matchStatus = true;
      if (filterHotelStatus === "active") matchStatus = statusLower === "active";
      if (filterHotelStatus === "inactive") matchStatus = statusLower === "inactive" || statusLower === "deactivated";

      let matchDest = true;
      if (filterDestination !== "all") {
        matchDest =
          String(h.destinationId) === String(filterDestination) ||
          (h.destinationName || "").toLowerCase().includes(filterDestination.toLowerCase()) ||
          (h.location || "").toLowerCase().includes(filterDestination.toLowerCase());
      }

      return matchSearch && matchStatus && matchDest;
    });
  }, [hotelsList, searchHotel, filterHotelStatus, filterDestination]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch =
        (b.customerName || b.guestName || "").toLowerCase().includes(searchBooking.toLowerCase()) ||
        (b.email || "").toLowerCase().includes(searchBooking.toLowerCase()) ||
        (b.hotelName || "").toLowerCase().includes(searchBooking.toLowerCase()) ||
        (b.bookingId || b._id || "").toLowerCase().includes(searchBooking.toLowerCase());

      const status = (b.bookingStatus || b.status || "confirmed").toLowerCase();
      const matchStatus = filterBookingStatus === "all" || status === filterBookingStatus.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [bookings, searchBooking, filterBookingStatus]);

  // Booking Actions
  const handleConfirmBooking = async (b) => {
    setActionLoadingId(b._id);
    try {
      await axios.put(`${API_BASE}/api/admin/bookings/hotels/${b._id}/status`, { status: "confirmed" });
      showToast("success", `✓ Booking ${b.bookingId || b._id} marked as Confirmed!`);
      fetchHotelBookings();
      fetchHotelsAndStats();
    } catch (err) {
      showToast("error", "Failed to confirm booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdminCancelBooking = async (b) => {
    const ok = window.confirm(`Cancel reservation for ${b.customerName || b.guestName}?`);
    if (!ok) return;

    setActionLoadingId(b._id);
    try {
      await axios.put(`${API_BASE}/api/admin/bookings/hotels/${b._id}/status`, { status: "cancelled" });
      showToast("success", `✓ Booking ${b.bookingId || b._id} cancelled.`);
      fetchHotelBookings();
      fetchHotelsAndStats();
    } catch (err) {
      showToast("error", "Failed to cancel booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
      <AdminNavbar />

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed", top: 24, right: 24, zIndex: 1200,
            background: notification.type === "success" ? "#10B981" : "#EF4444",
            color: "#FFFFFF", padding: "14px 22px", borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontWeight: "600",
            fontSize: "14px", display: "flex", alignItems: "center", gap: "10px",
            animation: "fadeIn 0.3s ease"
          }}
        >
          {notification.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {notification.message}
        </div>
      )}

      {/* Main Container */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "94px 24px 30px" }}>

        {/* Header Title Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#EFF6FF", color: "#2563EB", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <FaShieldAlt /> Real-Time Database Synchronized
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
              <FaHotel color="#2563EB" /> Hotel &amp; Inventory Management
            </h1>
            <p style={{ color: "#64748B", margin: "6px 0 0", fontSize: "14px" }}>
              Full CRUD content management for hotel properties, pricing per night, room quotas, and guest reservations.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                fetchHotelsAndStats();
                fetchHotelBookings();
                showToast("success", "Refreshed hotel data from database.");
              }}
              style={{
                background: "#FFFFFF", border: "1px solid #CBD5E1", color: "#475569",
                padding: "10px 16px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8
              }}
            >
              <FaSync className={hotelsLoading ? "fa-spin" : ""} /> Refresh
            </button>

            <button
              onClick={() => {
                setHotelForm(initialHotelForm);
                setShowAddModal(true);
              }}
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                border: "none", color: "#FFFFFF", padding: "10px 20px", borderRadius: 12,
                fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}
            >
              <FaPlus /> + Add New Hotel
            </button>
          </div>
        </div>

        {/* ─── STATS OVERVIEW CARDS ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Listed Hotels", val: hotelsList.length, icon: "🏨", color: "#2563EB" },
            { label: "Active Properties", val: hotelsList.filter(h => (h.status || "Active").toLowerCase() === "active").length, icon: "✅", color: "#10B981" },
            { label: "Inactive/Disabled", val: hotelsList.filter(h => (h.status || "Active").toLowerCase() !== "active").length, icon: "⏸️", color: "#64748B" },
            { label: "Total Room Capacity", val: hotelStats.totalRooms || hotelsList.reduce((acc, h) => acc + (h.totalRooms || 20), 0), icon: "🛏️", color: "#8B5CF6" },
            { label: "Total Reservations", val: bookings.length, icon: "📋", color: "#EC4899" }
          ].map((s, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF", padding: "18px 20px", borderRadius: 16,
                border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 900, color: s.color }}>
                {s.val}
              </div>
            </div>
          ))}
        </div>

        {/* ─── TABS HEADER ─── */}
        <div style={{ display: "flex", gap: 10, borderBottom: "2px solid #E2E8F0", marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab("inventory")}
            style={{
              padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              color: activeTab === "inventory" ? "#2563EB" : "#64748B",
              borderBottom: activeTab === "inventory" ? "3px solid #2563EB" : "3px solid transparent",
              marginBottom: -2, display: "flex", alignItems: "center", gap: 8
            }}
          >
            <FaLayerGroup /> Hotels Inventory ({hotelsList.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              color: activeTab === "bookings" ? "#2563EB" : "#64748B",
              borderBottom: activeTab === "bookings" ? "3px solid #2563EB" : "3px solid transparent",
              marginBottom: -2, display: "flex", alignItems: "center", gap: 8
            }}
          >
            <FaCalendarAlt /> Reservations ({bookings.length})
          </button>
        </div>

        {/* ─────────────────── TAB 1: HOTELS INVENTORY ─────────────────── */}
        {activeTab === "inventory" && (
          <div>
            {/* Search and Filters Toolbar */}
            <div style={{
              background: "#FFFFFF", padding: "16px 20px", borderRadius: 16,
              border: "1px solid #E2E8F0", marginBottom: 20, display: "flex",
              justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280, flexWrap: "wrap" }}>
                {/* Search text */}
                <div style={{ width: "100%", maxWidth: 320 }}>
                  <SearchAutocomplete
                    value={searchHotel}
                    onChange={setSearchHotel}
                    localData={hotelsList}
                    searchFields={["name", "hotelName", "city", "location", "destinationName", "description"]}
                    placeholder="Search hotel name, location, destination..."
                    onSelect={(item, title) => {
                      setSearchHotel(title);
                    }}
                    inputStyle={{
                      padding: "9px 12px 9px 36px",
                      borderRadius: 10,
                      borderColor: "#CBD5E1",
                      fontSize: 13
                    }}
                  />
                </div>

                {/* Filter Destination */}
                <select
                  value={filterDestination}
                  onChange={e => setFilterDestination(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 10, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", fontSize: 13, color: "#0F172A", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="all">All Destinations</option>
                  {destinationsList.map(d => (
                    <option key={d._id || d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={filterHotelStatus}
                  onChange={e => setFilterHotelStatus(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 10, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", fontSize: 13, color: "#0F172A", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive / Disabled</option>
                </select>
              </div>

              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                Showing <strong>{filteredHotels.length}</strong> of {hotelsList.length} hotels
              </div>
            </div>

            {/* Hotels Table */}
            <div style={{
              background: "#FFFFFF", borderRadius: 20, overflow: "hidden",
              border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}>
              {hotelsLoading ? (
                <div style={{ padding: 60, textAlign: "center", color: "#64748B", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <FaSpinner className="fa-spin" size={32} color="#2563EB" />
                  <div style={{ fontWeight: 600 }}>Loading hotels from database...</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Connecting to {API_BASE}</div>
                </div>
              ) : hotelsError ? (
                <div style={{ padding: 60, textAlign: "center", color: "#64748B", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3 style={{ color: "#DC2626", margin: "0 0 6px", fontSize: 16 }}>Unable to Load Hotels</h3>
                  <p style={{ margin: 0, fontSize: 13, maxWidth: 460, lineHeight: 1.6 }}>{hotelsError}</p>
                  <button
                    onClick={() => { fetchHotelsAndStats(); fetchHotelBookings(); }}
                    style={{
                      marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFF",
                      fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 8
                    }}
                  >
                    <FaSync /> Retry
                  </button>
                </div>
              ) : filteredHotels.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🏨</div>
                  {hotelsList.length === 0 ? (
                    <>
                      <h3 style={{ color: "#0F172A", margin: "0 0 6px" }}>No hotels in database yet</h3>
                      <p style={{ margin: "0 0 16px", fontSize: 13 }}>Click '+ Add New Hotel' to create your first hotel property.</p>
                      <button
                        onClick={() => { setHotelForm(initialHotelForm); setShowAddModal(true); }}
                        style={{
                          padding: "10px 24px", borderRadius: 10, border: "none",
                          background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFF",
                          fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex",
                          alignItems: "center", gap: 8
                        }}
                      >
                        <FaPlus /> Add New Hotel
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 style={{ color: "#0F172A", margin: "0 0 6px" }}>No hotels match your filters</h3>
                      <p style={{ margin: 0, fontSize: 13 }}>Try modifying your search or filter criteria.</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Image</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Hotel Property</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Destination / Location</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Price / Night</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Rating</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Amenities</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Status</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800, textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHotels.map((h) => {
                        const total = h.totalRooms || 20;
                        const available = h.availableRooms !== undefined ? h.availableRooms : (h.stats?.availableRooms || total);
                        const isActive = (h.status || "Active").toLowerCase() === "active";
                        const priceDisplay = h.price || `₹${Number(h.pricePerNight || 5000).toLocaleString("en-IN")}/night`;
                        const amenitiesCount = (h.amenities || []).length;
                        const hId = h._id || h.id;

                        return (
                          <tr
                            key={hId}
                            style={{
                              borderBottom: "1px solid #F1F5F9",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                            onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                          >
                            {/* Image Thumbnail */}
                            <td style={{ padding: "14px 18px", width: 60 }}>
                              <img
                                src={h.img || (h.images && h.images[0]) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80"}
                                alt={h.name}
                                style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", border: "1px solid #E2E8F0" }}
                                onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80"; }}
                              />
                            </td>

                            {/* Hotel Name */}
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14 }}>{h.name}</div>
                              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                                {total} Total Rooms · {available} Available
                              </div>
                            </td>

                            {/* Destination / Location */}
                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                {h.destinationName && (
                                  <span style={{ fontSize: 11, background: "#EFF6FF", color: "#2563EB", fontWeight: 700, padding: "2px 8px", borderRadius: 6, border: "1px solid #BFDBFE" }}>
                                    📍 {h.destinationName}
                                  </span>
                                )}
                                <span style={{ color: "#475569", fontSize: 12 }}>
                                  {h.location || h.city || "Area not specified"}
                                </span>
                              </div>
                            </td>

                            {/* Price / Night */}
                            <td style={{ padding: "14px 18px", fontWeight: 800, color: "#2563EB", fontSize: 14 }}>
                              {priceDisplay}
                            </td>

                            {/* Rating */}
                            <td style={{ padding: "14px 18px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "3px 8px", borderRadius: 8, fontSize: 12 }}>
                                <FaStar size={11} color="#F59E0B" /> {h.rating || 4.8}
                              </span>
                            </td>

                            {/* Amenities count */}
                            <td style={{ padding: "14px 18px" }}>
                              <span style={{ fontSize: 11, color: "#64748B", background: "#F1F5F9", padding: "3px 8px", borderRadius: 8, fontWeight: 600 }}>
                                {amenitiesCount} Amenities
                              </span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: "14px 18px" }}>
                              <span style={{
                                background: isActive ? "#DCFCE7" : "#F1F5F9",
                                color: isActive ? "#15803D" : "#64748B",
                                padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800,
                                border: isActive ? "1px solid #86EFAC" : "1px solid #E2E8F0"
                              }}>
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            {/* Actions: Edit, Delete, Enable/Disable, Dates */}
                            <td style={{ padding: "14px 18px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                {/* Dates / Availability */}
                                <button
                                  title="Check Date Availability"
                                  onClick={() => handleInspectAvailability(h)}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8, border: "1px solid #CBD5E1",
                                    background: "#FFFFFF", color: "#2563EB", cursor: "pointer", fontSize: 12, fontWeight: 700
                                  }}
                                >
                                  <FaCalendarAlt /> Dates
                                </button>

                                {/* Edit Button */}
                                <button
                                  title="Edit Hotel"
                                  onClick={() => handleOpenEdit(h)}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8, border: "1px solid #CBD5E1",
                                    background: "#FFFFFF", color: "#475569", cursor: "pointer", fontSize: 12
                                  }}
                                >
                                  <FaEdit />
                                </button>

                                {/* Enable / Disable Toggle */}
                                <button
                                  title={isActive ? "Disable Hotel" : "Enable Hotel"}
                                  disabled={actionLoadingId === `toggle-${hId}`}
                                  onClick={() => handleToggleHotelStatus(h)}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8,
                                    border: isActive ? "1px solid #FCA5A5" : "1px solid #86EFAC",
                                    background: isActive ? "#FEF2F2" : "#DCFCE7",
                                    color: isActive ? "#DC2626" : "#15803D",
                                    cursor: "pointer", fontSize: 12, fontWeight: 700
                                  }}
                                >
                                  {actionLoadingId === `toggle-${hId}` ? <FaSpinner className="fa-spin" /> : (isActive ? "Disable" : "Enable")}
                                </button>

                                {/* Delete Button */}
                                <button
                                  title="Delete Hotel"
                                  disabled={actionLoadingId === `delete-${hId}`}
                                  onClick={() => handleDeleteHotel(h)}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8, border: "1px solid #FCA5A5",
                                    background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 12
                                  }}
                                >
                                  {actionLoadingId === `delete-${hId}` ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────── TAB 2: HOTEL BOOKINGS MANAGEMENT ─────────────────── */}
        {activeTab === "bookings" && (
          <div>
            {/* Search and Filters */}
            <div style={{
              background: "#FFFFFF", padding: "16px 20px", borderRadius: 16,
              border: "1px solid #E2E8F0", marginBottom: 20, display: "flex",
              justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 280 }}>
                <div style={{ width: "100%", maxWidth: 360 }}>
                  <SearchAutocomplete
                    value={searchBooking}
                    onChange={setSearchBooking}
                    localData={bookings}
                    searchFields={["customerName", "guestName", "email", "hotelName", "bookingId", "_id"]}
                    placeholder="Search customer name, email, hotel, ID..."
                    onSelect={(item, title) => {
                      setSearchBooking(title);
                    }}
                    inputStyle={{
                      padding: "9px 12px 9px 36px",
                      borderRadius: 10,
                      borderColor: "#CBD5E1",
                      fontSize: 13
                    }}
                  />
                </div>

                <select
                  value={filterBookingStatus}
                  onChange={e => setFilterBookingStatus(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 10, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", fontSize: 13, color: "#0F172A", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>
                Showing <strong>{filteredBookings.length}</strong> of {bookings.length} reservations
              </div>
            </div>

            {/* Bookings Table */}
            <div style={{
              background: "#FFFFFF", borderRadius: 20, overflow: "hidden",
              border: "1px solid #E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
            }}>
              {bookingsLoading ? (
                <div style={{ padding: 60, textAlign: "center", color: "#64748B", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <FaSpinner className="fa-spin" size={32} color="#2563EB" />
                  <div style={{ fontWeight: 600 }}>Loading hotel reservations...</div>
                </div>
              ) : bookingsError ? (
                <div style={{ padding: 60, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 40 }}>⚠️</div>
                  <h3 style={{ color: "#DC2626", margin: "0 0 6px", fontSize: 16 }}>Unable to Load Reservations</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>{bookingsError}</p>
                  <button
                    onClick={fetchHotelBookings}
                    style={{
                      marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFF",
                      fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 8
                    }}
                  >
                    <FaSync /> Retry
                  </button>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "#64748B" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <h3 style={{ color: "#0F172A", margin: "0 0 6px" }}>No reservations found</h3>
                  <p style={{ margin: 0, fontSize: 13 }}>New guest bookings from the user portal will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Booking ID</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Customer Details</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Hotel Property</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Stay Dates</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Rooms / Guests</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Total Amount</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800 }}>Status</th>
                        <th style={{ padding: "14px 18px", fontWeight: 800, textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => {
                        const status = (b.bookingStatus || b.status || "confirmed").toLowerCase();
                        const isPending = status === "pending";
                        const isCancelled = status === "cancelled";

                        return (
                          <tr
                            key={b._id}
                            style={{
                              borderBottom: "1px solid #F1F5F9",
                              transition: "background 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                            onMouseLeave={e => e.currentTarget.style.background = "#FFFFFF"}
                          >
                            <td style={{ padding: "14px 18px", fontWeight: 700, color: "#2563EB" }}>
                              {b.bookingId || b._id?.slice(-8)}
                            </td>

                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: 800, color: "#0F172A" }}>{b.customerName || b.guestName || "Guest"}</div>
                              <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <FaEnvelope size={10} /> {b.email || b.guestEmail || "No email"}
                              </div>
                            </td>

                            <td style={{ padding: "14px 18px" }}>
                              <div style={{ fontWeight: 700, color: "#0F172A" }}>{b.hotelName}</div>
                              <div style={{ fontSize: 11, color: "#64748B" }}>{b.roomTypeName || "Standard Deluxe Room"}</div>
                            </td>

                            <td style={{ padding: "14px 18px", color: "#475569" }}>
                              <div><strong>In:</strong> {b.checkIn}</div>
                              <div><strong>Out:</strong> {b.checkOut}</div>
                              <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>({b.nights || 1} Nights)</div>
                            </td>

                            <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0F172A" }}>
                              {b.roomsCount || b.rooms || 1} Room(s) · {b.guestsCount || b.guests || 2} Guest(s)
                            </td>

                            <td style={{ padding: "14px 18px", fontWeight: 800, color: "#15803D", fontSize: 14 }}>
                              ₹{Number(b.totalAmount || b.pricing?.grandTotal || 0).toLocaleString("en-IN")}
                            </td>

                            <td style={{ padding: "14px 18px" }}>
                              <span style={{
                                background: isCancelled ? "#FEE2E2" : (isPending ? "#FEF3C7" : "#DCFCE7"),
                                color: isCancelled ? "#DC2626" : (isPending ? "#D97706" : "#15803D"),
                                padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 800
                              }}>
                                {b.bookingStatus || b.status || "Confirmed"}
                              </span>
                            </td>

                            <td style={{ padding: "14px 18px", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                <button
                                  title="View Booking Details"
                                  onClick={() => setSelectedBookingDetail(b)}
                                  style={{
                                    padding: "6px 10px", borderRadius: 8, border: "1px solid #CBD5E1",
                                    background: "#FFFFFF", color: "#475569", cursor: "pointer", fontSize: 12
                                  }}
                                >
                                  <FaEye />
                                </button>

                                {isPending && (
                                  <button
                                    disabled={actionLoadingId === b._id}
                                    onClick={() => handleConfirmBooking(b)}
                                    style={{
                                      padding: "6px 12px", borderRadius: 8, border: "none",
                                      background: "linear-gradient(135deg, #10B981, #059669)",
                                      color: "#FFFFFF", cursor: "pointer", fontSize: 12, fontWeight: 700
                                    }}
                                  >
                                    ✓ Confirm
                                  </button>
                                )}

                                {!isCancelled && (
                                  <button
                                    disabled={actionLoadingId === b._id}
                                    onClick={() => handleAdminCancelBooking(b)}
                                    style={{
                                      padding: "6px 10px", borderRadius: 8, border: "1px solid #FCA5A5",
                                      background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontSize: 12, fontWeight: 700
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────── ADD / EDIT HOTEL MODAL ─────────────────── */}
      {(showAddModal || showEditModal) && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
        >
          <div
            style={{
              background: "#FFFFFF", borderRadius: 24, maxWidth: 720, width: "100%",
              maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #2563EB, #3B82F6)",
              color: "#FFFFFF", padding: "22px 28px", position: "relative"
            }}>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                style={{
                  position: "absolute", top: 18, right: 18,
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF",
                  width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                }}
              >
                ✕
              </button>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 900, margin: 0 }}>
                {showAddModal ? "Add New Hotel Property" : `Edit Hotel: ${editingHotel?.name}`}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9 }}>
                Configure hotel information, total room quota, pricing per night, and room categories.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={showAddModal ? handleCreateHotel : handleUpdateHotel} style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Target Destination & Hotel Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Target Destination *</label>
                    <select
                      required
                      value={hotelForm.destinationId}
                      onChange={e => {
                        const selDest = destinationsList.find(p => String(p._id || p.id) === String(e.target.value));
                        setHotelForm({
                          ...hotelForm,
                          destinationId: e.target.value,
                          destinationName: selDest ? selDest.name : "",
                          location: hotelForm.location || (selDest ? selDest.location || selDest.name : ""),
                          country: selDest && selDest.country ? selDest.country : hotelForm.country
                        });
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Select Destination * --</option>
                      {destinationsList.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} ({p.country || "General"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Hotel Name *</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.name}
                      onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })}
                      placeholder="e.g. Victoria Jungfrau Grand Hotel"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Location / Full Address & Country */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Location / Area Address *</label>
                    <input
                      type="text"
                      required
                      value={hotelForm.location}
                      onChange={e => setHotelForm({ ...hotelForm, location: e.target.value })}
                      placeholder="e.g. Interlaken, Bernese Oberland"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Country</label>
                    <input
                      type="text"
                      value={hotelForm.country}
                      onChange={e => setHotelForm({ ...hotelForm, country: e.target.value })}
                      placeholder="e.g. Switzerland"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Price, Total Rooms, Rating, Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Price / Night (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={hotelForm.pricePerNight}
                      onChange={e => setHotelForm({ ...hotelForm, pricePerNight: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Total Rooms</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={hotelForm.totalRooms}
                      onChange={e => setHotelForm({ ...hotelForm, totalRooms: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Rating (1-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      max={5}
                      value={hotelForm.rating}
                      onChange={e => setHotelForm({ ...hotelForm, rating: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      value={hotelForm.status}
                      onChange={e => setHotelForm({ ...hotelForm, status: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Timings */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Check-in Time</label>
                    <input
                      type="text"
                      value={hotelForm.checkInTime}
                      onChange={e => setHotelForm({ ...hotelForm, checkInTime: e.target.value })}
                      placeholder="14:00"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Check-out Time</label>
                    <input
                      type="text"
                      value={hotelForm.checkOutTime}
                      onChange={e => setHotelForm({ ...hotelForm, checkOutTime: e.target.value })}
                      placeholder="11:00"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    rows={3}
                    value={hotelForm.description}
                    onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })}
                    placeholder="Enter detailed description of amenities, location, and guest experience..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Hotel Images with File Upload & Live Preview */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Hotel Images</label>
                    <label
                      style={{
                        background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB",
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6
                      }}
                    >
                      <FaUpload /> {imageUploading ? "Uploading..." : "Upload Image File"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    value={hotelForm.imagesStr}
                    onChange={e => {
                      const str = e.target.value;
                      const firstUrl = str.split("\n")[0]?.trim();
                      setHotelForm({
                        ...hotelForm,
                        imagesStr: str,
                        img: firstUrl || hotelForm.img
                      });
                    }}
                    placeholder="https://images.unsplash.com/... (one image URL per line)"
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                  />

                  {/* Image Previews */}
                  {hotelForm.imagesStr && (
                    <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                      {hotelForm.imagesStr.split("\n").map(s => s.trim()).filter(Boolean).map((imgUrl, idx) => (
                        <div key={idx} style={{ position: "relative", width: 70, height: 50, borderRadius: 8, overflow: "hidden", border: "1px solid #CBD5E1" }}>
                          <img src={imgUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                          <button
                            type="button"
                            title="Remove image"
                            onClick={() => {
                              const remaining = hotelForm.imagesStr.split("\n").map(s => s.trim()).filter(u => u && u !== imgUrl);
                              setHotelForm({
                                ...hotelForm,
                                imagesStr: remaining.join("\n"),
                                img: remaining[0] || ""
                              });
                            }}
                            style={{
                              position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)",
                              color: "#FFFFFF", border: "none", borderRadius: "50%", width: 18, height: 18,
                              cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities Manager */}
                <div>
                  <label style={labelStyle}>Amenities</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    {(hotelForm.amenitiesList || []).map((am, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#334155",
                          padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600,
                          display: "inline-flex", alignItems: "center", gap: 6
                        }}
                      >
                        {am}
                        <button
                          type="button"
                          onClick={() => {
                            setHotelForm({
                              ...hotelForm,
                              amenitiesList: hotelForm.amenitiesList.filter((_, i) => i !== idx)
                            });
                          }}
                          style={{ border: "none", background: "none", color: "#94A3B8", cursor: "pointer", fontSize: 11 }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Add custom amenity (e.g. Infinity Pool, Spa, Airport Shuttle)..."
                      value={hotelForm.newAmenity}
                      onChange={e => setHotelForm({ ...hotelForm, newAmenity: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (hotelForm.newAmenity.trim()) {
                            setHotelForm({
                              ...hotelForm,
                              amenitiesList: [...(hotelForm.amenitiesList || []), hotelForm.newAmenity.trim()],
                              newAmenity: ""
                            });
                          }
                        }
                      }}
                      style={{ ...inputStyle, padding: "8px 12px" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (hotelForm.newAmenity.trim()) {
                          setHotelForm({
                            ...hotelForm,
                            amenitiesList: [...(hotelForm.amenitiesList || []), hotelForm.newAmenity.trim()],
                            newAmenity: ""
                          });
                        }
                      }}
                      style={{
                        background: "#F1F5F9", border: "1px solid #CBD5E1", color: "#334155",
                        padding: "8px 14px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer"
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Room Types Builder */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Room Categories &amp; Pricing</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newTypes = [...(hotelForm.roomTypes || []), {
                          id: `rt-${Date.now()}`,
                          name: "Deluxe Ocean View Room",
                          pricePerNight: Number(hotelForm.pricePerNight),
                          totalRooms: 5,
                          maxGuests: 2,
                          amenities: "King Bed, City View, Wi-Fi"
                        }];
                        setHotelForm({ ...hotelForm, roomTypes: newTypes });
                      }}
                      style={{
                        background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB",
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      + Add Room Type
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(hotelForm.roomTypes || []).map((rt, idx) => (
                      <div key={idx} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 28px", gap: 8, alignItems: "center" }}>
                        <input
                          type="text"
                          placeholder="Room Name"
                          value={rt.name}
                          onChange={e => {
                            const updated = [...hotelForm.roomTypes];
                            updated[idx].name = e.target.value;
                            setHotelForm({ ...hotelForm, roomTypes: updated });
                          }}
                          style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}
                        />
                        <input
                          type="number"
                          placeholder="Price (₹)"
                          value={rt.pricePerNight}
                          onChange={e => {
                            const updated = [...hotelForm.roomTypes];
                            updated[idx].pricePerNight = e.target.value;
                            setHotelForm({ ...hotelForm, roomTypes: updated });
                          }}
                          style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}
                        />
                        <input
                          type="number"
                          placeholder="Rooms"
                          value={rt.totalRooms}
                          onChange={e => {
                            const updated = [...hotelForm.roomTypes];
                            updated[idx].totalRooms = e.target.value;
                            setHotelForm({ ...hotelForm, roomTypes: updated });
                          }}
                          style={{ ...inputStyle, padding: "6px 8px", fontSize: 12 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setHotelForm({
                              ...hotelForm,
                              roomTypes: hotelForm.roomTypes.filter((_, i) => i !== idx)
                            });
                          }}
                          style={{ border: "none", background: "none", color: "#EF4444", cursor: "pointer", fontSize: 14 }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  style={{
                    padding: "10px 18px", borderRadius: 12, border: "1px solid #CBD5E1",
                    background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoadingId === "create-hotel" || actionLoadingId === "update-hotel" || imageUploading}
                  style={{
                    padding: "10px 24px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                    color: "#FFFFFF", fontWeight: 800, fontSize: 13, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  {(actionLoadingId === "create-hotel" || actionLoadingId === "update-hotel") && <FaSpinner className="fa-spin" />}
                  {showAddModal ? "Save Hotel Property" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── AVAILABILITY INSPECTION MODAL ─────────────────── */}
      {showAvailModal && inspectHotel && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={() => setShowAvailModal(false)}
        >
          <div
            style={{
              background: "#FFFFFF", borderRadius: 24, maxWidth: 580, width: "100%",
              maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
              border: "1px solid #E2E8F0"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: "linear-gradient(135deg, #1E293B, #0F172A)", color: "#FFFFFF", padding: "20px 24px", position: "relative" }}>
              <button
                onClick={() => setShowAvailModal(false)}
                style={{
                  position: "absolute", top: 18, right: 18,
                  background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF",
                  width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                ✕
              </button>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
                📅 Date Range Availability Inspector
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
                Inspect live reservations for {inspectHotel.name}
              </p>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Check-In</label>
                  <input
                    type="date"
                    value={availCheckDates.checkIn}
                    onChange={e => setAvailCheckDates({ ...availCheckDates, checkIn: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Check-Out</label>
                  <input
                    type="date"
                    value={availCheckDates.checkOut}
                    onChange={e => setAvailCheckDates({ ...availCheckDates, checkOut: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={availCheckDates.rooms}
                    onChange={e => setAvailCheckDates({ ...availCheckDates, rooms: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={() => runAvailabilityInspection(inspectHotel, availCheckDates.checkIn, availCheckDates.checkOut, availCheckDates.rooms)}
                disabled={inspectingAvail}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: "none",
                  background: "#2563EB", color: "#FFFFFF", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8
                }}
              >
                {inspectingAvail && <FaSpinner className="fa-spin" />} Check Live Availability
              </button>

              {availInspectionResult && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontWeight: 800, color: "#0F172A" }}>Overall Availability</span>
                    <span style={{
                      fontWeight: 800, padding: "3px 10px", borderRadius: 10, fontSize: 12,
                      background: availInspectionResult.available ? "#DCFCE7" : "#FEE2E2",
                      color: availInspectionResult.available ? "#15803D" : "#DC2626"
                    }}>
                      {availInspectionResult.available ? "AVAILABLE" : "SOLD OUT / LIMITED"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "center" }}>
                    <div style={{ background: "#FFFFFF", padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Total Capacity</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>{availInspectionResult.totalRooms}</div>
                    </div>
                    <div style={{ background: "#FFFFFF", padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Booked / Occupied</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#EF4444" }}>{availInspectionResult.bookedRooms}</div>
                    </div>
                    <div style={{ background: "#FFFFFF", padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Available Left</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#10B981" }}>{availInspectionResult.availableRooms}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────── BOOKING DETAILS MODAL ─────────────────── */}
      {selectedBookingDetail && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20
          }}
          onClick={() => setSelectedBookingDetail(null)}
        >
          <div
            style={{
              background: "#FFFFFF", borderRadius: 24, maxWidth: 500, width: "100%",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)", border: "1px solid #E2E8F0", padding: 24
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>
                Reservation Details
              </h3>
              <button
                onClick={() => setSelectedBookingDetail(null)}
                style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#64748B" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div><strong>Booking ID:</strong> {selectedBookingDetail.bookingId || selectedBookingDetail._id}</div>
              <div><strong>Customer:</strong> {selectedBookingDetail.customerName || selectedBookingDetail.guestName}</div>
              <div><strong>Email:</strong> {selectedBookingDetail.email || selectedBookingDetail.guestEmail}</div>
              <div><strong>Phone:</strong> {selectedBookingDetail.phone || "Not provided"}</div>
              <div><strong>Hotel:</strong> {selectedBookingDetail.hotelName}</div>
              <div><strong>Dates:</strong> {selectedBookingDetail.checkIn} to {selectedBookingDetail.checkOut} ({selectedBookingDetail.nights || 1} nights)</div>
              <div><strong>Rooms / Guests:</strong> {selectedBookingDetail.roomsCount || 1} Room(s) / {selectedBookingDetail.guestsCount || 2} Guest(s)</div>
              <div><strong>Total Paid/Due:</strong> ₹{Number(selectedBookingDetail.totalAmount || 0).toLocaleString("en-IN")}</div>
              <div><strong>Status:</strong> {selectedBookingDetail.bookingStatus || selectedBookingDetail.status}</div>
              {selectedBookingDetail.specialRequests && (
                <div><strong>Special Requests:</strong> {selectedBookingDetail.specialRequests}</div>
              )}
            </div>

            <button
              onClick={() => setSelectedBookingDetail(null)}
              style={{
                width: "100%", marginTop: 20, padding: "10px", borderRadius: 10, border: "none",
                background: "#2563EB", color: "#FFFFFF", fontWeight: 700, cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
