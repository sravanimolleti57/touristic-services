import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/login.css";
import bg from "../assets/login-bg.jpg";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
      );
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        email,
      })
    );

    navigate("/home");
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="overlay"></div>

      <div className="glass-card">
        <h1 className="title">SIGN UP</h1>

        <p className="subtitle">Explore the World </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-box">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>

        </div>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button onClick={handleLogin}>
          Login
        </button>

        <div className="bottom-links">

          <Link to="/forgot-password">
            Forgot Password?
          </Link>

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;