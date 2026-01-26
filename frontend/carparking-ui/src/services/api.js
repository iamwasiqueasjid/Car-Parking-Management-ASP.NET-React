import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5198/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor (cookies are sent automatically)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login (cookie will be cleared by logout endpoint)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
