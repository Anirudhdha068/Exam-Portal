import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <div className="admin-sidebar">

      <div>
        <h2 className="admin-logo">🎓 Exam Portal</h2>
        <p className="admin-panel-label">ADMIN PANEL</p>

        <ul className="admin-menu">
          <li>
            <NavLink 
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/manageExams"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Manage Exams
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/register-student"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Add Student
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/manage-students"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Manage Students
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/resources"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Resources
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/reports"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Reports
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/admin/manage-academic"
              className={({ isActive }) =>
                isActive ? "admin-active" : ""
              }
            >
              Manage Academic
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Logout Button */}
      <button className="admin-logout-btn" onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
}

export default AdminSidebar;

