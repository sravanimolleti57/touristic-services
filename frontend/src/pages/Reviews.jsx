import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";
import ReviewAnalytics from "../components/review-dashboard/ReviewAnalytics";
import HotelDetailsPanel from "../components/review-dashboard/HotelDetailsPanel";
import { HOTELS_LIST, getHotelByName } from "../data/hotels";
import { FaHotel, FaStar, FaMapMarkerAlt, FaChartPie, FaChevronDown, FaChevronUp, FaInfoCircle, FaComments } from "react-icons/fa";
import "../styles/shared.css";

export default function Reviews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialHotelParam = searchParams.get("hotel") || HOTELS_LIST[0].name;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "guest@user.com";

  const [allReviews, setAllReviews] = useState([]);
  const [selectedHotelName, setSelectedHotelName] = useState(initialHotelParam);
  const [filterMode, setFilterMode] = useState("selected");
  const [showMobileAnalytics, setShowMobileAnalytics] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const selectedHotelInfo = useMemo(() => getHotelByName(selectedHotelName), [selectedHotelName]);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/reviews/${email}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAllReviews(res.data);
      } else {
        setFallbackReviews();
      }
    } catch (err) {
      console.log("Error loading reviews from backend, using fallback:", err);
      setFallbackReviews();
    }
  };

  const setFallbackReviews = () => {
    setAllReviews([
      { hostelName: "The Leela Palace", user: "Anand R.", text: "Royal luxury experience! Exceptional service, stunning architecture, and pristine pool area.", type: "Text, Audio", rating: "5", createdAt: new Date().toISOString() },
      { hostelName: "The Leela Palace", user: "Priya S.", text: "Superb dining and friendly concierge staff. Room cleanliness was 10/10.", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
      { hostelName: "Taj Mahal Palace", user: "Vikram M.", text: "Iconic sea view room! Attentive staff and delicious breakfast spread.", type: "Text, Video", rating: "5", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { hostelName: "Oberoi Udaivilas", user: "Neha K.", text: "Breathtaking lake views and tranquil spa services. Highly recommended!", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { hostelName: "Zostel Hotel Jaipur", user: "Rahul T.", text: "Awesome vibe! Met great travellers, super clean rooms.", type: "Text, Audio", rating: "5", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
      { hostelName: "GoStops Hotel Rishikesh", user: "Meera D.", text: "Nice Ganga view from rooftop, but WiFi was slightly slow during evening peak.", type: "Text", rating: "4", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    ]);
  };

  const handleHotelSelect = (hotelName) => {
    setSelectedHotelName(hotelName);
    setSearchParams({ hotel: hotelName });
  };

  const handleNewReviewSubmitted = (submittedHotelName) => {
    if (submittedHotelName) handleHotelSelect(submittedHotelName);
    loadReviews();
  };

  const filteredReviews = useMemo(() => {
    if (filterMode === "all") return allReviews;
    return allReviews.filter(r => {
      const nameInRev = (r.hostelName || r.hotelName || "").toLowerCase();
      return nameInRev.includes(selectedHotelName.toLowerCase()) || selectedHotelName.toLowerCase().includes(nameInRev);
    });
  }, [allReviews, selectedHotelName, filterMode]);

  /* ── shared card style ── */
  const panelCard = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  return (
    <>
      <SharedNavbar activeTab="reviews" />

      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        paddingTop: 96,
        paddingBottom: 64,
        paddingLeft: 16,
        paddingRight: 16,
        color: "#111827",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Header Banner ── */}
          <div style={{
            ...panelCard,
            padding: "24px 28px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative orb */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <span style={{
                  padding: "4px 12px", borderRadius: 20,
                  background: "rgba(37,99,235,0.08)",
                  color: "#2563EB",
                  border: "1px solid rgba(37,99,235,0.2)",
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px",
                }}>
                  AI Hotel Sentiment Hub
                </span>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "10px 0 4px", letterSpacing: "-0.02em" }}>
                  Hotel Reviews &amp; Emotion Analytics
                </h1>
                <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                  Real guest reviews paired with real-time AI sentiment pie charts and comprehensive hotel analytics.
                </p>
              </div>

              {/* Hotel Selector */}
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
                background: "#F9FAFB", padding: "10px 14px", borderRadius: 16,
                border: "1px solid #E5E7EB",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaHotel style={{ color: "#2563EB", fontSize: 14 }} />
                  <select
                    value={selectedHotelName}
                    onChange={(e) => handleHotelSelect(e.target.value)}
                    style={{
                      background: "transparent", color: "#111827",
                      fontWeight: 700, fontSize: 13, outline: "none",
                      cursor: "pointer", border: "none", fontFamily: "inherit",
                    }}
                  >
                    {HOTELS_LIST.map(h => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{
                  display: "flex", background: "#FFFFFF", padding: 4,
                  borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12, fontWeight: 700,
                }}>
                  <button
                    onClick={() => setFilterMode("selected")}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontWeight: 700, fontSize: 12, transition: "all 0.2s",
                      background: filterMode === "selected" ? "linear-gradient(135deg,#2563EB,#3B82F6)" : "transparent",
                      color: filterMode === "selected" ? "#FFFFFF" : "#6B7280",
                      boxShadow: filterMode === "selected" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    }}
                  >
                    Selected Hotel
                  </button>
                  <button
                    onClick={() => setFilterMode("all")}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontFamily: "inherit", fontWeight: 700, fontSize: 12, transition: "all 0.2s",
                      background: filterMode === "all" ? "linear-gradient(135deg,#2563EB,#3B82F6)" : "transparent",
                      color: filterMode === "all" ? "#FFFFFF" : "#6B7280",
                      boxShadow: filterMode === "all" ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
                    }}
                  >
                    All Hotels
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile Collapsible Toggles ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="lg-hidden-reviews">
            <button
              onClick={() => setShowMobileAnalytics(!showMobileAnalytics)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 16,
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                color: "#2563EB", fontWeight: 700, fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaChartPie />
                <span>AI Emotion Dashboard ({filteredReviews.length} reviews)</span>
              </div>
              {showMobileAnalytics ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showMobileAnalytics && (
              <div style={{ ...panelCard, padding: 16 }}>
                <ReviewAnalytics reviews={filteredReviews} />
              </div>
            )}

            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 16,
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                color: "#7C3AED", fontWeight: 700, fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FaInfoCircle />
                <span>Hotel Information ({selectedHotelInfo.name})</span>
              </div>
              {showMobileDetails ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showMobileDetails && (
              <div style={{ ...panelCard, padding: 16 }}>
                <HotelDetailsPanel hotel={selectedHotelInfo} />
              </div>
            )}
          </div>

          {/* ── 3-Column Layout ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px 220px", gap: 24, alignItems: "start" }}
            className="reviews-grid">

            {/* Column 1 — Reviews (left) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <UploadReview
                selectedHotelName={selectedHotelName}
                onHotelSelect={handleHotelSelect}
                onAnalysisComplete={handleNewReviewSubmitted}
              />

              {/* Reviews Table */}
              <div style={{ ...panelCard, padding: "20px 24px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 14, marginBottom: 16, borderBottom: "1px solid #E5E7EB",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "rgba(37,99,235,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FaComments style={{ color: "#2563EB", fontSize: 16 }} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>
                        Guest Reviews ({filteredReviews.length})
                      </h2>
                      <p style={{ margin: 0, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                        {filterMode === "selected" ? `Verified feedback for ${selectedHotelName}` : "Showing all hotel reviews"}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 20,
                    background: "rgba(37,99,235,0.08)", color: "#2563EB",
                    border: "1px solid rgba(37,99,235,0.2)", fontSize: 11, fontWeight: 700,
                  }}>
                    {filteredReviews.length} Entries
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Hotel", "Type", "Snippet", "Rating", "Date"].map(col => (
                          <th key={col} style={{
                            padding: "10px 12px", textAlign: "left",
                            fontWeight: 800, textTransform: "uppercase",
                            letterSpacing: "0.5px", color: "#6B7280", fontSize: 11,
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReviews.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: "32px 12px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                            No reviews submitted yet for {selectedHotelName}. Submit the first review above!
                          </td>
                        </tr>
                      ) : (
                        filteredReviews.map((r, index) => (
                          <tr
                            key={index}
                            style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F0F7FF"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: "#111827" }}>
                              {r.hostelName || r.hotelName || selectedHotelName}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 20,
                                background: "rgba(37,99,235,0.08)", color: "#2563EB",
                                border: "1px solid rgba(37,99,235,0.2)", fontSize: 11, fontWeight: 600,
                              }}>
                                {r.type || "Text"}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>
                              {r.text ? `"${r.text}"` : r.audioName ? `Audio: ${r.audioName}` : r.videoName ? `Video: ${r.videoName}` : "Media Review"}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ color: "#F59E0B", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                                <FaStar style={{ fontSize: 10 }} /> {r.rating || "5"}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", color: "#9CA3AF", fontSize: 11 }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Column 2 — Analytics Dashboard */}
            <div style={{ position: "sticky", top: 96, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
              className="reviews-col2">
              <ReviewAnalytics reviews={filteredReviews} />
            </div>

            {/* Column 3 — Hotel Details */}
            <div style={{ position: "sticky", top: 96, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
              className="reviews-col3">
              <HotelDetailsPanel hotel={selectedHotelInfo} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .lg-hidden-reviews { display: flex !important; }
          .reviews-col2, .reviews-col3 { display: none !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 1025px) {
          .lg-hidden-reviews { display: none !important; }
        }
      `}</style>
    </>
  );
}