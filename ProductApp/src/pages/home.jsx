import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./style.css";

function Home() {
  const [isLoggedIn, setIsLoggedIn] =
    useState(
      !!localStorage.getItem("accessToken")
    );

  // ========================================
  // CHECK LOGIN STATUS
  // ========================================

  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("accessToken");

      const user =
        localStorage.getItem("user");

      setIsLoggedIn(
        !!token && !!user
      );
    };

    checkLogin();

    // Listen for storage changes
    window.addEventListener(
      "storage",
      checkLogin
    );

    // Custom logout event
    window.addEventListener(
      "authChanged",
      checkLogin
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkLogin
      );

      window.removeEventListener(
        "authChanged",
        checkLogin
      );
    };
  }, []);

  return (
    <>
      {/* LOGGED IN
          SHOW NAVBAR    */}

      {isLoggedIn && <Navbar />}

      <div
        className="home-container"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          minHeight: isLoggedIn
            ? "calc(100vh - 70px)"
            : "100vh",

          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/*  LOGGED OUT
            SHOW LOGIN & SIGNUP*/}

        {!isLoggedIn && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              display: "flex",
              gap: "10px",
            }}
          >
            {/* LOGIN */}

            <Link
              to="/login"
              style={{
                textDecoration: "none",
              }}
            >
              <button
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                Login
              </button>
            </Link>

            {/* SIGNUP */}

            <Link
              to="/signup"
              style={{
                textDecoration: "none",
              }}
            >
              <button
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                Signup
              </button>
            </Link>
          </div>
        )}

        {/*  MAIN CONTENT */}

        <h1>
          Welcome to Product App
        </h1>

        <p
          style={{
            fontSize: "1.25rem",
            textAlign: "center",
            color: "white",
          }}
        >
          Manage your products easily.
        </p>

        {/* VIEW PRODUCTS */}

        <Link
          to="/products"
          style={{
            textDecoration: "none",
          }}
        >
          <button
            style={{
              backgroundColor: "#ec0d0d",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            View Products
          </button>
        </Link>
      </div>
    </>
  );
}

export default Home;