
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getProduct } from "../api/productApi";

const CART_KEY = "cart";

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

function EachItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  // GET SINGLE PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setImageError(false);

        const response = await getProduct(id);

        const productData =
          response?.product ||
          response?.data?.product ||
          response?.data ||
          response;

        if (!productData?._id) {
          throw new Error("Product not found");
        }

        setProduct(productData);
      } catch (error) {
        console.error(
          "Get Single Product Error:",
          error.response?.data || error.message
        );

        setError("Unable to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ADD TO CART
  const handleAddToCart = () => {
    if (!product?._id) return;

    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const cart = savedCart ? JSON.parse(savedCart) : [];

      if (!Array.isArray(cart)) {
        throw new Error("Invalid cart data");
      }

      const existingProductIndex = cart.findIndex(
        (item) => String(item._id) === String(product._id)
      );

      if (existingProductIndex !== -1) {
        cart[existingProductIndex] = {
          ...cart[existingProductIndex],
          quantity:
            Number(cart[existingProductIndex].quantity || 0) + 1,
        };
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: Number(product.price) || 0,
          category: product.category,
          description: product.description,
          stock: Number(product.stock) || 0,
          image: product.image || "",
          quantity: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      navigate("/cart");
    } catch (error) {
      console.error("Add To Cart Error:", error);
    }
  };

  // LOADING
  if (loading) {
    return (
      <>
        <Navbar />

        <div className="each-loading">
          <div className="each-spinner"></div>
          <p>Loading product...</p>
        </div>

        <EachItemStyles />
      </>
    );
  }

  // ERROR
  if (error || !product) {
    return (
      <>
        <Navbar />

        <div className="each-error">
          <div className="each-error-icon">!</div>

          <h2>{error || "Product not found"}</h2>

          <button onClick={() => navigate("/products")}>
            Back to Products
          </button>
        </div>

        <EachItemStyles />
      </>
    );
  }

  const imageUrl = getImageUrl(product.image);

  const sellerName =
    product.userId?.name ||
    product.userId?.email ||
    "Verified Seller";

  // PRODUCT DETAILS
  return (
    <>
      <Navbar />

      <main className="each-page">
        <div className="each-container">

          {/* BACK BUTTON */}
          <button
            className="each-back-button"
            onClick={() => navigate("/products")}
          >
            <span>←</span> Back to Products
          </button>

          <div className="each-product-card">

            {/* PRODUCT IMAGE */}
            <div className="each-image-section">
              <div className="each-image-wrapper">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.name || "Product"}
                    className="each-product-image"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="each-image-placeholder">
                    <span>📦</span>
                    <p>Image Not Available</p>
                  </div>
                )}

                <span className="each-image-label">
                  HANDY HUB
                </span>
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="each-details">

              <span className="each-category">
                {product.category || "General"}
              </span>

              <h1 className="each-product-name">
                {product.name}
              </h1>

              <div className="each-price">
                ₹{Number(product.price || 0).toLocaleString("en-IN")}
              </div>

              <div className="each-divider"></div>

              {/* DESCRIPTION */}
              <div className="each-description">
                <h3>Product Description</h3>

                <p>
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>

              {/* SELLER DETAILS */}
              <div className="each-seller">
                <div className="each-seller-icon">
                  <span>♙</span>
                </div>

                <div>
                  <span className="each-seller-caption">
                    Sold by
                  </span>

                  <strong>{sellerName}</strong>
                </div>
              </div>

              {/* ADD TO CART */}
              <button
                type="button"
                className="each-cart-button"
                onClick={handleAddToCart}
              >
                <span>🛒</span> Add to Cart
              </button>

              <p className="each-delivery-note">
                ✓ Quality products from HANDY HUB sellers
              </p>

            </div>
          </div>
        </div>
      </main>

      <EachItemStyles />
    </>
  );
}

