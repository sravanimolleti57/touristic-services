import { useEffect, useState } from "react";
import axios from "axios";
import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";

export default function Reviews() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user?.email || "guest@user.com";

  const [reviews, setReviews] = useState([]);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/reviews/${email}`);
      setReviews(res.data);
    } catch (err) {
      console.log("Error loading reviews from backend:", err);
      setReviews([
        { hostelName: "Zostel Jaipur", text: "Amazing backpacker vibe! Met great travellers, super clean dorms.", type: "Text, Audio", rating: "5", createdAt: new Date().toISOString() },
        { hostelName: "The Hosteller Goa", text: "Great location near Anjuna beach. Loved the pool area and fast WiFi.", type: "Text, Video", rating: "5", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      ]);
    }
  };

  return (
    <>
      <SharedNavbar activeTab="reviews" />

      <div style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: "100px 40px 60px",
        color: "#111827",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 6, color: "#111827" }}>
              🏡 Hostel Reviews & Submissions
            </h1>
            <p style={{ color: "#6B7280", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
              Submit your hostel experience with text, audio, or video attachments. All reviews are stored in the backend database.
            </p>
          </div>

          <UploadReview onAnalysisComplete={loadReviews} />

          {/* Stored Hostel Reviews Table */}
          <div style={{
            background: "#FFFFFF",
            marginTop: 32,
            borderRadius: 16,
            padding: "28px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 4, color: "#111827" }}>
              Submitted Hostel Reviews
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: 13, margin: 0, marginBottom: 20 }}>
              Reviews stored in backend database for hostels
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
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
                      <td colSpan="5" style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                        No hostel reviews submitted yet. Use the form above to add one!
                      </td>
                    </tr>
                  ) : (
                    reviews.map((r, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ ...td, fontWeight: 700, color: "#111827" }}>
                          {r.hostelName || "General Hostel"}
                        </td>
                        <td style={td}>
                          <span style={{
                            background: "rgba(37,99,235,0.08)",
                            color: "#2563EB",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            border: "1px solid rgba(37,99,235,0.15)",
                          }}>
                            {r.type || "Text"}
                          </span>
                        </td>
                        <td style={{ ...td, color: "#6B7280", maxWidth: 300 }}>
                          {r.text ? `"${r.text.slice(0, 60)}${r.text.length > 60 ? '…' : ''}"` : r.audioName ? `Audio File: ${r.audioName}` : r.videoName ? `Video File: ${r.videoName}` : "Media Review"}
                        </td>
                        <td style={td}>
                          <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 14 }}>
                            {"★".repeat(parseInt(r.rating || "5"))} {r.rating || "5"}
                          </span>
                        </td>
                        <td style={{ ...td, color: "#9CA3AF", fontSize: 12 }}>
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
  padding: "12px 16px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  fontWeight: 800,
  color: "#6B7280",
  borderBottom: "1px solid #E5E7EB",
};

const td = {
  padding: "14px 16px",
  fontSize: 13,
  color: "#374151",
};