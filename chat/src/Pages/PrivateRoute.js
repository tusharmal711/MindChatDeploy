import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const phone =
      sessionStorage.getItem("phone") ||
      Cookies.get("mobile") ||
      localStorage.getItem("phone");

    if (phone) {
      sessionStorage.setItem("phone", phone); // restore
      setIsAuth(true);
    } else {
      setIsAuth(false);
    }
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  return isAuth ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