// RESPONSIVE STYLES
function EachItemStyles() {
  return (
    <style>{`
      .each-page {
        min-height: calc(100vh - 70px);
        padding: 35px 20px 60px;
        background: #fffaf8;
      }

      .each-container {
        max-width: 1100px;
        margin: 0 auto;
      }

      .each-back-button {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 25px;
        padding: 10px 16px;
        border: 1px solid #eadbd5;
        border-radius: 8px;
        background: white;
        color: #66534d;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .each-back-button:hover {
        background: #b95f43;
        color: white;
        border-color: #b95f43;
      }

      .each-back-button span {
        font-size: 20px;
      }

      .each-product-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 45px;
        padding: 35px;
        background: white;
        border: 1px solid #f0e5e0;
        border-radius: 18px;
        box-shadow: 0 8px 35px rgba(80, 45, 30, 0.07);
      }

      .each-image-section {
        min-width: 0;
      }

      .each-image-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 440px;
        overflow: hidden;
        border-radius: 14px;
        background: #fff5f0;
      }

      .each-product-image {
        display: block;
        width: 100%;
        height: 440px;
        object-fit: contain;
        padding: 18px;
      }

      .each-image-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 440px;
        color: #9b8176;
      }

      .each-image-placeholder span {
        font-size: 65px;
        margin-bottom: 12px;
      }

      .each-image-placeholder p {
        font-size: 14px;
      }

      .each-image-label {
        position: absolute;
        top: 16px;
        left: 16px;
        padding: 7px 12px;
        border-radius: 6px;
        background: #b95f43;
        color: white;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .each-details {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 5px 0;
      }

      .each-category {
        display: inline-block;
        padding: 7px 13px;
        border-radius: 20px;
        background: #fff0e9;
        color: #b95f43;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .each-product-name {
        margin: 18px 0 12px;
        color: #30231f;
        font-size: 32px;
        line-height: 1.3;
        font-weight: 750;
        overflow-wrap: anywhere;
      }

      .each-price {
        color: #b95f43;
        font-size: 31px;
        font-weight: 800;
      }

      .each-divider {
        width: 100%;
        height: 1px;
        margin: 22px 0;
        background: #eee5e0;
      }

      .each-description {
        margin-bottom: 24px;
      }

      .each-description h3 {
        margin: 0 0 10px;
        color: #30231f;
        font-size: 16px;
      }

      .each-description p {
        margin: 0;
        color: #756760;
        font-size: 14px;
        line-height: 1.8;
        overflow-wrap: anywhere;
      }

      .each-seller {
        display: flex;
        align-items: center;
        gap: 13px;
        width: 100%;
        margin: 15px 0 25px;
        padding: 15px;
        border: 1px solid #f0e5e0;
        border-radius: 10px;
        background: #fffaf8;
      }

      .each-seller-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 50%;
        background: #fce8df;
        color: #b95f43;
        font-size: 24px;
      }

      .each-seller-caption {
        display: block;
        margin-bottom: 4px;
        color: #8c7b73;
        font-size: 12px;
      }

      .each-seller strong {
        color: #30231f;
        font-size: 14px;
        overflow-wrap: anywhere;
      }

      .each-cart-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 15px 20px;
        border: none;
        border-radius: 9px;
        background: #b95f43;
        color: white;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .each-cart-button:hover {
        background: #98482f;
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(185, 95, 67, 0.2);
      }

      .each-delivery-note {
        width: 100%;
        margin: 15px 0 0;
        color: #198754;
        font-size: 12px;
        text-align: center;
      }

      .each-loading,
      .each-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 75vh;
        gap: 15px;
        color: #66534d;
        text-align: center;
        padding: 20px;
      }

      .each-spinner {
        width: 38px;
        height: 38px;
        border: 4px solid #f0ddd5;
        border-top-color: #b95f43;
        border-radius: 50%;
        animation: each-spin 0.8s linear infinite;
      }

      @keyframes each-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .each-error-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #fff0e9;
        color: #b95f43;
        font-size: 25px;
        font-weight: 700;
      }

      .each-error h2 {
        font-size: 19px;
      }

      .each-error button {
        padding: 11px 20px;
        border: none;
        border-radius: 8px;
        background: #b95f43;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .each-page {
          padding: 22px 14px 40px;
        }

        .each-product-card {
          grid-template-columns: 1fr;
          gap: 25px;
          padding: 18px;
        }

        .each-image-wrapper,
        .each-image-placeholder {
          min-height: 300px;
        }

        .each-product-image {
          height: 300px;
        }

        .each-product-name {
          font-size: 25px;
        }

        .each-price {
          font-size: 27px;
        }
      }

      @media (max-width: 400px) {
        .each-product-card {
          padding: 13px;
        }

        .each-image-wrapper,
        .each-image-placeholder {
          min-height: 240px;
        }

        .each-product-image {
          height: 240px;
        }

        .each-product-name {
          font-size: 22px;
        }
      }
    `}</style>
  );
}

export default EachItem;
