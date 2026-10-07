import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import AddProduct from "./pages/Addproduct";
import Products from "./pages/products";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

