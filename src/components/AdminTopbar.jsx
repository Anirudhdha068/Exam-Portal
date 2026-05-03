import "../styles/adminLayout.css";
import { useNavigate } from "react-router-dom";

function AdminTopbar() {
  const navigate = useNavigate();

  const name = localStorage.getItem("fullName") || "Admin";

  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="admin-topbar">
      <h1>Admin Dashboard</h1>
      <div className="profile-circle" onClick={() => navigate("/admin/profile")}>{initials}</div>
    </div>
  );
}

export default AdminTopbar;
