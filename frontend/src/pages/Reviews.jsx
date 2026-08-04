import { useEffect, useState } from "react";
import axios from "axios";

import SharedNavbar from "../components/SharedNavbar";
import UploadReview from "../components/UploadReview";
import EmotionBarChart from "../components/EmotionBarChart";

export default function Reviews() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [chartData, setChartData] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const stats = await axios.get("http://127.0.0.1:5000/emotion-stats");

      setChartData(stats.data);

      const reviewData = await axios.get(
        `http://127.0.0.1:5000/reviews/${user.email}`
      );

      setReviews(reviewData.data);

    } catch (err) {
      console.log(err);

      // Dummy data until backend is ready
      setChartData([
        { emotion: "Happy", count: 8 },
        { emotion: "Neutral", count: 4 },
        { emotion: "Sad", count: 2 },
        { emotion: "Angry", count: 1 },
      ]);

      setReviews([]);
    }
  };

  return (
    <>
      <SharedNavbar />

      <div
        style={{
          background: "#0f172a",
          minHeight: "100vh",
          padding: "110px 40px",
          color: "white",
        }}
      >
        <h1>Customer Reviews & Emotion Analysis</h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: 30,
          }}
        >
          Upload text, audio or video reviews and analyze customer emotions.
        </p>

        <UploadReview onAnalysisComplete={loadReviews} />

        <EmotionBarChart data={chartData} />

        <div
          style={{
            background: "#1e293b",
            marginTop: 40,
            borderRadius: 15,
            padding: 20,
          }}
        >
          <h2>Recent Reviews</h2>

          <table
            style={{
              width: "100%",
              marginTop: 20,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={th}>Review Type</th>
                <th style={th}>Emotion</th>
                <th style={th}>Confidence</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    No reviews uploaded yet.
                  </td>
                </tr>
              ) : (
                reviews.map((r, index) => (
                  <tr key={index}>
                    <td style={td}>{r.type}</td>
                    <td style={td}>{r.emotion}</td>
                    <td style={td}>{r.confidence}%</td>
                    <td style={td}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const th = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #334155",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #334155",
};