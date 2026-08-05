import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";
import ReviewAnalytics from "../components/review-dashboard/ReviewAnalytics";
import HotelDetailsPanel from "../components/review-dashboard/HotelDetailsPanel";
import { HOTELS_LIST, getHotelByName } from "../data/hotels";
<<<<<<< Updated upstream
import { FaHotel, FaStar, FaMapMarkerAlt, FaChartPie, FaChevronDown, FaChevronUp, FaInfoCircle, FaComments } from "react-icons/fa";
=======
import { isHotelMatch } from "../utils/reviewAnalytics";
import { FaHotel, FaStar, FaChartPie, FaChevronDown, FaChevronUp, FaInfoCircle, FaComments } from "react-icons/fa";
>>>>>>> Stashed changes

export default function Reviews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialHotelParam = searchParams.get("hotel") || HOTELS_LIST[0].name;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "guest@user.com";

  const [allReviews, setAllReviews] = useState([]);
  const [selectedHotelName, setSelectedHotelName] = useState(initialHotelParam);
  const [filterMode, setFilterMode] = useState("selected"); // "selected" | "all"
  const [showMobileAnalytics, setShowMobileAnalytics] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const selectedHotelInfo = useMemo(() => getHotelByName(selectedHotelName), [selectedHotelName]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/reviews/${email}`);
<<<<<<< Updated upstream
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
=======
      const backendRevs = Array.isArray(res.data) ? res.data : [];

      // Combine backend reviews with fallback set if empty
      let combined = backendRevs.length > 0 ? backendRevs : getFallbackReviews();
      
      // Combine with local session reviews if any stored locally
      const localSessionRevs = JSON.parse(sessionStorage.getItem("local_reviews") || "[]");
      if (localSessionRevs.length > 0) {
        combined = [...localSessionRevs, ...combined];
      }

      setAllReviews(combined);
    } catch (err) {
      console.warn("Backend reviews fetch note, using local session reviews dataset:", err);
      const localSessionRevs = JSON.parse(sessionStorage.getItem("local_reviews") || "[]");
      setAllReviews(localSessionRevs.length > 0 ? localSessionRevs : getFallbackReviews());
    }
  };

  const getFallbackReviews = () => [
    { hostelName: "The Leela Palace", user: "Anand R.", text: "Royal luxury experience! Exceptional service, stunning architecture, and pristine pool area.", type: "Text, Audio", rating: "5", createdAt: new Date().toISOString() },
    { hostelName: "The Leela Palace", user: "Priya S.", text: "Superb dining and friendly concierge staff. Room cleanliness was 10/10.", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { hostelName: "Taj Mahal Palace", user: "Vikram M.", text: "Iconic sea view room! Attentive staff and delicious breakfast spread.", type: "Text, Video", rating: "5", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { hostelName: "Oberoi Udaivilas", user: "Neha K.", text: "Breathtaking lake views and tranquil spa services. Highly recommended!", type: "Text", rating: "5", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { hostelName: "Zostel Hotel Jaipur", user: "Rahul T.", text: "Awesome vibe! Met great travellers, super clean rooms.", type: "Text, Audio", rating: "5", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { hostelName: "GoStops Hotel Rishikesh", user: "Meera D.", text: "Nice Ganga view from rooftop, but WiFi was slightly slow during evening peak.", type: "Text", rating: "4", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  ];
>>>>>>> Stashed changes

  const handleHotelSelect = (hotelName) => {
    setSelectedHotelName(hotelName);
    setSearchParams({ hotel: hotelName });
  };

<<<<<<< Updated upstream
  const handleNewReviewSubmitted = (submittedHotelName) => {
    if (submittedHotelName) {
      handleHotelSelect(submittedHotelName);
    }
    loadReviews();
  };

  // Filter reviews for the selected hotel or show all
  const filteredReviews = useMemo(() => {
    if (filterMode === "all") return allReviews;
    return allReviews.filter(r => {
      const nameInRev = (r.hostelName || r.hotelName || "").toLowerCase();
      return nameInRev.includes(selectedHotelName.toLowerCase()) || selectedHotelName.toLowerCase().includes(nameInRev);
=======
  const handleNewReviewSubmitted = (newReviewData) => {
    let targetHotel = selectedHotelName;

    if (typeof newReviewData === "string") {
      targetHotel = newReviewData;
    } else if (newReviewData && newReviewData.hostelName) {
      targetHotel = newReviewData.hostelName;
      setAllReviews((prev) => [newReviewData, ...prev]);
    }

    handleHotelSelect(targetHotel);
    loadReviews();
  };

  // Filter reviews strictly for the selected hotel or show all
  const filteredReviews = useMemo(() => {
    if (filterMode === "all") return allReviews;
    return allReviews.filter((r) => {
      const nameInRev = r.hostelName || r.hotelName || "";
      return isHotelMatch(nameInRev, selectedHotelName);
>>>>>>> Stashed changes
    });
  }, [allReviews, selectedHotelName, filterMode]);

  return (
    <>
      <SharedNavbar activeTab="reviews" />

      <div className="min-h-screen bg-[#060913] pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-extrabold uppercase tracking-wider">
                  AI Hotel Sentiment Hub
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                  Hotel Reviews & Emotion Analytics
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Real guest reviews paired with real-time AI sentiment pie charts and comprehensive hotel analytics.
                </p>
              </div>

              {/* Hotel Selector Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 px-3 py-1">
                  <FaHotel className="text-sky-400 text-sm" />
                  <select
                    value={selectedHotelName}
                    onChange={(e) => handleHotelSelect(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer pr-2"
                  >
<<<<<<< Updated upstream
                    {HOTELS_LIST.map(h => (
=======
                    {HOTELS_LIST.map((h) => (
>>>>>>> Stashed changes
                      <option key={h.id} value={h.name} className="bg-slate-900 text-white">
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setFilterMode("selected")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "selected" ? "bg-sky-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    Selected Hotel
                  </button>
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === "all" ? "bg-sky-500 text-white shadow-md" : "text-slate-400 hover:text-white"}`}
                  >
                    All Hotels
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Collapsible Toggles */}
          <div className="lg:hidden space-y-3">
            <button
              onClick={() => setShowMobileAnalytics(!showMobileAnalytics)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 font-bold flex items-center justify-between text-xs shadow-lg"
            >
              <div className="flex items-center gap-2">
                <FaChartPie />
                <span>AI Emotion Dashboard ({filteredReviews.length} reviews)</span>
              </div>
              {showMobileAnalytics ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showMobileAnalytics && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <ReviewAnalytics reviews={filteredReviews} />
              </div>
            )}

            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-purple-400 font-bold flex items-center justify-between text-xs shadow-lg"
            >
              <div className="flex items-center gap-2">
                <FaInfoCircle />
                <span>Hotel Information ({selectedHotelInfo.name})</span>
              </div>
              {showMobileDetails ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {showMobileDetails && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <HotelDetailsPanel hotel={selectedHotelInfo} />
              </div>
            )}
          </div>

