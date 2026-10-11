import { useParams, Link } from "react-router-dom";
import backg from "../assets/las.jpg";

function EachItem({ products }) {
    const { id } = useParams();

    const product = products.find(
        (item) => item.id === Number(id)
    );

    if (!product) {
        return (
            <div style={{
                backgroundImage: `url(${backg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                flexDirection: "column",
            }}>
                <h2>Product not found</h2>
                <button
                 style={{
            padding: "10px 20px",
            backgroundColor: "#e4250f",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px"
        }}>
                <Link to="/products" style={{
                    color:"white",textDecoration:"none"
                }}>Back to Products</Link>
            </button>
                
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundImage: `url(${backg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div
                className="each-item-container"
                style={{
                    minHeight: "70vh",
                    width: "49%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    margin: "20px auto",
                }}
            >
                <h1>{product.name}</h1>
                <p>Price: ${product.price}</p>
                <p>Category: {product.category}</p>
                <p>Description: {product.description}</p>

                <Link to="/products" style={{
                    color:"black",textDecoration:"none"

                }}>Back to Products</Link>
            </div>
        </div>
    );
}

export default EachItem;