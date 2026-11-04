
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { createOrder } from "../api/orderApi";
import Navbar from "../components/Navbar";
import {
  addAddress,
  getAddresses,
  updateAddress,
} from "../api/addressApi";

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

const addressSchema = yup.object({
  fullName: yup.string().trim().min(2, "Full name must contain at least 2 characters").max(100, "Full name cannot exceed 100 characters").required("Full name is required"),
  phone: yup.string().trim().matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number").required("Phone number is required"),
  houseName: yup.string().trim().max(150, "House name cannot exceed 150 characters").required("House name or building is required"),
  street: yup.string().trim().max(150, "Street cannot exceed 150 characters").required("Street or locality is required"),
  city: yup.string().trim().max(100, "City cannot exceed 100 characters").required("City is required"),
  state: yup.string().trim().max(100, "State cannot exceed 100 characters").required("State is required"),
  pincode: yup.string().trim().matches(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code").required("PIN code is required"),
});

const emptyAddress = {
  fullName: "", phone: "", houseName: "", street: "",
  city: "", state: "", pincode: "",
};

function Checkout() {
  // STATES

  const [cart, setCart] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] =
    useState(null);

  const [showAddressModal, setShowAddressModal] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState(null);

  const [selectedPayment, setSelectedPayment] =
    useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderSuccess, setOrderSuccess] =
    useState(false);

  const [savingAddress, setSavingAddress] = useState(false);

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    setError: setAddressError,
    formState: { errors: addressErrors, isSubmitting: isAddressSubmitting },
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: emptyAddress,
    mode: "onTouched",
  });

  const [notice, setNotice] = useState("");

  const showNotice = (message) => {
    setNotice(String(message || "Something went wrong. Please try again."));
  };

  // LOAD CART

  useEffect(() => {
    try {
      const savedCart =
        JSON.parse(
          localStorage.getItem("cart")
        ) || [];

      setCart(
        Array.isArray(savedCart)
          ? savedCart
          : []
      );
    } catch (error) {
      console.error(
        "Cart loading error:",
        error
      );

      setCart([]);
      showNotice("Unable to load your cart. Please refresh the page and try again.");
    }
  }, []);

  // LOAD ADDRESSES
  

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response =
        await getAddresses();

      console.log(
        "Addresses Response:",
        response
      );

      const addressList =
        response?.addresses || [];

      setAddresses(addressList);

      if (
        addressList.length > 0 &&
        !selectedAddress
      ) {
        setSelectedAddress(
          addressList[0]
        );
      }
    } catch (error) {
      console.error(
        "Get Addresses Error:",
        error.response?.data ||
          error.message
      );

      showNotice(
        error.response?.data?.message ||
        error.message ||
        "Unable to load saved addresses. Please try again."
      );
    }
  };

  // RESET ADDRESS FORM

  const resetAddressForm = () => {
    resetAddress(emptyAddress);
    setEditingAddress(null);
  };

  // OPEN ADD ADDRESS MODAL

  const handleAddAddress = () => {
    resetAddressForm();

    setShowAddressModal(true);
  };

  // OPEN EDIT ADDRESS MODAL

  const handleEditAddress = (
    address,
    e
  ) => {
    if (e) {
      e.stopPropagation();
    }

    setEditingAddress(address);

    resetAddress({
      fullName: address.fullName || "",
      phone: address.phone || "",
      houseName: address.houseName || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
    });

    setShowAddressModal(true);
  };

  // CLOSE ADDRESS MODAL

  const closeAddressModal = () => {
    setShowAddressModal(false);

    resetAddressForm();
  };

  // SAVE ADDRESS

  const handleSaveAddress = async (formData) => {
    if (savingAddress) return;

    setSavingAddress(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        houseName: formData.houseName.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const response = editingAddress
        ? await updateAddress(editingAddress._id, payload)
        : await addAddress(payload);

      console.log("Address Save Response:", response);

      if (response?.success) {
        setShowAddressModal(false);
        resetAddressForm();
        await loadAddresses();

        if (response.address) {
          setSelectedAddress(response.address);
        }
      } else {
        showNotice(response?.message || "Failed to save address");
      }
    } catch (error) {
      const responseData = error.response?.data;

      console.error("Save Address Error:", responseData || error.message);

      if (Array.isArray(responseData?.errors)) {
        responseData.errors.forEach((item) => {
          const field = item?.field || item?.path;
          if (field && Object.hasOwn(emptyAddress, field)) {
            setAddressError(field, {
              type: "server",
              message: item.message || item.msg || "Invalid value",
            });
          }
        });
      }

      showNotice(
        responseData?.message || error.message || "Failed to save address"
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // SELECT ADDRESS

  const handleSelectAddress = (
    address
  ) => {
    setSelectedAddress(address);
  };

  // CONFIRM ADDRESS

  const handleConfirmAddress = (
    address,
    e
  ) => {
    if (e) {
      e.stopPropagation();
    }

    setSelectedAddress(address);

    showNotice(
      "Delivery address selected successfully"
    );
  };

  // TOTAL ITEMS

  const totalItems =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );
  // TOTAL PRICE

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  // PLACE ORDER

const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    showNotice("Please select a delivery address");
    return;
  }

  if (!selectedPayment) {
    showNotice("Please select a payment method");
    return;
  }

  if (cart.length === 0) {
    showNotice("Your cart is empty");
    return;
  }

  setPlacingOrder(true);

  try {
    const orderData = {
      items: cart.map((item) => ({
        productId: item._id,
        quantity: Number(item.quantity),
      })),

      deliveryAddress: {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        houseName: selectedAddress.houseName,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      },

      paymentMethod: selectedPayment,
    };

    // Save the order in MongoDB
    const response = await createOrder(orderData);

    if (!response?.success || !response?.data?._id) {
      throw new Error(
        response?.message || "Failed to place order"
      );
    }

    // Clear cart only after successful API response
    localStorage.removeItem("cart");
    setCart([]);

    // Show the existing success page
    setOrderSuccess(true);
  } catch (error) {
    console.error(
      "Place Order Error:",
      error.response?.data || error.message
    );

    showNotice(
      error.response?.data?.message ||
      error.message ||
      "Unable to place order. Please try again."
    );
  } finally {
    setPlacingOrder(false);
  }
};

  // EMPTY CART

  if (
    cart.length === 0 &&
    !orderSuccess
  ) {
    return (
      <>
        <Navbar />

        <div
          className="empty-cart-page"
        >
          <div
            className="empty-cart-box"
          >
            <div className="empty-cart-icon">
              🛒
            </div>

            <h1>
              Your Cart is Empty
            </h1>

            <p>
              Add some products to
              your cart before
              checking out.
            </p>

            <Link
              to="/products"
              className="primary-link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {notice && (
          <div className="notice-overlay" role="presentation" onClick={() => setNotice("")}>
            <section className="notice-modal" role="alertdialog" aria-modal="true"
              aria-labelledby="notice-title" aria-describedby="notice-message"
              onClick={(e) => e.stopPropagation()}>
              <div className="notice-icon" aria-hidden="true">!</div>
              <div className="notice-content">
                <span className="notice-eyebrow">CHECKOUT NOTICE</span>
                <h2 id="notice-title">Please check</h2>
                <p id="notice-message">{notice}</p>
              </div>
              <button type="button" className="notice-ok-btn" onClick={() => setNotice("")}>
                Got it
              </button>
            </section>
          </div>
        )}

        <CheckoutStyles />
      </>
    );
  }

  // ORDER SUCCESS

  if (orderSuccess) {
    return (
      <>
        <Navbar />

        <div
          className="success-page"
        >
          <div
            className="success-box"
          >
            <div
              className="success-icon"
            >
              ✓
            </div>

            <h1>
              Order Placed!
            </h1>

            <p>
              Your order has been
              placed successfully.
            </p>

            <Link
              to="/products"
              className="primary-link"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {notice && (
          <div className="notice-overlay" role="presentation" onClick={() => setNotice("")}>
            <section className="notice-modal" role="alertdialog" aria-modal="true"
              aria-labelledby="notice-title" aria-describedby="notice-message"
              onClick={(e) => e.stopPropagation()}>
              <div className="notice-icon" aria-hidden="true">!</div>
              <div className="notice-content">
                <span className="notice-eyebrow">CHECKOUT NOTICE</span>
                <h2 id="notice-title">Please check</h2>
                <p id="notice-message">{notice}</p>
              </div>
              <button type="button" className="notice-ok-btn" onClick={() => setNotice("")}>
                Got it
              </button>
            </section>
          </div>
        )}

        <CheckoutStyles />
      </>
    );
  }

  // MAIN CHECKOUT

  return (
    <>
      <Navbar />

      <div className="checkout-page">
        <div className="checkout-container">

          {/* PAGE HEADER */}

          <div className="checkout-header">
            <div>
              <p className="checkout-label">
                SHOPPING CART
              </p>

              <h1>
                Checkout
              </h1>

              <p>
                Review your details
                and complete your
                order.
              </p>
            </div>
          </div>

          {/*  MAIN GRID*/}

          <div className="checkout-grid">

            {/*  LEFT COLUMN */}

            <div className="checkout-left">

              {/* ADDRESS SECTION*/}

              <section className="checkout-card">

                <div className="card-header">
                  <div>
                    <span className="section-number">
                      01
                    </span>

                    <div>
                      <h2>
                        Delivery Address
                      </h2>

                      <p>
                        Select where you
                        want your order
                        delivered.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="add-address-btn"
                    onClick={
                      handleAddAddress
                    }
                  >
                    <span>+</span>
                    Add Address
                  </button>
                </div>

                {/* ADDRESS LIST */}

                {addresses.length ===
                0 ? (
                  <div className="no-address">
                    <div className="no-address-icon">
                      📍
                    </div>

                    <h3>
                      No saved addresses
                    </h3>

                    <p>
                      Add a delivery
                      address to
                      continue.
                    </p>

                    <button
                      type="button"
                      className="add-address-btn"
                      onClick={
                        handleAddAddress
                      }
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="address-list">

                    {addresses.map(
                      (address) => {
                        const isSelected =
                          selectedAddress?._id ===
                          address._id;

                        return (
                          <div
                            key={
                              address._id
                            }

                            className={`address-card ${
                              isSelected
                                ? "address-card-selected"
                                : ""
                            }`}

                            onClick={() =>
                              handleSelectAddress(
                                address
                              )
                            }
                          >

                            {/* RADIO / SELECT */}

                            <div
                              className={`address-radio ${
                                isSelected
                                  ? "address-radio-selected"
                                  : ""
                              }`}
                            >
                              {isSelected && (
                                <span>
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* ADDRESS DETAILS */}

                            <div className="address-content">

                              <div className="address-top">

                                <div>
                                  <h3>
                                    {
                                      address.fullName
                                    }
                                  </h3>

                                  <span className="address-type">
                                    Delivery Address
                                  </span>
                                </div>

                                {isSelected && (
                                  <span className="selected-badge">
                                    Selected
                                  </span>
                                )}
                              </div>

                              <p className="address-phone">
                                📞{" "}
                                {
                                  address.phone
                                }
                              </p>

                              <p className="address-text">
                                {
                                  address.houseName
                                }
                                ,{" "}
                                {
                                  address.street
                                }
                                ,{" "}
                                {
                                  address.city
                                }
                                ,{" "}
                                {
                                  address.state
                                }{" "}
                                -{" "}
                                {
                                  address.pincode
                                }
                              </p>

                              {/* ADDRESS ACTIONS */}

                              <div className="address-actions">

                                <button
                                  type="button"
                                  className={
                                    isSelected
                                      ? "confirm-address-btn"
                                      : "select-address-btn"
                                  }
                                  onClick={(
                                    e
                                  ) =>
                                    handleConfirmAddress(
                                      address,
                                      e
                                    )
                                  }
                                >
                                  {isSelected
                                    ? "✓ Selected"
                                    : "Select Address"}
                                </button>

                                <button
                                  type="button"
                                  className="edit-address-btn"
                                  onClick={(
                                    e
                                  ) =>
                                    handleEditAddress(
                                      address,
                                      e
                                    )
                                  }
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

              </section>

              {/* ORDER SUMMARY */}

              <section className="checkout-card">

                <div className="card-header simple-header">
                  <div>
                    <span className="section-number">
                      02
                    </span>

                    <div>
                      <h2>
                        Order Summary
                      </h2>

                      <p>
                        Check your order
                        total before
                        placing it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="summary-content">

                  <div className="summary-row">
                    <span>
                      Items
                    </span>

                    <strong>
                      {totalItems}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      ₹{total}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>
                      Delivery
                    </span>

                    <strong className="free-text">
                      FREE
                    </strong>
                  </div>

                  <div className="summary-divider" />

                  <div className="total-row">
                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{total}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="place-order-btn"
                    onClick={
                      handlePlaceOrder
                    }
                    disabled={
                      placingOrder
                    }
                  >
                    {placingOrder ? (
                      <>
                        <span className="loading-spinner" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <span>
                          →
                        </span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/cart"
                    className="back-cart-link"
                  >
                    ← Back to Cart
                  </Link>
                </div>

              </section>

              {/*  PAYMENT METHOD*/}

              <section className="checkout-card">

                <div className="card-header simple-header">
                  <div>
                    <span className="section-number">
                      03
                    </span>

                    <div>
                      <h2>
                        Payment Method
                      </h2>

                      <p>
                        Choose your
                        preferred payment
                        method.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="payment-list">

                  {[
                    {
                      id: "upi",
                      name: "UPI",
                      icon: "💳",
                      description:
                        "Pay using any UPI app",
                    },
                    {
                      id: "phonepe",
                      name: "PhonePe",
                      icon: "📱",
                      description:
                        "Pay securely with PhonePe",
                    },
                    {
                      id: "googlepay",
                      name: "Google Pay",
                      icon: "G",
                      description:
                        "Pay securely with Google Pay",
                    },
                    {
                      id: "cod",
                      name: "Cash on Delivery",
                      icon: "💵",
                      description:
                        "Pay when your order arrives",
                    },
                  ].map(
                    (method) => {
                      const isSelected =
                        selectedPayment ===
                        method.id;

                      return (
                        <label
                          key={
                            method.id
                          }
                          className={`payment-card ${
                            isSelected
                              ? "payment-card-selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={
                              method.id
                            }
                            checked={
                              isSelected
                            }
                            onChange={(
                              e
                            ) =>
                              setSelectedPayment(
                                e
                                  .target
                                  .value
                              )
                            }
                          />

                          <div className="payment-icon">
                            {
                              method.icon
                            }
                          </div>

                          <div className="payment-info">
                            <strong>
                              {
                                method.name
                              }
                            </strong>

                            <span>
                              {
                                method.description
                              }
                            </span>
                          </div>

                          <div className="payment-check">
                            {isSelected
                              ? "✓"
                              : ""}
                          </div>
                        </label>
                      );
                    }
                  )}

                </div>

              </section>

            </div>

            {/* RIGHT COLUMN
                PRODUCT DETAILS*/}

            <div className="checkout-right">

              <section className="product-card">

                <div className="product-header">
                  <div>
                    <span className="section-number">
                      04
                    </span>

                    <div>
                      <h2>
                        Product Details
                      </h2>

                      <p>
                        Items in your
                        order.
                      </p>
                    </div>
                  </div>

                  <span className="items-count">
                    {totalItems}{" "}
                    {totalItems ===
                    1
                      ? "Item"
                      : "Items"}
                  </span>
                </div>

                {/* PRODUCTS */}

                <div className="product-list">

                  {cart.map(
                    (product) => (
                      <div
                        key={
                          product._id
                        }
                        className="product-item"
                      >

 

                        {/* PRODUCT IMAGE */}
                        <div className="product-image-wrapper">
                          {product.image ? (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name || "Product"}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                                const fallback =
                                  event.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}

                          <div
                            className="image-fallback"
                            style={{
                              display: product.image ? "none" : "flex",
                            }}
                          >
                            <span>▧</span>
                            <small>Image unavailable</small>
                          </div>

                          <span className="product-quantity">
                            ×{product.quantity}
                          </span>
                        </div>

                        {/* PRODUCT INFO */}

                        <div className="product-info">

                          <h3>
                            {
                              product.name
                            }
                          </h3>

                          <span className="product-category">
                            {
                              product.category
                            }
                          </span>

                          <div className="product-price-row">

                            <span>
                              ₹
                              {
                                product.price
                              }{" "}
                              ×{" "}
                              {
                                product.quantity
                              }
                            </span>

                            <strong>
                              ₹
                              {Number(
                                product.price
                              ) *
                                Number(
                                  product.quantity
                                )}
                            </strong>

                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* PRODUCT TOTAL */}

                <div className="product-total-box">

                  <div className="product-total-row">
                    <span>
                      Products
                    </span>

                    <strong>
                      {totalItems}
                    </strong>
                  </div>

                  <div className="product-total-row final-product-total">
                    <span>
                      Product Total
                    </span>

                    <strong>
                      ₹{total}
                    </strong>
                  </div>

                </div>

              </section>

            </div>

          </div>
        </div>
      </div>

      {/* ADDRESS MODAL*/}

      {showAddressModal && (
        <div
          className="modal-overlay"
          onClick={
            closeAddressModal
          }
        >

          <div
            className="address-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>
                <span className="modal-label">
                  DELIVERY
                </span>

                <h2>
                  {editingAddress
                    ? "Edit Address"
                    : "Add New Address"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeAddressModal
                }
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleAddressSubmit(handleSaveAddress)}
              noValidate
            >

              <div className="modal-body">

                <div className="form-group full-width">
                  <label>
                    Full Name
                  </label>

                  <input
                      type="text"
                      placeholder="Enter full name"
                      aria-invalid={Boolean(addressErrors.fullName)}
                      {...registerAddress("fullName")}
                    />
                    {addressErrors.fullName && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.fullName.message}
                      </p>
                    )}
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      aria-invalid={Boolean(addressErrors.phone)}
                      {...registerAddress("phone")}
                    />
                      {addressErrors.phone && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Pincode
                    </label>

                    <input
                      type="text"
                      placeholder="Enter pincode"
                      aria-invalid={Boolean(addressErrors.pincode)}
                      {...registerAddress("pincode")}
                    />
                      {addressErrors.pincode && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.pincode.message}
                      </p>
                    )}
                  </div>

                </div>

                <div className="form-group full-width">
                  <label>
                    House Name / Building
                  </label>

                  <input
                      type="text"
                      placeholder="House name or building"
                      aria-invalid={Boolean(addressErrors.houseName)}
                      {...registerAddress("houseName")}
                    />
                    {addressErrors.houseName && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.houseName.message}
                      </p>
                    )}
                </div>

                <div className="form-group full-width">
                  <label>
                    Street / Locality
                  </label>

                  <input
                      type="text"
                      placeholder="Street or locality"
                      aria-invalid={Boolean(addressErrors.street)}
                      {...registerAddress("street")}
                    />
                    {addressErrors.street && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.street.message}
                      </p>
                    )}
                </div>

                <div className="form-grid">

                  <div className="form-group">
                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      placeholder="City"
                      aria-invalid={Boolean(addressErrors.city)}
                      {...registerAddress("city")}
                    />
                      {addressErrors.city && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      placeholder="State"
                      aria-invalid={Boolean(addressErrors.state)}
                      {...registerAddress("state")}
                    />
                      {addressErrors.state && (
                      <p className="address-field-error" role="alert">
                        {addressErrors.state.message}
                      </p>
                    )}
                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={
                    closeAddressModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-save-btn"
                  disabled={savingAddress || isAddressSubmitting}
                >
                  {savingAddress || isAddressSubmitting
                    ? "Saving..."
                    : editingAddress
                      ? "Update Address"
                      : "Save Address"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {notice && (
        <div
          className="notice-overlay"
          role="presentation"
          onClick={() => setNotice("")}
        >
          <section
            className="notice-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            aria-describedby="notice-message"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notice-icon" aria-hidden="true">
              !
            </div>
            <div className="notice-content">
              <span className="notice-eyebrow">CHECKOUT NOTICE</span>
              <h2 id="notice-title">Please check</h2>
              <p id="notice-message">{notice}</p>
            </div>
            <button
              type="button"
              className="notice-ok-btn"
              autoFocus
              onClick={() => setNotice("")}
            >
              Got it
            </button>
          </section>
        </div>
      )}

      <CheckoutStyles />
    </>
  );
}

// ALL CHECKOUT STYLES


function CheckoutStyles() {
  return (
    <style>
      {`

        * {
          box-sizing: border-box;
        }

       

        .checkout-page {
          min-height: calc(100vh - 70px);
          background: #f5f7f8;
          padding: 35px 20px 60px;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .checkout-header {
          margin-bottom: 30px;
        }

        .checkout-label {
          margin: 0 0 6px;
          color: #198754;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .checkout-header h1 {
          margin: 0;
          font-size: 36px;
          color: #17202a;
        }

        .checkout-header p:last-child {
          margin: 8px 0 0;
          color: #777;
        }

      

        .checkout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 25px;
          align-items: start;
        }

        .checkout-left {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .checkout-right {
          position: sticky;
          top: 20px;
        }

       

        .checkout-card,
        .product-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e9eeee;
          box-shadow:
            0 5px 20px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .card-header,
        .product-header {
          padding: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid #eeeeee;
        }

        .card-header > div:first-child,
        .product-header > div:first-child {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .section-number {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf7f0;
          color: #198754;
          font-size: 12px;
          font-weight: 800;
        }

        .card-header h2,
        .product-header h2 {
          margin: 0;
          color: #17202a;
          font-size: 21px;
        }

        .card-header p,
        .product-header p {
          margin: 5px 0 0;
          color: #8a8f93;
          font-size: 13px;
        }

       

        .add-address-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: none;
          background: #198754;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .add-address-btn:hover {
          background: #157347;
          transform: translateY(-1px);
        }

        .add-address-btn span {
          font-size: 20px;
          line-height: 12px;
        }

    
        .address-list {
          padding: 20px 25px 25px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .address-card {
          position: relative;
          display: flex;
          gap: 15px;
          padding: 18px;
          border: 1.5px solid #e1e5e6;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .address-card:hover {
          border-color: #8ccfb0;
          background: #fbfffd;
          transform: translateY(-1px);
          box-shadow:
            0 5px 15px rgba(25,135,84,0.08);
        }

        .address-card-selected {
          border: 2px solid #198754;
          background: #f3fbf7;
          box-shadow:
            0 5px 18px rgba(25,135,84,0.10);
        }

        .address-radio {
          width: 22px;
          height: 22px;
          min-width: 22px;
          margin-top: 2px;
          border: 2px solid #cfd6d4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .address-radio-selected {
          border-color: #198754;
          background: #198754;
          color: white;
        }

        .address-radio-selected span {
          font-size: 13px;
          font-weight: 900;
        }

        .address-content {
          flex: 1;
          min-width: 0;
        }

        .address-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .address-top h3 {
          margin: 0;
          color: #202629;
          font-size: 16px;
        }

        .address-type {
          display: inline-block;
          margin-top: 4px;
          color: #8b9391;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selected-badge {
          background: #198754;
          color: white;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .address-phone {
          margin: 12px 0 5px;
          color: #555;
          font-size: 13px;
        }

        .address-text {
          margin: 0;
          color: #6d7472;
          line-height: 1.6;
          font-size: 13px;
        }

        .address-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .select-address-btn,
        .confirm-address-btn,
        .edit-address-btn {
          border: none;
          border-radius: 7px;
          padding: 8px 13px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .select-address-btn {
          background: #198754;
          color: white;
        }

        .confirm-address-btn {
          background: #198754;
          color: white;
        }

        .edit-address-btn {
          background: #eef2f2;
          color: #4d5553;
        }

        .edit-address-btn:hover {
          background: #e1e7e5;
        }

        

        .no-address {
          padding: 45px 25px;
          text-align: center;
        }

        .no-address-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .no-address h3 {
          margin: 0;
        }

        .no-address p {
          color: #888;
          margin: 7px 0 18px;
        }

        
        .simple-header {
          border-bottom: 1px solid #eeeeee;
        }

        .summary-content {
          padding: 25px;
        }

        .summary-row,
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 15px;
        }

        .summary-row span {
          color: #737a78;
          font-size: 14px;
        }

        .summary-row strong {
          color: #303735;
          font-size: 14px;
        }

        .free-text {
          color: #198754 !important;
        }

        .summary-divider {
          height: 1px;
          background: #e8eceb;
          margin: 20px 0;
        }

        .total-row {
          margin-bottom: 22px;
        }

        .total-row span {
          color: #222927;
          font-size: 20px;
          font-weight: 800;
        }

        .total-row strong {
          color: #198754;
          font-size: 25px;
        }

        .place-order-btn {
          width: 100%;
          min-height: 52px;
          border: none;
          border-radius: 9px;
          background: #198754;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .place-order-btn:hover:not(:disabled) {
          background: #157347;
          transform: translateY(-1px);
        }

        .place-order-btn:disabled {
          background: #9aa19f;
          cursor: not-allowed;
        }

        .place-order-btn span {
          font-size: 20px;
        }

        .back-cart-link {
          display: block;
          text-align: center;
          margin-top: 14px;
          color: #65706c;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }

        .back-cart-link:hover {
          color: #198754;
        }

        /*  PAYMENT */

        .payment-list {
          padding: 20px 25px 25px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .payment-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1.5px solid #e1e5e6;
          border-radius: 10px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .payment-card:hover {
          border-color: #9bcfb6;
        }

        .payment-card-selected {
          border-color: #198754;
          background: #f3fbf7;
        }

        .payment-card input {
          accent-color: #198754;
          width: 17px;
          height: 17px;
        }

        .payment-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #f0f3f2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
        }

        .payment-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .payment-info strong {
          color: #29302e;
          font-size: 14px;
        }

        .payment-info span {
          color: #8a9290;
          font-size: 11px;
        }

        .payment-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #198754;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 900;
        }

        /* PRODUCTS */

        .product-header {
          padding: 25px;
        }

        .items-count {
          padding: 7px 11px;
          border-radius: 20px;
          background: #eaf7f0;
          color: #198754;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .product-list {
          padding: 5px 25px;
        }

        .product-item {
          display: flex;
          gap: 15px;
          padding: 20px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .product-image-wrapper {
          position: relative;
          width: 95px;
          height: 95px;
          min-width: 95px;
          border-radius: 11px;
          background: #f3f5f4;
          overflow: hidden;
          border: 1px solid #eeeeee;
        }

        .product-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-fallback::after {
          content: "📦";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }

        .product-quantity {
          position: absolute;
          right: 5px;
          bottom: 5px;
          min-width: 24px;
          padding: 3px 6px;
          border-radius: 5px;
          background: #17202a;
          color: white;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
        }

        .product-info {
          flex: 1;
          min-width: 0;
        }

        .product-info h3 {
          margin: 0 0 7px;
          color: #202725;
          font-size: 16px;
          line-height: 1.35;
        }

        .product-category {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 5px;
          background: #f0f3f2;
          color: #6e7774;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 17px;
        }

        .product-price-row span {
          color: #777;
          font-size: 12px;
        }

        .product-price-row strong {
          color: #198754;
          font-size: 16px;
        }

        .product-total-box {
          margin: 20px 25px 25px;
          padding: 18px;
          border-radius: 10px;
          background: #f6f8f7;
        }

        .product-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: #6d7471;
          font-size: 13px;
        }

        .product-total-row strong {
          color: #303634;
        }

        .final-product-total {
          margin-bottom: 0;
          padding-top: 13px;
          border-top: 1px solid #dde3e0;
        }

        .final-product-total span {
          color: #252c29;
          font-size: 15px;
          font-weight: 800;
        }

        .final-product-total strong {
          color: #198754;
          font-size: 21px;
        }

        /* ADDRESS MODAL */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 24, 21, 0.62);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .address-modal {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 18px;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.25);
          animation: modalIn 0.25s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 25px 28px;
          border-bottom: 1px solid #eeeeee;
        }

        .modal-label {
          color: #198754;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .modal-header h2 {
          margin: 5px 0 0;
          color: #17202a;
          font-size: 25px;
        }

        .modal-close {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: #f0f2f1;
          color: #555;
          cursor: pointer;
          font-size: 25px;
          line-height: 1;
          transition: 0.2s ease;
        }

        .modal-close:hover {
          background: #e5e9e7;
          color: #198754;
        }

        .modal-body {
          padding: 25px 28px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #343b38;
          font-size: 13px;
          font-weight: 700;
        }

        .form-group input {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #d9dfdc;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #252b29;
          font-size: 13px;
          transition: 0.2s ease;
        }

        .form-group input:focus {
          border-color: #198754;
          box-shadow:
            0 0 0 3px rgba(25,135,84,0.10);
        }

        .form-group input[aria-invalid="true"] {
          border-color: #dc2626;
        }

        .address-field-error {
          margin: 5px 0 0;
          color: #dc2626;
          font-size: 12px;
          line-height: 1.5;
        }

        .modal-save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 28px;
          background: #fafbfa;
          border-top: 1px solid #eeeeee;
        }

        .modal-cancel-btn,
        .modal-save-btn {
          padding: 11px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 800;
        }

        .modal-cancel-btn {
          border: 1px solid #d9dfdc;
          background: white;
          color: #555;
        }

        .modal-save-btn {
          border: none;
          background: #198754;
          color: white;
        }

        .modal-save-btn:hover {
          background: #157347;
        }

        /* EMPTY CART */

        .empty-cart-page,
        .success-page {
          min-height: 80vh;
          background: #f5f7f8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }

        .empty-cart-box,
        .success-box {
          width: 100%;
          max-width: 480px;
          padding: 45px;
          background: white;
          border-radius: 18px;
          text-align: center;
          box-shadow:
            0 8px 30px rgba(0,0,0,0.08);
        }

        .empty-cart-icon {
          font-size: 50px;
          margin-bottom: 15px;
        }

        .empty-cart-box h1,
        .success-box h1 {
          margin: 0;
          color: #17202a;
        }

        .empty-cart-box p,
        .success-box p {
          color: #777;
          line-height: 1.6;
        }

        .primary-link {
          display: inline-block;
          margin-top: 15px;
          padding: 12px 25px;
          border-radius: 8px;
          background: #198754;
          color: white;
          text-decoration: none;
          font-weight: 700;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #198754;
          color: white;
          font-size: 45px;
          font-weight: 700;
        }

        /* LOADING */

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-right {
            position: static;
          }

          .product-card {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .checkout-page {
            padding: 25px 12px 40px;
          }

          .checkout-header h1 {
            font-size: 30px;
          }

          .card-header,
          .product-header {
            padding: 20px;
          }

          .card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .address-list,
          .payment-list,
          .product-list {
            padding-left: 15px;
            padding-right: 15px;
          }

          .summary-content {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-footer {
            padding: 15px 20px;
          }

          .product-image-wrapper {
            width: 80px;
            height: 80px;
            min-width: 80px;
          }

          .product-price-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 4px;
          }

          .address-top {
            flex-direction: column;
            gap: 8px;
          }

          .empty-cart-box,
          .success-box {
            padding: 30px 20px;
          }
        }

        @media (max-width: 400px) {
          .address-card {
            padding: 14px;
          }

          .address-actions {
            flex-direction: column;
          }

          .select-address-btn,
          .confirm-address-btn,
          .edit-address-btn {
            width: 100%;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .modal-cancel-btn,
          .modal-save-btn {
            width: 100%;
          }
        }


        /* POLISHED ADDRESS MODAL OVERRIDES */

        .modal-overlay {
          padding: clamp(12px, 3vw, 28px);
          background: rgba(10, 20, 16, 0.68);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
          overscroll-behavior: contain;
        }

        .address-modal {
          display: flex;
          flex-direction: column;
          width: min(100%, 640px);
          max-height: min(90dvh, 820px);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 22px;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
        }

        .address-modal form {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .modal-header {
          position: relative;
          flex-shrink: 0;
          align-items: center;
          padding: 24px 28px;
          background: linear-gradient(135deg, #f5fbf7 0%, #ffffff 80%);
        }

        .modal-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #e5f5ec;
          color: #167347;
          font-size: 10px;
          letter-spacing: 1.5px;
        }

        .modal-header h2 {
          margin-top: 10px;
          font-size: clamp(21px, 3vw, 27px);
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .modal-header h2::after {
          content: "";
          display: block;
          width: 38px;
          height: 3px;
          margin-top: 10px;
          border-radius: 999px;
          background: #198754;
        }

        .modal-close {
          display: inline-flex;
          flex: 0 0 40px;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid #e3e9e5;
          border-radius: 12px;
          background: #ffffff;
          color: #4b5650;
          font-size: 26px;
          box-shadow: 0 3px 10px rgba(20, 50, 35, 0.06);
        }

        .modal-close:hover {
          transform: rotate(90deg);
          border-color: #b7dfc7;
          background: #eaf7f0;
          color: #157347;
        }

        .modal-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 25px 28px 12px;
          scrollbar-width: thin;
          scrollbar-color: #c8d8ce transparent;
        }

        .form-group {
          min-width: 0;
          margin-bottom: 19px;
        }

        .form-group label {
          margin-bottom: 8px;
          color: #26352d;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.15px;
        }

        .form-group input {
          min-height: 46px;
          padding: 12px 14px;
          border: 1px solid #dce5df;
          border-radius: 10px;
          background: #fbfdfb;
          font-size: 14px;
          box-shadow: inset 0 1px 2px rgba(15, 40, 25, 0.02);
        }

        .form-group input::placeholder {
          color: #9aa59e;
        }

        .form-group input:hover {
          border-color: #b8cfc0;
          background: #ffffff;
        }

        .form-group input:focus {
          border-color: #198754;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.11);
        }

        .form-group input[aria-invalid="true"] {
          border-color: #dc2626;
          background: #fffafa;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.06);
        }

        .address-field-error {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          margin: 7px 0 0;
          color: #b91c1c;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.45;
        }

        .address-field-error::before {
          content: "!";
          display: inline-flex;
          flex: 0 0 15px;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          margin-top: 1px;
          border-radius: 50%;
          background: #fee2e2;
          font-size: 10px;
          font-weight: 900;
        }

        .modal-footer {
          position: relative;
          flex-shrink: 0;
          padding: 17px 28px;
          background: #ffffff;
          border-top: 1px solid #edf1ee;
          box-shadow: 0 -5px 18px rgba(20, 40, 28, 0.035);
        }

        .modal-cancel-btn,
        .modal-save-btn {
          min-height: 45px;
          padding: 12px 21px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background 0.18s ease, border-color 0.18s ease;
        }

        .modal-cancel-btn {
          border: 1px solid #dce4df;
          background: #ffffff;
          color: #47534b;
        }

        .modal-cancel-btn:hover {
          border-color: #bdcfc3;
          background: #f6f9f7;
          transform: translateY(-1px);
        }

        .modal-save-btn {
          min-width: 145px;
          background: linear-gradient(135deg, #198754, #157347);
          box-shadow: 0 5px 12px rgba(25, 135, 84, 0.18);
        }

        .modal-save-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #157347, #105c38);
          box-shadow: 0 7px 16px rgba(25, 135, 84, 0.24);
          transform: translateY(-1px);
        }

        .modal-save-btn:disabled {
          box-shadow: none;
          transform: none;
        }

        .modal-close:focus-visible,
        .modal-cancel-btn:focus-visible,
        .modal-save-btn:focus-visible {
          outline: 3px solid rgba(25, 135, 84, 0.28);
          outline-offset: 3px;
        }

        @media (max-width: 600px) {
          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }

          .address-modal {
            width: 100%;
            max-width: none;
            max-height: 94dvh;
            border-radius: 22px 22px 0 0;
            border-bottom: 0;
            animation: modalSlideUp 0.24s ease-out;
          }

          .modal-header {
            padding: 20px 20px 18px;
          }

          .modal-header h2 {
            font-size: 22px;
          }

          .modal-body {
            padding: 20px 20px 6px;
          }

          .form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .modal-footer {
            padding: 14px 20px max(14px, env(safe-area-inset-bottom));
          }
        }

        @media (max-width: 420px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-footer {
            flex-direction: column-reverse;
            gap: 9px;
          }

          .modal-cancel-btn,
          .modal-save-btn {
            width: 100%;
          }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .address-modal,
          .modal-close,
          .modal-cancel-btn,
          .modal-save-btn {
            animation: none !important;
            transition: none !important;
          }
        }


        /* CUSTOM NOTICE MODAL — replaces browser alerts*/
        .notice-overlay {
          position: fixed;
          inset: 0;
          z-index: 10050;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(13, 24, 18, 0.58);
          -webkit-backdrop-filter: blur(7px);
          backdrop-filter: blur(7px);
          animation: noticeFadeIn 0.18s ease-out;
        }

        .notice-modal {
          width: min(100%, 440px);
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr);
          align-items: start;
          gap: 16px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
          animation: noticePopIn 0.22s cubic-bezier(.2,.8,.2,1);
        }

        .notice-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border: 1px solid #f5d5a6;
          border-radius: 16px;
          background: #fff7e8;
          color: #a65b08;
          font-size: 25px;
          font-weight: 900;
        }

        .notice-content {
          min-width: 0;
          padding-top: 2px;
        }

        .notice-eyebrow {
          display: block;
          margin-bottom: 6px;
          color: #198754;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .notice-content h2 {
          margin: 0 0 8px;
          color: #17251d;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .notice-content p {
          margin: 0;
          color: #58645d;
          font-size: 14px;
          line-height: 1.65;
          overflow-wrap: anywhere;
        }

        .notice-ok-btn {
          grid-column: 2;
          justify-self: end;
          min-width: 104px;
          min-height: 43px;
          margin-top: 6px;
          padding: 11px 20px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, #198754, #146c43);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 5px 13px rgba(25, 135, 84, 0.2);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .notice-ok-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(25, 135, 84, 0.25);
        }

        .notice-ok-btn:focus-visible {
          outline: 3px solid rgba(25, 135, 84, 0.28);
          outline-offset: 3px;
        }

        @keyframes noticeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes noticePopIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 480px) {
          .notice-overlay {
            align-items: center;
            padding: 18px;
          }

          .notice-modal {
            grid-template-columns: 42px minmax(0, 1fr);
            gap: 12px;
            padding: 22px;
            border-radius: 18px;
          }

          .notice-icon {
            width: 42px;
            height: 42px;
            border-radius: 13px;
            font-size: 21px;
          }

          .notice-content h2 {
            font-size: 19px;
          }

          .notice-content p {
            font-size: 13px;
          }

          .notice-ok-btn {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notice-overlay,
          .notice-modal,
          .notice-ok-btn {
            animation: none !important;
            transition: none !important;
          }
        }

        /* HANDY HUB WARM THEME + PRODUCT IMAGE POLISH */
        .checkout-page,
        .empty-cart-page,
        .success-page {
          background: #fffaf8;
        }

        .checkout-label,
        .modal-label,
        .notice-eyebrow {
          color: #b95f43;
        }

        .checkout-header h1,
        .card-header h2,
        .product-header h2,
        .address-top h3,
        .product-info h3 {
          color: #30231f;
        }

        .checkout-card,
        .product-card {
          border-color: #f0e5e0;
          border-radius: 17px;
          box-shadow: 0 7px 25px rgba(80, 45, 30, 0.055);
        }

        .section-number,
        .items-count {
          background: #fff0e9;
          color: #b95f43;
        }

        .add-address-btn,
        .select-address-btn,
        .confirm-address-btn,
        .place-order-btn,
        .modal-save-btn,
        .primary-link {
          background: linear-gradient(135deg, #b95f43, #a64e35);
          color: #ffffff;
        }

        .add-address-btn:hover,
        .place-order-btn:hover:not(:disabled),
        .modal-save-btn:hover:not(:disabled) {
          background: #98482f;
        }

        .address-card-selected,
        .payment-card-selected {
          border-color: #b95f43;
          background: #fff8f4;
          box-shadow: 0 5px 18px rgba(185, 95, 67, 0.09);
        }

        .address-radio-selected,
        .selected-badge,
        .payment-check,
        .success-icon {
          border-color: #b95f43;
          background: #b95f43;
        }

        .address-radio-selected {
          color: #ffffff;
        }

        .address-card:hover,
        .payment-card:hover {
          border-color: #d9a18e;
        }

        .product-item {
          align-items: center;
          gap: 17px;
          padding: 18px 0;
        }

        .product-image-wrapper {
          position: relative;
          flex: 0 0 104px;
          width: 104px;
          height: 112px;
          overflow: hidden;
          border: 1px solid #f0e2dc;
          border-radius: 12px;
          background: #fff3ed;
        }

        .product-image-wrapper img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-item:hover .product-image-wrapper img {
          transform: scale(1.05);
        }

        .image-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #a88a7d;
        }

        .image-fallback span {
          font-size: 29px;
        }

        .image-fallback small {
          font-size: 9px;
        }

        .product-quantity {
          right: 6px;
          bottom: 6px;
          min-width: 27px;
          padding: 4px 7px;
          border-radius: 7px;
          background: #30231f;
          color: #ffffff;
        }

        .product-category {
          background: #fff0e9;
          color: #a95037;
        }

        .product-price-row strong,
        .final-product-total strong,
        .total-row strong {
          color: #b95f43;
        }

        .product-total-box {
          background: #fff8f4;
          border: 1px solid #f2e5de;
          border-radius: 12px;
        }

        .summary-divider,
        .final-product-total {
          border-color: #eee1db;
        }

        .modal-header {
          background: linear-gradient(135deg, #fff4ee 0%, #ffffff 85%);
        }

        .modal-label {
          background: #fff0e9;
          color: #a95037;
        }

        .modal-header h2::after {
          background: #b95f43;
        }

        .form-group input:focus {
          border-color: #b95f43;
          box-shadow: 0 0 0 4px rgba(185, 95, 67, 0.11);
        }

        .empty-cart-box,
        .success-box {
          border: 1px solid #f0e5e0;
          box-shadow: 0 10px 35px rgba(80, 45, 30, 0.07);
        }

        .empty-cart-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 82px;
          height: 82px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #fff0e9;
        }

        .success-icon {
          background: #b95f43;
        }

        .primary-link:hover {
          background: #98482f;
        }

        @media (max-width: 600px) {
          .product-item {
            gap: 12px;
            align-items: flex-start;
          }

          .product-image-wrapper {
            flex: 0 0 82px;
            width: 82px;
            height: 92px;
          }

          .product-info h3 {
            font-size: 14px;
          }

          .product-price-row {
            margin-top: 12px;
          }
        }

      `}
    </style>
  );
}

export default Checkout;
