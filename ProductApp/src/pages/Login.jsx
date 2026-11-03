
import { useState } from "react";
import { loginUser } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// YUP VALIDATION SCHEMA

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

// LOGIN COMPONENT

function Login() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // SHOW ERROR MODAL

  const showLoginError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // LOGIN FUNCTION
  const handleLogin = async (formData) => {
    setShowErrorModal(false);
    setErrorMessage("");

    try {
      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Login Response:", response);

      // Check successful response
      if (response?.success !== true) {
        showLoginError(
          response?.message || "Login failed. Please try again."
        );
        return;
      }

      // Check access token
      if (!response.accessToken) {
        showLoginError("Access token not received from server.");
        return;
      }

      // Check user data
      if (!response.data?._id || !response.data?.role) {
        showLoginError("User details are missing from the server response.");
        return;
      }

      const user = response.data;
      const userId = user._id;
      const role = user.role;

      // SAVE LOGIN INFORMATION

      localStorage.setItem("accessToken", response.accessToken);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem("userId", String(userId));

      // Create separate cart for each user
      const userCartKey = `cart_${userId}`;

      if (!localStorage.getItem(userCartKey)) {
        localStorage.setItem(
          userCartKey,
          JSON.stringify([])
        );
      }

      // Remove old shared cart
      localStorage.removeItem("cart");

      // REDIRECT BASED ON DATABASE ROLE

      if (role === "seller") {
        navigate("/seller-dashboard", {
          replace: true,
        });
      } else if (role === "user") {
        navigate("/products", {
          replace: true,
        });
      } else {
        showLoginError("Invalid account role.");
      }

    } catch (error) {
      console.error("Login Error:", error);

      console.log("Status:", error.response?.status);
      console.log("Backend Response:", error.response?.data);

      const backendErrors = error.response?.data?.errors;

      let message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";

      // Handle backend validation errors
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        backendErrors.forEach((item) => {
          if (item.field) {
            setError(item.field, {
              type: "server",
              message: item.message,
            });
          }
        });

        message = backendErrors[0].message || message;
      }

      showLoginError(message);
    }
  };

  // STYLES

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "7px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "13px",
    marginTop: "5px",
    marginBottom: 0,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.12)",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            color: "#222",
          }}
        >
          Login
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
            marginBottom: "25px",
          }}
        >
          Welcome back! Please sign in to continue.
        </p>

        <form
          onSubmit={handleSubmit(handleLogin)}
          noValidate
        >
          {/* EMAIL */}
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="login-email"
              style={labelStyle}
            >
              Email Address
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email")}
              style={{
                ...inputStyle,
                borderColor: errors.email ? "#dc3545" : "#ccc",
              }}
            />

            {errors.email && (
              <p style={errorStyle}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "25px" }}>
            <label
              htmlFor="login-password"
              style={labelStyle}
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              style={{
                ...inputStyle,
                borderColor: errors.password ? "#dc3545" : "#ccc",
              }}
            />

            {errors.password && (
              <p style={errorStyle}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: isSubmitting ? "#999" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "7px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
            marginBottom: 0,
            color: "#555",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#dc3545",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* LOGIN ERROR MODAL */}
      {showErrorModal && (
        <div
          onClick={() => setShowErrorModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-error-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 5px 25px rgba(0,0,0,0.2)",
            }}
          >
            {/* ERROR ICON */}
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                backgroundColor: "#ffe5e5",
                color: "#dc3545",
                fontSize: "32px",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 15px",
              }}
            >
              !
            </div>

            <h3
              id="login-error-title"
              style={{
                color: "#222",
                marginBottom: "10px",
                fontSize: "21px",
              }}
            >
              Login Failed
            </h3>

            <p
              style={{
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
                marginBottom: "25px",
                overflowWrap: "anywhere",
              }}
            >
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage("");
              }}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "7px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
