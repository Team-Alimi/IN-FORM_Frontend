import { useNavigate } from "react-router-dom";
/*
    Header - 상단 헤더 모듈
    로고 클릭 시 홈으로 이동
*/
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-primary flex items-center shadow-md p-11">
      <button
        onClick={() => navigate("/")}
        className="text-white text-2xl font-bold hover:text-blue-100 transition-colors ">
        In:Form
      </button>
    </header>
  );
};

export default Header;
