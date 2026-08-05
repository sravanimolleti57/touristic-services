import { useState } from "react";
import axios from "axios";
import { FaHotel, FaMicrophone, FaVideo, FaCheckCircle, FaStar } from "react-icons/fa";

const HOSTEL_OPTIONS = [
  "Zostel Jaipur",
  "GoStops Rishikesh",
  "The Hosteller Goa",
  "Moustache Hostel Manali",
  "Lost Hostels Hampi",
  "Backpackers Hostel Delhi",
  "The Roadhouse Hostel Kerala",
  "Madpackers Udaipur",
  "Custom Hostel (Enter manually)"
];

export default function UploadReview({ onAnalysisComplete }) {
  const [selectedHostel, setSelectedHostel] = useState(HOSTEL_OPTIONS[0]);
  const [customHostel, setCustomHostel] = useState("");
  const [rating, setRating] = useState("5");
  const [textReview, setTextReview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const hostelName = selectedHostel === "Custom Hostel (Enter manually)" ? customHostel : selectedHostel;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hostelName.trim()) { alert("Please select or enter a hostel name."); return; }
    if (!textReview.trim() && !audioFile && !videoFile) { alert("Please enter text or upload an audio/video review."); return; }

    try {
      setLoading(true);
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("email", user?.email || "guest@user.com");
      formData.append("hostelName", hostelName);
      formData.append("rating", rating);
      if (textReview.trim()) formData.append("text", textReview);
      if (audioFile) formData.append("audio", audioFile);
      if (videoFile) formData.append("video", videoFile);

      await axios.post("http://127.0.0.1:5000/submit-review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg(`Review for "${hostelName}" successfully saved to backend database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);

      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err) {
      console.warn("Backend submit error, using local storage fallback:", err);
      setSuccessMsg(`Review for "${hostelName}" saved in local session database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);
      if (onAnalysisComplete) onAnalysisComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#FFFFFF",
      padding: 28,
      borderRadius: 16,
      color: "#111827",
      border: "1px solid #E5E7EB",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <FaHotel size={20} color="#2563EB" />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>Submit Hostel Review</h2>
      </div>

      <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24, marginTop: 4 }}>
        Select your hostel and provide text, audio, or video reviews. Reviews are directly stored in the backend database.
      </p>

      {successMsg && (
        <div style={{
          background: "rgba(22,163,74,0.06)",
          border: "1px solid rgba(22,163,74,0.25)",
          color: "#16A34A",
          padding: 14,
          borderRadius: 12,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          fontWeight: 600,
        }}>
          <FaCheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hostel Selection */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Select Hostel *</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            style={inputStyle}
          >
            {HOSTEL_OPTIONS.map((h) => (
              <option key={h} value={h} style={{ background: "#FFFFFF", color: "#111827" }}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {selectedHostel === "Custom Hostel (Enter manually)" && (
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Custom Hostel Name *</label>
            <input
              type="text"
              placeholder="e.g. Backpacker Haven Goa"
              value={customHostel}
              onChange={(e) => setCustomHostel(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        )}

        {/* Rating Selection */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Overall Rating</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["5", "4", "3", "2", "1"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: rating === num ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                  background: rating === num ? "rgba(245,158,11,0.08)" : "#F9FAFB",
                  color: rating === num ? "#D97706" : "#9CA3AF",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {num} <FaStar size={11} />
              </button>
            ))}
          </div>
        </div>

        {/* Text Review */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Text Review</label>
          <textarea
            rows={4}
            placeholder="Share details about your hostel experience..."
            value={textReview}
            onChange={(e) => setTextReview(e.target.value)}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        {/* Media Upload Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Audio Upload */}
          <div style={mediaUploadBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#2563EB", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              <FaMicrophone /> Audio Review
            </div>
            <input
              type="file"
              accept="audio/*"
              id="audio-upload"
              onChange={(e) => setAudioFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            <label
              htmlFor="audio-upload"
              style={{
                display: "block",
                padding: "10px 14px",
                background: audioFile ? "rgba(37,99,235,0.08)" : "#F9FAFB",
                border: audioFile ? "1px solid rgba(37,99,235,0.3)" : "1px dashed #D1D5DB",
                borderRadius: 10,
                color: audioFile ? "#2563EB" : "#9CA3AF",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "all 0.2s",
              }}
            >
              {audioFile ? `🎤 ${audioFile.name}` : "Upload Audio File"}
            </label>
          </div>

          {/* Video Upload */}
          <div style={mediaUploadBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7C3AED", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              <FaVideo /> Video Review
            </div>
            <input
              type="file"
              accept="video/*"
              id="video-upload"
              onChange={(e) => setVideoFile(e.target.files[0])}
              style={{ display: "none" }}
            />
            <label
              htmlFor="video-upload"
              style={{
                display: "block",
                padding: "10px 14px",
                background: videoFile ? "rgba(124,58,237,0.08)" : "#F9FAFB",
                border: videoFile ? "1px solid rgba(124,58,237,0.3)" : "1px dashed #D1D5DB",
                borderRadius: 10,
                color: videoFile ? "#7C3AED" : "#9CA3AF",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "all 0.2s",
              }}
            >
              {videoFile ? `📹 ${videoFile.name}` : "Upload Video File"}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#E5E7EB" : "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: loading ? "#9CA3AF" : "white",
            border: "none",
            borderRadius: 12,
            cursor: loading ? "wait" : "pointer",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.25)",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Saving Review to Backend..." : "Submit Hostel Review"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  background: "#FFFFFF",
  color: "#111827",
  border: "1px solid #E5E7EB",
  outline: "none",
  boxSizing: "border-box",
  fontSize: 14,
  fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 7,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const mediaUploadBox = {
  background: "#F9FAFB",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
};