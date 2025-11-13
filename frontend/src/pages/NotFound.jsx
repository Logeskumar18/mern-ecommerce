import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center bg-light" style={{ minHeight: "100vh", padding: "2rem" }}>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="h2 fw-bold text-dark mt-3">Oops! Page Not Found</h2>
      <p className="text-secondary mt-2 mb-4" style={{ maxWidth: "400px" }}>
        The page you’re looking for doesn’t exist or has been moved. Please check the URL or return to the homepage.
      </p>

      <div className="d-flex gap-2 mb-4">
        <Link to="/" className="btn btn-primary px-4 py-2">
          Go Home
        </Link>
        <Link to="/products" className="btn btn-secondary px-4 py-2">
          Browse Products
        </Link>
      </div>

      <div>
        <img
          src="https://illustrations.popsy.co/gray/error-404.svg"
          alt="404 Not Found Illustration"
          className="img-fluid"
          style={{ maxWidth: "350px" }}
        />
      </div>
    </div>
  );
};

export default NotFound;
