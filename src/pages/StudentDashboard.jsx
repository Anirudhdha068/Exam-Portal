import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/layout.css";
import "../styles/dashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ courses: [], attempts: [], certificates: [] });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const studentName = localStorage.getItem("fullName") || "Student";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/student/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load dashboard");
        const result = await res.json();
        setData(result);

        // Fetch exams from all assigned courses and deduplicate
        if (Array.isArray(result.courses) && result.courses.length > 0) {
          const examArrays = await Promise.all(
            result.courses.map((c) =>
              fetch(`/api/exam/course/${c._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then((r) => (r.ok ? r.json() : []))
            )
          );
          const allExams = examArrays.flat();
          // Deduplicate by _id
          const uniqueExams = [];
          const seen = new Set();
          for (const ex of allExams) {
            const id = ex._id?.toString?.() || ex._id;
            if (id && !seen.has(id)) {
              seen.add(id);
              uniqueExams.push(ex);
            }
          }
          setExams(uniqueExams);
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const handleTakeExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handleViewCertificate = (attemptId) => {
    navigate(`/certificate/${attemptId}`);
  };

  const programName = data.courses?.[0]?.program?.name || "N/A";
  const semesterName = data.courses?.[0]?.semester?.name || "N/A";

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <p style={{ color: "red" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <h1>Welcome back, {studentName}!</h1>
          <p className="welcome-sub">
            Your Program: {programName} | Semester: {semesterName}
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-title">ASSIGNED COURSES</p>
              <div className="stat-row">
                <div className="stat-value blue">{data.courses.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <p className="stat-title">COMPLETED EXAMS</p>
              <div className="stat-row">
                <div className="stat-value">{data.attempts.length}</div>
              </div>
            </div>
            <div className="stat-card">
              <p className="stat-title">CERTIFICATES ISSUED</p>
              <div className="stat-row">
                <div className="stat-value">{data.certificates.length}</div>
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: "30px" }}>Assigned Exams</h2>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            {exams.length === 0 && <p>No exams assigned to your courses.</p>}
            {exams.map((ex) => {
              const attempt = data.attempts.find(
                (a) => String(a.exam?._id) === String(ex._id)
              );
              return (
                <div
                  key={ex._id}
                  style={{
                    background: "#f9f9f9",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "300px",
                    border: "1px solid #ddd",
                  }}
                >
                  <h3>{ex.title}</h3>
                  <p>Course: {ex.course?.title || "N/A"}</p>
                  <p>Total Marks: {ex.totalMarks}</p>
                  <p>Passing Marks: {ex.passingMarks}</p>
                  {attempt ? (
                    <div style={{ marginTop: "10px" }}>
                      <p>
                        Status:{" "}
                        <b
                          style={{
                            color: attempt.status === "Pass" ? "green" : "red",
                          }}
                        >
                          {attempt.status}
                        </b>
                      </p>
                      <p>Score: {attempt.score}</p>
                      {attempt.status === "Pass" && (
                        <button
                          onClick={() => handleViewCertificate(attempt._id)}
                          style={{
                            marginTop: "10px",
                            padding: "8px",
                            background: "green",
                            color: "white",
                            borderRadius: "5px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          View Certificate
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTakeExam(ex._id)}
                      style={{
                        marginTop: "10px",
                        padding: "8px",
                        background: "#007bff",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Take Exam
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;

