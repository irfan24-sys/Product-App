
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/home";
import AddProduct from "./pages/Addproduct";
import Products from "./pages/products";
import EachItem from "./pages/eachItem";

function App() {
    const [products, setProducts] = useState([]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route
                    path="/add-product"
                    element={<AddProduct
                        products={products}
                        setProducts={setProducts}
                    />}
                />

                <Route
                    path="/products"
                    element={
                        <Products
                            products={products}
                            setProducts={setProducts}
                        />
                    }
                />

                <Route
                    path="/each-item/:id"
                    element={<EachItem products={products} />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
