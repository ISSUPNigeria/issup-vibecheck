import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8448";

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach admin JWT to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to admin login
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !err.config?.url?.includes("/api/admin/login")
    ) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  },
);

export const adminLogin = (username, password) =>
  adminApi.post("/api/admin/login", { username, password }).then((r) => r.data);

export const getOverview = (params = {}) =>
  adminApi.get("/api/admin/overview", { params }).then((r) => r.data);

export const getScreenings = (params = {}) =>
  adminApi.get("/api/admin/screenings", { params }).then((r) => r.data);

export const getDemographics = (params = {}) =>
  adminApi.get("/api/admin/demographics", { params }).then((r) => r.data);

export const getUsers = (params = {}) =>
  adminApi.get("/api/admin/users", { params }).then((r) => r.data);

export const getChat = (params = {}) =>
  adminApi.get("/api/admin/chat", { params }).then((r) => r.data);

export const getTokens = (params = {}) =>
  adminApi.get("/api/admin/tokens", { params }).then((r) => r.data);

export const getCrisis = (params = {}) =>
  adminApi.get("/api/admin/crisis", { params }).then((r) => r.data);

export const getFeedback = (params = {}) =>
  adminApi.get("/api/admin/feedback", { params }).then((r) => r.data);

export const getSuggestions = (params = {}) =>
  adminApi.get('/api/admin/suggestions', { params }).then(r => r.data)

export const getGamblingAnalytics = (params = {}) =>
  adminApi.get('/api/admin/gambling', { params }).then(r => r.data)

export const downloadCSV = async (type, params = {}, filename) => {
  const res = await adminApi.get(`/api/admin/export/${type}`, {
    params,
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${type}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default adminApi;
