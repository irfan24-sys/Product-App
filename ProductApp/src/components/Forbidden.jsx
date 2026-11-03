import { useNavigate } from "react-router-dom";

function Forbidden() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h1
          style={{
            fontSize: "70px",
            margin: "0",
            color: "red",
          }}
        >
          403
        </h1>

        <h2
          style={{
            marginTop: "10px",
            color: "#222",
          }}
        >
          Access Forbidden
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          You don't have permission to access this page.
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 25px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default Forbidden;