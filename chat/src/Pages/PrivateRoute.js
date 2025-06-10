// src/Components/PrivateRoute.js
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const phone =
      sessionStorage.getItem("phone") ||
      Cookies.get("mobile") ||
      localStorage.getItem("phone");

    setIsAuthenticated(!!phone); // true or false
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // prevent early redirect
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
