import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Get logged-in user
  let user = null;

  try {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error("User data error:", error);
    user = null;
  }

  // Login status
  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = Boolean(accessToken && user);

  // Check seller
  const isSeller = isLoggedIn && user?.role === "seller";

  // Show confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // Cancel logout
  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Confirm logout
  const handleConfirmLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    setShowLogoutModal(false);

    toast.success("Logged out successfully!", {
      autoClose: 1500,
    });

    navigate("/");
  };

  // Login
  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <nav
        style={{
          minHeight: "70px",
          backgroundColor: "#222",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 40px",
          color: "white",
          boxSizing: "border-box",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0 }}>MyShop</h2>
        </Link>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "25px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/" style={linkStyle}>
            Home
          </Link>

          <Link to="/products" style={linkStyle}>
            Products
          </Link>
          <Link to="/my-orders" style={linkStyle}>
            My Orders
          </Link>

          {/* Seller options */}
          {isSeller && (
            <>
              <Link to="/add-product" style={linkStyle}>
                Add Product
              </Link>

              <Link to="/seller-dashboard" style={linkStyle}>
                Seller Dashboard
              </Link>
            </>
          )}

          {/* Cart */}
          <Link to="/cart" style={linkStyle}>
            Cart
          </Link>

          {/* Login / Logout */}
          {isLoggedIn ? (
            <button onClick={handleLogoutClick} style={logoutButtonStyle}>
              Logout
            </button>
          ) : (
            <button onClick={handleLogin} style={loginButtonStyle}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          onClick={handleCancelLogout}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            style={{
              backgroundColor: "#fff",
              color: "#222",
              width: "100%",
              maxWidth: "400px",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#fde8e8",
                color: "#e63946",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                margin: "0 auto 18px",
              }}
            >
              !
            </div>

            <h2
              id="logout-modal-title"
              style={{
                margin: "0 0 12px",
                fontSize: "23px",
              }}
            >
              Confirm Logout
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "15px",
                lineHeight: 1.6,
                margin: "0 0 25px",
              }}
            >
              Are you sure you want to log out of your account?
            </p>

            {/* Modal buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button onClick={handleCancelLogout} style={cancelButtonStyle}>
                Cancel
              </button>

              <button onClick={handleConfirmLogout} style={logoutButtonStyle}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Reusable styles
const linkStyle = {
  color: "white",
  textDecoration: "none",
};

const logoutButtonStyle = {
  padding: "9px 17px",
  backgroundColor: "#e63946",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const loginButtonStyle = {
  padding: "9px 17px",
  backgroundColor: "#198754",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const cancelButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#f1f1f1",
  color: "#333",
  border: "1px solid #ddd",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

export default Navbar;
