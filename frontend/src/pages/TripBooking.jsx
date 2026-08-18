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
import { HOTELS_LIST } from "../data/hotels";
import SharedNavbar from "../components/SharedNavbar";

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
  { label: "Flight", icon: "✈️" },
  { label: "Activities", icon: "🎯" },
  { label: "Review & Pay", icon: "📋" },
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
function StepHotel({ form, set, place }) {
  const [q, setQ] = useState("");
  const cityName = (place?.name || "").split(",")[0].trim().toLowerCase();

  const sorted = [...HOTELS_LIST].sort((a, b) => {
    const aMatch = a.location.toLowerCase().includes(cityName) ? 1 : 0;
    const bMatch = b.location.toLowerCase().includes(cityName) ? 1 : 0;
    return bMatch - aMatch;
  });

  const list = q ? sorted.filter(h => h.name.toLowerCase().includes(q.toLowerCase()) || h.location.toLowerCase().includes(q.toLowerCase())) : sorted;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>🏨 Select Hotel Accommodation</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 16px" }}>Choose your stay in {place?.name?.split(",")[0]} or use existing accommodation</p>
      
      <input
        type="text"
        placeholder="🔍 Search available hotels by name or area..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{
          width: "100%", padding: "11px 16px", borderRadius: 10,
          border: "1px solid #D1D5DB", fontSize: 14, fontFamily: "inherit",
          marginBottom: 14, outline: "none", boxSizing: "border-box"
        }}
      />

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <FaStar size={11} color="#f59e0b" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{h.rating}</span>
                  </div>
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

/* ── Step 3: Flight ─────────────────────────────────────── */
const FALLBACK_FLIGHTS = [
  { flightNo: "AI-101", airline: "Air India",  from: "Delhi",    fromIata: "DEL", to: "Mumbai",    toIata: "BOM", departure: "06:00", arrival: "08:10", duration: "2h 10m", stops: "Non-stop", status: "scheduled", price: 6500 },
  { flightNo: "6E-201", airline: "IndiGo",     from: "Delhi",    fromIata: "DEL", to: "Mumbai",    toIata: "BOM", departure: "08:30", arrival: "10:45", duration: "2h 15m", stops: "Non-stop", status: "active",    price: 4800 },
  { flightNo: "UK-963", airline: "Vistara",    from: "Delhi",    fromIata: "DEL", to: "Goa",       toIata: "GOI", departure: "10:00", arrival: "12:15", duration: "2h 15m", stops: "Non-stop", status: "scheduled", price: 7200 },
  { flightNo: "SG-141", airline: "SpiceJet",   from: "Delhi",    fromIata: "DEL", to: "Bangalore", toIata: "BLR", departure: "06:30", arrival: "09:10", duration: "2h 40m", stops: "Non-stop", status: "scheduled", price: 4200 },
  { flightNo: "AI-803", airline: "Air India",  from: "Mumbai",   fromIata: "BOM", to: "Delhi",     toIata: "DEL", departure: "07:45", arrival: "10:30", duration: "2h 45m", stops: "Non-stop", status: "scheduled", price: 6500 },
  { flightNo: "UK-955", airline: "Vistara",    from: "Mumbai",   fromIata: "BOM", to: "Goa",       toIata: "GOI", departure: "11:15", arrival: "12:30", duration: "1h 15m", stops: "Non-stop", status: "scheduled", price: 7200 },
  { flightNo: "6E-508", airline: "IndiGo",     from: "Chennai",  fromIata: "MAA", to: "Delhi",     toIata: "DEL", departure: "15:00", arrival: "17:45", duration: "2h 45m", stops: "Non-stop", status: "active",    price: 4800 },
  { flightNo: "AI-502", airline: "Air India",  from: "Kolkata",  fromIata: "CCU", to: "Mumbai",    toIata: "BOM", departure: "09:00", arrival: "11:30", duration: "2h 30m", stops: "Non-stop", status: "scheduled", price: 6500 },
  { flightNo: "UK-827", airline: "Vistara",    from: "Delhi",    fromIata: "DEL", to: "Kolkata",   toIata: "CCU", departure: "09:15", arrival: "11:30", duration: "2h 15m", stops: "Non-stop", status: "scheduled", price: 7200 },
  { flightNo: "6E-702", airline: "IndiGo",     from: "Bangalore",fromIata: "BLR", to: "Hyderabad", toIata: "HYD", departure: "09:30", arrival: "10:45", duration: "1h 15m", stops: "Non-stop", status: "scheduled", price: 4800 },
];

const PRICE_MAP = { "Air India": 6500, "IndiGo": 4800, "Vistara": 7200, "SpiceJet": 4200 };
const AIRLINE_EMOJI = { "Air India": "🔴", "IndiGo": "🔵", "Vistara": "🟣", "SpiceJet": "🟠" };
const STATUS_COLOR = { scheduled: "#6B7280", active: "#22c55e", delayed: "#f59e0b", landed: "#3B82F6" };

