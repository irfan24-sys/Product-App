import api from "./api";

// Place a new order
export const createOrder = async (orderData) => {
  const response = await api.post("/order/place-order", orderData);

  return response.data;
};

// Fetch the logged-in user's order history
export const getMyOrders = async () => {
  const response = await api.get("/order/my-orders");

  return response.data;
};

// Fetch orders containing products added by the logged-in seller
export const getSellerOrders = async () => {
  const response = await api.get("/order/seller-orders");

  return response.data;
};
