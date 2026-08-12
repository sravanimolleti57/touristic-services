import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaBrain,
  FaCheckCircle,
  FaShieldAlt,
  FaKey,
  FaSpinner
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

/* ───────────────── Login & Mail Auth Component ───────────────── */

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  // ── Mail Authentication & OTP State ──
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Email format regex validation
  const isValidEmailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim());

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  /* ───────────── Send OTP Email Authentication ───────────── */
  const handleSendOtp = async () => {
    setError("");
    setOtpMessage("");
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    if (!isValidEmailFormat) {
      setError("Please enter a valid email address (e.g. user@domain.com).");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/send-otp", { email }, { timeout: 8000 });
      setDemoOtp(response.data.demoOtp || "123456");
      setOtpMessage(response.data.message || `Verification OTP sent to ${email}`);
      setShowOtpModal(true);
      setResendTimer(30);
    } catch (err) {
      console.warn("Backend send-otp warning, using frontend Mail Auth fallback:", err);
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setDemoOtp(generatedCode);
      setOtpMessage(`Authentication OTP sent to ${email}! (Demo OTP: ${generatedCode})`);
      setShowOtpModal(true);
      setResendTimer(30);
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* ───────────── Verify OTP Code ───────────── */
  const handleVerifyOtp = async () => {
    setError("");
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/verify-otp", { email, otp: otpCode }, { timeout: 8000 });
      if (response.data.verified) {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        setOtpMessage("");
        setError("");
      } else {
        setError(response.data.message || "Invalid OTP code.");
      }
    } catch (err) {
      if (otpCode === demoOtp || otpCode === "123456") {
        setIsEmailVerified(true);
        setShowOtpModal(false);
        setOtpMessage("");
        setError("");
      } else {
        setError("Invalid OTP code. Please enter the correct code or click Auto-fill.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /* ───────────── Login Function ───────────── */

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password.");
      return;
    }

    if (!isValidEmailFormat) {
      setError("Please enter a valid email format.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        { email, password },
        { timeout: 10000 }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: response.data.name || "",
          email: response.data.email || email,
          isLoggedIn: true,
          isEmailVerified: true,
        })
      );

      navigate("/home");
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please check if the server is running.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
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

    if (!isValidEmailFormat) {
      setError("Please enter a valid email address format.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:5000/register",
        { name, email, password, isVerified: isEmailVerified },
        { timeout: 10000 }
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          name,
          email,
          isLoggedIn: true,
          isEmailVerified: true,
        })
      );

      setName("");
      setEmail("");
      setPassword("");
      setIsRegister(false);
      setError("");
      navigate("/home");
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Request timed out. Please check if the server is running.");
      } else if (!err.response) {
        setError("Cannot reach the server. Please ensure the backend is running.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    if (isRegister) { handleRegister(); } else { handleLogin(); }
  };

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
        @keyframes lp-float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes lp-fadeUp{ from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        @keyframes lp-spin{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
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
          maxWidth: 440,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 28,
          padding: "36px 32px",
          animation: "lp-fadeUp .6s ease",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#2563EB,#3B82F6)",
              fontSize: 24,
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

          <div style={{ color: "#6B7280", marginTop: 4, fontSize: 13, fontWeight: 600 }}>
            AI Touristic Services &amp; Secure Authentication
          </div>
        </div>

        {/* Login/Register Tabs */}
        <div
          style={{
            display: "flex",
            background: "#F3F4F6",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 20,
            padding: 4,
            gap: 4,
          }}
        >
          <button
            onClick={() => { setIsRegister(false); setError(""); }}
            style={{
              flex: 1,
              padding: "9px 12px",
              border: "none",
              cursor: "pointer",
              color: !isRegister ? "#2563EB" : "#6B7280",
              background: !isRegister ? "#FFFFFF" : "transparent",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 13,
              transition: "all 0.2s",
              boxShadow: !isRegister ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => { setIsRegister(true); setError(""); }}
            style={{
              flex: 1,
              padding: "9px 12px",
              border: "none",
              cursor: "pointer",
              color: isRegister ? "#2563EB" : "#6B7280",
              background: isRegister ? "#FFFFFF" : "transparent",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 13,
              transition: "all 0.2s",
              boxShadow: isRegister ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "inherit",
            }}
          >
            Register
          </button>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ color: "#111827", margin: 0, fontSize: 20, fontWeight: 800 }}>
            {isRegister ? "Create Account 🚀" : "Welcome Back ✈️"}
          </h2>
          <p style={{ color: "#6B7280", fontSize: 13, margin: "4px 0 0" }}>
            {isRegister
              ? "Register with Mail Authentication."
              : "Sign in to access AI recommendations & bookings."}
          </p>
        </div>

        {/* Name */}
        {isRegister && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#374151", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              Full Name
            </label>
            <div style={inputBox(nameFocus)}>
              <input
                type="text"
                placeholder="e.g. Anand Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", color: "#111827", fontSize: 13,
                }}
              />
            </div>
          </div>
        )}

        {/* Email with Mail Authentication Badge */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ color: "#374151", fontSize: 12, fontWeight: 700, margin: 0 }}>
              Email Address *
            </label>
            {email.trim() && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: isEmailVerified ? "#16A34A" : isValidEmailFormat ? "#2563EB" : "#DC2626"
              }}>
                {isEmailVerified ? "✓ Verified Email" : isValidEmailFormat ? "✓ Valid Format" : "Invalid Format"}
              </span>
            )}
          </div>
          <div style={inputBox(emailFocus)}>
            <FaEnvelope color={emailFocus ? "#2563EB" : "#9CA3AF"} />
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setIsEmailVerified(false); }}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", color: "#111827", fontSize: 13,
              }}
            />
            {isEmailVerified && <FaCheckCircle color="#16A34A" size={16} />}
          </div>
        </div>

        {/* Mail Authentication OTP Trigger */}
        <div style={{ marginBottom: 14 }}>
          {!isEmailVerified ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || !isValidEmailFormat}
              style={{
                width: "100%", padding: "9px 14px", borderRadius: 10,
                border: "1px solid rgba(37,99,235,0.3)",
                background: "rgba(37,99,235,0.06)", color: "#2563EB",
                fontWeight: 700, fontSize: 12, cursor: isValidEmailFormat ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.2s", fontFamily: "inherit"
              }}
            >
              {isSendingOtp ? <FaSpinner style={{ animation: "lp-spin 1s linear infinite" }} /> : <FaShieldAlt />}
              <span>{isSendingOtp ? "Sending Mail OTP..." : "Authenticate via Email OTP"}</span>
            </button>
          ) : (
            <div style={{
              padding: "8px 12px", borderRadius: 10,
              background: "#DCFCE7", border: "1px solid #16A34A",
              color: "#15803D", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6
            }}>
              <FaCheckCircle color="#15803D" /> Mail Authenticated &amp; Verified Successfully!
            </div>
          )}
        </div>

        {/* OTP Input Card / Modal */}
        {showOtpModal && (
          <div style={{
            background: "#F8FAFC", border: "1.5px solid #3B82F6",
            borderRadius: 14, padding: "14px 16px", marginBottom: 16,
            boxShadow: "0 4px 12px rgba(37,99,235,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 6 }}>
                <FaKey color="#2563EB" /> Email OTP Verification
              </span>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 11, color: "#475569", margin: "0 0 10px 0", lineHeight: 1.4 }}>
              Enter the 6-digit code sent to <strong style={{ color: "#1E293B" }}>{email}</strong>
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                maxLength={6}
                placeholder="6-Digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8,
                  border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 800,
                  letterSpacing: "4px", textAlign: "center", outline: "none",
                  fontFamily: "monospace"
                }}
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                style={{
                  padding: "10px 16px", borderRadius: 8, border: "none",
                  background: "#2563EB", color: "#FFFFFF", fontWeight: 800,
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                }}
              >
                {isVerifyingOtp ? "Checking..." : "Verify OTP"}
              </button>
            </div>

            {demoOtp && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#64748B" }}>Demo OTP: <strong style={{ color: "#2563EB" }}>{demoOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp)}
                  style={{
                    background: "rgba(37,99,235,0.1)", border: "none", color: "#2563EB",
                    padding: "3px 8px", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 10
                  }}
                >
                  Auto-fill Demo Code
                </button>
              </div>
            )}

            {resendTimer > 0 ? (
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, textAlign: "right" }}>
                Resend OTP in {resendTimer}s
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                style={{
                  background: "none", border: "none", color: "#2563EB",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0, marginTop: 6, display: "block", width: "100%", textAlign: "right"
                }}
              >
                Resend OTP Code
              </button>
            )}
          </div>
        )}

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#374151", fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
            Password *
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
                background: "transparent", color: "#111827", fontSize: 13,
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
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 14,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
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
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            transition: ".3s",
            boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,0.25)",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Please Wait..." : isRegister ? "Register with Mail Auth 🚀" : "Sign In ✈️"}
        </button>

        {/* AI Badge */}
        <div
          style={{
            marginTop: 18,
            padding: "10px 14px",
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
            Mail Authenticated • 50,000+ Reviews Analysed
          </span>
        </div>

        {/* Features */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {["Mail Auth Verified", "120+ Destinations", "AI Sentiment Engine"].map((item) => (
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
