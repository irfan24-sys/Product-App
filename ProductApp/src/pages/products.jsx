
import back from "../assets/sssss.jpg";
import backgroundImage from "../assets/bgspider.png";
import { Link } from "react-router-dom";
import "./Products.css";

function Products({ products, setProducts }) {

    const handleDelete = (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (confirmDelete) {
            const updatedProducts = products.filter(
                (product) => product.id !== id
            );

            setProducts(updatedProducts);
        }
    };

    return (
        <div className="products-container"
            style={{
                minHeight: "100vh",
                backgroundImage: `url(${back})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                padding: "30px",
                boxSizing: "border-box"
            }}>
            <h1>Products</h1>

            {products.length === 0 ? (
                <p style={{
                    color:"white"
                }}>No products available.</p>
            ) : (
                <div className="products-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "20px"
                }}>
                    {products.map((product) => (
                        <div
                            className="product-card"
                            style={{
                                padding: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                overflowWrap: "anywhere"
                            }}
                            key={product.id}
                        >
                            <Link to={`/each-item/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <h2>{product.name}</h2>

                                <p>
                                    <strong>Price:</strong> ${product.price}
                                </p>

                                <p>
                                    <strong>Category:</strong> {product.category}
                                </p>

                                <p>
                                    <strong>Description:</strong>{" "}
                                    {product.description}
                                </p>
                            </Link>

                            <div className="product-actions"
                                style={{ display: "flex", gap: "10px" }}>

                                <button className="edit-btn" style={{ backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                    Edit
                                </button>


                                <button style={{ backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    className="delete-btn"
                                    onClick={() => handleDelete(product.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Products;
