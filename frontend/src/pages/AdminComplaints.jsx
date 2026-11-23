
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminComplaints.css";

const API_URL = "http://localhost:5000/api/complaints";

function AdminComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  // Get authentication token
  const getToken = () => {
    return (
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken")
    );
  };

  // Fetch all complaints from MongoDB
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/", { replace: true });
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

        navigate("/", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch complaints.");
      }

      setComplaints(data.complaints || []);

    } catch (error) {
      console.error("Fetch Complaints Error:", error);
      setError(error.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Update complaint status in MongoDB
  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      setError("");

      const token = getToken();

      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("campuscareToken");
        localStorage.removeItem("campuscareUser");
        sessionStorage.removeItem("campuscareToken");
        sessionStorage.removeItem("campuscareUser");

        navigate("/", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint._id === id
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      alert("Complaint status updated successfully!");

    } catch (error) {
      console.error("Update Status Error:", error);
      setError(error.message || "Unable to update complaint status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/", { replace: true });
  };

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Complaint statistics
  const totalComplaints = complaints.length;

  const pendingCount = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const progressCount = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  // Search and filter
  const filteredComplaints = complaints.filter((complaint) => {
    const studentName =
      complaint.student?.name || "Unknown Student";

    const complaintId =
      complaint.complaintId || "";

    const matchesSearch =
      complaint.title?.toLowerCase().includes(search.toLowerCase()) ||
      complaintId.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || complaint.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-complaints-layout">
      <aside className="admin-complaints-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">L</div>

          <div>
            <h2>CampusCare</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/admin">Dashboard</Link>

          <Link to="/admin/complaints" className="active">
            All Complaints
          </Link>

          <Link to="/admin/students">Students</Link>

          <Link to="/admin/profile">Admin Profile</Link>
        </nav>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="admin-complaints-main">
        <header className="admin-complaints-header">
          <div>
            <h1>All Complaints</h1>
            <p>
              Manage and track student maintenance complaints.
            </p>
          </div>

          <div className="admin-avatar">A</div>
        </header>

        <section className="admin-complaint-stats">
          <div className="admin-complaint-stat">
            <span>Total Complaints</span>
            <h2>{totalComplaints}</h2>
          </div>

          <div className="admin-complaint-stat">
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>

          <div className="admin-complaint-stat">
            <span>In Progress</span>
            <h2>{progressCount}</h2>
          </div>

          <div className="admin-complaint-stat">
            <span>Resolved</span>
            <h2>{resolvedCount}</h2>
          </div>
        </section>

        <section className="admin-complaint-table-card">
          <div className="admin-complaint-table-heading">
            <div>
              <h2>Complaint Records</h2>
              <p>View and update complaint status</p>
            </div>
          </div>

          {error && (
            <div className="admin-error-message">
              {error}
            </div>
          )}

          <div className="admin-complaint-toolbar">
            <input
              type="text"
              placeholder="Search by ID, title or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="admin-complaint-table-wrapper">
            <table className="admin-complaint-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-result">
                      Loading complaints...
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-result">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>
                      <td>
                        <strong>{complaint.title}</strong>
                        <small>{complaint.complaintId}</small>
                      </td>

                      <td>
                        {complaint.student?.name || "Unknown Student"}
                      </td>

                      <td>{complaint.category}</td>

                      <td>{complaint.location}</td>

                      <td>
                        <span
                          className={`admin-priority ${(complaint.priority || "Medium").toLowerCase()}`}
                        >
                          {complaint.priority || "Medium"}
                        </span>
                      </td>

                      <td>{formatDate(complaint.createdAt)}</td>

                      <td>
                        <select
                          className={`admin-status-select ${complaint.status
                            ?.toLowerCase()
                            .replace(" ", "-")}`}
                          value={complaint.status}
                          disabled={updatingId === complaint._id}
                          onChange={(e) =>
                            updateStatus(
                              complaint._id,
                              e.target.value
                            )
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        {updatingId === complaint._id && (
                          <small>Updating...</small>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminComplaints;
