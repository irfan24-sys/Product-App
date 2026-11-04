import api from "./api";

// AUTH CONFIG

const getAuthConfig = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("Access token not found. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// GET ALL PRODUCTS

export const getProducts = async (page = 1, limit = 8) => {
  try {
    const response = await api.get(
      `/product/getAllProduct?page=${page}&limit=${limit}`,
    );

    console.log("Get Products Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get Products Error:", error.response?.data || error.message);

    throw error;
  }
};

// GET SINGLE PRODUCT

export const getProduct = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required.");
    }

    const response = await api.get(`/product/getProduct/${id}`);

    console.log("Get Single Product Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get Product Error:", error.response?.data || error.message);

    throw error;
  }
};

// ADD PRODUCT

export const addProduct = async (productData) => {
  try {
    const response = await api.post(
      "/product/addProduct",
      productData,
      getAuthConfig(),
    );

    console.log("Add Product Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Add Product Error:", error.response?.data || error.message);

    throw error;
  }
};

// UPDATE PRODUCT


export const updateProduct = async (id, productData) => {
  try {
    if (!id) {
      throw new Error("Product ID is required.");
    }

    const response = await api.put(
      `/product/updateProduct/${id}`,
      productData,
      getAuthConfig(),
    );

    console.log("Update Product Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Update Product Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

// DELETE PRODUCT

export const deleteProduct = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required.");
    }

    const response = await api.delete(
      `/product/deleteProduct/${id}`,
      getAuthConfig(),
    );

    console.log("Delete Product Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
