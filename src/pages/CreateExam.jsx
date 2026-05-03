import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/createExam.css";

function CreateExam() {
  const token = localStorage.getItem("token");

  // Dropdown data
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);

  // Selections
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Loading states
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // Exam form
  const [form, setForm] = useState({
    title: "",
    durationMinutes: 60,
    totalMarks: 100,
    passingMarks: 40,
    questions: [],
  });

  // Question form
  const [qForm, setQForm] = useState({
    questionText: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctAnswer: "",
  });

  // Fetch programs on mount
  useEffect(() => {
    setLoadingPrograms(true);
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => {
        setPrograms(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load programs"))
      .finally(() => setLoadingPrograms(false));
  }, []);

  // Fetch semesters when program changes
  useEffect(() => {
    if (!selectedProgram) {
      setSemesters([]);
      setSelectedSemester("");
      setCourses([]);
      setSelectedCourse("");
      return;
    }
    setLoadingSemesters(true);
    fetch(`/api/semesters/${selectedProgram}`)
      .then((res) => res.json())
      .then((data) => {
        setSemesters(Array.isArray(data) ? data : []);
        setSelectedSemester("");
        setCourses([]);
        setSelectedCourse("");
      })
      .catch(() => setError("Failed to load semesters"))
      .finally(() => setLoadingSemesters(false));
  }, [selectedProgram]);

  // Fetch courses when semester changes
  useEffect(() => {
    if (!selectedSemester) {
      setCourses([]);
      setSelectedCourse("");
      return;
    }
    setLoadingCourses(true);
    fetch(`/api/courses/${selectedSemester}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setSelectedCourse("");
      })
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoadingCourses(false));
  }, [selectedSemester, token]);

  const addQuestion = () => {
    if (!qForm.questionText || !qForm.optA || !qForm.optB) {
      alert("Please fill in the question text and at least two options.");
      return;
    }
    if (!qForm.correctAnswer) {
      alert("Please enter the correct answer value.");
      return;
    }
    const options = [qForm.optA, qForm.optB, qForm.optC, qForm.optD].filter(
      (o) => o && o.trim() !== ""
    );
    if (!options.includes(qForm.correctAnswer)) {
      alert("Correct answer must exactly match one of the provided options.");
      return;
    }
    const newQ = {
      questionText: qForm.questionText,
      options,
      correctAnswer: qForm.correctAnswer,
    };
    setForm((prev) => ({ ...prev, questions: [...prev.questions, newQ] }));
    setQForm({
      questionText: "",
      optA: "",
      optB: "",
      optC: "",
      optD: "",
      correctAnswer: "",
    });
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const publishExam = async () => {
    if (!form.title || !selectedCourse || !selectedSemester || form.questions.length === 0) {
      alert("Please fill in the title, select program/semester/course, and add at least one question.");
      return;
    }

    setPublishing(true);
    setError("");

    const payload = {
      title: form.title,
      course: selectedCourse,
      semester: selectedSemester,
      durationMinutes: Number(form.durationMinutes),
      totalMarks: Number(form.totalMarks),
      passingMarks: Number(form.passingMarks),
      questions: form.questions,
    };

    try {
      const res = await fetch("/api/exam/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Exam Published Successfully!");
        window.location.reload();
      } else {
        setError(data.message || "Failed to publish exam");
        alert("Error: " + (data.message || "Failed to publish exam"));
      }
    } catch (err) {
      setError("Network error while publishing exam");
      alert("Network error while publishing exam");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />

        <div className="admin-content">
          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <div className="builder-header">
            <div>
              <h1>Exam Builder Dashboard</h1>
            </div>
            <div className="builder-actions">
              <button
                className="publish-btn"
                onClick={publishExam}
                disabled={publishing}
              >
                {publishing ? "Publishing..." : "Publish Exam"}
              </button>
            </div>
          </div>

          <div className="builder-card">
            <h3>Section 1: Exam Details</h3>
            <div className="form-grid">
              <div>
                <label>Exam Title</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g., Q3 Advanced Calculus Final"
                />
              </div>

              <div>
                <label>Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  disabled={loadingPrograms}
                >
                  <option value="">
                    {loadingPrograms ? "Loading..." : "Select Program"}
                  </option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  disabled={!selectedProgram || loadingSemesters}
                >
                  <option value="">
                    {!selectedProgram
                      ? "Select Program first"
                      : loadingSemesters
                      ? "Loading..."
                      : "Select Semester"}
                  </option>
                  {semesters.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={!selectedSemester || loadingCourses}
                >
                  <option value="">
                    {!selectedSemester
                      ? "Select Semester first"
                      : loadingCourses
                      ? "Loading..."
                      : "Select Course"}
                  </option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Duration (mins)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Total Marks</label>
                <input
                  type="number"
                  value={form.totalMarks}
                  onChange={(e) =>
                    setForm({ ...form, totalMarks: e.target.value })
                  }
                />
              </div>

              <div>
                <label>Passing Marks</label>
                <input
                  type="number"
                  value={form.passingMarks}
                  onChange={(e) =>
                    setForm({ ...form, passingMarks: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="builder-row">
            <div className="builder-card left">
              <h3>Section 2: Question Builder</h3>
              <label>Enter Question</label>
              <textarea
                value={qForm.questionText}
                onChange={(e) =>
                  setQForm({ ...qForm, questionText: e.target.value })
                }
                placeholder="Type your question stem here..."
              />

              <div className="option-inputs">
                <input
                  value={qForm.optA}
                  onChange={(e) =>
                    setQForm({ ...qForm, optA: e.target.value })
                  }
                  placeholder="Option A text"
                />
                <input
                  value={qForm.optB}
                  onChange={(e) =>
                    setQForm({ ...qForm, optB: e.target.value })
                  }
                  placeholder="Option B text"
                />
                <input
                  value={qForm.optC}
                  onChange={(e) =>
                    setQForm({ ...qForm, optC: e.target.value })
                  }
                  placeholder="Option C text"
                />
                <input
                  value={qForm.optD}
                  onChange={(e) =>
                    setQForm({ ...qForm, optD: e.target.value })
                  }
                  placeholder="Option D text"
                />
              </div>

              <div className="form-grid">
                <div>
                  <label>Correct Answer Value (exact text)</label>
                  <input
                    style={{ width: "100%" }}
                    value={qForm.correctAnswer}
                    onChange={(e) =>
                      setQForm({ ...qForm, correctAnswer: e.target.value })
                    }
                    placeholder="Must exactly match one option above"
                  />
                </div>
              </div>

              <button className="add-btn" onClick={addQuestion}>
                + Add Question to Exam
              </button>
            </div>

            <div className="builder-card right">
              <h3>Section 3: Added Questions ({form.questions.length})</h3>
              {form.questions.length === 0 ? (
                <p>No questions added yet.</p>
              ) : (
                <table className="question-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Correct Answer</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.questions.map((q, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{q.questionText}</td>
                        <td>{q.correctAnswer}</td>
                        <td>
                          <button
                            onClick={() => removeQuestion(i)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;

