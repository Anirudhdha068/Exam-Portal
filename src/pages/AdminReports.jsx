import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/adminReports.css";
import { useNavigate } from "react-router-dom";

function AdminReports() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");
      fetch("/api/admin/attempts", { headers: { "Authorization": `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          setAttempts(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, []);

    const total = attempts.length;
    const passCount = attempts.filter(a => a.status === "Pass").length;
    const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
    const avgScore = total > 0 ? (attempts.reduce((sum, a) => sum + (a.score / a.totalMarks * 100), 0) / total).toFixed(1) : 0;
    const highest = total > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

    const getInitials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase() : "ST";

    const handleViewDetails = (id) => {
      navigate(`/admin/report-details?attemptId=${id}`);
    };

    const handleExportCSV = () => {
      if (!attempts.length) {
        alert("No data to export.");
        return;
      }
      const headers = ["Student Name", "Exam", "Score", "Total Marks", "Percentage", "Status", "Date"];
      const rows = attempts.map(a => {
        const pct = a.totalMarks > 0 ? ((a.score / a.totalMarks) * 100).toFixed(2) : "0.00";
        return [
          `"${(a.student?.fullName || "Unknown").replace(/"/g, '""')}"`,
          `"${(a.exam?.title || "Unknown Exam").replace(/"/g, '""')}"`,
          a.score,
          a.totalMarks,
          `${pct}%`,
          a.status,
          new Date(a.createdAt).toLocaleDateString()
        ];
      });
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `exam-reports-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="reports-header">
            <div>
              <h1>Exam Reports</h1>
              <p>View and analyze student performance across all exams.</p>
            </div>
            <button className="export-btn" onClick={handleExportCSV}>⬇ Export Data</button>
          </div>

          <div className="reports-card">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  <th>EXAM</th>
                  <th>SCORE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="5">Loading...</td></tr>}
                {!loading && attempts.length === 0 && <tr><td colSpan="5">No attempts found.</td></tr>}
                {attempts.map(a => {
                   const pct = a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0;
                   return (
                     <tr key={a._id}>
                       <td className="student-cell">
                         <div className="avatar blue">{getInitials(a.student?.fullName)}</div>
                         <span>{a.student?.fullName || "Unknown"}</span>
                       </td>
                       <td>{a.exam?.title || "Unknown Exam"}</td>
                       <td>
                         <div className="score-box">
                           <strong>{a.score} / {a.totalMarks}</strong>
                           <div className="progress">
                             <div className={`progress-bar ${pct >= 50 ? 'green' : 'red'}`} style={{width:`${Math.min(pct, 100)}%`}}></div>
                           </div>
                         </div>
                       </td>
                       <td>
                         <span className={`status ${a.status === 'Pass' ? 'pass' : 'fail'}`}>{a.status}</span>
                       </td>
                       <td className="action-link" onClick={() => handleViewDetails(a._id)}>View Details</td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
            <div className="table-footer">Showing {attempts.length} of {attempts.length} students</div>
          </div>

          <div className="reports-stats">
            <div className="stat-card">
              <p>AVERAGE SCORE</p>
              <h2>{avgScore}%</h2>
            </div>
            <div className="stat-card">
              <p>PASS RATE</p>
              <h2>{passRate}%</h2>
            </div>
            <div className="stat-card">
              <p>HIGHEST SCORE</p>
              <h2>{highest}</h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminReports;

