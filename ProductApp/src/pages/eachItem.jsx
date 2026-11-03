import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import { getProduct } from "../api/productApi";

function EachItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // SAME CART KEY

  const CART_KEY = "cart";

  // GET SINGLE PRODUCT

  useEffect(() => {
    const fetchProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          console.log(
            "Product ID:",
            id
          );

          const response =
            await getProduct(id);

          console.log(
            "Single Product Response:",
            response
          );

          const productData =
            response?.product ||
            response?.data ||
            response;

          if (
            !productData ||
            !productData._id
          ) {
            throw new Error(
              "Product not found"
            );
          }

          setProduct(
            productData
          );
        } catch (error) {
          console.error(
            "Get Single Product Error:",
            error.response
              ?.data ||
              error.message
          );

          setError(
            "Unable to load product."
          );
        } finally {
          setLoading(false);
        }
      };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ADD TO CART

  const handleAddToCart =
    () => {
      if (!product?._id) {
        return;
      }

      try {
        // Get existing cart
        const savedCart =
          localStorage.getItem(
            CART_KEY
          );

        const cart =
          savedCart
            ? JSON.parse(
                savedCart
              )
            : [];

        // Find product
        const existingProductIndex =
          cart.findIndex(
            (item) =>
              String(
                item._id
              ) ===
              String(
                product._id
              )
          );

        if (
          existingProductIndex !==
          -1
        ) {
          // Increase quantity
          cart[
            existingProductIndex
          ] = {
            ...cart[
              existingProductIndex
            ],

            quantity:
              Number(
                cart[
                  existingProductIndex
                ].quantity || 0
              ) + 1,
          };
        } else {
          // Add new product
          cart.push({
            _id:
              product._id,

            name:
              product.name,

            price:
              Number(
                product.price
              ) || 0,

            category:
              product.category,

            description:
              product.description,

            stock:
              Number(
                product.stock
              ) || 0,

            image:
              product.image ||
              "",

            quantity: 1,
          });
        }

        // Save to SAME cart
        localStorage.setItem(
          CART_KEY,
          JSON.stringify(cart)
        );

        console.log(
          "Cart Saved:",
          cart
        );

        // AUTOMATICALLY NAVIGATE TO CART

        navigate("/cart");

      } catch (error) {
        console.error(
          "Add To Cart Error:",
          error
        );
      }
    };

  // LOADING

  if (loading) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight:
              "80vh",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <h2>
            Loading product...
          </h2>
        </div>
      </>
    );
  }

  // ERROR

  if (
    error ||
    !product
  ) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight:
              "80vh",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          <h2>
            {error ||
              "Product not found"}
          </h2>
        </div>
      </>
    );
  }

  // PRODUCT DETAILS

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight:
            "calc(100vh - 70px)",
          padding:
            "40px 20px",
          backgroundColor:
            "#f5f5f5",
        }}
      >
        <div
          style={{
            maxWidth:
              "800px",
            margin:
              "0 auto",
            padding:
              "35px",
            backgroundColor:
              "white",
            borderRadius:
              "12px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.12)",
          }}
        >
          {/* PRODUCT NAME */}

          <h1
            style={{
              marginBottom:
                "20px",
              fontSize:
                "32px",
            }}
          >
            {
              product.name
            }
          </h1>

          {/* PRICE */}

          <h2
            style={{
              color:
                "#e4250f",
              marginBottom:
                "25px",
            }}
          >
            ₹
            {
              product.price
            }
          </h2>

          {/* CATEGORY */}

          <p
            style={{
              fontSize:
                "17px",
              marginBottom:
                "15px",
            }}
          >
            <strong>
              Category:
            </strong>{" "}
            {
              product.category
            }
          </p>

          {/* DESCRIPTION */}

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <p>
              <strong>
                Description:
              </strong>
            </p>

            <p
              style={{
                lineHeight:
                  "1.7",
                color:
                  "#555",
              }}
            >
              {
                product.description
              }
            </p>
          </div>

          {/* STOCK */}

          <p
            style={{
              fontSize:
                "17px",
              marginBottom:
                "25px",
            }}
          >
            <strong>
              Stock:
            </strong>{" "}
            {
              product.stock
            }
          </p>

          {/* SELLER */}

          {product.userId && (
            <p
              style={{
                fontSize:
                  "16px",
                color:
                  "#666",
                marginBottom:
                  "25px",
              }}
            >
              <strong>
                Seller:
              </strong>{" "}
              {
                product
                  .userId
                  .name ||
                  product
                    .userId
                    .email ||
                  "Seller"
              }
            </p>
          )}

          {/* ADD TO CART */}

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            style={{
              marginTop:
                "10px",
              padding:
                "12px 30px",
              backgroundColor:
                "#198754",
              color:
                "white",
              border:
                "none",
              borderRadius:
                "6px",
              cursor:
                "pointer",
              fontSize:
                "16px",
              fontWeight:
                "bold",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}

export default EachItem;