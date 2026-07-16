import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaRegCheckCircle, FaCalendarAlt, FaStar } from "react-icons/fa";
import { getPlaceById } from "../data/destinations";

export default function DestinationDetails() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const place = useMemo(() => getPlaceById(placeId), [placeId]);
  const storageKey = place ? `visited-spots-${place.id}` : null;

  const [visited, setVisited] = useState(() => {
    if (!storageKey) return [];
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  if (!place) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0, color: "white" }}>Destination not found</h1>
          <p style={{ color: "#94a3b8" }}>The place you opened is unavailable.</p>
          <button onClick={() => navigate(-1)} style={primaryButtonStyle}>Go back</button>
        </div>
      </div>
    );
  }

  const visitedCount = visited.length;

  const toggleVisited = (spotName) => {
    setVisited((current) => {
      const next = current.includes(spotName)
        ? current.filter((name) => name !== spotName)
        : [...current, spotName];

      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div style={pageStyle}>
      <div style={{ ...cardStyle, maxWidth: 1180, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 18 }}>
          <button onClick={() => navigate(-1)} style={backButtonStyle}>
            <FaArrowLeft size={11} /> Back
          </button>
          <div style={{ color: "#93c5fd", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
            Destination explorer
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 0.82fr)", gap: 22, alignItems: "start" }}>
          <div>
            <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", border: "1px solid rgba(148,163,184,0.16)" }}>
              <img src={place.img} alt={place.name} style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }} />
              <div style={heroOverlayStyle} />
              <div style={heroBadgeStyle}>{place.category}</div>
              <div style={heroTextStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#dbeafe", fontWeight: 700 }}>
                  <FaMapMarkerAlt /> {place.bestTime}
                </div>
                <h1 style={{ margin: "10px 0 0", fontSize: 38, lineHeight: 1.05 }}>{place.name}</h1>
                <p style={{ margin: "10px 0 0", maxWidth: 700, color: "#e2e8f0", fontSize: 15, lineHeight: 1.7 }}>{place.overview}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
              {[
                { label: "Rating", value: place.rating, icon: <FaStar color="#f59e0b" /> },
                { label: "Reviews", value: place.reviews.toLocaleString(), icon: <FaRegCheckCircle color="#22c55e" /> },
                { label: "Visited", value: `${visitedCount}/${place.visits.length}`, icon: <FaCalendarAlt color="#93c5fd" /> },
              ].map((stat) => (
                <div key={stat.label} style={statCardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                    {stat.icon} {stat.label}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 24, color: "white", fontWeight: 900 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={sideCardStyle}>
              <div style={sectionLabelStyle}>Trip overview</div>
              <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.75, marginTop: 10 }}>
                <div><strong style={{ color: "white" }}>Best time:</strong> {place.bestTime}</div>
                <div style={{ marginTop: 8 }}><strong style={{ color: "white" }}>Traveler sentiment:</strong> {place.sentiment}</div>
                <div style={{ marginTop: 8 }}><strong style={{ color: "white" }}>Base price:</strong> {place.price}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {place.tags.map((tag) => (
                  <span key={tag} style={tagStyle}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={sideCardStyle}>
              <div style={sectionLabelStyle}>Plan your visit</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8, lineHeight: 1.6 }}>
                Mark the places you want to visit here so your trip plan is easier to follow.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: "white" }}>Places to visit at {place.name.split(",")[0]}</h2>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>{visitedCount} marked as visited</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {place.visits.map((spot) => {
              const isVisited = visited.includes(spot.name);
              return (
                <div key={spot.name} style={{ ...spotCardStyle, borderColor: isVisited ? "rgba(34,197,94,0.55)" : "#334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{spot.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, lineHeight: 1.6 }}>{spot.highlight}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#93c5fd", whiteSpace: "nowrap" }}>{spot.time}</div>
                  </div>
                  <button onClick={() => toggleVisited(spot.name)} style={{ ...visitButtonStyle, background: isVisited ? "rgba(34,197,94,0.14)" : "rgba(59,130,246,0.14)", color: isVisited ? "#22c55e" : "#93c5fd" }}>
                    {isVisited ? "Visited" : "Mark visited"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, color: "white" }}>Traveler reviews</h2>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Sample reviews for inspiration</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {place.reviewsData.map((review) => (
              <div key={`${review.name}-${review.date}`} style={reviewCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{review.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{review.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontWeight: 800 }}>
                    <FaStar size={12} /> {review.rating}
                  </div>
                </div>
                <p style={{ margin: "12px 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 30%), #0f172a",
  padding: 24,
  color: "white",
  fontFamily: "'Segoe UI', sans-serif",
  display: "flex",
  justifyContent: "center",
};

const cardStyle = {
  background: "linear-gradient(180deg, rgba(30,41,59,0.96), rgba(15,23,42,0.98))",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 28,
  padding: 24,
  boxShadow: "0 28px 90px rgba(0,0,0,0.35)",
};

const backButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "rgba(15,23,42,0.7)",
  color: "#cbd5e1",
  cursor: "pointer",
  fontWeight: 600,
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const statCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 18,
  padding: 16,
};

const sideCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 22,
  padding: 18,
};

const sectionLabelStyle = {
  fontSize: 12,
  color: "#93c5fd",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 1,
};

const tagStyle = {
  fontSize: 11,
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.2)",
  color: "#cbd5e1",
};

const heroOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.2) 55%, rgba(15,23,42,0.08) 100%)",
};

const heroBadgeStyle = {
  position: "absolute",
  top: 18,
  left: 18,
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(148,163,184,0.18)",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#cbd5e1",
};

const heroTextStyle = {
  position: "absolute",
  left: 22,
  right: 22,
  bottom: 22,
};

const spotCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid #334155",
  borderRadius: 18,
  padding: 16,
};

const reviewCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 18,
  padding: 16,
};

const visitButtonStyle = {
  marginTop: 12,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #334155",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};