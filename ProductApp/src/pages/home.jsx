import { Link } from "react-router-dom";
function Home() {
  return (
    <div>
      <h1>Welcome to Product App</h1>

      <p>Manage your products easily.</p>

      <Link to="/add-product">
        <button>Add Product</button>
      </Link>

      <Link to="/products">
        <button>View Products</button>
      </Link>
    </div>
  );
}


export default Home;