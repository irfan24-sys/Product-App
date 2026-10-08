import {Link} from "react-router-dom";
function Products({products,setProducts}) {
    const handleDelete = (id) => {
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
        alert("are you sure!");
    };

    return (
        <div>
            <h1>Products</h1>
            {products.length === 0 ? (
                <p>No products available.</p>
            ) : (
                products.map((product) => (
                    <div key={product.name}>
                        <h2>{product.name}</h2>
                        <p>Price: ${product.price}</p>
                        <p>Category: {product.category}</p>
                        <p>Description: {product.description}</p>
                        <Link to={`/add-product/${product.id}`}>
                        <button>Edit</button>
                        </Link>
                        <button onClick={() => handleDelete(product.id)}>Delete</button>
                        
                        <hr />
                    </div>
                
                ))
            )}
        </div>
    );
}
export default Products;