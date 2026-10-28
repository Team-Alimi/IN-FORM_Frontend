import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { postGoogleLogin } from '@/api/main/auth';
import loginIcon from '@/assets/icons/login-icon.svg';
import useAuthStore from '@/stores/useAuthStore';
import { useDeviceStore } from '@/stores/deviceStore';

const LGNPage = () => {
  const login = useAuthStore((state) => state.login);
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonContainer = useRef(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);

  useEffect(() => {
    if (!googleButtonContainer.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setGoogleButtonWidth(Math.min(Math.floor(entry.contentRect.width), 400));
    });
    observer.observe(googleButtonContainer.current);
    return () => observer.disconnect();
  }, []);

  // 구글 로그인 성공 후 백엔드 서버로 id_token 전달
  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    try {
      const payloadBase64 = idToken.split('.')[1];
      const decodedJson = atob(
        payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
      );
      const payload = JSON.parse(
        decodeURIComponent(
          decodedJson
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      );

      const userEmail = payload.email || '';
      if (
        !userEmail.endsWith('@inha.edu') &&
        !userEmail.endsWith('@inha.ac.kr')
      ) {
        alert('인하대학교 도메인으로 로그인해주세요.');
        return;
      }
    } catch (decodeError) {
      console.error('토큰 디코딩 실패:', decodeError);
    }

    try {
      const res = await postGoogleLogin(idToken);

      if (res.success && res.data) {
        login(
          res.data.access_token,
          res.data.refresh_token,
          res.data.user_info
        );

        if (!res.data.user_info?.onboarding_completed) {
          navigate('/onboarding', {
            replace: true,
            state: { from: location.state?.from },
          });
        } else {
          const from = location.state?.from?.pathname ?? '/';
          navigate(from, { replace: true });
        }
      } else {
        alert('로그인 처리에 실패했습니다. (응답 구조 이상)');
      }
    } catch (error) {
      console.error('로그인 서버 연동 실패:', error);
      alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('구글 인증 팝업 호출에 실패했습니다.');
  };

  return (
    <div
      className={`flex min-h-[100dvh] w-full ${isMobile ? 'justify-center bg-white' : 'bg-[#f7f8fa]'}`}
    >
      {!isMobile && (
        <aside className="relative hidden min-h-[100dvh] w-1/2 flex-col items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#005bac_0%,#2475bd_52%,#a8cce9_100%)] px-12 text-center text-white md:flex">
          <div className="relative flex flex-col items-center">
            <p className="text-[28px] font-extrabold tracking-[-0.04em]">
              IN:FORM
            </p>
            <img
              src={loginIcon}
              alt=""
              aria-hidden="true"
              className="my-10 w-[min(22vw,260px)] select-none"
            />
            <p className="text-[20px] font-semibold leading-[1.5] tracking-[-0.035em]">
              인하대학교의 일정과 공지를
              <br />
              한곳에서 확인하세요
            </p>
          </div>
        </aside>
      )}

      <main
        className={
          isMobile
            ? 'relative flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white px-6 pb-[max(28px,env(safe-area-inset-bottom))]'
            : 'relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-10 md:w-1/2 md:px-8'
        }
      >
        {isMobile && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[62%] bg-[linear-gradient(180deg,#005bac_0%,#2475bd_37%,#8abce2_72%,#ffffff_100%)]"
            />
            <header className="relative pt-[max(68px,calc(env(safe-area-inset-top)+24px))] text-center text-[20px] font-extrabold tracking-[-0.04em] text-white">
              IN:FORM
            </header>
            <img
              src={loginIcon}
              alt=""
              aria-hidden="true"
              className="relative mx-auto mt-[clamp(68px,10vh,106px)] w-[min(58vw,230px)] select-none"
            />
            <div className="min-h-16 flex-1" />
          </>
        )}

        <section
          className={
            isMobile
              ? 'relative w-full text-center'
              : 'w-full max-w-[460px] rounded-[28px] bg-white px-6 py-10 text-center shadow-[0_18px_55px_rgba(19,49,80,0.08)] sm:px-10 sm:py-12'
          }
        >
          <h1
            className={`font-bold leading-[1.38] tracking-[-0.045em] text-black ${isMobile ? 'mb-7 text-[22px]' : 'mb-9 text-[28px]'}`}
          >
            인하대 교내 일정·공지를
            <br />
            한눈에 스마트하게
          </h1>

          <div
            ref={googleButtonContainer}
            className="mx-auto flex w-full max-w-[380px] items-center justify-center"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
              size="large"
              width={googleButtonWidth}
              logo_alignment="center"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-2.5 h-[50px] w-full rounded-xl bg-[#f1f2f4] text-[14px] font-medium text-[#344054] transition-colors hover:bg-[#e6e8ec]"
          >
            게스트로 구경하기
          </button>

          <p className="mx-auto mt-4 max-w-[285px] text-[11px] leading-[1.55] text-[#9aa4b2]">
            계속 진행하면{' '}
            <Link
              to="/terms-of-service"
              className="underline underline-offset-2"
            >
              이용약관
            </Link>{' '}
            및{' '}
            <Link to="/privacy-policy" className="underline underline-offset-2">
              개인정보처리방침
            </Link>
            에
            <br />
            동의하는 것으로 간주됩니다.
          </p>
        </section>

        {!isMobile && (
          <p className="absolute bottom-6 text-xs text-[#a1a9b4]">
            © {new Date().getFullYear()} Team Alimi. All rights reserved.
          </p>
        )}
      </main>
    </div>
  );
};

export default LGNPage;
