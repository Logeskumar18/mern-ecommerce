import React from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { NotificationProvider } from "./NotificationContext";

const ContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default ContextProvider;
