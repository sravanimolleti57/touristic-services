import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft, FaArrowRight, FaCheckCircle, FaStar,
  FaMapMarkerAlt, FaSpinner, FaExclamationTriangle, FaTicketAlt,
  FaCalendarAlt, FaUsers, FaHotel, FaPlane, FaSuitcaseRolling,
  FaPrint, FaHome
} from "react-icons/fa";
import { getPlaceById } from "../data/destinations";
import { HOTELS_LIST, getHotelsByDestinationId, getHotelsByDestination } from "../data/hotels";
import SharedNavbar from "../components/SharedNavbar";
import HotelSentimentDonut from "../components/HotelSentimentDonut";
import FeedbackAnalysisModal from "../components/FeedbackAnalysisModal";
import SearchAutocomplete from "../components/SearchAutocomplete";

const API = "http://127.0.0.1:5000";
const ACTIVITY_PRICE = 1200;

/* ── helpers ────────────────────────────────────────────── */
function parsePrice(str) {
  if (!str) return 0;
  const n = String(str).replace(/[^0-9.]/g, "");
  return parseFloat(n) || 0;
}

function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b) - new Date(a)) / 86400000);
  return diff > 0 ? diff : 0;
}

function fmt(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

/* ── shared styles ──────────────────────────────────────── */
const CARD = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const SEL = {
  ...CARD,
  border: "2px solid #2563EB",
  boxShadow: "0 4px 16px rgba(37,99,235,0.15)",
};

const BLUE = {
  padding: "12px 26px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#2563EB,#3B82F6)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
  fontFamily: "inherit",
  transition: "all .2s",
};

const GHOST = {
  padding: "12px 26px",
  borderRadius: 12,
  border: "1px solid #D1D5DB",
  background: "#fff",
  color: "#374151",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "inherit",
  transition: "all .2s",
};

/* ── step bar ───────────────────────────────────────────── */
const STEPS = [
  { label: "Dates & Party", icon: "📅" },
  { label: "Hotel", icon: "🏨" },
  { label: "Travel", icon: "🚆" },
  { label: "Activities", icon: "🎯" },
  { label: "Summary", icon: "📋" },
  { label: "Payment", icon: "🔒" },
];

function StepBar({ cur }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: i < cur ? "#22c55e" : i === cur ? "#2563EB" : "#E5E7EB",
              color: i <= cur ? "#fff" : "#9CA3AF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: i < cur ? 16 : 14,
              boxShadow: i === cur ? "0 0 0 4px rgba(37,99,235,0.18)" : "none",
              transition: "all .2s",
            }}>
              {i < cur ? "✓" : s.icon}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: i === cur ? "#2563EB" : i < cur ? "#22c55e" : "#9CA3AF",
              whiteSpace: "nowrap",
            }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 40, height: 2, margin: "0 6px", marginBottom: 20,
              background: i < cur ? "#22c55e" : "#E5E7EB",
              transition: "background .2s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Step 1: Dates & Travelers ──────────────────────────── */
function StepDates({ form, set, err }) {
  const today = new Date().toISOString().split("T")[0];
  const inp = (extra) => ({
    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
    border: "1px solid #D1D5DB", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", background: "#FFFFFF", ...extra,
  });

  const counter = (label, val, dec, inc, minVal = 0) => (
    <div style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: 12, padding: "16px 18px" }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={dec}
          disabled={val <= minVal}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "1px solid #D1D5DB", background: val <= minVal ? "#E5E7EB" : "#FFFFFF",
            fontSize: 20, cursor: val <= minVal ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
            color: val <= minVal ? "#9CA3AF" : "#111827",
          }}
        >
          −
        </button>
        <span style={{ fontSize: 24, fontWeight: 900, color: "#111827", minWidth: 36, textAlign: "center" }}>{val}</span>
        <button
          type="button"
          onClick={inc}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            border: "1px solid #2563EB", background: "#EFF6FF", color: "#2563EB",
            fontSize: 20, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", fontWeight: 700,
          }}
        >
          +
        </button>
      </div>
    </div>
  );

  const nights = nightsBetween(form.checkIn, form.checkOut);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>📅 Select Travel Dates &amp; Party</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 20px" }}>Choose your departure window and traveler count</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
            Check-in / Departure Date *
          </label>
          <input
            type="date"
            min={today}
            value={form.checkIn}
            onChange={e => set(f => ({ ...f, checkIn: e.target.value }))}
            style={{ ...inp(err.checkIn ? { border: "2px solid #ef4444" } : {}) }}
          />
          {err.checkIn && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 600 }}>⚠️ {err.checkIn}</div>}
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
            Check-out / Return Date *
          </label>
          <input
            type="date"
            min={form.checkIn || today}
            value={form.checkOut}
            onChange={e => set(f => ({ ...f, checkOut: e.target.value }))}
            style={{ ...inp(err.checkOut ? { border: "2px solid #ef4444" } : {}) }}
          />
          {err.checkOut && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontWeight: 600 }}>⚠️ {err.checkOut}</div>}
        </div>
      </div>

      {nights > 0 && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#1D4ED8", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          🌙 {nights} night{nights > 1 ? "s" : ""} selected for this journey
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {counter("Adults (18+ years) *", form.adults,
          () => set(f => ({ ...f, adults: Math.max(1, f.adults - 1) })),
          () => set(f => ({ ...f, adults: Math.min(10, f.adults + 1) })),
          1
        )}
        {counter("Children (0–17 years)", form.children,
          () => set(f => ({ ...f, children: Math.max(0, f.children - 1) })),
          () => set(f => ({ ...f, children: Math.min(8, f.children + 1) })),
          0
        )}
      </div>
      {err.adults && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8, fontWeight: 600 }}>⚠️ {err.adults}</div>}
    </div>
  );
}

