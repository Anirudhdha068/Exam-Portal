import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/adminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalCourses: 0,
    totalAttempts: 0,
    passRate: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/admin/analytics", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics");
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />

        <div className="admin-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <button
              className="create-exam-btn"
              onClick={() => navigate("/admin/manageExams/create")}
            >
              Create New Exam
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <p>TOTAL STUDENTS</p>
              <h2>{stats.totalStudents}</h2>
            </div>
            <div className="stat-box active">
              <p>TOTAL EXAMS</p>
              <h2>{stats.totalExams}</h2>
            </div>
            <div className="stat-box">
              <p>COURSES</p>
              <h2>{stats.totalCourses}</h2>
            </div>
            <div className="stat-box">
              <p>PASS RATE</p>
              <h2>{stats.passRate}%</h2>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Dashboard System Information</h3>
            </div>
            <p style={{ marginTop: "15px" }}>The dashboard is now connected to live MongoDB data. Total Attempts logged: {stats.totalAttempts}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;