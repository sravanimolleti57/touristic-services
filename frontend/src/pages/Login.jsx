import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes
} from "react-icons/fa";
import axios from "axios";
import "../styles/login.css";

export default function Login({ initialFlip = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useUser();

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get("tab") === "admin" || location.pathname.includes("admin") ? "admin" : "user";
  const shouldStartSignUp = initialFlip || location.pathname.includes("register") || queryParams.get("mode") === "signup";

  // Role: "user" (Front) | "admin" (Back)
  const [role, setRole] = useState(initialRole);

  // User Login Form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Admin Login Form
  const [adminIdentifier, setAdminIdentifier] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPw, setShowAdminPw] = useState(false);

  // Sign Up Modal & Form
  const [showSignUpModal, setShowSignUpModal] = useState(shouldStartSignUp);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPw, setSignupConfirmPw] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupConfirmPw, setShowSignupConfirmPw] = useState(false);

  // Feedback & Loading
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Read saved remembered email or prefilled credentials from navigation
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setLoginIdentifier(location.state.registeredEmail);
      if (location.state?.registeredPassword) {
        setLoginPassword(location.state.registeredPassword);
      }
      setSuccessMsg(location.state.successNotice || "Account created successfully! Please sign in.");
      setShowSignUpModal(false);
      setRole("user");
    } else {
      const savedEmail = localStorage.getItem("travelai_remember_email");
      if (savedEmail) {
        setLoginIdentifier(savedEmail);
      }
    }

    if (queryParams.get("tab") === "admin" || location.pathname.includes("admin")) {
      setRole("admin");
    } else if (location.pathname.includes("register") || queryParams.get("mode") === "signup") {
      setShowSignUpModal(true);
      setRole("user");
    }
  }, [location]);

  // Handle Role Switch (USER <-> ADMIN)
  const handleRoleChange = (newRole) => {
    if (role === newRole) return;
    setRole(newRole);
    setError("");
    setSuccessMsg("");
  };

  /* ───────────────── USER LOGIN HANDLER ───────────────── */
  const handleUserLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const emailTrimmed = loginIdentifier.trim().toLowerCase();
    const pwTrimmed = loginPassword.trim();

    if (!emailTrimmed || !pwTrimmed) {
      setError("Please enter your Username/Email and Password.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        { email: emailTrimmed, password: pwTrimmed },
        { timeout: 8000 }
      );

      if (rememberMe) {
        localStorage.setItem("travelai_remember_email", emailTrimmed);
      } else {
        localStorage.removeItem("travelai_remember_email");
      }

      const userRole = res.data?.role || "user";
      const userAvatar = res.data?.avatar || res.data?.profileImage || "";
      const userData = {
        name: res.data?.name || emailTrimmed.split("@")[0],
        email: res.data?.email || emailTrimmed,
        role: userRole,
        avatar: userAvatar,
        profileImage: userAvatar,
        isLoggedIn: true
      };

      updateUser(userData);
      localStorage.setItem("role", userRole);

      const redirectParam = queryParams.get("redirect");
      if (userRole === "admin") {
        navigate(redirectParam || "/admin/dashboard", { replace: true });
      } else {
        navigate(redirectParam || "/home", { replace: true });
      }
    } catch (err) {
      console.error("[USER LOGIN ERROR]", err);
      let errorMsg = "Login failed. Please check your credentials.";

      if (!err.response && (err.message === "Network Error" || err.code === "ERR_NETWORK")) {
        errorMsg = "Unable to connect to authentication server. Please check your connection.";
      } else if (err.response?.status === 401) {
        errorMsg = err.response.data?.message || "Invalid email or password.";
      } else if (err.response?.status === 404) {
        errorMsg = err.response.data?.message || "Account not found. Please sign up.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── ADMIN LOGIN HANDLER ───────────────── */
  const handleAdminLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const adminInputTrimmed = adminIdentifier.trim().toLowerCase();
    const pwTrimmed = adminPassword.trim();

    if (!adminInputTrimmed || !pwTrimmed) {
      setError("Please enter Admin Email/Username and Password.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/admin-login",
        { email: adminInputTrimmed, password: pwTrimmed },
        { timeout: 8000 }
      );

      if (res.data && res.data.role === "admin") {
        const adminAvatar = res.data.avatar || res.data.profileImage || "";
        const adminData = {
          name: res.data.name || "System Admin",
          email: res.data.email || adminInputTrimmed,
          role: "admin",
          avatar: adminAvatar,
          profileImage: adminAvatar,
          isLoggedIn: true
        };

        updateUser(adminData);
        localStorage.setItem("role", "admin");

        const redirectParam = queryParams.get("redirect");
        navigate(redirectParam || "/admin/dashboard", { replace: true });
      } else {
        setError(res.data?.message || "Access Denied: Administrator privileges required.");
      }
    } catch (err) {
      console.error("[ADMIN LOGIN ERROR]", err);
      let errorMsg = "Administrator authentication failed.";

      if (!err.response && (err.message === "Network Error" || err.code === "ERR_NETWORK")) {
        errorMsg = "Unable to connect to authentication server. Please check your connection.";
      } else if (err.response?.status === 401) {
        errorMsg = err.response.data?.message || "Invalid administrator email or password.";
      } else if (err.response?.status === 404) {
        errorMsg = err.response.data?.message || "Administrator account not found.";
      } else if (err.response?.status === 403) {
        errorMsg = err.response.data?.message || "Access Denied: You do not have Administrator privileges.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── SIGN UP HANDLER ───────────────── */
  const handleSignUp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccessMsg("");

    const nameTrimmed = signupName.trim();
    const emailTrimmed = signupEmail.trim().toLowerCase();
    const pwTrimmed = signupPassword.trim();
    const confirmPwTrimmed = signupConfirmPw.trim();

    if (!nameTrimmed || !emailTrimmed || !pwTrimmed || !confirmPwTrimmed) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (pwTrimmed.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    if (pwTrimmed !== confirmPwTrimmed) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/register",
        {
          name: nameTrimmed,
          email: emailTrimmed,
          password: pwTrimmed,
          role: "user"
        },
        { timeout: 8000 }
      );

      setSuccessMsg(res.data?.message || "Account created successfully! Please sign in.");
      setLoginIdentifier(emailTrimmed);
      setLoginPassword(pwTrimmed);
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPw("");
      setShowSignUpModal(false);
      setRole("user");
    } catch (err) {
      console.error("[SIGN UP ERROR]", err);
      let errorMsg = "Registration failed. Email may already be registered.";

      if (!err.response && (err.message === "Network Error" || err.code === "ERR_NETWORK")) {
        errorMsg = "Unable to connect to authentication server. Please check your connection.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── NEUMORPHIC STYLES ───────────────── */
  const styles = {
    pageContainer: {
      minHeight: "100vh",
      background: "#e8ecf2",
      color: "#2b3445",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
      position: "relative"
    },
    // Segmented Role Switch [ USER | ADMIN ]
    segmentedSwitch: {
      display: "inline-flex",
      background: "#e8ecf2",
      padding: "6px",
      borderRadius: "999px",
      boxShadow: "inset 3px 3px 6px #c5d0e0, inset -3px -3px 6px #ffffff",
      marginBottom: "24px",
      gap: "6px",
      zIndex: 10
    },
    segmentButton: (isActive) => ({
      padding: "9px 30px",
      borderRadius: "999px",
      border: "none",
      background: isActive ? "#e8ecf2" : "transparent",
      color: isActive ? "#1e293b" : "#718096",
      fontWeight: 800,
      fontSize: "13px",
      letterSpacing: "1px",
      cursor: "pointer",
      boxShadow: isActive ? "4px 4px 10px #c5d0e0, -4px -4px 10px #ffffff" : "none",
      transition: "all 0.25s ease"
    }),
    // 3D Perspective Flip Container
    flipContainer: {
      perspective: "1200px",
      WebkitPerspective: "1200px",
      width: "530px",
      height: "530px",
      maxWidth: "min(92vw, 530px)",
      maxHeight: "min(92vw, 530px)",
      aspectRatio: "1 / 1",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    flipCard: {
      width: "100%",
      height: "100%",
      position: "relative",
      transformStyle: "preserve-3d",
      WebkitTransformStyle: "preserve-3d",
      transition: "transform 0.8s ease-in-out",
      transform: role === "admin" ? "rotateY(180deg)" : "rotateY(0deg)"
    },
    // Neumorphic Circular Faces
    cardFace: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      background: "#e8ecf2",
      borderRadius: "50%",
      padding: "36px 32px",
      boxShadow: "20px 20px 50px #c5d0e0, -20px -20px 50px #ffffff, inset 4px 4px 8px rgba(255,255,255,0.9), inset -4px -4px 8px rgba(197,208,224,0.35)",
      border: "10px solid #eef2f7",
      boxSizing: "border-box",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transformStyle: "preserve-3d",
      WebkitTransformStyle: "preserve-3d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    cardFront: {
      transform: "rotateY(0deg)"
    },
    cardBack: {
      transform: "rotateY(180deg)"
    },
    innerForm: {
      width: "100%",
      maxWidth: "330px",
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch"
    },
    title: {
      fontSize: "26px",
      fontWeight: 900,
      color: "#212529",
      margin: "0 0 4px",
      textAlign: "center",
      letterSpacing: "-0.5px"
    },
    subtitle: {
      fontSize: "12px",
      fontWeight: 500,
      color: "#718096",
      margin: "0 0 16px",
      textAlign: "center"
    },
    inputContainer: {
      position: "relative",
      marginBottom: "12px"
    },
    inputField: {
      width: "100%",
      padding: "11px 38px 11px 42px",
      borderRadius: "999px",
      border: "none",
      background: "#e8ecf2",
      color: "#2d3748",
      fontSize: "13px",
      fontWeight: 500,
      outline: "none",
      boxSizing: "border-box",
      boxShadow: "inset 3px 3px 6px #c5d0e0, inset -3px -3px 6px #ffffff",
      transition: "box-shadow 0.2s ease"
    },
    inputIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#718096",
      fontSize: "13px",
      pointerEvents: "none"
    },
    eyeButton: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      color: "#718096",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center"
    },
    submitButton: {
      width: "100%",
      padding: "12px 20px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.7)",
      background: "#e8ecf2",
      color: "#2b3445",
      fontSize: "13.5px",
      fontWeight: 900,
      letterSpacing: "1px",
      cursor: loading ? "not-allowed" : "pointer",
      boxShadow: "5px 5px 12px #c5d0e0, -5px -5px 12px #ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginTop: "10px",
      marginBottom: "14px",
      transition: "all 0.2s ease"
    },
    footerText: {
      textAlign: "center",
      fontSize: "12px",
      color: "#718096",
      margin: 0
    },
    actionLink: {
      color: "#d32f2f",
      fontWeight: 800,
      cursor: "pointer",
      textDecoration: "none",
      marginLeft: "4px"
    },
    alertBox: (isErr) => ({
      padding: "6px 12px",
      borderRadius: "999px",
      marginBottom: "10px",
      background: "#e8ecf2",
      boxShadow: "inset 2px 2px 4px #c5d0e0, inset -2px -2px 4px #ffffff",
      color: isErr ? "#dc2626" : "#15803d",
      fontSize: "11.5px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      lineHeight: 1.3
    }),
    // Neumorphic Sign Up Modal Overlay
    modalOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(30, 41, 59, 0.45)",
      backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    },
    modalContent: {
      width: "100%",
      maxWidth: "460px",
      background: "#e8ecf2",
      borderRadius: "32px",
      padding: "36px 32px",
      boxShadow: "20px 20px 50px #b0bece, -20px -20px 50px #ffffff",
      border: "4px solid #eef2f7",
      boxSizing: "border-box",
      position: "relative"
    },
    modalCloseBtn: {
      position: "absolute",
      top: "18px",
      right: "18px",
      background: "#e8ecf2",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#718096",
      cursor: "pointer",
      boxShadow: "3px 3px 6px #c5d0e0, -3px -3px 6px #ffffff"
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Role Switch: [ USER | ADMIN ] */}
      <div style={styles.segmentedSwitch}>
        <button
          type="button"
          id="user-tab-btn"
          onClick={() => handleRoleChange("user")}
          style={styles.segmentButton(role === "user")}
        >
          USER
        </button>
        <button
          type="button"
          id="admin-tab-btn"
          onClick={() => handleRoleChange("admin")}
          style={styles.segmentButton(role === "admin")}
        >
          ADMIN
        </button>
      </div>

      {/* 3D Perspective Flip Container */}
      <div className="flip-container" style={styles.flipContainer}>
        <div
          className={`flip-card ${role === "admin" ? "flipped" : ""}`}
          style={styles.flipCard}
        >
          {/* ───────────────── FRONT SIDE (USER LOGIN) ───────────────── */}
          <div className="flip-card-front" style={{ ...styles.cardFace, ...styles.cardFront }}>
            <form onSubmit={handleUserLogin} style={styles.innerForm}>
              <h1 style={styles.title}>User Login</h1>
              <p style={styles.subtitle}>Sign in to your account</p>

              {role === "user" && error && (
                <div style={styles.alertBox(true)}>
                  <FaExclamationTriangle size={12} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {role === "user" && successMsg && (
                <div style={styles.alertBox(false)}>
                  <FaCheckCircle size={12} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Username / Email Input */}
              <div style={styles.inputContainer}>
                <FaUser style={styles.inputIcon} />
                <input
                  type="text"
                  id="user-login-identifier"
                  required
                  placeholder="Username or Email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              {/* Password Input */}
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showLoginPw ? "text" : "password"}
                  id="user-login-password"
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  style={styles.eyeButton}
                  title={showLoginPw ? "Hide Password" : "Show Password"}
                >
                  {showLoginPw ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>

              {/* Remember me & Forgot password */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", color: "#718096", margin: "6px 4px 2px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: "#2b3445", cursor: "pointer" }}
                  />
                  <span>Remember me</span>
                </label>

                <span
                  onClick={() => alert("Please contact administrator or sign up if you have forgotten your password.")}
                  style={{ cursor: "pointer", color: "#718096", textDecoration: "none" }}
                >
                  Forgot password?
                </span>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                id="user-login-submit-btn"
                disabled={loading}
                style={styles.submitButton}
                onMouseDown={(e) => (e.currentTarget.style.boxShadow = "inset 2px 2px 5px #c5d0e0, inset -2px -2px 5px #ffffff")}
                onMouseUp={(e) => (e.currentTarget.style.boxShadow = "5px 5px 12px #c5d0e0, -5px -5px 12px #ffffff")}
              >
                {loading && role === "user" ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>

              {/* Sign Up Link */}
              <p style={styles.footerText}>
                Don't have an account?
                <span
                  id="user-signup-link"
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setShowSignUpModal(true);
                  }}
                  style={styles.actionLink}
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>

          {/* ───────────────── BACK SIDE (ADMIN LOGIN) ───────────────── */}
          <div className="flip-card-back" style={{ ...styles.cardFace, ...styles.cardBack }}>
            <form onSubmit={handleAdminLogin} style={styles.innerForm}>
              <h1 style={styles.title}>Admin Login</h1>
              <p style={styles.subtitle}>Sign in to admin dashboard</p>

              {role === "admin" && error && (
                <div style={styles.alertBox(true)}>
                  <FaExclamationTriangle size={12} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {role === "admin" && successMsg && (
                <div style={styles.alertBox(false)}>
                  <FaCheckCircle size={12} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Admin Identifier */}
              <div style={styles.inputContainer}>
                <FaShieldAlt style={styles.inputIcon} />
                <input
                  type="text"
                  id="admin-login-identifier"
                  required
                  placeholder="Admin Email / Username"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              {/* Admin Password */}
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showAdminPw ? "text" : "password"}
                  id="admin-login-password"
                  required
                  placeholder="Admin Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPw(!showAdminPw)}
                  style={styles.eyeButton}
                  title={showAdminPw ? "Hide Password" : "Show Password"}
                >
                  {showAdminPw ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                id="admin-login-submit-btn"
                disabled={loading}
                style={styles.submitButton}
                onMouseDown={(e) => (e.currentTarget.style.boxShadow = "inset 2px 2px 5px #c5d0e0, inset -2px -2px 5px #ffffff")}
                onMouseUp={(e) => (e.currentTarget.style.boxShadow = "5px 5px 12px #c5d0e0, -5px -5px 12px #ffffff")}
              >
                {loading && role === "admin" ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                    <span>VERIFYING ADMIN...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>

              <p style={{ ...styles.footerText, fontSize: "11px", marginTop: "4px" }}>
                🔒 Authorized Administrator Access Only
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* ───────────────── SIGN UP MODAL OVERLAY ───────────────── */}
      {showSignUpModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSignUpModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowSignUpModal(false)}
              style={styles.modalCloseBtn}
              title="Close"
            >
              <FaTimes size={14} />
            </button>

            <form onSubmit={handleSignUp} style={{ ...styles.innerForm, maxWidth: "100%" }}>
              <h1 style={styles.title}>Sign Up</h1>
              <p style={styles.subtitle}>Create your TravelAI account</p>

              {error && (
                <div style={styles.alertBox(true)}>
                  <FaExclamationTriangle size={12} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div style={styles.inputContainer}>
                <FaUser style={styles.inputIcon} />
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              {/* Email */}
              <div style={styles.inputContainer}>
                <FaEnvelope style={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={styles.inputField}
                />
              </div>

              {/* Password */}
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showSignupPw ? "text" : "password"}
                  required
                  placeholder="Password (min 4 chars)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  style={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPw(!showSignupPw)}
                  style={styles.eyeButton}
                  title={showSignupPw ? "Hide Password" : "Show Password"}
                >
                  {showSignupPw ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div style={styles.inputContainer}>
                <FaLock style={styles.inputIcon} />
                <input
                  type={showSignupConfirmPw ? "text" : "password"}
                  required
                  placeholder="Confirm password"
                  value={signupConfirmPw}
                  onChange={(e) => setSignupConfirmPw(e.target.value)}
                  style={styles.inputField}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPw(!showSignupConfirmPw)}
                  style={styles.eyeButton}
                  title={showSignupConfirmPw ? "Hide Password" : "Show Password"}
                >
                  {showSignupConfirmPw ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>

              {/* CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                style={styles.submitButton}
                onMouseDown={(e) => (e.currentTarget.style.boxShadow = "inset 2px 2px 5px #c5d0e0, inset -2px -2px 5px #ffffff")}
                onMouseUp={(e) => (e.currentTarget.style.boxShadow = "5px 5px 12px #c5d0e0, -5px -5px 12px #ffffff")}
              >
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <span>CREATE ACCOUNT</span>
                )}
              </button>

              <p style={styles.footerText}>
                Already have an account?
                <span
                  onClick={() => {
                    setError("");
                    setSuccessMsg("");
                    setShowSignUpModal(false);
                  }}
                  style={styles.actionLink}
                >
                  Sign in
                </span>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
