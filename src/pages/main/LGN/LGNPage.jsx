import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { GoogleLogin } from "@react-oauth/google";
import { postGoogleLogin } from "@/api/postGoogleLogin";
const LGNPage = () => {
  const login = useAuthStore((state) => state.login);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const location = useLocation();

  // 구글 로그인 성공 후 백엔드 서버로 id_token 전달
  const handleGoogleSuccess = async (credentialResponse) => {
    // credentialResponse 안에는 구글로부터 받은 JWT id_token(credential)이 들어있습니다.
    const idToken = credentialResponse.credential;

    // 1. 프론트엔드 단에서 이메일 도메인 사전 검증 (1차)
    try {
      const payloadBase64 = idToken.split(".")[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(
        decodeURIComponent(
          decodedJson.split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        )
      );

      const userEmail = payload.email || "";
      if (!userEmail.endsWith("@inha.edu") && !userEmail.endsWith("@inha.ac.kr")) {
        alert("인하대학교 도메인으로 로그인해주세요.");
        return; // 올바른 도메인이 아니면 차단
      }
    } catch (decodeError) {
      console.error("토큰 디코딩 실패:", decodeError);
    }

    try {
      // 2. 백엔드 API 호출로 검증 및 회원가입/로그인 처리
      const res = await postGoogleLogin(idToken);

      // 2. 백엔드 응답이 성공이고 데이터가 있다면 스토어에 저장
      if (res.success && res.data) {
        // 서버에서 던져준 access_token, refresh_token, user_info를 로컬 상태에 저장!
        login(res.data.access_token, res.data.refresh_token, res.data.user_info);

        // 신규 유저일 경우 온보딩 페이지로, 기존 유저는 홈 또는 이전 페이지로 이동
        if (res.data.new_user) {
          console.log("신규 가입을 환영합니다! 온보딩으로 이동합니다.");
          navigate("/onboarding", { replace: true });
        } else {
          const from = location.state?.from?.pathname ?? "/";
          navigate(from, { replace: true });
        }
      } else {
        alert("로그인 처리에 실패했습니다. (응답 구조 이상)");
      }
    } catch (error) {
      console.error("로그인 서버 연동 실패:", error);
      alert("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
    alert("구글 인증 팝업 호출에 실패했습니다.");
  };

  // 1. 모바일 전용 뷰 렌더링 (디자인 시안 반영)
  if (isMobile) {
    return (
      <div className="flex justify-center bg-gray-50 min-h-[100dvh]">
        <div className="w-full flex flex-col relative overflow-hidden">
          {/* 상단 로고 영역 */}
          <div className="flex flex-col items-center justify-center pt-28 pb-10 flex-none">
            {/* Logo Image */}
            <img
              src="/inform_icon.png"
              alt="InForm Logo"
              className="w-24 h-auto mb-4"
            />
            {/* 타이틀 */}
            <h1 className="text-gray-900 text-3xl font-black mb-1.5 tracking-tight">IN:FORM</h1>
            {/* 서브 타이틀 */}
            <p className="text-gray-500 text-[13.5px] font-semibold">인하대학교 공지사항 큐레이션</p>
          </div>

          {/* 중간 로그인 영역 */}
          <div className="flex-1 px-10 flex flex-col pt-8">
            {/* 구글 로그인 버튼 */}
            <div className="w-full flex flex-col items-center mb-6 min-h-[50px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="pill"
                text="continue_with"
                size="large"
                width="320"
                logo_alignment="left"
              />

              {/* 그냥 둘러보기 링크 */}
              <button
                onClick={() => navigate("/")}
                className="mt-4 text-gray-400 text-[12px] font-medium hover:text-gray-500 transition-colors"
              >
                그냥 둘러보기
              </button>
            </div>

            {/* 하단 안내 푸터 (시안의 둥근 박스 반영) */}
            <div className="mt-auto px-6 pb-10">
              <div className="bg-gray-100/60 rounded-[40px] py-8 px-6 border border-gray-200/30 shadow-sm">
                <p className="text-[11px] md:text-[13px] text-gray-500 font-bold text-center leading-[1.6]">
                  인하대학교 재학생 및 교직원만 가입 가능합니다.<br />
                  <span className="opacity-90">(@inha.edu 또는 @inha.ac.kr 메일)</span>
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
      <div className="hidden md:flex flex-col w-1/2 bg-[#0056b3] items-center justify-center p-12 relative overflow-hidden animate-fill-down">
        {/* 장식용 배경 원 (은은한 효과) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center animate-content-fade-up">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <img src="/inform_icon.png" alt="InForm Logo" className="w-16 h-auto" />
          </div>
          <h1 className="text-white text-5xl font-black mb-4 tracking-tight">IN:FORM</h1>
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

          {/* 구글 로그인 공식 버튼 배치 (데스크탑 뷰) */}
          <div className="w-full flex justify-center mb-10 min-h-[50px]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="rectangular"
              text="continue_with"
              size="large"
              width="360"
              logo_alignment="center"
            />
          </div>

          <div className="bg-gray-50/80 rounded-[32px] py-6 px-5 border border-gray-100 shadow-sm">
            <p className="text-[13.5px] lg:text-[14px] text-gray-500 font-bold text-center leading-relaxed break-keep">
              인하대학교 재학생 및 교직원만 가입 가능합니다.<br />
              <span className="opacity-80 font-semibold">(@inha.edu 또는 @inha.ac.kr 메일)</span>
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
