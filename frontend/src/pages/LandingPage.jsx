import { useNavigate } from "react-router-dom";
import { FaUser, FaUserShield, FaCompass, FaCheckCircle } from "react-icons/fa";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #0f172a 100%)",
      color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Orbs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%", width: 600, height: 600,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Header Bar */}
      <header style={{
        padding: "24px 48px",
        display: "flex",
        justify: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(10px)",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 16px rgba(37,99,235,0.4)"
          }}>
            ✈️
          </div>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            TravelAI Services
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" }}>
          <FaCheckCircle color="#10b981" /> Official Portal Authorization
        </div>
      </header>

      {/* Hero Body */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justify: "center",
        padding: "60px 24px",
        textAlign: "center",
        zIndex: 10
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)",
          color: "#38bdf8", padding: "8px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700,
          marginBottom: 24
        }}>
          <FaCompass /> Next-Gen Tourism & Booking Portal
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: 900,
          lineHeight: 1.15,
          maxWidth: 900,
          margin: "0 auto 20px",
          letterSpacing: "-1px"
        }}>
          Seamless Luxury Travel & <br />
          <span style={{
            background: "linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Real-Time Reservation Management
          </span>
        </h1>

        <p style={{
          fontSize: "1.15rem",
          color: "#94a3b8",
          maxWidth: 640,
          margin: "0 auto 48px",
          lineHeight: 1.6
        }}>
          Select your portal access below to explore destinations, book luxury hotels & flights, or manage administrative reservations.
        </p>

        {/* Selection Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 28,
          width: "100%",
          maxWidth: 780,
          margin: "0 auto"
        }}>
          {/* User Option */}
          <div
            onClick={() => navigate("/login")}
            style={{
              background: "rgba(30, 41, 59, 0.65)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(56, 189, 248, 0.3)",
              borderRadius: 24,
              padding: "36px 32px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = "#38bdf8";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(56, 189, 248, 0.25)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.3)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, color: "#ffffff", marginBottom: 20,
              boxShadow: "0 8px 20px rgba(2,132,199,0.4)"
            }}>
              <FaUser />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 10px", color: "#ffffff" }}>
              User Access
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 24px" }}>
              Browse curated destinations, search live flights, reserve hotels, and track your booking status.
            </p>

            <button style={{
              width: "100%", padding: "14px 20px", borderRadius: 14,
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "1rem", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
            }}>
              Login as User &rarr;
            </button>
          </div>

          {/* Admin Option */}
          <div
            onClick={() => navigate("/admin/login")}
            style={{
              background: "rgba(30, 41, 59, 0.65)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(168, 85, 247, 0.3)",
              borderRadius: 24,
              padding: "36px 32px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = "#a855f7";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(168, 85, 247, 0.25)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.3)";
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, color: "#ffffff", marginBottom: 20,
              boxShadow: "0 8px 20px rgba(126,34,206,0.4)"
            }}>
              <FaUserShield />
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 10px", color: "#ffffff" }}>
              Admin Access
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 24px" }}>
              Manage customer hotel & flight booking requests, approve pending reservations, and send confirmation emails.
            </p>

            <button style={{
              width: "100%", padding: "14px 20px", borderRadius: 14,
              background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
              color: "#ffffff", fontWeight: 700, fontSize: "1rem", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10
            }}>
              Login as Admin &rarr;
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "20px 40px", textAlign: "center", color: "#64748b", fontSize: 13,
        borderTop: "1px solid rgba(255, 255, 255, 0.05)", zIndex: 10
      }}>
        © 2026 Touristic Services AI Portal. All Rights Reserved.
      </footer>
    </div>
  );
}
