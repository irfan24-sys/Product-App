import api from "./api";

// AUTH CONFIG

const getAuthConfig = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error(
      "Access token not found. Please login again."
    );
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ADD ADDRESS

export const addAddress = async (addressData) => {
  try {
    const response = await api.post(
      "/address/add",
      addressData,
      getAuthConfig()
    );

    console.log("Add Address Response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Add Address Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// GET ADDRESSES

export const getAddresses = async () => {
  try {
    const response = await api.get(
      "/address",
      getAuthConfig()
    );

    console.log(
      "Get Addresses Response:",
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Addresses Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// UPDATE ADDRESS

export const updateAddress = async (
  id,
  addressData
) => {
  try {
    const response = await api.put(
      `/address/${id}`,
      addressData,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update Address Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// DELETE ADDRESS

export const deleteAddress = async (id) => {
  try {
    const response = await api.delete(
      `/address/${id}`,
      getAuthConfig()
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Address Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};