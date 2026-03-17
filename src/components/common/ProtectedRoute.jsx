import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";

const ProtectedRoute = ({ children }) => {
  const isLogIn = useAuthStore((state) => state.isLogIn);
  const location = useLocation();

  if (!isLogIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
