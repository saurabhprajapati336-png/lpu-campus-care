
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import MyProfile from "./pages/MyProfile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";
import AdminStudents from "./pages/AdminStudents";
import AdminProfile from "./pages/AdminProfile";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/new-complaint" element={<NewComplaint />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Invalid Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

