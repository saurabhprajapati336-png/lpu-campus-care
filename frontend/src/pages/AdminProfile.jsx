
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminProfile.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/auth";

function AdminProfile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    adminId: "",
    email: "",
    phone: "",
    department: "",
    role: "Administrator",
  });

  const getToken = () => {
    return (
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken")
    );
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/");
  };

  // FETCH ADMIN PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load profile.");
      }

      const user = data.user;

      if (user.role !== "admin") {
        navigate("/");
        return;
      }

      setProfile({
        id: user._id || user.id || "",
        name: user.name || "",
        adminId: user._id || user.id || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        role: "Administrator",
      });

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // UPDATE ADMIN PROFILE
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          department: profile.department,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedUser = data.user;

      setProfile((prev) => ({
        ...prev,
        id: updatedUser.id || prev.id,
        adminId: updatedUser.id || prev.adminId,
        name: updatedUser.name || prev.name,
        email: updatedUser.email || prev.email,
        phone: updatedUser.phone || "",
        department: updatedUser.department || "",
      }));

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

      setIsEditing(false);
      setSuccess("Profile updated successfully!");

    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // CANCEL EDITING
  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    fetchProfile();
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/");
  };

  return (
    <div className="admin-profile-layout">
      <aside className="admin-profile-sidebar">
        <div className="profile-brand">
          <div className="profile-brand-icon">L</div>
          <div>
            <h2>CampusCare</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="profile-admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/complaints">All Complaints</Link>
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/profile" className="active">
            Admin Profile
          </Link>
        </nav>

        <button
          className="profile-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="admin-profile-main">
        <header className="profile-page-header">
          <div>
            <h1>Admin Profile</h1>
            <p>Manage your administrator account details.</p>
          </div>

          <div className="profile-header-avatar">A</div>
        </header>

        {loading ? (
          <section className="profile-details-card">
            <p>Loading admin profile...</p>
          </section>
        ) : (
          <>
            <section className="profile-banner">
              <div className="profile-large-avatar">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <div className="profile-banner-info">
                <h2>{profile.name}</h2>
                <p>{profile.role}</p>
                <span>Administrator Account</span>
              </div>
            </section>

            <section className="profile-details-card">
              <div className="profile-details-heading">
                <div>
                  <h2>Personal Information</h2>
                  <p>View and update your account information.</p>
                </div>

                {!isEditing && (
                  <button
                    className="profile-edit-button"
                    onClick={() => {
                      setIsEditing(true);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {error && (
                <p role="alert" style={{ color: "red", marginBottom: "15px" }}>
                  {error}
                </p>
              )}

              {success && (
                <p style={{ color: "green", marginBottom: "15px" }}>
                  {success}
                </p>
              )}

              <form onSubmit={handleSave}>
                <div className="profile-fields-grid">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>Admin ID</label>
                    <input
                      type="text"
                      value={profile.adminId}
                      disabled
                    />
                  </div>

                  <div className="profile-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <div className="profile-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="profile-field">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter department"
                    />
                  </div>

                  <div className="profile-field">
                    <label>Account Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-save-button"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminProfile;

