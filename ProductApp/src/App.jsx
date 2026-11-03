import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { useState } from "react";

import Home from "./pages/home";
import AddProduct from "./pages/Addproduct";
import Products from "./pages/products";
import EachItem from "./pages/eachItem";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SellerDashboard from "./pages/sellerdash";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./components/NotFound";
import MyOrders from "./pages/MyOrders";
import SellerOrders from "./pages/SellerOrders";

function App() {
  const [products, setProducts] = useState([]);

  return (
    <BrowserRouter>

      <ToastContainer
  position="top-right"
  autoClose={1000}
  closeOnClick
  pauseOnHover={false}
  pauseOnFocusLoss={false}
/>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* SELLER DASHBOARD */}
        <Route
          path="/seller-dashboard"
          element={<SellerDashboard />}
        />

        {/* ADD PRODUCT */}
        <Route
          path="/add-product"
          element={
            <AddProduct
              products={products}
              setProducts={setProducts}
            />
          }
        />

        {/* CART */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            <Products
              products={products}
              setProducts={setProducts}
            />
          }
        />

        {/* SINGLE PRODUCT */}
        <Route
          path="/each-item/:id"
          element={<EachItem />}
        />

        {/* OPTIONAL: SUPPORT OLD /product/:id URL */}
        <Route
          path="/product/:id"
          element={<EachItem />}
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route
  path="/seller-orders"
  element={<SellerOrders />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;