
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
      background: "#211713",
      isolation: "isolate",
      fontFamily: "'Poppins', sans-serif",
    },

    video: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      zIndex: 0,
      transform: "scale(1.02)",
    },

    overlay: {
      position: "absolute",
      inset: 0,
      zIndex: 1,
      background:
        "linear-gradient(100deg, rgba(25,16,12,0.88) 0%, rgba(25,16,12,0.62) 48%, rgba(25,16,12,0.32) 100%)",
    },

    glow: {
      position: "absolute",
      width: "450px",
      height: "450px",
      borderRadius: "50%",
      background: "rgba(185,95,67,0.20)",
      filter: "blur(100px)",
      top: "15%",
      left: "-180px",
      zIndex: 1,
      pointerEvents: "none",
    },

    authButtons: {
      position: "absolute",
      top: "30px",
      right: "45px",
      display: "flex",
      alignItems: "center",
      gap: "13px",
      zIndex: 3,
    },

    login: {
      textDecoration: "none",
      padding: "11px 25px",
      borderRadius: "30px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#FFFFFF",
      border: "1px solid rgba(255,255,255,0.65)",
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
    },

    signup: {
      textDecoration: "none",
      padding: "12px 27px",
      borderRadius: "30px",
      fontSize: "14px",
      fontWeight: "600",
      background: "#B95F43",
      color: "#FFFFFF",
      border: "1px solid #B95F43",
      boxShadow: "0 6px 22px rgba(185,95,67,0.30)",
      transition: "all 0.3s ease",
    },

    content: {
      position: "relative",
      zIndex: 2,
      width: "100%",
      maxWidth: "1050px",
      padding: "100px 25px 80px",
      margin: "0 auto",
      textAlign: "center",
      color: "#FFFFFF",
      boxSizing: "border-box",
      animation: "homeFadeUp 1s ease both",
    },

    heading: {
      fontSize: "clamp(36px, 6.5vw, 76px)",
      fontWeight: "800",
      lineHeight: 1.12,
      letterSpacing: "-2.5px",
      margin: "0 auto 22px",
      maxWidth: "1000px",
      color: "#FFFFFF",
      textShadow: "0 5px 25px rgba(0,0,0,0.30)",
    },

    highlight: {
      color: "#E69A7D",
    },

    description: {
      fontSize: "clamp(15px, 2vw, 19px)",
      color: "rgba(255,255,255,0.82)",
      margin: "0 auto 38px",
      lineHeight: 1.8,
      fontWeight: "400",
    },

    productsButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "15px",
      minHeight: "54px",
      padding: "14px 32px",
      background: "#B95F43",
      color: "#FFFFFF",
      borderRadius: "40px",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "600",
      boxShadow: "0 10px 30px rgba(185,95,67,0.35)",
      transition: "all 0.3s ease",
    },

    arrow: {
      display: "inline-block",
      fontSize: "21px",
      transition: "transform 0.3s ease",
      lineHeight: 1,
    },

    bottomLine: {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "4px",
      background:
        "linear-gradient(90deg, transparent, #B95F43, #E69A7D, transparent)",
      zIndex: 2,
    },
  };

  return (
    <>
      {isLoggedIn && <Navbar />}

      <div style={styles.container}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

          * {
            box-sizing: border-box;
          }

          @keyframes homeFadeUp {
            from {
              opacity: 0;
              transform: translateY(35px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes glowMove {
            0%, 100% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(40px, 30px);
            }
          }

          .home-glow {
            animation: glowMove 8s ease-in-out infinite;
          }

          .home-login:hover {
            background: #FFFFFF !important;
            color: #30231F !important;
            transform: translateY(-2px);
          }

          .home-signup:hover {
            background: #984B35 !important;
            border-color: #984B35 !important;
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(185,95,67,0.40);
          }

          .home-products-btn:hover {
            background: #984B35 !important;
            transform: translateY(-4px);
            box-shadow: 0 14px 35px rgba(185,95,67,0.42);
          }

          .home-products-btn:hover .home-arrow {
            transform: translateX(6px);
          }

          .home-auth-buttons a,
          .home-products-btn {
            -webkit-tap-highlight-color: transparent;
          }

          @media (max-width: 768px) {
            .home-auth-buttons {
              top: 20px !important;
              right: 20px !important;
            }

            .home-content {
              padding-top: 110px !important;
              padding-bottom: 60px !important;
            }

            .home-heading {
              letter-spacing: -1.5px !important;
            }
          }

          @media (max-width: 480px) {
            .home-auth-buttons {
              top: 16px !important;
              right: 14px !important;
              gap: 8px !important;
            }

            .home-auth-buttons a {
              padding: 9px 16px !important;
              font-size: 12px !important;
            }

            .home-content {
              padding-left: 18px !important;
              padding-right: 18px !important;
            }

            .home-heading {
              letter-spacing: -1px !important;
              margin-bottom: 16px !important;
            }

            .home-description {
              margin-bottom: 28px !important;
            }

            .home-products-btn {
              padding: 13px 25px !important;
              font-size: 14px !important;
              min-height: 49px !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .home-content,
            .home-glow {
              animation: none !important;
            }

            .home-login,
            .home-signup,
            .home-products-btn {
              transition: none !important;
            }
          }
        `}</style>

        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={styles.video}
        >
          <source src="/videos/home-bg.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay */}
        <div style={styles.overlay}></div>

        {/* Background Glow */}
        <div
          className="home-glow"
          style={styles.glow}
        ></div>

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
              Sign Up
            </Link>
          </div>
        )}

        {/* Main Content */}
        <div
          className="home-content"
          style={styles.content}
        >
          <h1
            className="home-heading"
            style={styles.heading}
          >
            WELCOME TO{" "}
            <span style={styles.highlight}>
              PRODUCT HUB
            </span>
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

            <span
              className="home-arrow"
              style={styles.arrow}
            >
              →
            </span>
          </Link>
        </div>

        {/* Bottom Accent */}
        <div style={styles.bottomLine}></div>
      </div>
    </>
  );
}

export default Home;
