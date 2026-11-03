import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

import { addProduct, updateProduct, getProduct } from "../api/productApi";

import Navbar from "../components/Navbar";

// ========================================
// YUP VALIDATION SCHEMA
// ========================================

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
      originalValue === "" || originalValue == null ? NaN : value,
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
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  const isMobile = screenWidth <= 600;
  const isTablet = screenWidth > 600 && screenWidth <= 900;

  // ========================================
  // REACT HOOK FORM
  // ========================================

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

  // ========================================
  // RESPONSIVE SCREEN WIDTH
  // ========================================

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ========================================
  // LOAD EXISTING PRODUCT FOR EDITING
  // ========================================

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!productId) {
        reset(defaultValues);
        return;
      }

      try {
        setLoadingProduct(true);

        const response = await getProduct(productId);
        const product =
          response?.data?.data || response?.data || response?.product;

        if (!product) {
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
      } catch (error) {
        console.error("Get product error:", error.response?.data || error);

        toast.error(error.response?.data?.message || "Failed to load product");
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, navigate, reset]);

  // ========================================
  // SUBMIT FORM
  // ========================================

  const onSubmit = async (values) => {
    if (saving || isSubmitting) return;

    try {
      setSaving(true);
      clearErrors();

      const productData = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category.trim(),
      };

      let response;

      if (isEditMode) {
        response = await updateProduct(productId, productData);
        toast.success(response?.message || "Product updated successfully!");
      } else {
        response = await addProduct(productData);
        toast.success(response?.message || "Product added successfully!");
      }

      console.log("Product save response:", response);

      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1000);
    } catch (error) {
      console.error("Product error:", error.response?.data || error);

      const responseData = error.response?.data;

      // Map express-validator errors to the matching form fields.
      if (Array.isArray(responseData?.errors) && responseData.errors.length) {
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

        toast.error(
          responseData.errors[0]?.message ||
            responseData.errors[0]?.msg ||
            "Please check the product details.",
        );
        return;
      }

      toast.error(
        responseData?.message ||
          responseData?.error ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // STYLES
  // ========================================

  const getInputStyle = (field) => ({
    display: "block",
    width: "100%",
    minHeight:
      field === "description" ? (isMobile ? "100px" : "120px") : "42px",
    padding: isMobile ? "9px" : "10px",
    boxSizing: "border-box",
    border: errors[field] ? "1px solid #dc2626" : "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    fontFamily: field === "description" ? "Arial, sans-serif" : "inherit",
    resize: field === "description" ? "vertical" : "none",
    outline: "none",
    backgroundColor: "white",
  });

  const errorStyle = {
    color: "#dc2626",
    fontSize: "13px",
    margin: "5px 0 0",
    overflowWrap: "anywhere",
    lineHeight: 1.5,
  };

  const labelStyle = {
    display: "block",
    color: "#333",
    fontSize: isMobile ? "14px" : "15px",
    marginBottom: "7px",
    fontWeight: "500",
  };

  const fieldStyle = {
    marginBottom: "18px",
    width: "100%",
  };

  // LOADING PRODUCT

  if (isEditMode && loadingProduct) {
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
            color: "#222",
            padding: "20px",
          }}
        >
          <h2>Loading product...</h2>
        </div>
      </>
    );
  }

  // FORM UI

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          width: "100%",
          padding: isMobile ? "15px" : isTablet ? "22px" : "30px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h1
          style={{
            color: "#222",
            fontSize: isMobile ? "26px" : isTablet ? "30px" : "36px",
            textAlign: "center",
            margin: "10px 0",
          }}
        >
          {isEditMode ? "Update Product" : "Add Product"}
        </h1>

        <p
          style={{
            color: "#555",
            textAlign: "center",
            fontSize: isMobile ? "14px" : "16px",
            lineHeight: 1.6,
            margin: "5px 0 15px",
          }}
        >
          {isEditMode
            ? "Update the product details below."
            : "Fill out the form to add a new product."}
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{
            backgroundColor: "white",
            padding: isMobile ? "18px" : isTablet ? "24px" : "30px",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "500px",
            margin: isMobile ? "10px 0" : "20px auto",
            boxSizing: "border-box",
            boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          }}
        >
          {/* PRODUCT NAME */}
          <div style={fieldStyle}>
            <label htmlFor="name" style={labelStyle}>
              Enter your product name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter product name"
              maxLength={100}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              style={getInputStyle("name")}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" role="alert" style={errorStyle}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* PRODUCT PRICE */}
          <div style={fieldStyle}>
            <label htmlFor="price" style={labelStyle}>
              Enter your product price
            </label>
            <input
              id="price"
              type="number"
              placeholder="Enter product price"
              min="0.01"
              step="any"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "price-error" : undefined}
              style={getInputStyle("price")}
              {...register("price")}
            />
            {errors.price && (
              <p id="price-error" role="alert" style={errorStyle}>
                {errors.price.message}
              </p>
            )}
          </div>

          {/* PRODUCT CATEGORY */}
          <div style={fieldStyle}>
            <label htmlFor="category" style={labelStyle}>
              Enter your product category
            </label>
            <select
              id="category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "category-error" : undefined}
              style={getInputStyle("category")}
              {...register("category")}
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Home & Kitchen">Home &amp; Kitchen</option>
              <option value="Books">Books</option>
              <option value="Accessories">Accessories</option>
            </select>
            {errors.category && (
              <p id="category-error" role="alert" style={errorStyle}>
                {errors.category.message}
              </p>
            )}
          </div>

          {/* PRODUCT DESCRIPTION */}
          <div style={fieldStyle}>
            <label htmlFor="description" style={labelStyle}>
              Enter your product description
            </label>
            <textarea
              id="description"
              placeholder="Enter product description"
              maxLength={2000}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              style={getInputStyle("description")}
              {...register("description")}
            />
            {errors.description && (
              <p id="description-error" role="alert" style={errorStyle}>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={saving || isSubmitting}
            style={{
              minHeight: "48px",
              width: "100%",
              padding: "12px",
              backgroundColor: saving || isSubmitting ? "#999" : "#e4250f",
              border: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: saving || isSubmitting ? "not-allowed" : "pointer",
              borderRadius: "5px",
              boxSizing: "border-box",
            }}
          >
            {saving || isSubmitting
              ? "Please wait..."
              : isEditMode
                ? "Update Product"
                : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;
