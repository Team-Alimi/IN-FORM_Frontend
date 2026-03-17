import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorImage from "@/assets/error/ErrorImage.png";

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-gray-100 text-white p-4">
      <div className="text-center flex flex-col gap-6">
        <p className="text-2xl text-gray-800 mb-2 m-2 font-bold">이런!!</p>
        <img src={ErrorImage} className="w-60 h-60 " />

        <p className="text-2xl text-gray-800  font-bold">
          에러가 발생했습니다.
        </p>
        <p className="text-gray-800 text-base ">잠시 후 홈으로 이동합니다...</p>
      </div>
    </div>
  );
};

export default ErrorPage;
