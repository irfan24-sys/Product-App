
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getMyOrders } from "../api/orderApi";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const BACKEND_URL = (
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");

  
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return "";

    const value = image.trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) return value;

    const normalizedPath = value.replace(/\\/g, "/").replace(/^\/+/, "");
    const uploadsIndex = normalizedPath.toLowerCase().lastIndexOf("uploads/");

    // If the saved value contains an absolute folder path, keep only uploads/...
    const relativePath = uploadsIndex >= 0
      ? normalizedPath.slice(uploadsIndex)
      : `uploads/${normalizedPath.split("/").pop()}`;

    return `${BACKEND_URL}/${relativePath
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/")}`;
  };

  const getOrderItemImage = (item) => {
    // New orders should have item.image. The other fields support older API shapes.
    const image =
      item?.image ||
      item?.productImage ||
      (typeof item?.productId === "object" ? item.productId?.image : "");

    return getImageUrl(image);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyOrders();

        if (response?.success) {
          setOrders(response.data || []);
        } else {
          setError(
            response?.message || "Unable to load orders"
          );
        }
      } catch (err) {
        console.error(
          "Fetch Orders Error:",
          err.response?.data || err.message
        );

        setError(
          err.response?.data?.message ||
          "Unable to load your orders. Please log in and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatLabel = (value = "") =>
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <>
      <Navbar />

      <main className="my-orders-page">
        <div className="my-orders-container">
          <header className="my-orders-header">
            <div>
              <span className="orders-eyebrow">
                YOUR ACCOUNT
              </span>

              <h1>My Orders</h1>

              <p>
                Track your purchases and view your ordered
                product details.
              </p>
            </div>

            <Link
              to="/products"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>
          </header>

          {loading && (
            <div className="orders-message">
              Loading your orders...
            </div>
          )}

          {!loading && error && (
            <div className="orders-message orders-error">
              <h3>Unable to load orders</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="orders-empty">
              <div className="orders-empty-icon">📦</div>

              <h2>No orders yet</h2>

              <p>
                Once you place an order, its details will
                appear here.
              </p>

              <Link
                to="/products"
                className="continue-shopping"
              >
                Explore Products
              </Link>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article
                  className="order-card"
                  key={order._id}
                >
                  <div className="order-card-header">
                    <div className="order-reference">
                      <span>ORDER ID</span>
                      <strong>
                        #{order._id.slice(-8).toUpperCase()}
                      </strong>
                      <small>
                        {formatDate(order.createdAt)}
                      </small>
                    </div>

                    <span
                      className={`order-status status-${order.orderStatus}`}
                    >
                      {formatLabel(order.orderStatus)}
                    </span>
                  </div>

                  <div className="ordered-items">
                    <h3>Ordered Items</h3>

                    {order.items?.map((item, index) => (
                      <div
                        className="ordered-item"
                        key={`${item.productId}-${index}`}
                      >
                        <div className="ordered-item-image">
                          {getOrderItemImage(item) &&
                          !imageErrors[`${order._id}-${item.productId?._id || item.productId}-${index}`] ? (
                            <img
                              src={getOrderItemImage(item)}
                              alt={item.name || "Ordered product"}
                              loading="lazy"
                              onError={(event) => {
                                console.error("Order product image failed to load:", {
                                  savedImage: item.image,
                                  imageUrl: event.currentTarget.src,
                                });
                                setImageErrors((previous) => ({
                                  ...previous,
                                  [`${order._id}-${item.productId?._id || item.productId}-${index}`]: true,
                                }));
                              }}
                            />
                          ) : (
                            <span aria-label="Product image unavailable">📦</span>
                          )}
                        </div>

                        <div className="ordered-item-info">
                          <h4>{item.name}</h4>

                          <span className="ordered-category">
                            {item.category || "Product"}
                          </span>

                          <p>
                            Quantity: {item.quantity}
                          </p>

                          <p>
                            Unit price: {formatPrice(item.price)}
                          </p>
                        </div>

                        <strong className="ordered-subtotal">
                          {formatPrice(item.subtotal)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-details-grid">
                    <div className="order-detail">
                      <span>Payment Method</span>
                      <strong>
                        {formatLabel(order.paymentMethod)}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Payment Status</span>
                      <strong>
                        {formatLabel(order.paymentStatus)}
                      </strong>
                    </div>

                    <div className="order-detail">
                      <span>Total Items</span>
                      <strong>
                        {order.items?.reduce(
                          (sum, item) =>
                            sum + Number(item.quantity || 0),
                          0
                        ) || 0}
                      </strong>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="order-address">
                      <h3>Delivery Address</h3>

                      <p>
                        <strong>
                          {order.deliveryAddress.fullName}
                        </strong>
                        {" · "}
                        {order.deliveryAddress.phone}
                      </p>

                      <p>
                        {order.deliveryAddress.houseName},{" "}
                        {order.deliveryAddress.street},{" "}
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state} -{" "}
                        {order.deliveryAddress.pincode}
                      </p>
                    </div>
                  )}

                  <div className="order-total">
                    <span>Order Total</span>
                    <strong>
                      {formatPrice(order.totalAmount)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        .my-orders-page {
          min-height: 100vh;
          padding: 36px 20px 60px;
          background: #FFFAF8;
        }

        .my-orders-container {
          max-width: 1050px;
          margin: 0 auto;
        }

        .my-orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .orders-eyebrow {
          color: #B95F43;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .my-orders-header h1 {
          margin: 8px 0;
          color: #30231F;
          font-size: 34px;
        }

        .my-orders-header p {
          margin: 0;
          color: #66534D;
          line-height: 1.6;
        }

        .continue-shopping {
          display: inline-block;
          padding: 12px 18px;
          border-radius: 8px;
          background: #B95F43;
          color: white;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .continue-shopping:hover {
          background: #9F4D35;
          transform: translateY(-1px);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .order-card {
          background: #FFFFFF;
          border: 1px solid #F0E3DD;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(75, 43, 31, 0.06);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 22px 25px;
          background: #FFF5F0;
          border-bottom: 1px solid #F0E3DD;
        }

        .order-reference {
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow-wrap: anywhere;
        }

        .order-reference span,
        .order-detail span {
          color: #927E75;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .order-reference strong {
          color: #30231F;
          font-size: 15px;
        }

        .order-reference small {
          color: #927E75;
          font-size: 12px;
        }

        .order-status {
          padding: 7px 12px;
          border-radius: 20px;
          background: #FCECE5;
          color: #B95F43;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-cancelled {
          background: #FFF0ED;
          color: #B42318;
        }

        .status-shipped {
          background: #F0F1F8;
          color: #48558A;
        }

        .status-delivered {
          background: #FCECE5;
          color: #9F4D35;
        }

        .ordered-items {
          padding: 22px 25px 5px;
        }

        .ordered-items h3,
        .order-address h3 {
          margin: 0 0 15px;
          font-size: 16px;
          color: #30231F;
        }

        .ordered-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #F2E9E4;
        }

        .ordered-item:last-child {
          border-bottom: none;
        }

        .ordered-item-image {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 85px;
          height: 85px;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #EADBD3;
          background: #FFF5F0;
          font-size: 28px;
        }

        .ordered-item-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .ordered-item-info {
          flex: 1;
          min-width: 0;
        }

        .ordered-item-info h4 {
          margin: 0 0 6px;
          color: #30231F;
          font-size: 15px;
          overflow-wrap: anywhere;
        }

        .ordered-category {
          display: inline-block;
          margin-bottom: 7px;
          color: #8B746A;
          font-size: 11px;
        }

        .ordered-item-info p {
          margin: 3px 0;
          color: #66534D;
          font-size: 12px;
        }

        .ordered-subtotal {
          color: #B95F43;
          font-size: 14px;
          white-space: nowrap;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin: 10px 25px 0;
          padding: 20px 0;
          border-top: 1px solid #F2E9E4;
          border-bottom: 1px solid #F2E9E4;
        }

        .order-detail {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .order-detail strong {
          color: #49362E;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .order-address {
          padding: 20px 25px 5px;
        }

        .order-address p {
          margin: 6px 0;
          color: #66534D;
          font-size: 13px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .order-address strong {
          color: #49362E;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-top: 20px;
          padding: 20px 25px;
          background: #FFF5F0;
          border-top: 1px solid #F0E3DD;
        }

        .order-total span {
          color: #49362E;
          font-size: 15px;
          font-weight: 700;
        }

        .order-total strong {
          color: #B95F43;
          font-size: 22px;
        }

        .orders-message,
        .orders-empty {
          padding: 45px 20px;
          text-align: center;
          background: #FFFFFF;
          border: 1px solid #F0E3DD;
          border-radius: 14px;
        }

        .orders-error {
          color: #b42318;
        }

        .orders-empty-icon {
          margin-bottom: 12px;
          font-size: 48px;
        }

        .orders-empty h2 {
          margin: 0 0 8px;
          color: #30231F;
        }

        .orders-empty p {
          margin-bottom: 22px;
          color: #66534D;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .my-orders-page {
            padding: 25px 12px 40px;
          }

          .my-orders-header h1 {
            font-size: 28px;
          }

          .order-card-header {
            padding: 17px;
            align-items: flex-start;
          }

          .ordered-items {
            padding: 18px 15px 5px;
          }

          .ordered-item {
            gap: 10px;
            flex-wrap: wrap;
          }

          .ordered-item-image {
            width: 65px;
            height: 65px;
          }

          .ordered-item-info h4 {
            font-size: 13px;
          }

          .ordered-subtotal {
            margin-left: auto;
          }

          .order-details-grid {
            grid-template-columns: 1fr 1fr;
            margin: 10px 15px 0;
            gap: 18px 12px;
          }

          .order-address {
            padding: 18px 15px 5px;
          }

          .order-total {
            padding: 18px 15px;
          }

          .order-total strong {
            font-size: 19px;
          }
        }
      `}</style>
    </>
  );
}

export default MyOrders;
