
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { signupUser } from "../api/authApi";

// YUP VALIDATION SCHEMA
const signupSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required"),

  lastName: yup
    .string()
    .trim()
    .required("Last name is required"),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must contain at least 6 characters")
    .required("Password is required"),

  role: yup
    .string()
    .oneOf(["user", "seller"], "Please select a valid role")
    .required("Please select a role"),
});

// BACKEND ERROR MESSAGE HANDLER
const getErrorMessage = (data) => {
  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        if (typeof item === "string") return item;

        const field =
          item.path || item.param || item.field || "";

        const message =
          item.msg || item.message || item.error || "";

        return field && message
          ? `${field}: ${message}`
          : message || JSON.stringify(item);
      })
      .join("\n");
  }

  return data.message || "Signup failed. Please try again.";
};

// SIGNUP COMPONENT
function Signup() {
  const navigate = useNavigate();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  // CLOSE ERROR MODAL
  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  // HANDLE SIGNUP
 
const handleSignup = async (formData) => {
  try {
    const response = await signupUser({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    });

    console.log("Signup Response:", response);

    // Check successful response
    if (response?.success === true) {
      // Save token
      localStorage.setItem(
        "accessToken",
        response.accessToken
      );

      // Save user details
      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      // No error modal on successful signup
      setShowErrorModal(false);
      setErrorMessage("");

      toast.success("Signup successful!");

      // Navigate based on registered role
      if (response.data.role === "seller") {
        navigate("/seller-dashboard", { replace: true });
      } else if (response.data.role === "user") {
        navigate("/products", { replace: true });
      }

      return;
    }

    // Show error only when signup fails
    setErrorMessage(
      getErrorMessage(response)
    );
    setShowErrorModal(true);

  } catch (error) {
    console.error("Signup Error:", error);

    const backendData = error.response?.data;

    console.log("Status:", error.response?.status);
    console.log("Backend Response:", backendData);

    setErrorMessage(
      getErrorMessage(backendData)
    );

    setShowErrorModal(true);
  }
};

  // STYLES
  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#333",
  };

  const errorStyle = {
    color: "#dc2626",
    fontSize: "13px",
    marginTop: "5px",
    marginBottom: 0,
  };

  // =====================================
  // UI
  // =====================================
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
          maxWidth: "450px",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#222",
          }}
        >
          Signup
        </h2>

        <form onSubmit={handleSubmit(handleSignup)} noValidate>
          {/* FIRST NAME */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="firstName" style={labelStyle}>
              First Name
            </label>

            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              autoComplete="given-name"
              {...register("firstName")}
              style={{
                ...inputStyle,
                borderColor: errors.firstName ? "#dc2626" : "#ccc",
              }}
            />

            {errors.firstName && (
              <p style={errorStyle}>
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* LAST NAME */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="lastName" style={labelStyle}>
              Last Name
            </label>

            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              autoComplete="family-name"
              {...register("lastName")}
              style={{
                ...inputStyle,
                borderColor: errors.lastName ? "#dc2626" : "#ccc",
              }}
            />

            {errors.lastName && (
              <p style={errorStyle}>
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email")}
              style={{
                ...inputStyle,
                borderColor: errors.email ? "#dc2626" : "#ccc",
              }}
            />

            {errors.email && (
              <p style={errorStyle}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="new-password"
              {...register("password")}
              style={{
                ...inputStyle,
                borderColor: errors.password ? "#dc2626" : "#ccc",
              }}
            />

            {errors.password && (
              <p style={errorStyle}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* ROLE */}
          <div style={{ marginBottom: "25px" }}>
            <label style={labelStyle}>
              Register as
            </label>

            <div
              style={{
                display: "flex",
                gap: "30px",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                <input
                  type="radio"
                  value="user"
                  {...register("role")}
                />
                User
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                <input
                  type="radio"
                  value="seller"
                  {...register("role")}
                />
                Seller
              </label>
            </div>

            {errors.role && (
              <p style={errorStyle}>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isSubmitting ? "#666" : "#222",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.8 : 1,
            }}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div
          onClick={closeErrorModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              maxHeight: "80vh",
              overflowY: "auto",
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 5px 25px rgba(0,0,0,0.25)",
              boxSizing: "border-box",
            }}
          >
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
              style={{
                color: "#222",
                margin: "0 0 10px",
                fontSize: "21px",
              }}
            >
              Signup Failed
            </h3>

            <p
              style={{
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.7",
                marginBottom: "25px",
                whiteSpace: "pre-line",
                overflowWrap: "anywhere",
                textAlign: "left",
              }}
            >
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={closeErrorModal}
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

export default Signup;
