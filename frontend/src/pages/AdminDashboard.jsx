
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/complaints";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const savedUser =
    localStorage.getItem("campuscareUser") ||
    sessionStorage.getItem("campuscareUser");

  let adminName = "Administrator";

  try {
    if (savedUser) {
      const user = JSON.parse(savedUser);
      adminName = user.name || "Administrator";
    }
  } catch {
    adminName = "Administrator";
  }

  const getToken = () => {
    return (
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken")
    );
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("campuscareToken");
        localStorage.removeItem("campuscareUser");
        sessionStorage.removeItem("campuscareToken");
        sessionStorage.removeItem("campuscareUser");

        navigate("/");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load dashboard data.");
      }

      const complaints = data.complaints || [];

      setStats({
        total: complaints.length,
        pending: complaints.filter(
          (complaint) => complaint.status === "Pending"
        ).length,
        inProgress: complaints.filter(
          (complaint) => complaint.status === "In Progress"
        ).length,
        resolved: complaints.filter(
          (complaint) => complaint.status === "Resolved"
        ).length,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">CC</div>
          <h2>Campus Care</h2>
        </div>

        <p className="admin-menu-label">ADMIN PANEL</p>

        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link active">
            ▦ Dashboard
          </Link>

          <Link to="/admin/complaints" className="admin-nav-link">
            ▤ All Complaints
          </Link>

          <Link to="/admin/students" className="admin-nav-link">
            ♙ Students
          </Link>

          <Link to="/admin/profile" className="admin-nav-link">
            ⚙ Admin Profile
          </Link>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          ↪ Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage campus maintenance operations.</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">A</div>
            <div>
              <strong>{adminName}</strong>
              <small>Admin Account</small>
            </div>
          </div>
        </header>

        <section className="admin-welcome">
          <span>ADMINISTRATION PORTAL</span>
          <h1>Welcome, {adminName}!</h1>
          <p>
            Monitor student complaints and help maintain a better
            campus environment.
          </p>
        </section>

        {error && (
          <div className="admin-error">
            {error}
            <button onClick={fetchDashboardStats}>Retry</button>
          </div>
        )}

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Complaints</span>
            <h2>{loading ? "..." : stats.total}</h2>
            <small>All reported issues</small>
          </div>

          <div className="admin-stat-card">
            <span>Pending</span>
            <h2>{loading ? "..." : stats.pending}</h2>
            <small>Awaiting action</small>
          </div>

          <div className="admin-stat-card">
            <span>In Progress</span>
            <h2>{loading ? "..." : stats.inProgress}</h2>
            <small>Currently being handled</small>
          </div>

          <div className="admin-stat-card">
            <span>Resolved</span>
            <h2>{loading ? "..." : stats.resolved}</h2>
            <small>Completed issues</small>
          </div>
        </section>

        <section className="admin-quick-actions">
          <h2>Quick Actions</h2>

          <div className="admin-action-grid">
            <Link to="/admin/complaints">
              <span>📋</span>
              <strong>Manage Complaints</strong>
              <small>View and update complaint status</small>
            </Link>

            <Link to="/admin/students">
              <span>👨‍🎓</span>
              <strong>Student Records</strong>
              <small>View registered students</small>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;

