
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminStudents.css";

const API_URL = "https://lpu-campus-care.onrender.com/api/auth/admin/students";

function AdminStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("campuscareToken") ||
        sessionStorage.getItem("campuscareToken");

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
        throw new Error(data.message || "Unable to fetch students.");
      }

      setStudents(data.students || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("campuscareToken");
    localStorage.removeItem("campuscareUser");
    sessionStorage.removeItem("campuscareToken");
    sessionStorage.removeItem("campuscareUser");

    navigate("/");
  };

  const activeStudents = students.filter(
    (student) => student.isActive === true
  );

  const inactiveStudents = students.filter(
    (student) => student.isActive === false
  );

  const filteredStudents = students.filter((student) => {
    const name = (student.name || "").toLowerCase();
    const id = (student.studentId || "").toLowerCase();
    const email = (student.email || "").toLowerCase();
    const department = (student.department || "").toLowerCase();

    const searchText = search.toLowerCase();

    const matchesSearch =
      name.includes(searchText) ||
      id.includes(searchText) ||
      email.includes(searchText) ||
      department.includes(searchText);

    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && student.isActive === true) ||
      (filter === "Inactive" && student.isActive === false);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-students-layout">
      <aside className="admin-students-sidebar">
        <div className="students-brand">
          <div className="students-brand-icon">L</div>
          <div>
            <h2>CampusCare</h2>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="students-admin-nav">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/complaints">All Complaints</Link>
          <Link to="/admin/students" className="active">
            Students
          </Link>
          <Link to="/admin/profile">Admin Profile</Link>
        </nav>

        <button className="students-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-students-main">
        <header className="students-page-header">
          <div>
            <h1>Students Management</h1>
            <p>View and manage registered students.</p>
          </div>
          <div className="students-admin-avatar">A</div>
        </header>

        <section className="students-overview">
          <div className="students-overview-card">
            <span>Total Students</span>
            <h2>{loading ? "..." : students.length}</h2>
          </div>

          <div className="students-overview-card">
            <span>Active Students</span>
            <h2>{loading ? "..." : activeStudents.length}</h2>
          </div>

          <div className="students-overview-card">
            <span>Inactive Students</span>
            <h2>{loading ? "..." : inactiveStudents.length}</h2>
          </div>
        </section>

        <section className="students-list-card">
          <div className="students-list-heading">
            <div>
              <h2>Registered Students</h2>
              <p>Student account information</p>
            </div>
          </div>

          {error && (
            <div className="students-empty">
              {error}
              <button onClick={fetchStudents}>Retry</button>
            </div>
          )}

          <div className="students-search-toolbar">
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Students</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="students-empty">
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const status = student.isActive ? "Active" : "Inactive";

                    return (
                      <tr key={student._id}>
                        <td>{student.studentId || "Not provided"}</td>
                        <td>
                          <strong>{student.name}</strong>
                        </td>
                        <td>{student.email}</td>
                        <td>{student.department || "Not provided"}</td>
                        <td>Not provided</td>
                        <td>
                          <span
                            className={`student-account-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="students-empty">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminStudents;

