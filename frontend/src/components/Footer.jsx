import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function Footer() {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'} mt-5 border-top`}>
      <div className="container py-5">
        <div className="row">
          {/* 🛍️ Brand Section */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h2 className="h4 fw-bold mb-3">🛍️ MyShop</h2>
            <p className={`small ${isDarkMode ? 'text-secondary' : 'text-muted'}`}>
              Your one-stop online store for all your shopping needs.
              Fast delivery, secure payments, and best deals every day!
            </p>
          </div>

          {/* ⚡ Quick Links */}
          <div className="col-12 col-sm-6 col-md-3 mb-4">
            <h3 className="h6 fw-semibold mb-3">Quick Links</h3>
            <ul className="list-unstyled small">
              <li>
                <Link to="/" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
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
                <Link to="/contact" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`${isDarkMode ? 'text-secondary' : 'text-muted'} text-decoration-none`}>
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
                className={`${isDarkMode ? 'text-secondary' : 'text-muted'} fs-5`}
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className={`${isDarkMode ? 'text-secondary' : 'text-muted'} fs-5`}
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className={`${isDarkMode ? 'text-secondary' : 'text-muted'} fs-5`}
              >
                <FaInstagram />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={`${isDarkMode ? 'text-secondary' : 'text-muted'} fs-5`}
              >
                <FaGithub />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={`border-top ${isDarkMode ? 'border-secondary' : 'border-light'} py-3 text-center small ${isDarkMode ? 'text-secondary' : 'text-muted'}`}>
        © {new Date().getFullYear()} MyShop — All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
