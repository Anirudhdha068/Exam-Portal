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

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState({});


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

  useEffect(() => {
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/module-requests", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error("Failed to fetch module requests");
      }
      setLoadingRequests(false);
    };
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setLoadingUpdate(prev => ({...prev, [id]: true}));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/module-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setRequests(requests.map(r => r._id === id ? {...r, status} : r));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoadingUpdate(prev => ({...prev, [id]: false}));
  };

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

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Module Requests ({requests.filter(r => r.status === 'Pending').length})</h3>
            </div>
            {loadingRequests ? (
              <p>Loading requests...</p>
            ) : requests.length === 0 ? (
              <p>No module requests</p>
            ) : (
              <div className="requests-list">
                {requests.map(request => (
                  <div key={request._id} className="request-item">
                    <div className="request-info">
                      <h4>{request.moduleName}</h4>
                      <p>{request.description}</p>
                      <p><strong>By:</strong> {request.requestedBy?.fullName || 'Unknown'}</p>
                      <span className={`status-badge ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="request-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => handleStatusUpdate(request._id, 'Approved')}
                          disabled={loadingUpdate[request._id]}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                          disabled={loadingUpdate[request._id]}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;