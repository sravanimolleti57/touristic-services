import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaBrain,
} from "react-icons/fa";

/* ───────────────── Floating Background ───────────────── */

function Orbs() {
  const orbs = [
    {
      w: 420,
      h: 420,
      top: "-10%",
      left: "-8%",
      c: "rgba(59,130,246,0.12)",
      delay: "0s",
    },
    {
      w: 320,
      h: 320,
      top: "55%",
      right: "-6%",
      c: "rgba(139,92,246,0.10)",
      delay: "-3s",
    },
    {
      w: 200,
      h: 200,
      top: "30%",
      left: "40%",
      c: "rgba(6,182,212,0.07)",
      delay: "-1.5s",
    },
    {
      w: 180,
      h: 180,
      bottom: "5%",
      left: "15%",
      c: "rgba(59,130,246,0.08)",
      delay: "-2s",
    },
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
        opacity: 0.12,
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

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password.");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("travelUser"));

    if (!savedUser) {
      setError("Please register first.");
      return;
    }

    if (
      savedUser.email !== email ||
      savedUser.password !== password
    ) {
      setError("Invalid Email or Password.");
      return;
    }

    setLoading(true);

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: savedUser.name,
        email: savedUser.email,
        isLoggedIn: true,
      })
    );

    setTimeout(() => {
      navigate("/home");
    }, 1000);
  };

  /* ───────────── Enter Key ───────────── */

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    if (isRegister) {
      // Registration handled in button
      return;
    }

    handleLogin();
  };
    /* ───────────── Shared Input Style ───────────── */

  const inputBox = (focused) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(15,23,42,0.65)",
    border: `1px solid ${
      focused ? "#3b82f6" : "rgba(148,163,184,0.15)"
    }`,
    borderRadius: 14,
    padding: "14px 18px",
    boxShadow: focused
      ? "0 0 0 3px rgba(59,130,246,0.15)"
      : "none",
    transition: "all .25s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg,#050b18 0%,#0a1128 50%,#0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily:
          "'Inter','Segoe UI',system-ui,sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @keyframes lp-float{
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-12px)}
        }

        @keyframes lp-fadeUp{
          from{
            opacity:0;
            transform:translateY(30px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
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
          background: "rgba(15,23,42,.72)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(148,163,184,.15)",
          borderRadius: 28,
          padding: "40px 36px",
          animation: "lp-fadeUp .6s ease",
          boxShadow:
            "0 32px 80px rgba(0,0,0,.6)",
          position: "relative",
          zIndex: 10,
        }}
      >

        {/* Logo */}

        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              fontSize: 26,
            }}
          >
            ✈️
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              background:
                "linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TravelAI
          </div>

          <div
            style={{
              color: "#94a3b8",
              marginTop: 5,
            }}
          >
            AI Touristic Services
          </div>
        </div>

        {/* Login/Register Tabs */}

        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,.05)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 25,
          }}
        >
          <button
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              cursor: "pointer",
              color: isRegister
                ? "#94a3b8"
                : "white",
              background: !isRegister
                ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                : "transparent",
            }}
          >
            Login
          </button>

          <button
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
            style={{
              flex: 1,
              padding: 12,
              border: "none",
              cursor: "pointer",
              color: isRegister
                ? "white"
                : "#94a3b8",
              background: isRegister
                ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                : "transparent",
            }}
          >
            Register
          </button>
        </div>
                {/* Heading */}

        <div style={{ marginBottom: 20 }}>
          <h2
            style={{
              color: "white",
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {isRegister ? "Create Account 🚀" : "Welcome Back ✈️"}
          </h2>

          <p
            style={{
              color: "#94a3b8",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            {isRegister
              ? "Register to explore AI Touristic Services."
              : "Sign in to continue."}
          </p>
        </div>

        {/* Name */}

        {isRegister && (
          <div style={{ marginBottom: 15 }}>
            <label
              style={{
                color: "#94a3b8",
                fontSize: 13,
                display: "block",
                marginBottom: 8,
              }}
            >
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
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "white",
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        )}

        {/* Email */}

        <div style={{ marginBottom: 15 }}>
          <label
            style={{
              color: "#94a3b8",
              fontSize: 13,
              display: "block",
              marginBottom: 8,
            }}
          >
            Email Address
          </label>

          <div style={inputBox(emailFocus)}>
            <FaEnvelope
              color={emailFocus ? "#3b82f6" : "#64748b"}
            />

            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "white",
              }}
            />
          </div>
        </div>

        {/* Password */}

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              color: "#94a3b8",
              fontSize: 13,
              display: "block",
              marginBottom: 8,
            }}
          >
            Password
          </label>

          <div style={inputBox(pwFocus)}>
            <FaLock
              color={pwFocus ? "#3b82f6" : "#64748b"}
            />

            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "white",
              }}
            />

            <span
              onClick={() => setShowPw(!showPw)}
              style={{
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Error */}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,.1)",
              color: "#fca5a5",
              padding: 12,
              borderRadius: 10,
              marginBottom: 18,
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Button */}

        <button
          onClick={() => {
            if (isRegister) {
              if (!name || !email || !password) {
                setError("Please fill all fields.");
                return;
              }

              localStorage.setItem(
                "travelUser",
                JSON.stringify({
                  name,
                  email,
                  password,
                })
              );

              alert("Registration Successful!");

              setName("");
              setEmail("");
              setPassword("");

              setIsRegister(false);
              setError("");

              return;
            }

            handleLogin();
          }}
          disabled={loading}
          style={{
            width: "100%",
            padding: 15,
            border: "none",
            borderRadius: 14,
            background:
              "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Please Wait..." : isRegister ? "Register 🚀" : "Sign In ✈️"}
        </button>

        {/* AI Badge */}

        <div
          style={{
            marginTop: 20,
            padding: 12,
            background: "rgba(59,130,246,.08)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <FaBrain color="#3b82f6" />

          <span
            style={{
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            AI Powered • 50,000+ Reviews Analysed
          </span>
        </div>

        {/* Features */}

        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {[
            "120+ Destinations",
            "800+ Hotels",
            "AI Sentiment Analysis",
          ].map((item) => (
            <span
              key={item}
              style={{
                padding: "6px 10px",
                borderRadius: 20,
                background: "rgba(30,41,59,.8)",
                color: "#94a3b8",
                fontSize: 11,
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