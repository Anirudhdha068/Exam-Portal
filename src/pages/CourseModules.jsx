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
                     <span className="download">⬇</span>
                   </div>
                 </div>
               </div>
            ))}
          </div>

          <div className="request-box">
            <div className="plus">+</div>
            <h3>New Module Requests</h3>
            <p>Can't find your module? Contact your administrator to assign you to a specific course track.</p>
            <button className="request-btn">Request Access</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseModules;