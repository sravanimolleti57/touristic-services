import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaBrain,
} from "react-icons/fa";
import axios from "axios";

/* ───────────────── Floating Background ───────────────── */

function Orbs() {
  const orbs = [
    { w: 500, h: 500, top: "-15%", left: "-10%", c: "rgba(37,99,235,0.06)", delay: "0s" },
    { w: 350, h: 350, top: "60%", right: "-8%", c: "rgba(14,165,233,0.05)", delay: "-3s" },
    { w: 220, h: 220, top: "35%", left: "42%", c: "rgba(99,102,241,0.04)", delay: "-1.5s" },
    { w: 180, h: 180, bottom: "5%", left: "15%", c: "rgba(37,99,235,0.04)", delay: "-2s" },
  ];

  return (
    <>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            pointerEvents: "none",
            width: o.w,
            height: o.h,
            top: o.top || "auto",
            bottom: o.bottom || "auto",
            left: o.left || "auto",
            right: o.right || "auto",
            background: `radial-gradient(circle,${o.c} 0%,transparent 70%)`,
            animation: "lp-float 7s ease-in-out infinite",
            animationDelay: o.delay,
          }}
        />
      ))}
    </>
  );
}

/* ───────────────── Floating Icons ───────────────── */

function FloatingIcon({ icon, style }) {
  return (
    <div
      style={{
        position: "absolute",
        fontSize: 22,
        opacity: 0.08,
        pointerEvents: "none",
        animation: "lp-float 8s ease-in-out infinite",
        ...style,
      }}
    >
      {icon}
    </div>
  );
}

/* ───────────────── Login Component ───────────────── */

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  /* ───────────── Login Function ───────────── */

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        { email, password }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: response.data.name,
          email: response.data.email,
          isLoggedIn: true,
        })
      );

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────── Register Function ───────────── */

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:5000/register", { name, email, password });

      setName("");
      setEmail("");
      setPassword("");
      setIsRegister(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────── Enter Key ───────────── */

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (isRegister) { handleRegister(); } else { handleLogin(); }
  };

  /* ───────────── Shared Input Style ───────────── */

  const inputBox = (focused) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#FFFFFF",
    border: `1.5px solid ${focused ? "#2563EB" : "#E5E7EB"}`,
    borderRadius: 12,
    padding: "13px 16px",
    boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
    transition: "all .25s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#EFF6FF 0%,#F8FAFC 50%,#F0F9FF 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes lp-float{
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }
        @keyframes lp-fadeUp{
          from{opacity:0;transform:translateY(30px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes lp-spin{
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }
        @keyframes lp-pulse{
          0%,100%{opacity:1;}
          50%{opacity:.5;}
        }
      `}</style>

      <Orbs />

      <FloatingIcon icon="✈️" style={{ top: "8%", left: "6%" }} />
      <FloatingIcon icon="🏝️" style={{ top: "70%", left: "5%" }} />
      <FloatingIcon icon="🗺️" style={{ top: "15%", right: "8%" }} />
      <FloatingIcon icon="🏔️" style={{ top: "80%", right: "8%" }} />
      <FloatingIcon icon="🌍" style={{ top: "45%", left: "3%" }} />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 28,
          padding: "40px 36px",
          animation: "lp-fadeUp .6s ease",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              fontSize: 26,
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
            }}
          >
            ✈️
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              background: "linear-gradient(135deg,#2563EB,#0EA5E9,#6366F1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TravelAI
          </div>

          <div style={{ color: "#6B7280", marginTop: 5, fontSize: 14 }}>
            AI Touristic Services
          </div>
        </div>

        {/* Login/Register Tabs */}
        <div
          style={{
            display: "flex",
            background: "#F3F4F6",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 25,
            padding: 4,
            gap: 4,
          }}
        >
          <button
            onClick={() => { setIsRegister(false); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "none",
              cursor: "pointer",
              color: !isRegister ? "#2563EB" : "#6B7280",
              background: !isRegister ? "#FFFFFF" : "transparent",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
              boxShadow: !isRegister ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
            }}
          >
            Login
          </button>

          <button
            onClick={() => { setIsRegister(true); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "none",
              cursor: "pointer",
              color: isRegister ? "#2563EB" : "#6B7280",
              background: isRegister ? "#FFFFFF" : "transparent",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              transition: "all 0.2s",
              boxShadow: isRegister ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
            }}
          >
            Register
          </button>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: "#111827", margin: 0, fontSize: 22, fontWeight: 800 }}>
            {isRegister ? "Create Account 🚀" : "Welcome Back ✈️"}
          </h2>
          <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14, margin: "6px 0 0" }}>
            {isRegister
              ? "Register to explore AI Touristic Services."
              : "Sign in to continue your journey."}
          </p>
        </div>

        {/* Name */}
        {isRegister && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>
              Full Name
            </label>
            <div style={inputBox(nameFocus)}>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", color: "#111827", fontSize: 14,
                }}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>
            Email Address
          </label>
          <div style={inputBox(emailFocus)}>
            <FaEnvelope color={emailFocus ? "#2563EB" : "#9CA3AF"} />
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", color: "#111827", fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>
            Password
          </label>
          <div style={inputBox(pwFocus)}>
            <FaLock color={pwFocus ? "#2563EB" : "#9CA3AF"} />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", color: "#111827", fontSize: 14,
              }}
            />
            <span onClick={() => setShowPw(!showPw)} style={{ cursor: "pointer", color: "#9CA3AF" }}>
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(220,38,38,.06)",
              border: "1px solid rgba(220,38,38,.2)",
              color: "#DC2626",
              padding: "11px 14px",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={async () => {
            if (isRegister) { await handleRegister(); } else { await handleLogin(); }
          }}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: 12,
            background: loading
              ? "#E5E7EB"
              : "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: loading ? "#9CA3AF" : "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: ".3s",
            boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.25)",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Please Wait..." : isRegister ? "Register 🚀" : "Sign In ✈️"}
        </button>

        {/* AI Badge */}
        <div
          style={{
            marginTop: 20,
            padding: "11px 14px",
            background: "rgba(37,99,235,.05)",
            border: "1px solid rgba(37,99,235,.12)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FaBrain color="#2563EB" />
          <span style={{ color: "#6B7280", fontSize: 12 }}>
            AI Powered • 50,000+ Reviews Analysed
          </span>
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {["120+ Destinations", "800+ Hotels", "AI Sentiment Analysis"].map((item) => (
            <span
              key={item}
              style={{
                padding: "5px 10px",
                borderRadius: 20,
                background: "#F3F4F6",
                border: "1px solid #E5E7EB",
                color: "#6B7280",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
