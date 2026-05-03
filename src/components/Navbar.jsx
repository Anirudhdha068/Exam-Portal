import "./../styles/home.css";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="logo">🎓 Exam Portal</div>

      <div className="nav-right">
        <button className="theme-btn">🌙</button>
        <button className="primary-btn small" onClick={() => navigate("/login?type=student")}>Get Started</button>
      </div>
    </nav>
  );
}

export default Navbar;