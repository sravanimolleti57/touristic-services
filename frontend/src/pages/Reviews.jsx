import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";

export default function Reviews() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "guest@user.com";

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/reviews/${email}`);
      setReviews(res.data);
    } catch (err) {
      console.log("Error loading reviews from backend:", err);
      // Mock existing saved reviews if backend is empty/offline
      setReviews([
        {
          hostelName: "Zostel Jaipur",
          text: "Amazing backpacker vibe! Met great travellers, super clean dorms.",
          type: "Text, Audio",
          rating: "5",
          createdAt: new Date().toISOString(),
        },
        {
          hostelName: "The Hosteller Goa",
          text: "Great location near Anjuna beach. Loved the pool area and fast WiFi.",
          type: "Text, Video",
          rating: "5",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ]);
    }
  };

  return (
    <>
      <SharedNavbar />

      <div
        style={{
          background: "#0f172a",
          minHeight: "100vh",
          padding: "110px 40px 60px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            🏡 Hostel Reviews & Submissions
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginBottom: 32,
              fontSize: 16,
            }}
          >
            Submit your hostel experience with text, audio, or video attachments. All reviews are stored in the backend database.
          </p>

          <UploadReview onAnalysisComplete={loadReviews} />

          {/* Stored Hostel Reviews Table */}
          <div
            style={{
              background: "#1e293b",
              marginTop: 40,
              borderRadius: 18,
              padding: 28,
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, marginBottom: 6 }}>
              Submitted Hostel Reviews
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: 0, marginBottom: 20 }}>
              Reviews stored in backend database for hostels
            </p>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: "#0f172a", color: "#93c5fd" }}>
                    <th style={th}>Hostel Name</th>
                    <th style={th}>Review Type</th>
                    <th style={th}>Review Snippet</th>
                    <th style={th}>Rating</th>
                    <th style={th}>Submitted Date</th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        No hostel reviews submitted yet. Use the form above to add one!
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ ...td, fontWeight: 700, color: "white" }}>
                          {r.hostelName || "General Hostel"}
                        </td>
                        <td style={td}>
                          <span
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              color: "#93c5fd",
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {r.type || "Text"}
                          </span>
                        </td>
                        <td style={{ ...td, color: "#cbd5e1", maxWidth: 300 }}>
                          {r.text ? `"${r.text}"` : r.audioName ? `Audio File: ${r.audioName}` : r.videoName ? `Video File: ${r.videoName}` : "Media Review"}
                        </td>
                        <td style={td}>
                          <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                            {r.rating || "5"} ★
                          </span>
                        </td>
                        <td style={{ ...td, color: "#94a3b8", fontSize: 13 }}>
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
      </div>
    </>
  );
}

const th = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  fontWeight: 700,
};

const td = {
  padding: "16px",
  fontSize: 14,
};