import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import countriesData from "world-atlas/countries-110m.json";
import {
  FaGlobe, FaSearch, FaPlus, FaMinus, FaRedo, FaMapMarkerAlt,
  FaArrowRight, FaTimes, FaStar, FaBuilding, FaCompass,
  FaCheckCircle, FaSync, FaExclamationTriangle
} from "react-icons/fa";

const API_BASE = "http://127.0.0.1:5000";

// ISO Numeric to Country Metadata Dictionary
const ISO_COUNTRY_MAP = {
  "356": { name: "India", code: "IN", flag: "🇮🇳", lat: 20.5937, lng: 78.9629, aliases: ["india"] },
  "462": { name: "Maldives", code: "MV", flag: "🇲🇻", lat: 3.2028, lng: 73.2207, aliases: ["maldives"] },
  "392": { name: "Japan", code: "JP", flag: "🇯🇵", lat: 36.2048, lng: 138.2529, aliases: ["japan", "tokyo"] },
  "250": { name: "France", code: "FR", flag: "🇫🇷", lat: 46.2276, lng: 2.2137, aliases: ["france", "paris"] },
  "360": { name: "Indonesia", code: "ID", flag: "🇮🇩", lat: -0.7893, lng: 113.9213, aliases: ["indonesia", "bali"] },
  "784": { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", lat: 23.4241, lng: 53.8478, aliases: ["uae", "united arab emirates", "dubai", "abu dhabi"] },
  "300": { name: "Greece", code: "GR", flag: "🇬🇷", lat: 39.0742, lng: 21.8243, aliases: ["greece", "santorini", "athens"] },
  "756": { name: "Switzerland", code: "CH", flag: "🇨🇭", lat: 46.8182, lng: 8.2275, aliases: ["switzerland", "swiss alps", "zurich", "geneva"] },
  "702": { name: "Singapore", code: "SG", flag: "🇸🇬", lat: 1.3521, lng: 103.8198, aliases: ["singapore"] },
  "380": { name: "Italy", code: "IT", flag: "🇮🇹", lat: 41.8719, lng: 12.5674, aliases: ["italy", "rome", "venice", "florence", "milan"] },
  "840": { name: "United States", code: "US", flag: "🇺🇸", lat: 37.0902, lng: -95.7129, aliases: ["usa", "united states", "america", "new york", "california"] },
  "124": { name: "Canada", code: "CA", flag: "🇨🇦", lat: 56.1304, lng: -106.3468, aliases: ["canada", "toronto", "vancouver"] },
  "826": { name: "United Kingdom", code: "GB", flag: "🇬🇧", lat: 55.3781, lng: -3.4360, aliases: ["uk", "united kingdom", "britain", "england", "london"] },
  "036": { name: "Australia", code: "AU", flag: "🇦🇺", lat: -25.2744, lng: 133.7751, aliases: ["australia", "sydney", "melbourne"] },
  "764": { name: "Thailand", code: "TH", flag: "🇹🇭", lat: 15.8700, lng: 100.9925, aliases: ["thailand", "bangkok", "phuket"] },
  "818": { name: "Egypt", code: "EG", flag: "🇪🇬", lat: 26.8206, lng: 30.8025, aliases: ["egypt", "cairo"] },
  "710": { name: "South Africa", code: "ZA", flag: "🇿🇦", lat: -30.5595, lng: 22.9375, aliases: ["south africa", "cape town"] },
  "076": { name: "Brazil", code: "BR", flag: "🇧🇷", lat: -14.2350, lng: -51.9253, aliases: ["brazil", "rio de janeiro", "sao paulo"] },
  "724": { name: "Spain", code: "ES", flag: "🇪🇸", lat: 40.4637, lng: -3.7492, aliases: ["spain", "barcelona", "madrid"] },
  "276": { name: "Germany", code: "DE", flag: "🇩🇪", lat: 51.1657, lng: 10.4515, aliases: ["germany", "berlin", "munich"] },
  "792": { name: "Turkey", code: "TR", flag: "🇹🇷", lat: 38.9637, lng: 35.2433, aliases: ["turkey", "istanbul", "cappadocia"] },
  "704": { name: "Vietnam", code: "VN", flag: "🇻🇳", lat: 14.0583, lng: 108.2772, aliases: ["vietnam", "hanoi", "da nang"] },
  "458": { name: "Malaysia", code: "MY", flag: "🇲🇾", lat: 4.2105, lng: 101.9758, aliases: ["malaysia", "kuala lumpur"] },
  "554": { name: "New Zealand", code: "NZ", flag: "🇳🇿", lat: -40.9006, lng: 174.8860, aliases: ["new zealand", "auckland", "queenstown"] },
  "484": { name: "Mexico", code: "MX", flag: "🇲🇽", lat: 23.6345, lng: -102.5528, aliases: ["mexico", "cancun", "mexico city"] },
  "578": { name: "Norway", code: "NO", flag: "🇳🇴", lat: 60.4720, lng: 8.4689, aliases: ["norway", "oslo"] },
  "528": { name: "Netherlands", code: "NL", flag: "🇳🇱", lat: 52.1326, lng: 5.2913, aliases: ["netherlands", "amsterdam"] },
  "156": { name: "China", code: "CN", flag: "🇨🇳", lat: 35.8617, lng: 104.1954, aliases: ["china", "beijing", "shanghai"] },
  "643": { name: "Russia", code: "RU", flag: "🇷🇺", lat: 61.5240, lng: 105.3188, aliases: ["russia", "moscow"] },
  "032": { name: "Argentina", code: "AR", flag: "🇦🇷", lat: -38.4161, lng: -63.6167, aliases: ["argentina", "buenos aires"] },
  "682": { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", lat: 23.8859, lng: 45.0792, aliases: ["saudi arabia", "riyadh"] },
  "410": { name: "South Korea", code: "KR", flag: "🇰🇷", lat: 35.9078, lng: 127.7669, aliases: ["south korea", "korea", "seoul"] },
  "608": { name: "Philippines", code: "PH", flag: "🇵🇭", lat: 12.8797, lng: 121.7740, aliases: ["philippines", "manila", "boracay"] },
  "620": { name: "Portugal", code: "PT", flag: "🇵🇹", lat: 39.3999, lng: -8.2245, aliases: ["portugal", "lisbon", "porto"] },
  "040": { name: "Austria", code: "AT", flag: "🇦🇹", lat: 47.5162, lng: 14.5501, aliases: ["austria", "vienna"] },
  "752": { name: "Sweden", code: "SE", flag: "🇸🇪", lat: 60.1282, lng: 18.6435, aliases: ["sweden", "stockholm"] },
  "208": { name: "Denmark", code: "DK", flag: "🇩🇰", lat: 56.2639, lng: 9.5018, aliases: ["denmark", "copenhagen"] },
  "246": { name: "Finland", code: "FI", flag: "🇫🇮", lat: 61.9241, lng: 25.7482, aliases: ["finland", "helsinki"] },
  "372": { name: "Ireland", code: "IE", flag: "🇮🇪", lat: 53.1424, lng: -7.6921, aliases: ["ireland", "dublin"] },
  "056": { name: "Belgium", code: "BE", flag: "🇧🇪", lat: 50.5039, lng: 4.4699, aliases: ["belgium", "brussels"] },
  "504": { name: "Morocco", code: "MA", flag: "🇲🇦", lat: 31.7917, lng: -7.0926, aliases: ["morocco", "marrakech"] },
  "404": { name: "Kenya", code: "KE", flag: "🇰🇪", lat: -0.0236, lng: 37.9062, aliases: ["kenya", "nairobi"] },
  "604": { name: "Peru", code: "PE", flag: "🇵🇪", lat: -9.1899, lng: -75.0152, aliases: ["peru", "machu picchu", "lima"] },
  "152": { name: "Chile", code: "CL", flag: "🇨🇱", lat: -35.6751, lng: -71.5430, aliases: ["chile", "santiago"] },
  "170": { name: "Colombia", code: "CO", flag: "🇨🇴", lat: 4.5709, lng: -74.2973, aliases: ["colombia", "bogota"] },
  "191": { name: "Croatia", code: "HR", flag: "🇭🇷", lat: 45.1000, lng: 15.2000, aliases: ["croatia", "dubrovnik"] },
  "376": { name: "Israel", code: "IL", flag: "🇮🇱", lat: 31.0461, lng: 34.8516, aliases: ["israel", "tel aviv", "jerusalem"] },
  "400": { name: "Jordan", code: "JO", flag: "🇯🇴", lat: 30.5852, lng: 36.2384, aliases: ["jordan", "petra", "amman"] },
  "512": { name: "Oman", code: "OM", flag: "🇴🇲", lat: 21.4735, lng: 55.9754, aliases: ["oman", "muscat"] },
  "634": { name: "Qatar", code: "QA", flag: "🇶🇦", lat: 25.3548, lng: 51.1839, aliases: ["qatar", "doha"] },
  "144": { name: "Sri Lanka", code: "LK", flag: "🇱🇰", lat: 7.8731, lng: 80.7718, aliases: ["sri lanka", "colombo"] },
  "524": { name: "Nepal", code: "NP", flag: "🇳🇵", lat: 28.3949, lng: 84.1240, aliases: ["nepal", "kathmandu"] },
  "352": { name: "Iceland", code: "IS", flag: "🇮🇸", lat: 64.9631, lng: -19.0208, aliases: ["iceland", "reykjavik"] },
  "348": { name: "Hungary", code: "HU", flag: "🇭🇺", lat: 47.1625, lng: 19.5033, aliases: ["hungary", "budapest"] },
  "203": { name: "Czech Republic", code: "CZ", flag: "🇨🇿", lat: 49.8175, lng: 15.4730, aliases: ["czech republic", "prague"] },
  "616": { name: "Poland", code: "PL", flag: "🇵🇱", lat: 51.9194, lng: 19.1451, aliases: ["poland", "warsaw", "krakow"] }
};

// General Name to Info matcher for destinations
function matchCountryFromDestination(dest) {
  const text = `${dest.country || ""} ${dest.location || ""} ${dest.name || ""}`.toLowerCase();
  
  for (const [id, meta] of Object.entries(ISO_COUNTRY_MAP)) {
    for (const alias of meta.aliases) {
      if (text.includes(alias)) {
        return { isoId: id, ...meta };
      }
    }
  }

  const directName = (dest.country || dest.name || "Global").trim();
  return {
    isoId: "unknown",
    name: directName,
    code: directName.slice(0, 2).toUpperCase(),
    flag: "🌍",
    lat: dest.latitude || 20.0,
    lng: dest.longitude || 0.0
  };
}

export default function InteractiveWorldMap() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map Controls State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const mapContainerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const lastTouchDistRef = useRef(null);

  // Natural Earth 1 Projection Setup (1000x500 standard responsive canvas)
  const projection = useMemo(() => {
    return geoNaturalEarth1()
      .scale(160)
      .translate([500, 255]);
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Extract all world countries as standard GeoJSON features from TopoJSON
  const worldFeatures = useMemo(() => {
    try {
      const geojson = feature(countriesData, countriesData.objects.countries);
      return geojson.features || [];
    } catch (e) {
      console.error("Failed to load TopoJSON world atlas:", e);
      return [];
    }
  }, []);

  // Graticule 10-degree grid lines
  const graticuleLinesPath = useMemo(() => {
    const graticule = geoGraticule10();
    return pathGenerator(graticule);
  }, [pathGenerator]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/destinations?status=Active`);
      setDestinations(res.data || []);
    } catch (err) {
      console.error("Map destinations fetch error:", err);
      setError("Unable to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group active database destinations by Country and calculate exact projected [x, y] coordinates
  const countryMarkers = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];

    const grouped = {};

    destinations.forEach(d => {
      if (d.status === "Inactive" || d.status === "Disabled") return;

      const meta = matchCountryFromDestination(d);
      const key = meta.name.toLowerCase();

      if (!grouped[key]) {
        // Project geographic coordinates to SVG [x, y]
        const projected = projection([meta.lng, meta.lat]) || [500, 250];
        grouped[key] = {
          key,
          isoId: meta.isoId,
          country: meta.name,
          countryCode: meta.code,
          flag: meta.flag,
          lat: meta.lat,
          lng: meta.lng,
          svgX: projected[0],
          svgY: projected[1],
          destinations: []
        };
      }

      grouped[key].destinations.push(d);
    });

    return Object.values(grouped).filter(c => c.destinations.length > 0);
  }, [destinations, projection]);

  // Lookup map for fast ISO ID to destination country data matching
  const isoMarkerMap = useMemo(() => {
    const map = {};
    countryMarkers.forEach(c => {
      if (c.isoId && c.isoId !== "unknown") {
        map[c.isoId] = c;
      }
    });
    return map;
  }, [countryMarkers]);

  // Search filter suggestions
  const filteredSearchList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    countryMarkers.forEach(c => {
      if (c.country.toLowerCase().includes(q)) {
        results.push({ type: "country", title: `${c.flag} ${c.country}`, data: c });
      }
      c.destinations.forEach(d => {
        if ((d.name || "").toLowerCase().includes(q) || (d.location || "").toLowerCase().includes(q)) {
          results.push({ type: "destination", title: `📍 ${d.name} (${c.country})`, data: d, country: c });
        }
      });
    });

    return results.slice(0, 6);
  }, [countryMarkers, searchQuery]);

  // Dynamic pan bounds calculation based on zoom level
  const clampPan = (x, y, zoom) => {
    const maxX = Math.max(0, (zoom - 1) * 380 + 120);
    const maxY = Math.max(0, (zoom - 1) * 220 + 80);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const next = Math.min(prev + 0.4, 4.0);
      setPanOffset(p => clampPan(p.x, p.y, next));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(prev - 0.4, 1.0);
      if (next <= 1.0) {
        setPanOffset({ x: 0, y: 0 });
      } else {
        setPanOffset(p => clampPan(p.x, p.y, next));
      }
      return next;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCountry(null);
    setSearchQuery("");
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.hypot(dx, dy) > 5) {
      hasDraggedRef.current = true;
    }

    const nextX = panStartRef.current.x + (dx / zoomLevel);
    const nextY = panStartRef.current.y + (dy / zoomLevel);
    setPanOffset(clampPan(nextX, nextY, zoomLevel));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Drag & Pinch-to-Zoom for Mobile / Tablets
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasDraggedRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...panOffset };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      lastTouchDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 5) {
        hasDraggedRef.current = true;
      }
      const nextX = panStartRef.current.x + (dx / zoomLevel);
      const nextY = panStartRef.current.y + (dy / zoomLevel);
      setPanOffset(clampPan(nextX, nextY, zoomLevel));
    } else if (e.touches.length === 2 && lastTouchDistRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / lastTouchDistRef.current;
      lastTouchDistRef.current = currentDist;
      setZoomLevel(prev => {
        const next = Math.max(1.0, Math.min(4.0, prev * factor));
        setPanOffset(p => clampPan(p.x, p.y, next));
        return next;
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = null;
  };

  const handleSelectCountry = (country) => {
    if (hasDraggedRef.current) return;
    setSelectedCountry(country);
  };

  const handleCountryPathClick = (featureItem) => {
    if (hasDraggedRef.current) return;
    const meta = ISO_COUNTRY_MAP[featureItem.id];
    const marker = isoMarkerMap[featureItem.id];

    if (marker) {
      setSelectedCountry(marker);
    } else if (meta) {
      setSelectedCountry({
        country: meta.name,
        flag: meta.flag,
        destinations: []
      });
    }
  };

  const handleCountryPathHover = (featureItem) => {
    if (isDragging) return;
    const meta = ISO_COUNTRY_MAP[featureItem.id];
    const marker = isoMarkerMap[featureItem.id];

    if (marker) {
      setHoveredCountry(marker);
    } else if (meta) {
      setHoveredCountry({
        country: meta.name,
        flag: meta.flag,
        destinations: []
      });
    }
  };

  const handleSearchResultClick = (item) => {
    if (item.type === "country") {
      setSelectedCountry(item.data);
      setSearchQuery("");
      setSearchFocused(false);
      // Smoothly pan towards the country
      setZoomLevel(1.6);
      const targetPan = clampPan((500 - item.data.svgX) * 0.8, (250 - item.data.svgY) * 0.8, 1.6);
      setPanOffset(targetPan);
    } else {
      setSearchQuery("");
      setSearchFocused(false);
      navigate(`/explore/${item.data.id || item.data._id}`);
    }
  };

  return (
    <section className="hp-section" style={{ position: "relative", padding: "20px 0" }}>
      <div className="hp-container">
        
        {/* Section Header */}
        <div className="hp-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div className="hp-section-tag" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FaGlobe color="#2563EB" /> GLOBAL COVERAGE
            </div>
            <h2 className="hp-section-title" style={{ fontSize: 26, margin: "6px 0 4px" }}>
              Interactive World Map
            </h2>
            <p className="hp-section-subtitle" style={{ marginBottom: 0 }}>
              Explore destinations around the world. Click a country to discover available destinations.
            </p>
          </div>

          {/* Search & Suggestions Field */}
          <div style={{ position: "relative", minWidth: 280, zIndex: 100 }}>
            <div style={{
              display: "flex", alignItems: "center", background: "#FFFFFF",
              border: "1px solid #CBD5E1", borderRadius: 14, padding: "8px 14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              <FaSearch color="#64748B" size={13} style={{ marginRight: 8 }} />
              <input
                type="text"
                placeholder="Search country or destination..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                style={{
                  border: "none", outline: "none", width: "100%",
                  fontSize: 13, background: "transparent", color: "#0F172A",
                  fontFamily: "inherit"
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {searchFocused && filteredSearchList.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", left: 0, right: 0, marginTop: 6,
                background: "#FFFFFF", borderRadius: 14, border: "1px solid #E2E8F0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 200
              }}>
                {filteredSearchList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSearchResultClick(item)}
                    style={{
                      padding: "10px 14px", cursor: "pointer", fontSize: 13,
                      borderBottom: idx < filteredSearchList.length - 1 ? "1px solid #F1F5F9" : "none",
                      color: "#1E293B", display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span>{item.title}</span>
                    <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 700 }}>
                      {item.type === "country" ? "View Country" : "View Details"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "relative",
            background: "linear-gradient(180deg, #F0F7FF 0%, #E8F2FE 100%)",
            borderRadius: 24,
            border: "1px solid #DBEAFE",
            boxShadow: "0 10px 35px rgba(37,99,235,0.06)",
            overflow: "hidden",
            minHeight: 480,
            marginTop: 18,
            cursor: isDragging ? "grabbing" : zoomLevel > 1 ? "grab" : "default",
            touchAction: zoomLevel > 1 ? "none" : "pan-y"
          }}
        >

          {/* Map Controls Floating Bar */}
          <div style={{
            position: "absolute", top: 18, right: 18, zIndex: 20,
            display: "flex", flexDirection: "column", gap: 6,
            background: "#FFFFFF", borderRadius: 12, padding: 6,
            border: "1px solid #CBD5E1", boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
          }}>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "#F8FAFC", color: "#1E293B", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
              onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
            >
              <FaPlus />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "#F8FAFC", color: "#1E293B", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
              onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
            >
              <FaMinus />
            </button>
            <button
              onClick={handleReset}
              title="Reset Map View"
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "#F8FAFC", color: "#1E293B", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
              onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
            >
              <FaRedo />
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 30,
              background: "rgba(255,255,255,0.75)", backdropFilter: "blur(4px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              <FaSync className="fa-spin" style={{ fontSize: 32, color: "#2563EB", marginBottom: 12 }} />
              <div style={{ fontWeight: 800, color: "#334155", fontSize: 14 }}>Loading destinations...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 30,
              background: "rgba(255,255,255,0.9)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center"
            }}>
              <FaExclamationTriangle style={{ fontSize: 36, color: "#DC2626", marginBottom: 10 }} />
              <div style={{ fontWeight: 800, color: "#991B1B", fontSize: 15, marginBottom: 6 }}>Unable to load destinations.</div>
              <button
                onClick={fetchDestinations}
                style={{ background: "#2563EB", color: "#FFFFFF", border: "none", padding: "8px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Realistic SVG Map Canvas powered by D3-Geo & TopoJSON World Atlas */}
          <div style={{
            width: "100%", height: "100%", minHeight: 480,
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out"
          }}>
            <svg
              viewBox="0 0 1000 500"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: "100%", height: "100%", display: "block", userSelect: "none" }}
            >
              {/* Graticule Latitude / Longitude Curvature Grid Lines */}
              {graticuleLinesPath && (
                <path
                  d={graticuleLinesPath}
                  fill="none"
                  stroke="#BFDBFE"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                  opacity="0.65"
                />
              )}

              {/* Geographic Country Boundary Paths from Real Dataset */}
              <g className="world-countries-layer">
                {worldFeatures.map(featureItem => {
                  const countryId = featureItem.id;
                  const hasDestinations = !!isoMarkerMap[countryId];
                  const isHovered = hoveredCountry?.isoId === countryId;
                  const isSelected = selectedCountry?.isoId === countryId;

                  let countryFill = "#E2EAFD";
                  let countryStroke = "#93C5FD";

                  if (isSelected) {
                    countryFill = "#93C5FD";
                    countryStroke = "#2563EB";
                  } else if (isHovered) {
                    countryFill = "#BFDBFE";
                    countryStroke = "#3B82F6";
                  } else if (hasDestinations) {
                    countryFill = "#D4E6FC";
                    countryStroke = "#60A5FA";
                  }

                  const pathD = pathGenerator(featureItem);
                  if (!pathD) return null;

                  return (
                    <path
                      key={countryId || featureItem.properties?.name || Math.random()}
                      d={pathD}
                      fill={countryFill}
                      stroke={countryStroke}
                      strokeWidth={isSelected || isHovered ? "1" : "0.5"}
                      strokeLinejoin="round"
                      style={{ cursor: "pointer", transition: "fill 0.2s, stroke 0.2s" }}
                      onClick={() => handleCountryPathClick(featureItem)}
                      onMouseEnter={() => handleCountryPathHover(featureItem)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                  );
                })}
              </g>

              {/* Interactive Destination Markers Positioned on Exact Coordinates */}
              <g className="destination-markers-layer">
                {countryMarkers.map(c => {
                  const isHovered = hoveredCountry?.key === c.key || hoveredCountry?.isoId === c.isoId;
                  const isSelected = selectedCountry?.key === c.key || selectedCountry?.isoId === c.isoId;

                  return (
                    <g
                      key={c.key}
                      transform={`translate(${c.svgX}, ${c.svgY})`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectCountry(c)}
                      onMouseEnter={() => setHoveredCountry(c)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    >
                      {/* Pulsing Outer Wave */}
                      <circle
                        r={isSelected ? 16 : isHovered ? 14 : 9}
                        fill="#2563EB"
                        opacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.15}
                        style={{ animation: "sr-mapPulse 2.5s infinite ease-out" }}
                      />

                      {/* Glowing Blue Outer Halo */}
                      <circle
                        r={isSelected ? 7 : isHovered ? 6.5 : 4.8}
                        fill={isSelected ? "#1D4ED8" : "#2563EB"}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 2 : 1.5}
                        filter="drop-shadow(0 2px 6px rgba(37,99,235,0.45))"
                      />

                      {/* Inner Pin Core */}
                      <circle
                        r={isSelected ? 3 : 2}
                        fill="#FFFFFF"
                      />

                      {/* Geographic Country Label */}
                      <text
                        y={-9}
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize={isHovered || isSelected ? "10.5" : "9.5"}
                        fontWeight={isHovered || isSelected ? "800" : "700"}
                        style={{
                          paintOrder: "stroke",
                          stroke: "#FFFFFF",
                          strokeWidth: "2.5px",
                          strokeLinejoin: "round",
                          pointerEvents: "none"
                        }}
                      >
                        {c.flag} {c.country}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Country Tooltip on Hover */}
          {hoveredCountry && !selectedCountry && (
            <div style={{
              position: "absolute",
              bottom: 18, left: 18, zIndex: 40,
              background: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)",
              color: "#FFFFFF", padding: "10px 16px", borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.15)",
              animation: "sr-fadeInUp 0.15s ease", pointerEvents: "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 900, fontSize: 13 }}>
                <span>{hoveredCountry.flag || "🌍"}</span>
                <span>{hoveredCountry.country}</span>
              </div>
              <div style={{ fontSize: 11, color: "#93C5FD", fontWeight: 700, marginTop: 2 }}>
                {hoveredCountry.destinations && hoveredCountry.destinations.length > 0
                  ? `${hoveredCountry.destinations.length} destination${hoveredCountry.destinations.length > 1 ? "s" : ""} available • Click to explore`
                  : "Explore upcoming destinations"}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Country Destination Popover / Modal */}
      {selectedCountry && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setSelectedCountry(null)}>
          <div style={{
            maxWidth: 640, width: "100%", background: "#FFFFFF", borderRadius: 24,
            overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            position: "relative", border: "1px solid #E2E8F0", fontFamily: "'Inter', sans-serif"
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #1E1B4B 0%, #2563EB 100%)",
              color: "#FFFFFF", padding: "24px 28px", position: "relative"
            }}>
              <button
                onClick={() => setSelectedCountry(null)}
                style={{
                  position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,0.2)",
                  border: "none", borderRadius: "50%", width: 32, height: 32, color: "#FFFFFF",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <FaTimes />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 24 }}>{selectedCountry.flag || "🌍"}</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#FFFFFF" }}>
                  {selectedCountry.country}
                </h3>
              </div>
              <p style={{ color: "#BFDBFE", fontSize: 13, margin: 0 }}>
                {selectedCountry.destinations && selectedCountry.destinations.length > 0
                  ? `${selectedCountry.destinations.length} popular destination${selectedCountry.destinations.length > 1 ? "s" : ""} available`
                  : "No active destination packages currently listed for this country."}
              </p>
            </div>

            {/* Destinations List */}
            <div style={{ padding: "24px 28px", maxHeight: "60vh", overflowY: "auto" }}>
              {selectedCountry.destinations && selectedCountry.destinations.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {selectedCountry.destinations.map(d => (
                    <div
                      key={d.id || d._id}
                      onClick={() => {
                        setSelectedCountry(null);
                        navigate(`/explore/${d.id || d._id}`);
                      }}
                      style={{
                        background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0",
                        overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                      }}
                    >
                      <div style={{ position: "relative", height: 110 }}>
                        <img
                          src={d.img || d.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80"}
                          alt={d.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span style={{
                          position: "absolute", top: 8, right: 8, background: "rgba(15,23,42,0.75)",
                          backdropFilter: "blur(4px)", color: "#FFFFFF", fontSize: 10, fontWeight: 800,
                          padding: "2px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3
                        }}>
                          <FaStar color="#FBBF24" size={9} /> {d.rating || 4.8}
                        </span>
                      </div>

                      <div style={{ padding: "12px 14px" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>
                          {d.name}
                        </h4>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                          📍 {d.location || selectedCountry.country}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 900, color: "#059669" }}>
                            {d.startingPrice || d.price || "₹15,000"}
                          </span>
                          <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                            Explore <FaArrowRight size={9} />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🏝️</div>
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 15, marginBottom: 4 }}>
                    New Destinations Coming Soon!
                  </div>
                  <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 16px" }}>
                    Our AI is currently curating luxury packages, resorts, and itineraries for {selectedCountry.country}.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                      navigate(`/search?tab=places`);
                    }}
                    style={{
                      background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#2563EB",
                      padding: "8px 18px", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    Browse All Active Destinations
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedCountry.destinations && selectedCountry.destinations.length > 0 && (
              <div style={{
                padding: "16px 28px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  Ready to plan your trip to {selectedCountry.country}?
                </span>
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    navigate(`/search?q=${selectedCountry.country}&tab=places`);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #2563EB, #3B82F6)", color: "#FFFFFF",
                    border: "none", padding: "9px 20px", borderRadius: 10, fontWeight: 800,
                    fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
                  }}
                >
                  Explore All {selectedCountry.country} Packages <FaArrowRight size={10} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}
