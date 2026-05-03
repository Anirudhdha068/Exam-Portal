import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/layout.css";
import "../styles/profile.css";
import profileImg from "../assets/profile.png";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/auth/me", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(console.error);
  }, []);

  if (!user) return <div className="layout"><Sidebar /><div className="main"><Topbar /><div className="content">Loading profile...</div></div></div>;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content profile-wrapper">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Your personal and academic information</p>
          </div>

          <div className="profile-card">
            <div className="profile-photo-section">
              <div className="avatar-large" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '36px', 
                fontWeight: 'bold',
                margin: '0 auto 20px'
              }}>
                {(user.fullName || 'U').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <h3>{user.fullName || 'User'}</h3>
              <p>{user.email || "No email on file"}</p>
            </div>
            <hr />
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={user.fullName || ""} readOnly />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user.email || ""} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Current Semester</label>
                  <input type="text" value={user.semester?.name || "N/A"} readOnly />
                </div>
                <div className="form-group">
                  <label>Major / Program</label>
                  <input type="text" value={user.program?.name || "N/A"} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Courses</label>
                  <input type="text" value={user.courses?.map(c => c.title).join(", ") || "N/A"} readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-note">
            ℹ️ These details are visible to instructors and fellow students.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