function StepFlight({ form, set }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${API}/api/flights/live?limit=12`, { timeout: 6000 });
        const data = (r.data?.data || []).map(f => ({ ...f, price: PRICE_MAP[f.airline] || 5500 }));
        setFlights(data.length ? data : FALLBACK_FLIGHTS);
      } catch {
        setFlights(FALLBACK_FLIGHTS);
        setWarn("Live flight service fallback active — showing scheduled airline routes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>✈️ Select Connecting Flight</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 14px" }}>Pick an airline flight ticket or skip to travel independently</p>
      
      {warn && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "9px 14px", fontSize: 13, color: "#92400E", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <FaExclamationTriangle size={12} /> {warn}
        </div>
      )}

      {/* Skip */}
      <div
        onClick={() => set(f => ({ ...f, selectedFlight: null }))}
        style={{
          ...(form.selectedFlight === null ? SEL : CARD),
          marginBottom: 14, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 14, padding: "14px 18px",
          background: form.selectedFlight === null ? "#EFF6FF" : "#FFFFFF"
        }}
      >
        <span style={{ fontSize: 26 }}>🚗</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>No Flight — Self-Arranged Transport</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Skip flight reservation and proceed with destination activities</div>
        </div>
        {form.selectedFlight === null && <FaCheckCircle color="#2563EB" size={18} />}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>
          <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: 24, color: "#2563EB" }} />
          <div style={{ fontSize: 13, marginTop: 10 }}>Loading flight options...</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, maxHeight: 440, overflowY: "auto", paddingRight: 4 }}>
          {flights.map((fl, i) => {
            const sel = form.selectedFlight?.flightNo === fl.flightNo;
            return (
              <div
                key={i}
                onClick={() => set(f => ({ ...f, selectedFlight: fl }))}
                style={{
                  ...(sel ? SEL : CARD),
                  cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                  alignItems: "center", gap: 14, transition: "all .2s", padding: "14px 18px"
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.boxShadow = CARD.boxShadow; }}
              >
                <div style={{ fontSize: 24 }}>{AIRLINE_EMOJI[fl.airline] || "✈️"}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#111827" }}>
                    {fl.airline} <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>#{fl.flightNo}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>{fl.from} ({fl.fromIata}) → {fl.to} ({fl.toIata})</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{fl.departure} – {fl.arrival} · {fl.duration} · {fl.stops}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#2563EB" }}>{fmt(fl.price)}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF" }}>per traveler</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[fl.status] || "#6B7280", textTransform: "uppercase", marginTop: 3 }}>{fl.status}</div>
                </div>
                {sel && <FaCheckCircle color="#2563EB" size={18} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Step 4: Activities ─────────────────────────────────── */
function StepActivities({ form, set, place }) {
  const spots = place?.visits || [];
  const toggle = (spot) => set(f => {
    const exists = f.activities.some(a => a.name === spot.name);
    return {
      ...f,
      activities: exists
        ? f.activities.filter(a => a.name !== spot.name)
        : [...f.activities, { name: spot.name, price: ACTIVITY_PRICE, time: spot.time || "Half Day" }]
    };
  });

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>🎯 Destination Activities &amp; Tours</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 12px" }}>Select curated experiences to include in your package at {place?.name?.split(",")[0]}</p>
      
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#1D4ED8", fontWeight: 700, marginBottom: 16 }}>
        💡 Guided experiences starting at {fmt(ACTIVITY_PRICE)}/traveler per activity (all optional)
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
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>⏱ {s.time || "Flexible"}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB" }}>{fmt(ACTIVITY_PRICE)}/pax</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form.activities.length > 0 && (
        <div style={{ marginTop: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 18px", fontSize: 13, color: "#15803D", fontWeight: 700 }}>
          ✅ {form.activities.length} experience{form.activities.length > 1 ? "s" : ""} selected — {fmt(form.activities.length * ACTIVITY_PRICE * form.adults)} total
        </div>
      )}
    </div>
  );
}

/* ── Step 5: Review ─────────────────────────────────────── */
function StepReview({ form, place, p }) {
  const nights = nightsBetween(form.checkIn, form.checkOut);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>📋 Review &amp; Confirm Booking</h2>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 20px" }}>Verify your trip details and live price breakdown before finalizing</p>

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
            title: "✈️ Flight Ticket",
            lines: form.selectedFlight
              ? [`${form.selectedFlight.airline} #${form.selectedFlight.flightNo}`, `${form.selectedFlight.from} → ${form.selectedFlight.to}`]
              : ["Self-arranged transport"],
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
          { l: `Flight Tickets (${form.adults} adult${form.adults > 1 ? "s" : ""})`, v: p.flightCost },
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

/* ── Confirmation screen ─────────────────────────────────── */
function ConfirmScreen({ form, place, pricing, bookingId, navigate }) {
  const nights = nightsBetween(form.checkIn, form.checkOut);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <SharedNavbar activeTab="my-bookings" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 20px 60px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 10 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
            Booking Confirmed ✓
          </h1>
          <p style={{ color: "#4B5563", fontSize: 15, margin: 0 }}>
            Your trip to <strong style={{ color: "#2563EB" }}>{place?.name}</strong> has been confirmed and stored successfully!
          </p>
        </div>

        {/* Booking ID badge */}
        <div style={{ ...CARD, textAlign: "center", marginBottom: 16, padding: "18px 24px", background: "#FFFFFF", border: "2px solid #2563EB" }}>
          <div style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
            Official Booking Reference
          </div>
          <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 900, color: "#2563EB", letterSpacing: 2 }}>
            #{String(bookingId).slice(-12).toUpperCase()}
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

          {form.selectedFlight && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13 }}>
              <span style={{ color: "#6B7280" }}>✈️ Flight</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{form.selectedFlight.airline} #{form.selectedFlight.flightNo}</span>
            </div>
          )}

          {form.activities.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F9FAFB", fontSize: 13, alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: "#6B7280", flexShrink: 0 }}>🎯 Activities</span>
              <span style={{ fontWeight: 700, color: "#111827", textAlign: "right" }}>{form.activities.map(a => a.name).join(", ")}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginTop: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Total Paid Amount</span>
            <span style={{ fontWeight: 900, fontSize: 24, color: "#2563EB" }}>{fmt(pricing.totalAmount)}</span>
          </div>
        </div>

        {/* Status badge */}
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <FaCheckCircle color="#22c55e" size={16} />
          <span style={{ fontSize: 13, color: "#15803D", fontWeight: 700 }}>Status: Confirmed — Everything is set in MongoDB</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => navigate("/my-bookings")} style={{ ...BLUE }}>
            <FaTicketAlt size={13} /> View My Bookings
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

  const place = getPlaceById(placeId);

  const [step,        setStep]       = useState(0);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitErr,   setSubmitErr]   = useState("");
  const [bookingId,   setBookingId]   = useState(null);
  const [errors,      setErrors]      = useState({});

  const [form, setForm] = useState({
    checkIn: "", checkOut: "", adults: 2, children: 0,
    selectedHotel: undefined, selectedFlight: undefined, activities: [],
  });

  // Dynamic price
  const pricing = useMemo(() => {
    const nights         = nightsBetween(form.checkIn, form.checkOut) || 1;
    const hotelCost      = form.selectedHotel  ? parsePrice(form.selectedHotel.price)  * nights      : 0;
    const flightCost     = form.selectedFlight ? (form.selectedFlight.price || 0)       * form.adults : 0;
    const activitiesCost = form.activities.length * ACTIVITY_PRICE * form.adults;
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

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      const payload = {
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
        activities:      form.activities,
        hotelCost:       pricing.hotelCost,
        flightCost:      pricing.flightCost,
        activitiesCost:  pricing.activitiesCost,
        taxes:           pricing.taxes,
        totalAmount:     pricing.totalAmount,
      };

      const res = await axios.post(`${API}/api/bookings/destination`, payload);
      const bid = res.data?.bookingId;
      if (bid) {
        setBookingId(bid);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitErr("Booking created but ID missing. Check My Bookings.");
      }
    } catch (err) {
      setSubmitErr(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show confirmation if done
  if (bookingId) {
    return <ConfirmScreen form={form} place={place} pricing={pricing} bookingId={bookingId} navigate={navigate} />;
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
    <StepHotel      key="hotel"      form={form} set={setForm} place={place} />,
    <StepFlight     key="flight"     form={form} set={setForm} />,
    <StepActivities key="activities" form={form} set={setForm} place={place} />,
    <StepReview     key="review"     form={form} place={place} p={pricing} />,
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

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 18, borderTop: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>Step {step + 1} of {STEPS.length}</div>
              <div style={{ display: "flex", gap: 10 }}>
                {step > 0 && (
                  <button onClick={goBack} style={{ ...GHOST, padding: "10px 20px", fontSize: 13 }}>
                    <FaArrowLeft size={11} /> Back
                  </button>
                )}
                {step < 4 ? (
                  <button onClick={goNext} style={{ ...BLUE, padding: "10px 22px", fontSize: 13 }}>
                    Next <FaArrowRight size={11} />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    style={{ ...BLUE, padding: "10px 26px", fontSize: 13, opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting
                      ? <><FaSpinner style={{ animation: "spin 1s linear infinite" }} size={12} /> Confirming Booking…</>
                      : <><FaCheckCircle size={12} /> Confirm Booking</>}
                  </button>
                )}
              </div>
            </div>

            {submitErr && (
              <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 8 }}>
                <FaExclamationTriangle size={13} /> {submitErr}
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
                { l: "✈️ Flights",     v: pricing.flightCost },
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
              {form.selectedFlight && (
                <div style={{ fontSize: 11, color: "#374151", marginBottom: 4 }}>
                  ✈️ {form.selectedFlight.airline} #{form.selectedFlight.flightNo}
                </div>
              )}
              {form.activities.length > 0 && (
                <div style={{ fontSize: 11, color: "#374151" }}>
                  🎯 {form.activities.length} activit{form.activities.length !== 1 ? "ies" : "y"}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
