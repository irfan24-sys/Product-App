
import api from "./api";

// SIGNUP API
export const signupUser = async (userData) => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Signup API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// LOGIN API
export const loginUser = async (userData) => {
  try {
    const response = await api.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Login API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};
