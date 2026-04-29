import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth-store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = accessToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isLoggingOut = false;

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // High-level: Return only the data part of the response
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    const isLogoutEndpoint = originalRequest?.url?.includes("/logout");

    // Centralized error handling for 401 Unauthorized
    if (error.response?.status === 401 && !isLogoutEndpoint) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        console.warn("Session expired. Logging out...");

        // Trigger the logout flow and release the lock when done
        useAuthStore
          .getState()
          .logout()
          .finally(() => {
            isLoggingOut = false;
          });
      }
    }

    // Suppress console errors specifically for expected 401s during the logout call itself
    if (!(isLogoutEndpoint && error.response?.status === 401)) {
      const message = error.response?.data?.message || "Something went wrong";
      console.error("API Error:", message);
    }

    return Promise.reject(error);
  }
);

export default api;
