import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import axios from "axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/admin-login", {
        email: email.trim(),
        password: password.strip ? password.strip() : password
      });

      if (res.data && res.data.role === "admin") {
        const adminUser = {
          name: res.data.name || "System Admin",
          email: res.data.email || email,
          role: "admin"
        };
        localStorage.setItem("user", JSON.stringify(adminUser));
        localStorage.setItem("role", "admin");

        navigate("/admin/dashboard");
      } else {
        setError(res.data.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Admin login failed. Please check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)",
      color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justify: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
        top: "20%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none"
      }} />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute", top: 32, left: 32,
          background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#ffffff", padding: "10px 18px", borderRadius: 12, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600,
          backdropFilter: "blur(10px)", transition: "all 0.2s"
        }}
      >
        <FaArrowLeft /> Return to Portal Choice
      </button>

      {/* Admin Login Card */}
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(30, 41, 59, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        borderRadius: 24,
        padding: "44px 36px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        position: "relative", zIndex: 10
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, color: "#ffffff", marginBottom: 16,
            boxShadow: "0 8px 24px rgba(168,85,247,0.4)"
          }}>
            <FaUserShield />
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", color: "#ffffff" }}>
            Admin Portal Sign In
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
            Management authentication required
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)",
            color: "#f87171", padding: "12px 16px", borderRadius: 12, fontSize: 13,
            marginBottom: 20, display: "flex", alignItems: "center", gap: 10
          }}>
            <FaShieldAlt /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Email field */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Administrator Email
            </label>
            <div style={{ position: "relative" }}>
              <FaEnvelope style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tourism.com"
                style={{
                  width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12,
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Admin Secret Key / Password
            </label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%", padding: "14px 44px 14px 44px", borderRadius: 12,
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#94a3b8", cursor: "pointer"
                }}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Quick Credential Hint for Demo */}
          <div style={{
            background: "rgba(168, 85, 247, 0.1)", border: "1px dashed rgba(168, 85, 247, 0.3)",
            borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#c084fc", textAlign: "center"
          }}>
            Default Admin: <strong>admin@tourism.com</strong> | Password: <strong>admin123</strong>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "15px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #7e22ce 0%, #a855f7 100%)",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 8px 20px rgba(126, 34, 206, 0.4)",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Authenticating Admin..." : "Access Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
