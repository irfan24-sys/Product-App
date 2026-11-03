
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSellerProducts,
  deleteSellerProduct,
} from "../api/sellerdashApi";

import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

function SellerDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] =
    useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // ========================================
  // GET SELLER PRODUCTS
  // ========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await getSellerProducts();
        const sellerProducts = response.data || [];

        // Newest products first
        const sortedProducts = [...sellerProducts].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        setProducts(sortedProducts);
        setCurrentPage(1);
      } catch (error) {
        console.error("Get Seller Products Error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ========================================
  // PAGINATION CALCULATIONS
  // ========================================

  // Search across all products belonging to this seller
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      String(product.price ?? "").toLowerCase().includes(search) ||
      String(product.stock ?? "").toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // ========================================
  // DELETE MODAL
  // ========================================

  const openDeleteModal = (id) => {
    setSelectedProductId(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setSelectedProductId(null);
    setShowModal(false);
  };

  // ========================================
  // CONFIRM DELETE
  // ========================================

  const confirmDelete = async () => {
    if (!selectedProductId || deleting) return;

    try {
      setDeleting(true);

      await deleteSellerProduct(selectedProductId);

      const updatedProducts = products.filter(
        (product) => product._id !== selectedProductId
      );

      setProducts(updatedProducts);

      // Keep the current page valid after deletion
      const newTotalPages = Math.ceil(
        updatedProducts.length / productsPerPage
      );

      setCurrentPage((page) =>
        Math.min(page, Math.max(newTotalPages, 1))
      );

      setShowModal(false);
      setSelectedProductId(null);

      toast.success("Product deleted successfully", {
        autoClose: 1500,
      });
    } catch (error) {
      console.error("Delete Product Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // EDIT PRODUCT
  // ========================================

  const handleEdit = (id) => {
    navigate(`/add-product?id=${id}`);
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: "calc(100vh - 70px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <h2>Loading products...</h2>
        </div>
      </>
    );
  }

  // ========================================
  // MAIN DASHBOARD
  // ========================================

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          backgroundColor: "#f5f5f5",
          padding: "30px",
          boxSizing: "border-box",
        }}
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#222",
            }}
          >
            Seller Dashboard
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {/* VIEW CUSTOMER ORDERS */}

            <button
              type="button"
              onClick={() => navigate("/seller-orders")}
              style={{
                padding: "10px 18px",
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              View Customer Orders
            </button>

            {/* ADD PRODUCT */}

            <button
              type="button"
              onClick={() => navigate("/add-product")}
              style={{
                padding: "10px 18px",
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* SEARCH SELLER PRODUCTS */}
        {products.length > 0 && (
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto 25px",
              position: "relative",
            }}
          >
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
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search your products by name, category or description..."
              aria-label="Search your products"
              style={{
                width: "100%",
                padding: "13px 16px 13px 44px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                outline: "none",
                fontSize: "15px",
                backgroundColor: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* ========================================
            NO PRODUCTS / SEARCH RESULTS
        ======================================== */}

        {products.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "50px 20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2>No products found</h2>

            <p>You haven't added any products yet.</p>

            <button
              type="button"
              onClick={() => navigate("/add-product")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Add Your First Product
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              padding: "45px 20px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "700px",
              margin: "0 auto",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2>No matching products found</h2>
            <p style={{ color: "#666" }}>
              Try a different product name, category or description.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              style={{
                padding: "10px 18px",
                backgroundColor: "#198754",
                color: "white",
                border: "none",
                borderRadius: "6px",
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
              Showing {startIndex + 1}–
              {Math.min(startIndex + productsPerPage, filteredProducts.length)}
              {" "}of {filteredProducts.length} product(s)
            </p>

            {/* ========================================
                PRODUCTS GRID
            ======================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(100%, 280px), 280px))",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              {currentProducts.map((product) => (
                <div
                  key={product._id}
                  style={{
                    width: "100%",
                    maxWidth: "280px",
                    minHeight: "400px",
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    overflowWrap: "anywhere",
                  }}
                >
                  {/* PRODUCT NAME */}

                  <h2
                    style={{
                      marginTop: 0,
                      marginBottom: "15px",
                      color: "#222",
                      fontSize: "22px",
                    }}
                  >
                    {product.name}
                  </h2>

                  {/* PRICE */}

                  <p>
                    <strong>Price:</strong>{" "}
                    ₹{product.price}
                  </p>

                  {/* CATEGORY */}

                  <p>
                    <strong>Category:</strong>{" "}
                    {product.category}
                  </p>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Description:</strong>{" "}
                    {product.description}
                  </p>

                  {/* STOCK */}

                  <p>
                    <strong>Stock:</strong>{" "}
                    {product.stock}
                  </p>

                  {/* EDIT AND DELETE BUTTONS */}

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "15px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEdit(product._id)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        backgroundColor: "#0d6efd",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openDeleteModal(product._id)
                      }
                      style={{
                        flex: 1,
                        padding: "10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ========================================
                PAGINATION
            ======================================== */}

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "35px",
                  flexWrap: "wrap",
                }}
              >
                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor:
                      currentPage === 1 ? "#ccc" : "#198754",
                    color: "white",
                    cursor:
                      currentPage === 1
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "600",
                  }}
                >
                  Previous
                </button>

                {/* PAGE NUMBERS */}

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor:
                        currentPage === page
                          ? "#198754"
                          : "#e9ecef",
                      color:
                        currentPage === page
                          ? "white"
                          : "#222",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {page}
                  </button>
                ))}

                {/* NEXT */}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((page) =>
                      Math.min(page + 1, totalPages)
                    );

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor:
                      currentPage === totalPages
                        ? "#ccc"
                        : "#198754",
                    color: "white",
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "600",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================
          DELETE CONFIRMATION MODAL
      ======================================== */}

      {showModal && (
        <div
          onClick={closeDeleteModal}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                margin: "0 auto 15px",
                borderRadius: "50%",
                backgroundColor: "#fff0f0",
                color: "#dc3545",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              !
            </div>

            <h2
              id="delete-product-title"
              style={{
                marginTop: 0,
                color: "#222",
              }}
            >
              Delete Product?
            </h2>

            <p
              style={{
                color: "#555",
                lineHeight: "1.6",
                marginBottom: "25px",
              }}
            >
              Are you sure you want to delete this product?
              This action cannot be undone.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {/* CANCEL */}

              <button
                type="button"
                disabled={deleting}
                onClick={closeDeleteModal}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              {/* CONFIRM DELETE */}

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SellerDashboard;
