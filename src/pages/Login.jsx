import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [loginType, setLoginType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Read query param from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "admin" || type === "student") {
      setLoginType(type);
    }
  }, [location]);

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, loginType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Store the token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.fullName);

      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login. Is the backend running?");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>ExamPortal Login</h2>

        {error && <p className="error-text">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Login Type</label>
        <div className="login-type">
          <button
            className={loginType === "student" ? "active" : ""}
            onClick={() => setLoginType("student")}
          >
            Student
          </button>
          <button
            className={loginType === "admin" ? "active" : ""}
            onClick={() => setLoginType("admin")}
          >
            Admin
          </button>
        </div>

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;