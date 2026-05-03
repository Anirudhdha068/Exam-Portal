import "../styles/dashboard.css";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div>
        <h2 className="sidebar-logo">🎓 Exam Portal</h2>

        <ul className="sidebar-menu">

          <li>
            <NavLink 
              to="/student-dashboard"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/modules"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Course Modules
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/reports"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Reports & Certificates
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/profile"
              className={({ isActive }) =>
                isActive ? "active-link" : ""
              }
            >
              Profile
            </NavLink>
          </li>

        </ul>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;

