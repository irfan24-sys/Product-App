
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSellerProducts,
  deleteSellerProduct,
} from "../api/sellerdashApi";

import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const imagePath = image.replace(/\\/g, "/").replace(/^\//, "");
  return `${BACKEND_URL}/${imagePath}`;
};

function SellerDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  // FETCH SELLER PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await getSellerProducts();
        const sellerProducts = response.data || [];

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
          error.response?.data?.message || "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // SEARCH PRODUCTS
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      String(product.price ?? "").toLowerCase().includes(search)
    );
  });

  // DASHBOARD SUMMARY
  const totalCategories = new Set(
    products.map((product) => product.category).filter(Boolean)
  ).size;

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage)
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  // DELETE MODAL
  const openDeleteModal = (id) => {
    setSelectedProductId(id);
    setShowModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setSelectedProductId(null);
    setShowModal(false);
  };

  // DELETE PRODUCT
  const confirmDelete = async () => {
    if (!selectedProductId || deleting) return;

    try {
      setDeleting(true);

      await deleteSellerProduct(selectedProductId);

      const updatedProducts = products.filter(
        (product) => product._id !== selectedProductId
      );

      setProducts(updatedProducts);

      const search = searchTerm.trim().toLowerCase();

      const remainingFilteredProducts = updatedProducts.filter(
        (product) =>
          !search ||
          product.name?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          String(product.price ?? "").toLowerCase().includes(search)
      );

      const newTotalPages = Math.ceil(
        remainingFilteredProducts.length / productsPerPage
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
        error.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setDeleting(false);
    }
  };

  // EDIT PRODUCT
  const handleEdit = (id) => {
    navigate(`/add-product?id=${id}`);
  };

  // LOADING
  if (loading) {
    return (
      <>
        <Navbar />

        <div className="seller-loading">
          <div className="seller-spinner"></div>
          <h3>Loading your dashboard...</h3>
        </div>

        <SellerDashboardStyles />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="seller-dashboard">
        <div className="seller-container">

          {/* HEADER */}
          <section className="seller-header">
            <div>
              <span className="seller-eyebrow">
                SELLER MANAGEMENT
              </span>

              <h1>Seller Dashboard</h1>

              <p>
                Manage your products and keep track of your store.
              </p>
            </div>

            <div className="seller-header-actions">
              <button
                className="seller-orders-btn"
                onClick={() => navigate("/seller-orders")}
              >
                <span>▤</span> Customer Orders
              </button>

              <button
                className="seller-add-btn"
                onClick={() => navigate("/add-product")}
              >
                <span>＋</span> Add Product
              </button>
            </div>
          </section>

          {/* SUMMARY CARDS */}
          <section className="seller-stats">
            <div className="seller-stat-card">
              <div className="seller-stat-icon products-icon">
                <span>▦</span>
              </div>

              <div>
                <p>Total Products</p>
                <h2>{products.length}</h2>
                <span>Products in your store</span>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-icon category-icon">
                <span>◇</span>
              </div>

              <div>
                <p>Categories</p>
                <h2>{totalCategories}</h2>
                <span>Different product categories</span>
              </div>
            </div>
          </section>

          {/* PRODUCTS SECTION */}
          <section className="seller-products-section">
            <div className="seller-section-header">
              <div>
                <h2>My Products</h2>
                <p>View and manage your listed products.</p>
              </div>

              {products.length > 0 && (
                <span className="seller-product-count">
                  {products.length} Products
                </span>
              )}
            </div>

            {/* SEARCH */}
            {products.length > 0 && (
              <div className="seller-search-wrapper">
                <span className="seller-search-icon">⌕</span>

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by product name, category or description..."
                  aria-label="Search products"
                />

                {searchTerm && (
                  <button
                    className="seller-clear-search"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* EMPTY PRODUCTS */}
            {products.length === 0 ? (
              <div className="seller-empty">
                <div className="seller-empty-icon">▦</div>

                <h2>No products yet</h2>

                <p>
                  Start building your store by adding your first product.
                </p>

                <button
                  className="seller-add-btn"
                  onClick={() => navigate("/add-product")}
                >
                  ＋ Add Your First Product
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="seller-empty">
                <div className="seller-empty-icon">⌕</div>

                <h2>No matching products</h2>

                <p>
                  Try searching with another product name or category.
                </p>

                <button
                  className="seller-reset-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                <div className="seller-results-info">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + productsPerPage,
                    filteredProducts.length
                  )}{" "}
                  of {filteredProducts.length} products
                </div>

                {/* PRODUCT GRID */}
                <div className="seller-product-grid">
                  {currentProducts.map((product) => (
                    <article
                      className="seller-product-card"
                      key={product._id}
                    >
                      {/* IMAGE */}
                      <div className="seller-card-image">
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name || "Product"}
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
                          className="seller-image-fallback"
                          style={{
                            display: product.image ? "none" : "flex",
                          }}
                        >
                          <span>▦</span>
                          <p>Image not available</p>
                        </div>

                        <span className="seller-card-category">
                          {product.category || "General"}
                        </span>
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="seller-card-content">
                        <h3>{product.name}</h3>

                        <p className="seller-card-description">
                          {product.description ||
                            "No description available."}
                        </p>

                        <div className="seller-card-price">
                          ₹
                          {Number(product.price || 0).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="seller-card-actions">
                          <button
                            className="seller-edit-btn"
                            onClick={() => handleEdit(product._id)}
                          >
                            <span>✎</span> Edit
                          </button>

                          <button
                            className="seller-delete-btn"
                            onClick={() => openDeleteModal(product._id)}
                          >
                            <span>⌫</span> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="seller-pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((page) => Math.max(page - 1, 1));
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                    >
                      ← Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        className={
                          currentPage === page ? "active" : ""
                        }
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
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
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {showModal && (
        <div
          className="seller-modal-overlay"
          onClick={closeDeleteModal}
        >
          <div
            className="seller-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="seller-modal-icon">!</div>

            <h2 id="delete-product-title">
              Delete Product?
            </h2>

            <p>
              Are you sure you want to delete this product?
              This action cannot be undone.
            </p>

            <div className="seller-modal-actions">
              <button
                className="seller-cancel-btn"
                disabled={deleting}
                onClick={closeDeleteModal}
              >
                Cancel
              </button>

              <button
                className="seller-confirm-delete-btn"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <SellerDashboardStyles />
    </>
  );
}

// STYLES
function SellerDashboardStyles() {
  return (
    <style>{`
      .seller-dashboard {
        min-height: calc(100vh - 70px);
        padding: 38px 24px 60px;
        background: #fffaf8;
        box-sizing: border-box;
      }

      .seller-container {
        max-width: 1250px;
        margin: 0 auto;
      }

      .seller-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 22px;
        margin-bottom: 30px;
      }

      .seller-eyebrow {
        color: #b95f43;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .seller-header h1 {
        margin: 8px 0;
        color: #30231f;
        font-size: 32px;
        font-weight: 800;
      }

      .seller-header p {
        margin: 0;
        color: #85736b;
        font-size: 14px;
      }

      .seller-header-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .seller-header-actions button,
      .seller-add-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 18px;
        border: none;
        border-radius: 9px;
        color: white;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .seller-orders-btn {
        background: #30231f;
      }

      .seller-orders-btn:hover {
        background: #4b3730;
        transform: translateY(-2px);
      }

      .seller-add-btn {
        background: #b95f43;
      }

      .seller-add-btn:hover {
        background: #98482f;
        transform: translateY(-2px);
      }

      .seller-header-actions button span {
        font-size: 18px;
      }

      .seller-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-bottom: 35px;
      }

      .seller-stat-card {
        display: flex;
        align-items: center;
        gap: 17px;
        padding: 22px;
        border: 1px solid #f0e5e0;
        border-radius: 13px;
        background: white;
        box-shadow: 0 4px 18px rgba(80, 45, 30, 0.04);
      }

      .seller-stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        flex-shrink: 0;
        border-radius: 12px;
        font-size: 27px;
      }

      .products-icon {
        color: #b95f43;
        background: #fff0e9;
      }

      .category-icon {
        color: #8165b2;
        background: #f1ebfa;
      }

      .seller-stat-card p {
        margin: 0 0 5px;
        color: #81736d;
        font-size: 13px;
      }

      .seller-stat-card h2 {
        margin: 0 0 4px;
        color: #30231f;
        font-size: 26px;
        font-weight: 800;
      }

      .seller-stat-card span {
        color: #a09189;
        font-size: 11px;
      }

      .seller-products-section {
        padding: 25px;
        border: 1px solid #f0e5e0;
        border-radius: 15px;
        background: white;
        box-shadow: 0 5px 25px rgba(80, 45, 30, 0.04);
      }

      .seller-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        flex-wrap: wrap;
        margin-bottom: 22px;
      }

      .seller-section-header h2 {
        margin: 0 0 6px;
        color: #30231f;
        font-size: 22px;
      }

      .seller-section-header p {
        margin: 0;
        color: #918078;
        font-size: 13px;
      }

      .seller-product-count {
        padding: 7px 13px;
        border-radius: 20px;
        background: #fff0e9;
        color: #b95f43;
        font-size: 12px;
        font-weight: 700;
      }

      .seller-search-wrapper {
        position: relative;
        max-width: 550px;
        margin-bottom: 25px;
      }

      .seller-search-wrapper input {
        width: 100%;
        height: 47px;
        padding: 0 45px;
        border: 1px solid #e9ded8;
        border-radius: 9px;
        outline: none;
        background: #fffdfc;
        color: #30231f;
        font-size: 14px;
        box-sizing: border-box;
        transition: 0.2s ease;
      }

      .seller-search-wrapper input:focus {
        border-color: #b95f43;
        box-shadow: 0 0 0 3px rgba(185, 95, 67, 0.1);
      }

      .seller-search-icon {
        position: absolute;
        top: 50%;
        left: 15px;
        transform: translateY(-50%);
        color: #9a8981;
        font-size: 25px;
      }

      .seller-clear-search {
        position: absolute;
        top: 50%;
        right: 13px;
        transform: translateY(-50%);
        border: none;
        background: transparent;
        color: #85736b;
        font-size: 16px;
        cursor: pointer;
      }

      .seller-results-info {
        margin-bottom: 15px;
        color: #918078;
        font-size: 12px;
      }

      .seller-product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
        gap: 20px;
      }

      .seller-product-card {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
        border: 1px solid #f0e5e0;
        border-radius: 13px;
        background: white;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      }

      .seller-product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 28px rgba(80, 45, 30, 0.1);
      }

      .seller-card-image {
        position: relative;
        height: 205px;
        overflow: hidden;
        background: #fff5f0;
      }

      .seller-card-image img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .seller-product-card:hover .seller-card-image img {
        transform: scale(1.04);
      }

      .seller-image-fallback {
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;
        color: #a48c80;
      }

      .seller-image-fallback span {
        font-size: 38px;
      }

      .seller-image-fallback p {
        margin: 0;
        font-size: 12px;
      }

      .seller-card-category {
        position: absolute;
        top: 12px;
        left: 12px;
        max-width: calc(100% - 24px);
        overflow: hidden;
        padding: 6px 10px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.94);
        color: #b95f43;
        font-size: 10px;
        font-weight: 800;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .seller-card-content {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding: 17px;
      }

      .seller-card-content h3 {
        display: -webkit-box;
        min-height: 42px;
        margin: 0 0 9px;
        overflow: hidden;
        color: #30231f;
        font-size: 17px;
        line-height: 1.35;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow-wrap: anywhere;
      }

      .seller-card-description {
        display: -webkit-box;
        min-height: 57px;
        margin: 0 0 13px;
        overflow: hidden;
        color: #887970;
        font-size: 12px;
        line-height: 1.6;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      .seller-card-price {
        margin-bottom: 17px;
        color: #b95f43;
        font-size: 22px;
        font-weight: 800;
      }

      .seller-card-actions {
        display: flex;
        gap: 9px;
        margin-top: auto;
      }

      .seller-card-actions button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex: 1;
        padding: 10px 8px;
        border: none;
        border-radius: 7px;
        color: white;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .seller-edit-btn {
        background: #b95f43;
      }

      .seller-edit-btn:hover {
        background: #98482f;
      }

      .seller-delete-btn {
        background: #fff0ed;
        color: #c34c42 !important;
      }

      .seller-delete-btn:hover {
        background: #f9dcd6;
      }

      .seller-card-actions button span {
        font-size: 15px;
      }

      .seller-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 32px;
      }

      .seller-pagination button {
        min-width: 39px;
        height: 39px;
        padding: 0 12px;
        border: 1px solid #eee1db;
        border-radius: 7px;
        background: white;
        color: #66534d;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;
      }

      .seller-pagination button.active,
      .seller-pagination button:hover:not(:disabled) {
        border-color: #b95f43;
        background: #b95f43;
        color: white;
      }

      .seller-pagination button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .seller-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 65px 20px;
        text-align: center;
      }

      .seller-empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 70px;
        height: 70px;
        margin-bottom: 18px;
        border-radius: 50%;
        background: #fff0e9;
        color: #b95f43;
        font-size: 34px;
      }

      .seller-empty h2 {
        margin: 0 0 9px;
        color: #30231f;
        font-size: 21px;
      }

      .seller-empty p {
        margin: 0 0 22px;
        color: #918078;
        font-size: 13px;
      }

      .seller-reset-btn {
        padding: 11px 20px;
        border: 1px solid #b95f43;
        border-radius: 8px;
        background: white;
        color: #b95f43;
        font-weight: 700;
        cursor: pointer;
      }

      .seller-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 75vh;
        gap: 15px;
        background: #fffaf8;
        color: #66534d;
      }

      .seller-spinner {
        width: 38px;
        height: 38px;
        border: 4px solid #f0ddd5;
        border-top-color: #b95f43;
        border-radius: 50%;
        animation: seller-spin 0.8s linear infinite;
      }

      .seller-loading h3 {
        font-size: 15px;
        font-weight: 600;
      }

      @keyframes seller-spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* DELETE MODAL */
      .seller-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(35, 24, 20, 0.58);
        backdrop-filter: blur(4px);
      }

      .seller-modal {
        width: 100%;
        max-width: 410px;
        padding: 32px;
        border-radius: 16px;
        background: white;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
        text-align: center;
        box-sizing: border-box;
        animation: seller-modal-in 0.2s ease;
      }

      @keyframes seller-modal-in {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .seller-modal-icon {
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

      .seller-modal h2 {
        margin: 0 0 10px;
        color: #30231f;
        font-size: 22px;
      }

      .seller-modal p {
        margin: 0 0 25px;
        color: #81736d;
        font-size: 13px;
        line-height: 1.7;
      }

      .seller-modal-actions {
        display: flex;
        gap: 10px;
      }

      .seller-modal-actions button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }

      .seller-modal-actions button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .seller-cancel-btn {
        background: #81736d;
      }

      .seller-confirm-delete-btn {
        background: #c34c42;
      }

      @media (max-width: 900px) {
        .seller-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 600px) {
        .seller-dashboard {
          padding: 25px 13px 40px;
        }

        .seller-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .seller-header h1 {
          font-size: 26px;
        }

        .seller-header-actions {
          width: 100%;
        }

        .seller-header-actions button {
          flex: 1;
          padding: 12px 10px;
          font-size: 12px;
        }

        .seller-stats {
          grid-template-columns: 1fr;
          gap: 11px;
          margin-bottom: 23px;
        }

        .seller-stat-card {
          padding: 16px;
        }

        .seller-products-section {
          padding: 16px 12px;
        }

        .seller-section-header h2 {
          font-size: 19px;
        }

        .seller-product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .seller-card-image {
          height: 145px;
        }

        .seller-card-content {
          padding: 11px;
        }

        .seller-card-content h3 {
          font-size: 14px;
          min-height: 38px;
        }

        .seller-card-description {
          font-size: 11px;
          min-height: 52px;
        }

        .seller-card-price {
          font-size: 18px;
        }

        .seller-card-actions {
          gap: 5px;
        }

        .seller-card-actions button {
          padding: 9px 5px;
          font-size: 10px;
        }
      }

      @media (max-width: 360px) {
        .seller-product-grid {
          grid-template-columns: 1fr;
        }

        .seller-card-image {
          height: 200px;
        }

        .seller-modal {
          padding: 24px 18px;
        }
      }
    `}</style>
  );
}

export default SellerDashboard;
