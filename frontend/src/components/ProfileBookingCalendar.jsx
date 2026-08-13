import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";

export default function ProfileBookingCalendar({ compact = false }) {
  let user = { name: "Traveler", email: "user@example.com" };
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
      user = JSON.parse(rawUser) || user;
    }
  } catch (e) {
    user = { name: "Traveler", email: "user@example.com" };
  }
  const userEmail = (user && user.email) ? user.email : "user@example.com";

  const [bookedHotels, setBookedHotels] = useState([]);
  const [bookedFlights, setBookedFlights] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  useEffect(() => {
    fetchStoredBookings();
  }, [userEmail]);

  const fetchStoredBookings = () => {
    try {
      let userHotels = [];
      let userFlights = [];

      try {
        const rawH1 = localStorage.getItem(`userBookedHotels_${userEmail}`);
        const rawH2 = localStorage.getItem(`bookedHotels_${userEmail}`);
        if (rawH1 && rawH1 !== "undefined") userHotels = JSON.parse(rawH1) || [];
        else if (rawH2 && rawH2 !== "undefined") userHotels = JSON.parse(rawH2) || [];
      } catch (e) { userHotels = []; }

      try {
        const rawF1 = localStorage.getItem(`userBookedFlights_${userEmail}`);
        const rawF2 = localStorage.getItem(`bookedFlights_${userEmail}`);
        if (rawF1 && rawF1 !== "undefined") userFlights = JSON.parse(rawF1) || [];
        else if (rawF2 && rawF2 !== "undefined") userFlights = JSON.parse(rawF2) || [];
      } catch (e) { userFlights = []; }

      setBookedHotels(Array.isArray(userHotels) ? userHotels : []);
      setBookedFlights(Array.isArray(userFlights) ? userFlights : []);
    } catch (err) {
      setBookedHotels([]);
      setBookedFlights([]);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Helper to check if a day has hotel or flight bookings
  const getBookingsForDay = (dayNum) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

    const safeHotels = Array.isArray(bookedHotels) ? bookedHotels : [];
    const safeFlights = Array.isArray(bookedFlights) ? bookedFlights : [];

    const hotelMatch = safeHotels.filter(h => {
      if (!h) return false;
      if (h.checkIn && h.checkOut) {
        const cInParts = String(h.checkIn).split("-");
        const cOutParts = String(h.checkOut).split("-");
        if (cInParts.length === 3 && cOutParts.length === 3) {
          const cInDay = parseInt(cInParts[2] || "0", 10);
          const cOutDay = parseInt(cOutParts[2] || "0", 10);
          const cInMonth = parseInt(cInParts[1] || "0", 10) - 1;
          if (cInMonth === month) {
            return dayNum >= cInDay && dayNum <= cOutDay;
          }
        }
      }
      return h.checkIn === dayStr || h.date === dayStr;
    });

    const flightMatch = safeFlights.filter(f => {
      if (!f) return false;
      if (f.departureDate) {
        const depParts = String(f.departureDate).split("-");
        if (depParts.length === 3) {
          const depDay = parseInt(depParts[2] || "0", 10);
          const depMonth = parseInt(depParts[1] || "0", 10) - 1;
          if (depMonth === month) {
            return dayNum === depDay;
          }
        }
      }
      return f.date === dayStr;
    });

    return {
      hotelMatch,
      flightMatch,
      hasHotel: hotelMatch.length > 0,
      hasFlight: flightMatch.length > 0
    };
  };

  const totalBookingsCount = (Array.isArray(bookedHotels) ? bookedHotels.length : 0) + (Array.isArray(bookedFlights) ? bookedFlights.length : 0);

  return (
    <div style={{
      width: "100%",
      background: "#FFFFFF",
      borderRadius: compact ? "16px" : "24px",
      padding: compact ? "14px" : "24px",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      boxSizing: "border-box"
    }}>
      {/* Calendar Title & Month Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 10 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FaCalendarAlt color="#2563EB" size={compact ? 13 : 16} />
          <span style={{ fontSize: compact ? 13 : 16, fontWeight: 900, color: "#111827" }}>
            Booked Days Calendar
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1F5F9", padding: "3px 8px", borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2, display: "flex" }}
          ><FaChevronLeft size={10} /></button>
          <span style={{ fontSize: compact ? 11 : 12, fontWeight: 800, color: "#1E293B" }}>{monthName} {year}</span>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2, display: "flex" }}
          ><FaChevronRight size={10} /></button>
        </div>
      </div>

      {/* Legend & Booking Count Indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 10 : 14, fontSize: compact ? 10 : 12, fontWeight: 800 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }} /> 🏨 Hotel ({Array.isArray(bookedHotels) ? bookedHotels.length : 0})
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#DC2626" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626" }} /> ✈️ Flight ({Array.isArray(bookedFlights) ? bookedFlights.length : 0})
          </span>
        </div>
        <span style={{ color: totalBookingsCount > 0 ? "#2563EB" : "#94A3B8", fontSize: compact ? 9 : 11 }}>
          {totalBookingsCount} Total Booking{totalBookingsCount === 1 ? "" : "s"}
        </span>
      </div>

      {/* Calendar Grid Container */}
      <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden", marginBottom: compact ? 10 : 16 }}>
        {/* Days of week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "center", fontWeight: 800, fontSize: compact ? 10 : 11, color: "#64748B", padding: "6px 0" }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => <div key={idx}>{d}</div>)}
        </div>

        {/* Calendar Day Slots */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "#E2E8F0" }}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: "#FAFAFA", minHeight: compact ? 36 : 48 }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const { hotelMatch, flightMatch, hasHotel, hasFlight } = getBookingsForDay(dayNum);
            const isSelected = selectedDay === dayNum;

            // COLOR RULE: Hotel = GREEN (#16A34A / #DCFCE7), Flight = RED (#DC2626 / #FEE2E2)
            const dayBg = isSelected
              ? "#EFF6FF"
              : (hasHotel && hasFlight)
                ? "linear-gradient(135deg, #DCFCE7 50%, #FEE2E2 50%)"
                : hasHotel
                  ? "#DCFCE7"
                  : hasFlight
                    ? "#FEE2E2"
                    : "#FFFFFF";

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                style={{
                  background: dayBg,
                  minHeight: compact ? 36 : 48,
                  padding: compact ? "2px 3px" : "4px 5px",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #2563EB" : "none",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{
                  fontSize: compact ? 10 : 11,
                  fontWeight: (hasHotel || hasFlight || isSelected) ? 900 : 600,
                  color: hasHotel ? "#15803D" : hasFlight ? "#B91C1C" : "#334155"
                }}>
                  {dayNum}
                </div>

                {/* Status Badges */}
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: 2 }}>
                  {hasHotel && (
                    <span style={{
                      fontSize: compact ? 8 : 9, fontWeight: 900,
                      background: "#16A34A", color: "#FFFFFF",
                      padding: "1px 3px", borderRadius: 3, lineHeight: 1
                    }}>
                      🏨 Hotel
                    </span>
                  )}
                  {hasFlight && (
                    <span style={{
                      fontSize: compact ? 8 : 9, fontWeight: 900,
                      background: "#DC2626", color: "#FFFFFF",
                      padding: "1px 3px", borderRadius: 3, lineHeight: 1
                    }}>
                      ✈️ Flight
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Itinerary Box */}
      {selectedDay && (
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, padding: compact ? "10px 12px" : "14px 16px" }}>
          <div style={{ fontSize: compact ? 11 : 13, fontWeight: 900, color: "#0F172A", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <FaClock color="#2563EB" size={11} /> Bookings for {monthName} {selectedDay}, {year}:
          </div>

          {(() => {
            const { hotelMatch, flightMatch, hasHotel, hasFlight } = getBookingsForDay(selectedDay);
            if (!hasHotel && !hasFlight) {
              return (
                <div style={{ fontSize: compact ? 10 : 12, color: "#64748B", lineHeight: 1.4 }}>
                  No active bookings found for this day. Browse Hotels or Flights to add a real booking to your schedule!
                </div>
              );
            }
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Hotel Booking marked in GREEN */}
                {hotelMatch.map((h, idx) => (
                  <div key={idx} style={{
                    background: "#DCFCE7", border: "1px solid #16A34A",
                    padding: "8px 10px", borderRadius: 8, color: "#15803D"
                  }}>
                    <div style={{ fontSize: compact ? 11 : 12, fontWeight: 900 }}>🏨 Hotel Booking: {h.hotelName || h.name}</div>
                    <div style={{ fontSize: compact ? 9 : 11, color: "#166534" }}>Check-In: {h.checkIn || "Confirmed"} • Location: {h.location || "City Center"}</div>
                  </div>
                ))}

                {/* Flight Booking marked in RED */}
                {flightMatch.map((f, idx) => (
                  <div key={idx} style={{
                    background: "#FEE2E2", border: "1px solid #DC2626",
                    padding: "8px 10px", borderRadius: 8, color: "#B91C1C"
                  }}>
                    <div style={{ fontSize: compact ? 11 : 12, fontWeight: 900 }}>✈️ Flight Booking: {f.airline || f.flightName}</div>
                    <div style={{ fontSize: compact ? 9 : 11, color: "#991B1B" }}>Route: {f.from || "Origin"} ➔ {f.to || "Destination"} • Date: {f.departureDate || "Confirmed"}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
