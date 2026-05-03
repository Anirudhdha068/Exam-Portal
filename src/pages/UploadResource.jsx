import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/uploadResource.css";

function UploadResource() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    title: "",
    type: "PDF",
    externalLink: "",
    program: "",
    semester: "",
    course: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/programs")
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    setForm({ ...form, program: programId, semester: "", course: "" });
    setSemesters([]);
    setCourses([]);
    if (programId) {
      fetch(`/api/semesters/${programId}`)
        .then(res => res.json())
        .then(data => setSemesters(Array.isArray(data) ? data : []))
        .catch(console.error);
    }
  };

  const [fetchError, setFetchError] = useState("");

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setForm({ ...form, semester: semesterId, course: "" });
    setCourses([]);
    setFetchError("");
    if (semesterId) {
      const token = localStorage.getItem("token");
      fetch(`/api/courses/${semesterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then(data => setCourses(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error(err);
          setFetchError("Failed to load courses. Please ensure you are logged in as admin.");
        });
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.course || !form.program || !form.semester) {
      alert("Please fill all required fields.");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("title", form.title);
    data.append("type", form.type);
    data.append("program", form.program);
    data.append("semester", form.semester);
    data.append("course", form.course);
    data.append("externalLink", form.externalLink);
    if (file) data.append("file", file);

    try {
      const res = await fetch("/api/resources/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        alert("Resource uploaded successfully!");
        navigate("/admin/resources");
      } else {
        const err = await res.json().catch(() => ({ message: "Unknown error occurred" }));
        alert("Upload failed: " + (err.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="upload-header">
            <div>
              <h1>Upload Resource</h1>
              <p>Add study materials, PDFs or external links.</p>
            </div>
          </div>

          <div className="upload-card">
            <div className="form-group">
              <label>Resource Title</label>
              <input type="text" placeholder="Enter resource title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Resource Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option>PDF</option>
                <option>Link</option>
                <option>Notes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Program</label>
              <select value={form.program} onChange={handleProgramChange}>
                <option value="">Select Program</option>
                {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Semester</label>
              <select value={form.semester} onChange={handleSemesterChange} disabled={!form.program}>
                <option value="">Select Semester</option>
                {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Course</label>
              <select value={form.course} onChange={e => setForm({...form, course: e.target.value})} disabled={!form.semester}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Upload File</label>
              <input type="file" onChange={e => setFile(e.target.files[0])} />
            </div>

            <div className="form-group">
              <label>Or External Link</label>
              <input type="text" placeholder="https://example.com/resource" value={form.externalLink} onChange={e => setForm({...form, externalLink: e.target.value})} />
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => navigate("/admin/resources")}>Cancel</button>
              <button className="save-btn" onClick={handleSubmit} disabled={uploading}>{uploading ? "Uploading..." : "Save Resource"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResource;

