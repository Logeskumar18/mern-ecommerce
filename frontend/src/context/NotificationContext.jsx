import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error | info

  const showNotification = (msg, msgType = "info") => {
    setMessage(msg);
    setType(msgType);
    setTimeout(() => setMessage(""), 3000); // auto-hide after 3s
  };

  return (
    <NotificationContext.Provider value={{ message, type, showNotification }}>
      {children}

      {/* Simple Toast UI */}
      {message && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg text-white shadow-lg transition-all ${
            type === "success"
              ? "bg-green-500"
              : type === "error"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        >
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
