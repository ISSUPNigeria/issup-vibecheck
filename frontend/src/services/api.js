import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8448";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach JWT token to every request when the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid token), clear credentials and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/api/auth/")
    ) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_nickname");
      localStorage.removeItem("user_id");
      window.location.href = "/?login=true";
    }
    return Promise.reject(err);
  },
);

// ===== AUTH API =====

export const register = async (nickname, email, password) => {
  const response = await api.post("/api/auth/register", {
    nickname,
    email,
    password,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};

// ===== CHAT HISTORY API =====

export const getUserSessions = async () => {
  const response = await api.get("/api/chat-history/sessions");
  return response.data;
};

export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/api/chat-history/${sessionId}`);
  return response.data;
};

// ===== VALIDATED SCREENING V2 API =====

/**
 * Fetch validated screening questions organized by instrument type
 * Returns: { assist_questions, phq9_questions, triggers_questions }
 */
export const fetchValidatedQuestions = async () => {
  const response = await api.get("/api/screening/v2/questions");
  return response.data;
};

/**
 * Submit complete validated screening with demographics
 * @param {Object} data - Complete submission data
 * @param {Object} data.demographics - User demographics
 * @param {Object} data.assist_response - ASSIST responses
 * @param {Object} data.phq9_response - PHQ-9 responses
 * @param {Object} data.triggers_response - Triggers responses (optional)
 */
export const submitValidatedScreening = async (data) => {
  const response = await api.post("/api/screening/v2/submit", data);
  return response.data;
};

/**
 * Check if user should see triggers assessment based on screening results
 * @param {string} sessionId - Screening session ID
 */
export const checkTriggersEligibility = async (sessionId) => {
  const response = await api.get(
    `/api/screening/v2/should-show-triggers/${sessionId}`,
  );
  return response.data;
};

/**
 * Get validated screening results
 * @param {string} sessionId - Screening session ID
 */
export const getValidatedResults = async (sessionId) => {
  const response = await api.get(`/api/screening/v2/results/${sessionId}`);
  return response.data;
};

// ===== CHAT FEEDBACK API =====

/**
 * Submit feedback for an AI chatbot response
 * @param {Object} feedbackData - Feedback submission data
 * @param {string} feedbackData.session_id - Session ID
 * @param {number} feedbackData.message_index - Index of the AI message
 * @param {number} feedbackData.rating - 1 = thumbs up, 0 = thumbs down
 * @param {string} feedbackData.comment - Optional comment (typically on thumbs down)
 * @param {string} feedbackData.user_message - The user's message that triggered the AI response
 * @param {string} feedbackData.ai_message - The AI response that was rated
 */
export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/api/feedback/submit", feedbackData);
  return response.data;
};

// ===== RESULTS FEEDBACK API =====

/**
 * Submit feedback for a Results page tab
 * @param {Object} feedbackData - Feedback submission data
 * @param {string} feedbackData.session_id - Session ID from screening
 * @param {string} feedbackData.tab_name - Tab being rated (overview, assist, phq9, triggers, next-steps)
 * @param {number} feedbackData.rating - 1 = thumbs up, 0 = thumbs down
 * @param {string} feedbackData.comment - Optional feedback comment
 * @param {Object} feedbackData.tab_content_summary - Snapshot of data shown on the tab
 */
export const submitResultsFeedback = async (feedbackData) => {
  const response = await api.post("/api/results-feedback/submit", feedbackData);
  return response.data;
};

/**
 * Get existing feedback status for a session (which tabs have been rated)
 * @param {string} sessionId - Session ID from screening
 */
export const getResultsFeedbackStatus = async (sessionId) => {
  const response = await api.get(`/api/results-feedback/status/${sessionId}`);
  return response.data;
};

/**
 * Get existing feedback for a specific tab
 * @param {string} sessionId - Session ID from screening
 * @param {string} tabName - Tab name (overview, assist, phq9, triggers, next-steps)
 */
export const getTabFeedback = async (sessionId, tabName) => {
  const response = await api.get(
    `/api/results-feedback/tab/${sessionId}/${tabName}`,
  );
  return response.data;
};

// ===== IMPROVEMENT SUGGESTIONS API =====

/**
 * Submit an open-ended improvement suggestion
 * @param {string} sessionId - Session ID from screening
 * @param {string} suggestionText - User's suggestion text
 */
export const submitImprovementSuggestion = async (sessionId, suggestionText) => {
  const response = await api.post('/api/suggestions/submit', {
    session_id: sessionId,
    suggestion_text: suggestionText,
  })
  return response.data
}

export default api;
