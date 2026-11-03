import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // LOAD CART

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      const cartData = savedCart ? JSON.parse(savedCart) : [];

      setCart(Array.isArray(cartData) ? cartData : []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }
  }, []);

  // UPDATE CART

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // INCREASE QUANTITY

  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) => {
      if (String(item._id) === String(id)) {
        return {
          ...item,
          quantity: Number(item.quantity || 0) + 1,
        };
      }

      return item;
    });

    updateCart(updatedCart);
  };

  // DECREASE QUANTITY

  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) => {
        if (String(item._id) === String(id)) {
          return {
            ...item,
            quantity: Number(item.quantity || 0) - 1,
          };
        }

        return item;
      })
      .filter((item) => Number(item.quantity) > 0);

    updateCart(updatedCart);
  };

  // OPEN REMOVE CONFIRMATION MODAL

  const handleRemoveClick = (item) => {
    setSelectedProduct(item);
    setShowRemoveModal(true);
  };

  // CANCEL REMOVE

  const handleCancelRemove = () => {
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  // CONFIRM REMOVE PRODUCT

  const handleConfirmRemove = () => {
    if (!selectedProduct) return;

    const updatedCart = cart.filter(
      (item) => String(item._id) !== String(selectedProduct._id),
    );

    updateCart(updatedCart);
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  // TOTAL

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  // EMPTY CART

  if (cart.length === 0) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: "calc(100vh - 70px)",
            background: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "50px 30px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              maxWidth: "500px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <h1 style={{ marginBottom: "12px" }}>Your Cart is Empty</h1>

            <p
              style={{
                color: "#777",
                marginBottom: "25px",
              }}
            >
              Add some products to your cart before checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate("/products")}
              style={{
                padding: "12px 28px",
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // CART PAGE

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          backgroundColor: "#f5f5f5",
          padding: "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* HEADER */}

          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ margin: "0 0 8px" }}>Shopping Cart</h1>

            <p style={{ color: "#777", margin: 0 }}>
              Review your selected products
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
              gap: "25px",
              alignItems: "start",
            }}
          >
            {/* CART PRODUCTS */}

            <div>
              {cart.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* PRODUCT DETAILS */}

                  <div style={{ flex: 1, minWidth: "150px" }}>
                    <h2
                      style={{
                        margin: "0 0 8px",
                        fontSize: "20px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.name}
                    </h2>

                    <p
                      style={{
                        margin: "5px 0",
                        color: "#777",
                      }}
                    >
                      {item.category}
                    </p>

                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#198754",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      ₹{Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* QUANTITY CONTROLS */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => decreaseQuantity(item._id)}
                      style={quantityButtonStyle}
                    >
                      -
                    </button>

                    <strong
                      style={{
                        minWidth: "25px",
                        textAlign: "center",
                      }}
                    >
                      {item.quantity}
                    </strong>

                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => increaseQuantity(item._id)}
                      style={quantityButtonStyle}
                    >
                      +
                    </button>
                  </div>

                  {/* SUBTOTAL */}

                  <div
                    style={{
                      minWidth: "100px",
                      textAlign: "right",
                    }}
                  >
                    <strong>
                      ₹
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toFixed(2)}
                    </strong>
                  </div>

                  {/* REMOVE BUTTON */}

                  <button
                    type="button"
                    onClick={() => handleRemoveClick(item)}
                    style={{
                      padding: "9px 15px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY */}

            <div
              style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "14px",
                boxShadow: "0 5px 18px rgba(0,0,0,0.07)",
                position: "sticky",
                top: "20px",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "20px",
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>

              <hr />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginTop: "20px",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                <span>Total</span>

                <span style={{ color: "#198754" }}>₹{total.toFixed(2)}</span>
              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={() => navigate("/checkout")}
                style={{
                  width: "100%",
                  padding: "13px",
                  marginTop: "22px",
                  backgroundColor: "#198754",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                Proceed to Checkout
              </button>

              {/* CONTINUE SHOPPING */}

              <button
                type="button"
                onClick={() => navigate("/products")}
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "10px",
                  backgroundColor: "white",
                  color: "#198754",
                  border: "1px solid #198754",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REMOVE CONFIRMATION MODAL */}

      {showRemoveModal && selectedProduct && (
        <div
          onClick={handleCancelRemove}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 9999,
            boxSizing: "border-box",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              color: "#222",
              padding: "30px",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 10px 35px rgba(0,0,0,0.25)",
              boxSizing: "border-box",
            }}
          >
            {/* WARNING ICON */}

            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                backgroundColor: "#fde8e8",
                color: "#dc3545",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              !
            </div>

            <h2
              id="remove-modal-title"
              style={{
                margin: "0 0 12px",
                fontSize: "23px",
              }}
            >
              Remove Product?
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 10px",
              }}
            >
              Are you sure you want to remove this product from your cart?
            </p>

            <p
              style={{
                color: "#222",
                fontWeight: "700",
                overflowWrap: "anywhere",
                margin: "0 0 25px",
              }}
            >
              {selectedProduct.name}
            </p>

            {/* MODAL ACTIONS */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleCancelRemove}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#f1f1f1",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRemove}
                style={{
                  padding: "11px 22px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// REUSABLE QUANTITY BUTTON STYLE

const quantityButtonStyle = {
  width: "36px",
  height: "36px",
  border: "1px solid #ddd",
  background: "white",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "20px",
};

export default Cart;
