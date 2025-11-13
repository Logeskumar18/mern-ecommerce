import React, { useState, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        {/* Title */}
        <h1 className="text-center mb-4 fw-bold">All Products</h1>

        {/* Category Filter */}
        <div className="d-flex justify-content-center mb-4">
          <select
            className="form-select w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p className="text-center text-secondary">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-secondary">No products found.</p>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-light">
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="card-img-top"
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text text-truncate" style={{ maxHeight: "3rem" }}>
                        {product.description}
                      </p>
                    </div>
                    <div className="mt-3">
                      <p className="fw-bold text-primary mb-2">₹{product.price}</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="btn btn-primary w-100"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
