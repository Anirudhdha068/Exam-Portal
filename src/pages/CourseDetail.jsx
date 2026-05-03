import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/layout.css";
import "../styles/courseDetail.css";
import { useNavigate, useParams } from "react-router-dom";

function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch course details
        const courseRes = await fetch(`/api/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!courseRes.ok) throw new Error("Failed to fetch course details");
        const courseData = await courseRes.json();

        // 2. Fetch exams for this course
        const examsRes = await fetch(`/api/exam/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examsData = examsRes.ok ? await examsRes.json() : [];

        // 3. Fetch student resources and filter
        const resourcesRes = await fetch("/api/resources/student", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resourcesData = resourcesRes.ok ? await resourcesRes.json() : [];
        const filteredResources = Array.isArray(resourcesData)
          ? resourcesData.filter((r) => String(r.course?._id) === courseId)
          : [];

        // 4. Fetch student dashboard for attempts
        const dashboardRes = await fetch("/api/student/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dashboardData = dashboardRes.ok ? await dashboardRes.json() : {};
        const studentAttempts = Array.isArray(dashboardData.attempts)
          ? dashboardData.attempts
          : [];

        if (isMounted) {
          setCourse(courseData);
          setExams(Array.isArray(examsData) ? examsData : []);
          setResources(filteredResources);
          setAttempts(studentAttempts);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [courseId, token]);

  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">Loading course details...</div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <p style={{ color: "red" }}>
              {error || "Course not found or access denied."}
            </p>
            <button onClick={() => navigate("/modules")} className="quiz-btn">
              Back to Modules
            </button>
          </div>
        </div>
      </div>
    );
  }

  const courseAttempts = attempts.filter((a) => {
    const examCourseId = String(a.exam?.course?._id || a.exam?.course);
    return examCourseId === courseId;
  });

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content course-detail">
          <p className="breadcrumb">
            Course Modules {" > "} <span>{course.title}</span>
          </p>

          <h1>
            {course.title} ({course.code})
          </h1>
          <div className="course-meta" style={{ marginBottom: "15px" }}>
            <span
              style={{
                display: "inline-block",
                background: "#eef2ff",
                padding: "6px 12px",
                borderRadius: "6px",
                marginRight: "10px",
                fontSize: "14px",
              }}
            >
              <strong>Program:</strong> {course.program?.name || "N/A"}
            </span>
            <span
              style={{
                display: "inline-block",
                background: "#f0fdf4",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <strong>Semester:</strong> {course.semester?.name || "N/A"}
            </span>
          </div>
          <p className="course-desc">
            Deep dive into {course.title} concepts. Assigned for Semester:{" "}
            {course.semester?.name || "N/A"} under{" "}
            {course.program?.name || "N/A"}.
          </p>

          <h2 style={{ marginTop: "30px" }}>Exams for this Course</h2>
          {exams.length === 0 && (
            <p>No exams assigned for this course yet.</p>
          )}
          {exams.map((ex) => {
            const attemptCount = attempts.filter(
              (a) => String(a.exam?._id) === String(ex._id)
            ).length;
            return (
              <div
                key={ex._id}
                className="exam-card"
                style={{ marginTop: "15px" }}
              >
                <div>
                  <span className="exam-tag">EXAM</span>
                  <h2>{ex.title}</h2>
                  <div className="exam-meta">
                    <span>📄 {ex.questions?.length || 0} Questions</span>
                    <span>⏱ {ex.durationMinutes} Mins</span>
                    <span>📈 Passing: {ex.passingMarks}</span>
                  </div>
                  <p className="avg-score">Attempts taken: {attemptCount}</p>
                </div>
                <button
                  className="quiz-btn"
                  onClick={() => navigate(`/exam/${ex._id}`)}
                >
                  Take Exam ▷
                </button>
              </div>
            );
          })}

          <div
            className="section-header"
            style={{ marginTop: "30px" }}
          >
            <h2>Study Resources</h2>
            <span>Available for this course</span>
          </div>

          {resources.length === 0 && (
            <p>No resources available for this course.</p>
          )}
          {resources.map((r) => (
            <div key={r._id} className="resource-card">
              <div>
                <strong>{r.title}</strong>
                <p>
                  {r.type} {r.fileUrl ? "- File" : ""}
                </p>
              </div>
              {r.fileUrl ? (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="download-btn"
                >
                  Download
                </a>
              ) : r.externalLink ? (
                <a
                  href={r.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="download-btn"
                >
                  Open Link
                </a>
              ) : null}
            </div>
          ))}

          <h2 className="history-title" style={{ marginTop: "30px" }}>
            Attempt History for this Course
          </h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam Title</th>
                <th>Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courseAttempts.length === 0 && (
                <tr>
                  <td colSpan="5">No attempt history available.</td>
                </tr>
              )}
              {courseAttempts.map((a) => (
                <tr key={a._id}>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>{a.exam?.title || "Unknown Exam"}</td>
                  <td>
                    {a.score} / {a.totalMarks}
                  </td>
                  <td>
                    <span
                      className={a.status === "Pass" ? "passed" : "failed"}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status === "Pass" && (
                      <a
                        href={`/certificate/${a._id}`}
                        style={{
                          color: "blue",
                          textDecoration: "underline",
                        }}
                      >
                        View Certificate
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;

