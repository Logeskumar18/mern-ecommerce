import React from "react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(to right, #4f46e5, #8b5cf6, #ec4899)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-white mb-3">
                Choose Your Registration Type
              </h1>
              <p className="lead text-white opacity-75">
                Select the type of account you want to create
              </p>
            </div>

            <div className="row g-4">
              {/* Customer Registration */}
              <div className="col-12 col-md-6">
                <div className="card h-100 shadow-lg border-0">
                  <div className="card-body p-4 text-center">
                    <div className="mb-4">
                      <div 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i className="fas fa-user text-success" style={{ fontSize: "2rem" }}></i>
                      </div>
                    </div>
                    <h3 className="h4 fw-bold text-success mb-3">Customer Account</h3>
                    <p className="text-muted mb-4">
                      Create a customer account to shop products, manage orders, and track shipments.
                    </p>
                    <ul className="list-unstyled text-start mb-4">
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Browse and purchase products
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Track order history
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Manage shipping addresses
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-success me-2"></i>
                        Customer support access
                      </li>
                    </ul>
                    <Link 
                      to="/register-customer" 
                      className="btn btn-success btn-lg w-100"
                    >
                      Register as Customer
                    </Link>
                  </div>
                </div>
              </div>

              {/* Admin Registration */}
              <div className="col-12 col-md-6">
                <div className="card h-100 shadow-lg border-0">
                  <div className="card-body p-4 text-center">
                    <div className="mb-4">
                      <div 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i className="fas fa-crown text-danger" style={{ fontSize: "2rem" }}></i>
                      </div>
                    </div>
                    <h3 className="h4 fw-bold text-danger mb-3">Admin Account</h3>
                    <p className="text-muted mb-4">
                      Create an admin account to manage products, categories, orders, and users.
                    </p>
                    <ul className="list-unstyled text-start mb-4">
                      <li className="mb-2">
                        <i className="fas fa-check text-danger me-2"></i>
                        Manage products and categories
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-danger me-2"></i>
                        View analytics and reports
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-danger me-2"></i>
                        Handle customer orders
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-check text-danger me-2"></i>
                        System administration
                      </li>
                    </ul>
                    <Link 
                      to="/register-admin" 
                      className="btn btn-danger btn-lg w-100"
                    >
                      Register as Admin
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <p className="text-white">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-white fw-semibold text-decoration-none"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
                >
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
