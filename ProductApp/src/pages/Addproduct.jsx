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

  if (image.startsWith("http")) return image;

  return `${BACKEND_URL}/${image.replace(/\\/g, "/")}`;
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
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
        if (isMounted) {
          setLoadingProduct(false);
        }
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

      console.log("FormData contents:");

      for (const [key, value] of formData.entries()) {
        console.log(
          key,
          value instanceof File
            ? {
                name: value.name,
                type: value.type,
                size: value.size,
              }
            : value
        );
      }

      console.log("Selected Image:", formData.get("image"));

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

      console.log("Product save response:", response);

      setTimeout(() => {
        navigate("/seller-dashboard");
      }, 1000);
    } catch (error) {
      console.error(
        "Product error:",
        error.response?.data || error
      );

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

  const getInputStyle = (field) => ({
    display: "block",
    width: "100%",
    minHeight:
      field === "description"
        ? isMobile
          ? "100px"
          : "120px"
        : "42px",
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

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          width: "100%",
          padding: isMobile
            ? "15px"
            : isTablet
              ? "22px"
              : "30px",
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
            padding: isMobile
              ? "18px"
              : isTablet
                ? "24px"
                : "30px",
            borderRadius: "10px",
            width: "100%",
            maxWidth: "500px",
            margin: isMobile ? "10px 0" : "20px auto",
            boxSizing: "border-box",
            boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          }}
        >
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

          <div style={fieldStyle}>
            <label htmlFor="category" style={labelStyle}>
              Enter your product category
            </label>

            <select
              id="category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby={
                errors.category ? "category-error" : undefined
              }
              style={getInputStyle("category")}
              {...register("category")}
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Footwear">Footwear</option>
              <option value="Home & Kitchen">Home & Kitchen</option>
              <option value="Books">Books</option>
              <option value="Accessories">Accessories</option>
            </select>

            {errors.category && (
              <p id="category-error" role="alert" style={errorStyle}>
                {errors.category.message}
              </p>
            )}
          </div>

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
              <p
                id="description-error"
                role="alert"
                style={errorStyle}
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div style={fieldStyle}>
            <label htmlFor="image" style={labelStyle}>
              Upload Product Image
            </label>

            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={getInputStyle("image")}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#777",
                marginTop: "6px",
              }}
            >
              Supported formats: JPG, PNG, WEBP. Maximum size: 10MB.
            </p>

            {previewImage && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    margin: "0 0 10px",
                  }}
                >
                  {selectedImage ? "New Image Preview" : "Current Product Image"}
                </p>

                <img
                  src={previewImage}
                  alt="Product Preview"
                  onError={() => {
                    console.error("Unable to load product image:", previewImage);
                  }}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    display: "block",
                  }}
                />

                {selectedImage && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#16a34a",
                      marginTop: "8px",
                    }}
                  >
                    New image selected successfully.
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || isSubmitting}
            style={{
              minHeight: "48px",
              width: "100%",
              padding: "12px",
              backgroundColor:
                saving || isSubmitting ? "#999" : "#e4250f",
              border: "none",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                saving || isSubmitting ? "not-allowed" : "pointer",
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