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
          className={`position-fixed bottom-0 end-0 m-3 px-3 py-2 rounded text-white shadow ${
            type === "success"
              ? "bg-success"
              : type === "error"
              ? "bg-danger"
              : "bg-primary"
          }`}
          style={{ zIndex: 1050 }}
        >
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
