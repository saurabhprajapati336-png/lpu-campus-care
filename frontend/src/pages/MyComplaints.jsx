
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MyComplaints.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/complaints";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const token =
      localStorage.getItem("campuscareToken") ||
      sessionStorage.getItem("campuscareToken");

    if (!token) {
      setError("Please login first to view your complaints.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("campuscareToken");
          localStorage.removeItem("campuscareUser");
          sessionStorage.removeItem("campuscareToken");
          sessionStorage.removeItem("campuscareUser");
        }

        throw new Error(data.message || "Unable to fetch complaints.");
      }

      setComplaints(data.complaints || []);
      setError("");

    } catch (err) {
      console.error("Fetch Complaints Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
      filter === "All" || complaint.status === filter;

    const matchesSearch =
      (complaint.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (complaint.complaintId || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="my-complaints-page">

      <div className="my-complaints-header">
        <div>
          <span className="complaints-tag">CAMPUS SUPPORT</span>
          <h1>My Complaints</h1>
          <p>Track and manage all your maintenance complaints.</p>
        </div>

        <Link to="/new-complaint" className="new-complaint-link">
          + New Complaint
        </Link>
      </div>

      <div className="complaints-summary">

        <div className="summary-card">
          <span>Total Complaints</span>
          <h2>{complaints.length}</h2>
        </div>

        <div className="summary-card">
          <span>Pending</span>
          <h2>
            {complaints.filter((c) => c.status === "Pending").length}
          </h2>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <h2>
            {complaints.filter((c) => c.status === "In Progress").length}
          </h2>
        </div>

        <div className="summary-card">
          <span>Resolved</span>
          <h2>
            {complaints.filter((c) => c.status === "Resolved").length}
          </h2>
        </div>

      </div>

      <div className="complaints-content">

        <div className="complaints-toolbar">

          <input
            type="text"
            placeholder="Search by complaint title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Complaints</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

        </div>

        {loading ? (
          <p style={{ padding: "25px", textAlign: "center" }}>
            Loading your complaints...
          </p>
        ) : error ? (
          <p
            role="alert"
            style={{
              padding: "20px",
              color: "#dc2626",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        ) : (
          <div className="complaints-table-wrapper">

            <table className="complaints-table">

              <thead>
                <tr>
                  <th>Complaint Details</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint._id}>

                      <td>
                        <strong>{complaint.title}</strong>
                        <small>{complaint.complaintId}</small>
                      </td>

                      <td>{complaint.category}</td>

                      <td>{complaint.location}</td>

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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-complaints">
                      {complaints.length === 0
                        ? "You have not submitted any complaints yet."
                        : "No complaints found."}
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}

export default MyComplaints;

