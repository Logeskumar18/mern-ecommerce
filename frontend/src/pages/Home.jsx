import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <section className="text-white py-5 text-center" style={{ background: "linear-gradient(to right, #4f46e5, #8b5cf6)" }}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Welcome to ShopEase</h1>
          <p className="lead mb-4">Discover amazing products with great deals!</p>
          <Link to="/products" className="btn btn-light btn-lg text-primary fw-semibold">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Browse by Category</h2>
          <div className="row g-4">
            {categories.map((cat) => (
              <div key={cat._id} className="col-6 col-md-3">
                <Link
                  to={`/category/${cat._id}`}
                  className="card h-100 text-center text-decoration-none text-dark shadow-sm"
                >
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <h5 className="card-title">{cat.name}</h5>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center mb-4">Featured Products</h2>
          <div className="row g-4">
            {products.slice(0, 8).map((product) => (
              <div key={product._id} className="col-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <img
                    src={product.image || "/placeholder.jpg"}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text mb-3">₹{product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary mt-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
