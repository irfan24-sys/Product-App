import { BrowserRouter, Routes, Route } from "react-router-dom";
import {useState} from "react";
import Home from "./pages/home";
import AddProduct from "./pages/Addproduct";
import Products from "./pages/products";

function App() {
  const [products, setProducts] = useState([]);
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route
          path="/add-product"
          element={<AddProduct setProducts={setProducts} />}
        />
        <Route
          path="/products"
          element={<Products products={products}
          setProducts={setProducts} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

