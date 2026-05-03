import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home() {
    const navigate = useNavigate();
  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="hero-left">
          <span className="badge">NEXT-GEN ASSESSMENT TOOLS</span>

          <h1>
            Empowering Education through <br />
            <span className="highlight">Digital Assessment</span>
          </h1>

          <p>
            A comprehensive, secure, and user-friendly platform designed for
            educational institutions to conduct exams, manage resources, and
            track student progress with real-time analytics.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login?type=admin")}
            >
              Admin Login
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/login?type=student")}
            >
              Student Portal
            </button>
          </div>

          <p className="trusted">Trusted by 10,000+ Students</p>
        </div>

        <div className="hero-right">
          <div className="image-card"></div>
        </div>
      </section>

      <section className="features">
        <h2>Everything you need to manage online exams</h2>
        <p>
          Powerful tools designed for educators to create, deliver, and analyze
          assessments seamlessly.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Secure Assessments</h3>
            <p>
              Anti-cheat mechanisms, lockdown browser options, and randomized
              question banks ensure exam integrity.
            </p>
          </div>

          <div className="feature-card">
            <h3>Real-time Analytics</h3>
            <p>
              Instant grading and detailed performance reports for students and
              instructors.
            </p>
          </div>

          <div className="feature-card">
            <h3>Resource Management</h3>
            <p>
              Manage study materials, PDFs, and links linked specifically to
              individual exams.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;