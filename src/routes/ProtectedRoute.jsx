import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/LGN" replace />;
  }

  return children;
};

export default ProtectedRoute;
