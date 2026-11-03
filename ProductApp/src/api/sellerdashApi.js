import api from "./api";

// ========================================
// AUTH CONFIG
// ========================================

const getAuthConfig = () => {
  const token =
    localStorage.getItem("accessToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ========================================
// GET SELLER PRODUCTS
// ========================================

export const getSellerProducts = async () => {
  try {
    const response = await api.get(
      "/product/seller-products",
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Seller Products Error:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

// ========================================
// DELETE SELLER PRODUCT
// ========================================

export const deleteSellerProduct = async (
  id
) => {
  try {
    const response = await api.delete(
      `/product/deleteProduct/${id}`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Seller Product Error:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};