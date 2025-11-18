import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import CustomerNavbar from "./CustomerNavbar";
import AdminNavbar from "./AdminNavbar";

const SmartNavbar = () => {
  const { user } = useContext(AuthContext);
  const { isAdmin } = useTheme();

  // Show admin navbar for admin users, customer navbar for everyone else
  if (user && isAdmin) {
    return <AdminNavbar />;
  }
  
  return <CustomerNavbar />;
};

export default SmartNavbar;