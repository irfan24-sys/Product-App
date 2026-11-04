
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { signupUser } from "../api/authApi";

const signupSchema = yup.object({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
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

const getErrorMessage = (data) => {
  if (!data) {
    return "Something went wrong. Please try again.";
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        if (typeof item === "string") return item;

        const field = item.path || item.param || item.field || "";
        const message = item.msg || item.message || item.error || "";

        return field && message
          ? `${field}: ${message}`
          : message || JSON.stringify(item);
      })
      .join("\n");
  }

  return data.message || "Signup failed. Please try again.";
};

function Signup() {
  const navigate = useNavigate();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

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

      if (response?.success === true) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data));

        setShowErrorModal(false);
        setErrorMessage("");

        toast.success("Signup successful!");

        if (response.data.role === "seller") {
          navigate("/seller-dashboard", { replace: true });
        } else if (response.data.role === "user") {
          navigate("/products", { replace: true });
        }

        return;
      }

      setErrorMessage(getErrorMessage(response));
      setShowErrorModal(true);
    } catch (error) {
      console.error("Signup Error:", error);

      const backendData = error.response?.data;

      console.log("Status:", error.response?.status);
      console.log("Backend Response:", backendData);

      setErrorMessage(getErrorMessage(backendData));
      setShowErrorModal(true);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "30px 18px",
      boxSizing: "border-box",
      background: "linear-gradient(135deg, #FFF8F4, #F3E5DE)",
      fontFamily: "Poppins, Arial, sans-serif",
    },

    card: {
      width: "100%",
      maxWidth: "1050px",
      display: "grid",
      gridTemplateColumns: "0.85fr 1.15fr",
      background: "#FFFFFF",
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
      color: "#FFFFFF",
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
      fontSize: "clamp(34px, 4vw, 47px)",
      fontWeight: "800",
      lineHeight: "1.2",
      margin: "0 0 18px",
    },

    welcomeText: {
      fontSize: "15px",
      lineHeight: "1.8",
      color: "#FBE8E0",
      maxWidth: "330px",
    },

    footer: {
      fontSize: "12px",
      color: "#F5D6CA",
      position: "relative",
      zIndex: 1,
    },

    right: {
      padding: "40px 45px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxSizing: "border-box",
    },

    heading: {
      color: "#30231F",
      fontSize: "31px",
      fontWeight: "800",
      margin: "0 0 7px",
    },

    subtitle: {
      color: "#88766E",
      fontSize: "13px",
      lineHeight: "1.7",
      margin: "0 0 25px",
    },

    label: {
      display: "block",
      color: "#49372F",
      fontSize: "12px",
      fontWeight: "700",
      marginBottom: "8px",
    },

    input: {
      width: "100%",
      height: "47px",
      padding: "0 13px",
      boxSizing: "border-box",
      border: "1px solid #E9DDD7",
      borderRadius: "10px",
      background: "#FFFCFA",
      fontSize: "13px",
      color: "#30231F",
      outline: "none",
      transition: "all 0.25s ease",
    },

    error: {
      color: "#D64545",
      fontSize: "11px",
      margin: "5px 0 0",
    },

    field: {
      minWidth: 0,
    },

    submit: {
      width: "100%",
      height: "49px",
      marginTop: "8px",
      background: isSubmitting ? "#C99A8A" : "#B95F43",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
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

          .signup-input:focus {
            border-color: #B95F43 !important;
            background: #FFFFFF !important;
            box-shadow: 0 0 0 4px rgba(185,95,67,0.10);
          }

          .signup-button:hover:not(:disabled) {
            background: #984B35 !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 22px rgba(185,95,67,0.25);
          }

          .signup-link:hover {
            color: #803D2B !important;
            text-decoration: underline !important;
          }

          .signup-decoration {
            position: absolute;
            border: 1px solid rgba(255,255,255,0.13);
            border-radius: 50%;
            pointer-events: none;
          }

          .role-option {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 12px;
            border: 1px solid #E9DDD7;
            border-radius: 10px;
            cursor: pointer;
            color: #49372F;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
          }

          .role-option:has(input:checked) {
            background: #FFF2EC;
            border-color: #B95F43;
            color: #984B35;
          }

          .role-option input {
            accent-color: #B95F43;
          }

          .signup-modal {
            animation: signupModal 0.25s ease;
          }

          @keyframes signupModal {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @media (max-width: 800px) {
            .signup-card {
              grid-template-columns: 1fr !important;
              max-width: 520px !important;
            }

            .signup-left {
              min-height: 190px;
              padding: 28px !important;
            }

            .signup-welcome {
              margin-top: 28px;
            }

            .signup-footer {
              display: none;
            }

            .signup-right {
              padding: 35px 28px !important;
            }
          }

          @media (max-width: 480px) {
            .signup-right {
              padding: 28px 20px !important;
            }

            .signup-fields {
              grid-template-columns: 1fr !important;
            }

            .signup-heading {
              font-size: 27px !important;
            }
          }
        `}
      </style>

      <div className="signup-card" style={styles.card}>
        {/* LEFT PANEL */}
        <div className="signup-left" style={styles.left}>
          <div
            className="signup-decoration"
            style={{
              width: "280px",
              height: "280px",
              right: "-100px",
              top: "-100px",
            }}
          />

          <div
            className="signup-decoration"
            style={{
              width: "370px",
              height: "370px",
              right: "-145px",
              top: "-145px",
            }}
          />

          <h2 style={styles.logo}>PRODUCT HUB.</h2>

          <div className="signup-welcome" style={styles.welcome}>
            <h1 style={styles.welcomeTitle}>
              Create Your
              <br />
              Account.
            </h1>

            <p style={styles.welcomeText}>
              Join PRODUCT HUB and get started with your account today.
            </p>
          </div>

          <p className="signup-footer" style={styles.footer}>
            PRODUCT HUB
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right" style={styles.right}>
          <h2 className="signup-heading" style={styles.heading}>
            Sign Up
          </h2>

          <p style={styles.subtitle}>
            Enter your details to create your account.
          </p>

          <form onSubmit={handleSubmit(handleSignup)} noValidate>
            {/* FIRST NAME AND LAST NAME */}
            <div
              className="signup-fields"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "17px",
              }}
            >
              <div style={styles.field}>
                <label htmlFor="firstName" style={styles.label}>
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                  className="signup-input"
                  {...register("firstName")}
                  style={{
                    ...styles.input,
                    borderColor: errors.firstName ? "#D64545" : "#E9DDD7",
                  }}
                />

                {errors.firstName && (
                  <p style={styles.error}>{errors.firstName.message}</p>
                )}
              </div>

              <div style={styles.field}>
                <label htmlFor="lastName" style={styles.label}>
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  autoComplete="family-name"
                  className="signup-input"
                  {...register("lastName")}
                  style={{
                    ...styles.input,
                    borderColor: errors.lastName ? "#D64545" : "#E9DDD7",
                  }}
                />

                {errors.lastName && (
                  <p style={styles.error}>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: "17px" }}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className="signup-input"
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
            <div style={{ marginBottom: "19px" }}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="signup-input"
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
                    right: "13px",
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

            {/* ROLE SELECTION */}
            <div style={{ marginBottom: "20px" }}>
              <label style={styles.label}>Register As</label>

              <div style={{ display: "flex", gap: "12px" }}>
                <label className="role-option">
                  <input
                    type="radio"
                    value="user"
                    {...register("role")}
                  />
                  User
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    value="seller"
                    {...register("role")}
                  />
                  Seller
                </label>
              </div>

              {errors.role && (
                <p style={styles.error}>{errors.role.message}</p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="signup-button"
              style={styles.submit}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p
            style={{
              textAlign: "center",
              marginTop: "22px",
              marginBottom: 0,
              color: "#88766E",
              fontSize: "13px",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="signup-link"
              style={{
                color: "#B95F43",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div
          onClick={closeErrorModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(35,23,18,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "20px",
          }}
        >
          <div
            className="signup-modal"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "390px",
              maxHeight: "80vh",
              overflowY: "auto",
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
              style={{
                color: "#30231F",
                fontSize: "22px",
                margin: "0 0 12px",
              }}
            >
              Signup Failed
            </h3>

            <p
              style={{
                color: "#806D64",
                fontSize: "13px",
                lineHeight: "1.8",
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
                padding: "13px",
                background: "#B95F43",
                color: "#FFFFFF",
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

export default Signup;
