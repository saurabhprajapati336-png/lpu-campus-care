
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewComplaint.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/complaints";

function NewComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    priority: "Medium",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    const token =
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken");

    if (!token) {
      alert("Please login first!");
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("campuscareToken");
          localStorage.removeItem("campuscareUser");
          sessionStorage.removeItem("campuscareToken");
          sessionStorage.removeItem("campuscareUser");

          alert("Your session has expired. Please login again.");
          navigate("/");
          return;
        }

        throw new Error(data.message || "Complaint submission failed!");
      }

      setMessage({
        type: "success",
        text: `Complaint submitted successfully! Your Complaint ID is ${data.complaint.complaintId}`,
      });

      setFormData({
        title: "",
        category: "",
        location: "",
        priority: "Medium",
        description: "",
      });

    } catch (error) {
      console.error("Complaint Submission Error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to connect to server.",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-complaint-page">
      <div className="complaint-form-container">

        <div className="complaint-form-header">
          <span className="complaint-tag">CAMPUS SUPPORT</span>

          <h1>Submit a Complaint</h1>

          <p>
            Facing a campus maintenance issue? Tell us about it
            and our team will work to resolve it.
          </p>
        </div>

        {message.text && (
          <div
            role="alert"
            style={{
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              backgroundColor:
                message.type === "success" ? "#dcfce7" : "#fee2e2",
              color:
                message.type === "success" ? "#166534" : "#991b1b",
              fontSize: "14px",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="complaint-form-group">
            <label htmlFor="title">Complaint Title</label>

            <input
              type="text"
              id="title"
              name="title"
              placeholder="Example: Ceiling fan is not working"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="complaint-form-row">

            <div className="complaint-form-group">
              <label htmlFor="category">Complaint Category</label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Furniture">Furniture</option>
                <option value="Internet">Internet</option>
                <option value="Civil">Civil</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="complaint-form-group">
              <label htmlFor="priority">Priority Level</label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

          </div>

          <div className="complaint-form-group">
            <label htmlFor="location">Location</label>

            <input
              type="text"
              id="location"
              name="location"
              placeholder="Example: Block 32, Room 204"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="complaint-form-group">
            <label htmlFor="description">Problem Description</label>

            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Describe the maintenance issue in detail..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="complaint-form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-complaint-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Complaint →"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default NewComplaint;

