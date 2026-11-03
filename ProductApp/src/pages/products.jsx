
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../components/Navbar";
import { getProducts } from "../api/productApi";

function Products({ products = [], setProducts }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);

  const limit = 8;
  const CART_KEY = "cart";

  // CHECK LOGIN STATUS

  const isLoggedIn = () => {
    const accessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (!accessToken || !savedUser) {
      return false;
    }

    try {
      const user = JSON.parse(savedUser);
      return Boolean(user && typeof user === "object");
    } catch (error) {
      console.error("User data error:", error);
      return false;
    }
  };

  // GET CART

  const getCart = () => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (!savedCart) {
        return [];
      }

      const cart = JSON.parse(savedCart);

      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error("Get Cart Error:", error);
      return [];
    }
  };

  // CHECK PRODUCT IN CART

  const isProductInCart = (productId) => {
    const cart = getCart();

    return cart.some(
      (item) => String(item._id) === String(productId)
    );
  };

  // FETCH ALL PRODUCTS
  // Fetch every backend page once so search can find products
  // across the complete product list. Pagination is handled
  // on the frontend with 8 products per page.

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const firstResponse = await getProducts(1, limit);

        console.log("Products Response:", firstResponse);

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

        setProducts(allProducts);
        setTotalPages(Math.max(1, Math.ceil(allProducts.length / limit)));
        setPage(1);
      } catch (error) {
        console.error(
          "Get Products Error:",
          error.response?.data || error.message
        );

        if (isMounted) {
          setError("Unable to load products.");
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

  // ADD TO CART

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    if (!product?._id) {
      console.error("Product ID is missing");
      toast.error("Unable to add product to cart.");
      return;
    }

    // Always check login before modifying the cart
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
        // Increase quantity if product already exists
        cart[existingProductIndex] = {
          ...cart[existingProductIndex],
          quantity:
            Number(cart[existingProductIndex].quantity || 0) + 1,
        };
      } else {
        // Add new product
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

      // Save cart
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // Refresh product state
      if (typeof setProducts === "function") {
        setProducts((previous) => [...previous]);
      }

     toast.success(`${product.name} added to cart!`, {
  position: "top-right",
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  draggable: false,
});
      // Navigate after the toast closes
setTimeout(() => {
  navigate("/cart");
}, 1500);
    } catch (error) {
      console.error("Add To Cart Error:", error);
      toast.error("Unable to add product to cart.");
    }
  };

  // CART BUTTON CLICK

  const handleCartButtonClick = (e, product) => {
    e.stopPropagation();

    // IMPORTANT: Check login before checking the cart
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }

    const addedToCart = isProductInCart(product._id);

    if (addedToCart) {
      navigate("/cart");
      return;
    }

    handleAddToCart(e, product);
  };

  // PRODUCT CARD CLICK

  const handleProductClick = (product) => {
    if (!product?._id) {
      console.error("Product ID is missing");
      return;
    }

    navigate(`/each-item/${product._id}`);
  };

  // SEARCH PRODUCTS
  // Search across ALL products fetched from the backend.
  // While searching, show every matching product and hide pagination.

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

  const isSearching = searchTerm.trim().length > 0;

  // Show only 8 products on each page, including search results.
  const filteredTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / limit)
  );

  const displayedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit
  );

  // LOADING

  if (loading) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>Loading products...</h2>
        </div>

        <ToastContainer />
      </>
    );
  }

  // ERROR

  if (error) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>{error}</h2>
        </div>

        <ToastContainer />
      </>
    );
  }

  
  // PRODUCTS PAGE

  return (
    <>
      <Navbar />

      <ToastContainer />

      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          backgroundColor: "#f5f5f5",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          Products
        </h1>

        {/* SEARCH PRODUCTS */}
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto 30px",
            position: "relative",
          }}
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, description or seller..."
            aria-label="Search products"
            style={{
              width: "100%",
              padding: "13px 16px 13px 42px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              fontSize: "15px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              color: "#777",
            }}
          >
            🔍
          </span>
        </div>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
            }}
          >
            <h2>No products found</h2>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "45px 20px",
              backgroundColor: "#fff",
              borderRadius: "10px",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <h2>No matching products found</h2>
            <p style={{ color: "#666" }}>
              Try another product name, category, description or seller.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#198754",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
          <p
            style={{
              maxWidth: "1200px",
              margin: "0 auto 15px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            {isSearching
              ? `Found ${filteredProducts.length} matching product(s) — showing ${displayedProducts.length} on this page`
              : `Showing ${displayedProducts.length} of ${filteredProducts.length} product(s)`}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, 280px)",
              justifyContent: "center",
              gap: "25px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {displayedProducts.map((product) => {
              const addedToCart = isProductInCart(product._id);

              return (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    padding: "25px",
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    width: "280px",
                    height: "500px",
                    minWidth: "280px",
                    maxWidth: "280px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* PRODUCT NAME */}
                  <h2
                    style={{
                      marginBottom: "15px",
                      minHeight: "58px",
                      maxHeight: "58px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {product.name}
                  </h2>

                  {/* PRICE */}
                  <h3
                    style={{
                      color: "#e4250f",
                      marginBottom: "12px",
                    }}
                  >
                    ₹{product.price}
                  </h3>

                  {/* CATEGORY */}
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>

                  {/* DESCRIPTION */}
                  <p
                    style={{
                      color: "#666",
                      lineHeight: "1.5",
                      overflowWrap: "anywhere",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    <strong>Description:</strong>{" "}
                    {product.description}
                  </p>

                  {/* STOCK */}
                  <p>
                    <strong>Stock:</strong> {product.stock}
                  </p>

                  {/* SELLER */}
                  {product.userId && (
                    <p>
                      <strong>Seller:</strong>{" "}
                      {product.userId.name ||
                        product.userId.email ||
                        "Seller"}
                    </p>
                  )}

                  {/* ADD TO CART */}
                  <button
                    type="button"
                    onClick={(e) => handleCartButtonClick(e, product)}
                    style={{
                      marginTop: "auto",
                      padding: "12px 20px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: addedToCart
                        ? "#6c757d"
                        : "#198754",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {addedToCart ? "Added to Cart" : "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
          </>
        )}

        {/* PAGINATION */}
        {filteredProducts.length > limit && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((previous) => Math.max(previous - 1, 1))
              }
              style={{
                padding: "8px 18px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
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
                setPage((previous) => Math.min(previous + 1, filteredTotalPages))
              }
              style={{
                padding: "8px 18px",
                cursor:
                  page === filteredTotalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* LOGIN REQUIRED MODAL */}

      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
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
            aria-labelledby="login-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              color: "#222",
              padding: "30px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              boxSizing: "border-box",
            }}
          >
            {/* MODAL ICON */}
            <div
              style={{
                width: "60px",
                height: "60px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                backgroundColor: "#e8f5e9",
                color: "#198754",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              !
            </div>

            <h2
              id="login-modal-title"
              style={{
                margin: "0 0 12px",
                fontSize: "24px",
              }}
            >
              Login Required
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "15px",
                lineHeight: "1.6",
                marginBottom: "25px",
              }}
            >
              Please log in to your account before adding products
              to your cart.
            </p>

            {/* MODAL BUTTONS */}
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
                onClick={() => setShowLoginModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f1f1f1",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#198754",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
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
