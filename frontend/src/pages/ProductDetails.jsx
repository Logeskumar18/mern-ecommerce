import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok) setProduct(data);
        else setError("Product not found");
      } catch (err) {
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <p className="text-secondary">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <p className="text-danger fw-semibold">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        <div className="row g-4 bg-white rounded-3 shadow p-4 p-md-5">
          {/* Product Image */}
          <div className="col-md-6 d-flex justify-content-center align-items-center">
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              className="img-fluid rounded-3"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </div>

          {/* Product Details */}
          <div className="col-md-6 d-flex flex-column justify-content-center">
            <h1 className="fw-bold mb-3">{product.name}</h1>
            <p className="text-muted mb-2">
              Category:{" "}
              <span className="text-primary fw-medium">{product.category}</span>
            </p>
            <p className="text-secondary mb-4">{product.description}</p>

            <p className="h4 text-primary fw-semibold mb-4">₹{product.price}</p>

            <button
              onClick={() => addToCart(product)}
              className="btn btn-primary w-100 w-md-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
