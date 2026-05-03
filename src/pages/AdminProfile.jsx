import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/adminProfile.css";

function AdminProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(console.error);
  }, []);

  if (!user) return <div className="admin-layout"><AdminSidebar /><div className="admin-main"><AdminTopbar /><div className="admin-content">Loading profile...</div></div></div>;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="profile-header">
            <h1>Admin Profile</h1>
            <p>Manage your administrator account information</p>
          </div>
          <div className="profile-card">
            <div className="profile-photo">
              <div className="avatar-big">{user.fullName ? user.fullName[0].toUpperCase() : "A"}</div>
              <h3>{user.fullName}</h3>
              <p>System Administrator</p>
            </div>
            <hr />
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={user.fullName || ""} readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user.email || ""} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={user.role || "Administrator"} readOnly />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={user.username || ""} readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;

