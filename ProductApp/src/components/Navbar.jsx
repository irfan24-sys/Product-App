
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = Boolean(accessToken && user);
  const isSeller = isLoggedIn && user?.role === "seller";

  const closeMenu = () => setMenuOpen(false);

  // Logout confirmation
  const handleLogoutClick = () => {
    closeMenu();
    setShowLogoutModal(true);
  };

  // Confirm logout
  const handleConfirmLogout = () => {
    // Remove authentication details
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");

    // Clear previous user's cart
    localStorage.removeItem("cart");

    setShowLogoutModal(false);
    setMenuOpen(false);

    toast.success("Logged out successfully!", {
      autoClose: 1500,
    });

    navigate("/");
  };

  // Navigate to login
  const handleLogin = () => {
    closeMenu();
    navigate("/login");
  };

  return (
    <>
      <nav className="main-navbar">
        <div className="navbar-container">

          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            PRODUCT <span>HUB.</span>
          </Link>

          {/* Desktop / Mobile Navigation */}
          <div
            id="navbar-links"
            className={`navbar-menu ${menuOpen ? "active" : ""}`}
          >
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>

            <Link to="/products" className="nav-link" onClick={closeMenu}>
              Products
            </Link>

            {/* My Orders - Logged-in users only */}
            {isLoggedIn && (
              <Link
                to="/my-orders"
                className="nav-link"
                onClick={closeMenu}
              >
                My Orders
              </Link>
            )}

            {/* Seller Navigation */}
            {isSeller && (
              <>
                <Link
                  to="/add-product"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Add Product
                </Link>

                <Link
                  to="/seller-dashboard"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  Seller Dashboard
                </Link>
              </>
            )}

            {/* Cart - Logged-in users only */}
            {isLoggedIn && (
              <Link
                to="/cart"
                className="nav-link"
                onClick={closeMenu}
              >
                Cart
              </Link>
            )}

            {/* Login / Logout */}
            {isLoggedIn ? (
              <button
                className="nav-auth-button logout-btn"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            ) : (
              <button
                className="nav-auth-button login-btn"
                onClick={handleLogin}
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="navbar-links"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="logout-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="logout-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className="logout-icon">!</div>

            <h2 id="logout-modal-title">Confirm Logout</h2>

            <p>
              Are you sure you want to log out of your account?
            </p>

            <div className="logout-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-logout-btn"
                onClick={handleConfirmLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        .main-navbar {
          width: 100%;
          min-height: 76px;
          background: #FFFAF8;
          border-bottom: 1px solid #F0E3DD;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 3px 15px rgba(48, 35, 31, 0.04);
        }

        .navbar-container {
          max-width: 1250px;
          min-height: 76px;
          margin: 0 auto;
          padding: 0 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .navbar-logo {
          text-decoration: none;
          color: #30231F;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .navbar-logo span {
          color: #B95F43;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 27px;
        }

        .nav-link {
          text-decoration: none;
          color: #66534D;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          transition: color 0.2s ease;
          position: relative;
        }

        .nav-link:hover {
          color: #B95F43;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -7px;
          width: 0;
          height: 2px;
          background: #B95F43;
          transition: width 0.2s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-auth-button {
          padding: 10px 21px;
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .login-btn {
          background: #B95F43;
        }

        .login-btn:hover {
          background: #9F4D35;
          transform: translateY(-1px);
        }

        .logout-btn {
          background: #30231F;
        }

        .logout-btn:hover {
          background: #49362E;
          transform: translateY(-1px);
        }

        /* Mobile Menu Toggle */
        .menu-toggle {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid #EADBD3;
          border-radius: 9px;
          background: #FFF5F0;
          cursor: pointer;
          padding: 10px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
        }

        .menu-toggle span {
          display: block;
          width: 20px;
          height: 2px;
          border-radius: 5px;
          background: #B95F43;
          transition: 0.25s ease;
        }

        .menu-toggle.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .menu-toggle.open span:nth-child(2) {
          opacity: 0;
        }

        .menu-toggle.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Logout Modal */
        .logout-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 20, 16, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .logout-modal {
          width: 100%;
          max-width: 410px;
          padding: 32px 28px;
          border-radius: 18px;
          background: #FFFAF8;
          text-align: center;
          box-shadow: 0 15px 50px rgba(0,0,0,0.2);
          animation: modalAppear 0.2s ease;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logout-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #FCECE5;
          color: #B95F43;
          font-size: 30px;
          font-weight: 800;
        }

        .logout-modal h2 {
          margin: 0 0 10px;
          color: #30231F;
          font-size: 23px;
        }

        .logout-modal p {
          margin: 0 0 25px;
          color: #806D64;
          font-size: 14px;
          line-height: 1.7;
        }

        .logout-modal-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .logout-modal-actions button {
          padding: 11px 20px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .cancel-btn {
          background: #F0E6E0;
          color: #49362E;
        }

        .cancel-btn:hover {
          background: #E7D8D0;
        }

        .confirm-logout-btn {
          background: #B95F43;
          color: white;
        }

        .confirm-logout-btn:hover {
          background: #9F4D35;
        }

        /* Tablet and Mobile */
        @media (max-width: 950px) {
          .navbar-container {
            padding: 0 22px;
          }

          .menu-toggle {
            display: flex;
          }

          .navbar-menu {
            position: absolute;
            top: 76px;
            left: 0;
            right: 0;
            width: 100%;
            padding: 20px 25px 25px;
            background: #FFFAF8;
            border-top: 1px solid #F0E3DD;
            box-shadow: 0 12px 20px rgba(48, 35, 31, 0.08);
            display: none;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
          }

          .navbar-menu.active {
            display: flex;
          }

          .nav-link {
            padding: 14px 5px;
            border-bottom: 1px solid #F2E9E4;
            font-size: 15px;
          }

          .nav-link::after {
            display: none;
          }

          .nav-auth-button {
            margin-top: 15px;
            width: 100%;
            padding: 13px;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            min-height: 68px;
            padding: 0 16px;
          }

          .main-navbar {
            min-height: 68px;
          }

          .navbar-logo {
            font-size: 22px;
          }

          .navbar-menu {
            top: 68px;
            padding: 15px 18px 22px;
          }

          .logout-modal {
            padding: 27px 20px;
          }

          .logout-modal h2 {
            font-size: 21px;
          }

          .logout-modal-actions {
            flex-direction: column;
          }

          .logout-modal-actions button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
