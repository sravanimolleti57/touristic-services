import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaBrain } from "react-icons/fa";


/* ── Floating orb background ──────────────────────────────── */
function Orbs() {
  const orbs = [
    { w:420, h:420, top:"-10%",  left:"-8%",  c:"rgba(59,130,246,0.12)",  delay:"0s" },
    { w:320, h:320, top:"55%",   right:"-6%", c:"rgba(139,92,246,0.10)",  delay:"-3s" },
    { w:200, h:200, top:"30%",   left:"40%",  c:"rgba(6,182,212,0.07)",   delay:"-1.5s" },
    { w:180, h:180, bottom:"5%", left:"15%",  c:"rgba(59,130,246,0.08)",  delay:"-2s" },
  ];
  return (
    <>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position:"absolute", borderRadius:"50%", pointerEvents:"none",
          width:o.w, height:o.h,
          top:o.top||"auto", bottom:o.bottom||"auto",
          left:o.left||"auto", right:o.right||"auto",
          background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`,
          animation:`lp-float 7s ease-in-out infinite`,
          animationDelay:o.delay,
        }} />
      ))}
    </>
  );
}

/* ── Travel icon particle ─────────────────────────────────── */
function FloatingIcon({ icon, style }) {
  return (
    <div style={{
      position:"absolute", fontSize:22, opacity:0.12, pointerEvents:"none",
      animation:"lp-float 8s ease-in-out infinite",
      ...style,
    }}>{icon}</div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [emailFocus,  setEmailFocus]  = useState(false);
  const [pwFocus,     setPwFocus]     = useState(false);

  const handleLogin = async () => {
  setError("");

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  if (!emailRegex.test(email)) {
    setError("Please enter a valid Gmail address.");
    return;
  }

  if (!passwordRegex.test(password)) {
    setError(
      "Password must contain uppercase, lowercase, number and special character."
    );
    return;
  }

  try {
    setLoading(true);

    const res = await loginUser({
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    navigate("/home");

  } catch (err) {
  console.log("Full Error:", err);
  console.log("Response:", err.response);
  console.log("Data:", err.response?.data);

  setError(err.response?.data?.message || "Login failed");
} finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  /* ── Shared input style ─────────────────────────────────── */
  const inputBox = (focused) => ({
    display:"flex", alignItems:"center", gap:10,
    background:"rgba(15,23,42,0.65)",
    border:`1px solid ${focused ? "#3b82f6" : "rgba(148,163,184,0.15)"}`,
    borderRadius:14, padding:"14px 18px",
    boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
    transition:"all 0.25s",
  });

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#050b18 0%,#0a1128 50%,#0f172a 100%)",
      fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
      position:"relative", overflow:"hidden", padding:20,
    }}>
      {/* Keyframes */}
      <style>{`
        @keyframes lp-float {
          0%,100% { transform:translateY(0) rotate(0deg); }
          33% { transform:translateY(-14px) rotate(2deg); }
          66% { transform:translateY(8px) rotate(-1deg); }
        }
        @keyframes lp-fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lp-spin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes lp-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.5; transform:scale(.85); }
        }
      `}</style>

      <Orbs />

      {/* Floating travel icons */}
      <FloatingIcon icon="✈️" style={{ top:"8%",  left:"6%",  animationDelay:"-1s" }} />
      <FloatingIcon icon="🏝️" style={{ top:"70%", left:"5%",  animationDelay:"-3s" }} />
      <FloatingIcon icon="🗺️" style={{ top:"15%", right:"8%", animationDelay:"-5s" }} />
      <FloatingIcon icon="🏔️" style={{ top:"78%", right:"7%", animationDelay:"-2s" }} />
      <FloatingIcon icon="🌍" style={{ top:"40%", left:"3%",  animationDelay:"-4s" }} />
      <FloatingIcon icon="🏰" style={{ bottom:"10%",right:"3%",animationDelay:"-1.5s"}}/>

      {/* Glass login card */}
      <div style={{
        width:"100%", maxWidth:420,
        background:"rgba(15,23,42,0.72)",
        backdropFilter:"blur(32px)",
        WebkitBackdropFilter:"blur(32px)",
        border:"1px solid rgba(148,163,184,0.12)",
        borderRadius:28, padding:"40px 36px",
        boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.06)",
        animation:"lp-fadeUp 0.6s ease",
        position:"relative", zIndex:10,
      }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{
            width:56, height:56, borderRadius:16, margin:"0 auto 14px",
            background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:26, boxShadow:"0 8px 30px rgba(59,130,246,0.35)",
          }}>✈️</div>
          <div style={{
            fontSize:26, fontWeight:900,
            background:"linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            marginBottom:6,
          }}>TravelAI</div>
          <div style={{ fontSize:14, color:"#94a3b8" }}>
            AI-Touristic Services
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom:26 }}>
          <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:"white" }}>
            Welcome Back ✈️
          </h1>
          <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
            Sign in to explore Touristic services!!
          </p>
        </div>

        {/* Email field */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:8 }}>
            Email Address
          </label>
          <div style={inputBox(emailFocus)}>
            <FaEnvelope size={14} color={emailFocus ? "#3b82f6" : "#64748b"} style={{ flexShrink:0 }} />
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                color:"white", fontSize:14, fontFamily:"inherit",
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:600, marginBottom:8 }}>
            Password
          </label>
          <div style={inputBox(pwFocus)}>
            <FaLock size={14} color={pwFocus ? "#3b82f6" : "#64748b"} style={{ flexShrink:0 }} />
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                color:"white", fontSize:14, fontFamily:"inherit",
              }}
            />
            <div
              onClick={() => setShowPw(!showPw)}
              style={{ cursor:"pointer", color:showPw ? "#3b82f6" : "#64748b", fontSize:15, flexShrink:0 }}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom:16, padding:"12px 14px",
            background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.25)",
            borderRadius:12, color:"#fca5a5", fontSize:13, lineHeight:1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:"100%", padding:"15px", borderRadius:14, border:"none",
            background: loading ? "#334155" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            color: loading ? "#64748b" : "white",
            fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer",
            fontFamily:"inherit", boxShadow: loading ? "none" : "0 8px 30px rgba(59,130,246,0.35)",
            transition:"all 0.25s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          }}
        >
          {loading ? (
            <>
              <span style={{ width:16, height:16, border:"2px solid #64748b", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"lp-spin 0.7s linear infinite" }} />
              Signing in...
            </>
          ) : "Sign In ✈️"}
        </button>

        {/* AI badge */}
        <div style={{
          marginTop:18, padding:"10px 14px",
          background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.15)",
          borderRadius:12, display:"flex", alignItems:"center", gap:8,
        }}>
          <FaBrain size={13} color="#3b82f6" />
          <span style={{ fontSize:12, color:"#94a3b8" }}>
            <strong style={{ color:"#93c5fd" }}>AI-powered</strong> — 50,000+ reviews analyzed daily
          </span>
          <span style={{ marginLeft:"auto", width:7, height:7, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e", flexShrink:0, animation:"lp-pulse 1.5s infinite" }} />
        </div>

        {/* Bottom links */}
        <div style={{ marginTop:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Link to="/forgot-password" style={{ fontSize:13, color:"#64748b", textDecoration:"none", transition:"color .2s" }}
            onMouseEnter={e => e.target.style.color="#93c5fd"}
            onMouseLeave={e => e.target.style.color="#64748b"}
          >
            Forgot Password?
          </Link>
          <Link to="/register" style={{
            fontSize:13, color:"#3b82f6", textDecoration:"none", fontWeight:600,
            padding:"6px 14px", borderRadius:8, border:"1px solid rgba(59,130,246,0.25)",
            background:"rgba(59,130,246,0.08)", transition:"all .2s",
          }}
            onMouseEnter={e => { e.target.style.background="rgba(59,130,246,0.18)"; }}
            onMouseLeave={e => { e.target.style.background="rgba(59,130,246,0.08)"; }}
          >
            Create Account
          </Link>
        </div>

        {/* Feature pills */}
        <div style={{ marginTop:24, display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
          {["120+ Destinations","800+ Hotels","AI Sentiment Analysis"].map(f => (
            <span key={f} style={{
              fontSize:11, padding:"4px 10px", borderRadius:20,
              background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.1)",
              color:"#64748b",
            }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;