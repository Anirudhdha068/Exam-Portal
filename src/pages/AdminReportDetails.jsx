import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/reportDetails.css";

function AdminReportDetails() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    const token = localStorage.getItem("token");
    fetch(`/api/admin/attempt/${attemptId}`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setAttempt(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [attemptId]);

  const getInitials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase() : "ST";

  if (loading) return <h2>Loading...</h2>;
  if (!attempt || attempt.message) return <h2>Report not found.</h2>;

  const exam = attempt.exam || {};
  const questions = exam.questions || [];
  const answersMap = new Map((attempt.answers || []).map(a => [a.questionId, a.selectedAnswer]));

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="report-details-header">
            <h1>Student Exam Details</h1>
            <p>Detailed performance report</p>
          </div>

          <div className="details-card">
            <div className="student-info">
              <div className="avatar-large">{getInitials(attempt.student?.fullName)}</div>
              <div>
                <h2>{attempt.student?.fullName || "Unknown"}</h2>
                <p>{exam.title || "Unknown Exam"}</p>
              </div>
            </div>
            <div className="score-section">
              <div className="score-box-large">
                <h3>Score</h3>
                <p>{attempt.score} / {attempt.totalMarks}</p>
              </div>
              <div className="score-box-large">
                <h3>Status</h3>
                <p className={attempt.status === 'Pass' ? 'pass' : ''}>{attempt.status}</p>
              </div>
              <div className="score-box-large">
                <h3>Completion Time</h3>
                <p>{exam.durationMinutes || 0} Minutes</p>
              </div>
            </div>
          </div>

          <div className="details-card">
            <h3>Question Breakdown</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Correct Answer</th>
                  <th>Student Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => {
                   const studentAnswer = answersMap.get(q._id) || "—";
                   const isCorrect = studentAnswer === q.correctAnswer;
                   return (
                     <tr key={q._id}>
                       <td>{idx + 1}</td>
                       <td>{q.questionText}</td>
                       <td>{q.correctAnswer}</td>
                       <td>{studentAnswer}</td>
                       <td className={isCorrect ? "correct" : "wrong"}>{isCorrect ? "Correct" : "Wrong"}</td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminReportDetails;

