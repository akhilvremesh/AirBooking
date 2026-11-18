import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

export function saveTokens(tokens) {
  localStorage.setItem("accessToken", tokens.access);
  if (tokens.refresh) {
    localStorage.setItem("refreshToken", tokens.refresh);
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || "";
    const isAuthRequest =
      url.includes("/auth/login/") ||
      url.includes("/auth/register/") ||
      url.includes("/auth/token/refresh/");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      clearTokens();
      window.dispatchEvent(new Event("airbooking:logout"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = refreshClient
          .post("/auth/token/refresh/", { refresh: refreshToken })
          .then(({ data }) => {
            saveTokens({ access: data.access });
            return data.access;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      const newAccessToken = await refreshRequest;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event("airbooking:logout"));
      return Promise.reject(refreshError);
    }
  },
);

export default api;