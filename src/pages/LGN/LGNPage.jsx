import useAuthStore from "../../stores/useAuthStore";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LGNPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);
  const isDisabled = !userId.trim() || !password.trim();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    if (userId === "user001" && password === "001229") {
      login();
      const from = location.state?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } else {
      console.log("아이디 비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button className="text-lg text-gray-600">&times;</button>
        <span className="text-sm font-semibold">로그인</span>
        <span className="w-5" />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="w-full flex flex-col mb-5  overflow-hidden border border-gray-300">
          <input
            type="text"
            placeholder="아이디 입력"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full h-13 px-4 border border-gray-300 text-sm outline-none placeholder:text-gray-400  focus:border-primary transition-colors"
          />
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-13 px-4 border border-gray-300 text-sm outline-none placeholder:text-gray-400  focus:border-primary transition-colors"
          />
        </div>
        <button onClick={handleLoginClick}>로그인</button>
      </div>
    </div>
  );
};

export default LGNPage;
