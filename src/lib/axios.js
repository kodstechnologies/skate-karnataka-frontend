import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Note: With withCredentials: true and tokens in cookies,
    // the browser automatically handles sending tokens.
    // No need to manually attach Authorization headers from localStorage.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // High-level: Return only the data part of the response
    return response.data;
  },
  (error) => {
    // Centralized error handling
    if (error.response?.status === 401) {
      // If 401 occurs, it means tokens are invalid or expired
      // You might want to clear the store and redirect to login
      // useAuthStore.getState().logout();
      console.warn("Session expired or unauthorized");
    }

    const message = error.response?.data?.message || "Something went wrong";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
