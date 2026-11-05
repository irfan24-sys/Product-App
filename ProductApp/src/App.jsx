import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { useState } from "react";

import Home from "./pages/home.jsx";
import AddProduct from "./pages/Addproduct.jsx";
import Products from "./pages/products.jsx";
import EachItem from "./pages/eachItem.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/Signup.jsx";
import SellerDashboard from "./pages/sellerdash.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import NotFound from "./components/NotFound.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import SellerOrders from "./pages/SellerOrders.jsx";

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