/* ── Step 2: Hotel ──────────────────────────────────────── */
function StepHotel({ form, set, place, liveHotels = [], onOpenAnalysis }) {
  const [q, setQ] = useState("");

  const destinationHotels = useMemo(() => {
    if (liveHotels && liveHotels.length > 0) {
      return liveHotels;
    }
    const byId = getHotelsByDestinationId(place?.id);
    if (byId.length > 0) return byId;
    return getHotelsByDestination(place?.name);
  }, [place, liveHotels]);

  const list = q
    ? destinationHotels.filter(h => h.name.toLowerCase().includes(q.toLowerCase()) || h.location.toLowerCase().includes(q.toLowerCase()))
    : destinationHotels;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>🏨 Select Hotel Accommodation</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 16px" }}>Choose your stay in {place?.name?.split(",")[0]} or use existing accommodation</p>
      
      <div style={{ marginBottom: 14 }}>
        <SearchAutocomplete
          value={q}
          onChange={setQ}
          localData={destinationHotels}
          searchFields={["name", "location", "city", "description"]}
          placeholder="Search available hotels by name or area..."
          onSelect={(item, title) => {
            setQ(title);
          }}
          inputStyle={{
            padding: "11px 16px 11px 40px",
            borderRadius: 10,
            borderColor: "#D1D5DB",
            fontSize: 14
          }}
        />
      </div>

      {/* Skip option */}
      <div
        onClick={() => set(f => ({ ...f, selectedHotel: null }))}
        style={{
          ...(form.selectedHotel === null ? SEL : CARD),
          marginBottom: 14, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 14, padding: "14px 18px",
          background: form.selectedHotel === null ? "#EFF6FF" : "#FFFFFF"
        }}
      >
        <span style={{ fontSize: 26 }}>🏡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>No Hotel — Self-Arranged Accommodation</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Skip hotel booking and proceed with flights &amp; activities only</div>
        </div>
        {form.selectedHotel === null && <FaCheckCircle color="#2563EB" size={18} />}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 20px", background: "#F9FAFB", borderRadius: 12, border: "1px dashed #D1D5DB" }}>
          <p style={{ color: "#6B7280", margin: 0, fontSize: 14 }}>No hotels available for these dates.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12, maxHeight: 440, overflowY: "auto", paddingRight: 4 }}>
          {list.map(h => {
            const sel = form.selectedHotel?.id === h.id;
            return (
              <div
                key={h.id}
                onClick={() => set(f => ({ ...f, selectedHotel: h }))}
                style={{
                  ...(sel ? SEL : CARD),
                  cursor: "pointer", transition: "all .2s", padding: 14
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.boxShadow = CARD.boxShadow; }}
              >
                <img
                  src={h.img}
                  alt={h.name}
                  style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, marginBottom: 10 }}
                  onError={e => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80"; }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <FaMapMarkerAlt size={10} color="#ef4444" /> {h.location}
                    </div>
                  </div>
                  {sel && <FaCheckCircle color="#2563EB" size={18} style={{ flexShrink: 0, marginLeft: 6 }} />}
                </div>

                {/* AI Sentiment Analysis Visualization (Replaces standard star rating) */}
                <HotelSentimentDonut
                  hotel={h}
                  onOpenAnalysis={onOpenAnalysis}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 4, borderTop: "1px solid #F1F5F9" }}>
                  <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>Standard Rate</span>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>{h.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Travel ─────────────────────────────────────── */
function StepTravel({ form, set, place }) {
  const handleOpenExternal = (url, mode) => {
    set(f => ({ ...f, travelMode: mode, selectedFlight: null }));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const travelModes = [
    {
      id: "train",
      title: "Train",
      icon: "🚆",
      service: "IRCTC Official",
      desc: "Book train tickets through IRCTC",
      btnText: "Book Train",
      url: "https://www.irctc.co.in/nget/train-search",
      badgeBg: "#EFF6FF",
      badgeColor: "#1D4ED8"
    },
    {
      id: "flight",
      title: "Flight",
      icon: "✈️",
      service: "Flight Booking",
      desc: "Search and book flights",
      btnText: "Book Flight",
      url: "https://www.makemytrip.com/flights/",
      badgeBg: "#F0FDF4",
      badgeColor: "#15803D"
    },
    {
      id: "bus",
      title: "Bus",
      icon: "🚌",
      service: "RedBus Official",
      desc: "Book bus tickets through RedBus",
      btnText: "Book Bus",
      url: "https://www.redbus.in/",
      badgeBg: "#FFFBEB",
      badgeColor: "#B45309"
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
          🚆 Travel
        </h2>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
          Choose how you want to travel
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        {travelModes.map((t) => {
          const isSelected = form.travelMode === t.id;
          return (
            <div
              key={t.id}
              onClick={() => set(f => ({ ...f, travelMode: t.id }))}
              style={{
                background: isSelected ? "#F0F7FF" : "#FFFFFF",
                border: isSelected ? "2px solid #2563EB" : "1px solid #E5E7EB",
                borderRadius: 16,
                padding: "20px 18px",
                boxShadow: isSelected ? "0 4px 16px rgba(37,99,235,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{t.icon}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: t.badgeBg, color: t.badgeColor,
                    padding: "3px 8px", borderRadius: 8
                  }}>
                    {t.service}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
                  {t.title}
                </h3>
                <p style={{ color: "#6B7280", fontSize: 12, margin: "0 0 16px", lineHeight: 1.5 }}>
                  {t.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenExternal(t.url, t.id);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #2563EB",
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                  transition: "all 0.2s",
                  fontFamily: "inherit"
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.92"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {t.btnText} <span style={{ fontSize: 11 }}>↗</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Info notice */}
      <div style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌐</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
              Independent Official Travel Booking
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              External ticket bookings open in a new tab. Click <strong>Next →</strong> to continue with your activities and trip summary.
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, color: "#2563EB",
          background: "#EFF6FF", padding: "4px 10px", borderRadius: 8
        }}>
          Mode: {form.travelMode ? form.travelMode.toUpperCase() : "SELF-ARRANGED"}
        </span>
      </div>
    </div>
  );
}

/* ── Step 4: Activities ─────────────────────────────────── */
function StepActivities({ form, set, place, liveActivities = [] }) {
  const spots = liveActivities.length > 0 ? liveActivities : (place?.visits || []);
  
  const toggle = (spot) => set(f => {
    const exists = f.activities.some(a => a.name === spot.name);
    const itemPrice = typeof spot.price === "number" ? spot.price : (parsePrice(spot.price) || ACTIVITY_PRICE);
    return {
      ...f,
      activities: exists
        ? f.activities.filter(a => a.name !== spot.name)
        : [...f.activities, { name: spot.name, price: itemPrice, time: spot.time || "Half Day" }]
    };
  });

  const totalActivitiesCost = form.activities.reduce((acc, act) => {
    const actPrice = typeof act.price === "number" ? act.price : (parsePrice(act.price) || ACTIVITY_PRICE);
    return acc + (actPrice * form.adults);
  }, 0);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>🎯 Destination Activities &amp; Tours</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 12px" }}>Select curated experiences to include in your package at {place?.name?.split(",")[0]}</p>
      
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#1D4ED8", fontWeight: 700, marginBottom: 16 }}>
        💡 Select from verified experiences tailored for {place?.name?.split(",")[0]} (all optional)
      </div>

      {spots.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
          <div style={{ fontSize: 14 }}>No pre-configured activities listed for this destination.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
          {spots.map((s, i) => {
            const sel = form.activities.some(a => a.name === s.name);
            const itemPrice = typeof s.price === "number" ? s.price : (parsePrice(s.price) || ACTIVITY_PRICE);

            return (
              <div
                key={i}
                onClick={() => toggle(s)}
                style={{
                  ...(sel ? SEL : CARD),
                  cursor: "pointer", transition: "all .2s", position: "relative",
                  background: sel ? "#EFF6FF" : "#FFFFFF"
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.boxShadow = CARD.boxShadow; }}
              >
                {sel && (
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#2563EB", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaCheckCircle size={12} color="#fff" />
                  </div>
                )}
                <div style={{ fontWeight: 800, fontSize: 14, color: "#111827", marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 12 }}>
                  {(s.desc || s.description || "").slice(0, 110)}…
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>⏱ {s.time || s.duration || "Flexible"}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>{fmt(itemPrice)}/pax</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form.activities.length > 0 && (
        <div style={{ marginTop: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 18px", fontSize: 13, color: "#15803D", fontWeight: 700 }}>
          ✅ {form.activities.length} experience{form.activities.length > 1 ? "s" : ""} selected — {fmt(totalActivitiesCost)} total
        </div>
      )}
    </div>
  );
}

/* ── Step 5: Review ─────────────────────────────────────── */
function StepReview({ form, place, p }) {
  const nights = nightsBetween(form.checkIn, form.checkOut) || 1;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>📋 Review Trip Summary</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 20px" }}>Verify your trip details and live price breakdown before proceeding to payment</p>

      {/* Destination banner */}
      <div style={{ ...CARD, display: "flex", gap: 16, alignItems: "center", marginBottom: 14, padding: "16px 20px" }}>
        <img
          src={place?.img}
          alt={place?.name}
          style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 12, flexShrink: 0 }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80"; }}
        />
        <div>
          <div style={{ fontSize: 11, color: "#2563EB", textTransform: "uppercase", fontWeight: 800, letterSpacing: 1 }}>Selected Destination</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{place?.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>{place?.category} · Best Time: {place?.bestTime}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {[
          { title: "📅 Dates & Duration", lines: [`${form.checkIn} → ${form.checkOut}`, `${nights} Night${nights !== 1 ? "s" : ""} Stay`] },
          { title: "👥 Traveling Party", lines: [`${form.adults} Adult${form.adults !== 1 ? "s" : ""}${form.children > 0 ? `, ${form.children} Child${form.children !== 1 ? "ren" : ""}` : ""}`, `Total: ${form.adults + form.children} Travelers`] },
          {
            title: "🏨 Hotel Accommodation",
            lines: form.selectedHotel
              ? [form.selectedHotel.name, `${form.selectedHotel.price} (${nights}N)`]
              : ["Self-arranged accommodation"],
          },
          {
            title: "🚆 Travel Option",
            lines: form.travelMode === "train"
              ? ["🚆 Train (Booked via IRCTC)", "Direct / express train connection"]
              : form.travelMode === "flight"
              ? ["✈️ Flight (Direct Airline Route)", "Search & booking completed"]
              : form.travelMode === "bus"
              ? ["🚌 Bus (Booked via RedBus)", "Express inter-city bus service"]
              : ["Self-arranged / flexible travel"],
          },
        ].map(c => (
          <div key={c.title} style={{ ...CARD, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{c.title}</div>
            {c.lines.map((l, j) => (
              <div key={j} style={{ fontSize: j === 0 ? 13 : 12, fontWeight: j === 0 ? 800 : 500, color: j === 0 ? "#111827" : "#6B7280", marginTop: j ? 2 : 0 }}>{l}</div>
            ))}
          </div>
        ))}
      </div>

      {form.activities.length > 0 && (
        <div style={{ ...CARD, marginBottom: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
            🎯 Included Activities ({form.activities.length})
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {form.activities.map((a, i) => (
              <span key={i} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, background: "rgba(37,99,235,.07)", border: "1px solid rgba(37,99,235,.2)", color: "#2563EB", fontWeight: 700 }}>
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Price Breakdown */}
      <div style={{ ...CARD, background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", border: "1px solid #BFDBFE", padding: "20px 22px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#111827", marginBottom: 14 }}>💰 Dynamic Price Breakdown</div>
        {[
          { l: `Hotel Stay (${form.selectedHotel?.name || "None"})`, v: p.hotelCost },
          { l: `Travel Option (${form.travelMode ? form.travelMode.toUpperCase() : "Independent"})`, v: p.flightCost || 0 },
          { l: `Activities (${form.activities.length} selected)`, v: p.activitiesCost },
          { l: "Taxes & Service Fees (10%)", v: p.taxes },
        ].map(r => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: "#4B5563" }}>{r.l}</span>
            <span style={{ fontWeight: 700, color: r.v > 0 ? "#111827" : "#9CA3AF" }}>{r.v > 0 ? fmt(r.v) : "₹0"}</span>
          </div>
        ))}
        <div style={{ borderTop: "2px dashed #BFDBFE", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>Total Calculated Amount</span>
          <span style={{ fontWeight: 900, fontSize: 24, color: "#2563EB" }}>{fmt(p.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Razorpay Script Loader ────────────────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ── Step 6: Payment ─────────────────────────────────────── */
function StepPayment({ form, place, pricing, user, onPaymentSuccess, onBack, placeId }) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paymentStatus, setPaymentStatus] = useState("ready"); // "ready" | "processing" | "cancelled" | "failed"
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testOrderData, setTestOrderData] = useState(null);

  const nights = nightsBetween(form.checkIn, form.checkOut) || 1;

  const paymentMethods = [
    {
      id: "upi",
      title: "UPI (Google Pay, PhonePe, Paytm, BHIM)",
      subtitle: "Instant authorization with 0% gateway fee",
      icon: "🟣",
      popular: true,
    },
    {
      id: "card",
      title: "Credit / Debit Cards",
      subtitle: "Visa, MasterCard, RuPay, Maestro & Amex",
      icon: "💳",
      popular: false,
    },
    {
      id: "netbanking",
      title: "Net Banking & Wallets",
      subtitle: "All Indian banks & digital wallet partners",
      icon: "🏦",
      popular: false,
    }
  ];

  // Initiate Razorpay Checkout
  const handleProceedPayment = async () => {
    setLoading(true);
    setPaymentStatus("processing");
    setPaymentError("");
    setStatusMsg("Creating Secure Payment...");

    try {
      // 1. Create order on backend with server-side amount verification
      const orderPayload = {
        amount: pricing.totalAmount,
        currency: "INR",
        userEmail: user?.email || "",
        destinationName: place?.name || "Trip",
        bookingPayload: {
          hotelCost: pricing.hotelCost,
          flightCost: pricing.flightCost,
          activitiesCost: pricing.activitiesCost,
          taxes: pricing.taxes,
          totalAmount: pricing.totalAmount,
          destinationName: place?.name || "Trip",
          userEmail: user?.email || ""
        }
      };

      const orderRes = await axios.post(`${API}/api/payment/create-order`, orderPayload);
      if (!orderRes.data?.success || !orderRes.data?.order) {
        throw new Error(orderRes.data?.message || "Unable to create payment order. Please try again.");
      }

      const order = orderRes.data.order;
      const keyId = orderRes.data.keyId || "rzp_test_51fb5c96TravelAI";

      console.log("[RAZORPAY CHECKOUT ORDER CREATED]", {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        mode: order.mode
      });

      // 2. If real live order created on Razorpay API
      if (order.mode === "razorpay_live_test") {
        setStatusMsg("Opening Secure Checkout...");
        const isLoaded = await loadRazorpayScript();

        if (isLoaded && window.Razorpay) {
          const rzpOptions = {
            key: keyId,
            amount: order.amount,
            currency: order.currency || "INR",
            name: "TravelAI",
            description: `Trip to ${place?.name?.split(",")[0]}`,
            image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=100&q=80",
            order_id: order.id,
            prefill: {
              name: user?.name || "Traveler",
              email: user?.email || "traveler@example.com",
              contact: user?.phone || "9876543210"
            },
            notes: {
              destination: place?.name,
              hotel: form.selectedHotel?.name || "None",
              travelMode: form.travelMode || "self"
            },
            theme: {
              color: "#2563EB"
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
                setStatusMsg("");
                setPaymentStatus("cancelled");
                setPaymentError("Payment was cancelled. You can retry when you are ready.");
              }
            },
            handler: async function(response) {
              console.log("[RAZORPAY PAYMENT SUCCESS HANDLER]", response);
              await verifyAndFinalizePayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
            }
          };

          try {
            const rzpInstance = new window.Razorpay(rzpOptions);
            rzpInstance.on("payment.failed", function(resp) {
              console.error("[RAZORPAY PAYMENT FAILED]", resp);
              setLoading(false);
              setStatusMsg("");
              setPaymentStatus("failed");
              const reason = resp.error?.description || resp.error?.reason || "Gateway transaction declined.";
              setPaymentError(`Payment failed. Reason: ${reason}`);
            });
            rzpInstance.open();
            return;
          } catch (rzpErr) {
            console.warn("Direct Razorpay instance open warning, fallback to test sandbox dialog:", rzpErr);
          }
        }
      }

      // 3. Test Sandbox Checkout Modal (for local test development)
      setTestOrderData({ order, keyId });
      setTestModalOpen(true);
      setLoading(false);
      setStatusMsg("");

    } catch (err) {
      console.error("[RAZORPAY CREATE ORDER ERROR]", err);
      setLoading(false);
      setStatusMsg("");
      setPaymentStatus("failed");
      let friendlyMsg = "Unable to create payment order. Please try again.";
      if (!err.response && (err.message === "Network Error" || err.code === "ERR_NETWORK")) {
        friendlyMsg = "Unable to connect to the payment service. Please check your connection and try again.";
      } else if (err.response?.data?.message) {
        friendlyMsg = err.response.data.message;
      } else if (err.message) {
        friendlyMsg = err.message;
      }
      setPaymentError(friendlyMsg);
    }
  };

  // Verify signature and finalize booking
  const verifyAndFinalizePayment = async (paymentId, orderId, signature) => {
    setLoading(true);
    setPaymentStatus("processing");
    setStatusMsg("Verifying Payment Signature...");

    console.log("[RAZORPAY VERIFY INITIATED]", { paymentId, orderId, signature });

    try {
      const verifyRes = await axios.post(`${API}/api/payment/verify-and-book`, {
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        paymentMethod: selectedMethod.toUpperCase(),
        bookingPayload: {
          userEmail:       user?.email || "",
          customerEmail:   user?.email || "",
          customerName:    user?.name  || "",
          destinationId:   String(place?.id || placeId),
          destinationName: place?.name || "",
          destinationImg:  place?.img  || "",
          checkIn:         form.checkIn,
          checkOut:        form.checkOut,
          adults:          form.adults,
          children:        form.children,
          selectedHotel:   form.selectedHotel  || null,
          selectedFlight:  form.selectedFlight || null,
          travelMode:      form.travelMode || "self",
          activities:      form.activities,
          hotelCost:       pricing.hotelCost,
          flightCost:      pricing.flightCost,
          activitiesCost:  pricing.activitiesCost,
          taxes:           pricing.taxes,
          totalAmount:     pricing.totalAmount,
        }
      });

      console.log("[RAZORPAY VERIFY RESULT]", verifyRes.data);

      if (verifyRes.data?.success && verifyRes.data?.bookingId) {
        onPaymentSuccess({
          bookingId: verifyRes.data.bookingId,
          paymentId: verifyRes.data.paymentId,
          orderId: verifyRes.data.orderId,
          paymentMethod: selectedMethod
        });
      } else {
        throw new Error(verifyRes.data?.message || "Payment verification failed. Your booking has not been confirmed.");
      }
    } catch (err) {
      console.error("[RAZORPAY VERIFY ERROR]", err);
      setLoading(false);
      setStatusMsg("");
      setPaymentStatus("failed");
      let friendlyMsg = "Payment verification failed. Your booking has not been confirmed.";
      if (!err.response && (err.message === "Network Error" || err.code === "ERR_NETWORK")) {
        friendlyMsg = "Unable to connect to the payment verification service. Please check your connection and try again.";
      } else if (err.response?.data?.message) {
        friendlyMsg = err.response.data.message;
      }
      setPaymentError(friendlyMsg);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
          🔒 Complete Your Payment
        </h2>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
          Securely pay to confirm your travel booking. (Razorpay Test Mode)
        </p>
      </div>

      {/* Complete Booking Summary Card */}
      <div style={{ ...CARD, marginBottom: 16, border: "1px solid #BFDBFE", background: "#FFFFFF", padding: "18px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
          📑 Booking Summary
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, borderBottom: "1px dashed #E2E8F0", paddingBottom: 14, marginBottom: 14 }}>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Destination</span>
            <strong style={{ color: "#0F172A" }}>{place?.name}</strong>
          </div>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Hotel Accommodation</span>
            <strong style={{ color: "#0F172A" }}>{form.selectedHotel?.name || "Self-Arranged Accommodation"}</strong>
          </div>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Travel Dates &amp; Nights</span>
            <strong style={{ color: "#0F172A" }}>{form.checkIn} → {form.checkOut} ({nights}N)</strong>
          </div>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Traveling Party</span>
            <strong style={{ color: "#0F172A" }}>{form.adults} Adult{form.adults !== 1 ? "s" : ""}{form.children > 0 ? `, ${form.children} Child` : ""}</strong>
          </div>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Travel Option</span>
            <strong style={{ color: "#0F172A" }}>
              {form.travelMode === "train" ? "🚆 Train (IRCTC)" : form.travelMode === "flight" ? "✈️ Flight" : form.travelMode === "bus" ? "🚌 Bus (RedBus)" : "🚗 Self-Arranged"}
            </strong>
          </div>
          <div>
            <span style={{ color: "#64748B", fontSize: 11, display: "block" }}>Selected Activities</span>
            <strong style={{ color: "#0F172A" }}>{form.activities.length ? `${form.activities.length} activity selected` : "None"}</strong>
          </div>
        </div>

        {/* Itemized charges */}
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Hotel Stay ({nights} Night{nights !== 1 ? "s" : ""})</span>
            <span style={{ fontWeight: 700, color: "#0F172A" }}>{fmt(pricing.hotelCost)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Travel Option</span>
            <span style={{ fontWeight: 700, color: pricing.flightCost > 0 ? "#0F172A" : "#94A3B8" }}>{pricing.flightCost > 0 ? fmt(pricing.flightCost) : "₹0"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Activities ({form.activities.length})</span>
            <span style={{ fontWeight: 700, color: pricing.activitiesCost > 0 ? "#0F172A" : "#94A3B8" }}>{pricing.activitiesCost > 0 ? fmt(pricing.activitiesCost) : "₹0"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Taxes &amp; Service Fees (10%)</span>
            <span style={{ fontWeight: 700, color: "#0F172A" }}>{fmt(pricing.taxes)}</span>
          </div>
          <div style={{ borderTop: "2px solid #E2E8F0", paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>TOTAL PAYABLE</span>
            <span style={{ fontWeight: 900, fontSize: 22, color: "#2563EB" }}>{fmt(pricing.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Online Payment Methods */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span>💳 Choose Payment Method</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: "#EFF6FF", color: "#2563EB", padding: "2px 8px", borderRadius: 6 }}>
            Razorpay Sandbox
          </span>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {paymentMethods.map(m => {
            const isSel = selectedMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                style={{
                  background: isSel ? "#F0F7FF" : "#FFFFFF",
                  border: isSel ? "2px solid #2563EB" : "1px solid #E2E8F0",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all .2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                      {m.title}
                      {m.popular && (
                        <span style={{ fontSize: 9, fontWeight: 800, background: "#DCFCE7", color: "#15803D", padding: "2px 6px", borderRadius: 6, textTransform: "uppercase" }}>
                          Fast &amp; Free
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{m.subtitle}</div>
                  </div>
                </div>

                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: isSel ? "6px solid #2563EB" : "2px solid #CBD5E1",
                  background: "#FFFFFF", transition: "all .2s"
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Status or Error Notifications */}
      {statusMsg && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1D4ED8", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <FaSpinner style={{ animation: "spin 1s linear infinite" }} size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      {paymentError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#B91C1C", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <FaExclamationTriangle size={14} /> Payment Failed or Incomplete
          </div>
          <div style={{ marginTop: 4, color: "#7F1D1D", fontSize: 12 }}>{paymentError}</div>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleProceedPayment}
              disabled={loading}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none",
                background: "#DC2626", color: "#FFFFFF", fontWeight: 700, fontSize: 12, cursor: "pointer"
              }}
            >
              🔄 Retry Payment
            </button>
          </div>
        </div>
      )}

      {/* Main Pay Button */}
      <button
        onClick={handleProceedPayment}
        disabled={loading}
        style={{
          width: "100%",
          padding: "16px 24px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          color: "#FFFFFF",
          fontWeight: 900,
          fontSize: 16,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          boxShadow: "0 6px 20px rgba(37,99,235,0.3)",
          opacity: loading ? 0.75 : 1,
          transition: "all .2s ease"
        }}
      >
        {loading ? (
          <>
            <FaSpinner style={{ animation: "spin 1s linear infinite" }} size={16} />
            <span>{statusMsg || "Processing Secure Payment..."}</span>
          </>
        ) : (paymentError || paymentStatus === "failed" || paymentStatus === "cancelled") ? (
          <>
            <span>🔒 Retry Secure Payment</span>
            <span>·</span>
            <span>{fmt(pricing.totalAmount)}</span>
          </>
        ) : (
          <>
            <span>🔒 Proceed to Secure Payment</span>
            <span>·</span>
            <span>{fmt(pricing.totalAmount)}</span>
          </>
        )}
      </button>

      {/* Trust & Security footer */}
      <div style={{ textAlign: "center", marginTop: 14, color: "#64748B", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span>🔒 256-Bit Bank-Grade Encryption</span>
        <span>•</span>
        <span>Razorpay Test Sandbox</span>
        <span>•</span>
        <span>No Real Money Charged</span>
      </div>

      {/* Interactive Sandbox Test Checkout Modal */}
      {testModalOpen && testOrderData && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)",
          backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 20, maxWidth: 460, width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", border: "1px solid #E2E8F0"
          }}>
            <div style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)", padding: "18px 22px", color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>
                    ₹
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>TravelAI Checkout</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>Trip to {place?.name?.split(",")[0]}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,0.25)", padding: "4px 8px", borderRadius: 8, letterSpacing: 0.5 }}>
                  TEST MODE
                </span>
              </div>
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{fmt(pricing.totalAmount)}</div>
                <div style={{ fontSize: 11, opacity: 0.85, fontFamily: "monospace" }}>{testOrderData.order?.id}</div>
              </div>
            </div>

            <div style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1E293B", marginBottom: 10 }}>
                Test Payment Details:
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#475569", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Payment Method:</span>
                  <strong style={{ color: "#0F172A" }}>{selectedMethod.toUpperCase()} (Test Mode)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Customer:</span>
                  <strong style={{ color: "#0F172A" }}>{user?.name || "Traveler"} ({user?.email})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Test Card / UPI:</span>
                  <span style={{ color: "#2563EB", fontWeight: 700 }}>4111 •••• •••• 1111 / success@razorpay</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gap: 8 }}>
                <button
                  onClick={() => {
                    setTestModalOpen(false);
                    const simPayId = `pay_test_${Math.random().toString(36).slice(2, 12)}`;
                    const simSig = `sig_test_${Math.random().toString(36).slice(2, 16)}`;
                    verifyAndFinalizePayment(simPayId, testOrderData.order.id, simSig);
                  }}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: "#16A34A", color: "#FFFFFF", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22,163,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  ✓ Authorize Test Payment (Success)
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setTestModalOpen(false);
                      setPaymentStatus("failed");
                      setPaymentError("Payment failed. Reason: Test card transaction declined by issuing bank.");
                    }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #FECACA",
                      background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    ✕ Simulate Failure
                  </button>

                  <button
                    onClick={() => {
                      setTestModalOpen(false);
                      setPaymentStatus("cancelled");
                      setPaymentError("Payment was cancelled. You can retry when you are ready.");
                    }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1",
                      background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Confirmation screen ─────────────────────────────────── */
function ConfirmScreen({ form, place, pricing, bookingId, paymentInfo, navigate }) {
  const nights = nightsBetween(form.checkIn, form.checkOut) || 1;
  const nowStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <SharedNavbar activeTab="my-bookings" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 20px 60px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 10 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
            Booking Confirmed ✓
          </h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#DCFCE7", color: "#15803D", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
            <span>✓ Payment Successful</span>
            <span>·</span>
            <span>✓ Booking Confirmed</span>
          </div>
          <p style={{ color: "#4B5563", fontSize: 14, margin: 0 }}>
            Your trip to <strong style={{ color: "#2563EB" }}>{place?.name}</strong> has been confirmed and verified via Razorpay!
          </p>
        </div>

        {/* Reference IDs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ ...CARD, textAlign: "center", padding: "16px 18px", background: "#FFFFFF", border: "2px solid #2563EB" }}>
            <div style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase", fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>
              Official Booking Reference
            </div>
            <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 900, color: "#2563EB", letterSpacing: 1 }}>
              #{String(bookingId).slice(-12).toUpperCase()}
            </div>
          </div>

          <div style={{ ...CARD, textAlign: "center", padding: "16px 18px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase", fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>
              Razorpay Payment ID
            </div>
            <div style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 800, color: "#059669" }}>
              {paymentInfo?.paymentId || `pay_${String(bookingId).slice(-8)}`}
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #F3F4F6" }}>
            <img
              src={place?.img}
              alt={place?.name}
              style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80"; }}
            />
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>{place?.name}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{form.checkIn} → {form.checkOut} ({nights}N)</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{form.adults} Adult{form.adults !== 1 ? "s" : ""}{form.children > 0 ? `, ${form.children} Children` : ""}</div>
            </div>
          </div>

          {form.selectedHotel && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>🏨 Hotel</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{form.selectedHotel.name}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>🚆 Travel Mode</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>
              {form.travelMode === "train" ? "Train (IRCTC)" : form.travelMode === "flight" ? "Flight" : form.travelMode === "bus" ? "Bus (RedBus)" : "Self-Arranged Transport"}
            </span>
          </div>

          {form.activities.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13, alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "#6B7280", flexShrink: 0 }}>🎯 Activities</span>
              <span style={{ fontWeight: 700, color: "#111827", textAlign: "right" }}>{form.activities.map(a => a.name).join(", ")}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>📅 Booking Date</span>
            <span style={{ fontWeight: 700, color: "#111827" }}>{nowStr}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>💳 Payment Status</span>
            <span style={{ fontWeight: 800, color: "#16A34A" }}>PAID (Verified via Razorpay)</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Total Paid Amount</span>
            <span style={{ fontWeight: 900, fontSize: 24, color: "#2563EB" }}>{fmt(pricing.totalAmount)}</span>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <FaCheckCircle color="#22c55e" size={16} />
          <span style={{ fontSize: 13, color: "#15803D", fontWeight: 700 }}>Status: Confirmed &amp; Paid — Saved in MongoDB &amp; My Bookings</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => navigate("/my-bookings")} style={{ ...BLUE }}>
            <FaTicketAlt size={13} /> View My Bookings
          </button>
          <button onClick={() => navigate("/destinations")} style={{ ...BLUE, background: "linear-gradient(135deg, #059669, #10B981)" }}>
            <FaSuitcaseRolling size={13} /> Back to Destinations
          </button>
          <button onClick={() => navigate("/home")} style={{ ...GHOST }}>
            <FaHome size={13} /> Back to Home
          </button>
          <button onClick={() => window.print()} style={{ ...GHOST }}>
            <FaPrint size={13} /> Print Confirmation
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
export default function TripBooking() {
  const { placeId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  // Auth guard
  const userStr = localStorage.getItem("user");
  const user    = userStr ? JSON.parse(userStr) : null;
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, navigate, location.pathname]);

  const [place, setPlace] = useState(() => getPlaceById(placeId));
  const [liveHotels, setLiveHotels] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);

  useEffect(() => {
    fetchTripData();
  }, [placeId]);

  const fetchTripData = async () => {
    try {
      const pRes = await axios.get(`${API}/api/destinations/${placeId}`);
      if (pRes.data && pRes.data.name) setPlace(pRes.data);
    } catch (e) {}

    try {
      const hRes = await axios.get(`${API}/api/hotels?destinationId=${placeId}&status=Active`);
      if (hRes.data && hRes.data.length > 0) setLiveHotels(hRes.data);
    } catch (e) {}

    try {
      const aRes = await axios.get(`${API}/api/activities?destinationId=${placeId}&status=Active`);
      if (aRes.data && aRes.data.length > 0) setLiveActivities(aRes.data);
    } catch (e) {}
  };

  const [step,        setStep]       = useState(0);
  const [bookingId,   setBookingId]   = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [errors,      setErrors]      = useState({});
  const [analysisModalHotel, setAnalysisModalHotel] = useState(null);

  const [form, setForm] = useState({
    checkIn: "", checkOut: "", adults: 2, children: 0,
    selectedHotel: undefined, selectedFlight: undefined, activities: [],
    travelMode: "train"
  });

  // Dynamic price
  const pricing = useMemo(() => {
    const nights = nightsBetween(form.checkIn, form.checkOut) || 1;
    let hotelRate = 0;
    if (form.selectedHotel) {
      if (typeof form.selectedHotel.pricePerNight === "number") {
        hotelRate = form.selectedHotel.pricePerNight;
      } else {
        hotelRate = parsePrice(form.selectedHotel.price || form.selectedHotel.pricePerNight);
      }
    }
    const hotelCost      = hotelRate * nights;
    const flightCost     = form.selectedFlight ? (form.selectedFlight.price || 0) * form.adults : 0;
    
    // Dynamic per-activity pricing
    const activitiesCost = form.activities.reduce((acc, act) => {
      const actPrice = typeof act.price === "number" ? act.price : (parsePrice(act.price) || ACTIVITY_PRICE);
      return acc + (actPrice * form.adults);
    }, 0);

    const sub            = hotelCost + flightCost + activitiesCost;
    const taxes          = Math.round(sub * 0.1);
    return { hotelCost, flightCost, activitiesCost, taxes, totalAmount: sub + taxes };
  }, [form]);

  // Validate current step
  const validate = (s) => {
    const e = {};
    if (s === 0) {
      const today = new Date().toISOString().split("T")[0];
      if (!form.checkIn)                      e.checkIn  = "Please select a check-in date.";
      else if (form.checkIn < today)          e.checkIn  = "Check-in date cannot be in the past.";
      if (!form.checkOut)                     e.checkOut = "Please select a check-out date.";
      else if (form.checkOut <= form.checkIn) e.checkOut = "Check-out date must be after check-in date.";
      if (form.adults < 1)                    e.adults   = "At least 1 adult traveler is required.";
    }
    return e;
  };

  const goNext = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show confirmation if done
  if (bookingId) {
    return <ConfirmScreen form={form} place={place} pricing={pricing} bookingId={bookingId} paymentInfo={paymentInfo} navigate={navigate} />;
  }

  if (!user) return null;

  if (!place) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <div style={{ fontSize: 54 }}>🗺️</div>
        <h2 style={{ fontWeight: 800, fontSize: 20, margin: 0, color: "#111827" }}>Destination not found</h2>
        <button onClick={() => navigate("/search?tab=places")} style={{ ...BLUE }}>Browse Destinations</button>
      </div>
    );
  }

  const steps = [
    <StepDates      key="dates"      form={form} set={setForm} err={errors} />,
    <StepHotel      key="hotel"      form={form} set={setForm} place={place} liveHotels={liveHotels} onOpenAnalysis={setAnalysisModalHotel} />,
    <StepTravel     key="travel"     form={form} set={setForm} place={place} />,
    <StepActivities key="activities" form={form} set={setForm} place={place} liveActivities={liveActivities} />,
    <StepReview     key="review"     form={form} place={place} p={pricing} />,
    <StepPayment
      key="payment"
      form={form}
      place={place}
      pricing={pricing}
      user={user}
      placeId={placeId}
      onBack={goBack}
      onPaymentSuccess={({ bookingId: bid, paymentId: pid, orderId: oid }) => {
        setPaymentInfo({ paymentId: pid, orderId: oid, paymentStatus: "paid", paidAmount: pricing.totalAmount });
        setBookingId(bid);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />,
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <SharedNavbar activeTab="destinations" />
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "88px 20px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <button
            onClick={() => step === 0 ? navigate(`/explore/${placeId}`) : goBack()}
            style={{ ...GHOST, padding: "9px 16px", fontSize: 13 }}
          >
            <FaArrowLeft size={11} /> {step === 0 ? "Back to Details" : "Back"}
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827" }}>
              Book Your Trip to {place.name.split(",")[0]}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{place.category} · {place.tripDuration}</p>
          </div>
        </div>

        <StepBar cur={step} />

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18, alignItems: "start" }}>

          {/* Form card */}
          <div style={{ ...CARD, animation: "fadeUp .4s ease" }}>
            {steps[step]}

            {/* Nav buttons (Only shown for steps 0 to 4; Step 5 Payment has its own primary payment action button) */}
            {step < 5 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 18, borderTop: "1px solid #F3F4F6" }}>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>Step {step + 1} of {STEPS.length}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {step > 0 && (
                    <button onClick={goBack} style={{ ...GHOST, padding: "10px 20px", fontSize: 13 }}>
                      <FaArrowLeft size={11} /> Back
                    </button>
                  )}
                  <button onClick={goNext} style={{ ...BLUE, padding: "10px 22px", fontSize: 13 }}>
                    {step === 4 ? "Proceed to Payment 💳" : "Next"} <FaArrowRight size={11} />
                  </button>
                </div>
              </div>
            )}
            {step === 5 && (
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
                <button onClick={goBack} style={{ ...GHOST, padding: "9px 18px", fontSize: 13 }}>
                  <FaArrowLeft size={11} /> Back to Summary
                </button>
              </div>
            )}
          </div>

          {/* Sticky Sidebar Summary */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ ...CARD, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #F3F4F6" }}>
                <img
                  src={place.img}
                  alt={place.name}
                  style={{ width: 52, height: 42, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  onError={e => { e.target.src = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80"; }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{place.name.split(",")[0]}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{place.category}</div>
                </div>
              </div>
              
              <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10 }}>
                Live Price Summary
              </div>
              
              {[
                { l: "🏨 Hotel",       v: pricing.hotelCost },
                { l: "🚆 Travel",      v: pricing.flightCost },
                { l: "🎯 Activities",  v: pricing.activitiesCost },
                { l: "🧾 Taxes (10%)", v: pricing.taxes },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 7 }}>
                  <span style={{ color: "#6B7280" }}>{r.l}</span>
                  <span style={{ fontWeight: 700, color: r.v > 0 ? "#111827" : "#9CA3AF" }}>{r.v > 0 ? fmt(r.v) : "—"}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed #E5E7EB", paddingTop: 10, marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 18, color: "#2563EB" }}>{fmt(pricing.totalAmount)}</span>
              </div>
            </div>

            <div style={{ ...CARD, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 8 }}>
                Current Selection
              </div>
              {form.checkIn && form.checkOut && (
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                  📅 {form.checkIn} → {form.checkOut}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                👥 {form.adults} Adult{form.adults !== 1 ? "s" : ""}{form.children > 0 ? ` · ${form.children} Child` : ""}
              </div>
              {form.selectedHotel && (
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                  🏨 {form.selectedHotel.name}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                🚆 {form.travelMode === "train" ? "Train (IRCTC)" : form.travelMode === "flight" ? "Flight Booking" : form.travelMode === "bus" ? "Bus (RedBus)" : "Self-Arranged Travel"}
              </div>
              {form.activities.length > 0 && (
                <div style={{ fontSize: 11, color: "#374151" }}>
                  🎯 {form.activities.length} activit{form.activities.length !== 1 ? "ies" : "y"}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Hotel Feedback Analysis Modal */}
      {analysisModalHotel && (
        <FeedbackAnalysisModal
          item={analysisModalHotel}
          itemType="hotel"
          onClose={() => setAnalysisModalHotel(null)}
        />
      )}
    </div>
  );
}