<<<<<<< Updated upstream
          {/* 
            3-COLUMN LAYOUT REQUIREMENT:
            | Column 1: Reviews (60%) | Column 2: Analytics Dashboard (20%) | Column 3: Hotel Details (20%) |
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Column 1: Reviews Section (60% / col-span-7) */}
=======
          {/* 3-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Column 1: Reviews Section */}
>>>>>>> Stashed changes
            <div className="lg:col-span-7 space-y-6">
              
              <UploadReview
                selectedHotelName={selectedHotelName}
                onHotelSelect={handleHotelSelect}
                onAnalysisComplete={handleNewReviewSubmitted}
              />

              {/* Submitted Hotel Reviews Table */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FaComments className="text-sky-400 text-lg" />
                    <div>
                      <h2 className="text-base font-extrabold text-white">
                        Guest Reviews ({filteredReviews.length})
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {filterMode === "selected" ? `Verified feedback for ${selectedHotelName}` : "Showing all hotel reviews"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold">
                    {filteredReviews.length} Entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                        <th className="p-3 font-extrabold uppercase tracking-wider">Hotel</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider">Type</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider">Snippet</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider">Rating</th>
                        <th className="p-3 font-extrabold uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {filteredReviews.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            No reviews submitted yet for {selectedHotelName}. Submit the first review above!
                          </td>
                        </tr>
                      ) : (
                        filteredReviews.map((r, index) => (
                          <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-bold text-white">
                              {r.hostelName || r.hotelName || selectedHotelName}
                            </td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[11px] font-semibold">
                                {r.type || "Text"}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs truncate text-slate-300">
                              {r.text ? `"${r.text}"` : r.audioName ? `Audio: ${r.audioName}` : r.videoName ? `Video: ${r.videoName}` : "Media Review"}
                            </td>
                            <td className="p-3">
                              <span className="text-amber-400 font-extrabold flex items-center gap-1">
                                <FaStar className="text-[10px]" /> {r.rating || "5"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">
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

<<<<<<< Updated upstream
            {/* Column 2: Analytics Dashboard (20% / col-span-3) - Sits between Reviews and Hotel Details! */}
=======
            {/* Column 2: Analytics Dashboard */}
>>>>>>> Stashed changes
            <div className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-1 space-y-4">
              <ReviewAnalytics reviews={filteredReviews} />
            </div>

<<<<<<< Updated upstream
            {/* Column 3: Hotel Details Panel (20% / col-span-2) - Positioned on the RIGHT of Analytics Dashboard! */}
=======
            {/* Column 3: Hotel Details Panel */}
>>>>>>> Stashed changes
            <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <HotelDetailsPanel hotel={selectedHotelInfo} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}