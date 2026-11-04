
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken") &&
    !!localStorage.getItem("user")
  );

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("user");

      setIsLoggedIn(!!token && !!user);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);
    window.addEventListener("authChanged", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("authChanged", checkLogin);
    };
  }, []);

  const styles = {
    container: {
      position: "relative",
      minHeight: isLoggedIn ? "calc(100vh - 70px)" : "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: "#30231F",
      isolation: "isolate",
    },

    video: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: -2,
    },

    overlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(90deg, rgba(25,18,15,0.78), rgba(25,18,15,0.35))",
      zIndex: -1,
    },

    authButtons: {
      position: "absolute",
      top: "25px",
      right: "35px",
      display: "flex",
      gap: "12px",
      zIndex: 2,
    },

    login: {
      textDecoration: "none",
      padding: "11px 25px",
      borderRadius: "30px",
      fontSize: "15px",
      fontWeight: "600",
      color: "white",
      border: "1px solid white",
      transition: "all 0.3s ease",
    },

    signup: {
      textDecoration: "none",
      padding: "11px 25px",
      borderRadius: "30px",
      fontSize: "15px",
      fontWeight: "600",
      backgroundColor: "#B95F43",
      color: "white",
      border: "1px solid #B95F43",
      transition: "all 0.3s ease",
    },

    content: {
      position: "relative",
      zIndex: 1,
      width: "100%",
      padding: "30px 20px",
      textAlign: "center",
      color: "white",
      animation: "homeFadeUp 1s ease forwards",
    },

    heading: {
      fontSize: "clamp(35px, 6vw, 68px)",
      fontWeight: "800",
      letterSpacing: "-2px",
      marginBottom: "18px",
      textShadow: "0 3px 15px rgba(0,0,0,0.25)",
    },

    description: {
      fontSize: "clamp(16px, 2vw, 21px)",
      color: "#F5E9E3",
      marginBottom: "35px",
    },

    productsButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "15px",
      padding: "15px 30px",
      backgroundColor: "#B95F43",
      color: "white",
      borderRadius: "35px",
      textDecoration: "none",
      fontSize: "16px",
      fontWeight: "600",
      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
      transition: "all 0.3s ease",
    },
  };

  return (
    <>
      {isLoggedIn && <Navbar />}

      <div style={styles.container}>
        <style>
          {`
            @keyframes homeFadeUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .home-login:hover {
              background: white !important;
              color: #30231F !important;
            }

            .home-signup:hover,
            .home-products-btn:hover {
              background: #994A33 !important;
              transform: translateY(-4px);
            }

            .home-products-btn:hover span {
              transform: translateX(5px);
            }

            .home-products-btn span {
              transition: transform 0.3s ease;
            }

            @media (max-width: 600px) {
              .home-auth-buttons {
                top: 18px !important;
                right: 15px !important;
                gap: 8px !important;
              }

              .home-auth-buttons a {
                padding: 9px 17px !important;
                font-size: 13px !important;
              }

              .home-heading {
                letter-spacing: -1px !important;
              }

              .home-description {
                margin-bottom: 25px !important;
              }

              .home-products-btn {
                padding: 13px 24px !important;
                font-size: 14px !important;
              }
            }
          `}
        </style>

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={styles.video}
        >
          <source src="/videos/home-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div style={styles.overlay}></div>

        {/* Login and Signup */}
        {!isLoggedIn && (
          <div
            className="home-auth-buttons"
            style={styles.authButtons}
          >
            <Link
              to="/login"
              className="home-login"
              style={styles.login}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="home-signup"
              style={styles.signup}
            >
              Signup
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.content}>
          <h1
            className="home-heading"
            style={styles.heading}
          >
            Welcome to Product App
          </h1>

          <p
            className="home-description"
            style={styles.description}
          >
            Manage your products easily.
          </p>

          <Link
            to="/products"
            className="home-products-btn"
            style={styles.productsButton}
          >
            View Products
            <span style={{ fontSize: "22px" }}>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
