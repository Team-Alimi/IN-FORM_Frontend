import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { useDeviceStore } from "../../stores/deviceStore";

// 구글 아이콘을 분리하여 코드 가독성 향상
const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LGNPage = () => {
  const login = useAuthStore((state) => state.login);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = () => {
    // 임시 로그인 성공 처리 연동
    login();
    const from = location.state?.from?.pathname ?? "/";
    navigate(from, { replace: true });
  };

  // 1. 모바일 전용 뷰 렌더링 (기존 파란색 전체 화면)
  if (isMobile) {
    return (
      <div className="flex justify-center bg-[#0056b3] min-h-[100dvh]">
        <div className="w-full flex flex-col relative overflow-hidden">
          {/* 상단 파란색 헤더 영역 */}
          <div className="flex flex-col items-center justify-center pt-24 pb-12 flex-none">
            {/* Logo 박스 */}
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-[#0056b3] font-bold text-2xl tracking-tighter">InF</span>
            </div>
            {/* 타이틀 */}
            <h1 className="text-white text-4xl font-extrabold mb-2 tracking-wide">In:form</h1>
            {/* 서브 타이틀 */}
            <p className="text-white/80 text-sm font-medium">인하대학교 공지사항 큐레이션</p>
          </div>

          {/* 하단 로그인 영역 (파란 바탕 통합) */}
          <div className="flex-1 px-8 pt-6 pb-8 flex flex-col">
            {/* 로그인 문구 */}
            <div className="mb-10 text-center">
              <h2 className="text-white text-2xl font-bold mb-2">로그인</h2>
              <p className="text-white/80 text-sm">인하대학교 이메일로 로그인하세요.</p>
            </div>

            {/* 구글 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors active:scale-[0.98] shadow-sm"
            >
              <GoogleIcon />
              <span className="text-gray-800 font-semibold text-base">Google 계정으로 계속하기</span>
            </button>

            {/* 하단 안내 푸터 */}
            <div className="mt-auto pt-8">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-xs text-white/90 font-medium flex items-start gap-1">
                  <span className="text-sm shrink-0">💡</span>
                  <span>
                    인하대학교 재학생 및 교직원만 가입 가능합니다.<br />
                    (@inha.edu 또는 @inha.ac.kr 메일)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 데스크톱 전용 뷰 렌더링 (Split 레이아웃 - 반/반 분할)
  return (
    <div className="flex w-full min-h-[100dvh] bg-gray-50">
      {/* 왼쪽: 브랜딩 패널 (파란색 배경에 로고와 장식) */}
      <div className="hidden md:flex flex-col w-1/2 bg-[#0056b3] items-center justify-center p-12 relative overflow-hidden">
        {/* 장식용 배경 원 (은은한 효과) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-[#0056b3] font-black text-3xl tracking-tighter">InF</span>
          </div>
          <h1 className="text-white text-5xl font-extrabold mb-4 tracking-wide">In:form</h1>
          <p className="text-white/90 text-lg font-medium text-center leading-relaxed">
            인하대학교의 모든 공지사항을<br />바로 이곳에서 한번에
          </p>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 패널 */}
      <div className="flex flex-col w-full md:w-1/2 items-center justify-center p-8 bg-gray-50 border-l border-gray-200/50">
        {/* 로그인 카드 */}
        <div className="w-full max-w-[500px] bg-white p-10 py-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-10 text-center">
            <h2 className="text-gray-900 text-3xl font-bold mb-3">환영합니다</h2>
            <p className="text-gray-500 text-base break-keep">인하대학교 이메일로 안전하게 로그인하세요.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98] shadow-sm mb-8 group"
          >
            <GoogleIcon />
            <span className="text-gray-800 font-semibold text-lg group-hover:text-black">Google 계정으로 계속하기</span>
          </button>

          <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-100">
            <p className="text-sm text-gray-600 font-medium flex items-start gap-2 leading-relaxed break-keep">
              <span className="text-base mt-0.5 shrink-0">💡</span>
              <span className="flex-1 text-[13.5px] lg:text-sm">
                인하대학교 재학생 및 교직원만 가입할 수 있습니다. 인하대학교 이메일(@inha.edu 또는 @inha.ac.kr)로 인증해주세요.
              </span>
            </p>
          </div>
        </div>

        {/* 데스크탑에서만 보이는 아주 작은 하단 푸터 (Option) */}
        <p className="absolute bottom-8 text-gray-400 text-xs">
          © {new Date().getFullYear()} Team Alimi. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LGNPage;
