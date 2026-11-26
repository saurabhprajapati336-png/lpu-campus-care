
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/auth";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          studentId: formData.studentId,
          email: formData.email,
          department: formData.department,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed!");
        return;
      }

      localStorage.setItem("campuscareToken", data.token);
      localStorage.setItem("campuscareUser", JSON.stringify(data.user));

      alert("Registration successful! Welcome to LPU Campus Care.");

      navigate("/dashboard");

    } catch (error) {
      console.error("Registration Error:", error);
      alert("Unable to connect to server. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <div className="register-logo">CC</div>
          <h2>LPU Campus Care</h2>
          <p>Create your student account</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="register-input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-input-group">
            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              placeholder="Enter your student ID"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-input-group">
            <label>University Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your university email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-input-group">
            <label>Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="register-input-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="register-input-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <label className="show-password-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="register-login-link">
          Already have an account? <Link to="/">Sign In</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;

