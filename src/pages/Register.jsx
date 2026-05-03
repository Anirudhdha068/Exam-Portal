import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    semester: "",
    program: "",
    courses: "" // Single course selection
  });

  useEffect(() => {
    fetch("/api/programs")
      .then(res => res.json())
      .then(data => setPrograms(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    setForm({ ...form, program: programId, semester: "", courses: "" });
    setCoursesList([]);
    
    if (programId) {
      fetch(`/api/semesters/${programId}`)
        .then(res => res.json())
        .then(data => setSemesters(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    } else {
      setSemesters([]);
    }
  };

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setForm({ ...form, semester: semesterId, courses: "" });

    if (semesterId) {
      const token = localStorage.getItem("token");
      fetch(`/api/courses/${semesterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then(data => setCoursesList(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error(err);
          setError("Failed to load courses. Please ensure you are logged in as admin.");
        });
    } else {
      setCoursesList([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    if (Object.values(form).some((value) => !value)) {
      setError("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authorization token missing. Are you logged in as Admin?");
      return;
    }

    try {
      const response = await fetch("/api/auth/register-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to register student");
        return;
      }

      alert(data.message || "Student added successfully!");
      navigate("/admin/manage-students");
    } catch (err) {
      setError("Server error while adding student.");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Add New Student</h2>
        <p className="subtitle">Admin Portal: Register a student manually. Password will be auto-generated and emailed.</p>

        {error && <p className="error">{error}</p>}

        <div className="grid-2">
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="fullName"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Program</label>
            <select name="program" value={form.program} onChange={handleProgramChange}>
              <option value="">Select Program</option>
              {programs.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>Semester</label>
            <select name="semester" value={form.semester} onChange={handleSemesterChange} disabled={!form.program}>
              <option value="">Select Semester</option>
              {semesters.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course</label>
            <select name="courses" value={form.courses} onChange={handleChange} disabled={!form.semester}>
              <option value="">Select Course</option>
              {coursesList.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="signup-btn" onClick={handleSubmit}>
          Add Student
        </button>

        <p className="login-redirect">
          Done adding?{" "}
          <span onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
