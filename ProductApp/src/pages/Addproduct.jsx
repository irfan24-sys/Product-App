
import {useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";

function AddProduct({setProducts,products}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        description: ""
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: formData.name,
            price: formData.price,
            category: formData.category,
            description: formData.description
        };
     setProducts(prevProducts => [...prevProducts, newProduct]);
    alert("Product added successfully!");
    navigate("/products");
        };

  return (
    <div>
      <h1>Add Product</h1>
      <p>Fill out the form to add a new product.</p>
      <form onSubmit={handleSubmit}>
        
        <div>
            <label>Enter your produt name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
            />
            <br/>
        </div>
        <div>
            <label>Enter your product price</label>
            <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter product price"
            />
            <br/>
        </div>
        <div>
            <label>Enter your product category</label>
            <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter product category"
            />  
            <br/>
        </div>
        <div>
            <label>Enter your product description</label>
            <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
            />
            <br/>
        </div>
        <button type="submit">Add Product</button>
      </form>

    </div>
  );
}


export default AddProduct;