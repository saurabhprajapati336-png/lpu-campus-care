
import { useState, useEffect } from "react";
import "./MyProfile.css";

const API_URL = "http://localhost:5000/api/auth";

function MyProfile() {
  const [profile, setProfile] = useState({
    name: "",
    studentId: "",
    email: "",
    department: "",
    phone: "",
    hostel: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken")
    );
  };

  const fetchProfile = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login first.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load profile.");
      }

      const user = data.user;

      setProfile({
        name: user.name || "",
        studentId: user.studentId || "",
        email: user.email || "",
        department: user.department || "",
        phone: user.phone || "",
        hostel: user.hostel || "",
      });

      setError("");
    } catch (err) {
      console.error("Profile Error:", err);
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      setError("Please login again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          hostel: profile.hostel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedUser = data.user;

      setProfile({
        name: updatedUser.name || "",
        studentId: updatedUser.studentId || "",
        email: updatedUser.email || "",
        department: updatedUser.department || "",
        phone: updatedUser.phone || "",
        hostel: updatedUser.hostel || "",
      });

      // Update saved user information
      const storage = localStorage.getItem("campuscareToken")
        ? localStorage
        : sessionStorage;

      const savedUser = JSON.parse(
        storage.getItem("campuscareUser") || "{}"
      );

      storage.setItem(
        "campuscareUser",
        JSON.stringify({
          ...savedUser,
          ...updatedUser,
        })
      );

      setEditing(false);
      setSuccess("Profile updated successfully!");

    } catch (err) {
      console.error("Update Profile Error:", err);
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: "30px" }}>Loading profile...</p>;
  }

  if (error && !profile.email) {
    return (
      <p role="alert" style={{ padding: "30px", color: "#dc2626" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="my-profile-page">
      <div className="profile-header">
        <span>STUDENT ACCOUNT</span>
        <h1>My Profile</h1>
        <p>View and manage your student information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-banner">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{profile.name}</h2>
            <p>Student Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Your university account details</p>
            </div>

            {!editing && (
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => {
                  setSuccess("");
                  setError("");
                  setEditing(true);
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <p role="alert" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={{ color: "green" }}>
              {success}
            </p>
          )}

          <div className="profile-fields">
            <div className="profile-field">
              <label>Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing || saving}
                required
              />
            </div>

            <div className="profile-field">
              <label>Student ID</label>
              <input
                name="studentId"
                value={profile.studentId}
                disabled
              />
            </div>

            <div className="profile-field">
              <label>University Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="profile-field">
              <label>Department</label>
              <input
                name="department"
                value={profile.department}
                disabled
              />
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                disabled={!editing || saving}
              />
            </div>

            <div className="profile-field">
              <label>Hostel / Room</label>
              <input
                name="hostel"
                value={profile.hostel}
                onChange={handleChange}
                placeholder="Enter hostel and room"
                disabled={!editing || saving}
              />
            </div>
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                type="button"
                className="cancel-profile-btn"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setError("");
                  fetchProfile();
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-profile-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default MyProfile;
