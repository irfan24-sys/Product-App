
import backgroundImage from "../assets/bgspider.png";
import backgroundImage2 from "../assets/spiderman2.jpg";
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
    <div style={{
        backgroundImage: `url(${backgroundImage2})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    padding: "30px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
    }}>
      <h1 >Add Product</h1>
      <p style={{
        color:"white",
      }}>Fill out the form to add a new product.</p>
      <form onSubmit={handleSubmit}
      style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "500px",
            margin: "20px auto"
        }}>
        
        <div>
            <label>Enter your produt name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                style={{width: "70%",
            height: "39px",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "5px"}}
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
    required
    style={{width: "70%",
            height: "39px",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "5px"}}
    onKeyDown={(e) => {
        if (/[a-zA-Z+-]/.test(e.key)) {
            e.preventDefault();
        }
        if (Number(formData.price) <= 0 || !Number.isFinite(Number(formData.price))) {
    alert("Price must be greater than zero");
    return;
}
    }}
/>
    
            <br/>
        </div>
        <div>
            <label>Enter your product category</label>
            <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
        style={{width: "70%",
            height: "39px",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "5px"}}
    >
        <option value="">Select a category</option>
        <option value="Electronics">Electronics</option>
        <option value="Clothing">Clothing</option>
        <option value="Footwear">Footwear</option>
        <option value="Home & Kitchen">Home & Kitchen</option>
        <option value="Books">Books</option>
        <option value="Accessories">Accessories</option>
    </select>
            <br/>
        </div>
        <div>
            <label>Enter your product description</label>
            <textarea
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                style={{
            width: "100%",
            minHeight: "120px",
            padding: "10px",
            boxSizing: "border-box",
            border: "1px solid #ccc",
            borderRadius: "5px",
            resize: "vertical",
            fontFamily: "Arial, sans-serif"
        }}
            />
            <br/>
        </div>
        <button type="submit"
        style={{
            height:"49px",
            width:"100%",
            backgroundColor: "#e4250f",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px"
        }}
        >Add Product</button>
      </form>

    </div>
  );
}


export default AddProduct;