function NotFound() {
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
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.15)",
          maxWidth: "450px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            margin: "0 0 15px",
            color: "#555",
          }}
        >
          404
        </h1>

        <h2
          style={{
            marginBottom: "10px",
            color: "#222",
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Sorry, the page you are looking for does not exist.
        </p>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
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

export default NotFound;