// ── Flight Data & API Service ─────────────────────────────────────────────────
// Uses AviationStack free API for live tracking + local data for booking

const AVIATIONSTACK_KEY = ""; // User can add their free key from aviationstack.com
const FLASK_BASE = "http://127.0.0.1:5000"; // Flask backend proxy base URL

// ── Comprehensive Flight Database ─────────────────────────────────────────────
export const FLIGHTS = [
  // Delhi routes
  { id: "AI-101", type: "flight", airline: "Air India", airlineCode: "AI", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "06:00", arrival: "08:10", duration: "2h 10m", stops: "Non-stop", price: 4299, priceNum: 4299, class: "Economy", aircraft: "Airbus A320neo", flightNo: "AI-101", terminal: { dep: "T3", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "6E-201", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "08:30", arrival: "10:45", duration: "2h 15m", stops: "Non-stop", price: 3599, priceNum: 3599, class: "Economy", aircraft: "Airbus A321neo", flightNo: "6E-201", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "UK-963", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "10:00", arrival: "12:15", duration: "2h 15m", stops: "Non-stop", price: 5899, priceNum: 5899, class: "Premium Economy", aircraft: "Boeing 737-800", flightNo: "UK-963", terminal: { dep: "T3", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "25 kg" }, meal: "Complimentary meal", seatPitch: "34 inches", refundable: true, cancellationFee: "Free", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens" },
  { id: "AI-803", type: "flight", airline: "Air India", airlineCode: "AI", from: "Delhi (DEL)", to: "Bangalore (BLR)", departure: "07:45", arrival: "10:30", duration: "2h 45m", stops: "Non-stop", price: 6799, priceNum: 6799, class: "Business", aircraft: "Airbus A320neo", flightNo: "AI-803", terminal: { dep: "T3", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "25 kg" }, meal: "Full meal service", seatPitch: "38 inches", refundable: true, cancellationFee: "Free", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens" },
  { id: "6E-305", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Delhi (DEL)", to: "Bangalore (BLR)", departure: "14:20", arrival: "17:15", duration: "2h 55m", stops: "Non-stop", price: 4199, priceNum: 4199, class: "Economy", aircraft: "Airbus A320neo", flightNo: "6E-305", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "UK-827", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Delhi (DEL)", to: "Kolkata (CCU)", departure: "09:15", arrival: "11:30", duration: "2h 15m", stops: "Non-stop", price: 5299, priceNum: 5299, class: "Economy", aircraft: "Airbus A320neo", flightNo: "UK-827", terminal: { dep: "T3", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "20 kg" }, meal: "Complimentary snack", seatPitch: "32 inches", refundable: false, cancellationFee: "₹2,000", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "SG-141", type: "flight", airline: "SpiceJet", airlineCode: "SG", from: "Delhi (DEL)", to: "Goa (GOI)", departure: "06:30", arrival: "09:10", duration: "2h 40m", stops: "Non-stop", price: 3899, priceNum: 3899, class: "Economy", aircraft: "Boeing 737 MAX 8", flightNo: "SG-141", terminal: { dep: "T1D", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "29 inches", refundable: false, cancellationFee: "₹3,500", reschedule: "₹2,000", wifi: false, usb: false, entertainment: "None" },
  { id: "AI-505", type: "flight", airline: "Air India", airlineCode: "AI", from: "Delhi (DEL)", to: "Chennai (MAA)", departure: "11:00", arrival: "13:45", duration: "2h 45m", stops: "Non-stop", price: 5599, priceNum: 5599, class: "Economy", aircraft: "Airbus A321neo", flightNo: "AI-505", terminal: { dep: "T3", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },

  // Mumbai routes
  { id: "UK-955", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Mumbai (BOM)", to: "Goa (GOI)", departure: "11:15", arrival: "12:30", duration: "1h 15m", stops: "Non-stop", price: 5499, priceNum: 5499, class: "Business", aircraft: "Boeing 737-800", flightNo: "UK-955", terminal: { dep: "T2", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "30 kg" }, meal: "Full meal service", seatPitch: "38 inches", refundable: true, cancellationFee: "Free", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens" },
  { id: "6E-508", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Mumbai (BOM)", to: "Goa (GOI)", departure: "15:00", arrival: "16:10", duration: "1h 10m", stops: "Non-stop", price: 2899, priceNum: 2899, class: "Economy", aircraft: "Airbus A320", flightNo: "6E-508", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "AI-617", type: "flight", airline: "Air India", airlineCode: "AI", from: "Mumbai (BOM)", to: "Delhi (DEL)", departure: "16:45", arrival: "18:55", duration: "2h 10m", stops: "Non-stop", price: 4599, priceNum: 4599, class: "Economy", aircraft: "Airbus A320neo", flightNo: "AI-617", terminal: { dep: "T2", arr: "T3" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "SG-420", type: "flight", airline: "SpiceJet", airlineCode: "SG", from: "Mumbai (BOM)", to: "Jaipur (JAI)", departure: "07:00", arrival: "08:50", duration: "1h 50m", stops: "Non-stop", price: 3299, priceNum: 3299, class: "Economy", aircraft: "Boeing 737-800", flightNo: "SG-420", terminal: { dep: "T1", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "29 inches", refundable: false, cancellationFee: "₹3,500", reschedule: "₹2,000", wifi: false, usb: false, entertainment: "None" },

  // Bangalore routes
  { id: "6E-702", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Bangalore (BLR)", to: "Hyderabad (HYD)", departure: "09:30", arrival: "10:45", duration: "1h 15m", stops: "Non-stop", price: 2899, priceNum: 2899, class: "Economy", aircraft: "Airbus A320neo", flightNo: "6E-702", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "AI-501", type: "flight", airline: "Air India", airlineCode: "AI", from: "Bangalore (BLR)", to: "Delhi (DEL)", departure: "12:00", arrival: "14:40", duration: "2h 40m", stops: "Non-stop", price: 5899, priceNum: 5899, class: "Economy", aircraft: "Airbus A321neo", flightNo: "AI-501", terminal: { dep: "T1", arr: "T3" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "UK-855", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Bangalore (BLR)", to: "Mumbai (BOM)", departure: "18:30", arrival: "20:15", duration: "1h 45m", stops: "Non-stop", price: 4899, priceNum: 4899, class: "Premium Economy", aircraft: "Boeing 737-800", flightNo: "UK-855", terminal: { dep: "T1", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "25 kg" }, meal: "Complimentary meal", seatPitch: "34 inches", refundable: true, cancellationFee: "Free", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens" },

  // Hyderabad routes
  { id: "6E-442", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Hyderabad (HYD)", to: "Delhi (DEL)", departure: "18:20", arrival: "20:50", duration: "2h 30m", stops: "Non-stop", price: 5099, priceNum: 5099, class: "Economy", aircraft: "Airbus A320neo", flightNo: "6E-442", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "AI-619", type: "flight", airline: "Air India", airlineCode: "AI", from: "Hyderabad (HYD)", to: "Mumbai (BOM)", departure: "05:45", arrival: "07:30", duration: "1h 45m", stops: "Non-stop", price: 3799, priceNum: 3799, class: "Economy", aircraft: "Airbus A320", flightNo: "AI-619", terminal: { dep: "T1", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },

  // Chennai routes
  { id: "SG-312", type: "flight", airline: "SpiceJet", airlineCode: "SG", from: "Chennai (MAA)", to: "Kolkata (CCU)", departure: "14:00", arrival: "16:30", duration: "2h 30m", stops: "1 Stop (VTZ)", price: 3199, priceNum: 3199, class: "Economy", aircraft: "Boeing 737 MAX 8", flightNo: "SG-312", terminal: { dep: "T1", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "29 inches", refundable: false, cancellationFee: "₹3,500", reschedule: "₹2,000", wifi: false, usb: false, entertainment: "None", layover: { airport: "Vizag (VTZ)", duration: "45 min" } },
  { id: "6E-615", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Chennai (MAA)", to: "Bangalore (BLR)", departure: "07:15", arrival: "08:15", duration: "1h 00m", stops: "Non-stop", price: 2499, priceNum: 2499, class: "Economy", aircraft: "ATR 72-600", flightNo: "6E-615", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: false, entertainment: "None" },
  { id: "UK-841", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Chennai (MAA)", to: "Delhi (DEL)", departure: "20:15", arrival: "23:00", duration: "2h 45m", stops: "Non-stop", price: 7299, priceNum: 7299, class: "Business", aircraft: "Airbus A320neo", flightNo: "UK-841", terminal: { dep: "T1", arr: "T3" }, baggage: { cabin: "7 kg", checkin: "30 kg" }, meal: "Full meal service", seatPitch: "38 inches", refundable: true, cancellationFee: "Free", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens" },

  // Kolkata routes
  { id: "AI-774", type: "flight", airline: "Air India", airlineCode: "AI", from: "Kolkata (CCU)", to: "Delhi (DEL)", departure: "10:30", arrival: "13:00", duration: "2h 30m", stops: "Non-stop", price: 5399, priceNum: 5399, class: "Economy", aircraft: "Airbus A321neo", flightNo: "AI-774", terminal: { dep: "T2", arr: "T3" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "6E-870", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Kolkata (CCU)", to: "Mumbai (BOM)", departure: "16:00", arrival: "18:45", duration: "2h 45m", stops: "Non-stop", price: 4799, priceNum: 4799, class: "Economy", aircraft: "Airbus A320neo", flightNo: "6E-870", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },

  // Goa routes
  { id: "6E-911", type: "flight", airline: "IndiGo", airlineCode: "6E", from: "Goa (GOI)", to: "Delhi (DEL)", departure: "13:00", arrival: "15:40", duration: "2h 40m", stops: "Non-stop", price: 4599, priceNum: 4599, class: "Economy", aircraft: "Airbus A320neo", flightNo: "6E-911", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "30 inches", refundable: false, cancellationFee: "₹3,000", reschedule: "₹1,500", wifi: false, usb: true, entertainment: "None" },
  { id: "SG-188", type: "flight", airline: "SpiceJet", airlineCode: "SG", from: "Goa (GOI)", to: "Bangalore (BLR)", departure: "17:00", arrival: "18:15", duration: "1h 15m", stops: "Non-stop", price: 2699, priceNum: 2699, class: "Economy", aircraft: "Boeing 737-800", flightNo: "SG-188", terminal: { dep: "T1", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Buy on board", seatPitch: "29 inches", refundable: false, cancellationFee: "₹3,500", reschedule: "₹2,000", wifi: false, usb: false, entertainment: "None" },

  // Jaipur routes
  { id: "AI-462", type: "flight", airline: "Air India", airlineCode: "AI", from: "Jaipur (JAI)", to: "Mumbai (BOM)", departure: "08:00", arrival: "09:55", duration: "1h 55m", stops: "Non-stop", price: 4199, priceNum: 4199, class: "Economy", aircraft: "Airbus A320", flightNo: "AI-462", terminal: { dep: "T2", arr: "T2" }, baggage: { cabin: "7 kg", checkin: "15 kg" }, meal: "Snack included", seatPitch: "31 inches", refundable: false, cancellationFee: "₹2,500", reschedule: "₹1,000", wifi: false, usb: true, entertainment: "Shared screens" },
  { id: "UK-717", type: "flight", airline: "Vistara", airlineCode: "UK", from: "Jaipur (JAI)", to: "Bangalore (BLR)", departure: "11:30", arrival: "14:10", duration: "2h 40m", stops: "1 Stop (BOM)", price: 6399, priceNum: 6399, class: "Premium Economy", aircraft: "Boeing 737-800", flightNo: "UK-717", terminal: { dep: "T2", arr: "T1" }, baggage: { cabin: "7 kg", checkin: "25 kg" }, meal: "Complimentary meal", seatPitch: "34 inches", refundable: true, cancellationFee: "₹1,500", reschedule: "Free", wifi: true, usb: true, entertainment: "Personal screens", layover: { airport: "Mumbai (BOM)", duration: "1h 10min" } },
];

// ── Airline Colors & Metadata ─────────────────────────────────────────────────
export const AIRLINE_META = {
  "Air India": { color: "#E2393D", bg: "rgba(226,57,61,0.12)", icon: "✈️", logo: "AI", officialWebsite: "https://www.airindia.com", bookingUrl: "https://www.airindia.com" },
  "IndiGo":    { color: "#1A237E", bg: "rgba(26,35,126,0.15)", icon: "🛫", logo: "6E", officialWebsite: "https://www.goindigo.in", bookingUrl: "https://www.goindigo.in" },
  "Vistara":   { color: "#4A154B", bg: "rgba(74,21,75,0.15)",  icon: "🌟", logo: "UK", officialWebsite: "https://www.airvistara.com", bookingUrl: "https://www.airvistara.com" },
  "SpiceJet":  { color: "#FF6F00", bg: "rgba(255,111,0,0.12)", icon: "🔥", logo: "SG", officialWebsite: "https://www.spicejet.com", bookingUrl: "https://www.spicejet.com" },
  "Akasa Air": { color: "#FF5722", bg: "rgba(255,87,34,0.12)", icon: "✈️", logo: "QP", officialWebsite: "https://www.akasaair.com", bookingUrl: "https://www.akasaair.com" },
  "Air India Express": { color: "#D32F2F", bg: "rgba(211,47,47,0.12)", icon: "✈️", logo: "IX", officialWebsite: "https://www.airindiaexpress.in", bookingUrl: "https://www.airindiaexpress.in" },
  "Emirates": { color: "#D71921", bg: "rgba(215,25,33,0.12)", icon: "✈️", logo: "EK", officialWebsite: "https://www.emirates.com", bookingUrl: "https://www.emirates.com" },
  "Qatar Airways": { color: "#5C0632", bg: "rgba(92,6,50,0.12)", icon: "✈️", logo: "QR", officialWebsite: "https://www.qatarairways.com", bookingUrl: "https://www.qatarairways.com" },
  "Singapore Airlines": { color: "#002B49", bg: "rgba(0,43,73,0.12)", icon: "✈️", logo: "SQ", officialWebsite: "https://www.singaporeair.com", bookingUrl: "https://www.singaporeair.com" }
};

/**
 * Returns the official flight booking URL for a given flight or airline name.
 * Falls back to Google Flights if no specific airline match is found.
 */
export function getOfficialBookingUrl(flight) {
  if (!flight) return "https://www.google.com/travel/flights";
  const name = flight.airline || flight.flightName || "";
  
  if (AIRLINE_META[name] && AIRLINE_META[name].bookingUrl) {
    return AIRLINE_META[name].bookingUrl;
  }
  
  const lower = name.toLowerCase();
  if (lower.includes("indigo")) return "https://www.goindigo.in";
  if (lower.includes("air india express")) return "https://www.airindiaexpress.in";
  if (lower.includes("air india")) return "https://www.airindia.com";
  if (lower.includes("vistara")) return "https://www.airvistara.com";
  if (lower.includes("spicejet")) return "https://www.spicejet.com";
  if (lower.includes("akasa")) return "https://www.akasaair.com";
  if (lower.includes("emirates")) return "https://www.emirates.com";
  if (lower.includes("qatar")) return "https://www.qatarairways.com";
  if (lower.includes("singapore")) return "https://www.singaporeair.com";
  if (lower.includes("lufthansa")) return "https://www.lufthansa.com";
  if (lower.includes("etihad")) return "https://www.etihad.com";
  if (lower.includes("flydubai")) return "https://www.flydubai.com";
  
  return "https://www.google.com/travel/flights";
}

// ── AviationStack Live API ────────────────────────────────────────────────────
export async function fetchLiveFlights(params = {}) {
  // If no API key configured, use simulated data
  if (!AVIATIONSTACK_KEY) {
    return simulateLiveFlights(params);
  }

  try {
    const query = new URLSearchParams({
      access_key: AVIATIONSTACK_KEY,
      ...(params.dep_iata && { dep_iata: params.dep_iata }),
      ...(params.arr_iata && { arr_iata: params.arr_iata }),
      ...(params.airline_iata && { airline_iata: params.airline_iata }),
      ...(params.flight_iata && { flight_iata: params.flight_iata }),
      limit: params.limit || 20,
    });

    const res = await fetch(`http://api.aviationstack.com/v1/flights?${query}`);
    const data = await res.json();

    if (data.error) {
      console.warn("AviationStack error, using simulated data:", data.error);
      return simulateLiveFlights(params);
    }

    return (data.data || []).map(f => ({
      flightNo: f.flight?.iata || "—",
      airline: f.airline?.name || "Unknown",
      status: f.flight_status || "unknown",
      departure: {
        airport: f.departure?.airport || "—",
        iata: f.departure?.iata || "—",
        terminal: f.departure?.terminal || "—",
        gate: f.departure?.gate || "—",
        scheduled: f.departure?.scheduled || "—",
        estimated: f.departure?.estimated || "—",
        actual: f.departure?.actual || null,
        delay: f.departure?.delay || 0,
      },
      arrival: {
        airport: f.arrival?.airport || "—",
        iata: f.arrival?.iata || "—",
        terminal: f.arrival?.terminal || "—",
        gate: f.arrival?.gate || "—",
        scheduled: f.arrival?.scheduled || "—",
        estimated: f.arrival?.estimated || "—",
        actual: f.arrival?.actual || null,
        delay: f.arrival?.delay || 0,
      },
    }));
  } catch (err) {
    console.warn("API fetch failed, using simulated data:", err.message);
    return simulateLiveFlights(params);
  }
}

// ── Simulated Live Flight Data ────────────────────────────────────────────────
function simulateLiveFlights(params = {}) {
  const statuses = ["scheduled", "active", "landed", "delayed"];
  const delays = [0, 0, 0, 0, 0, 5, 10, 15, 25, 45];

  let flights = FLIGHTS;

  if (params.dep_iata) {
    flights = flights.filter(f => f.from.includes(params.dep_iata));
  }
  if (params.arr_iata) {
    flights = flights.filter(f => f.to.includes(params.arr_iata));
  }

  return flights.map(f => {
    const delay = delays[Math.floor(Math.random() * delays.length)];
    const status = delay > 20 ? "delayed" : statuses[Math.floor(Math.random() * statuses.length)];

    return {
      flightNo: f.flightNo,
      airline: f.airline,
      status,
      departure: {
        airport: f.from.split(" (")[0],
        iata: f.from.match(/\((\w+)\)/)?.[1] || "",
        terminal: f.terminal.dep,
        gate: `G${Math.floor(Math.random() * 30) + 1}`,
        scheduled: f.departure,
        estimated: delay > 0 ? addMinutes(f.departure, delay) : f.departure,
        actual: status === "landed" || status === "active" ? f.departure : null,
        delay,
      },
      arrival: {
        airport: f.to.split(" (")[0],
        iata: f.to.match(/\((\w+)\)/)?.[1] || "",
        terminal: f.terminal.arr,
        gate: `G${Math.floor(Math.random() * 20) + 1}`,
        scheduled: f.arrival,
        estimated: delay > 0 ? addMinutes(f.arrival, delay) : f.arrival,
        actual: status === "landed" ? f.arrival : null,
        delay,
      },
    };
  });
}

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ── Popular Airports ──────────────────────────────────────────────────────────
export const AIRPORTS = [
  { code: "DEL", name: "Indira Gandhi International", city: "New Delhi" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai" },
  { code: "BLR", name: "Kempegowda International", city: "Bangalore" },
  { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad" },
  { code: "MAA", name: "Chennai International", city: "Chennai" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata" },
  { code: "GOI", name: "Manohar International", city: "Goa" },
  { code: "JAI", name: "Jaipur International", city: "Jaipur" },
  { code: "COK", name: "Cochin International", city: "Kochi" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel", city: "Ahmedabad" },
];

// ── Flask-Proxied Flight Search ────────────────────────────────────────────────
/**
 * Search flights via Flask proxy → AviationStack.
 * Falls back to filtering static FLIGHTS array on any error.
 *
 * @param {Object} params
 * @param {string} [params.from]       Free-text from field (city or IATA)
 * @param {string} [params.to]         Free-text to field (city or IATA)
 * @param {string} [params.dep_iata]   IATA departure code (overrides from)
 * @param {string} [params.arr_iata]   IATA arrival code (overrides to)
 * @param {string} [params.date]       Departure date YYYY-MM-DD (informational)
 * @param {number} [params.limit=20]   Max results
 * @returns {Promise<{results: Array, source: string}>}
 */
export async function searchFlights(params = {}) {
  // Resolve IATA codes from free-text inputs
  const depIata = params.dep_iata || _resolveIata(params.from || "");
  const arrIata = params.arr_iata || _resolveIata(params.to || "");

  try {
    const qs = new URLSearchParams();
    if (depIata) qs.set("dep_iata", depIata);
    if (arrIata) qs.set("arr_iata", arrIata);
    if (params.limit) qs.set("limit", params.limit);

    const resp = await fetch(`${FLASK_BASE}/api/flights/search?${qs}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const body = await resp.json();

    if (body.success && body.data) {
      // Merge API results with static FLIGHTS so booking modals still work
      const merged = _mergeWithStatic(body.data, params);
      return { results: merged, source: body.source };
    }
    throw new Error("API returned no data");
  } catch (err) {
    console.warn("searchFlights fell back to static data:", err.message);
    // Fallback: filter static FLIGHTS
    return { results: _filterStatic(params), source: "static" };
  }
}

/**
 * Get live status for a specific flight number via Flask proxy.
 * Falls back to a simulated status object on error.
 *
 * @param {string} flightIata  e.g. "AI101" or "AI-101"
 * @returns {Promise<{data: Object|null, source: string}>}
 */
export async function getFlightStatus(flightIata) {
  const normalized = flightIata.replace("-", "").toUpperCase();
  try {
    const resp = await fetch(
      `${FLASK_BASE}/api/flights/status?flight_iata=${normalized}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const body = await resp.json();
    if (body.success) return { data: body.data, source: body.source };
    throw new Error("API error");
  } catch (err) {
    console.warn("getFlightStatus fell back to simulated:", err.message);
    // Build a plausible status from static data
    const match = FLIGHTS.find(
      (f) => f.flightNo.replace("-", "") === normalized
    );
    if (!match) return { data: null, source: "static" };
    return {
      data: {
        flightNo: match.flightNo,
        airline: match.airline,
        from: match.from.split(" (")[0],
        fromIata: (match.from.match(/\((\w+)\)/) || [])[1] || "—",
        to: match.to.split(" (")[0],
        toIata: (match.to.match(/\((\w+)\)/) || [])[1] || "—",
        departure: match.departure,
        arrival: match.arrival,
        terminal: match.terminal,
        gate: { dep: "—", arr: "—" },
        status: "scheduled",
        delay: 0,
        scheduledDep: match.departure,
        scheduledArr: match.arrival,
        estimatedDep: match.departure,
        estimatedArr: match.arrival,
      },
      source: "static",
    };
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Resolve a city/airport name to IATA code using AIRPORTS list. */
function _resolveIata(text) {
  if (!text) return "";
  const upper = text.toUpperCase().trim();
  // Direct 3-letter code
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  // Match in AIRPORTS
  const match = AIRPORTS.find(
    (a) =>
      a.code === upper ||
      a.city.toLowerCase().includes(text.toLowerCase()) ||
      a.name.toLowerCase().includes(text.toLowerCase())
  );
  return match ? match.code : "";
}

/** Filter the static FLIGHTS array matching free-text from/to. */
function _filterStatic(params) {
  const from = (params.from || "").toLowerCase();
  const to = (params.to || "").toLowerCase();
  const depIata = (params.dep_iata || "").toUpperCase();
  const arrIata = (params.arr_iata || "").toUpperCase();

  return FLIGHTS.filter((f) => {
    const matchFrom = depIata
      ? f.from.includes(depIata)
      : !from || f.from.toLowerCase().includes(from);
    const matchTo = arrIata
      ? f.to.includes(arrIata)
      : !to || f.to.toLowerCase().includes(to);
    return matchFrom && matchTo;
  });
}

/**
 * Merge live API results with static FLIGHTS so FlightCard / BookingModal
 * props (price, class, baggage, meal, etc.) are always populated.
 * API data takes precedence for status/gate/terminal fields.
 */
function _mergeWithStatic(apiFlights, params) {
  const staticFiltered = _filterStatic(params);

  // If API returned nothing meaningful, return static
  if (!apiFlights || apiFlights.length === 0) return staticFiltered;

  // Build lookup: flightNo → static flight
  const staticMap = {};
  staticFiltered.forEach((f) => {
    staticMap[f.flightNo.replace("-", "").toUpperCase()] = f;
  });

  // Enrich API flights with static booking data where available
  const enriched = apiFlights.map((af) => {
    const key = (af.flightNo || "").replace("-", "").toUpperCase();
    const staticFlight = staticMap[key];
    if (staticFlight) {
      return {
        ...staticFlight,           // full booking-ready static data
        // Override with live data
        terminal: af.terminal || staticFlight.terminal,
        status: af.status || "scheduled",
        delay: af.delay || 0,
        gate: af.gate || { dep: "—", arr: "—" },
        scheduledDep: af.scheduledDep,
        scheduledArr: af.scheduledArr,
        estimatedDep: af.estimatedDep,
        estimatedArr: af.estimatedArr,
        _liveData: true,
      };
    }
    // API flight not in static — return as-is (may lack price etc.)
    return {
      ...af,
      type: "flight",
      price: af.price || 0,
      priceNum: af.priceNum || 0,
      class: af.class || "Economy",
      baggage: af.baggage || { cabin: "7 kg", checkin: "15 kg" },
      meal: af.meal || "—",
      seatPitch: af.seatPitch || "—",
      refundable: af.refundable || false,
      cancellationFee: af.cancellationFee || "—",
      reschedule: af.reschedule || "—",
      wifi: af.wifi || false,
      usb: af.usb || false,
      entertainment: af.entertainment || "—",
      _liveData: true,
    };
  });

  // Append any static flights not present in API results
  const apiNos = new Set(
    enriched.map((f) => (f.flightNo || "").replace("-", "").toUpperCase())
  );
  const staticOnly = staticFiltered.filter(
    (f) => !apiNos.has(f.flightNo.replace("-", "").toUpperCase())
  );

  return [...enriched, ...staticOnly];
}

