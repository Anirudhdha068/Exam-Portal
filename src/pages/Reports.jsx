import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/layout.css";
import "../styles/reports.css";

function Reports() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/student/dashboard", { headers: {"Authorization": `Bearer ${token}`}})
       .then(res => res.json())
       .then(data => {
          if (data.attempts) setAttempts(data.attempts);
       })
       .catch(console.error);
  }, []);

  const handleDownloadPDF = () => {
    if (!attempts.length) {
      alert("No attempts available to generate report.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }

    const reportDate = new Date().toLocaleDateString();
    const total = attempts.length;
    const passCount = attempts.filter(a => a.status === "Pass").length;
    const passRate = total > 0 ? ((passCount / total) * 100).toFixed(0) : 0;
    const avgScore = total > 0 ? (attempts.reduce((sum, a) => sum + (a.score / a.totalMarks * 100), 0) / total).toFixed(1) : 0;

    const rows = attempts.map(a => `
      <tr>
        <td>${new Date(a.createdAt).toLocaleDateString()}</td>
        <td>${a.exam?.title || "Unknown Exam"}</td>
        <td>${a.score} / ${a.totalMarks}</td>
        <td>${((a.score / a.totalMarks) * 100).toFixed(1)}%</td>
        <td style="color:${a.status === "Pass" ? "green" : "red"};font-weight:bold;">${a.status}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
            .stat-box { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; width: 30%; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #4a6cf7; color: white; }
            tr:nth-child(even) { background: #f8f9fa; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Exam Performance Report</h1>
            <p>Generated on ${reportDate}</p>
          </div>
          <div class="stats">
            <div class="stat-box">
              <h3>${total}</h3>
              <p>Exams Completed</p>
            </div>
            <div class="stat-box">
              <h3>${passRate}%</h3>
              <p>Pass Rate</p>
            </div>
            <div class="stat-box">
              <h3>${avgScore}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam Title</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="no-print" style="margin-top:30px;text-align:center;">
            <button onclick="window.print()" style="padding:10px 20px;font-size:16px;cursor:pointer;">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <div className="reports-header">
            <div>
              <h1>My Exam Results</h1>
              <p>View your past performance and analytical data.</p>
            </div>
            <button className="primary-btn" onClick={handleDownloadPDF}>Download Report (PDF)</button>
          </div>

          <div className="report-stats">
            <div className="stat-card outline">
              <p>EXAMS COMPLETED</p>
              <h2>{attempts.length}</h2>
            </div>
            <div className="stat-card outline">
              <p>PASS RATE</p>
              <h2>{attempts.length > 0 ? ((attempts.filter(a => a.status==='Pass').length / attempts.length) * 100).toFixed(0) : 0}%</h2>
            </div>
          </div>

          <div className="history-section">
            <h3>Recent Attempts</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>EXAM TITLE</th>
                  <th>SCORE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 && <tr><td colSpan="5">No attempts found.</td></tr>}
                {attempts.map(a => (
                   <tr key={a._id}>
                     <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                     <td>{a.exam?.title || "Unknown Exam"}</td>
                     <td>{a.score} / {a.totalMarks}</td>
                     <td>
                        <span className={`badge ${a.status === 'Pass' ? 'pass' : 'fail'}`}>
                          {a.status}
                        </span>
                     </td>
                     <td>
                        {a.status === 'Pass' && (
                          <a href={`/certificate/${a._id}`} className="view-link">View Certificate</a>
                        )}
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;