import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../components/Navbar";
import { getProducts } from "../api/productApi";

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

function Products({ products = [], setProducts }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const limit = 8;
  const CART_KEY = "cart";

  const isLoggedIn = () => {
    const accessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!accessToken || !savedUser) return false;

    try {
      const user = JSON.parse(savedUser);
      return Boolean(user && typeof user === "object");
    } catch (error) {
      console.error("User data error:", error);
      return false;
    }
  };

  const getCart = () => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      if (!savedCart) return [];

      const cart = JSON.parse(savedCart);
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error("Get Cart Error:", error);
      return [];
    }
  };

  const isProductInCart = (productId) => {
    return getCart().some(
      (item) => String(item._id) === String(productId)
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const firstResponse = await getProducts(1, limit);

        const extractProducts = (response) => {
          if (Array.isArray(response?.data)) return response.data;
          if (Array.isArray(response?.products)) return response.products;
          if (Array.isArray(response)) return response;
          return [];
        };

        const firstPageProducts = extractProducts(firstResponse);

        const backendTotalPages = Math.max(
          1,
          Number(firstResponse?.pagination?.totalPages) || 1
        );

        let allProducts = [...firstPageProducts];

        if (backendTotalPages > 1) {
          const remainingResponses = await Promise.all(
            Array.from({ length: backendTotalPages - 1 }, (_, index) =>
              getProducts(index + 2, limit)
            )
          );

          remainingResponses.forEach((response) => {
            allProducts = allProducts.concat(extractProducts(response));
          });
        }

        if (!isMounted) return;

        if (typeof setProducts === "function") {
          setProducts(allProducts);
        }

        setPage(1);
      } catch (error) {
        console.error(
          "Get Products Error:",
          error.response?.data || error.message
        );

        if (isMounted) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [setProducts]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    if (!product?._id) {
      toast.error("Unable to add product to cart.");
      return;
    }

    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    try {
      const cart = getCart();

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

      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 1000,
      });

      setTimeout(() => {
        navigate("/cart");
      }, 1500);
    } catch (error) {
      console.error("Add To Cart Error:", error);
      toast.error("Unable to add product to cart.");
    }
  };

  const handleCartButtonClick = (e, product) => {
    e.stopPropagation();

    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    if (isProductInCart(product._id)) {
      navigate("/cart");
      return;
    }

    handleAddToCart(e, product);
  };

  const handleProductClick = (product) => {
    if (!product?._id) return;
    navigate(`/each-item/${product._id}`);
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.userId?.name?.toLowerCase().includes(search) ||
      product.userId?.email?.toLowerCase().includes(search)
    );
  });

  const filteredTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / limit)
  );

  const displayedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit
  );

  const isSearching = searchTerm.trim().length > 0;

  return (
    <>
      <Navbar />
      <ToastContainer />

      <style>
        {`
          .products-page {
            min-height: 100vh;
            background: #f8f8f6;
            padding: 45px 24px 65px;
            box-sizing: border-box;
          }

          .products-container {
            max-width: 1240px;
            margin: 0 auto;
          }

          .products-heading {
            text-align: center;
            margin-bottom: 12px;
            color: #30231f;
            font-size: 36px;
            font-weight: 750;
            letter-spacing: -1px;
          }

          .products-subheading {
            text-align: center;
            color: #81756f;
            font-size: 15px;
            margin: 0 0 30px;
          }

          .products-search {
            max-width: 550px;
            margin: 0 auto 35px;
            position: relative;
          }

          .products-search input {
            width: 100%;
            height: 52px;
            padding: 0 18px 0 48px;
            border: 1px solid #e5ded9;
            border-radius: 10px;
            background: #fff;
            outline: none;
            font-size: 15px;
            box-sizing: border-box;
            transition: border-color 0.2s, box-shadow 0.2s;
          }

          .products-search input:focus {
            border-color: #b95f43;
            box-shadow: 0 0 0 3px rgba(185, 95, 67, 0.10);
          }

          .search-icon {
            position: absolute;
            left: 17px;
            top: 50%;
            transform: translateY(-50%);
            color: #95877f;
            font-size: 18px;
          }

          .products-count {
            color: #82766f;
            font-size: 14px;
            margin: 0 0 18px;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 24px;
          }

          .product-card {
            min-width: 0;
            background: #fff;
            border: 1px solid #eee9e5;
            border-radius: 13px;
            overflow: hidden;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }

          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 28px rgba(48, 35, 31, 0.10);
          }

          .product-image-wrapper {
            width: 100%;
            height: 220px;
            background: #f3f0ed;
            overflow: hidden;
            position: relative;
          }

          .product-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: transform 0.4s ease;
          }

          .product-card:hover .product-image {
            transform: scale(1.05);
          }

          .product-image-placeholder {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #968b84;
            font-size: 14px;
          }

          .product-content {
            padding: 18px;
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .product-category {
            display: inline-block;
            align-self: flex-start;
            background: #fff0eb;
            color: #a6533a;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }

          .product-name {
            color: #30231f;
            font-size: 18px;
            font-weight: 700;
            line-height: 1.4;
            margin: 0 0 9px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: 50px;
          }

          .product-description {
            color: #82766f;
            font-size: 13px;
            line-height: 1.6;
            margin: 0 0 14px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .product-bottom {
            margin-top: auto;
            padding-top: 14px;
            border-top: 1px solid #f0ece9;
          }

          .product-price {
            color: #b95f43;
            font-size: 23px;
            font-weight: 750;
            margin-bottom: 13px;
          }

          .product-seller {
            color: #92867f;
            font-size: 12px;
            margin-bottom: 13px;
          }

          .add-cart-button {
            width: 100%;
            border: none;
            border-radius: 7px;
            padding: 12px;
            background: #b95f43;
            color: white;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s;
          }

          .add-cart-button:hover {
            background: #984a33;
          }

          .add-cart-button.added {
            background: #77736f;
          }

          .products-empty {
            background: #fff;
            border: 1px solid #eee9e5;
            border-radius: 12px;
            padding: 55px 20px;
            text-align: center;
            color: #30231f;
          }

          .products-empty p {
            color: #82766f;
          }

          .clear-search-button {
            border: none;
            background: #b95f43;
            color: #fff;
            border-radius: 7px;
            padding: 11px 20px;
            font-weight: 600;
            cursor: pointer;
          }

          .products-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-top: 40px;
          }

          .products-pagination button {
            padding: 10px 18px;
            border: 1px solid #e5ded9;
            border-radius: 7px;
            background: #fff;
            color: #30231f;
            cursor: pointer;
            font-weight: 600;
          }

          .products-pagination button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          .products-pagination button:not(:disabled):hover {
            background: #b95f43;
            color: #fff;
            border-color: #b95f43;
          }

          .products-pagination span {
            color: #82766f;
            font-size: 14px;
          }

          .products-loading {
            min-height: 70vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #30231f;
          }

          .login-overlay {
            position: fixed;
            inset: 0;
            background: rgba(35, 25, 21, 0.55);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            z-index: 9999;
          }

          .login-modal {
            background: #fff;
            width: 100%;
            max-width: 400px;
            padding: 32px;
            border-radius: 14px;
            text-align: center;
            box-sizing: border-box;
            box-shadow: 0 15px 45px rgba(0,0,0,0.18);
          }

          .login-modal-icon {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            margin: 0 auto 17px;
            background: #fff0eb;
            color: #b95f43;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 26px;
            font-weight: 700;
          }

          .login-modal h2 {
            color: #30231f;
            margin: 0 0 12px;
          }

          .login-modal p {
            color: #82766f;
            line-height: 1.6;
            font-size: 14px;
            margin-bottom: 24px;
          }

          .login-modal-actions {
            display: flex;
            gap: 12px;
          }

          .login-modal-actions button {
            flex: 1;
            padding: 11px;
            border-radius: 7px;
            cursor: pointer;
            font-weight: 600;
          }

          .login-cancel {
            background: #f4f1ef;
            border: 1px solid #e5ded9;
            color: #51443e;
          }

          .login-submit {
            background: #b95f43;
            border: 1px solid #b95f43;
            color: white;
          }

          @media (max-width: 600px) {
            .products-page {
              padding: 30px 15px 45px;
            }

            .products-heading {
              font-size: 29px;
            }

            .products-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }

            .product-image-wrapper {
              height: 155px;
            }

            .product-content {
              padding: 12px;
            }

            .product-name {
              font-size: 15px;
              min-height: 42px;
            }

            .product-price {
              font-size: 19px;
            }

            .product-description {
              font-size: 12px;
            }

            .add-cart-button {
              padding: 10px 5px;
              font-size: 12px;
            }

            .products-pagination {
              gap: 8px;
            }

            .products-pagination button {
              padding: 9px 12px;
            }
          }

          @media (max-width: 360px) {
            .products-grid {
              grid-template-columns: 1fr;
            }

            .product-image-wrapper {
              height: 210px;
            }
          }
        `}
      </style>

      {loading ? (
        <div className="products-loading">
          <h2>Loading products...</h2>
        </div>
      ) : error ? (
        <div className="products-loading">
          <h2>{error}</h2>
        </div>
      ) : (
        <main className="products-page">
          <div className="products-container">
            <h1 className="products-heading">Explore Our Products</h1>

            <p className="products-subheading">
              Find the right products for your everyday needs.
            </p>

            <div className="products-search">
              <span className="search-icon">⌕</span>

              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products, categories or sellers..."
                aria-label="Search products"
              />
            </div>

            {products.length === 0 ? (
              <div className="products-empty">
                <h2>No products available</h2>
                <p>Products will appear here when sellers add them.</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="products-empty">
                <h2>No matching products found</h2>
                <p>Try another product name, category or seller.</p>

                <button
                  className="clear-search-button"
                  onClick={() => {
                    setSearchTerm("");
                    setPage(1);
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <p className="products-count">
                  {isSearching
                    ? `Found ${filteredProducts.length} matching product(s)`
                    : `Showing ${filteredProducts.length} product(s)`}
                </p>

                <div className="products-grid">
                  {displayedProducts.map((product) => {
                    const addedToCart = isProductInCart(product._id);

                    return (
                      <article
                        key={product._id}
                        className="product-card"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="product-image-wrapper">
                          {product.image ? (
                            <img
                              className="product-image"
                              src={getImageUrl(product.image)}
                              alt={product.name || "Product"}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : null}

                          <div
                            className="product-image-placeholder"
                            style={{
                              display: product.image ? "none" : "flex",
                              position: product.image ? "absolute" : "static",
                              inset: 0,
                              width: "100%",
                            }}
                          >
                            No Image Available
                          </div>
                        </div>

                        <div className="product-content">
                          <span className="product-category">
                            {product.category || "General"}
                          </span>

                          <h2 className="product-name">
                            {product.name}
                          </h2>

                          <p className="product-description">
                            {product.description}
                          </p>

                          <div className="product-bottom">
                            <div className="product-price">
                              ₹{product.price}
                            </div>

                            {product.userId && (
                              <div className="product-seller">
                                Seller:{" "}
                                {product.userId.name ||
                                  product.userId.email ||
                                  "Seller"}
                              </div>
                            )}

                            <button
                              type="button"
                              className={`add-cart-button ${
                                addedToCart ? "added" : ""
                              }`}
                              onClick={(e) =>
                                handleCartButtonClick(e, product)
                              }
                            >
                              {addedToCart ? "Go to Cart" : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            {filteredProducts.length > limit && (
              <div className="products-pagination">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((previous) => Math.max(previous - 1, 1))
                  }
                >
                  Previous
                </button>

                <span>
                  Page {page} of {filteredTotalPages}
                </span>

                <button
                  type="button"
                  disabled={page === filteredTotalPages}
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(previous + 1, filteredTotalPages)
                    )
                  }
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {showLoginModal && (
        <div
          className="login-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="login-modal-icon">!</div>

            <h2 id="login-modal-title">Login Required</h2>

            <p>
              Please log in to your account before adding products to your
              cart.
            </p>

            <div className="login-modal-actions">
              <button
                type="button"
                className="login-cancel"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="login-submit"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Products;