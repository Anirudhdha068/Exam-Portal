import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CourseDetail from "./pages/CourseDetail";
import AdminDashboard from "./pages/AdminDashboard";
import CourseModules from "./pages/CourseModules";
import ExamInstructions from "./pages/ExamInstructions";
import QuizPage from "./pages/QuizPage";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import CreateExam from "./pages/CreateExam";
import ManageExams from "./pages/ManageExams";
import ManageAcademic from "./pages/ManageAcademic";
import Resources from "./pages/Resources";
import UploadResource from "./pages/UploadResource";
import AdminReports from "./pages/AdminReports";
import AdminReportDetails from "./pages/AdminReportDetails";
import AdminProfile from "./pages/AdminProfile";
import ManageStudents from "./pages/ManageStudents";
import CertificatePage from "./pages/CertificatePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/register-student" element={<Register />} />
      <Route path="/admin/manage-students" element={<ManageStudents />} />
      <Route path="/admin/manage-academic" element={<ManageAcademic />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/course-detail/:courseId" element={<CourseDetail />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/modules" element={<CourseModules />} />
      <Route path="/exam/:examId" element={<ExamInstructions />} />
      <Route path="/exam/:examId/start" element={<QuizPage />} />
      <Route path="/certificate/:attemptId" element={<CertificatePage />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin/manageExams" element={<ManageExams />} />
      <Route path="/admin/manageExams/create" element={<CreateExam />} />
      <Route path="/admin/manageExams/edit/:examId" element={<CreateExam />} />
      <Route path="/admin/resources" element={<Resources />} />
      <Route path="/admin/resources/upload" element={<UploadResource />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/report-details" element={<AdminReportDetails />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
    </Routes>
  );
}

export default App;
