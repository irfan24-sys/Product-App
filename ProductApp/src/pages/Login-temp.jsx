
import { useState } from "react";
import { loginUser } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

function Login() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const showLoginError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleLogin = async (formData) => {
    setShowErrorModal(false);
    setErrorMessage("");

    try {
      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (response?.success !== true) {
        showLoginError(
          response?.message || "Login failed. Please try again."
        );
        return;
      }

      if (!response.accessToken) {
        showLoginError("Access token not received from server.");
        return;
      }

      if (!response.data?._id || !response.data?.role) {
        showLoginError("User details are missing from the server response.");
        return;
      }

      const user = response.data;
      const userId = user._id;
      const role = user.role;

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", String(userId));

      const userCartKey = `cart_${userId}`;

      if (!localStorage.getItem(userCartKey)) {
        localStorage.setItem(userCartKey, JSON.stringify([]));
      }

      localStorage.removeItem("cart");

      if (role === "seller") {
        navigate("/seller-dashboard", { replace: true });
      } else if (role === "user") {
        navigate("/products", { replace: true });
      } else {
        showLoginError("Invalid account role.");
      }
    } catch (error) {
      console.error("Login Error:", error);

      const backendErrors = error.response?.data?.errors;

      let message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";

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

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "30px 18px",
      boxSizing: "border-box",
      background: "linear-gradient(135deg, #FFF8F4, #F3E5DE)",
      fontFamily: "Poppins, Arial, sans-serif",
    },

    card: {
      width: "100%",
      maxWidth: "1000px",
      minHeight: "580px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      background: "#fff",
      borderRadius: "24px",
      overflow: "hidden",
      boxShadow: "0 22px 65px rgba(65, 38, 27, 0.13)",
    },

    left: {
      position: "relative",
      overflow: "hidden",
      padding: "45px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#fff",
      background: "linear-gradient(145deg, #C16B4F, #813D2C)",
      boxSizing: "border-box",
    },

    logo: {
      fontSize: "27px",
      fontWeight: "800",
      letterSpacing: "1px",
      margin: 0,
      position: "relative",
      zIndex: 1,
    },

    welcome: {
      position: "relative",
      zIndex: 1,
    },

    welcomeTitle: {
      fontSize: "clamp(34px, 4vw, 48px)",
      fontWeight: "800",
      lineHeight: "1.2",
      margin: "0 0 18px",
    },

    welcomeText: {
      fontSize: "15px",
      lineHeight: "1.8",
      color: "#FBE8E0",
      maxWidth: "340px",
    },

    footer: {
      fontSize: "12px",
      color: "#F5D6CA",
      position: "relative",
      zIndex: 1,
    },

    right: {
      padding: "55px 50px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxSizing: "border-box",
    },

    heading: {
      color: "#30231F",
      fontSize: "32px",
      fontWeight: "800",
      margin: "0 0 8px",
    },

    subtitle: {
      color: "#88766E",
      fontSize: "14px",
      lineHeight: "1.7",
      margin: "0 0 32px",
    },

    label: {
      display: "block",
      color: "#49372F",
      fontSize: "13px",
      fontWeight: "700",
      marginBottom: "9px",
    },

    input: {
      width: "100%",
      height: "52px",
      padding: "0 15px",
      boxSizing: "border-box",
      border: "1px solid #E9DDD7",
      borderRadius: "11px",
      background: "#FFFCFA",
      fontSize: "14px",
      color: "#30231F",
      outline: "none",
      transition: "all 0.25s ease",
    },

    error: {
      color: "#D64545",
      fontSize: "12px",
      marginTop: "6px",
      marginBottom: 0,
    },

    loginButton: {
      width: "100%",
      height: "53px",
      marginTop: "8px",
      background: isSubmitting ? "#C99A8A" : "#B95F43",
      color: "#fff",
      border: "none",
      borderRadius: "11px",
      fontSize: "15px",
      fontWeight: "700",
      cursor: isSubmitting ? "not-allowed" : "pointer",
      boxShadow: "0 7px 18px rgba(185, 95, 67, 0.2)",
      transition: "all 0.25s ease",
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

          .login-input:focus {
            border-color: #B95F43 !important;
            background: #fff !important;
            box-shadow: 0 0 0 4px rgba(185,95,67,0.10);
          }

          .login-button:hover:not(:disabled) {
            background: #984B35 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 22px rgba(185,95,67,0.25);
          }

          .login-link:hover {
            color: #803D2B !important;
            text-decoration: underline !important;
          }

          .login-decoration {
            position: absolute;
            border: 1px solid rgba(255,255,255,0.13);
            border-radius: 50%;
            pointer-events: none;
          }

          .login-modal {
            animation: loginModal 0.25s ease;
          }

          @keyframes loginModal {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 750px) {
            .login-card {
              grid-template-columns: 1fr !important;
              max-width: 470px !important;
            }

            .login-left {
              min-height: 200px;
              padding: 28px !important;
            }

            .login-welcome {
              margin-top: 30px;
            }

            .login-footer {
              display: none;
            }

            .login-right {
              padding: 35px 28px !important;
            }
          }

          @media (max-width: 400px) {
            .login-right {
              padding: 30px 20px !important;
            }

            .login-heading {
              font-size: 27px !important;
            }
          }
        `}
      </style>

      <div className="login-card" style={styles.card}>
        {/* LEFT DESIGN PANEL */}
        <div className="login-left" style={styles.left}>
          <div
            className="login-decoration"
            style={{
              width: "280px",
              height: "280px",
              right: "-100px",
              top: "-100px",
            }}
          />

          <div
            className="login-decoration"
            style={{
              width: "370px",
              height: "370px",
              right: "-145px",
              top: "-145px",
            }}
          />

          <h2 style={styles.logo}>PRODUCT HUB.</h2>

          <div className="login-welcome" style={styles.welcome}>
            <h1 style={styles.welcomeTitle}>
              Welcome
              <br />
              Back!
            </h1>

            <p style={styles.welcomeText}>
              Sign in to your account and continue where you left off.
            </p>
          </div>

          <p className="login-footer" style={styles.footer}>
            PRODUCT HUB
          </p>
        </div>

        {/* LOGIN FORM */}
        <div className="login-right" style={styles.right}>
          <h2 className="login-heading" style={styles.heading}>
            Login
          </h2>

          <p style={styles.subtitle}>
            Enter your details to access your account.
          </p>

          <form onSubmit={handleSubmit(handleLogin)} noValidate>
            {/* EMAIL */}
            <div style={{ marginBottom: "22px" }}>
              <label htmlFor="login-email" style={styles.label}>
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className="login-input"
                {...register("email")}
                style={{
                  ...styles.input,
                  borderColor: errors.email ? "#D64545" : "#E9DDD7",
                }}
              />

              {errors.email && (
                <p style={styles.error}>{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: "25px" }}>
              <label htmlFor="login-password" style={styles.label}>
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="login-input"
                  {...register("password")}
                  style={{
                    ...styles.input,
                    paddingRight: "65px",
                    borderColor: errors.password ? "#D64545" : "#E9DDD7",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#A16B59",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p style={styles.error}>{errors.password.message}</p>
              )}
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-button"
              style={styles.loginButton}
            >
              {isSubmitting ? "Logging in..." : "Login to Account"}
            </button>
          </form>

          {/* SIGNUP LINK */}
          <p
            style={{
              textAlign: "center",
              marginTop: "27px",
              color: "#88766E",
              fontSize: "13px",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="login-link"
              style={{
                color: "#B95F43",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div
          onClick={() => setShowErrorModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(35,23,18,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="login-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="login-error-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "390px",
              background: "#FFFCFA",
              padding: "32px",
              borderRadius: "20px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                background: "#FCEAE5",
                color: "#B95F43",
                fontSize: "30px",
                fontWeight: "700",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 18px",
              }}
            >
              !
            </div>

            <h3
              id="login-error-title"
              style={{
                color: "#30231F",
                fontSize: "22px",
                margin: "0 0 12px",
              }}
            >
              Login Failed
            </h3>

            <p
              style={{
                color: "#806D64",
                fontSize: "14px",
                lineHeight: "1.7",
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
                padding: "13px",
                background: "#B95F43",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "700",
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
