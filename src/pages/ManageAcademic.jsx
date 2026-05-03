import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";

function ManageAcademic() {
  const token = localStorage.getItem("token");

  // Data states
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [allSemesters, setAllSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  // Loading / error states
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- Program Form ---
  const [progForm, setProgForm] = useState({ name: "", description: "" });
  const [progSubmitting, setProgSubmitting] = useState(false);

  // --- Semester Form ---
  const [semForm, setSemForm] = useState({ programId: "", name: "" });
  const [semSubmitting, setSemSubmitting] = useState(false);

  // --- Course Form ---
  const [courseForm, setCourseForm] = useState({
    programId: "",
    semesterId: "",
    title: "",
    code: "",
  });
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progRes, semRes, courseRes] = await Promise.all([
          fetch("/api/programs", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/semesters/all", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch("/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const programsData = progRes.ok ? await progRes.json() : [];
        const semestersData = semRes && semRes.ok ? await semRes.json() : [];
        const coursesData = courseRes.ok ? await courseRes.json() : [];

        setPrograms(Array.isArray(programsData) ? programsData : []);
        setAllSemesters(Array.isArray(semestersData) ? semestersData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        setError("Failed to load academic data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Filter semesters when program selected in course form
  useEffect(() => {
    if (!courseForm.programId) {
      setFilteredSemesters([]);
      setCourseForm((prev) => ({ ...prev, semesterId: "" }));
      return;
    }
    setFilteredSemesters(allSemesters.filter((s) => String(s.program?._id || s.program) === String(courseForm.programId)));
    setCourseForm((prev) => ({ ...prev, semesterId: "" }));
  }, [courseForm.programId, allSemesters]);

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setMessage("");
    } else {
      setMessage(msg);
      setError("");
    }
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);
  };

  // --- Add Program ---
  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!progForm.name.trim()) {
      showMessage("Program name is required", true);
      return;
    }
    setProgSubmitting(true);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(progForm),
      });
      const data = await res.json();
      if (res.ok) {
        setPrograms((prev) => [...prev, data]);
        setProgForm({ name: "", description: "" });
        showMessage("Program added successfully!");
      } else {
        showMessage(data.message || "Failed to add program", true);
      }
    } catch (err) {
      showMessage("Network error", true);
    } finally {
      setProgSubmitting(false);
    }
  };

  // --- Add Semester ---
  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!semForm.programId || !semForm.name.trim()) {
      showMessage("Please select a program and enter semester name", true);
      return;
    }
    setSemSubmitting(true);
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(semForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAllSemesters((prev) => [...prev, data]);
        setSemForm({ programId: "", name: "" });
        showMessage("Semester added successfully!");
      } else {
        showMessage(data.message || "Failed to add semester", true);
      }
    } catch (err) {
      showMessage("Network error", true);
    } finally {
      setSemSubmitting(false);
    }
  };

  // --- Add Course ---
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.programId || !courseForm.semesterId || !courseForm.title.trim() || !courseForm.code.trim()) {
      showMessage("All fields are required", true);
      return;
    }
    setCourseSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (res.ok) {
        setCourses((prev) => [...prev, data]);
        setCourseForm({ programId: "", semesterId: "", title: "", code: "" });
        showMessage("Course added successfully!");
      } else {
        showMessage(data.message || "Failed to add course", true);
      }
    } catch (err) {
      showMessage("Network error", true);
    } finally {
      setCourseSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <h1>Manage Academic Structure</h1>

          {(message || error) && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "6px",
                marginBottom: "16px",
                background: error ? "#fee2e2" : "#d1fae5",
                color: error ? "#991b1b" : "#065f46",
              }}
            >
              {error || message}
            </div>
          )}

          {/* Stats Row */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#2563eb" }}>{programs.length}</h2>
              <p style={{ margin: "5px 0 0", color: "#6b7280" }}>Programs</p>
            </div>
            <div style={{ flex: 1, minWidth: "200px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#2563eb" }}>{allSemesters.length}</h2>
              <p style={{ margin: "5px 0 0", color: "#6b7280" }}>Semesters</p>
            </div>
            <div style={{ flex: 1, minWidth: "200px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <h2 style={{ margin: 0, color: "#2563eb" }}>{courses.length}</h2>
              <p style={{ margin: "5px 0 0", color: "#6b7280" }}>Courses</p>
            </div>
          </div>

          {/* Forms Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Add Program */}
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>➕ Add Program</h3>
              <form onSubmit={handleAddProgram}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Program Name</label>
                  <input
                    type="text"
                    value={progForm.name}
                    onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                    placeholder="e.g. Bachelor of Computer Science"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Description</label>
                  <textarea
                    value={progForm.description}
                    onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                    placeholder="Optional description..."
                    rows="3"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={progSubmitting}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: progSubmitting ? "not-allowed" : "pointer",
                    opacity: progSubmitting ? 0.7 : 1,
                    fontWeight: 500,
                  }}
                >
                  {progSubmitting ? "Adding..." : "Add Program"}
                </button>
              </form>

              <h4 style={{ marginTop: "20px", marginBottom: "8px", fontSize: "14px", color: "#374151" }}>Existing Programs</h4>
              {programs.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No programs yet.</p>
              ) : (
                <ul style={{ paddingLeft: "18px", margin: 0 }}>
                  {programs.map((p) => (
                    <li key={p._id} style={{ fontSize: "13px", marginBottom: "4px", color: "#374151" }}>
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add Semester */}
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>➕ Add Semester</h3>
              <form onSubmit={handleAddSemester}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Program</label>
                  <select
                    value={semForm.programId}
                    onChange={(e) => setSemForm({ ...semForm, programId: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Semester Name</label>
                  <input
                    type="text"
                    value={semForm.name}
                    onChange={(e) => setSemForm({ ...semForm, name: e.target.value })}
                    placeholder="e.g. Semester 1"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={semSubmitting}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: semSubmitting ? "not-allowed" : "pointer",
                    opacity: semSubmitting ? 0.7 : 1,
                    fontWeight: 500,
                  }}
                >
                  {semSubmitting ? "Adding..." : "Add Semester"}
                </button>
              </form>

              <h4 style={{ marginTop: "20px", marginBottom: "8px", fontSize: "14px", color: "#374151" }}>Existing Semesters</h4>
              {allSemesters.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No semesters yet.</p>
              ) : (
                <ul style={{ paddingLeft: "18px", margin: 0 }}>
                  {allSemesters.map((s) => (
                    <li key={s._id} style={{ fontSize: "13px", marginBottom: "4px", color: "#374151" }}>
                      {s.name} → {programs.find((p) => p._id === (s.program?._id || s.program))?.name || "Unknown Program"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add Course */}
            <div style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ marginTop: 0 }}>➕ Add Course</h3>
              <form onSubmit={handleAddCourse}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Program</label>
                  <select
                    value={courseForm.programId}
                    onChange={(e) => setCourseForm({ ...courseForm, programId: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Semester</label>
                  <select
                    value={courseForm.semesterId}
                    onChange={(e) => setCourseForm({ ...courseForm, semesterId: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                    disabled={!courseForm.programId}
                  >
                    <option value="">{courseForm.programId ? "Select Semester" : "Select Program first"}</option>
                    {filteredSemesters.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. Data Structures"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Course Code</label>
                  <input
                    type="text"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    placeholder="e.g. CS101"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={courseSubmitting}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: courseSubmitting ? "not-allowed" : "pointer",
                    opacity: courseSubmitting ? 0.7 : 1,
                    fontWeight: 500,
                  }}
                >
                  {courseSubmitting ? "Adding..." : "Add Course"}
                </button>
              </form>

              <h4 style={{ marginTop: "20px", marginBottom: "8px", fontSize: "14px", color: "#374151" }}>Recent Courses</h4>
              {courses.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>No courses yet.</p>
              ) : (
                <ul style={{ paddingLeft: "18px", margin: 0 }}>
                  {courses.slice(0, 5).map((c) => (
                    <li key={c._id} style={{ fontSize: "13px", marginBottom: "4px", color: "#374151" }}>
                      {c.title} ({c.code})
                    </li>
                  ))}
                  {courses.length > 5 && (
                    <li style={{ fontSize: "13px", color: "#9ca3af" }}>...and {courses.length - 5} more</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageAcademic;

