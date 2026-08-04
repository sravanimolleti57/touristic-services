import { useState } from "react";
import axios from "axios";

export default function UploadReview({ onAnalysisComplete }) {
  const [textReview, setTextReview] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const analyzeReview = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("email", user?.email || "");

      if (textReview.trim()) {
        formData.append("text", textReview);
      }

      if (audioFile) {
        formData.append("audio", audioFile);
      }

      if (videoFile) {
        formData.append("video", videoFile);
      }

      const res = await axios.post(
        "http://127.0.0.1:5000/analyze-review",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);

      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    } catch (err) {
      console.log(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#1e293b",
        padding: 25,
        borderRadius: 15,
        color: "white",
      }}
    >
      <h2>Upload Review</h2>

      <textarea
        rows={5}
        placeholder="Write your review..."
        value={textReview}
        onChange={(e) => setTextReview(e.target.value)}
        style={{
          width: "100%",
          padding: 15,
          borderRadius: 10,
          background: "#0f172a",
          color: "white",
          border: "1px solid #334155",
          resize: "none",
        }}
      />

      <div style={{ marginTop: 20 }}>
        <label>Upload Audio</label>

        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Upload Video</label>

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
      </div>

      <button
        onClick={analyzeReview}
        disabled={loading}
        style={{
          marginTop: 25,
          width: "100%",
          padding: 15,
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {loading ? "Analyzing..." : "Analyze Emotion"}
      </button>

      {result && (
        <div
          style={{
            marginTop: 25,
            background: "#0f172a",
            padding: 20,
            borderRadius: 10,
          }}
        >
          <h3>Analysis Result</h3>

          <p>
            <strong>Emotion:</strong> {result.emotion}
          </p>

          <p>
            <strong>Confidence:</strong> {result.confidence}%
          </p>
        </div>
      )}
    </div>
  );
}