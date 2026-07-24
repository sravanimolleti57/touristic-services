import { useMemo, useState, useEffect } from "react";
import {
  FaUpload, FaPlayCircle, FaMicrophone, FaComments,
  FaChartBar, FaRegCheckCircle, FaTrash
} from "react-icons/fa";
import SharedNavbar from "../components/SharedNavbar";
import "../styles/shared.css";
import { addReview, getReviews } from "../services/reviewService";


/* ────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────── */
function typeMeta(type) {
  if (type === "audio") return { color:"#22c55e", label:"Audio",  emoji:"🎙️" };
  if (type === "video") return { color:"#f59e0b", label:"Video",  emoji:"🎬" };
  return                        { color:"#3b82f6", label:"Text",   emoji:"✍️" };
}

function FilePreview({ name, type }) {
  return (
    <div style={{
      marginTop:10, padding:"10px 12px", borderRadius:10,
      background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)",
      color:"#93c5fd", fontSize:12, display:"flex", alignItems:"center", gap:8,
    }}>
      {type === "Audio" ? "🎙️" : "🎬"} {name}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   DASHBOARD
   ──────────────────────────────────────────────────────────── */
function Dashboard() {

  const [reviewText,  setReviewText]  = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [audioFile,   setAudioFile]   = useState(null);
  const [videoFile,   setVideoFile]   = useState(null);
  const [submitted,   setSubmitted]   = useState(false);
  const [titleFocus,  setTitleFocus]  = useState(false);
  const [textFocus,   setTextFocus]   = useState(false);

  const [reviews, setReviews] = useState([]);

  const stats = useMemo(() => ({
    total: reviews.length,
    text:  reviews.filter(r => r.type === "text").length,
    audio: reviews.filter(r => r.type === "audio").length,
    video: reviews.filter(r => r.type === "video").length,
  }), [reviews]);

useEffect(() => {
  fetchReviews();
}, []);

const fetchReviews = async () => {
  try {
    const response = await getReviews();
    setReviews(response.data.reviews || []);
  } catch (error) {
    console.error(error);
  }
};


  
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!reviewText.trim()) {
    alert("Please enter a review.");
    return;
  }

  try {
    // Send review to backend
    const response = await addReview({
      review: reviewText,
    });

    // Add the newly saved review to the top of the list
    setReviews((prev) => [response.data.review, ...prev]);

    // Clear form
    setReviewTitle("");
    setReviewText("");
    setAudioFile(null);
    setVideoFile(null);

    e.target.reset();

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);

  } catch (error) {
    console.error(error);
    alert("Failed to submit review.");
  }
};

  const deleteReview = (id) => {
  setReviews(reviews.filter((r) => r._id !== id));
};

  /* ── Shared styles ────────────────────────────────────────── */
  const inputStyle = (focused) => ({
    width:"100%", boxSizing:"border-box",
    background:"rgba(5,11,24,0.7)",
    border:`1px solid ${focused ? "#3b82f6" : "rgba(148,163,184,0.12)"}`,
    borderRadius:12, padding:"12px 16px", color:"white",
    fontSize:14, fontFamily:"inherit", outline:"none",
    boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
    transition:"all 0.25s",
    resize:"vertical",
  });

  return (
    <div className="sr-page">
      <SharedNavbar activeTab="reviews" />

      {/* Keyframes */}
      <style>{`
        @keyframes dash-fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="sr-main" style={{ padding:"80px 0 60px" }}>
        <div style={{ maxWidth:1320, margin:"0 auto", padding:"0 32px" }}>

          {/* ── Hero banner ────────────────────────────────── */}
          <div style={{
            borderRadius:28, padding:"36px 40px",
            background:"linear-gradient(135deg,rgba(59,130,246,0.12) 0%,rgba(139,92,246,0.10) 100%)",
            border:"1px solid rgba(59,130,246,0.18)",
            display:"flex", justifyContent:"space-between", alignItems:"center", gap:24,
            flexWrap:"wrap", marginBottom:36,
            animation:"dash-fadeUp 0.5s ease",
          }}>
            <div>
              <div className="sr-section-tag"><FaComments size={11} /> Reviews Center</div>
              <h1 style={{ margin:"10px 0 10px", fontSize:32, fontWeight:900, color:"white", lineHeight:1.15 }}>
                Share Your Travel Stories
              </h1>
              <p style={{ margin:0, fontSize:15, color:"#94a3b8", lineHeight:1.7, maxWidth:560 }}>
                Give fellow travelers a richer way to share feedback — quick text notes,
                voice reviews, and short video clips all in one place.
              </p>
            </div>
            <button
              className="sr-btn"
              onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior:"smooth" })}
            >
              + Write a Review
            </button>
          </div>

          {/* ── Stat pills ─────────────────────────────────── */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:36,
          }}>
            {[
              { label:"Total Reviews", value:stats.total, icon:"📋", c:"#3b82f6" },
              { label:"Text",          value:stats.text,  icon:"✍️", c:"#8b5cf6" },
              { label:"Audio",         value:stats.audio, icon:"🎙️", c:"#22c55e" },
              { label:"Video",         value:stats.video, icon:"🎬", c:"#f59e0b" },
            ].map(({ label, value, icon, c }) => (
              <div key={label} style={{
                background:"rgba(15,23,42,0.7)", backdropFilter:"blur(20px)",
                border:"1px solid rgba(148,163,184,0.10)",
                borderRadius:20, padding:"20px 24px",
                display:"flex", alignItems:"center", gap:14,
                animation:"dash-fadeUp 0.5s ease",
              }}>
                <div style={{
                  width:44, height:44, borderRadius:12, fontSize:20,
                  background:`${c}18`, border:`1px solid ${c}30`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{icon}</div>
                <div>
                  <div style={{ fontSize:26, fontWeight:900, color:"white", lineHeight:1 }}>{value}</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Success toast ───────────────────────────────── */}
          {submitted && (
            <div style={{
              marginBottom:20, padding:"14px 20px",
              background:"rgba(34,197,94,0.10)", border:"1px solid rgba(34,197,94,0.25)",
              borderRadius:14, color:"#86efac", fontSize:14,
              display:"flex", alignItems:"center", gap:10,
              animation:"dash-fadeUp 0.3s ease",
            }}>
              <FaRegCheckCircle color="#22c55e" /> Review submitted successfully!
            </div>
          )}

          {/* ── Two column: form + list ─────────────────────── */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"minmax(340px,1fr) minmax(340px,1.1fr)",
            gap:24, alignItems:"start",
          }}>

            {/* Upload form */}
            <div id="review-form" style={{
              background:"rgba(15,23,42,0.72)", backdropFilter:"blur(20px)",
              WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(148,163,184,0.10)",
              borderRadius:24, padding:28,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <div className="sr-section-tag"><FaUpload size={11} /> Add New Review</div>
                  <h2 style={{ margin:"6px 0 0", fontSize:20, fontWeight:800, color:"white" }}>Upload a Review</h2>
                </div>
                <div style={{ fontSize:28 }}>✍️</div>
              </div>

              <form onSubmit={handleSubmit} style={{ display:"grid", gap:16 }}>
                {/* Title */}
                <div>
                  <label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:8 }}>
                    Review Title
                  </label>
                  <input
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    onFocus={() => setTitleFocus(true)}
                    onBlur={() => setTitleFocus(false)}
                    placeholder="Trip summary or destination name"
                    style={inputStyle(titleFocus)}
                  />
                </div>

                {/* Body */}
                <div>
                  <label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:8 }}>
                    Text Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    onFocus={() => setTextFocus(true)}
                    onBlur={() => setTextFocus(false)}
                    placeholder="Share what you liked, what to avoid, and any travel tips..."
                    rows={5}
                    style={{ ...inputStyle(textFocus), resize:"vertical", minHeight:120 }}
                  />
                </div>

                {/* Media uploads */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {[
                    { label:"Audio Review", icon:<FaMicrophone color="#22c55e" />, accept:"audio/*", file:audioFile, set:setAudioFile, type:"Audio", hint:"mp3, wav, m4a" },
                    { label:"Video Review", icon:<FaPlayCircle color="#f59e0b" />, accept:"video/*", file:videoFile, set:setVideoFile, type:"Video", hint:"mp4, mov, webm" },
                  ].map(({ label, icon, accept, file, set, type, hint }) => (
                    <div key={type} style={{
                      background:"rgba(5,11,24,0.6)", border:"1px solid rgba(148,163,184,0.10)",
                      borderRadius:14, padding:14,
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        {icon}
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:"white" }}>{label}</div>
                          <div style={{ fontSize:11, color:"#64748b" }}>{hint}</div>
                        </div>
                      </div>
                      <input
                        type="file" accept={accept}
                        onChange={e => set(e.target.files?.[0] || null)}
                        style={{ width:"100%", color:"#94a3b8", fontSize:12 }}
                      />
                      {file && <FilePreview name={file.name} type={type} />}
                    </div>
                  ))}
                </div>

                <button type="submit" className="sr-btn" style={{ width:"100%", justifyContent:"center" }}>
                  Save Review
                </button>
              </form>
            </div>

            {/* Reviews list */}
            <div style={{
              background:"rgba(15,23,42,0.72)", backdropFilter:"blur(20px)",
              WebkitBackdropFilter:"blur(20px)", border:"1px solid rgba(148,163,184,0.10)",
              borderRadius:24, padding:28,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <div className="sr-section-tag"><FaChartBar size={11} /> Published Reviews</div>
                  <h2 style={{ margin:"6px 0 0", fontSize:20, fontWeight:800, color:"white" }}>Recent Submissions</h2>
                </div>
                <div style={{
                  fontSize:12, color:"#94a3b8", background:"rgba(30,41,59,0.7)",
                  padding:"5px 12px", borderRadius:20, border:"1px solid rgba(148,163,184,0.1)",
                }}>
                  {reviews.length} items
                </div>
              </div>

              <div style={{ display:"grid", gap:14, maxHeight:"68vh", overflowY:"auto", paddingRight:4 }}>
                {reviews.map((rev) => {
                  const meta = typeMeta(rev.type);
                  return (
                    <article key={rev.id} style={{
                      background:"rgba(5,11,24,0.65)", border:"1px solid rgba(148,163,184,0.08)",
                      borderRadius:18, padding:"16px 18px",
                      transition:"border-color .2s, transform .2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(59,130,246,0.25)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(148,163,184,0.08)"; e.currentTarget.style.transform=""; }}
                    >
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontSize:16 }}>{meta.emoji}</span>
                          <h3 style={{ margin:0, fontSize:15, color:"white", fontWeight:700 }}>{rev.title}</h3>
                          <span style={{
                            fontSize:11, padding:"3px 9px", borderRadius:20,
                            background:`${meta.color}18`, border:`1px solid ${meta.color}40`,
                            color:meta.color, fontWeight:700, textTransform:"capitalize",
                          }}>{meta.label}</span>
                        </div>
                        <button
                          onClick={() => deleteReview(rev.id)}
                          style={{
                            background:"none", border:"none", cursor:"pointer",
                            color:"#475569", padding:4, fontSize:13, flexShrink:0,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div style={{ fontSize:11, color:"#475569", marginBottom:8 }}>{rev.createdAt}</div>
                      <p style={{ margin:0, color:"#94a3b8", fontSize:13, lineHeight:1.7 }}>{rev.content}</p>

                      {rev.mediaName && (
                        <div style={{
                          marginTop:10, padding:"8px 12px", borderRadius:10,
                          background:"rgba(59,130,246,0.08)", color:"#93c5fd", fontSize:12,
                          display:"flex", alignItems:"center", gap:6,
                        }}>
                          {rev.type === "audio" ? "🎙️" : "🎬"} {rev.mediaName}
                        </div>
                      )}
                      {rev.type === "audio" && rev.mediaUrl && (
                        <audio controls style={{ width:"100%", marginTop:10 }} src={rev.mediaUrl} />
                      )}
                      {rev.type === "video" && rev.mediaUrl && (
                        <video controls style={{ width:"100%", marginTop:10, borderRadius:10, border:"1px solid rgba(148,163,184,0.1)" }} src={rev.mediaUrl} />
                      )}
                    </article>
                  );
                })}

                {reviews.length === 0 && (
                  <div className="sr-empty" style={{ padding:"40px 20px" }}>
                    <div className="sr-empty-icon">📝</div>
                    <h3 style={{ color:"#94a3b8" }}>No reviews yet</h3>
                    <p>Write your first travel review above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width:900px) {
          #review-form + div { grid-template-columns:1fr; }
        }
        @media (max-width:768px) {
          .dash-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
