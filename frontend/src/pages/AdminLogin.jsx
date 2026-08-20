import { useState, useEffect } from "react";
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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const role = localStorage.getItem("role");
    if (userStr && role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/auth/admin-login", {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (res.data && res.data.role === "admin") {
        const adminUser = {
          name: res.data.name || "System Admin",
          email: res.data.email || email,
          role: "admin"
        };
        localStorage.setItem("user", JSON.stringify(adminUser));
        localStorage.setItem("role", "admin");

        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(res.data.message || "Invalid administrator credentials.");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Admin login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8FAFC",
      color: "#0F172A",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative"
    }}>
      {/* Return button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute", top: 28, left: 28,
          background: "#FFFFFF", border: "1px solid #E2E8F0",
          color: "#475569", padding: "10px 18px", borderRadius: 12, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)", transition: "all 0.2s"
        }}
      >
        <FaArrowLeft /> Back to Portal
      </button>

      {/* Admin Login Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: "40px 32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
        position: "relative"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, color: "#FFFFFF", marginBottom: 14,
            boxShadow: "0 6px 18px rgba(37,99,235,0.25)"
          }}>
            <FaUserShield />
          </div>

          <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
            Admin Console Login
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", margin: 0 }}>
            Sign in to access management dashboard &amp; controls
          </p>
        </div>

        {error && (
          <div style={{
            padding: "12px 16px", borderRadius: 12, marginBottom: 20,
            background: "#FEF2F2", border: "1px solid #FCA5A5",
            color: "#DC2626", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <FaShieldAlt /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
              Admin Email
            </label>
            <div style={{ position: "relative" }}>
              <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@tourism.com"
                style={{
                  width: "100%", padding: "12px 14px 12px 38px", borderRadius: 12,
                  border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#0F172A",
                  fontSize: 14, outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: "100%", padding: "12px 42px 12px 38px", borderRadius: 12,
                  border: "1px solid #CBD5E1", background: "#F8FAFC", color: "#0F172A",
                  fontSize: 14, outline: "none", boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0
                }}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
              color: "#FFFFFF", fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)", transition: "all 0.2s"
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>
      </div>
    </div>
  );
}
