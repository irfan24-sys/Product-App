
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders } from "../api/orderApi";
import Navbar from "../components/Navbar";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (
    ["confirmed", "delivered", "paid", "completed"].includes(
      normalizedStatus
    )
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    ["pending", "processing", "shipped"].includes(
      normalizedStatus
    )
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (
    ["cancelled", "failed", "rejected"].includes(
      normalizedStatus
    )
  ) {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#e2e8f0",
    color: "#334155",
  };
};

const StatusBadge = ({ label, value }) => (
  <div className="seller-status-item">
    <span className="seller-status-label">{label}</span>
    <span
      className="seller-status-badge"
      style={getStatusStyle(value)}
    >
      {value || "N/A"}
    </span>
  </div>
);

const SellerOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSellerOrders();

        if (!isMounted) return;

        if (response.success) {
          setOrders(
            Array.isArray(response.data) ? response.data : []
          );
        } else {
          setError(
            response.message || "Failed to fetch orders."
          );
        }
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.message ||
            "Unable to load orders. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    const orderId = String(order._id || "").toLowerCase();
    const customerName = String(
      order.deliveryAddress?.fullName || ""
    ).toLowerCase();

    const productNames = (order.items || [])
      .map((item) => item.name || "")
      .join(" ")
      .toLowerCase();

    return (
      orderId.includes(query) ||
      customerName.includes(query) ||
      productNames.includes(query)
    );
  });

  const totalItemsSold = orders.reduce(
    (total, order) =>
      total +
      (order.items || []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
      ),
    0
  );

  const totalSellerRevenue = orders.reduce(
    (total, order) =>
      total + (Number(order.sellerSubtotal) || 0),
    0
  );

  if (loading) {
    return (
      <>
        <Navbar />

        <style>{`
          .seller-orders-loader {
            min-height: 65vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #475569;
          }
          .seller-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid #dbeafe;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: seller-spin 0.8s linear infinite;
          }
          @keyframes seller-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div className="seller-orders-loader">
          <div className="seller-spinner" />
          <h5>Loading customer orders...</h5>
          <p>Please wait a moment.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <style>{`
        .seller-orders-page {
          min-height: calc(100vh - 70px);
          background: #f4f7fb;
          padding: 32px 20px 50px;
          color: #172033;
        }

        .seller-orders-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .seller-orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .seller-orders-eyebrow {
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .seller-orders-title {
          font-size: clamp(25px, 4vw, 34px);
          font-weight: 800;
          letter-spacing: -0.8px;
          margin: 0;
          color: #172033;
        }

        .seller-orders-subtitle {
          color: #64748b;
          margin: 9px 0 0;
          font-size: 14px;
        }

        .seller-back-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #dbe3ef;
          background: #fff;
          color: #334155;
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .seller-back-button:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }

        .seller-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .seller-stat-card {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 5px 18px rgba(15, 23, 42, 0.035);
          min-width: 0;
        }

        .seller-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 17px;
        }

        .seller-stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }

        .seller-stat-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          font-size: 20px;
        }

        .seller-stat-value {
          font-size: clamp(23px, 3vw, 30px);
          font-weight: 800;
          letter-spacing: -0.6px;
          overflow-wrap: anywhere;
        }

        .seller-stat-note {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 6px;
        }

        .seller-orders-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .seller-orders-toolbar h2 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
        }

        .seller-orders-count {
          font-size: 13px;
          color: #64748b;
          margin-top: 5px;
        }

        .seller-search-wrap {
          position: relative;
          width: min(100%, 350px);
        }

        .seller-orders-search {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 14px 12px 42px;
          border: 1px solid #dbe3ef;
          border-radius: 11px;
          outline: none;
          background: #fff;
          font-size: 14px;
          color: #172033;
        }

        .seller-orders-search:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .seller-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .seller-order-card {
          background: #fff;
          border: 1px solid #e6ebf3;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 6px 22px rgba(15, 23, 42, 0.035);
        }

        .seller-order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          padding: 20px 22px;
          background: #fbfcfe;
          border-bottom: 1px solid #edf1f7;
        }

        .seller-order-id-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .seller-order-id {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          overflow-wrap: anywhere;
        }

        .seller-order-date {
          color: #64748b;
          font-size: 12px;
          margin-top: 6px;
        }

        .seller-order-total-label {
          color: #64748b;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .seller-order-total {
          color: #15803d;
          font-size: 23px;
          font-weight: 800;
        }

        .seller-order-body {
          padding: 22px;
        }

        .seller-section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 800;
          color: #334155;
          margin: 0 0 16px;
        }

        .seller-order-item {
          display: grid;
          grid-template-columns: 90px minmax(0, 1fr) auto;
          gap: 17px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #edf1f7;
        }

        .seller-order-item:first-of-type {
          padding-top: 0;
        }

        .seller-order-item:last-child {
          border-bottom: none;
        }

        .seller-product-image {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
        }

        .seller-product-placeholder {
          width: 90px;
          height: 90px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f1f5f9;
          color: #94a3b8;
          font-size: 12px;
          text-align: center;
        }

        .seller-product-name {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 7px;
          overflow-wrap: anywhere;
        }

        .seller-product-category {
          color: #64748b;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .seller-product-pricing {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          color: #475569;
          font-size: 13px;
        }

        .seller-item-subtotal {
          text-align: right;
          white-space: nowrap;
          color: #172033;
          font-weight: 800;
          font-size: 15px;
        }

        .seller-item-subtotal small {
          display: block;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 5px;
        }

        .seller-order-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 18px;
        }

        .seller-detail-panel {
          padding: 18px;
          background: #f8fafc;
          border: 1px solid #edf1f7;
          border-radius: 12px;
          min-width: 0;
        }

        .seller-detail-title {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
          margin-bottom: 13px;
        }

        .seller-address-name {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 7px;
        }

        .seller-address-text {
          font-size: 13px;
          color: #64748b;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .seller-payment-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid #e8edf5;
          font-size: 13px;
        }

        .seller-payment-row:last-child {
          border-bottom: none;
        }

        .seller-payment-label {
          color: #64748b;
        }

        .seller-payment-value {
          font-weight: 700;
          color: #334155;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .seller-status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 9px 0;
          border-bottom: 1px solid #e8edf5;
          font-size: 13px;
        }

        .seller-status-item:last-child {
          border-bottom: none;
        }

        .seller-status-label {
          color: #64748b;
        }

        .seller-status-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
          overflow-wrap: anywhere;
        }

        .seller-empty-state {
          background: #fff;
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          text-align: center;
          padding: 55px 20px;
        }

        .seller-empty-icon {
          width: 66px;
          height: 66px;
          border-radius: 18px;
          background: #eff6ff;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          font-size: 30px;
        }

        .seller-empty-state h3 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .seller-empty-state p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .seller-error-state {
          max-width: 650px;
          margin: 40px auto;
          background: #fff;
          border: 1px solid #fecaca;
          border-radius: 14px;
          padding: 25px;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          .seller-orders-page {
            padding: 24px 14px 35px;
          }

          .seller-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .seller-stat-card {
            padding: 17px;
          }

          .seller-stat-top {
            margin-bottom: 10px;
          }

          .seller-order-card-header,
          .seller-order-body {
            padding: 17px;
          }

          .seller-order-details-grid {
            grid-template-columns: 1fr;
          }

          .seller-search-wrap {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .seller-orders-header {
            align-items: stretch;
          }

          .seller-back-button {
            width: 100%;
          }

          .seller-order-item {
            grid-template-columns: 66px minmax(0, 1fr);
            gap: 12px;
          }

          .seller-product-image,
          .seller-product-placeholder {
            width: 66px;
            height: 72px;
          }

          .seller-item-subtotal {
            grid-column: 2;
            text-align: left;
            white-space: normal;
            margin-top: -3px;
          }

          .seller-product-pricing {
            gap: 7px;
          }

          .seller-order-total {
            font-size: 21px;
          }
        }
      `}</style>

      <main className="seller-orders-page">
        <div className="seller-orders-container">
          {/* PAGE HEADER */}

          <header className="seller-orders-header">
            <div>
              <div className="seller-orders-eyebrow">
                Seller Workspace
              </div>

              <h1 className="seller-orders-title">
                Customer Orders
              </h1>

              <p className="seller-orders-subtitle">
                Track orders and review the products customers
                purchased from you.
              </p>
            </div>

            <button
              type="button"
              className="seller-back-button"
              onClick={() => navigate("/seller-dashboard")}
            >
              <span aria-hidden="true">←</span>
              Back to Dashboard
            </button>
          </header>

          {/* SUMMARY CARDS */}

          <section className="seller-stats-grid">
            <div className="seller-stat-card">
              <div className="seller-stat-top">
                <span className="seller-stat-label">
                  Orders Received
                </span>

                <span
                  className="seller-stat-icon"
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  ▤
                </span>
              </div>

              <div className="seller-stat-value">
                {orders.length}
              </div>

              <div className="seller-stat-note">
                Orders containing your products
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-top">
                <span className="seller-stat-label">
                  Items Ordered
                </span>

                <span
                  className="seller-stat-icon"
                  style={{
                    background: "#f3e8ff",
                    color: "#7e22ce",
                  }}
                >
                  ◫
                </span>
              </div>

              <div className="seller-stat-value">
                {totalItemsSold}
              </div>

              <div className="seller-stat-note">
                Total quantity across your orders
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-top">
                <span className="seller-stat-label">
                  Order Value
                </span>

                <span
                  className="seller-stat-icon"
                  style={{
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  ₹
                </span>
              </div>

              <div className="seller-stat-value">
                {formatCurrency(totalSellerRevenue)}
              </div>

              <div className="seller-stat-note">
                Combined subtotal of your ordered products
              </div>
            </div>
          </section>

          {/* ORDERS TOOLBAR */}

          <section className="seller-orders-toolbar">
            <div>
              <h2>Recent Orders</h2>

              <div className="seller-orders-count">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"} found
              </div>
            </div>

            <div className="seller-search-wrap">
              <span className="seller-search-icon" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                className="seller-orders-search"
                placeholder="Search order, customer, product..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search orders"
              />
            </div>
          </section>

          {/* ERROR STATE */}

          {error && (
            <div className="seller-error-state" role="alert">
              <h3>Unable to load orders</h3>

              <p>{error}</p>

              <button
                type="button"
                className="seller-back-button"
                onClick={() => window.location.reload()}
                style={{ marginTop: "15px" }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}

          {!error && filteredOrders.length === 0 && (
            <div className="seller-empty-state">
              <div className="seller-empty-icon">
                {search ? "⌕" : "▤"}
              </div>

              <h3>
                {search ? "No matching orders" : "No orders yet"}
              </h3>

              <p>
                {search
                  ? "Try another order ID, customer name, or product name."
                  : "When customers order your products, their orders will appear here."}
              </p>
            </div>
          )}

          {/* ORDER CARDS */}

          {!error &&
            filteredOrders.map((order) => (
              <article
                className="seller-order-card"
                key={order._id}
              >
                {/* ORDER HEADER */}

                <div className="seller-order-card-header">
                  <div>
                    <div className="seller-order-id-label">
                      Order Reference
                    </div>

                    <div className="seller-order-id">
                      #{String(order._id || "").slice(-12).toUpperCase()}
                    </div>

                    <div className="seller-order-date">
                      Placed on {formatDate(order.createdAt)}
                    </div>
                  </div>

                  <div>
                    <div className="seller-order-total-label">
                      Your Order Subtotal
                    </div>

                    <div className="seller-order-total">
                      {formatCurrency(order.sellerSubtotal)}
                    </div>
                  </div>
                </div>

                <div className="seller-order-body">
                  {/* PRODUCTS */}

                  <h3 className="seller-section-title">
                    <span aria-hidden="true">▣</span>
                    Ordered Products
                  </h3>

                  {(order.items || []).map((item, index) => (
                    <div
                      className="seller-order-item"
                      key={item.productId || index}
                    >
                      

                      <div>
                        <h4 className="seller-product-name">
                          {item.name || "Unnamed product"}
                        </h4>

                        <div className="seller-product-category">
                          {item.category || "Uncategorized"}
                        </div>

                        <div className="seller-product-pricing">
                          <span>
                            Price: {formatCurrency(item.price)}
                          </span>

                          <span>
                            Qty: {Number(item.quantity) || 0}
                          </span>
                        </div>
                      </div>

                      <div className="seller-item-subtotal">
                        <small>Item Subtotal</small>

                        {formatCurrency(
                          item.subtotal ??
                            Number(item.price || 0) *
                              Number(item.quantity || 0)
                        )}
                      </div>
                    </div>
                  ))}

                  {/* DELIVERY AND PAYMENT DETAILS */}

                  <div className="seller-order-details-grid">
                    <section className="seller-detail-panel">
                      <h3 className="seller-detail-title">
                        Delivery Details
                      </h3>

                      <div className="seller-address-name">
                        {order.deliveryAddress?.fullName || "Customer"}
                      </div>

                      <div className="seller-address-text">
                        {[
                          order.deliveryAddress?.houseName,
                          order.deliveryAddress?.street,
                          order.deliveryAddress?.city,
                          order.deliveryAddress?.state,
                          order.deliveryAddress?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address not available"}
                      </div>

                      {order.deliveryAddress?.phone && (
                        <div className="seller-address-text">
                          Phone: {order.deliveryAddress.phone}
                        </div>
                      )}
                    </section>

                    <section className="seller-detail-panel">
                      <h3 className="seller-detail-title">
                        Payment & Status
                      </h3>

                      <div className="seller-payment-row">
                        <span className="seller-payment-label">
                          Payment Method
                        </span>

                        <span className="seller-payment-value">
                          {order.paymentMethod || "N/A"}
                        </span>
                      </div>

                      <StatusBadge
                        label="Payment"
                        value={order.paymentStatus}
                      />

                      <StatusBadge
                        label="Order"
                        value={order.orderStatus}
                      />
                    </section>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </main>
    </>
  );
};

export default SellerOrders;
