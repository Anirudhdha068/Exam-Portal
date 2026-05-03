import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  
  // Data for edit dropdowns
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetch("/api/programs").then(r => r.json()).then(data => setPrograms(Array.isArray(data) ? data : []));
  }, []);

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/student/all", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`/api/student/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (student) => {
    setEditStudent({
      ...student,
      program: student.program?._id || "",
      semester: student.semester?._id || "",
      courses: student.courses && student.courses.length > 0 ? student.courses[0] : ""
    });
    
    // Load semesters and courses for their current program/semester to populate right away
    if (student.program?._id) {
       fetch(`/api/semesters/${student.program._id}`).then(r => r.json()).then(data => setSemesters(Array.isArray(data) ? data : []));
    }
    if (student.semester?._id) {
       fetch(`/api/courses/${student.semester._id}`).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : []));
    }
  };

  const handleUpdate = async () => {
    if (!editStudent) return;
    const token = localStorage.getItem("token");
    try {
      const payload = {
        fullName: editStudent.fullName,
        email: editStudent.email,
        program: editStudent.program,
        semester: editStudent.semester,
        courses: editStudent.courses ? [editStudent.courses] : []
      };

      const res = await fetch(`/api/student/${editStudent._id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Student updated correctly");
        setEditStudent(null);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="dashboard-header">
            <h1>Manage Students</h1>
          </div>
          
          {editStudent && (
             <div style={{background:"#fff", padding:"20px", marginBottom:"20px", borderRadius:"10px", border:"1px solid #ddd"}}>
                <h3>Edit Student</h3>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'10px'}}>
                   <input value={editStudent.fullName} onChange={e => setEditStudent({...editStudent, fullName: e.target.value})} placeholder="Full Name" />
                   <input value={editStudent.email} onChange={e => setEditStudent({...editStudent, email: e.target.value})} placeholder="Email" />
                   
                   <select value={editStudent.program} onChange={e => {
                      setEditStudent({...editStudent, program: e.target.value, semester: "", courses: ""});
                      if (e.target.value) {
                         fetch(`/api/semesters/${e.target.value}`).then(r => r.json()).then(data => setSemesters(Array.isArray(data) ? data : []));
                      } else { setSemesters([]); }
                   }}>
                      <option value="">Select Program</option>
                      {programs.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}
                   </select>

                   <select value={editStudent.semester} onChange={e => {
                      setEditStudent({...editStudent, semester: e.target.value, courses: ""});
                      if (e.target.value) {
                         fetch(`/api/courses/${e.target.value}`).then(r => r.json()).then(data => setCourses(Array.isArray(data) ? data : []));
                      } else { setCourses([]); }
                   }}>
                      <option value="">Select Semester</option>
                      {semesters.map(s => <option value={s._id} key={s._id}>{s.name}</option>)}
                   </select>

                   <select value={editStudent.courses} onChange={e => setEditStudent({...editStudent, courses: e.target.value})}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option value={c._id} key={c._id}>{c.title}</option>)}
                   </select>
                </div>
                <div style={{marginTop:'15px'}}>
                   <button onClick={handleUpdate} style={{background:'green', color:'white', padding:'8px 12px', marginRight:'10px', borderRadius:'5px'}}>Save Changes</button>
                   <button onClick={() => setEditStudent(null)} style={{background:'gray', color:'white', padding:'8px 12px', borderRadius:'5px'}}>Cancel</button>
                </div>
             </div>
          )}

          <div className="dashboard-card">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>USERNAME</th>
                  <th>PROGRAM</th>
                  <th>SEMESTER</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>{s.fullName}</td>
                    <td>{s.username}</td>
                    <td>{s.program ? s.program.name : "N/A"}</td>
                    <td>{s.semester ? s.semester.name : "N/A"}</td>
                    <td>
                      <button onClick={() => handleEditClick(s)} style={{ background: 'orange', color: 'white', padding: '5px 10px', borderRadius: '5px', marginRight: '5px' }}>Edit</button>
                      <button onClick={() => handleDelete(s._id)} style={{ background: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px' }}>Delete</button>
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

export default ManageStudents;
