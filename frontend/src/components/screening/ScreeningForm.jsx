import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import DemographicsStep from "./DemographicsStep";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8448";

function ScreeningForm() {
  const navigate = useNavigate();
  const [showDemographics, setShowDemographics] = useState(true);
  const [demographics, setDemographics] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/screening/questions`,
      );
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load screening questions. Please try again.");
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer) => {
    const currentQuestion = questions[currentIndex];
    setResponses({
      ...responses,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDemographicsComplete = (data) => {
    setDemographics(data);
    setShowDemographics(false);
  };

  const handleDemographicsUpdate = (data) => {
    setDemographics(data);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Submit responses and demographics to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/screening/submit`,
        {
          demographics: demographics,
          responses: responses,
        },
      );

      // Navigate to results page with session ID
      navigate(`/results?session_id=${response.data.session_id}`);
    } catch (err) {
      console.error("Error submitting screening:", err);
      setError("Failed to submit screening. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading screening questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-red text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Oops!
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={fetchQuestions}
            className="w-full bg-purple text-white py-3 rounded-lg font-semibold hover:bg-purple/90 transition-colors focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No questions available.</p>
      </div>
    );
  }

  // Show demographics step first
  if (showDemographics) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <DemographicsStep
          demographics={demographics}
          onUpdate={handleDemographicsUpdate}
          onComplete={handleDemographicsComplete}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = responses[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const canProceed = currentAnswer !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          answer={currentAnswer}
          onAnswerChange={handleAnswerChange}
        />

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentIndex === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Previous</span>
          </button>

          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed
                  ? "bg-purple text-white hover:bg-purple/90 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span>Next</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed || submitting}
              className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                canProceed && !submitting
                  ? "bg-purple text-white hover:bg-purple/90 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Complete Screening</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Your responses are confidential and anonymous.</p>
          <p className="mt-2">
            Need help? Call{" "}
            <a
              href="tel:112"
              className="text-red font-semibold hover:underline"
            >
              112
            </a>{" "}
            (Emergency) or{" "}
            <a
              href="tel:+2348092106493"
              className="text-red font-semibold hover:underline"
            >
              +234-809-210-6493
            </a>{" "}
            (Mental Health)
          </p>
        </div>
      </div>
    </div>
  );
}

export default ScreeningForm;
