
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${BACKEND_URL}/${image.replace(/\\/g, "/").replace(/^\//, "")}`;
};

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

  // REMOVE MODAL
  const handleRemoveClick = (item) => {
    setSelectedProduct(item);
    setShowRemoveModal(true);
  };

  const handleCancelRemove = () => {
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  // CONFIRM REMOVE
  const handleConfirmRemove = () => {
    if (!selectedProduct) return;

    const updatedCart = cart.filter(
      (item) => String(item._id) !== String(selectedProduct._id)
    );

    updateCart(updatedCart);
    setShowRemoveModal(false);
    setSelectedProduct(null);
  };

  // TOTALS
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // EMPTY CART
  if (cart.length === 0) {
    return (
      <>
        <Navbar />

        <main className="cart-page">
          <div className="cart-empty-card">
            <div className="cart-empty-icon">
              <span>🛒</span>
            </div>

            <h1>Your Cart is Empty</h1>

            <p>
              Looks like you haven't added anything to your cart yet.
              Explore our products and find something you love.
            </p>

            <button
              type="button"
              className="cart-primary-btn"
              onClick={() => navigate("/products")}
            >
              Explore Products <span>→</span>
            </button>
          </div>
        </main>

        <CartStyles />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-container">

          {/* PAGE HEADER */}
          <header className="cart-header">
            <div>
              <span className="cart-eyebrow">YOUR SHOPPING BAG</span>
              <h1>Shopping Cart</h1>
              <p>
                Review your selected products before placing your order.
              </p>
            </div>

            <div className="cart-item-badge">
              <span>🛍</span>
              {totalItems} {totalItems === 1 ? "Item" : "Items"}
            </div>
          </header>

          {/* CART CONTENT */}
          <div className="cart-layout">

            {/* PRODUCT LIST */}
            <section className="cart-products">
              <div className="cart-section-heading">
                <h2>Your Items</h2>
                <span>{cart.length} Products</span>
              </div>

              {cart.map((item) => (
                <article className="cart-product-card" key={item._id}>

                  {/* PRODUCT IMAGE */}
                  <div className="cart-product-image">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name || "Product"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";

                          const fallback =
                            event.currentTarget.nextElementSibling;

                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}

                    <div
                      className="cart-image-fallback"
                      style={{
                        display: item.image ? "none" : "flex",
                      }}
                    >
                      <span>▧</span>
                      <small>Image unavailable</small>
                    </div>
                  </div>

                  {/* PRODUCT INFORMATION */}
                  <div className="cart-product-info">
                    <span className="cart-category">
                      {item.category || "General"}
                    </span>

                    <h3>{item.name || "Product"}</h3>

                    <p className="cart-unit-price">
                      ₹{formatPrice(item.price)}
                    </p>

                    {/* QUANTITY CONTROLS */}
                    <div className="cart-quantity-wrapper">
                      <span>Quantity</span>

                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => decreaseQuantity(item._id)}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => increaseQuantity(item._id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PRICE AND REMOVE */}
                  <div className="cart-product-right">
                    <strong className="cart-subtotal">
                      ₹
                      {formatPrice(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => handleRemoveClick(item)}
                    >
                      <span>×</span> Remove
                    </button>
                  </div>
                </article>
              ))}

              <button
                type="button"
                className="cart-continue-link"
                onClick={() => navigate("/products")}
              >
                <span>←</span> Continue Shopping
              </button>
            </section>

            {/* ORDER SUMMARY */}
            <aside className="cart-summary">
              <div className="cart-summary-heading">
                <h2>Order Summary</h2>
                <span>HANDY HUB</span>
              </div>

              <div className="cart-summary-row">
                <span>Products</span>
                <strong>{cart.length}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>₹{formatPrice(total)}</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <strong className="cart-free-delivery">Calculated at checkout</strong>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Total</span>
                <strong>₹{formatPrice(total)}</strong>
              </div>

              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout <span>→</span>
              </button>

              <div className="cart-secure-note">
                <span>✓</span>
                Secure checkout
              </div>

              <div className="cart-summary-footer">
                Thank you for shopping with HANDY HUB.
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* REMOVE CONFIRMATION MODAL */}
      {showRemoveModal && selectedProduct && (
        <div
          className="cart-modal-overlay"
          onClick={handleCancelRemove}
        >
          <div
            className="cart-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-icon">!</div>

            <h2 id="remove-modal-title">Remove Product?</h2>

            <p>
              Are you sure you want to remove this product from your cart?
            </p>

            <div className="cart-modal-product">
              {selectedProduct.name}
            </div>

            <div className="cart-modal-actions">
              <button
                type="button"
                className="cart-modal-cancel"
                onClick={handleCancelRemove}
              >
                Keep Product
              </button>

              <button
                type="button"
                className="cart-modal-remove"
                onClick={handleConfirmRemove}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <CartStyles />
    </>
  );
}

// CART PAGE STYLES
function CartStyles() {
  return (
    <style>{`
      .cart-page {
        min-height: calc(100vh - 70px);
        padding: 42px 22px 65px;
        background: #fffaf8;
        box-sizing: border-box;
      }

      .cart-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .cart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 32px;
      }

      .cart-eyebrow {
        color: #b95f43;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .cart-header h1 {
        margin: 9px 0;
        color: #30231f;
        font-size: 34px;
        font-weight: 800;
      }

      .cart-header p {
        margin: 0;
        color: #85736b;
        font-size: 14px;
      }

      .cart-item-badge {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 11px 17px;
        border: 1px solid #f0dfd7;
        border-radius: 30px;
        background: white;
        color: #b95f43;
        font-size: 13px;
        font-weight: 700;
      }

      .cart-item-badge span {
        font-size: 17px;
      }

      .cart-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 330px;
        gap: 25px;
        align-items: start;
      }

      .cart-products {
        min-width: 0;
      }

      .cart-section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 17px;
      }

      .cart-section-heading h2 {
        margin: 0;
        color: #30231f;
        font-size: 20px;
      }

      .cart-section-heading span {
        color: #9a8981;
        font-size: 12px;
      }

      .cart-product-card {
        display: grid;
        grid-template-columns: 145px minmax(0, 1fr) auto;
        align-items: center;
        gap: 20px;
        margin-bottom: 16px;
        padding: 17px;
        border: 1px solid #f0e5e0;
        border-radius: 14px;
        background: white;
        box-shadow: 0 4px 16px rgba(80, 45, 30, 0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .cart-product-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(80, 45, 30, 0.08);
      }

      .cart-product-image {
        width: 145px;
        height: 145px;
        overflow: hidden;
        border-radius: 11px;
        background: #fff3ed;
      }

      .cart-product-image img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cart-image-fallback {
        width: 100%;
        height: 100%;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 7px;
        color: #b08b7c;
      }

      .cart-image-fallback span {
        font-size: 35px;
      }

      .cart-image-fallback small {
        font-size: 10px;
      }

      .cart-product-info {
        min-width: 0;
      }

      .cart-category {
        display: inline-block;
        margin-bottom: 8px;
        padding: 5px 10px;
        border-radius: 20px;
        background: #fff0e9;
        color: #b95f43;
        font-size: 10px;
        font-weight: 800;
      }

      .cart-product-info h3 {
        margin: 0 0 9px;
        color: #30231f;
        font-size: 18px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .cart-unit-price {
        margin: 0 0 15px;
        color: #b95f43;
        font-size: 15px;
        font-weight: 700;
      }

      .cart-quantity-wrapper {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .cart-quantity-wrapper > span {
        color: #918078;
        font-size: 12px;
      }

      .cart-quantity-control {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 4px;
        border: 1px solid #eee1db;
        border-radius: 8px;
        background: #fffdfc;
      }

      .cart-quantity-control button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 29px;
        height: 29px;
        border: none;
        border-radius: 6px;
        background: #fff0e9;
        color: #b95f43;
        font-size: 19px;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .cart-quantity-control button:hover {
        background: #b95f43;
        color: white;
      }

      .cart-quantity-control strong {
        min-width: 18px;
        color: #30231f;
        text-align: center;
        font-size: 13px;
      }

      .cart-product-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
        align-self: stretch;
        gap: 20px;
      }

      .cart-subtotal {
        color: #30231f;
        font-size: 17px;
        white-space: nowrap;
      }

      .cart-remove-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 8px 11px;
        border: 1px solid #f4d8d3;
        border-radius: 7px;
        background: #fff6f4;
        color: #c34c42;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .cart-remove-btn:hover {
        background: #c34c42;
        color: white;
      }

      .cart-remove-btn span {
        font-size: 16px;
      }

      .cart-continue-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 9px 0;
        border: none;
        background: transparent;
        color: #b95f43;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .cart-continue-link:hover {
        color: #98482f;
      }

      /* ORDER SUMMARY */
      .cart-summary {
        position: sticky;
        top: 20px;
        padding: 24px;
        border: 1px solid #f0e5e0;
        border-radius: 15px;
        background: white;
        box-shadow: 0 5px 22px rgba(80, 45, 30, 0.06);
        box-sizing: border-box;
      }

      .cart-summary-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 23px;
      }

      .cart-summary-heading h2 {
        margin: 0;
        color: #30231f;
        font-size: 19px;
      }

      .cart-summary-heading span {
        color: #b95f43;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .cart-summary-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 17px;
        color: #81736d;
        font-size: 13px;
      }

      .cart-summary-row strong {
        color: #30231f;
        text-align: right;
      }

      .cart-summary-row .cart-free-delivery {
        max-width: 140px;
        color: #b95f43;
        font-size: 10px;
      }

      .cart-summary-divider {
        height: 1px;
        margin: 20px 0;
        background: #eee4df;
      }

      .cart-summary-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        color: #30231f;
        font-size: 15px;
        font-weight: 700;
      }

      .cart-summary-total strong {
        color: #b95f43;
        font-size: 23px;
      }

      .cart-checkout-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        margin-top: 24px;
        padding: 15px 12px;
        border: none;
        border-radius: 9px;
        background: #b95f43;
        color: white;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .cart-checkout-btn:hover {
        background: #98482f;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(185, 95, 67, 0.2);
      }

      .cart-checkout-btn span {
        font-size: 18px;
      }

      .cart-secure-note {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        margin-top: 15px;
        color: #8c7c74;
        font-size: 11px;
      }

      .cart-secure-note span {
        color: #31966a;
        font-weight: 800;
      }

      .cart-summary-footer {
        margin-top: 18px;
        padding-top: 15px;
        border-top: 1px solid #eee4df;
        color: #a08e85;
        font-size: 10px;
        text-align: center;
      }

      /* EMPTY CART */
      .cart-empty-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        max-width: 530px;
        margin: 70px auto;
        padding: 55px 30px;
        border: 1px solid #f0e5e0;
        border-radius: 18px;
        background: white;
        box-shadow: 0 8px 30px rgba(80, 45, 30, 0.06);
        text-align: center;
        box-sizing: border-box;
      }

      .cart-empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 85px;
        height: 85px;
        margin-bottom: 22px;
        border-radius: 50%;
        background: #fff0e9;
        font-size: 37px;
      }

      .cart-empty-card h1 {
        margin: 0 0 12px;
        color: #30231f;
        font-size: 26px;
      }

      .cart-empty-card p {
        max-width: 370px;
        margin: 0 0 25px;
        color: #85736b;
        font-size: 14px;
        line-height: 1.7;
      }

      .cart-primary-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 13px 23px;
        border: none;
        border-radius: 8px;
        background: #b95f43;
        color: white;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .cart-primary-btn:hover {
        background: #98482f;
        transform: translateY(-2px);
      }

      /* REMOVE MODAL */
      .cart-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(35, 24, 20, 0.58);
        backdrop-filter: blur(4px);
        box-sizing: border-box;
      }

      .cart-modal {
        width: 100%;
        max-width: 420px;
        padding: 30px;
        border-radius: 16px;
        background: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        text-align: center;
        box-sizing: border-box;
        animation: cart-modal-in 0.2s ease;
      }

      @keyframes cart-modal-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .cart-modal-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 55px;
        height: 55px;
        margin: 0 auto 17px;
        border-radius: 50%;
        background: #fff0ed;
        color: #c34c42;
        font-size: 27px;
        font-weight: 800;
      }

      .cart-modal h2 {
        margin: 0 0 10px;
        color: #30231f;
        font-size: 22px;
      }

      .cart-modal p {
        margin: 0 0 12px;
        color: #81736d;
        font-size: 13px;
        line-height: 1.7;
      }

      .cart-modal-product {
        margin-bottom: 23px;
        color: #30231f;
        font-size: 14px;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .cart-modal-actions {
        display: flex;
        gap: 10px;
      }

      .cart-modal-actions button {
        flex: 1;
        padding: 12px 8px;
        border: none;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .cart-modal-cancel {
        background: #f3eeeb;
        color: #66534d;
      }

      .cart-modal-cancel:hover {
        background: #e8ddd7;
      }

      .cart-modal-remove {
        background: #c34c42;
        color: white;
      }

      .cart-modal-remove:hover {
        background: #a83b33;
      }

      /* TABLET */
      @media (max-width: 950px) {
        .cart-layout {
          grid-template-columns: minmax(0, 1fr) 290px;
          gap: 17px;
        }

        .cart-product-card {
          grid-template-columns: 115px minmax(0, 1fr) auto;
          gap: 14px;
        }

        .cart-product-image {
          width: 115px;
          height: 125px;
        }

        .cart-summary {
          padding: 19px;
        }
      }

      /* MOBILE */
      @media (max-width: 700px) {
        .cart-page {
          padding: 27px 13px 45px;
        }

        .cart-header {
          margin-bottom: 24px;
        }

        .cart-header h1 {
          font-size: 27px;
        }

        .cart-header p {
          font-size: 12px;
          line-height: 1.6;
        }

        .cart-layout {
          grid-template-columns: 1fr;
          gap: 22px;
        }

        .cart-product-card {
          grid-template-columns: 105px minmax(0, 1fr);
          gap: 13px;
          padding: 12px;
        }

        .cart-product-image {
          width: 105px;
          height: 120px;
          grid-row: span 2;
        }

        .cart-product-info h3 {
          font-size: 15px;
        }

        .cart-unit-price {
          margin-bottom: 10px;
          font-size: 14px;
        }

        .cart-quantity-wrapper {
          gap: 7px;
        }

        .cart-quantity-wrapper > span {
          display: none;
        }

        .cart-quantity-control {
          gap: 10px;
        }

        .cart-quantity-control button {
          width: 26px;
          height: 26px;
        }

        .cart-product-right {
          grid-column: 1 / -1;
          flex-direction: row;
          align-items: center;
          padding-top: 10px;
          border-top: 1px solid #f0e5e0;
        }

        .cart-subtotal {
          font-size: 15px;
        }

        .cart-remove-btn {
          padding: 7px 10px;
        }

        .cart-summary {
          position: static;
          padding: 21px;
        }

        .cart-empty-card {
          margin: 35px auto;
          padding: 40px 20px;
        }

        .cart-empty-card h1 {
          font-size: 23px;
        }
      }

      @media (max-width: 360px) {
        .cart-product-card {
          grid-template-columns: 85px minmax(0, 1fr);
          gap: 10px;
        }

        .cart-product-image {
          width: 85px;
          height: 105px;
        }

        .cart-product-info h3 {
          font-size: 13px;
        }

        .cart-quantity-control {
          gap: 7px;
        }

        .cart-modal {
          padding: 23px 16px;
        }

        .cart-modal-actions {
          flex-direction: column;
        }
      }
    `}</style>
  );
}

export default Cart;
