import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import "../styles/layout.css";
import "../styles/modules.css";
import javaImg from "../assets/module.png";


function CourseModules() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [moduleName, setModuleName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/student/dashboard", { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
         if (data.courses) setCourses(data.courses);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content modules-content">
          <div className="modules-header">
            <div>
              <h1>Available Course Modules</h1>
              <p>Manage and track your assigned courses.</p>
            </div>
            <input className="module-search" placeholder="Search modules..." />
          </div>

          <div className="modules-grid">
            {courses.length === 0 && <p>No courses assigned to you.</p>}
            {courses.map(course => (
               <div key={course._id} className="module-card clickable" onClick={() => navigate(`/course-detail/${course._id}`)}>
                 <div className="module-image">
                   <img src={javaImg} alt={course.title} />
                   <span className="active-tag">ACTIVE</span>
                 </div>
                 <div className="module-body">
                   <h2>{course.title} ({course.code})</h2>
                   <div className="module-info">
                     <span>Semester: {course.semester?.name}</span>
                   </div>
                   <div className="resource-box">
                     <span>Course Information attached</span>
                     <span className="download"></span>
                   </div>
                 </div>
               </div>
            ))}
          </div>

          <div className="request-box">
            <div className="plus"></div>
            <h3>New Module Requests</h3>
            {submitted ? (
              <div className="success-message">
                <p>Module request submitted successfully! Admin will review it soon.</p>
                <button className="request-btn" onClick={() => {
                  setSubmitted(false);
                  setModuleName('');
                  setDescription('');
                }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const token = localStorage.getItem("token");
                  const res = await fetch("/api/module-requests", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ moduleName, description })
                  });
                  if (res.ok) {
                    setSubmitted(true);
                  } else {
                    alert("Failed to submit request");
                  }
                } catch (err) {
                  alert("Error: " + err.message);
                }
                setLoading(false);
              }} className="request-form">
                <input
                  type="text"
                  placeholder="Module Name (e.g., Advanced Java)"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="form-input"
                  required
                />
                <textarea
                  placeholder="Describe why you need this module..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows="3"
                  required
                ></textarea>
                <button type="submit" className="request-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseModules;