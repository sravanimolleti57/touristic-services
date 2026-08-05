import { useState } from "react";
import axios from "axios";
import { FaHotel, FaMicrophone, FaVideo, FaCheckCircle, FaStar, FaPaperPlane } from "react-icons/fa";
import { HOTELS_LIST } from "../data/hotels";

const HOTEL_OPTIONS = [
  ...HOTELS_LIST.map(h => h.name),
  "Custom Hotel (Enter manually)"
];

export default function UploadReview({ selectedHotelName, onHotelSelect, onAnalysisComplete }) {
  const [selectedHotel, setSelectedHotel] = useState(selectedHotelName || HOTEL_OPTIONS[0]);
  const [customHotel, setCustomHotel] = useState("");
  const [rating, setRating] = useState("5");
  const [textReview, setTextReview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const activeHotelName = selectedHotel === "Custom Hotel (Enter manually)" ? customHotel : selectedHotel;

  const handleHotelChange = (e) => {
    const val = e.target.value;
    setSelectedHotel(val);
    if (onHotelSelect && val !== "Custom Hotel (Enter manually)") {
      onHotelSelect(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeHotelName.trim()) { alert("Please select or enter a hotel name."); return; }
    if (!textReview.trim() && !audioFile && !videoFile) { alert("Please enter text or upload an audio/video review."); return; }

    const reviewTypes = [];
    if (textReview.trim()) reviewTypes.push("Text");
    if (audioFile) reviewTypes.push("Audio");
    if (videoFile) reviewTypes.push("Video");
    const typeStr = reviewTypes.length > 0 ? reviewTypes.join(", ") : "Text";

    const newRevObj = {
      hostelName: activeHotelName,
      hotelName: activeHotelName,
      user: user?.name || user?.email?.split("@")[0] || "Traveler",
      userEmail: user?.email || "guest@user.com",
      rating: rating,
      text: textReview,
      audioName: audioFile?.name || "",
      videoName: videoFile?.name || "",
      type: typeStr,
      createdAt: new Date().toISOString()
    };

    try {
      setLoading(true);
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("email", user?.email || "guest@user.com");
      formData.append("hostelName", activeHotelName); // Preserves backend API contract
      formData.append("rating", rating);
      if (textReview.trim()) formData.append("text", textReview);
      if (audioFile) formData.append("audio", audioFile);
      if (videoFile) formData.append("video", videoFile);

      await axios.post("http://127.0.0.1:5000/submit-review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

<<<<<<< Updated upstream
      setSuccessMsg(`Review for "${activeHotelName}" successfully saved to backend database!`);
=======
      // Save locally to session storage to guarantee immediate sync
      const existingLocal = JSON.parse(sessionStorage.getItem("local_reviews") || "[]");
      sessionStorage.setItem("local_reviews", JSON.stringify([newRevObj, ...existingLocal]));

      setSuccessMsg(`Review for "${activeHotelName}" saved successfully!`);
>>>>>>> Stashed changes
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);

<<<<<<< Updated upstream
      if (onAnalysisComplete) onAnalysisComplete(activeHotelName);
    } catch (err) {
      console.warn("Backend submit error, using local session fallback:", err);
=======
      if (onAnalysisComplete) onAnalysisComplete(newRevObj);
    } catch (err) {
      console.warn("Backend submit error, saving in local session database:", err);
      const existingLocal = JSON.parse(sessionStorage.getItem("local_reviews") || "[]");
      sessionStorage.setItem("local_reviews", JSON.stringify([newRevObj, ...existingLocal]));

>>>>>>> Stashed changes
      setSuccessMsg(`Review for "${activeHotelName}" saved in local session database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);
<<<<<<< Updated upstream
      if (onAnalysisComplete) onAnalysisComplete(activeHotelName);
=======

      if (onAnalysisComplete) onAnalysisComplete(newRevObj);
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5 text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
          <FaHotel className="text-xl" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">Submit Hotel Review</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Share text, audio, or video feedback. Live AI sentiment analytics updates automatically.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <FaCheckCircle className="text-base flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hotel Selector */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Target Hotel *
          </label>
          <select
            value={selectedHotel}
            onChange={handleHotelChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 text-white border border-slate-700/80 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all cursor-pointer"
          >
            {HOTEL_OPTIONS.map((h) => (
              <option key={h} value={h} className="bg-slate-900 text-white">
                {h}
              </option>
            ))}
          </select>
        </div>

        {selectedHotel === "Custom Hotel (Enter manually)" && (
          <div>
            <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Custom Hotel Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Grand Resort Goa"
              value={customHotel}
              onChange={(e) => {
                setCustomHotel(e.target.value);
                if (onHotelSelect) onHotelSelect(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 text-white border border-slate-700/80 text-sm font-medium outline-none focus:border-sky-500 transition-all"
              required
            />
          </div>
        )}

        {/* Rating Selector */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Rating Score
          </label>
          <div className="grid grid-cols-5 gap-2">
            {["5", "4", "3", "2", "1"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`py-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                  rating === num
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span>{num}</span>
                <FaStar className="text-[11px]" />
              </button>
            ))}
          </div>
        </div>

        {/* Text Review Input */}
        <div>
          <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
            Your Detailed Review
          </label>
          <textarea
            rows={4}
            placeholder="Share details about cleanliness, staff behavior, room comfort, WiFi, location..."
            value={textReview}
            onChange={(e) => setTextReview(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-900/90 text-white border border-slate-700/80 text-sm outline-none focus:border-sky-500 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Media Attachments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Audio Upload */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <FaMicrophone /> <span>Audio Review Attachment</span>
            </div>
            <input
              type="file"
              accept="audio/*"
              id="audio-upload"
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="audio-upload"
              className={`block w-full py-2.5 px-3 rounded-lg border text-center text-xs font-medium truncate cursor-pointer transition-all ${
                audioFile
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                  : "bg-slate-800/80 border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {audioFile ? `🎤 ${audioFile.name}` : "Upload Audio Recording"}
            </label>
          </div>

          {/* Video Upload */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <FaVideo /> <span>Video Review Attachment</span>
            </div>
            <input
              type="file"
              accept="video/*"
              id="video-upload"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="video-upload"
              className={`block w-full py-2.5 px-3 rounded-lg border text-center text-xs font-medium truncate cursor-pointer transition-all ${
                videoFile
                  ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                  : "bg-slate-800/80 border-dashed border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {videoFile ? `📹 ${videoFile.name}` : "Upload Video Clips"}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
            loading
              ? "bg-slate-800 text-slate-500 cursor-wait"
              : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25 active:scale-[0.99]"
          }`}
        >
          <FaPaperPlane className="text-xs" />
          <span>{loading ? "Processing AI Analysis..." : "Submit Hotel Review"}</span>
        </button>
      </form>
    </div>
  );
}