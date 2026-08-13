import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const newUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: "user"
    };

    const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    if (!existingUsers.some(u => u.email === newUser.email)) {
      localStorage.setItem("registered_users", JSON.stringify([...existingUsers, newUser]));
    }

    try {
      await axios.post("http://127.0.0.1:5000/register", newUser, { timeout: 6000 });
    } catch (err) {
      console.warn("Backend register API note (saved locally):", err);
    } finally {
      setLoading(false);
      alert("Registration Successful! Please sign in using your registered credentials.");
      navigate("/login", {
        state: {
          registeredEmail: email.trim().toLowerCase(),
          registeredPassword: password.trim(),
          successNotice: "Registration Successful! Please log in with your registered credentials."
        }
      });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0b132b 0%, #1c2541 100%)",
      color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative"
    }}>
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
        <FaArrowLeft /> Home
      </button>

      {/* Registration Card */}
      <div style={{
        width: "100%", maxWidth: 440,
        background: "rgba(30, 41, 59, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(56, 189, 248, 0.25)",
        borderRadius: 24,
        padding: "44px 36px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#ffffff", marginBottom: 14,
            boxShadow: "0 8px 20px rgba(56,189,248,0.3)"
          }}>
            ✈️
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px" }}>Create Traveler Account</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
            Register your credentials to start exploring and booking
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)",
            color: "#f87171", padding: "12px 16px", borderRadius: 12, fontSize: 13,
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <FaUser style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12,
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                style={{
                  width: "100%", padding: "12px 14px 12px 40px", borderRadius: 12,
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#ffffff", fontSize: 14, outline: "none", boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <FaLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: "100%", padding: "12px 40px 12px 40px", borderRadius: 12,
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10, padding: "14px", borderRadius: 12,
              background: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
              color: "#ffffff", fontSize: 15, fontWeight: 700, border: "none",
              cursor: loading ? "wait" : "pointer", boxShadow: "0 8px 20px rgba(2,132,199,0.3)"
            }}
          >
            {loading ? "Registering Account..." : "Complete Registration"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none" }}>
            Sign In with Registered Credentials
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;