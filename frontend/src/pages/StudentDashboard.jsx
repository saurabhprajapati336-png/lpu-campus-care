
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const API_URL = "http://localhost:5000/api";

function StudentDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "Student",
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getToken = () => {
    return (
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken")
    );
  };

  const fetchDashboardData = async () => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResponse, complaintsResponse] = await Promise.all([
        fetch(`${API_URL}/auth/me`, { headers }),
        fetch(`${API_URL}/complaints/my`, { headers }),
      ]);

      const profileData = await profileResponse.json();
      const complaintsData = await complaintsResponse.json();

      if (
        profileResponse.status === 401 ||
        complaintsResponse.status === 401
      ) {
        localStorage.removeItem("campuscareToken");
        localStorage.removeItem("campuscareUser");
        sessionStorage.removeItem("campuscareToken");
        sessionStorage.removeItem("campuscareUser");

        navigate("/");
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          profileData.message || "Unable to load student profile."
        );
      }

      if (!complaintsResponse.ok) {
        throw new Error(
          complaintsData.message || "Unable to load complaints."
        );
      }

      setUser(profileData.user);
      setComplaints(complaintsData.complaints || []);

      const storage = localStorage.getItem("campuscareToken")
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "campuscareUser",
        JSON.stringify(profileData.user)
      );

      setError("");
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/", { replace: true });
  };

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (complaint) => complaint.status === "Pending"
  ).length;

  const progressComplaints = complaints.filter(
    (complaint) => complaint.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "Resolved"
  ).length;

  const recentComplaints = complaints.slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <main className="dashboard-main">
          <p style={{ padding: "30px" }}>
            Loading your dashboard...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">CC</div>
          <h2>LPU Campus Care</h2>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </Link>

          <Link to="/my-complaints" className="nav-link">
            <span>▤</span> My Complaints
          </Link>

          <Link to="/new-complaint" className="nav-link">
            <span>＋</span> New Complaint
          </Link>

          <Link to="/my-profile" className="nav-link">
            <span>♙</span> My Profile
          </Link>
        </nav>

        <button className="dashboard-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h2>Student Dashboard</h2>
            <p>Welcome to LPU Campus Care</p>
          </div>

          <div className="dashboard-user">
            <div className="user-avatar">
              {(user.name || "S").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "Student"}</strong>
              <small>Student Account</small>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <span>STUDENT PORTAL</span>
            <h1>Hello, {user.name || "Student"}! 👋</h1>
            <p>
              Manage your campus maintenance complaints from one place.
              We are here to make your campus better.
            </p>

            <Link to="/new-complaint" className="dashboard-submit-btn">
              + Submit New Complaint
            </Link>
          </div>

          <div className="welcome-illustration">🏫</div>
        </section>

        {error && (
          <p
            role="alert"
            style={{
              color: "#dc2626",
              padding: "12px",
              background: "#fee2e2",
              borderRadius: "8px",
            }}
          >
            {error}
            <button
              type="button"
              onClick={fetchDashboardData}
              style={{ marginLeft: "12px", cursor: "pointer" }}
            >
              Retry
            </button>
          </p>
        )}

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total Complaints</p>
            <h2>{totalComplaints}</h2>
            <small>All submitted complaints</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Pending</p>
            <h2>{pendingComplaints}</h2>
            <small>Waiting for action</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon blue">↻</div>
            <p>In Progress</p>
            <h2>{progressComplaints}</h2>
            <small>Currently being handled</small>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon green">✓</div>
            <p>Resolved</p>
            <h2>{resolvedComplaints}</h2>
            <small>Successfully completed</small>
          </div>
        </section>

        <section className="dashboard-recent">
          <div className="recent-header">
            <div>
              <h2>Recent Complaints</h2>
              <p>Keep track of your latest maintenance requests.</p>
            </div>

            <Link to="/my-complaints">View All →</Link>
          </div>

          {recentComplaints.length > 0 ? (
            <div className="complaints-table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>
                        <strong>{complaint.title}</strong>
                        <small>{complaint.complaintId}</small>
                      </td>

                      <td>{complaint.category}</td>

                      <td>{formatDate(complaint.createdAt)}</td>

                      <td>
                        <span
                          className={`priority-badge ${(complaint.priority || "Medium").toLowerCase()}`}
                        >
                          {complaint.priority || "Medium"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${(complaint.status || "Pending").toLowerCase().replace(" ", "-")}`}
                        >
                          {complaint.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-empty">
              <div>📋</div>
              <h3>No complaints yet</h3>
              <p>
                You haven't submitted any maintenance complaints.
                Start by reporting an issue on your campus.
              </p>
              <Link to="/new-complaint">
                Submit Your First Complaint
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
