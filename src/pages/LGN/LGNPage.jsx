import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { useDeviceStore } from "../../stores/deviceStore";
import { GoogleLogin } from "@react-oauth/google";
import { postGoogleLogin } from "../../api/postGoogleLogin";
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

        // (선택) 신규 유저일 때 특별한 액션을 취할 수도 있음
        if (res.data.is_new_user) {
          console.log("신규 가입을 환영합니다!");
        }

        // 로그인 이전 페이지 또는 홈으로 이동
        const from = location.state?.from?.pathname ?? "/";
        navigate(from, { replace: true });
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

            {/* 구글 로그인 버튼 (최신 API 정책을 위한 공식 컴포넌트 강제 적용) */}
            <div className="w-full flex justify-center mb-4 min-h-[50px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="rectangular"
                text="continue_with"
                size="large"
                width="300"
                logo_alignment="center"
              />
            </div>

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
