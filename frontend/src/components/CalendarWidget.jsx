import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt, FaMapMarkerAlt, FaStar } from "react-icons/fa";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startPadding = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells = [];
  for (let i = 0; i < startPadding; i++) cells.push({ key: `pad-${i}`, empty: true });
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    cells.push({ key: `day-${day}`, day, date: currentDate, today: toDateKey(currentDate) === toDateKey(today) });
  }
  while (cells.length % 7 !== 0) cells.push({ key: `pad-tail-${cells.length}`, empty: true });
  return cells;
}

/**
 * availabilityData: Record<string, "full" | "holiday">
 */
function CalendarWidget({ onDateSelect, compact = false, availabilityData = {} }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [hoveredKey, setHoveredKey] = useState(null);

  const monthCells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const changeMonth = (offset) =>
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const handleSelect = (date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const selectedLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "short", day: "numeric",
  }).format(selectedDate);

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 24,
      padding: compact ? 14 : 20,
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      color: "#111827",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      {!compact && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: 1.4 }}>
              <FaRegCalendarAlt /> Trip Calendar
            </div>
            <h3 style={{ margin: "10px 0 6px", fontSize: 22, lineHeight: 1.1, color: "#111827", fontWeight: 800 }}>Plan your next escape</h3>
            <p style={{ margin: 0, color: "#6B7280", fontSize: 13, lineHeight: 1.5 }}>
              Pick a date to start exploring stays, flights, and top-rated destinations.
            </p>
          </div>
          <div style={{
            minWidth: 112, padding: "10px 12px", borderRadius: 16,
            background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", textAlign: "right",
          }}>
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Selected</div>
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#111827" }}>{selectedLabel}</div>
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 10 : 16 }}>
        <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}
          style={{ ...iconButtonStyle, width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: compact ? 8 : 12 }}>
          <FaChevronLeft size={compact ? 10 : 12} />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 14 : 18, fontWeight: 800, color: "#111827" }}>{formatMonthLabel(viewDate)}</div>
          {!compact && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Tap a date to start planning</div>}
        </div>
        <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}
          style={{ ...iconButtonStyle, width: compact ? 28 : 38, height: compact ? 28 : 38, borderRadius: compact ? 8 : 12 }}>
          <FaChevronRight size={compact ? 10 : 12} />
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: compact ? 8 : 12, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 5px rgba(239,68,68,0.5)", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>Fully Booked</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.5)", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>Holiday / Open</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ ...calendarGridStyle, gap: compact ? 3 : 6 }}>
        {WEEKDAYS.map((day) => (
          <div key={day} style={{ ...weekdayStyle, fontSize: compact ? 9 : 11 }}>
            {compact ? day.slice(0, 1) : day}
          </div>
        ))}

        {monthCells.map((cell) => {
          if (cell.empty) return <div key={cell.key} style={{ ...emptyCellStyle, minHeight: compact ? 32 : 48 }} />;

          const isSelected = toDateKey(cell.date) === toDateKey(selectedDate);
          const dateKey = toDateKey(cell.date);
          const availability = availabilityData[dateKey];
          const isHovered = hoveredKey === dateKey;

          const dotColor = availability === "full" ? "#ef4444" : availability === "holiday" ? "#22c55e" : null;
          const dotGlow = availability === "full" ? "rgba(239,68,68,0.8)" : availability === "holiday" ? "rgba(34,197,94,0.8)" : null;

          return (
            <button
              key={cell.key} type="button"
              title={
                availability === "full"
                  ? "⛔ Hotels & Flights fully booked on this day"
                  : availability === "holiday"
                  ? "✅ Holiday — great availability"
                  : undefined
              }
              onClick={() => handleSelect(cell.date)}
              onMouseEnter={() => setHoveredKey(dateKey)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                ...dateCellStyle,
                minHeight: compact ? 32 : 48,
                borderRadius: compact ? 8 : 12,
                background: isSelected
                  ? "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)"
                  : availability === "full"
                  ? "rgba(239,68,68,0.08)"
                  : availability === "holiday"
                  ? "rgba(34,197,94,0.08)"
                  : cell.today
                  ? "rgba(37,99,235,0.08)"
                  : isHovered
                  ? "#F0F7FF"
                  : "#F9FAFB",
                borderColor: isSelected
                  ? "transparent"
                  : availability === "full"
                  ? "rgba(239,68,68,0.25)"
                  : availability === "holiday"
                  ? "rgba(34,197,94,0.25)"
                  : cell.today
                  ? "rgba(37,99,235,0.4)"
                  : isHovered
                  ? "rgba(37,99,235,0.2)"
                  : "#E5E7EB",
                color: isSelected ? "white" : cell.today ? "#2563EB" : "#374151",
                boxShadow: isSelected ? "0 4px 14px rgba(37,99,235,0.25)" : "none",
                transform: isHovered && !isSelected ? "scale(1.06)" : "scale(1)",
              }}
            >
              <span style={{ fontSize: compact ? 11 : 14, fontWeight: 700 }}>{cell.day}</span>
              {dotColor && (
                <span style={{
                  width: compact ? 5 : 6, height: compact ? 5 : 6,
                  borderRadius: "50%", background: dotColor,
                  boxShadow: `0 0 ${isHovered ? 8 : 4}px ${dotGlow}`,
                  display: "inline-block", transition: "box-shadow 0.2s", marginTop: compact ? 1 : 2,
                }} />
              )}
              {cell.today && !isSelected && !compact && !dotColor && (
                <span style={{ fontSize: 9, color: "#2563EB", marginTop: 2, fontWeight: 700 }}>Today</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom tips */}
      {!compact && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
          <div style={{
            borderRadius: 16, padding: 14,
            background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#2563EB", marginBottom: 6 }}>
              <FaMapMarkerAlt /> Smart travel tip
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              Mid-week departures often unlock better hotel rates and calmer airport queues.
            </div>
          </div>
          <div style={{
            borderRadius: 16, padding: 14,
            background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#D97706", marginBottom: 6 }}>
              <FaStar /> Trending
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              Weekend getaways are filling up fast — reserve early for the best picks.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const iconButtonStyle = {
  width: 38, height: 38, borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "#F9FAFB",
  color: "#374151",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  transition: "all 0.2s",
};

const calendarGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 6,
};

const weekdayStyle = {
  fontSize: 11, fontWeight: 700, color: "#9CA3AF",
  textTransform: "uppercase", letterSpacing: 0.8,
  textAlign: "center", paddingBottom: 4,
};

const emptyCellStyle = { minHeight: 48 };

const dateCellStyle = {
  minHeight: 48, borderRadius: 12,
  border: "1px solid #E5E7EB",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  gap: 2, cursor: "pointer",
  transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease",
  fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
};

export default CalendarWidget;
