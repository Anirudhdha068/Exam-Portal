import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/layout.css";
import "../styles/quiz.css";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function QuizPage() {
  const navigate = useNavigate();
  const { examId } = useParams();
  
  const [exam, setExam] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, selectedAnswer }
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Fetch exam data
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/exam/${examId}`, { headers: { "Authorization": `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        setExam(data);
        setTimeLeft((data.durationMinutes || 60) * 60);
      })
      .catch(err => console.error(err));
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || !exam) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, exam]);

  // Auto-submit when time is up
  useEffect(() => {
    if (isTimeUp) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeUp]);

  // Warn on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Detect tab switching
  useEffect(() => {
    let warningCount = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        warningCount++;
        if (warningCount >= 2) {
          alert("You have switched tabs multiple times. Your exam may be flagged for review.");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!exam) return <h2>Loading Exam...</h2>;
  if (!exam.questions || exam.questions.length === 0) return <h2>No questions in this exam.</h2>;

  const currentQuestion = exam.questions[currentIndex];

  const handleOptionClick = (option) => {
    const otherAnswers = answers.filter(a => a.questionId !== currentQuestion._id);
    setAnswers([...otherAnswers, { questionId: currentQuestion._id, selectedAnswer: option }]);
  };

  const handleNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm("Are you sure you want to submit?")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ examId, answers })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Exam submitted! You scored ${data.attempt.score}/${data.attempt.totalMarks}. Status: ${data.attempt.status}`);
        navigate("/student-dashboard");
      } else {
        alert(data.message);
      }
    } catch(err) {
      console.error(err);
      alert("Error submitting exam");
    }
  };

  const currentAnswerObj = answers.find(a => a.questionId === currentQuestion._id);

  const timerColor = timeLeft < 60 ? "#ef4444" : timeLeft < 300 ? "#f59e0b" : "#2563eb";

  return (
    <div className="quiz-layout">
      <div className="quiz-topbar">
        <div>
          <h2>{exam.title}</h2>
          <p>Duration: {exam.durationMinutes} Minutes</p>
        </div>
        <div className="quiz-progress">
          <span className="progress-text">
            Question {currentIndex + 1} of {exam.questions.length}
          </span>
          <div className="timer" style={{ color: timerColor, borderColor: timerColor }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <span className="question-tag">MULTIPLE CHOICE</span>
        <h1>Question {currentIndex + 1}: {currentQuestion.questionText}</h1>
        <p className="question-desc">Select the most accurate answer.</p>

        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            className={`option ${currentAnswerObj?.selectedAnswer === option ? "selected" : ""}`}
            onClick={() => handleOptionClick(option)}
          >
            <span>Option {String.fromCharCode(65 + index)}</span>
            <p>{option}</p>
          </div>
        ))}
      </div>

      <div className="quiz-footer">
        <button className="secondary-btn" onClick={handlePrevious} disabled={currentIndex === 0}>
          ← Previous
        </button>

        <div>
          {currentIndex < exam.questions.length - 1 ? (
            <button className="primary-btn" onClick={handleNext}>
              Next Question →
            </button>
          ) : (
            <button className="primary-btn submit-btn" onClick={() => handleSubmit(false)}>
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
