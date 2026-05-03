import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/layout.css";
import "../styles/examInstructions.css";

function ExamInstructions() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load exam details");
        const data = await res.json();
        setExam(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, token]);

  const handleStartQuiz = () => {
    navigate(`/exam/${examId}/start`);
  };

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">Loading exam details...</div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <p style={{ color: "red" }}>{error || "Exam not found."}</p>
            <button onClick={() => navigate("/student-dashboard")} className="start-btn" style={{ marginTop: "20px" }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questionCount = exam.questions?.length || 0;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <div className="instructions-card">
            <div className="instructions-header">
              <h1>{exam.title}</h1>
              <p className="instructions-subtitle">Please read the instructions carefully before starting the exam.</p>
            </div>

            <div className="instructions-meta">
              <div className="meta-item">
                <span className="meta-icon">⏱</span>
                <div>
                  <p className="meta-label">Duration</p>
                  <p className="meta-value">{exam.durationMinutes} Minutes</p>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📊</span>
                <div>
                  <p className="meta-label">Total Marks</p>
                  <p className="meta-value">{exam.totalMarks}</p>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">❓</span>
                <div>
                  <p className="meta-label">Questions</p>
                  <p className="meta-value">{questionCount}</p>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon">✅</span>
                <div>
                  <p className="meta-label">Passing Marks</p>
                  <p className="meta-value">{exam.passingMarks}</p>
                </div>
              </div>
            </div>

            <div className="instructions-rules">
              <h3>📋 Exam Rules & Guidelines</h3>
              <ul>
                <li>The exam must be completed within the given duration. The timer will start once you click "Start Quiz".</li>
                <li>Do <strong>NOT</strong> refresh the page during the exam. Doing so may result in loss of answers.</li>
                <li>Do <strong>NOT</strong> switch tabs or minimize the browser window. Tab switching is monitored.</li>
                <li>Each question carries equal marks distributed across the total marks.</li>
                <li>You can navigate between questions using the Previous and Next buttons.</li>
                <li>Once you submit the exam, you cannot change your answers.</li>
                <li>The exam will be auto-submitted when the timer reaches zero.</li>
                <li>Ensure you have a stable internet connection before starting.</li>
              </ul>
            </div>

            <div className="instructions-footer">
              <button className="secondary-btn" onClick={() => navigate("/student-dashboard")}>
                ← Back to Dashboard
              </button>
              <button className="start-btn" onClick={handleStartQuiz}>
                Start Quiz ▷
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamInstructions;

