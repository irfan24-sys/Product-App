import { Link } from "react-router-dom";
import background from "../assets/sp1.jpg";
import "./style.css";

function Home() {
  return (
    <div
      className="home-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundImage: `url(${background})`,
      }}
    >
      <h1>Welcome to Product App</h1>

      <p style={{ fontSize: "1.25rem", textAlign: "center", color: "white" }}>
        Manage your products easily.
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <Link to="/add-product">
          <button
            style={{
              backgroundColor: "#da1f07",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
            }}
          >
            Add Product
          </button>
        </Link>

        <Link to="/products">
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
    </div>
  );
}

export default Home;