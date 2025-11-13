import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-dark text-light mt-5">
      <div className="container py-5">
        <div className="row">
          {/* 🛍️ Brand Section */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h2 className="h4 fw-bold mb-3">🛍️ MyShop</h2>
            <p className="small text-secondary">
              Your one-stop online store for all your shopping needs.
              Fast delivery, secure payments, and best deals every day!
            </p>
          </div>

          {/* ⚡ Quick Links */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h3 className="h6 fw-semibold mb-3">Quick Links</h3>
            <ul className="list-unstyled small">
              <li>
                <Link to="/" className="text-secondary text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-secondary text-decoration-none">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-secondary text-decoration-none">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-secondary text-decoration-none">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* 📞 Support Section */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h3 className="h6 fw-semibold mb-3">Support</h3>
            <ul className="list-unstyled small">
              <li>
                <Link to="/contact" className="text-secondary text-decoration-none">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary text-decoration-none">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary text-decoration-none">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-secondary text-decoration-none">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* 🌐 Social Section */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h3 className="h6 fw-semibold mb-3">Follow Us</h3>
            <div className="d-flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-secondary fs-5"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-secondary fs-5"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-secondary fs-5"
              >
                <FaInstagram />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-secondary fs-5"
              >
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-top border-secondary py-3 text-center small text-secondary">
        © {new Date().getFullYear()} MyShop — All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
