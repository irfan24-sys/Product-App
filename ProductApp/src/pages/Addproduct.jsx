
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import {
  addProduct,
  updateProduct,
  getProduct,
} from "../api/productApi";

import Navbar from "../components/Navbar";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const getImageUrl = (image) => {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) return image;

  const normalized = image.replace(/\\/g, "/").replace(/^\/+/, "");
  const index = normalized.toLowerCase().lastIndexOf("uploads/");

  const relative =
    index >= 0
      ? normalized.slice(index)
      : `uploads/${normalized.split("/").pop()}`;

  return `${BACKEND_URL}/${relative}`;
};

const productSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? NaN : value
    )
    .typeError("Price is required and must be a valid number")
    .required("Price is required")
    .moreThan(0, "Price must be greater than 0"),

  category: yup
    .string()
    .trim()
    .required("Please select a product category")
    .max(50, "Category cannot exceed 50 characters"),

  description: yup
    .string()
    .trim()
    .required("Product description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
});

const defaultValues = {
  name: "",
  price: "",
  category: "",
  description: "",
};

function AddProduct() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get("id");
  const isEditMode = Boolean(productId);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  const isMobile = screenWidth <= 600;
  const isTablet = screenWidth > 600 && screenWidth <= 900;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    return () => {
      if (previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!productId) {
        reset(defaultValues);
        setSelectedImage(null);
        setPreviewImage("");
        return;
      }

      try {
        setLoadingProduct(true);

        const response = await getProduct(productId);

        const product =
          response?.data?.data?.product ||
          response?.data?.data ||
          response?.data?.product ||
          response?.data ||
          response?.product;

        if (!product || !product._id) {
          toast.error("Product not found");
          navigate("/seller-dashboard");
          return;
        }

        if (!isMounted) return;

        reset({
          name: product.name || "",
          price:
            product.price !== undefined && product.price !== null
              ? String(product.price)
              : "",
          category: product.category || "",
          description: product.description || "",
        });

        setSelectedImage(null);
        setPreviewImage(getImageUrl(product.image));
      } catch (error) {
        console.error(
          "Get product error:",
          error.response?.data || error
        );

        toast.error(
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, navigate, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be below 10MB");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    if (saving || isSubmitting) return;

    try {
      setSaving(true);
      clearErrors();

      if (!isEditMode && !selectedImage) {
        toast.error("Please select a product image");
        return;
      }

      const formData = new FormData();

      formData.append("name", values.name.trim());
      formData.append("description", values.description.trim());
      formData.append("price", Number(values.price));
      formData.append("category", values.category.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      let response;

      if (isEditMode) {
        response = await updateProduct(productId, formData);
        toast.success(
          response?.message || "Product updated successfully!"
        );
      } else {
        response = await addProduct(formData);
        toast.success(
          response?.message || "Product added successfully!"
        );
      }

      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Product error:", error.response?.data || error);

      const responseData = error.response?.data;

      if (
        Array.isArray(responseData?.errors) &&
        responseData.errors.length
      ) {
        responseData.errors.forEach((item) => {
          const field = item.field || item.path || item.param;
          const message = item.message || item.msg;

          if (
            field &&
            message &&
            Object.prototype.hasOwnProperty.call(defaultValues, field)
          ) {
            setError(field, {
              type: "server",
              message,
            });
          }
        });

        toast.error("Please check the product details.");
        return;
      }

      toast.error(
        responseData?.message ||
          responseData?.error ||
          error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: {
      minHeight: "calc(100vh - 70px)",
      width: "100%",
      padding: isMobile ? "22px 14px 35px" : "35px 25px 50px",
      boxSizing: "border-box",
      background: "#FFF8F4",
      fontFamily: "Poppins, Arial, sans-serif",
    },

    wrapper: {
      width: "100%",
      maxWidth: "850px",
      margin: "0 auto",
    },

    heading: {
      color: "#30231F",
      fontSize: isMobile ? "27px" : isTablet ? "31px" : "35px",
      fontWeight: "800",
      textAlign: "center",
      margin: "0 0 8px",
      letterSpacing: "-0.8px",
    },

    subtitle: {
      color: "#806D64",
      fontSize: isMobile ? "13px" : "15px",
      textAlign: "center",
      margin: "0 0 28px",
      lineHeight: 1.7,
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #F0E3DD",
      borderRadius: "22px",
      padding: isMobile
        ? "21px 17px"
        : isTablet
        ? "28px"
        : "35px 40px",
      boxSizing: "border-box",
      boxShadow: "0 12px 40px rgba(65, 38, 27, 0.07)",
    },

    sectionTitle: {
      color: "#30231F",
      fontSize: "16px",
      fontWeight: "700",
      margin: "0 0 20px",
    },

    label: {
      display: "block",
      color: "#49372F",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "8px",
    },

    input: {
      display: "block",
      width: "100%",
      minHeight: "48px",
      padding: "12px 14px",
      boxSizing: "border-box",
      border: "1px solid #E9DDD7",
      borderRadius: "10px",
      fontSize: "14px",
      fontFamily: "inherit",
      color: "#30231F",
      outline: "none",
      background: "#FFFCFA",
      transition: "all 0.2s ease",
    },

    error: {
      color: "#D64545",
      fontSize: "12px",
      margin: "6px 0 0",
      lineHeight: 1.5,
    },

    field: {
      marginBottom: "21px",
      width: "100%",
      minWidth: 0,
    },

    // FIXED IMAGE UPLOAD BOX
    uploadArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: isMobile ? "190px" : "230px",
      padding: isMobile ? "25px 14px" : "30px 20px",
      boxSizing: "border-box",
      border: "2px dashed #D8B8AA",
      borderRadius: "16px",
      background: "#FFFAF7",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      overflow: "hidden",
      position: "relative",
    },

    submit: {
      width: "100%",
      minHeight: "52px",
      padding: "13px",
      background: saving || isSubmitting ? "#C99A8A" : "#B95F43",
      border: "none",
      color: "#FFFFFF",
      fontSize: "15px",
      fontWeight: "700",
      cursor: saving || isSubmitting ? "not-allowed" : "pointer",
      borderRadius: "11px",
      transition: "all 0.2s ease",
      boxShadow: "0 7px 18px rgba(185, 95, 67, 0.18)",
    },
  };

  const fieldStyle = (field) => ({
    ...styles.input,
    borderColor: errors[field] ? "#D64545" : "#E9DDD7",
  });

  if (isEditMode && loadingProduct) {
    return (
      <>
        <Navbar />

        <div style={styles.page}>
          <div
            style={{
              minHeight: "55vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              color: "#806D64",
            }}
          >
            <div className="product-spinner" />
            <p style={{ fontSize: "14px", fontWeight: "600" }}>
              Loading product details...
            </p>
          </div>

          <style>{`
            .product-spinner {
              width: 42px;
              height: 42px;
              border: 4px solid #F1DED5;
              border-top-color: #B95F43;
              border-radius: 50%;
              animation: productSpin 0.8s linear infinite;
            }

            @keyframes productSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .product-input:focus {
          border-color: #B95F43 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 4px rgba(185,95,67,0.09);
        }

        .product-upload:hover {
          border-color: #B95F43 !important;
          background: #FFF3ED !important;
        }

        .product-submit:hover:not(:disabled) {
          background: #984B35 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(185,95,67,0.24);
        }

        .product-back:hover {
          background: #FCECE5 !important;
          color: #984B35 !important;
        }

        .product-form {
          animation: productFade 0.45s ease;
        }

        @keyframes productFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .product-fields {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "16px",
                background: "#FCECE5",
                color: "#B95F43",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 15px",
                fontSize: "25px",
              }}
            >
              {isEditMode ? "✎" : "+"}
            </div>

            <h1 style={styles.heading}>
              {isEditMode ? "Update Product" : "Add New Product"}
            </h1>

            <p style={styles.subtitle}>
              {isEditMode
                ? "Make changes to your product details below."
                : "Enter your product details and upload an image."}
            </p>
          </div>

          <form
            className="product-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            style={styles.card}
          >
            <h3 style={styles.sectionTitle}>Product Information</h3>

            {/* NAME AND PRICE */}
            <div
              className="product-fields"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
              }}
            >
              <div style={styles.field}>
                <label htmlFor="name" style={styles.label}>
                  Product Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter product name"
                  maxLength={100}
                  aria-invalid={Boolean(errors.name)}
                  className="product-input"
                  style={fieldStyle("name")}
                  {...register("name")}
                />

                {errors.name && (
                  <p role="alert" style={styles.error}>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div style={styles.field}>
                <label htmlFor="price" style={styles.label}>
                  Product Price (₹)
                </label>

                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#A17A6D",
                      fontWeight: "600",
                    }}
                  >
                    ₹
                  </span>

                  <input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    min="0.01"
                    step="any"
                    aria-invalid={Boolean(errors.price)}
                    className="product-input"
                    style={{
                      ...fieldStyle("price"),
                      paddingLeft: "32px",
                    }}
                    {...register("price")}
                  />
                </div>

                {errors.price && (
                  <p role="alert" style={styles.error}>
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* CATEGORY */}
            <div style={styles.field}>
              <label htmlFor="category" style={styles.label}>
                Product Category
              </label>

              <select
                id="category"
                aria-invalid={Boolean(errors.category)}
                className="product-input"
                style={{
                  ...fieldStyle("category"),
                  cursor: "pointer",
                }}
                {...register("category")}
              >
                <option value="">Choose a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Books">Books</option>
                <option value="Accessories">Accessories</option>
              </select>

              {errors.category && (
                <p role="alert" style={styles.error}>
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div style={styles.field}>
              <label htmlFor="description" style={styles.label}>
                Product Description
              </label>

              <textarea
                id="description"
                placeholder="Describe your product, its features and details..."
                maxLength={2000}
                aria-invalid={Boolean(errors.description)}
                className="product-input"
                style={{
                  ...fieldStyle("description"),
                  minHeight: "125px",
                  resize: "vertical",
                  lineHeight: "1.7",
                }}
                {...register("description")}
              />

              {errors.description && (
                <p role="alert" style={styles.error}>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* PRODUCT IMAGE - CORRECTED UI */}
            <div style={{ marginBottom: "26px", width: "100%" }}>
              <h3 style={styles.sectionTitle}>Product Image</h3>

              <label
                htmlFor="image"
                className="product-upload"
                style={styles.uploadArea}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    flexShrink: 0,
                    borderRadius: "18px",
                    background: "#FCECE5",
                    color: "#B95F43",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    marginBottom: "18px",
                  }}
                >
                  ↑
                </div>

                <p
                  style={{
                    color: "#49372F",
                    fontWeight: "700",
                    fontSize: isMobile ? "14px" : "16px",
                    margin: "0 0 8px",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedImage
                    ? "Choose a different image"
                    : "Click to upload product image"}
                </p>

                <p
                  style={{
                    color: "#99877F",
                    fontSize: "13px",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  JPG, PNG or WEBP · Maximum 10MB
                </p>

                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: 0,
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                />
              </label>

              {previewImage && (
                <div
                  style={{
                    marginTop: "18px",
                    padding: "15px",
                    border: "1px solid #F0E3DD",
                    borderRadius: "14px",
                    background: "#FFFCFA",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: "#49372F",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {selectedImage
                        ? "New Image Preview"
                        : "Current Product Image"}
                    </span>

                    <span
                      style={{
                        color: "#4F9870",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {selectedImage
                        ? "New image selected"
                        : "Existing image"}
                    </span>
                  </div>

                  <img
                    src={previewImage}
                    alt="Product Preview"
                    onError={() =>
                      console.error(
                        "Unable to load product image:",
                        previewImage
                      )
                    }
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      display: "block",
                      border: "1px solid #E9DDD7",
                    }}
                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={saving || isSubmitting}
              className="product-submit"
              style={styles.submit}
            >
              {saving || isSubmitting
                ? "Please wait..."
                : isEditMode
                ? "Update Product"
                : "Add Product"}
            </button>

            <button
              type="button"
              className="product-back"
              onClick={() => navigate("/seller-dashboard")}
              style={{
                width: "100%",
                minHeight: "46px",
                marginTop: "12px",
                background: "#FFFFFF",
                color: "#806D64",
                border: "1px solid #E9DDD7",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddProduct;
