
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      if (!data.user || !data.token) {
        alert("Invalid server response. Please try again.");
        return;
      }

      // Clear old login sessions
      localStorage.removeItem("campuscareToken");
      localStorage.removeItem("campuscareUser");
      sessionStorage.removeItem("campuscareToken");
      sessionStorage.removeItem("campuscareUser");

      // Save current login session
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("campuscareToken", data.token);
      storage.setItem(
        "campuscareUser",
        JSON.stringify(data.user)
      );

      alert("Login successful! Welcome to LPU Campus Care.");

      // Redirect according to database role
      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (data.user.role === "student") {
        navigate("/dashboard", { replace: true });
      } else {
        alert("Invalid account role. Please contact administrator.");
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-left">
          <div className="brand">
            <div className="brand-logo">CC</div>
            <h2>LPU Campus Care</h2>
          </div>

          <div className="welcome-content">
            <h1>Welcome Back!</h1>
            <p>
              Your campus, your voice. Report maintenance
              issues and track their progress with ease.
            </p>
          </div>

          <div className="login-footer">
            © 2026 LPU Campus Care. All rights reserved.
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">

            <h2>Sign In</h2>

            <p className="login-subtitle">
              Enter your credentials to access your account.
            </p>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email">University Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your university email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>

                <a href="#forgot-password">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            <p className="register-text">
              Don't have an account?{" "}
              <Link to="/register">Create Account</Link>
            </p>

            <div className="security-note">
              Secure access for LPU students and administrators
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;

