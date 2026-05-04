import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/manageExams.css";

function ManageExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/exam/all", { headers: { "Authorization": `Bearer ${token}` }});
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/exam/${id}/toggle-status`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchExams();
      } else {
        alert(data.message || "Failed to toggle status");
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling status");
    }
  };

  const handleEdit = (exam) => {
    if (exam.isActive) {
      alert("Active exams cannot be modified or deleted");
      return;
    }
    navigate(`/admin/manageExams/edit/${exam._id}`);
  };

  const handleDelete = async (exam) => {
    if (exam.isActive) {
      alert("Active exams cannot be modified or deleted");
      return;
    }
    if (!window.confirm("Are you sure?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/exam/${exam._id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchExams();
      } else {
        alert(data.message || "Failed to delete exam");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = exams.filter(e => e.isActive).length;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="manage-header">
            <div>
              <h1>Manage Exams</h1>
              <p>Create, edit, or toggle the status of your online tests.</p>
            </div>
            <button className="create-btn" onClick={() => navigate("/admin/manageExams/create")}>
              Create New Exam
            </button>
          </div>

          <div className="manage-card">
            <div className="table-header">
              <span>EXAM DETAILS</span>
              <span>DUR / PASS MARKS</span>
              <span>TOTAL MARKS</span>
              <span>COURSE</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            {exams.map(ex => (
              <div className="table-row" key={ex._id}>
                <div>
                  <h4>{ex.title}</h4>
                  <p>{ex.questions?.length || 0} Questions</p>
                </div>
                <div>{ex.durationMinutes} Mins / {ex.passingMarks} Pass</div>
                <div>{ex.totalMarks}</div>
                <div>{ex.course ? ex.course.title : "N/A"}</div>
                <div>
                  <span className={`status ${ex.isActive ? "active" : "inactive"}`}>
                    {ex.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="action-btns">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={ex.isActive}
                      onChange={() => handleToggle(ex._id)}
                    />
                    <span className="slider"></span>
                  </label>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(ex)}
                    disabled={ex.isActive}
                    title={ex.isActive ? "Active exams cannot be modified" : "Edit Exam"}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(ex)}
                    disabled={ex.isActive}
                    title={ex.isActive ? "Active exams cannot be deleted" : "Delete Exam"}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {exams.length === 0 && <p style={{padding:"20px"}}>No exams found.</p>}
          </div>

          <div className="manage-stats">
            <div className="stat-box blue">
              <div>
                <p>Active Exams</p>
                <h2>{activeCount}</h2>
              </div>
            </div>
            <div className="stat-box" style={{background:"#f3f4f6"}}>
              <div>
                <p>Total Exams</p>
                <h2>{exams.length}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageExams;

