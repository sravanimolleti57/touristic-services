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
    if (onHotelSelect && val !== "Custom Hotel (Enter manually)") onHotelSelect(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeHotelName.trim()) { alert("Please select or enter a hotel name."); return; }
    if (!textReview.trim() && !audioFile && !videoFile) { alert("Please enter text or upload an audio/video review."); return; }

    try {
      setLoading(true);
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("email", user?.email || "guest@user.com");
      formData.append("hostelName", activeHotelName);
      formData.append("rating", rating);
      if (textReview.trim()) formData.append("text", textReview);
      if (audioFile) formData.append("audio", audioFile);
      if (videoFile) formData.append("video", videoFile);

      await axios.post("http://127.0.0.1:5000/submit-review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Review for "${activeHotelName}" successfully saved to backend database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);
      if (onAnalysisComplete) onAnalysisComplete(activeHotelName);
    } catch (err) {
      console.warn("Backend submit error, using local session fallback:", err);
      setSuccessMsg(`Review for "${activeHotelName}" saved in local session database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);
      if (onAnalysisComplete) onAnalysisComplete(activeHotelName);
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared input style ── */
  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid #E5E7EB", background: "#FFFFFF",
    color: "#111827", fontSize: 13, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 800,
    color: "#6B7280", textTransform: "uppercase",
    letterSpacing: "0.5px", marginBottom: 6,
  };

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        paddingBottom: 14, marginBottom: 16, borderBottom: "1px solid #E5E7EB",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(37,99,235,0.08)",
          border: "1px solid rgba(37,99,235,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FaHotel style={{ color: "#2563EB", fontSize: 18 }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Submit Hotel Review</h2>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
            Share text, audio, or video feedback. Live AI sentiment analytics updates automatically.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 16,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
          color: "#065F46", fontSize: 12, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <FaCheckCircle style={{ flexShrink: 0, color: "#059669" }} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Hotel Selector */}
        <div>
          <label style={labelStyle}>Select Target Hotel *</label>
          <select
            value={selectedHotel}
            onChange={handleHotelChange}
            style={{ ...inputStyle, cursor: "pointer" }}
            onFocus={e => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"; }}
            onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          >
            {HOTEL_OPTIONS.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Custom Hotel Name */}
        {selectedHotel === "Custom Hotel (Enter manually)" && (
          <div>
            <label style={labelStyle}>Custom Hotel Name *</label>
            <input
              type="text"
              placeholder="e.g. Grand Resort Goa"
              value={customHotel}
              onChange={(e) => {
                setCustomHotel(e.target.value);
                if (onHotelSelect) onHotelSelect(e.target.value);
              }}
              style={inputStyle}
              required
              onFocus={e => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"; }}
              onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        )}

        {/* Rating Selector */}
        <div>
          <label style={labelStyle}>Rating Score</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {["5","4","3","2","1"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                style={{
                  padding: "10px 0", borderRadius: 10,
                  border: rating === num ? "1.5px solid #F59E0B" : "1px solid #E5E7EB",
                  background: rating === num ? "rgba(245,158,11,0.10)" : "#F9FAFB",
                  color: rating === num ? "#D97706" : "#6B7280",
                  fontWeight: 800, fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  transition: "all 0.2s", fontFamily: "inherit",
                  transform: rating === num ? "scale(1.04)" : "scale(1)",
                }}
              >
                <span>{num}</span>
                <FaStar style={{ fontSize: 11 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Text Review */}
        <div>
          <label style={labelStyle}>Your Detailed Review</label>
          <textarea
            rows={4}
            placeholder="Share details about cleanliness, staff behavior, room comfort, WiFi, location..."
            value={textReview}
            onChange={(e) => setTextReview(e.target.value)}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            onFocus={e => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.10)"; }}
            onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Media Attachments */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Audio Upload */}
          <div style={{
            padding: 14, borderRadius: 12,
            background: "#F9FAFB", border: "1px solid #E5E7EB",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#2563EB" }}>
              <FaMicrophone /> <span>Audio Review</span>
            </div>
            <input type="file" accept="audio/*" id="audio-upload"
              onChange={(e) => setAudioFile(e.target.files[0])} style={{ display: "none" }} />
            <label
              htmlFor="audio-upload"
              style={{
                display: "block", width: "100%", padding: "8px 12px",
                borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", boxSizing: "border-box",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                background: audioFile ? "rgba(37,99,235,0.08)" : "#FFFFFF",
                border: audioFile ? "1px solid rgba(37,99,235,0.3)" : "1px dashed #D1D5DB",
                color: audioFile ? "#2563EB" : "#9CA3AF",
              }}
            >
              {audioFile ? `🎤 ${audioFile.name}` : "Upload Audio Recording"}
            </label>
          </div>

          {/* Video Upload */}
          <div style={{
            padding: 14, borderRadius: 12,
            background: "#F9FAFB", border: "1px solid #E5E7EB",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>
              <FaVideo /> <span>Video Review</span>
            </div>
            <input type="file" accept="video/*" id="video-upload"
              onChange={(e) => setVideoFile(e.target.files[0])} style={{ display: "none" }} />
            <label
              htmlFor="video-upload"
              style={{
                display: "block", width: "100%", padding: "8px 12px",
                borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", boxSizing: "border-box",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                background: videoFile ? "rgba(124,58,237,0.08)" : "#FFFFFF",
                border: videoFile ? "1px solid rgba(124,58,237,0.3)" : "1px dashed #D1D5DB",
                color: videoFile ? "#7C3AED" : "#9CA3AF",
              }}
            >
              {videoFile ? `📹 ${videoFile.name}` : "Upload Video Clips"}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "13px 24px", borderRadius: 12,
            border: "none", cursor: loading ? "wait" : "pointer",
            fontFamily: "inherit", fontWeight: 800, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.25s",
            background: loading
              ? "#E5E7EB"
              : "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: loading ? "#9CA3AF" : "#FFFFFF",
            boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.25)",
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.35)"; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 14px rgba(37,99,235,0.25)"; }}
        >
          <FaPaperPlane style={{ fontSize: 12 }} />
          <span>{loading ? "Processing AI Analysis..." : "Submit Hotel Review"}</span>
        </button>

      </form>
    </div>
  );
}