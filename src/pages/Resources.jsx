import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";
import "../styles/adminLayout.css";
import "../styles/resources.css";

function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () => {
    const token = localStorage.getItem("token");
    fetch("/api/resources/all", { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setResources(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    const token = localStorage.getItem("token");
    fetch(`/api/resources/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(() => fetchResources())
      .catch(console.error);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <div className="admin-content">
          <div className="resource-header">
            <div>
              <h1>Resource Management</h1>
              <p>Upload PDFs, links, or notes for students.</p>
            </div>
            <button className="upload-btn" onClick={() => navigate("/admin/resources/upload")}>
              Upload Resource
            </button>
          </div>

          <div className="resource-card">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="4">Loading...</td></tr>}
                {!loading && resources.length === 0 && <tr><td colSpan="4">No resources found.</td></tr>}
                {resources.map(r => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.title}</strong>
                      <div className="sub-text">{r.type} {r.fileUrl ? "- File" : ""}</div>
                    </td>
                    <td>
                      <span className={`type ${r.type.toLowerCase()}`}>{r.type}</span>
                    </td>
                    <td>{r.course?.title || "N/A"}</td>
                    <td>
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="view-link" style={{ marginRight: "10px" }}>View</a>
                      )}
                      {r.externalLink && (
                        <a href={r.externalLink} target="_blank" rel="noreferrer" className="view-link" style={{ marginRight: "10px" }}>Open Link</a>
                      )}
                      <button className="delete-btn" onClick={() => handleDelete(r._id)}>DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="resource-footer">
            Showing {resources.length} of {resources.length} resources
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;

