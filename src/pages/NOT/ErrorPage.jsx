import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-white p-4">
      <div className="text-center">
        <p className="text-xl text-gray-800 mb-2">에러가 발생했습니다.</p>
        <p className="text-gray-800">잠시 후 홈으로 이동합니다...</p>
      </div>
    </div>
  );
};

export default ErrorPage;
