import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../utils/getInitials";

function Topbar() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName") || "Student";
  const initials = getInitials(fullName);

  return (
    <div className="topbar">
      <input
        className="search-input"
        placeholder="Search courses, tasks, or resources..."
      />

      <div
        className="profile-circle"
        onClick={() => navigate("/profile")}
      >
        {initials}
      </div>
    </div>
  );
}

export default Topbar;