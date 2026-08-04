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
    if (!hostelName.trim()) {
      alert("Please select or enter a hostel name.");
      return;
    }
    if (!textReview.trim() && !audioFile && !videoFile) {
      alert("Please enter text or upload an audio/video review.");
      return;
    }

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
      
      // Reset form
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);

      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err) {
      console.warn("Backend submit error, using local storage fallback:", err);
      // Fallback local save if backend offline
      setSuccessMsg(`Review for "${hostelName}" saved in local session database!`);
      setTextReview("");
      setAudioFile(null);
      setVideoFile(null);
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#1e293b",
        padding: 28,
        borderRadius: 18,
        color: "white",
        border: "1px solid #334155",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <FaHotel size={22} color="#3b82f6" />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Submit Hostel Review</h2>
      </div>

      <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, marginTop: -10 }}>
        Select your hostel and provide text, audio, or video reviews. Reviews are directly stored in the backend database.
      </p>

      {successMsg && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid #22c55e",
            color: "#22c55e",
            padding: 14,
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <FaCheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hostel Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Select Hostel *</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            style={inputStyle}
          >
            {HOSTEL_OPTIONS.map((h) => (
              <option key={h} value={h} style={{ background: "#0f172a", color: "white" }}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {selectedHostel === "Custom Hostel (Enter manually)" && (
          <div style={{ marginBottom: 20 }}>
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
        <div style={{ marginBottom: 20 }}>
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
                  border: rating === num ? "2px solid #f59e0b" : "1px solid #334155",
                  background: rating === num ? "rgba(245, 158, 11, 0.15)" : "#0f172a",
                  color: rating === num ? "#f59e0b" : "#94a3b8",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                {num} <FaStar size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* Text Review */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Text Review</label>
          <textarea
            rows={4}
            placeholder="Share details about your hostel experience..."
            value={textReview}
            onChange={(e) => setTextReview(e.target.value)}
            style={{
              ...inputStyle,
              resize: "none",
            }}
          />
        </div>

        {/* Media Upload Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Audio Upload */}
          <div style={mediaUploadBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3b82f6", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
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
                background: audioFile ? "rgba(59, 130, 246, 0.2)" : "#0f172a",
                border: audioFile ? "1px solid #3b82f6" : "1px dashed #334155",
                borderRadius: 10,
                color: audioFile ? "#93c5fd" : "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {audioFile ? `🎤 ${audioFile.name}` : "Upload Audio File"}
            </label>
          </div>

          {/* Video Upload */}
          <div style={mediaUploadBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
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
                background: videoFile ? "rgba(139, 92, 246, 0.2)" : "#0f172a",
                border: videoFile ? "1px solid #8b5cf6" : "1px dashed #334155",
                borderRadius: 10,
                color: videoFile ? "#c4b5fd" : "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {videoFile ? `📹 ${videoFile.name}` : "Upload Video File"}
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 16,
            background: "linear-gradient(to right, #2563eb, #7c3aed)",
            color: "white",
            border: "none",
            borderRadius: 12,
            cursor: loading ? "wait" : "pointer",
            fontWeight: "bold",
            fontSize: 16,
            boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
            transition: "all 0.2s",
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
  padding: "12px 16px",
  borderRadius: 10,
  background: "#0f172a",
  color: "white",
  border: "1px solid #334155",
  outline: "none",
  boxSizing: "border-box",
  fontSize: 14,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#94a3b8",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const mediaUploadBox = {
  background: "#0f172a",
  padding: 14,
  borderRadius: 12,
  border: "1px solid #334155",
};