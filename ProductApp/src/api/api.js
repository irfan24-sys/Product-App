import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// ADD TOKEN TO EVERY REQUEST

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("API TOKEN:", token ? "Token attached" : "NO TOKEN");

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
