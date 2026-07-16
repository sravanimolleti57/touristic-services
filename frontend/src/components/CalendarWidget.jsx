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

	for (let i = 0; i < startPadding; i += 1) {
		cells.push({ key: `pad-${i}`, empty: true });
	}

	for (let day = 1; day <= daysInMonth; day += 1) {
		const currentDate = new Date(year, month, day);
		cells.push({
			key: `day-${day}`,
			day,
			date: currentDate,
			today: toDateKey(currentDate) === toDateKey(today),
		});
	}

	while (cells.length % 7 !== 0) {
		cells.push({ key: `pad-tail-${cells.length}`, empty: true });
	}

	return cells;
}

function CalendarWidget({ onDateSelect, compact = false }) {
	const [viewDate, setViewDate] = useState(() => new Date());
	const [selectedDate, setSelectedDate] = useState(() => new Date());

	const monthCells = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

	const changeMonth = (offset) => {
		setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
	};

	const handleSelect = (date) => {
		setSelectedDate(date);
		onDateSelect?.(date);
	};

	const selectedLabel = new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
	}).format(selectedDate);

	return (
		<div
			style={{
				background: "linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.98) 100%)",
				border: "1px solid rgba(148,163,184,0.22)",
				borderRadius: 24,
				padding: compact ? 14 : 20,
				boxShadow: "0 24px 70px rgba(2, 6, 23, 0.45)",
				color: "white",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: compact ? 12 : 18 }}>
				<div>
					<div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: 1.4 }}>
						<FaRegCalendarAlt /> Trip Calendar
					</div>
					<h3 style={{ margin: "10px 0 6px", fontSize: compact ? 20 : 24, lineHeight: 1.1 }}>Plan your next escape</h3>
					<p style={{ margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
						Pick a date to start exploring stays, flights, and top-rated destinations.
					</p>
				</div>

				<div
					style={{
						minWidth: 112,
						padding: "10px 12px",
						borderRadius: 16,
						background: "rgba(59,130,246,0.14)",
						border: "1px solid rgba(59,130,246,0.2)",
						textAlign: "right",
					}}
				>
					<div style={{ fontSize: 11, color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Selected</div>
					<div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "white" }}>{selectedLabel}</div>
				</div>
			</div>

			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: compact ? 12 : 16 }}>
				<button
					type="button"
					aria-label="Previous month"
					onClick={() => changeMonth(-1)}
					style={iconButtonStyle}
				>
					<FaChevronLeft />
				</button>

				<div style={{ textAlign: "center" }}>
					<div style={{ fontSize: compact ? 18 : 20, fontWeight: 800 }}>{formatMonthLabel(viewDate)}</div>
					<div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Tap a date to start planning</div>
				</div>

				<button
					type="button"
					aria-label="Next month"
					onClick={() => changeMonth(1)}
					style={iconButtonStyle}
				>
					<FaChevronRight />
				</button>
			</div>

			<div style={{ ...calendarGridStyle, gap: compact ? 6 : 8 }}>
				{WEEKDAYS.map((day) => (
					<div key={day} style={weekdayStyle}>
						{day}
					</div>
				))}

				{monthCells.map((cell) => {
					if (cell.empty) {
						return <div key={cell.key} style={emptyCellStyle} />;
					}

					const isSelected = toDateKey(cell.date) === toDateKey(selectedDate);

					return (
						<button
							key={cell.key}
							type="button"
							onClick={() => handleSelect(cell.date)}
							style={{
								...dateCellStyle,
								minHeight: compact ? 44 : 54,
								borderRadius: compact ? 14 : 16,
								background: isSelected
									? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
									: cell.today
										? "rgba(59,130,246,0.14)"
										: "rgba(15,23,42,0.55)",
								borderColor: isSelected ? "transparent" : cell.today ? "rgba(59,130,246,0.5)" : "rgba(148,163,184,0.16)",
								color: isSelected ? "white" : "#e2e8f0",
								boxShadow: isSelected ? "0 10px 28px rgba(59,130,246,0.35)" : "none",
							}}
						>
							<span style={{ fontSize: 15, fontWeight: 700 }}>{cell.day}</span>
							{cell.today && !isSelected && (
								<span style={{ fontSize: 10, color: "#93c5fd", marginTop: 4 }}>Today</span>
							)}
						</button>
					);
				})}
			</div>

			{!compact && (
				<div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
				<div
					style={{
						borderRadius: 18,
						padding: 16,
						background: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(139,92,246,0.12))",
						border: "1px solid rgba(148,163,184,0.15)",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#dbeafe" }}>
						<FaMapMarkerAlt /> Smart travel tip
					</div>
					<div style={{ marginTop: 8, fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
						Mid-week departures often unlock better hotel rates and calmer airport queues.
					</div>
				</div>

				<div
					style={{
						borderRadius: 18,
						padding: 16,
						background: "rgba(15,23,42,0.62)",
						border: "1px solid rgba(148,163,184,0.15)",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#fde68a" }}>
						<FaStar /> Trending
					</div>
					<div style={{ marginTop: 8, fontSize: 13, color: "#cbd5e1", lineHeight: 1.6 }}>
						Weekend getaways are filling up fast — reserve early for the best picks.
					</div>
				</div>
			</div>
			)}
		</div>
	);
}

const iconButtonStyle = {
	width: 42,
	height: 42,
	borderRadius: 14,
	border: "1px solid rgba(148,163,184,0.18)",
	background: "rgba(15,23,42,0.62)",
	color: "white",
	cursor: "pointer",
	display: "grid",
	placeItems: "center",
};

const calendarGridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
	gap: 8,
};

const weekdayStyle = {
	fontSize: 11,
	fontWeight: 700,
	color: "#94a3b8",
	textTransform: "uppercase",
	letterSpacing: 0.8,
	textAlign: "center",
	paddingBottom: 4,
};

const emptyCellStyle = {
	minHeight: 54,
};

const dateCellStyle = {
	minHeight: 54,
	borderRadius: 16,
	border: "1px solid transparent",
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: 3,
	cursor: "pointer",
	transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
};

export default CalendarWidget;
